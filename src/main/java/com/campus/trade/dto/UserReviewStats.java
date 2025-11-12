package com.campus.trade.dto;

import java.util.List;

/**
 * 用户评价统计DTO
 */
public class UserReviewStats {
    
    private Long totalReviews;
    private Double averageRating;
    private Long goodReviews;
    private Long badReviews;
    private List<Object[]> ratingStats;
    
    public UserReviewStats() {}
    
    public UserReviewStats(Long totalReviews, Double averageRating, Long goodReviews, Long badReviews, List<Object[]> ratingStats) {
        this.totalReviews = totalReviews;
        this.averageRating = averageRating;
        this.goodReviews = goodReviews;
        this.badReviews = badReviews;
        this.ratingStats = ratingStats;
    }
    
    public Long getTotalReviews() {
        return totalReviews;
    }
    
    public void setTotalReviews(Long totalReviews) {
        this.totalReviews = totalReviews;
    }
    
    public Double getAverageRating() {
        return averageRating;
    }
    
    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }
    
    public Long getGoodReviews() {
        return goodReviews;
    }
    
    public void setGoodReviews(Long goodReviews) {
        this.goodReviews = goodReviews;
    }
    
    public Long getBadReviews() {
        return badReviews;
    }
    
    public void setBadReviews(Long badReviews) {
        this.badReviews = badReviews;
    }
    
    public List<Object[]> getRatingStats() {
        return ratingStats;
    }
    
    public void setRatingStats(List<Object[]> ratingStats) {
        this.ratingStats = ratingStats;
    }
}
