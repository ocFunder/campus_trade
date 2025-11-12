package com.campus.trade.dto;

import com.campus.trade.entity.ReviewType;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 * 评价请求DTO
 */
public class ReviewRequest {
    
    @NotNull
    private Long orderId;
    
    @Min(1)
    @Max(5)
    @NotNull
    private Integer rating;
    
    @NotBlank
    @Size(max = 500)
    private String content;
    
    @NotNull
    private ReviewType type;
    
    public ReviewRequest() {}
    
    public ReviewRequest(Long orderId, Integer rating, String content, ReviewType type) {
        this.orderId = orderId;
        this.rating = rating;
        this.content = content;
        this.type = type;
    }
    
    public Long getOrderId() {
        return orderId;
    }
    
    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }
    
    public Integer getRating() {
        return rating;
    }
    
    public void setRating(Integer rating) {
        this.rating = rating;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public ReviewType getType() {
        return type;
    }
    
    public void setType(ReviewType type) {
        this.type = type;
    }
}
