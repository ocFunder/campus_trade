package com.campus.trade.service;

import com.campus.trade.dto.OrderRequest;
import com.campus.trade.dto.OrderStatusUpdateRequest;
import com.campus.trade.dto.UserOrderStats;
import com.campus.trade.entity.Order;
import com.campus.trade.entity.OrderStatus;
import com.campus.trade.entity.Product;
import com.campus.trade.entity.ProductStatus;
import com.campus.trade.entity.User;
import com.campus.trade.repository.OrderRepository;
import com.campus.trade.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 订单服务类
 */
@Service
@Transactional
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private AuthService authService;
    
    /**
     * 创建订单
     */
    public Order createOrder(OrderRequest orderRequest) {
        User currentUser = authService.getCurrentUser();
        Product product = productRepository.findById(orderRequest.getProductId())
                .orElseThrow(() -> new RuntimeException("商品不存在"));
        
        // 检查商品是否可购买
        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new RuntimeException("商品不可购买");
        }
        
        // 检查是否是自己发布的商品
        if (product.getSeller().getId().equals(currentUser.getId())) {
            throw new RuntimeException("不能购买自己发布的商品");
        }
        
        // 检查是否已有进行中的订单
        List<Order> existingOrders = orderRepository.findByProductId(product.getId());
        boolean hasActiveOrder = existingOrders.stream()
                .anyMatch(order -> order.getStatus() == OrderStatus.PENDING || 
                                 order.getStatus() == OrderStatus.PAID);
        
        if (hasActiveOrder) {
            throw new RuntimeException("该商品已有进行中的订单");
        }
        
        // 创建订单
        Order order = new Order();
        order.setProduct(product);
        order.setBuyer(currentUser);
        order.setSeller(product.getSeller());
        order.setAmount(product.getPrice());
        order.setRemark(orderRequest.getRemark());
        order.setStatus(OrderStatus.PENDING);
        
        // 更新商品状态为已预订
        product.setStatus(ProductStatus.RESERVED);
        productRepository.save(product);
        
        return orderRepository.save(order);
    }
    
    /**
     * 更新订单状态
     */
    public Order updateOrderStatus(Long orderId, OrderStatusUpdateRequest request) {
        Order order = getOrderById(orderId);
        User currentUser = authService.getCurrentUser();
        
        // 检查权限：只有买家、卖家或管理员可以更新订单状态
        boolean canUpdate = order.getBuyer().getId().equals(currentUser.getId()) ||
                           order.getSeller().getId().equals(currentUser.getId()) ||
                           currentUser.getRole().name().equals("ADMIN");
        
        if (!canUpdate) {
            throw new RuntimeException("无权限更新此订单");
        }
        
        OrderStatus newStatus = request.getStatus();
        OrderStatus currentStatus = order.getStatus();
        
        // 验证状态转换的合法性
        if (!isValidStatusTransition(currentStatus, newStatus)) {
            throw new RuntimeException("无效的状态转换");
        }
        
        order.setStatus(newStatus);
        
        // 根据状态更新相关时间戳
        if (newStatus == OrderStatus.PAID) {
            order.setPaidAt(LocalDateTime.now());
        } else if (newStatus == OrderStatus.COMPLETED) {
            order.setCompletedAt(LocalDateTime.now());
            // 更新商品状态为已售出
            Product product = order.getProduct();
            product.setStatus(ProductStatus.SOLD);
            product.setBuyer(order.getBuyer());
            productRepository.save(product);
        } else if (newStatus == OrderStatus.CANCELLED) {
            // 恢复商品状态为在售
            Product product = order.getProduct();
            product.setStatus(ProductStatus.ACTIVE);
            productRepository.save(product);
        }
        
        return orderRepository.save(order);
    }
    
    /**
     * 验证状态转换的合法性
     */
    private boolean isValidStatusTransition(OrderStatus current, OrderStatus target) {
        switch (current) {
            case PENDING:
                return target == OrderStatus.PAID || target == OrderStatus.CANCELLED;
            case PAID:
                return target == OrderStatus.SHIPPED || target == OrderStatus.CANCELLED;
            case SHIPPED:
                return target == OrderStatus.COMPLETED || target == OrderStatus.CANCELLED;
            case COMPLETED:
            case CANCELLED:
            case REFUNDED:
                return false; // 终态，不能转换
            default:
                return false;
        }
    }
    
    /**
     * 根据ID获取订单
     */
    @Transactional(readOnly = true)
    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
    }
    
    /**
     * 根据订单号获取订单
     */
    @Transactional(readOnly = true)
    public Order getOrderByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
    }
    
    /**
     * 获取用户的购买订单
     */
    @Transactional(readOnly = true)
    public Page<Order> getUserBuyOrders(Long userId, int page, int size) {
        User user = new User();
        user.setId(userId);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return orderRepository.findByBuyer(user, pageable);
    }
    
    /**
     * 获取用户的销售订单
     */
    @Transactional(readOnly = true)
    public Page<Order> getUserSellOrders(Long userId, int page, int size) {
        User user = new User();
        user.setId(userId);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return orderRepository.findBySeller(user, pageable);
    }
    
    /**
     * 获取当前用户的购买订单
     */
    @Transactional(readOnly = true)
    public Page<Order> getCurrentUserBuyOrders(int page, int size) {
        User currentUser = authService.getCurrentUser();
        return getUserBuyOrders(currentUser.getId(), page, size);
    }
    
    /**
     * 获取当前用户的销售订单
     */
    @Transactional(readOnly = true)
    public Page<Order> getCurrentUserSellOrders(int page, int size) {
        User currentUser = authService.getCurrentUser();
        return getUserSellOrders(currentUser.getId(), page, size);
    }
    
    /**
     * 获取当前用户的所有订单（购买和销售）
     */
    @Transactional(readOnly = true)
    public Page<Order> getCurrentUserOrders(int page, int size, String status, String type) {
        User currentUser = authService.getCurrentUser();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        if (type != null && !type.isEmpty()) {
            if ("buyer".equals(type)) {
                // 只获取购买订单
                if (status != null && !status.isEmpty()) {
                    OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
                    return orderRepository.findByBuyerAndStatus(currentUser, orderStatus, pageable);
                } else {
                    return orderRepository.findByBuyer(currentUser, pageable);
                }
            } else if ("seller".equals(type)) {
                // 只获取销售订单
                if (status != null && !status.isEmpty()) {
                    OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
                    return orderRepository.findBySellerAndStatus(currentUser, orderStatus, pageable);
                } else {
                    return orderRepository.findBySeller(currentUser, pageable);
                }
            }
        }
        
        // 获取所有订单（购买和销售）
        if (status != null && !status.isEmpty()) {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            return orderRepository.findByBuyerOrSellerAndStatus(currentUser, currentUser, orderStatus, pageable);
        } else {
            return orderRepository.findByBuyerOrSeller(currentUser, currentUser, pageable);
        }
    }
    
    /**
     * 根据状态获取订单
     */
    @Transactional(readOnly = true)
    public Page<Order> getOrdersByStatus(OrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return orderRepository.findByStatus(status, pageable);
    }
    
    /**
     * 获取待处理的订单
     */
    @Transactional(readOnly = true)
    public Page<Order> getPendingOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        return orderRepository.findPendingOrders(pageable);
    }
    
    /**
     * 获取用户订单统计
     */
    @Transactional(readOnly = true)
    public UserOrderStats getUserOrderStats(Long userId) {
        User user = new User();
        user.setId(userId);
        
        Long buyCount = orderRepository.countByBuyer(user);
        Long sellCount = orderRepository.countBySeller(user);
        Double totalBuyAmount = orderRepository.getTotalBuyAmount(user);
        Double totalSellAmount = orderRepository.getTotalSellAmount(user);
        
        return new UserOrderStats(buyCount, sellCount, totalBuyAmount, totalSellAmount);
    }
    
    /**
     * 支付订单
     */
    @Transactional
    public Order payOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
        
        User currentUser = authService.getCurrentUser();
        
        // 检查权限：只有买家可以支付
        if (!order.getBuyer().getId().equals(currentUser.getId())) {
            throw new RuntimeException("只有买家可以支付此订单");
        }
        
        // 检查订单状态
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("订单状态不正确，无法支付");
        }
        
        // 更新订单状态
        order.setStatus(OrderStatus.PAID);
        order.setPaidAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        
        return orderRepository.save(order);
    }
    
    /**
     * 发货
     */
    @Transactional
    public Order shipOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
        
        User currentUser = authService.getCurrentUser();
        
        // 检查权限：只有卖家可以发货
        if (!order.getSeller().getId().equals(currentUser.getId())) {
            throw new RuntimeException("只有卖家可以发货");
        }
        
        // 检查订单状态
        if (order.getStatus() != OrderStatus.PAID) {
            throw new RuntimeException("订单状态不正确，无法发货");
        }
        
        // 更新订单状态
        order.setStatus(OrderStatus.SHIPPED);
        order.setUpdatedAt(LocalDateTime.now());
        
        return orderRepository.save(order);
    }
    
    /**
     * 确认收货
     */
    @Transactional
    public Order completeOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
        
        User currentUser = authService.getCurrentUser();
        
        // 检查权限：只有买家可以确认收货
        if (!order.getBuyer().getId().equals(currentUser.getId())) {
            throw new RuntimeException("只有买家可以确认收货");
        }
        
        // 检查订单状态
        if (order.getStatus() != OrderStatus.SHIPPED) {
            throw new RuntimeException("订单状态不正确，无法确认收货");
        }
        
        // 更新订单状态
        order.setStatus(OrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        
        // 更新商品状态为已售出
        Product product = order.getProduct();
        product.setStatus(ProductStatus.SOLD);
        product.setBuyer(currentUser);
        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);
        
        return orderRepository.save(order);
    }
    
    /**
     * 取消订单
     */
    @Transactional
    public Order cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
        
        User currentUser = authService.getCurrentUser();
        
        // 检查权限：买家或卖家都可以取消订单
        if (!order.getBuyer().getId().equals(currentUser.getId()) && 
            !order.getSeller().getId().equals(currentUser.getId())) {
            throw new RuntimeException("只有买家或卖家可以取消此订单");
        }
        
        // 检查订单状态
        if (order.getStatus() == OrderStatus.COMPLETED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("订单状态不正确，无法取消");
        }
        
        // 更新订单状态
        order.setStatus(OrderStatus.CANCELLED);
        order.setUpdatedAt(LocalDateTime.now());
        
        // 如果商品状态是RESERVED，恢复为ACTIVE
        Product product = order.getProduct();
        if (product.getStatus() == ProductStatus.RESERVED) {
            product.setStatus(ProductStatus.ACTIVE);
            product.setBuyer(null);
            product.setUpdatedAt(LocalDateTime.now());
            productRepository.save(product);
        }
        
        return orderRepository.save(order);
    }
}
