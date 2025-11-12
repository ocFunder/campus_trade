# API接口文档

## 基础信息

- **Base URL**: `http://localhost:8080/api`
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

## 认证接口

### 用户登录
```http
POST /auth/login
Content-Type: application/json

{
  "usernameOrEmail": "string",
  "password": "string"
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
    "tokenType": "Bearer",
    "userId": 1,
    "username": "testuser",
    "role": "USER"
  }
}
```

### 用户注册
```http
POST /auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "realName": "string",
  "phone": "string"
}
```

### 获取当前用户信息
```http
GET /auth/me
Authorization: Bearer {token}
```

### 检查用户名可用性
```http
GET /auth/check-username?username={username}
```

### 检查邮箱可用性
```http
GET /auth/check-email?email={email}
```

## 商品接口

### 获取商品列表
```http
GET /products?page=0&size=20&category=ELECTRONICS&keyword=手机
```

**查询参数**:
- `page`: 页码（默认0）
- `size`: 每页大小（默认20）
- `category`: 商品分类
- `keyword`: 搜索关键词
- `minPrice`: 最低价格
- `maxPrice`: 最高价格
- `sortBy`: 排序字段（createdAt, price, viewCount, likeCount）
- `sortDirection`: 排序方向（asc, desc）

### 搜索商品
```http
POST /products/search
Content-Type: application/json

{
  "keyword": "string",
  "category": "ELECTRONICS",
  "minPrice": 100.00,
  "maxPrice": 1000.00,
  "sortBy": "createdAt",
  "sortDirection": "desc",
  "page": 0,
  "size": 20
}
```

### 获取商品详情
```http
GET /products/{id}
```

### 创建商品
```http
POST /products
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "price": 100.00,
  "images": "string",
  "category": "ELECTRONICS"
}
```

### 更新商品
```http
PUT /products/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "price": 100.00,
  "images": "string",
  "category": "ELECTRONICS"
}
```

### 删除商品
```http
DELETE /products/{id}
Authorization: Bearer {token}
```

### 获取热门商品
```http
GET /products/popular?page=0&size=8
```

### 获取最新商品
```http
GET /products/latest?page=0&size=8
```

### 按分类获取商品
```http
GET /products/category/{category}?page=0&size=20
```

### 获取用户商品
```http
GET /products/user/{userId}?page=0&size=20
```

### 获取我的商品
```http
GET /products/my-products?page=0&size=20
Authorization: Bearer {token}
```

## 订单接口

### 创建订单
```http
POST /orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": 1,
  "remark": "string"
}
```

### 获取订单详情
```http
GET /orders/{id}
Authorization: Bearer {token}
```

### 根据订单号获取订单
```http
GET /orders/number/{orderNumber}
Authorization: Bearer {token}
```

### 更新订单状态
```http
PUT /orders/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "PAID"
}
```

### 获取我的购买订单
```http
GET /orders/my-buy-orders?page=0&size=20
Authorization: Bearer {token}
```

### 获取我的销售订单
```http
GET /orders/my-sell-orders?page=0&size=20
Authorization: Bearer {token}
```

### 获取用户购买订单
```http
GET /orders/user/{userId}/buy-orders?page=0&size=20
```

### 获取用户销售订单
```http
GET /orders/user/{userId}/sell-orders?page=0&size=20
```

### 按状态获取订单
```http
GET /orders/status/{status}?page=0&size=20
```

### 获取待处理订单
```http
GET /orders/pending?page=0&size=20
```

### 获取用户订单统计
```http
GET /orders/user/{userId}/stats
```

## 评价接口

### 创建评价
```http
POST /reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": 1,
  "rating": 5,
  "content": "string",
  "type": "BUYER_TO_SELLER"
}
```

### 获取评价详情
```http
GET /reviews/{id}
```

### 获取用户评价
```http
GET /reviews/user/{userId}?page=0&size=20
```

### 获取用户给出的评价
```http
GET /reviews/user/{userId}/given?page=0&size=20
```

### 获取我的评价
```http
GET /reviews/my-reviews?page=0&size=20
Authorization: Bearer {token}
```

### 获取我给出的评价
```http
GET /reviews/my-given-reviews?page=0&size=20
Authorization: Bearer {token}
```

### 获取订单评价
```http
GET /reviews/order/{orderId}
```

### 获取用户评价统计
```http
GET /reviews/user/{userId}/stats
```

### 获取我的评价统计
```http
GET /reviews/my-stats
Authorization: Bearer {token}
```

### 按类型获取评价
```http
GET /reviews/type/{type}?page=0&size=20
```

## 管理接口

### 获取仪表板统计数据
```http
GET /admin/dashboard/stats
Authorization: Bearer {admin_token}
```

**响应示例**:
```json
{
  "success": true,
  "message": "获取统计数据成功",
  "data": {
    "totalUsers": 100,
    "totalProducts": 500,
    "totalOrders": 200,
    "totalReviews": 150,
    "activeUsers": 80,
    "activeProducts": 400,
    "pendingOrders": 10,
    "totalTransactionAmount": 50000.00
  }
}
```

### 获取所有用户
```http
GET /admin/users?page=0&size=20
Authorization: Bearer {admin_token}
```

### 搜索用户
```http
GET /admin/users/search?keyword=test&page=0&size=20
Authorization: Bearer {admin_token}
```

### 更新用户信息
```http
PUT /admin/users/{userId}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "realName": "string",
  "phone": "string",
  "avatar": "string",
  "role": "USER",
  "status": "ACTIVE"
}
```

