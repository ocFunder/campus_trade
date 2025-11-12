package com.campus.trade.dto;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 * 订单请求DTO
 */
public class OrderRequest {
    
    @NotNull
    private Long productId;
    
    @Size(max = 500)
    private String remark;
    
    public OrderRequest() {}
    
    public OrderRequest(Long productId, String remark) {
        this.productId = productId;
        this.remark = remark;
    }
    
    public Long getProductId() {
        return productId;
    }
    
    public void setProductId(Long productId) {
        this.productId = productId;
    }
    
    public String getRemark() {
        return remark;
    }
    
    public void setRemark(String remark) {
        this.remark = remark;
    }
}
