package com.campus.trade.repository;

import com.campus.trade.entity.Order;
import com.campus.trade.entity.OrderStatus;
import com.campus.trade.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 订单数据访问层
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    /**
     * 根据订单号查找订单
     */
    Optional<Order> findByOrderNumber(String orderNumber);
    
    /**
     * 根据买家查找订单
     */
    Page<Order> findByBuyer(User buyer, Pageable pageable);
    
    /**
     * 根据卖家查找订单
     */
    Page<Order> findBySeller(User seller, Pageable pageable);
    
    /**
     * 根据买家查找订单
     */
    Page<Order> findByBuyerAndStatus(User buyer, OrderStatus status, Pageable pageable);
    
    /**
     * 根据卖家查找订单
     */
    Page<Order> findBySellerAndStatus(User seller, OrderStatus status, Pageable pageable);
    
    /**
     * 根据状态查找订单
     */
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
    
    /**
     * 获取用户的订单统计
     */
    @Query("SELECT COUNT(o) FROM Order o WHERE o.buyer = :user")
    Long countByBuyer(@Param("user") User user);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.seller = :user")
    Long countBySeller(@Param("user") User user);
    
    /**
     * 获取用户的总交易金额
     */
    @Query("SELECT COALESCE(SUM(o.amount), 0) FROM Order o WHERE o.buyer = :user AND o.status = 'COMPLETED'")
    Double getTotalBuyAmount(@Param("user") User user);
    
    @Query("SELECT COALESCE(SUM(o.amount), 0) FROM Order o WHERE o.seller = :user AND o.status = 'COMPLETED'")
    Double getTotalSellAmount(@Param("user") User user);
    
    /**
     * 获取指定时间范围内的订单
     */
    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    List<Order> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                      @Param("endDate") LocalDateTime endDate);
    
    /**
     * 根据商品ID查找订单
     */
    List<Order> findByProductId(Long productId);
    
    /**
     * 根据状态统计订单数量
     */
    Long countByStatus(OrderStatus status);
    
    /**
     * 获取待处理的订单
     */
    @Query("SELECT o FROM Order o WHERE o.status IN ('PENDING', 'PAID') ORDER BY o.createdAt ASC")
    Page<Order> findPendingOrders(Pageable pageable);
    
    /**
     * 根据买家或卖家查找订单
     */
    @Query("SELECT o FROM Order o WHERE o.buyer = :buyer OR o.seller = :seller ORDER BY o.createdAt DESC")
    Page<Order> findByBuyerOrSeller(@Param("buyer") User buyer, @Param("seller") User seller, Pageable pageable);
    
    /**
     * 根据买家或卖家和状态查找订单
     */
    @Query("SELECT o FROM Order o WHERE (o.buyer = :buyer OR o.seller = :seller) AND o.status = :status ORDER BY o.createdAt DESC")
    Page<Order> findByBuyerOrSellerAndStatus(@Param("buyer") User buyer, @Param("seller") User seller, 
                                            @Param("status") OrderStatus status, Pageable pageable);
}
