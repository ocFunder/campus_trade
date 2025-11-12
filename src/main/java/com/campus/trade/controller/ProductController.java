package com.campus.trade.controller;

import com.campus.trade.dto.ApiResponse;
import com.campus.trade.dto.ProductRequest;
import com.campus.trade.dto.ProductSearchRequest;
import com.campus.trade.entity.Product;
import com.campus.trade.entity.ProductCategory;
import com.campus.trade.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.math.BigDecimal;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * 商品控制器
 */
@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    /**
     * 创建商品
     */
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> createProduct(@RequestParam("title") String title,
                                          @RequestParam("description") String description,
                                          @RequestParam("price") BigDecimal price,
                                          @RequestParam("category") ProductCategory category,
                                          @RequestParam(value = "images", required = false) MultipartFile[] images) {
        try {
            ProductRequest productRequest = new ProductRequest();
            productRequest.setTitle(title);
            productRequest.setDescription(description);
            productRequest.setPrice(price);
            productRequest.setCategory(category);
            
            // 处理图片上传
            if (images != null && images.length > 0) {
                StringBuilder imageNames = new StringBuilder();
                for (int i = 0; i < images.length; i++) {
                    if (!images[i].isEmpty()) {
                        try {
                            // 创建uploads目录（如果不存在）
                            File uploadDir = new File("uploads");
                            if (!uploadDir.exists()) {
                                uploadDir.mkdirs();
                            }
                            
                            // 生成唯一文件名
                            String originalFilename = images[i].getOriginalFilename();
                            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                            String uniqueFilename = UUID.randomUUID().toString() + extension;
                            
                            // 保存文件
                            Path filePath = Paths.get("uploads", uniqueFilename);
                            Files.copy(images[i].getInputStream(), filePath);
                            
                            if (i > 0) imageNames.append(",");
                            imageNames.append(uniqueFilename);
                        } catch (IOException e) {
                            return ResponseEntity.badRequest()
                                    .body(ApiResponse.error("图片上传失败: " + e.getMessage()));
                        }
                    }
                }
                productRequest.setImages(imageNames.toString());
            }
            
            Product product = productService.createProduct(productRequest);
            return ResponseEntity.ok(ApiResponse.success("商品发布成功", product));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("商品发布失败: " + e.getMessage()));
        }
    }
    
    /**
     * 更新商品
     */
    @PutMapping("/{productId}")
    public ResponseEntity<?> updateProduct(@PathVariable Long productId, 
                                          @Valid @RequestBody ProductRequest productRequest) {
        try {
            Product product = productService.updateProduct(productId, productRequest);
            return ResponseEntity.ok(ApiResponse.success("商品更新成功", product));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("商品更新失败: " + e.getMessage()));
        }
    }
    
    /**
     * 删除商品
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long productId) {
        try {
            productService.deleteProduct(productId);
            return ResponseEntity.ok(ApiResponse.success("商品删除成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("商品删除失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取商品详情
     */
    @GetMapping("/{productId}")
    public ResponseEntity<?> getProduct(@PathVariable Long productId) {
        try {
            Product product = productService.getProductById(productId);
            // 增加浏览量
            productService.incrementViewCount(productId);
            return ResponseEntity.ok(ApiResponse.success("获取商品详情成功", product));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取商品详情失败: " + e.getMessage()));
        }
    }
    
    /**
     * 搜索商品
     */
    @PostMapping("/search")
    public ResponseEntity<?> searchProducts(@RequestBody ProductSearchRequest searchRequest) {
        try {
            Page<Product> products = productService.searchProducts(searchRequest);
            return ResponseEntity.ok(ApiResponse.success("搜索成功", products));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("搜索失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取热门商品
     */
    @GetMapping("/popular")
    public ResponseEntity<?> getPopularProducts(@RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "20") int size) {
        try {
            Page<Product> products = productService.getPopularProducts(page, size);
            return ResponseEntity.ok(ApiResponse.success("获取热门商品成功", products));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取热门商品失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取最新商品
     */
    @GetMapping("/latest")
    public ResponseEntity<?> getLatestProducts(@RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "20") int size) {
        try {
            Page<Product> products = productService.getLatestProducts(page, size);
            return ResponseEntity.ok(ApiResponse.success("获取最新商品成功", products));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取最新商品失败: " + e.getMessage()));
        }
    }
    
    /**
     * 根据分类获取商品
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<?> getProductsByCategory(@PathVariable ProductCategory category,
                                                  @RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "20") int size) {
        try {
            Page<Product> products = productService.getProductsByCategory(category, page, size);
            return ResponseEntity.ok(ApiResponse.success("获取分类商品成功", products));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取分类商品失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取用户发布的商品
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserProducts(@PathVariable Long userId,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size) {
        try {
            Page<Product> products = productService.getUserProducts(userId, page, size);
            return ResponseEntity.ok(ApiResponse.success("获取用户商品成功", products));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取用户商品失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取当前用户发布的商品
     */
    @GetMapping("/my-products")
    public ResponseEntity<?> getCurrentUserProducts(@RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "20") int size) {
        try {
            Page<Product> products = productService.getCurrentUserProducts(page, size);
            return ResponseEntity.ok(ApiResponse.success("获取我的商品成功", products));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取我的商品失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取商品分类统计
     */
    @GetMapping("/category-stats")
    public ResponseEntity<?> getCategoryStats() {
        try {
            // 这里可以返回各分类的商品数量统计
            return ResponseEntity.ok(ApiResponse.success("获取分类统计成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("获取分类统计失败: " + e.getMessage()));
        }
    }
}
