package com.campus.trade.repository;

import com.campus.trade.entity.Review;
import com.campus.trade.entity.ReviewType;
import com.campus.trade.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 评价数据访问层
 */
@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    /**
     * 根据被评价者查找评价（带关联数据）
     */
    @EntityGraph(value = "Review.withDetails", type = EntityGraph.EntityGraphType.LOAD)
    Page<Review> findByReviewee(User reviewee, Pageable pageable);
    
    /**
     * 根据评价者查找评价（带关联数据）
     */
    @EntityGraph(value = "Review.withDetails", type = EntityGraph.EntityGraphType.LOAD)
    Page<Review> findByReviewer(User reviewer, Pageable pageable);
    
    /**
     * 根据评价类型查找评价
     */
    Page<Review> findByType(ReviewType type, Pageable pageable);
    
    /**
     * 根据订单查找评价（带关联数据）
     */
    @EntityGraph(value = "Review.withDetails", type = EntityGraph.EntityGraphType.LOAD)
    @Query("SELECT r FROM Review r WHERE r.order.id = :orderId")
    List<Review> findByOrderIdWithDetails(@Param("orderId") Long orderId);
    
    /**
     * 根据订单查找评价
     */
    List<Review> findByOrderId(Long orderId);
    
    /**
     * 检查订单是否已有评价
     */
    @Query("SELECT COUNT(r) > 0 FROM Review r WHERE r.order.id = :orderId AND r.type = :type")
    boolean existsByOrderIdAndType(@Param("orderId") Long orderId, @Param("type") ReviewType type);
    
    /**
     * 获取用户的平均评分
     */
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee = :user")
    Double getAverageRatingByUser(@Param("user") User user);
    
    /**
     * 获取用户的评价数量
     */
    @Query("SELECT COUNT(r) FROM Review r WHERE r.reviewee = :user")
    Long countByReviewee(@Param("user") User user);
    
    /**
     * 获取用户的好评数量
     */
    @Query("SELECT COUNT(r) FROM Review r WHERE r.reviewee = :user AND r.rating >= 4")
    Long countGoodReviewsByUser(@Param("user") User user);
    
    /**
     * 获取用户的差评数量
     */
    @Query("SELECT COUNT(r) FROM Review r WHERE r.reviewee = :user AND r.rating <= 2")
    Long countBadReviewsByUser(@Param("user") User user);
    
    /**
     * 获取用户的所有评价统计
     */
    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.reviewee = :user GROUP BY r.rating ORDER BY r.rating DESC")
    List<Object[]> getRatingStatsByUser(@Param("user") User user);
}
