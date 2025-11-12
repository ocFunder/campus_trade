package com.campus.trade.dto;

import com.campus.trade.entity.UserRole;
import com.campus.trade.entity.UserStatus;

import javax.validation.constraints.Size;

/**
 * 用户更新请求DTO
 */
public class UserUpdateRequest {
    
    @Size(max = 50)
    private String realName;
    
    @Size(max = 20)
    private String phone;
    
    @Size(max = 200)
    private String avatar;
    
    private UserRole role;
    
    private UserStatus status;
    
    public UserUpdateRequest() {}
    
    public String getRealName() {
        return realName;
    }
    
    public void setRealName(String realName) {
        this.realName = realName;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getAvatar() {
        return avatar;
    }
    
    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
    
    public UserRole getRole() {
        return role;
    }
    
    public void setRole(UserRole role) {
        this.role = role;
    }
    
    public UserStatus getStatus() {
        return status;
    }
    
    public void setStatus(UserStatus status) {
        this.status = status;
    }
}
