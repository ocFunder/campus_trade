package com.campus.trade.dto;

import com.campus.trade.entity.OrderStatus;

import javax.validation.constraints.NotNull;

/**
 * 订单状态更新请求DTO
 */
public class OrderStatusUpdateRequest {
    
    @NotNull
    private OrderStatus status;
    
    public OrderStatusUpdateRequest() {}
    
    public OrderStatusUpdateRequest(OrderStatus status) {
        this.status = status;
    }
    
    public OrderStatus getStatus() {
        return status;
    }
    
    public void setStatus(OrderStatus status) {
        this.status = status;
    }
}
