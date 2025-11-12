package com.campus.trade.entity;

/**
 * 评价类型枚举
 */
public enum ReviewType {
    BUYER_TO_SELLER("买家评价卖家"),
    SELLER_TO_BUYER("卖家评价买家");
    
    private final String description;
    
    ReviewType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
