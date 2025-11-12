package com.campus.trade.entity;

/**
 * 订单状态枚举
 */
public enum OrderStatus {
    PENDING("待支付"),
    PAID("已支付"),
    SHIPPED("已发货"),
    COMPLETED("已完成"),
    CANCELLED("已取消"),
    REFUNDED("已退款");
    
    private final String description;
    
    OrderStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
