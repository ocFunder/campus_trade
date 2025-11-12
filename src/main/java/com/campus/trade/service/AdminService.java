package com.campus.trade.service;

import com.campus.trade.dto.DashboardStats;
import com.campus.trade.dto.UserUpdateRequest;
import com.campus.trade.dto.UserStats;
import com.campus.trade.dto.SystemStats;
import com.campus.trade.entity.Order;
import com.campus.trade.entity.OrderStatus;
import com.campus.trade.entity.Product;
import com.campus.trade.entity.ProductStatus;
import com.campus.trade.entity.Review;
import com.campus.trade.entity.ReviewType;
import com.campus.trade.entity.User;
import com.campus.trade.entity.UserStatus;
import com.campus.trade.repository.OrderRepository;
import com.campus.trade.repository.ProductRepository;
import com.campus.trade.repository.ReviewRepository;
import com.campus.trade.repository.UserRepository;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 管理员服务类
 */
@Service
@Transactional
public class AdminService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    
    /**
     * 获取仪表板统计数据
     */
    @Transactional(readOnly = true)
    public DashboardStats getDashboardStats() {
        Long totalUsers = userRepository.count();
        Long totalProducts = productRepository.count();
        Long totalOrders = orderRepository.count();
        Long totalReviews = reviewRepository.count();
        
        Long activeUsers = userRepository.countByStatus(UserStatus.ACTIVE);
        Long activeProducts = productRepository.countByStatus(ProductStatus.ACTIVE);
        Long pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);
        
        // 计算总交易金额
        List<Order> completedOrders = orderRepository.findByStatus(OrderStatus.COMPLETED, PageRequest.of(0, Integer.MAX_VALUE)).getContent();
        Double totalTransactionAmount = completedOrders.stream()
                .mapToDouble(order -> order.getAmount().doubleValue())
                .sum();
        
        return new DashboardStats(
                totalUsers, totalProducts, totalOrders, totalReviews,
                activeUsers, activeProducts, pendingOrders, totalTransactionAmount
        );
    }
    
    /**
     * 获取所有用户
     */
    @Transactional(readOnly = true)
    public Page<User> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return userRepository.findAll(pageable);
    }
    
    /**
     * 搜索用户
     */
    @Transactional(readOnly = true)
    public Page<User> searchUsers(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return userRepository.searchUsers(keyword, pageable);
    }
    
    /**
     * 获取单个用户详情
     */
    @Transactional(readOnly = true)
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }
    
    /**
     * 更新用户信息
     */
    public User updateUser(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        if (request.getRealName() != null) {
            user.setRealName(request.getRealName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }
        
        return userRepository.save(user);
    }
    
    /**
     * 删除用户
     */
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        user.setStatus(UserStatus.DELETED);
        userRepository.save(user);
    }
    
    /**
     * 获取所有商品
     */
    @Transactional(readOnly = true)
    public Page<Product> getAllProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return productRepository.findAll(pageable);
    }
    
    /**
     * 获取单个商品详情
     */
    @Transactional(readOnly = true)
    public Product getProductById(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("商品不存在"));
    }
    
    /**
     * 更新商品状态
     */
    public Product updateProductStatus(Long productId, ProductStatus status) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("商品不存在"));
        
        product.setStatus(status);
        return productRepository.save(product);
    }
    
    /**
     * 删除商品
     */
    public void deleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("商品不存在"));
        
        product.setStatus(ProductStatus.DELETED);
        productRepository.save(product);
    }
    
    /**
     * 获取所有订单
     */
    @Transactional(readOnly = true)
    public Page<Order> getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return orderRepository.findAll(pageable);
    }
    
    /**
     * 获取单个订单详情
     */
    @Transactional(readOnly = true)
    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
    }
    
    /**
     * 更新订单状态
     */
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
        
        order.setStatus(status);
        
        if (status == OrderStatus.PAID) {
            order.setPaidAt(LocalDateTime.now());
        } else if (status == OrderStatus.COMPLETED) {
            order.setCompletedAt(LocalDateTime.now());
        }
        
        return orderRepository.save(order);
    }
    
    /**
     * 获取用户统计信息
     */
    @Transactional(readOnly = true)
    public UserStats getUserStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        Long productCount = productRepository.countBySeller(user);
        Long orderCount = orderRepository.countByBuyer(user) + orderRepository.countBySeller(user);
        Double totalAmount = orderRepository.getTotalBuyAmount(user) + orderRepository.getTotalSellAmount(user);
        
        return new UserStats(productCount, orderCount, totalAmount);
    }
    
    /**
     * 获取系统统计信息
     */
    @Transactional(readOnly = true)
    public SystemStats getSystemStats() {
        // 获取最近7天的数据
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        LocalDateTime now = LocalDateTime.now();
        
        List<Order> recentOrders = orderRepository.findByCreatedAtBetween(sevenDaysAgo, now);
        Long newUsers = userRepository.countByStatus(UserStatus.ACTIVE); // 这里需要修改为统计最近注册的用户
        Long newProducts = productRepository.count(); // 这里需要修改为统计最近发布的商品
        
        return new SystemStats((long) recentOrders.size(), newUsers, newProducts);
    }
    
    /**
     * 导出用户数据为CSV
     */
    @Transactional(readOnly = true)
    public String exportUsers() {
        List<User> users = userRepository.findAll();
        StringBuilder csv = new StringBuilder();
        csv.append("ID,用户名,邮箱,真实姓名,手机号,角色,状态,注册时间\n");
        
        for (User user : users) {
            csv.append(user.getId()).append(",")
               .append(user.getUsername()).append(",")
               .append(user.getEmail()).append(",")
               .append(user.getRealName() != null ? user.getRealName() : "").append(",")
               .append(user.getPhone() != null ? user.getPhone() : "").append(",")
               .append(user.getRole()).append(",")
               .append(user.getStatus()).append(",")
               .append(user.getCreatedAt()).append("\n");
        }
        
        return csv.toString();
    }
    
    /**
     * 导出商品数据为CSV
     */
    @Transactional(readOnly = true)
    public String exportProducts() {
        List<Product> products = productRepository.findAll();
        StringBuilder csv = new StringBuilder();
        csv.append("ID,标题,价格,分类,状态,卖家,买家,创建时间\n");
        
        for (Product product : products) {
            csv.append(product.getId()).append(",")
               .append(product.getTitle()).append(",")
               .append(product.getPrice()).append(",")
               .append(product.getCategory()).append(",")
               .append(product.getStatus()).append(",")
               .append(product.getSeller().getUsername()).append(",")
               .append(product.getBuyer() != null ? product.getBuyer().getUsername() : "").append(",")
               .append(product.getCreatedAt()).append("\n");
        }
        
        return csv.toString();
    }
    
    /**
     * 导出订单数据为CSV
     */
    @Transactional(readOnly = true)
    public String exportOrders() {
        List<Order> orders = orderRepository.findAll();
        StringBuilder csv = new StringBuilder();
        csv.append("ID,订单号,商品,买家,卖家,金额,状态,创建时间\n");
        
        for (Order order : orders) {
            csv.append(order.getId()).append(",")
               .append(order.getOrderNumber()).append(",")
               .append(order.getProduct().getTitle()).append(",")
               .append(order.getBuyer().getUsername()).append(",")
               .append(order.getSeller().getUsername()).append(",")
               .append(order.getAmount()).append(",")
               .append(order.getStatus()).append(",")
               .append(order.getCreatedAt()).append("\n");
        }
        
        return csv.toString();
    }
    
    /**
     * 获取所有评价
     */
    @Transactional(readOnly = true)
    public Page<Review> getAllReviews(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        // 先获取评价ID列表（支持分页）
        Page<Long> reviewIdsPage = reviewRepository.findAllReviewIds(pageable);
        
        if (reviewIdsPage.getContent().isEmpty()) {
            return new PageImpl<>(new ArrayList<>(), pageable, 0);
        }
        
        // 根据ID列表获取评价（带关联数据）
        List<Review> reviews = reviewRepository.findByIdsWithDetails(reviewIdsPage.getContent());
        
        // 确保所有关联数据都被初始化（避免代理对象）
        initializeReviewAssociations(reviews);
        
        // 创建Page对象
        return new PageImpl<>(reviews, pageable, reviewIdsPage.getTotalElements());
    }
    
    /**
     * 根据类型获取评价
     */
    @Transactional(readOnly = true)
    public Page<Review> getReviewsByType(ReviewType type, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Review> reviews = reviewRepository.findByType(type, pageable);
        
        // 确保所有关联数据都被初始化（避免代理对象）
        initializeReviewAssociations(reviews.getContent());
        
        return reviews;
    }
    
    /**
     * 根据评分获取评价
     */
    @Transactional(readOnly = true)
    public Page<Review> getReviewsByRating(Integer rating, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Review> reviews = reviewRepository.findByRating(rating, pageable);
        
        // 确保所有关联数据都被初始化（避免代理对象）
        initializeReviewAssociations(reviews.getContent());
        
        return reviews;
    }
    
    /**
     * 初始化评价的关联数据
     */
    private void initializeReviewAssociations(List<Review> reviews) {
        reviews.forEach(review -> {
            try {
                if (review.getOrder() != null) {
                    Order order = review.getOrder();
                    // 使用Hibernate.initialize强制初始化代理对象
                    Hibernate.initialize(order);
                    
                    // 初始化Order的关联
                    if (order.getProduct() != null) {
                        Product product = order.getProduct();
                        Hibernate.initialize(product);
                        
                        // 初始化Product的关联
                        if (product.getSeller() != null) {
                            Hibernate.initialize(product.getSeller());
                            product.getSeller().getUsername();
                        }
                        if (product.getBuyer() != null) {
                            Hibernate.initialize(product.getBuyer());
                            product.getBuyer().getUsername();
                        }
                    }
                    if (order.getBuyer() != null) {
                        Hibernate.initialize(order.getBuyer());
                        order.getBuyer().getUsername();
                    }
                    if (order.getSeller() != null) {
                        Hibernate.initialize(order.getSeller());
                        order.getSeller().getUsername();
                    }
                }
                if (review.getReviewer() != null) {
                    Hibernate.initialize(review.getReviewer());
                    review.getReviewer().getUsername();
                }
                if (review.getReviewee() != null) {
                    Hibernate.initialize(review.getReviewee());
                    review.getReviewee().getUsername();
                }
            } catch (Exception e) {
                // 忽略初始化错误，继续处理下一个评价
                System.err.println("初始化评价关联数据失败: " + e.getMessage());
            }
        });
    }
    
    /**
     * 获取单个评价详情
     */
    @Transactional(readOnly = true)
    public Review getReviewById(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("评价不存在"));
        
        // 确保关联数据被加载
        if (review.getOrder() != null) {
            review.getOrder().getProduct();
            review.getOrder().getBuyer();
            review.getOrder().getSeller();
        }
        if (review.getReviewer() != null) {
            review.getReviewer().getUsername();
        }
        if (review.getReviewee() != null) {
            review.getReviewee().getUsername();
        }
        
        return review;
    }
    
    /**
     * 删除评价
     */
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("评价不存在"));
        reviewRepository.delete(review);
    }
}
