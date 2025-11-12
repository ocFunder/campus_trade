package com.campus.trade.dto;

import com.campus.trade.entity.ProductCategory;

import java.math.BigDecimal;

/**
 * 商品搜索请求DTO
 */
public class ProductSearchRequest {
    
    private String keyword;
    private ProductCategory category;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String sortBy = "createdAt"; // createdAt, price, viewCount, likeCount
    private String sortDirection = "desc"; // asc, desc
    private int page = 0;
    private int size = 20;
    
    public ProductSearchRequest() {}
    
    public String getKeyword() {
        return keyword;
    }
    
    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }
    
    public ProductCategory getCategory() {
        return category;
    }
    
    public void setCategory(ProductCategory category) {
        this.category = category;
    }
    
    public BigDecimal getMinPrice() {
        return minPrice;
    }
    
    public void setMinPrice(BigDecimal minPrice) {
        this.minPrice = minPrice;
    }
    
    public BigDecimal getMaxPrice() {
        return maxPrice;
    }
    
    public void setMaxPrice(BigDecimal maxPrice) {
        this.maxPrice = maxPrice;
    }
    
    public String getSortBy() {
        return sortBy;
    }
    
    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }
    
    public String getSortDirection() {
        return sortDirection;
    }
    
    public void setSortDirection(String sortDirection) {
        this.sortDirection = sortDirection;
    }
    
    public int getPage() {
        return page;
    }
    
    public void setPage(int page) {
        this.page = page;
    }
    
    public int getSize() {
        return size;
    }
    
    public void setSize(int size) {
        this.size = size;
    }
}
