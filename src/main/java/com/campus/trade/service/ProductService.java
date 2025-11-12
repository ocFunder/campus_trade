package com.campus.trade.service;

import com.campus.trade.dto.ProductRequest;
import com.campus.trade.dto.ProductSearchRequest;
import com.campus.trade.entity.Product;
import com.campus.trade.entity.ProductCategory;
import com.campus.trade.entity.ProductStatus;
import com.campus.trade.entity.User;
import com.campus.trade.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 商品服务类
 */
@Service
@Transactional
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private AuthService authService;
    
    /**
     * 创建商品
     */
    public Product createProduct(ProductRequest productRequest) {
        User currentUser = authService.getCurrentUser();
        
        Product product = new Product();
        product.setTitle(productRequest.getTitle());
        product.setDescription(productRequest.getDescription());
        product.setPrice(productRequest.getPrice());
        product.setImages(productRequest.getImages());
        product.setCategory(productRequest.getCategory());
        product.setSeller(currentUser);
        product.setStatus(ProductStatus.ACTIVE);
        
        return productRepository.save(product);
    }
    
    /**
     * 更新商品
     */
    public Product updateProduct(Long productId, ProductRequest productRequest) {
        Product product = getProductById(productId);
        User currentUser = authService.getCurrentUser();
        
        // 检查权限：只有商品发布者或管理员可以修改
        if (!product.getSeller().getId().equals(currentUser.getId()) && 
            !currentUser.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("无权限修改此商品");
        }
        
        product.setTitle(productRequest.getTitle());
        product.setDescription(productRequest.getDescription());
        product.setPrice(productRequest.getPrice());
        product.setImages(productRequest.getImages());
        product.setCategory(productRequest.getCategory());
        
        return productRepository.save(product);
    }
    
    /**
     * 删除商品
     */
    public void deleteProduct(Long productId) {
        Product product = getProductById(productId);
        User currentUser = authService.getCurrentUser();
        
        // 检查权限：只有商品发布者或管理员可以删除
        if (!product.getSeller().getId().equals(currentUser.getId()) && 
            !currentUser.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("无权限删除此商品");
        }
        
        product.setStatus(ProductStatus.DELETED);
        productRepository.save(product);
    }
    
    /**
     * 根据ID获取商品
     */
    @Transactional(readOnly = true)
    public Product getProductById(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("商品不存在"));
    }
    
    /**
     * 增加商品浏览量
     */
    public void incrementViewCount(Long productId) {
        Product product = getProductById(productId);
        product.setViewCount(product.getViewCount() + 1);
        productRepository.save(product);
    }
    
    /**
     * 搜索商品
     */
    @Transactional(readOnly = true)
    public Page<Product> searchProducts(ProductSearchRequest searchRequest) {
        Sort sort = Sort.by(
                searchRequest.getSortDirection().equals("asc") ? 
                Sort.Direction.ASC : Sort.Direction.DESC, 
                searchRequest.getSortBy()
        );
        
        Pageable pageable = PageRequest.of(searchRequest.getPage(), searchRequest.getSize(), sort);
        
        return productRepository.searchProducts(
                searchRequest.getKeyword(),
                searchRequest.getCategory(),
                searchRequest.getMinPrice(),
                searchRequest.getMaxPrice(),
                pageable
        );
    }
    
    /**
     * 获取热门商品
     */
    @Transactional(readOnly = true)
    public Page<Product> getPopularProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findPopularProducts(pageable);
    }
    
    /**
     * 获取最新商品
     */
    @Transactional(readOnly = true)
    public Page<Product> getLatestProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findLatestProducts(pageable);
    }
    
    /**
     * 获取用户发布的商品
     */
    @Transactional(readOnly = true)
    public Page<Product> getUserProducts(Long userId, int page, int size) {
        User user = new User();
        user.setId(userId);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return productRepository.findBySeller(user, pageable);
    }
    
    /**
     * 获取当前用户发布的商品
     */
    @Transactional(readOnly = true)
    public Page<Product> getCurrentUserProducts(int page, int size) {
        User currentUser = authService.getCurrentUser();
        return getUserProducts(currentUser.getId(), page, size);
    }
    
    /**
     * 根据分类获取商品
     */
    @Transactional(readOnly = true)
    public Page<Product> getProductsByCategory(ProductCategory category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return productRepository.findByCategory(category, pageable);
    }
    
    /**
     * 获取分类商品数量
     */
    @Transactional(readOnly = true)
    public Long getProductCountByCategory(ProductCategory category) {
        return productRepository.countByCategory(category);
    }
}
