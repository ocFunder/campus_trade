package com.campus.trade.dto;

/**
 * 仪表板统计数据DTO
 */
public class DashboardStats {
    
    private Long totalUsers;
    private Long totalProducts;
    private Long totalOrders;
    private Long totalReviews;
    private Long activeUsers;
    private Long activeProducts;
    private Long pendingOrders;
    private Double totalTransactionAmount;
    
    public DashboardStats() {}
    
    public DashboardStats(Long totalUsers, Long totalProducts, Long totalOrders, Long totalReviews,
                         Long activeUsers, Long activeProducts, Long pendingOrders, Double totalTransactionAmount) {
        this.totalUsers = totalUsers;
        this.totalProducts = totalProducts;
        this.totalOrders = totalOrders;
        this.totalReviews = totalReviews;
        this.activeUsers = activeUsers;
        this.activeProducts = activeProducts;
        this.pendingOrders = pendingOrders;
        this.totalTransactionAmount = totalTransactionAmount;
    }
    
    public Long getTotalUsers() {
        return totalUsers;
    }
    
    public void setTotalUsers(Long totalUsers) {
        this.totalUsers = totalUsers;
    }
    
    public Long getTotalProducts() {
        return totalProducts;
    }
    
    public void setTotalProducts(Long totalProducts) {
        this.totalProducts = totalProducts;
    }
    
    public Long getTotalOrders() {
        return totalOrders;
    }
    
    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }
    
    public Long getTotalReviews() {
        return totalReviews;
    }
    
    public void setTotalReviews(Long totalReviews) {
        this.totalReviews = totalReviews;
    }
    
    public Long getActiveUsers() {
        return activeUsers;
    }
    
    public void setActiveUsers(Long activeUsers) {
        this.activeUsers = activeUsers;
    }
    
    public Long getActiveProducts() {
        return activeProducts;
    }
    
    public void setActiveProducts(Long activeProducts) {
        this.activeProducts = activeProducts;
    }
    
    public Long getPendingOrders() {
        return pendingOrders;
    }
    
    public void setPendingOrders(Long pendingOrders) {
        this.pendingOrders = pendingOrders;
    }
    
    public Double getTotalTransactionAmount() {
        return totalTransactionAmount;
    }
    
    public void setTotalTransactionAmount(Double totalTransactionAmount) {
        this.totalTransactionAmount = totalTransactionAmount;
    }
}
