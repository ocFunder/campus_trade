package com.campus.trade.controller;

import com.campus.trade.dto.ApiResponse;
import com.campus.trade.dto.OrderRequest;
import com.campus.trade.dto.OrderStatusUpdateRequest;
import com.campus.trade.entity.Order;
import com.campus.trade.entity.OrderStatus;
import com.campus.trade.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

/**
 * 订单控制器
 */
@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*", maxAge = 3600)
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    /**
     * 创建订单
     */
    @PostMapping
    public ResponseEntity<?> createOrder(@Valid @RequestBody OrderRequest orderRequest) {
        try {
            Order order = orderService.createOrder(orderRequest);
            return ResponseEntity.ok(ApiResponse.success("订单创建成功", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("订单创建失败: " + e.getMessage()));
        }
    }
    
    /**
     * 更新订单状态
     */
    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId,
                                              @Valid @RequestBody OrderStatusUpdateRequest request) {
        try {
            Order order = orderService.updateOrderStatus(orderId, request);
            return ResponseEntity.ok(ApiResponse.success("订单状态更新成功", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("订单状态更新失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取订单详情
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrder(@PathVariable Long orderId) {
        try {
            Order order = orderService.getOrderById(orderId);
            return ResponseEntity.ok(ApiResponse.success("获取订单详情成功", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取订单详情失败: " + e.getMessage()));
        }
    }
    
    /**
     * 根据订单号获取订单
     */
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<?> getOrderByNumber(@PathVariable String orderNumber) {
        try {
            Order order = orderService.getOrderByOrderNumber(orderNumber);
            return ResponseEntity.ok(ApiResponse.success("获取订单详情成功", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取订单详情失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取我的购买订单
     */
    @GetMapping("/my-buy-orders")
    public ResponseEntity<?> getMyBuyOrders(@RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size) {
        try {
            Page<Order> orders = orderService.getCurrentUserBuyOrders(page, size);
            return ResponseEntity.ok(ApiResponse.success("获取购买订单成功", orders));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取购买订单失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取我的销售订单
     */
    @GetMapping("/my-sell-orders")
    public ResponseEntity<?> getMySellOrders(@RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size) {
        try {
            Page<Order> orders = orderService.getCurrentUserSellOrders(page, size);
            return ResponseEntity.ok(ApiResponse.success("获取销售订单成功", orders));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取销售订单失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取我的所有订单（购买和销售）
     */
    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(@RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "20") int size,
                                        @RequestParam(required = false) String status,
                                        @RequestParam(required = false) String type) {
        try {
            Page<Order> orders = orderService.getCurrentUserOrders(page, size, status, type);
            return ResponseEntity.ok(ApiResponse.success("获取我的订单成功", orders));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取我的订单失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取用户的购买订单
     */
    @GetMapping("/user/{userId}/buy-orders")
    public ResponseEntity<?> getUserBuyOrders(@PathVariable Long userId,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        try {
            Page<Order> orders = orderService.getUserBuyOrders(userId, page, size);
            return ResponseEntity.ok(ApiResponse.success("获取用户购买订单成功", orders));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取用户购买订单失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取用户的销售订单
     */
    @GetMapping("/user/{userId}/sell-orders")
    public ResponseEntity<?> getUserSellOrders(@PathVariable Long userId,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "20") int size) {
        try {
            Page<Order> orders = orderService.getUserSellOrders(userId, page, size);
            return ResponseEntity.ok(ApiResponse.success("获取用户销售订单成功", orders));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取用户销售订单失败: " + e.getMessage()));
        }
    }
    
    /**
     * 根据状态获取订单
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getOrdersByStatus(@PathVariable OrderStatus status,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "20") int size) {
        try {
            Page<Order> orders = orderService.getOrdersByStatus(status, page, size);
            return ResponseEntity.ok(ApiResponse.success("获取订单成功", orders));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取订单失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取待处理订单
     */
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingOrders(@RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        try {
            Page<Order> orders = orderService.getPendingOrders(page, size);
            return ResponseEntity.ok(ApiResponse.success("获取待处理订单成功", orders));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取待处理订单失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取用户订单统计
     */
    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<?> getUserOrderStats(@PathVariable Long userId) {
        try {
            Object stats = orderService.getUserOrderStats(userId);
            return ResponseEntity.ok(ApiResponse.success("获取订单统计成功", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取订单统计失败: " + e.getMessage()));
        }
    }
    
    /**
     * 支付订单
     */
    @PostMapping("/{orderId}/pay")
    public ResponseEntity<?> payOrder(@PathVariable Long orderId) {
        try {
            Order order = orderService.payOrder(orderId);
            return ResponseEntity.ok(ApiResponse.success("支付成功", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("支付失败: " + e.getMessage()));
        }
    }
    
    /**
     * 发货
     */
    @PostMapping("/{orderId}/ship")
    public ResponseEntity<?> shipOrder(@PathVariable Long orderId) {
        try {
            Order order = orderService.shipOrder(orderId);
            return ResponseEntity.ok(ApiResponse.success("发货成功", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("发货失败: " + e.getMessage()));
        }
    }
    
    /**
     * 确认收货
     */
    @PostMapping("/{orderId}/complete")
    public ResponseEntity<?> completeOrder(@PathVariable Long orderId) {
        try {
            Order order = orderService.completeOrder(orderId);
            return ResponseEntity.ok(ApiResponse.success("确认收货成功", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("确认收货失败: " + e.getMessage()));
        }
    }
    
    /**
     * 取消订单
     */
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
        try {
            Order order = orderService.cancelOrder(orderId);
            return ResponseEntity.ok(ApiResponse.success("取消订单成功", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("取消订单失败: " + e.getMessage()));
        }
    }
}
