package com.campus.trade.entity;

import javax.persistence.*;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * 评价实体类
 */
@Entity
@Table(name = "reviews")
@NamedEntityGraph(
    name = "Review.withDetails",
    attributeNodes = {
        @NamedAttributeNode("order"),
        @NamedAttributeNode("reviewer"),
        @NamedAttributeNode("reviewee")
    }
)
public class Review {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewee_id", nullable = false)
    private User reviewee;
    
    @Min(1)
    @Max(5)
    @Column(nullable = false)
    private Integer rating;
    
    @NotBlank
    @Size(max = 500)
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewType type;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // 构造函数
    public Review() {}
    
    public Review(Order order, User reviewer, User reviewee, Integer rating, String content, ReviewType type) {
        this.order = order;
        this.reviewer = reviewer;
        this.reviewee = reviewee;
        this.rating = rating;
        this.content = content;
        this.type = type;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Order getOrder() {
        return order;
    }
    
    public void setOrder(Order order) {
        this.order = order;
    }
    
    public User getReviewer() {
        return reviewer;
    }
    
    public void setReviewer(User reviewer) {
        this.reviewer = reviewer;
    }
    
    public User getReviewee() {
        return reviewee;
    }
    
    public void setReviewee(User reviewee) {
        this.reviewee = reviewee;
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
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
