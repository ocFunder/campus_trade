package com.campus.trade.service;

import com.campus.trade.dto.ReviewRequest;
import com.campus.trade.dto.UserReviewStats;
import com.campus.trade.entity.Order;
import com.campus.trade.entity.OrderStatus;
import com.campus.trade.entity.Review;
import com.campus.trade.entity.ReviewType;
import com.campus.trade.entity.User;
import com.campus.trade.repository.OrderRepository;
import com.campus.trade.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * 评价服务类
 */
@Service
@Transactional
public class ReviewService {
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private AuthService authService;
    
    /**
     * 创建评价
     */
    public Review createReview(ReviewRequest reviewRequest) {
        User currentUser = authService.getCurrentUser();
        Order order = orderRepository.findById(reviewRequest.getOrderId())
                .orElseThrow(() -> new RuntimeException("订单不存在"));
        
        // 检查订单状态
        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new RuntimeException("只有已完成的订单才能评价");
        }
        
        // 检查评价权限
        boolean canReview = false;
        User reviewee = null;
        
        if (reviewRequest.getType() == ReviewType.BUYER_TO_SELLER) {
            // 买家评价卖家
            canReview = order.getBuyer().getId().equals(currentUser.getId());
            reviewee = order.getSeller();
        } else if (reviewRequest.getType() == ReviewType.SELLER_TO_BUYER) {
            // 卖家评价买家
            canReview = order.getSeller().getId().equals(currentUser.getId());
            reviewee = order.getBuyer();
        }
        
        if (!canReview) {
            throw new RuntimeException("无权限评价此订单");
        }
        
        // 检查是否已经评价过
        if (reviewRepository.existsByOrderIdAndType(order.getId(), reviewRequest.getType())) {
            throw new RuntimeException("该订单已经评价过了");
        }
        
        // 创建评价
        Review review = new Review();
        review.setOrder(order);
        review.setReviewer(currentUser);
        review.setReviewee(reviewee);
        review.setRating(reviewRequest.getRating());
        review.setContent(reviewRequest.getContent());
        review.setType(reviewRequest.getType());
        
        return reviewRepository.save(review);
    }
    
    /**
     * 根据ID获取评价
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
     * 获取用户的评价列表
     */
    @Transactional(readOnly = true)
    public Page<Review> getUserReviews(Long userId, int page, int size) {
        User user = authService.getUserById(userId);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return reviewRepository.findByReviewee(user, pageable);
    }
    
    /**
     * 获取用户给出的评价列表
     */
    @Transactional(readOnly = true)
    public Page<Review> getUserGivenReviews(Long userId, int page, int size) {
        User user = authService.getUserById(userId);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return reviewRepository.findByReviewer(user, pageable);
    }
    
    /**
     * 根据订单获取评价列表
     */
    @Transactional(readOnly = true)
    public List<Review> getOrderReviews(Long orderId) {
        return reviewRepository.findByOrderIdWithDetails(orderId);
    }
    
    /**
     * 获取用户评价统计
     */
    @Transactional(readOnly = true)
    public UserReviewStats getUserReviewStats(Long userId) {
        User user = new User();
        user.setId(userId);
        
        Double averageRating = reviewRepository.getAverageRatingByUser(user);
        Long totalReviews = reviewRepository.countByReviewee(user);
        Long goodReviews = reviewRepository.countGoodReviewsByUser(user);
        Long badReviews = reviewRepository.countBadReviewsByUser(user);
        List<Object[]> ratingStats = reviewRepository.getRatingStatsByUser(user);
        
        return new UserReviewStats(totalReviews, averageRating, goodReviews, badReviews, ratingStats);
    }
    
    /**
     * 获取用户收到的评价
     */
    @Transactional(readOnly = true)
    public Page<Review> getCurrentUserReviews(int page, int size) {
        User currentUser = authService.getCurrentUser();
        return getUserReviews(currentUser.getId(), page, size);
    }
    
    /**
     * 获取用户给出的评价
     */
    @Transactional(readOnly = true)
    public Page<Review> getCurrentUserGivenReviews(int page, int size) {
        User currentUser = authService.getCurrentUser();
        return getUserGivenReviews(currentUser.getId(), page, size);
    }
    
    /**
     * 获取当前用户评价统计
     */
    @Transactional(readOnly = true)
    public UserReviewStats getCurrentUserReviewStats() {
        User currentUser = authService.getCurrentUser();
        return getUserReviewStats(currentUser.getId());
    }
    
    /**
     * 根据评价类型获取评价
     */
    @Transactional(readOnly = true)
    public Page<Review> getReviewsByType(ReviewType type, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return reviewRepository.findByType(type, pageable);
    }
    
    /**
     * 检查当前用户是否已评价订单
     */
    @Transactional(readOnly = true)
    public boolean hasReviewedOrder(Long orderId, ReviewType reviewType) {
        return reviewRepository.existsByOrderIdAndType(orderId, reviewType);
    }
    
    /**
     * 检查当前用户是否已评价订单（根据订单和当前用户判断评价类型）
     */
    @Transactional(readOnly = true)
    public boolean hasCurrentUserReviewedOrder(Long orderId) {
        User currentUser = authService.getCurrentUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
        
        // 判断当前用户是买家还是卖家
        boolean isBuyer = order.getBuyer().getId().equals(currentUser.getId());
        ReviewType reviewType = isBuyer ? ReviewType.BUYER_TO_SELLER : ReviewType.SELLER_TO_BUYER;
        
        return reviewRepository.existsByOrderIdAndType(orderId, reviewType);
    }
}
