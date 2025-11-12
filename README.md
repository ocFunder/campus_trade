# 校园二手交易平台

一个基于SpringBoot+HTML+PostgreSQL的校园二手交易平台，提供用户认证、商品管理、交易处理、评价系统及后台管理等完整功能。
用户名ceshi 123456
     admin password 管理员用户可以通过左上角进入后台
     
## 项目特色

- 🎯 **模块化架构**：清晰的分层设计，易于维护和扩展
- 🔐 **安全认证**：基于JWT的用户认证和权限管理
- 📱 **响应式设计**：支持PC和移动端访问
- 🛒 **完整交易流程**：从商品发布到交易完成的完整闭环
- ⭐ **评价系统**：买卖双方互评，建立信任体系
- 👨‍💼 **后台管理**：管理员可管理用户、商品、订单等
- 🐳 **容器化部署**：支持Docker一键部署

## 技术栈

### 后端技术
- **Spring Boot 2.7.14** - 主框架
- **Spring Security** - 安全框架
- **Spring Data JPA** - 数据访问层
- **PostgreSQL** - 数据库
- **JWT** - 身份认证
- **Maven** - 项目管理

### 前端技术
- **HTML5 + CSS3** - 页面结构与样式
- **Bootstrap 5** - UI框架
- **JavaScript (ES6+)** - 交互逻辑
- **Font Awesome** - 图标库

### 部署技术
- **Docker** - 容器化
- **Docker Compose** - 多容器编排

## 功能模块

### 1. 用户认证模块
- ✅ 用户注册/登录
- ✅ JWT令牌认证
- ✅ 权限管理（用户/版主/管理员）
- ✅ 用户信息管理

### 2. 商品管理模块
- ✅ 商品发布/编辑/删除
- ✅ 商品分类管理
- ✅ 商品搜索与筛选
- ✅ 商品状态管理
- ✅ 图片上传支持

### 3. 交易处理模块
- ✅ 订单创建与管理
- ✅ 订单状态流转
- ✅ 交易流程控制
- ✅ 订单统计

### 4. 评价系统模块
- ✅ 买卖双方互评
- ✅ 评分统计
- ✅ 评价展示

### 5. 后台管理模块
- ✅ 用户管理
- ✅ 商品管理
- ✅ 订单管理
- ✅ 数据统计
- ✅ 系统监控

## 快速开始

### 环境要求

- Java 8+
- Maven 3.6+
- PostgreSQL 12+
- Docker & Docker Compose (可选)

### 本地开发

1. **克隆项目**
```bash
git clone <repository-url>
cd campus-second-hand-trade
```

2. **配置数据库**
```bash
# 创建数据库
createdb campus_trade

# 导入初始化脚本
psql -d campus_trade -f src/main/resources/sql/init.sql
psql -d campus_trade -f src/main/resources/sql/sample_data.sql
```

3. **配置应用**
```yaml
# 修改 src/main/resources/application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/campus_trade
    username: postgres
    password: postgres
```

4. **启动应用**
```bash
mvn spring-boot:run
```

5. **访问应用**
- 前端页面：http://localhost:8080
- API文档：http://localhost:8080/api

### Docker部署

1. **使用Docker Compose一键部署**
```bash
docker-compose up -d
```

2. **访问应用**
- 前端页面：http://localhost:8080
- 数据库：localhost:5432

## 项目结构

```
campus-second-hand-trade/
├── src/main/java/com/campus/trade/
│   ├── entity/                 # 实体类
│   ├── repository/             # 数据访问层
│   ├── service/                # 业务逻辑层
│   ├── controller/             # 控制器层
│   ├── dto/                    # 数据传输对象
│   ├── security/               # 安全配置
│   └── util/                   # 工具类
├── src/main/resources/
│   ├── static/                 # 静态资源
│   │   ├── css/               # 样式文件
│   │   ├── js/                # JavaScript文件
│   │   └── *.html             # HTML页面
│   ├── sql/                   # 数据库脚本
│   └── application.yml        # 应用配置
├── docker-compose.yml         # Docker编排文件
├── Dockerfile                 # Docker镜像构建文件
└── pom.xml                    # Maven配置
```

