package com.campus.trade.dto;

/**
 * 用户订单统计DTO
 */
public class UserOrderStats {
    
    private Long buyCount;
    private Long sellCount;
    private Double totalBuyAmount;
    private Double totalSellAmount;
    
    public UserOrderStats() {}
    
    public UserOrderStats(Long buyCount, Long sellCount, Double totalBuyAmount, Double totalSellAmount) {
        this.buyCount = buyCount;
        this.sellCount = sellCount;
        this.totalBuyAmount = totalBuyAmount;
        this.totalSellAmount = totalSellAmount;
    }
    
    public Long getBuyCount() {
        return buyCount;
    }
    
    public void setBuyCount(Long buyCount) {
        this.buyCount = buyCount;
    }
    
    public Long getSellCount() {
        return sellCount;
    }
    
    public void setSellCount(Long sellCount) {
        this.sellCount = sellCount;
    }
    
    public Double getTotalBuyAmount() {
        return totalBuyAmount;
    }
    
    public void setTotalBuyAmount(Double totalBuyAmount) {
        this.totalBuyAmount = totalBuyAmount;
    }
    
    public Double getTotalSellAmount() {
        return totalSellAmount;
    }
    
    public void setTotalSellAmount(Double totalSellAmount) {
        this.totalSellAmount = totalSellAmount;
    }
}