### 删除用户
```http
DELETE /admin/users/{userId}
Authorization: Bearer {admin_token}
```

### 获取所有商品
```http
GET /admin/products?page=0&size=20
Authorization: Bearer {admin_token}
```

### 更新商品状态
```http
PUT /admin/products/{productId}/status?status=ACTIVE
Authorization: Bearer {admin_token}
```

### 删除商品
```http
DELETE /admin/products/{productId}
Authorization: Bearer {admin_token}
```

### 获取所有订单
```http
GET /admin/orders?page=0&size=20
Authorization: Bearer {admin_token}
```

### 更新订单状态
```http
PUT /admin/orders/{orderId}/status?status=COMPLETED
Authorization: Bearer {admin_token}
```

### 获取用户统计信息
```http
GET /admin/users/{userId}/stats
Authorization: Bearer {admin_token}
```

### 获取系统统计信息
```http
GET /admin/system/stats
Authorization: Bearer {admin_token}
```

## 数据模型

### 用户模型 (User)
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "realName": "测试用户",
  "phone": "13800138000",
  "avatar": "avatar_url",
  "role": "USER",
  "status": "ACTIVE",
  "createdAt": "2023-12-01T10:00:00",
  "updatedAt": "2023-12-01T10:00:00"
}
```

### 商品模型 (Product)
```json
{
  "id": 1,
  "title": "商品标题",
  "description": "商品描述",
  "price": 100.00,
  "images": "image1.jpg,image2.jpg",
  "category": "ELECTRONICS",
  "status": "ACTIVE",
  "seller": {
    "id": 1,
    "username": "seller"
  },
  "buyer": null,
  "viewCount": 10,
  "likeCount": 5,
  "createdAt": "2023-12-01T10:00:00",
  "updatedAt": "2023-12-01T10:00:00"
}
```

### 订单模型 (Order)
```json
{
  "id": 1,
  "orderNumber": "ORD1703123456789",
  "product": {
    "id": 1,
    "title": "商品标题"
  },
  "buyer": {
    "id": 2,
    "username": "buyer"
  },
  "seller": {
    "id": 1,
    "username": "seller"
  },
  "amount": 100.00,
  "status": "PENDING",
  "remark": "备注信息",
  "createdAt": "2023-12-01T10:00:00",
  "updatedAt": "2023-12-01T10:00:00",
  "paidAt": null,
  "completedAt": null
}
```

### 评价模型 (Review)
```json
{
  "id": 1,
  "order": {
    "id": 1,
    "orderNumber": "ORD1703123456789"
  },
  "reviewer": {
    "id": 2,
    "username": "reviewer"
  },
  "reviewee": {
    "id": 1,
    "username": "reviewee"
  },
  "rating": 5,
  "content": "评价内容",
  "type": "BUYER_TO_SELLER",
  "createdAt": "2023-12-01T10:00:00",
  "updatedAt": "2023-12-01T10:00:00"
}
```

## 枚举值

### 用户角色 (UserRole)
- `USER`: 普通用户
- `MODERATOR`: 版主
- `ADMIN`: 管理员

### 用户状态 (UserStatus)
- `ACTIVE`: 激活
- `INACTIVE`: 未激活
- `BANNED`: 封禁
- `DELETED`: 已删除

### 商品分类 (ProductCategory)
- `ELECTRONICS`: 电子产品
- `BOOKS`: 图书教材
- `CLOTHING`: 服装配饰
- `SPORTS`: 运动用品
- `DAILY`: 生活用品
- `STUDY`: 学习用品
- `BEAUTY`: 美妆护肤
- `FOOD`: 食品饮料
- `OTHER`: 其他

### 商品状态 (ProductStatus)
- `ACTIVE`: 在售
- `SOLD`: 已售出
- `RESERVED`: 已预订
- `DELETED`: 已删除
- `BANNED`: 已下架

### 订单状态 (OrderStatus)
- `PENDING`: 待支付
- `PAID`: 已支付
- `SHIPPED`: 已发货
- `COMPLETED`: 已完成
- `CANCELLED`: 已取消
- `REFUNDED`: 已退款

### 评价类型 (ReviewType)
- `BUYER_TO_SELLER`: 买家评价卖家
- `SELLER_TO_BUYER`: 卖家评价买家

## 错误码

### HTTP状态码
- `200`: 成功
- `400`: 请求参数错误
- `401`: 未授权
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

### 错误响应格式
```json
{
  "success": false,
  "message": "错误信息",
  "data": null
}
```

## 分页响应格式

```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "content": [...],
    "pageable": {
      "sort": {
        "sorted": true,
        "unsorted": false
      },
      "pageNumber": 0,
      "pageSize": 20
    },
    "totalElements": 100,
    "totalPages": 5,
    "first": true,
    "last": false,
    "numberOfElements": 20
  }
}
```

## 认证说明

### JWT Token格式
```
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImlhdCI6MTcwMzEyMzQ1NiwibmFtZSI6InRlc3R1c2VyIn0...
```

### Token过期处理
当Token过期时，客户端需要重新登录获取新的Token。

## 限流说明

- 登录接口：每分钟最多5次尝试
- 注册接口：每分钟最多3次尝试
- 其他接口：每分钟最多100次请求

## 注意事项

1. 所有需要认证的接口都需要在请求头中携带JWT Token
2. 文件上传接口需要设置正确的Content-Type
3. 分页参数page从0开始
4. 时间格式统一使用ISO 8601格式
5. 金额字段使用BigDecimal类型，保留2位小数
