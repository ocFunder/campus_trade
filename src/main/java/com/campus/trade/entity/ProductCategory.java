package com.campus.trade.entity;

/**
 * 商品分类枚举
 */
public enum ProductCategory {
    ELECTRONICS("电子产品"),
    BOOKS("图书教材"),
    CLOTHING("服装配饰"),
    SPORTS("运动用品"),
    DAILY("生活用品"),
    STUDY("学习用品"),
    BEAUTY("美妆护肤"),
    FOOD("食品饮料"),
    OTHER("其他");
    
    private final String description;
    
    ProductCategory(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
