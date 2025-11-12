package com.campus.trade.dto;

/**
 * 用户统计DTO
 */
public class UserStats {
    
    private Long productCount;
    private Long orderCount;
    private Double totalAmount;
    
    public UserStats() {}
    
    public UserStats(Long productCount, Long orderCount, Double totalAmount) {
        this.productCount = productCount;
        this.orderCount = orderCount;
        this.totalAmount = totalAmount;
    }
    
    public Long getProductCount() {
        return productCount;
    }
    
    public void setProductCount(Long productCount) {
        this.productCount = productCount;
    }
    
    public Long getOrderCount() {
        return orderCount;
    }
    
    public void setOrderCount(Long orderCount) {
        this.orderCount = orderCount;
    }
    
    public Double getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }
}
