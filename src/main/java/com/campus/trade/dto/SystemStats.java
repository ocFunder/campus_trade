package com.campus.trade.dto;

/**
 * 系统统计DTO
 */
public class SystemStats {
    
    private Long recentOrders;
    private Long newUsers;
    private Long newProducts;
    
    public SystemStats() {}
    
    public SystemStats(Long recentOrders, Long newUsers, Long newProducts) {
        this.recentOrders = recentOrders;
        this.newUsers = newUsers;
        this.newProducts = newProducts;
    }
    
    public Long getRecentOrders() {
        return recentOrders;
    }
    
    public void setRecentOrders(Long recentOrders) {
        this.recentOrders = recentOrders;
    }
    
    public Long getNewUsers() {
        return newUsers;
    }
    
    public void setNewUsers(Long newUsers) {
        this.newUsers = newUsers;
    }
    
    public Long getNewProducts() {
        return newProducts;
    }
    
    public void setNewProducts(Long newProducts) {
        this.newProducts = newProducts;
    }
}
