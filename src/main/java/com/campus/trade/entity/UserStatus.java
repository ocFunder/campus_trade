package com.campus.trade.entity;

/**
 * 用户状态枚举
 */
public enum UserStatus {
    ACTIVE("激活"),
    INACTIVE("未激活"),
    BANNED("封禁"),
    DELETED("已删除");
    
    private final String description;
    
    UserStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