## API接口

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/me` - 获取当前用户信息

### 商品接口
- `GET /api/products` - 获取商品列表
- `POST /api/products` - 创建商品
- `GET /api/products/{id}` - 获取商品详情
- `PUT /api/products/{id}` - 更新商品
- `DELETE /api/products/{id}` - 删除商品

### 订单接口
- `GET /api/orders` - 获取订单列表
- `POST /api/orders` - 创建订单
- `GET /api/orders/{id}` - 获取订单详情
- `PUT /api/orders/{id}/status` - 更新订单状态

### 评价接口
- `GET /api/reviews` - 获取评价列表
- `POST /api/reviews` - 创建评价
- `GET /api/reviews/{id}` - 获取评价详情

### 管理接口
- `GET /api/admin/dashboard/stats` - 获取统计数据
- `GET /api/admin/users` - 获取用户列表
- `PUT /api/admin/users/{id}` - 更新用户信息

## 数据库设计

### 主要表结构

- **users** - 用户表
- **products** - 商品表
- **orders** - 订单表
- **reviews** - 评价表

### 关系说明

- 用户与商品：一对多（用户可发布多个商品）
- 商品与订单：一对多（商品可被多次购买）
- 订单与评价：一对多（一个订单可有多条评价）

## 配置说明

### 应用配置

```yaml
# JWT配置
jwt:
  secret: your-secret-key
  expiration: 86400000 # 24小时

# 文件上传配置
file:
  upload:
    path: /path/to/uploads/

# 数据库配置
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/campus_trade
    username: postgres
    password: postgres
```

### 安全配置

- JWT令牌有效期：24小时
- 密码加密：BCrypt
- 跨域支持：已配置
- 权限控制：基于角色的访问控制

## 部署指南

### 生产环境部署

1. **环境准备**
```bash
# 安装Java 8+
sudo apt update
sudo apt install openjdk-8-jdk

# 安装PostgreSQL
sudo apt install postgresql postgresql-contrib

# 安装Nginx（可选）
sudo apt install nginx
```

2. **数据库配置**
```bash
# 创建数据库和用户
sudo -u postgres psql
CREATE DATABASE campus_trade;
CREATE USER campus_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE campus_trade TO campus_user;
```

3. **应用部署**
```bash
# 构建应用
mvn clean package -DskipTests

# 运行应用
java -jar target/campus-second-hand-trade-1.0.0.jar
```

### Docker部署

```bash
# 构建镜像
docker build -t campus-trade .

# 运行容器
docker run -d -p 8080:8080 --name campus-trade campus-trade
```

## 开发指南

### 代码规范

- 使用Java 8特性
- 遵循Spring Boot最佳实践
- 统一异常处理
- 完整的API文档

### 测试

```bash
# 运行单元测试
mvn test

# 运行集成测试
mvn verify
```

### 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 常见问题

### Q: 如何修改数据库连接？
A: 修改`src/main/resources/application.yml`中的数据库配置。

### Q: 如何添加新的商品分类？
A: 在`ProductCategory`枚举中添加新的分类。

### Q: 如何自定义JWT密钥？
A: 修改`application.yml`中的`jwt.secret`配置。

### Q: 如何部署到云服务器？
A: 参考部署指南，建议使用Docker部署。

## 许可证

本项目采用MIT许可证，详情请参阅[LICENSE](LICENSE)文件。

## 联系方式

- 项目维护者：[Your Name]
- 邮箱：[your.email@example.com]
- 项目地址：[GitHub Repository URL]

## 更新日志

### v1.0.0 (2023-12-15)
- ✅ 初始版本发布
- ✅ 完成所有核心功能
- ✅ 支持Docker部署
- ✅ 完整的API接口
- ✅ 响应式前端界面

---

**注意**：这是一个演示项目，生产环境使用前请进行充分的安全测试和性能优化。
