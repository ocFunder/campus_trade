package com.campus.trade.repository;

import com.campus.trade.entity.Product;
import com.campus.trade.entity.ProductCategory;
import com.campus.trade.entity.ProductStatus;
import com.campus.trade.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

/**
 * 商品数据访问层
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    /**
     * 根据卖家查找商品
     */
    Page<Product> findBySeller(User seller, Pageable pageable);
    
    /**
     * 根据分类查找商品
     */
    Page<Product> findByCategory(ProductCategory category, Pageable pageable);
    
    /**
     * 根据状态查找商品
     */
    Page<Product> findByStatus(ProductStatus status, Pageable pageable);
    
    /**
     * 根据卖家查找商品
     */
    Page<Product> findBySellerAndStatus(User seller, ProductStatus status, Pageable pageable);
    
    /**
     * 搜索商品
     */
    @Query("SELECT p FROM Product p WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:category IS NULL OR p.category = :category) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "p.status = 'ACTIVE'")
    Page<Product> searchProducts(@Param("keyword") String keyword,
                                @Param("category") ProductCategory category,
                                @Param("minPrice") BigDecimal minPrice,
                                @Param("maxPrice") BigDecimal maxPrice,
                                Pageable pageable);
    
    /**
     * 获取热门商品
     */
    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' ORDER BY p.viewCount DESC, p.likeCount DESC")
    Page<Product> findPopularProducts(Pageable pageable);
    
    /**
     * 获取最新商品
     */
    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' ORDER BY p.createdAt DESC")
    Page<Product> findLatestProducts(Pageable pageable);
    
    /**
     * 根据分类获取商品数量
     */
    @Query("SELECT COUNT(p) FROM Product p WHERE p.category = :category AND p.status = 'ACTIVE'")
    Long countByCategory(@Param("category") ProductCategory category);
    
    /**
     * 获取用户发布的商品数量
     */
    Long countBySeller(User seller);
    
    /**
     * 获取用户发布的在售商品数量
     */
    Long countBySellerAndStatus(User seller, ProductStatus status);
    
    /**
     * 根据状态统计商品数量
     */
    Long countByStatus(ProductStatus status);
}
