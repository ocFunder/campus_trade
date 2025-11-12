-- 校园二手交易平台示例数据

-- 插入更多测试用户
INSERT INTO users (username, email, password, real_name, phone, role, status) 
VALUES 
    ('student001', 'student001@campus.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '小明', '13800138004', 'USER', 'ACTIVE'),
    ('student002', 'student002@campus.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '小红', '13800138005', 'USER', 'ACTIVE'),
    ('student003', 'student003@campus.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '小刚', '13800138006', 'USER', 'ACTIVE'),
    ('student004', 'student004@campus.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '小丽', '13800138007', 'USER', 'ACTIVE'),
    ('student005', 'student005@campus.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '小强', '13800138008', 'USER', 'ACTIVE'),
    ('moderator01', 'moderator01@campus.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '版主小王', '13800138009', 'MODERATOR', 'ACTIVE'),
    ('admin', 'admin@campus.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '系统管理员', '13800138000', 'ADMIN', 'ACTIVE')
ON CONFLICT (username) DO NOTHING;

-- 插入更多测试商品
INSERT INTO products (title, description, price, category, seller_id, status, view_count, like_count) 
VALUES 
    -- 电子产品
    ('iPad Air 4', 'iPad Air 4代，64GB，WiFi版，深空灰色，9成新，无磕碰，配件齐全。', 2800.00, 'ELECTRONICS', 5, 'ACTIVE', 35, 6),
    ('小米手机', '小米12，8GB+256GB，蓝色，9成新，功能正常，无维修记录。', 2200.00, 'ELECTRONICS', 6, 'ACTIVE', 28, 4),
    ('华为笔记本', '华为MateBook D14，i5-10210U，8GB+512GB，银色，8成新。', 3500.00, 'ELECTRONICS', 7, 'ACTIVE', 42, 7),
    ('AirPods Pro', 'AirPods Pro 2代，降噪功能正常，充电盒有轻微磨损。', 1200.00, 'ELECTRONICS', 8, 'ACTIVE', 55, 12),
    
    -- 图书教材
    ('线性代数', '同济版线性代数第六版，几乎全新，无笔记。', 45.00, 'BOOKS', 5, 'ACTIVE', 22, 3),
    ('大学物理', '大学物理上下册，清华版，有少量笔记，不影响阅读。', 60.00, 'BOOKS', 6, 'ACTIVE', 18, 2),
    ('英语四级词汇', '新东方四级词汇书，全新未拆封。', 25.00, 'BOOKS', 7, 'ACTIVE', 30, 5),
    ('数据结构与算法', '严蔚敏版数据结构，有笔记，适合学习。', 40.00, 'BOOKS', 8, 'ACTIVE', 25, 4),
    
    -- 服装配饰
    ('优衣库羽绒服', '优衣库轻薄羽绒服，L码，黑色，9成新，保暖性好。', 200.00, 'CLOTHING', 5, 'ACTIVE', 15, 2),
    ('Nike卫衣', 'Nike运动卫衣，M码，白色，8成新，无破损。', 150.00, 'CLOTHING', 6, 'ACTIVE', 20, 3),
    ('Adidas运动裤', 'Adidas运动长裤，L码，黑色，9成新。', 120.00, 'CLOTHING', 7, 'ACTIVE', 12, 1),
    ('Zara风衣', 'Zara风衣，S码，卡其色，8成新，适合春秋。', 180.00, 'CLOTHING', 8, 'ACTIVE', 25, 4),
    
    -- 运动用品
    ('瑜伽垫', '专业瑜伽垫，防滑，厚度适中，9成新。', 80.00, 'SPORTS', 5, 'ACTIVE', 10, 1),
    ('羽毛球拍', 'YONEX羽毛球拍，单拍，适合初学者，8成新。', 120.00, 'SPORTS', 6, 'ACTIVE', 18, 3),
    ('跑步鞋', 'ASICS跑步鞋，42码，蓝色，9成新，鞋底磨损少。', 250.00, 'SPORTS', 7, 'ACTIVE', 32, 6),
    ('健身器材', '哑铃一对，5kg，适合居家健身，9成新。', 100.00, 'SPORTS', 8, 'ACTIVE', 14, 2),
    
    -- 生活用品
    ('电热水壶', '美的电热水壶，1.5L，不锈钢内胆，9成新。', 60.00, 'DAILY', 5, 'ACTIVE', 8, 1),
    ('收纳盒', '塑料收纳盒套装，大中小三个，透明，全新。', 30.00, 'DAILY', 6, 'ACTIVE', 5, 0),
    ('保温杯', '膳魔师保温杯，500ml，不锈钢，9成新。', 80.00, 'DAILY', 7, 'ACTIVE', 12, 2),
    ('床上用品', '四件套，纯棉，1.5米床，蓝色格子，9成新。', 100.00, 'DAILY', 8, 'ACTIVE', 16, 3),
    
    -- 学习用品
    ('文具套装', '晨光文具套装，包含笔、本子、橡皮等，全新。', 25.00, 'STUDY', 5, 'ACTIVE', 6, 0),
    ('书包', '双肩背包，黑色，适合学生，8成新。', 50.00, 'STUDY', 6, 'ACTIVE', 14, 2),
    ('笔记本', '活页笔记本，A4大小，内页充足，9成新。', 20.00, 'STUDY', 7, 'ACTIVE', 8, 1),
    ('文件夹', '文件整理夹，透明，A4大小，全新。', 15.00, 'STUDY', 8, 'ACTIVE', 4, 0),
    
    -- 美妆护肤
    ('面膜', '韩国面膜，补水保湿，全新未拆封，保质期到2025年。', 30.00, 'BEAUTY', 5, 'ACTIVE', 20, 4),
    ('口红', 'MAC口红，正红色，9成新，使用次数少。', 80.00, 'BEAUTY', 6, 'ACTIVE', 25, 5),
    ('护肤品', '兰蔻爽肤水，200ml，9成新，适合干性肌肤。', 120.00, 'BEAUTY', 7, 'ACTIVE', 18, 3),
    ('香水', '香奈儿香水小样，5ml，全新未使用。', 50.00, 'BEAUTY', 8, 'ACTIVE', 22, 4),
    
    -- 食品饮料
    ('咖啡豆', '星巴克咖啡豆，500g，未开封，保质期到2024年。', 60.00, 'FOOD', 5, 'ACTIVE', 12, 2),
    ('茶叶', '铁观音茶叶，250g，密封包装，9成新。', 40.00, 'FOOD', 6, 'ACTIVE', 8, 1),
    ('坚果', '混合坚果，500g，未开封，营养丰富。', 35.00, 'FOOD', 7, 'ACTIVE', 10, 1),
    ('蜂蜜', '纯天然蜂蜜，500g，玻璃瓶装，9成新。', 45.00, 'FOOD', 8, 'ACTIVE', 15, 2),
    
    -- 其他
    ('小夜灯', 'LED小夜灯，USB充电，多种颜色，9成新。', 25.00, 'OTHER', 5, 'ACTIVE', 6, 0),
    ('钥匙扣', '卡通钥匙扣，多个款式，全新。', 10.00, 'OTHER', 6, 'ACTIVE', 3, 0),
    ('手机壳', 'iPhone手机壳，透明硅胶，9成新。', 15.00, 'OTHER', 7, 'ACTIVE', 8, 1),
    ('数据线', '苹果数据线，1米，9成新，充电正常。', 20.00, 'OTHER', 8, 'ACTIVE', 12, 2)
ON CONFLICT DO NOTHING;

-- 插入一些已售出的商品
INSERT INTO products (title, description, price, category, seller_id, buyer_id, status, view_count, like_count) 
VALUES 
    ('已售iPhone', 'iPhone 11，128GB，白色，已售出。', 2500.00, 'ELECTRONICS', 2, 3, 'SOLD', 50, 8),
    ('已售教材', '高等数学教材，已售出。', 40.00, 'BOOKS', 3, 4, 'SOLD', 20, 3),
    ('已售运动鞋', 'Nike运动鞋，已售出。', 280.00, 'CLOTHING', 4, 2, 'SOLD', 35, 6)
ON CONFLICT DO NOTHING;

-- 插入一些订单数据
INSERT INTO orders (order_number, product_id, buyer_id, seller_id, amount, status, remark, created_at, paid_at, completed_at) 
VALUES 
    ('ORD1703123456789', 1, 3, 2, 2500.00, 'COMPLETED', '希望尽快发货', '2023-12-01 10:30:00', '2023-12-01 10:35:00', '2023-12-03 15:20:00'),
    ('ORD1703123456790', 2, 4, 2, 40.00, 'COMPLETED', '教材很新，谢谢', '2023-12-02 14:20:00', '2023-12-02 14:25:00', '2023-12-04 09:15:00'),
    ('ORD1703123456791', 3, 2, 3, 280.00, 'COMPLETED', '鞋子很满意', '2023-12-03 16:45:00', '2023-12-03 16:50:00', '2023-12-05 11:30:00'),
    ('ORD1703123456792', 4, 5, 3, 80.00, 'PAID', '篮球质量不错', '2023-12-10 09:15:00', '2023-12-10 09:20:00', NULL),
    ('ORD1703123456793', 5, 6, 4, 60.00, 'PENDING', '台灯很实用', '2023-12-11 11:30:00', NULL, NULL),
    ('ORD1703123456794', 6, 7, 4, 120.00, 'SHIPPED', '计算器功能齐全', '2023-12-12 13:45:00', '2023-12-12 13:50:00', NULL)
ON CONFLICT (order_number) DO NOTHING;

-- 插入评价数据
INSERT INTO reviews (order_id, reviewer_id, reviewee_id, rating, content, type, created_at) 
VALUES 
    (1, 3, 2, 5, '商品描述准确，成色很好，卖家很诚信，推荐！', 'BUYER_TO_SELLER', '2023-12-04 10:00:00'),
    (1, 2, 3, 5, '买家很爽快，交易顺利，推荐！', 'SELLER_TO_BUYER', '2023-12-04 10:05:00'),
    (2, 4, 2, 4, '教材很新，价格合理，满意！', 'BUYER_TO_SELLER', '2023-12-05 09:00:00'),
    (2, 2, 4, 5, '买家很好沟通，交易愉快！', 'SELLER_TO_BUYER', '2023-12-05 09:05:00'),
    (3, 2, 3, 5, '鞋子质量很好，卖家很负责任！', 'BUYER_TO_SELLER', '2023-12-06 14:00:00'),
    (3, 3, 2, 4, '买家很守时，交易顺利！', 'SELLER_TO_BUYER', '2023-12-06 14:05:00')
ON CONFLICT DO NOTHING;

-- 更新一些商品的浏览量和点赞数
UPDATE products SET view_count = view_count + FLOOR(RANDOM() * 50) + 10 WHERE id <= 20;
UPDATE products SET like_count = like_count + FLOOR(RANDOM() * 10) + 1 WHERE id <= 20;

-- 插入一些系统日志
INSERT INTO system_logs (operation, details, created_at) 
VALUES 
    ('INIT', 'Sample data inserted successfully', CURRENT_TIMESTAMP),
    ('USER_REGISTER', 'Test users created', CURRENT_TIMESTAMP),
    ('PRODUCT_CREATE', 'Sample products created', CURRENT_TIMESTAMP),
    ('ORDER_CREATE', 'Sample orders created', CURRENT_TIMESTAMP),
    ('REVIEW_CREATE', 'Sample reviews created', CURRENT_TIMESTAMP);

-- 完成示例数据插入
SELECT 'Sample data inserted successfully!' as message;
