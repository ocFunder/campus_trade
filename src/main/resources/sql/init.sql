-- 校园二手交易平台数据库初始化脚本

-- 创建数据库（如果不存在）
-- CREATE DATABASE campus_trade;

-- 使用数据库
-- \c campus_trade;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    real_name VARCHAR(50),
    phone VARCHAR(20),
    avatar VARCHAR(200),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建商品表
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    images VARCHAR(500),
    category VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    seller_id BIGINT NOT NULL,
    buyer_id BIGINT,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id)
);

-- 创建订单表
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    product_id BIGINT NOT NULL,
    buyer_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    remark VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id)
);

-- 创建评价表
CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    reviewer_id BIGINT NOT NULL,
    reviewee_id BIGINT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT NOT NULL,
    type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    FOREIGN KEY (reviewee_id) REFERENCES users(id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_view_count ON products(view_count);

CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_type ON reviews(type);

-- 插入初始管理员用户（密码：admin123）
INSERT INTO users (username, email, password, real_name, role, status) 
VALUES ('admin', 'admin@campus.edu', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', '系统管理员', 'ADMIN', 'ACTIVE')
ON CONFLICT (username) DO NOTHING;

-- 插入测试用户（密码：123456）
INSERT INTO users (username, email, password, real_name, phone, role, status) 
VALUES 
    ('testuser1', 'user1@campus.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '张三', '13800138001', 'USER', 'ACTIVE'),
    ('testuser2', 'user2@campus.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '李四', '13800138002', 'USER', 'ACTIVE'),
    ('testuser3', 'user3@campus.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '王五', '13800138003', 'USER', 'ACTIVE')
ON CONFLICT (username) DO NOTHING;

-- 插入测试商品数据
INSERT INTO products (title, description, price, category, seller_id, status, view_count, like_count) 
VALUES 
    ('MacBook Pro 13寸', '2020款MacBook Pro，配置：i5处理器，8GB内存，256GB存储，成色9成新，无磕碰，功能正常。', 8000.00, 'ELECTRONICS', 2, 'ACTIVE', 25, 3),
    ('高等数学教材', '同济版高等数学第七版，上下册，几乎全新，无笔记无折痕。', 50.00, 'BOOKS', 2, 'ACTIVE', 15, 1),
    ('Nike运动鞋', 'Nike Air Max 270，42码，黑色，9成新，鞋底磨损较少。', 300.00, 'CLOTHING', 3, 'ACTIVE', 30, 5),
    ('篮球', '斯伯丁篮球，7号标准球，手感好，适合室内外使用。', 80.00, 'SPORTS', 3, 'ACTIVE', 12, 2),
    ('台灯', 'LED护眼台灯，可调节亮度，USB充电，适合学习使用。', 60.00, 'DAILY', 4, 'ACTIVE', 8, 1),
    ('计算器', '卡西欧科学计算器，功能齐全，适合工程计算。', 120.00, 'STUDY', 4, 'ACTIVE', 20, 4),
    ('iPhone 12', 'iPhone 12 128GB，蓝色，9成新，无磕碰，电池健康度95%。', 3500.00, 'ELECTRONICS', 2, 'ACTIVE', 45, 8),
    ('考研英语词汇书', '考研英语词汇红宝书，全新未拆封。', 35.00, 'BOOKS', 3, 'ACTIVE', 18, 2)
ON CONFLICT DO NOTHING;

-- 创建触发器函数：自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为各表创建触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建视图：商品详情视图
CREATE OR REPLACE VIEW product_details AS
SELECT 
    p.id,
    p.title,
    p.description,
    p.price,
    p.images,
    p.category,
    p.status,
    p.view_count,
    p.like_count,
    p.created_at,
    p.updated_at,
    s.username as seller_username,
    s.real_name as seller_real_name,
    s.phone as seller_phone,
    s.avatar as seller_avatar,
    b.username as buyer_username,
    b.real_name as buyer_real_name
FROM products p
LEFT JOIN users s ON p.seller_id = s.id
LEFT JOIN users b ON p.buyer_id = b.id;

-- 创建视图：订单详情视图
CREATE OR REPLACE VIEW order_details AS
SELECT 
    o.id,
    o.order_number,
    o.amount,
    o.status,
    o.remark,
    o.created_at,
    o.updated_at,
    o.paid_at,
    o.completed_at,
    p.title as product_title,
    p.price as product_price,
    p.images as product_images,
    buyer.username as buyer_username,
    buyer.real_name as buyer_real_name,
    buyer.phone as buyer_phone,
    seller.username as seller_username,
    seller.real_name as seller_real_name,
    seller.phone as seller_phone
FROM orders o
LEFT JOIN products p ON o.product_id = p.id
LEFT JOIN users buyer ON o.buyer_id = buyer.id
LEFT JOIN users seller ON o.seller_id = seller.id;

-- 创建视图：用户统计视图
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.real_name,
    u.email,
    u.phone,
    u.avatar,
    u.role,
    u.status,
    u.created_at,
    COALESCE(product_count.count, 0) as product_count,
    COALESCE(buy_order_count.count, 0) as buy_order_count,
    COALESCE(sell_order_count.count, 0) as sell_order_count,
    COALESCE(review_count.count, 0) as review_count,
    COALESCE(avg_rating.rating, 0) as avg_rating
FROM users u
LEFT JOIN (
    SELECT seller_id, COUNT(*) as count 
    FROM products 
    WHERE status != 'DELETED' 
    GROUP BY seller_id
) product_count ON u.id = product_count.seller_id
LEFT JOIN (
    SELECT buyer_id, COUNT(*) as count 
    FROM orders 
    GROUP BY buyer_id
) buy_order_count ON u.id = buy_order_count.buyer_id
LEFT JOIN (
    SELECT seller_id, COUNT(*) as count 
    FROM orders 
    GROUP BY seller_id
) sell_order_count ON u.id = sell_order_count.seller_id
LEFT JOIN (
    SELECT reviewee_id, COUNT(*) as count 
    FROM reviews 
    GROUP BY reviewee_id
) review_count ON u.id = review_count.reviewee_id
LEFT JOIN (
    SELECT reviewee_id, AVG(rating) as rating 
    FROM reviews 
    GROUP BY reviewee_id
) avg_rating ON u.id = avg_rating.reviewee_id;

-- 创建存储过程：获取用户评价统计
CREATE OR REPLACE FUNCTION get_user_review_stats(user_id BIGINT)
RETURNS TABLE(
    total_reviews BIGINT,
    avg_rating NUMERIC,
    good_reviews BIGINT,
    bad_reviews BIGINT,
    rating_1 BIGINT,
    rating_2 BIGINT,
    rating_3 BIGINT,
    rating_4 BIGINT,
    rating_5 BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_reviews,
        ROUND(AVG(rating), 2) as avg_rating,
        COUNT(*) FILTER (WHERE rating >= 4) as good_reviews,
        COUNT(*) FILTER (WHERE rating <= 2) as bad_reviews,
        COUNT(*) FILTER (WHERE rating = 1) as rating_1,
        COUNT(*) FILTER (WHERE rating = 2) as rating_2,
        COUNT(*) FILTER (WHERE rating = 3) as rating_3,
        COUNT(*) FILTER (WHERE rating = 4) as rating_4,
        COUNT(*) FILTER (WHERE rating = 5) as rating_5
    FROM reviews 
    WHERE reviewee_id = user_id;
END;
$$ LANGUAGE plpgsql;

-- 创建存储过程：获取系统统计
CREATE OR REPLACE FUNCTION get_system_stats()
RETURNS TABLE(
    total_users BIGINT,
    active_users BIGINT,
    total_products BIGINT,
    active_products BIGINT,
    total_orders BIGINT,
    pending_orders BIGINT,
    total_reviews BIGINT,
    total_transaction_amount NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE status = 'ACTIVE') as active_users,
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COUNT(*) FROM products WHERE status = 'ACTIVE') as active_products,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'PENDING') as pending_orders,
        (SELECT COUNT(*) FROM reviews) as total_reviews,
        (SELECT COALESCE(SUM(amount), 0) FROM orders WHERE status = 'COMPLETED') as total_transaction_amount;
END;
$$ LANGUAGE plpgsql;

-- 创建存储过程：清理过期数据
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS VOID AS $$
BEGIN
    -- 删除30天前的已取消订单
    DELETE FROM orders 
    WHERE status = 'CANCELLED' 
    AND created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    -- 删除已删除用户的相关数据（保留90天）
    UPDATE products 
    SET status = 'DELETED' 
    WHERE seller_id IN (
        SELECT id FROM users WHERE status = 'DELETED'
    ) AND status != 'DELETED';
    
    -- 记录清理操作
    INSERT INTO system_logs (operation, details, created_at) 
    VALUES ('CLEANUP', 'Expired data cleanup completed', CURRENT_TIMESTAMP);
    
EXCEPTION
    WHEN OTHERS THEN
        -- 如果system_logs表不存在，忽略错误
        NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建系统日志表（可选）
CREATE TABLE IF NOT EXISTS system_logs (
    id BIGSERIAL PRIMARY KEY,
    operation VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建定时任务（需要pg_cron扩展）
-- SELECT cron.schedule('cleanup-expired-data', '0 2 * * *', 'SELECT cleanup_expired_data();');

-- 授权（根据需要调整）
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO campus_trade_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO campus_trade_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO campus_trade_user;

-- 完成初始化
SELECT 'Database initialization completed successfully!' as message;
