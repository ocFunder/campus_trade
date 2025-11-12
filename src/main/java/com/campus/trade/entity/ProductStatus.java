package com.campus.trade.entity;

/**
 * 商品状态枚举
 */
public enum ProductStatus {
    ACTIVE("在售"),
    SOLD("已售出"),
    RESERVED("已预订"),
    DELETED("已删除"),
    BANNED("已下架");
    
    private final String description;
    
    ProductStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
