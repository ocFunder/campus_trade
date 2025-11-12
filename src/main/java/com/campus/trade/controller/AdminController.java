package com.campus.trade.controller;

import com.campus.trade.dto.ApiResponse;
import com.campus.trade.dto.DashboardStats;
import com.campus.trade.dto.UserUpdateRequest;
import com.campus.trade.entity.Order;
import com.campus.trade.entity.OrderStatus;
import com.campus.trade.entity.Product;
import com.campus.trade.entity.ProductStatus;
import com.campus.trade.entity.User;
import com.campus.trade.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

/**
 * 管理员控制器
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
    /**
     * 获取仪表板统计数据
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            DashboardStats stats = adminService.getDashboardStats();
            return ResponseEntity.ok(ApiResponse.success("获取统计数据成功", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取统计数据失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取所有用户
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "20") int size) {
        try {
            Page<User> users = adminService.getAllUsers(page, size);
            return ResponseEntity.ok(ApiResponse.success("获取用户列表成功", users));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取用户列表失败: " + e.getMessage()));
        }
    }
    
    /**
     * 搜索用户
     */
    @GetMapping("/users/search")
    public ResponseEntity<?> searchUsers(@RequestParam String keyword,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "20") int size) {
        try {
            Page<User> users = adminService.searchUsers(keyword, page, size);
            return ResponseEntity.ok(ApiResponse.success("搜索用户成功", users));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("搜索用户失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取单个用户详情
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        try {
            User user = adminService.getUserById(userId);
            return ResponseEntity.ok(ApiResponse.success("获取用户详情成功", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取用户详情失败: " + e.getMessage()));
        }
    }
    
    /**
     * 更新用户信息
     */
    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId,
                                       @Valid @RequestBody UserUpdateRequest request) {
        try {
            User user = adminService.updateUser(userId, request);
            return ResponseEntity.ok(ApiResponse.success("更新用户信息成功", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("更新用户信息失败: " + e.getMessage()));
        }
    }
    
    /**
     * 删除用户
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            adminService.deleteUser(userId);
            return ResponseEntity.ok(ApiResponse.success("删除用户成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("删除用户失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取所有商品
     */
    @GetMapping("/products")
    public ResponseEntity<?> getAllProducts(@RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size) {
        try {
            Page<Product> products = adminService.getAllProducts(page, size);
            return ResponseEntity.ok(ApiResponse.success("获取商品列表成功", products));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取商品列表失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取单个商品详情
     */
    @GetMapping("/products/{productId}")
    public ResponseEntity<?> getProductById(@PathVariable Long productId) {
        try {
            Product product = adminService.getProductById(productId);
            return ResponseEntity.ok(ApiResponse.success("获取商品详情成功", product));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取商品详情失败: " + e.getMessage()));
        }
    }
    
    /**
     * 更新商品状态
     */
    @PutMapping("/products/{productId}/status")
    public ResponseEntity<?> updateProductStatus(@PathVariable Long productId,
                                                @RequestParam ProductStatus status) {
        try {
            Product product = adminService.updateProductStatus(productId, status);
            return ResponseEntity.ok(ApiResponse.success("更新商品状态成功", product));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("更新商品状态失败: " + e.getMessage()));
        }
    }
    
    /**
     * 删除商品
     */
    @DeleteMapping("/products/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long productId) {
        try {
            adminService.deleteProduct(productId);
            return ResponseEntity.ok(ApiResponse.success("删除商品成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("删除商品失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取所有订单
     */
    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders(@RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "20") int size) {
        try {
            Page<Order> orders = adminService.getAllOrders(page, size);
            return ResponseEntity.ok(ApiResponse.success("获取订单列表成功", orders));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取订单列表失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取单个订单详情
     */
    @GetMapping("/orders/{orderId}")
    public ResponseEntity<?> getOrderById(@PathVariable Long orderId) {
        try {
            Order order = adminService.getOrderById(orderId);
            return ResponseEntity.ok(ApiResponse.success("获取订单详情成功", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取订单详情失败: " + e.getMessage()));
        }
    }
    
    /**
     * 更新订单状态
     */
    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId,
                                              @RequestParam OrderStatus status) {
        try {
            Order order = adminService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(ApiResponse.success("更新订单状态成功", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("更新订单状态失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取用户统计信息
     */
    @GetMapping("/users/{userId}/stats")
    public ResponseEntity<?> getUserStats(@PathVariable Long userId) {
        try {
            Object stats = adminService.getUserStats(userId);
            return ResponseEntity.ok(ApiResponse.success("获取用户统计成功", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取用户统计失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取系统统计信息
     */
    @GetMapping("/system/stats")
    public ResponseEntity<?> getSystemStats() {
        try {
            Object stats = adminService.getSystemStats();
            return ResponseEntity.ok(ApiResponse.success("获取系统统计成功", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取系统统计失败: " + e.getMessage()));
        }
    }
    
    /**
     * 导出用户数据
     */
    @GetMapping("/export/users")
    public ResponseEntity<?> exportUsers() {
        try {
            String csvData = adminService.exportUsers();
            return ResponseEntity.ok()
                    .header("Content-Type", "text/csv; charset=UTF-8")
                    .header("Content-Disposition", "attachment; filename=users_export.csv")
                    .body(csvData);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("导出用户数据失败: " + e.getMessage()));
        }
    }
    
    /**
     * 导出商品数据
     */
    @GetMapping("/export/products")
    public ResponseEntity<?> exportProducts() {
        try {
            String csvData = adminService.exportProducts();
            return ResponseEntity.ok()
                    .header("Content-Type", "text/csv; charset=UTF-8")
                    .header("Content-Disposition", "attachment; filename=products_export.csv")
                    .body(csvData);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("导出商品数据失败: " + e.getMessage()));
        }
    }
    
    /**
     * 导出订单数据
     */
    @GetMapping("/export/orders")
    public ResponseEntity<?> exportOrders() {
        try {
            String csvData = adminService.exportOrders();
            return ResponseEntity.ok()
                    .header("Content-Type", "text/csv; charset=UTF-8")
                    .header("Content-Disposition", "attachment; filename=orders_export.csv")
                    .body(csvData);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("导出订单数据失败: " + e.getMessage()));
        }
    }
}
