package com.campus.trade.controller;

import com.campus.trade.dto.ApiResponse;
import com.campus.trade.dto.ReviewRequest;
import com.campus.trade.entity.Review;
import com.campus.trade.entity.ReviewType;
import com.campus.trade.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/**
 * 评价控制器
 */
@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReviewController {
    
    @Autowired
    private ReviewService reviewService;
    
    /**
     * 创建评价
     */
    @PostMapping
    public ResponseEntity<?> createReview(@Valid @RequestBody ReviewRequest reviewRequest) {
        try {
            Review review = reviewService.createReview(reviewRequest);
            return ResponseEntity.ok(ApiResponse.success("评价创建成功", review));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("评价创建失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取评价详情
     */
    @GetMapping("/{reviewId}")
    public ResponseEntity<?> getReview(@PathVariable Long reviewId) {
        try {
            Review review = reviewService.getReviewById(reviewId);
            return ResponseEntity.ok(ApiResponse.success("获取评价详情成功", review));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取评价详情失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取用户收到的评价
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserReviews(@PathVariable Long userId,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size) {
        try {
            Page<Review> reviews = reviewService.getUserReviews(userId, page, size);
            return ResponseEntity.ok(ApiResponse.success("获取用户评价成功", reviews));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取用户评价失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取用户给出的评价
     */
    @GetMapping("/user/{userId}/given")
    public ResponseEntity<?> getUserGivenReviews(@PathVariable Long userId,
                                                @RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "20") int size) {
        try {
            Page<Review> reviews = reviewService.getUserGivenReviews(userId, page, size);
            return ResponseEntity.ok(ApiResponse.success("获取用户给出的评价成功", reviews));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取用户给出的评价失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取我的评价
     */
    @GetMapping("/my-reviews")
    public ResponseEntity<?> getMyReviews(@RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "20") int size) {
        try {
            Page<Review> reviews = reviewService.getCurrentUserReviews(page, size);
            return ResponseEntity.ok(ApiResponse.success("获取我的评价成功", reviews));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取我的评价失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取我给出的评价
     */
    @GetMapping("/my-given-reviews")
    public ResponseEntity<?> getMyGivenReviews(@RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "20") int size) {
        try {
            Page<Review> reviews = reviewService.getCurrentUserGivenReviews(page, size);
            return ResponseEntity.ok(ApiResponse.success("获取我给出的评价成功", reviews));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取我给出的评价失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取订单评价
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getOrderReviews(@PathVariable Long orderId) {
        try {
            List<Review> reviews = reviewService.getOrderReviews(orderId);
            return ResponseEntity.ok(ApiResponse.success("获取订单评价成功", reviews));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取订单评价失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取用户评价统计
     */
    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<?> getUserReviewStats(@PathVariable Long userId) {
        try {
            Object stats = reviewService.getUserReviewStats(userId);
            return ResponseEntity.ok(ApiResponse.success("获取用户评价统计成功", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取用户评价统计失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取我的评价统计
     */
    @GetMapping("/my-stats")
    public ResponseEntity<?> getMyReviewStats() {
        try {
            Object stats = reviewService.getCurrentUserReviewStats();
            return ResponseEntity.ok(ApiResponse.success("获取我的评价统计成功", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取我的评价统计失败: " + e.getMessage()));
        }
    }
    
    /**
     * 根据类型获取评价
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<?> getReviewsByType(@PathVariable ReviewType type,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        try {
            Page<Review> reviews = reviewService.getReviewsByType(type, page, size);
            return ResponseEntity.ok(ApiResponse.success("获取评价成功", reviews));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取评价失败: " + e.getMessage()));
        }
    }
    
    /**
     * 检查订单是否已评价
     */
    @GetMapping("/order/{orderId}/check")
    public ResponseEntity<?> checkOrderReview(@PathVariable Long orderId) {
        try {
            boolean hasReviewed = reviewService.hasCurrentUserReviewedOrder(orderId);
            return ResponseEntity.ok(ApiResponse.success("检查评价状态成功", hasReviewed));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("检查评价状态失败: " + e.getMessage()));
        }
    }
}
