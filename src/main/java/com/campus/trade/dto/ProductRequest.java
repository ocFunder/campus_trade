package com.campus.trade.dto;

import com.campus.trade.entity.ProductCategory;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import javax.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * 商品请求DTO
 */
public class ProductRequest {
    
    @NotBlank
    @Size(max = 100)
    private String title;
    
    @NotBlank
    @Size(max = 1000)
    private String description;
    
    @NotNull
    @Positive
    private BigDecimal price;
    
    private String images;
    
    @NotNull
    private ProductCategory category;
    
    public ProductRequest() {}
    
    public ProductRequest(String title, String description, BigDecimal price, ProductCategory category) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.category = category;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public String getImages() {
        return images;
    }
    
    public void setImages(String images) {
        this.images = images;
    }
    
    public ProductCategory getCategory() {
        return category;
    }
    
    public void setCategory(ProductCategory category) {
        this.category = category;
    }
}
