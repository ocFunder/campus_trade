# 部署指南

## 部署方式

本项目支持多种部署方式，包括本地开发、Docker容器化部署和生产环境部署。

## 1. 本地开发部署

### 环境要求
- Java 8+
- Maven 3.6+
- PostgreSQL 12+
- Node.js 14+ (可选，用于前端构建)

### 步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd campus-second-hand-trade
```

2. **安装PostgreSQL**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql

# macOS
brew install postgresql
brew services start postgresql
```

3. **创建数据库**
```bash
sudo -u postgres psql
CREATE DATABASE campus_trade;
CREATE USER campus_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE campus_trade TO campus_user;
\q
```

4. **导入数据库脚本**
```bash
psql -d campus_trade -U campus_user -f src/main/resources/sql/init.sql
psql -d campus_trade -U campus_user -f src/main/resources/sql/sample_data.sql
```

5. **配置应用**
```yaml
# 修改 src/main/resources/application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/campus_trade
    username: campus_user
    password: your_password
```

6. **启动应用**
```bash
mvn spring-boot:run
```

7. **访问应用**
- 前端页面：http://localhost:8080
- API接口：http://localhost:8080/api

## 2. Docker部署

### 使用Docker Compose（推荐）

1. **准备Docker环境**
```bash
# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **启动服务**
```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f app
```

3. **访问应用**
- 前端页面：http://localhost:8080
- 数据库：localhost:5432

### 手动Docker部署

1. **构建镜像**
```bash
docker build -t campus-trade:latest .
```

2. **启动PostgreSQL**
```bash
docker run -d \
  --name campus-trade-db \
  -e POSTGRES_DB=campus_trade \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:13
```

3. **启动应用**
```bash
docker run -d \
  --name campus-trade-app \
  --link campus-trade-db:postgres \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/campus_trade \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=postgres \
  -p 8080:8080 \
  -v $(pwd)/uploads:/app/uploads \
  campus-trade:latest
```

## 3. 生产环境部署

### 服务器要求
- CPU: 2核心以上
- 内存: 4GB以上
- 存储: 50GB以上
- 操作系统: Ubuntu 20.04+ / CentOS 8+

### 部署步骤

1. **安装Java环境**
```bash
# Ubuntu
sudo apt update
sudo apt install openjdk-8-jdk

# CentOS
sudo yum install java-1.8.0-openjdk java-1.8.0-openjdk-devel
```

2. **安装PostgreSQL**
```bash
# Ubuntu
sudo apt install postgresql postgresql-contrib

# CentOS
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

3. **配置PostgreSQL**
```bash
# 编辑配置文件
sudo nano /etc/postgresql/12/main/postgresql.conf
# 修改 listen_addresses = '*'

sudo nano /etc/postgresql/12/main/pg_hba.conf
# 添加 host all all 0.0.0.0/0 md5

# 重启服务
sudo systemctl restart postgresql
```

4. **创建数据库和用户**
```bash
sudo -u postgres psql
CREATE DATABASE campus_trade;
CREATE USER campus_user WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE campus_trade TO campus_user;
\q
```

5. **导入数据库脚本**
```bash
psql -h localhost -d campus_trade -U campus_user -f src/main/resources/sql/init.sql
psql -h localhost -d campus_trade -U campus_user -f src/main/resources/sql/sample_data.sql
```

6. **构建应用**
```bash
mvn clean package -DskipTests
```

7. **创建应用目录**
```bash
sudo mkdir -p /opt/campus-trade
sudo cp target/campus-second-hand-trade-1.0.0.jar /opt/campus-trade/
sudo mkdir -p /opt/campus-trade/uploads
sudo chown -R campus-trade:campus-trade /opt/campus-trade
```

8. **创建系统服务**
```bash
sudo nano /etc/systemd/system/campus-trade.service
```

```ini
[Unit]
Description=Campus Second Hand Trade Application
After=network.target postgresql.service

[Service]
Type=simple
User=campus-trade
Group=campus-trade
WorkingDirectory=/opt/campus-trade
ExecStart=/usr/bin/java -jar campus-second-hand-trade-1.0.0.jar
Restart=always
RestartSec=10
Environment=SPRING_PROFILES_ACTIVE=prod
Environment=SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/campus_trade
Environment=SPRING_DATASOURCE_USERNAME=campus_user
Environment=SPRING_DATASOURCE_PASSWORD=strong_password

[Install]
WantedBy=multi-user.target
```

9. **启动服务**
```bash
sudo systemctl daemon-reload
sudo systemctl start campus-trade
sudo systemctl enable campus-trade
sudo systemctl status campus-trade
```

### 配置Nginx反向代理

1. **安装Nginx**
```bash
sudo apt install nginx
```

2. **配置Nginx**
```bash
sudo nano /etc/nginx/sites-available/campus-trade
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        alias /opt/campus-trade/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

3. **启用配置**
```bash
sudo ln -s /etc/nginx/sites-available/campus-trade /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 配置SSL证书

1. **安装Certbot**
```bash
sudo apt install certbot python3-certbot-nginx
```

2. **获取SSL证书**
```bash
sudo certbot --nginx -d your-domain.com
```

3. **自动续期**
```bash
sudo crontab -e
# 添加 0 12 * * * /usr/bin/certbot renew --quiet
```

## 4. 云服务器部署

### 阿里云ECS部署

1. **创建ECS实例**
- 选择Ubuntu 20.04系统
- 配置2核4GB内存
- 开放8080端口

2. **连接服务器**
```bash
ssh root@your-server-ip
```

3. **按照生产环境部署步骤操作**

### 腾讯云CVM部署

1. **创建CVM实例**
- 选择Ubuntu 20.04系统
- 配置2核4GB内存
- 配置安全组开放8080端口

2. **连接服务器**
```bash
ssh ubuntu@your-server-ip
```

3. **按照生产环境部署步骤操作**

## 5. 监控和日志

### 应用监控

1. **安装监控工具**
```bash
# 安装htop
sudo apt install htop

# 安装iotop
sudo apt install iotop
```

2. **配置日志轮转**
```bash
sudo nano /etc/logrotate.d/campus-trade
```

```
/opt/campus-trade/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 campus-trade campus-trade
    postrotate
        systemctl reload campus-trade
    endscript
}
```

### 数据库监控

1. **配置PostgreSQL日志**
```bash
sudo nano /etc/postgresql/12/main/postgresql.conf
```

```
log_destination = 'stderr'
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_min_duration_statement = 1000
```

2. **重启PostgreSQL**
```bash
sudo systemctl restart postgresql
```

## 6. 备份和恢复

### 数据库备份

1. **创建备份脚本**
```bash
sudo nano /opt/backup/backup_db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backup"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="campus_trade"
DB_USER="campus_user"

mkdir -p $BACKUP_DIR
pg_dump -h localhost -U $DB_USER -d $DB_NAME > $BACKUP_DIR/campus_trade_$DATE.sql
gzip $BACKUP_DIR/campus_trade_$DATE.sql

# 删除7天前的备份
find $BACKUP_DIR -name "campus_trade_*.sql.gz" -mtime +7 -delete
```

2. **设置定时备份**
```bash
sudo chmod +x /opt/backup/backup_db.sh
sudo crontab -e
# 添加 0 2 * * * /opt/backup/backup_db.sh
```

### 应用备份

1. **创建应用备份脚本**
```bash
sudo nano /opt/backup/backup_app.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backup"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/opt/campus-trade"

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/campus_trade_app_$DATE.tar.gz -C $APP_DIR .

# 删除30天前的备份
find $BACKUP_DIR -name "campus_trade_app_*.tar.gz" -mtime +30 -delete
```

## 7. 性能优化

### JVM优化

1. **修改启动参数**
```bash
sudo nano /etc/systemd/system/campus-trade.service
```

```ini
ExecStart=/usr/bin/java -Xms512m -Xmx2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -jar campus-second-hand-trade-1.0.0.jar
```

### 数据库优化

1. **配置PostgreSQL参数**
```bash
sudo nano /etc/postgresql/12/main/postgresql.conf
```

```
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
```

2. **重启PostgreSQL**
```bash
sudo systemctl restart postgresql
```

## 8. 故障排除

### 常见问题

1. **应用启动失败**
```bash
# 查看日志
sudo journalctl -u campus-trade -f

# 检查端口占用
sudo netstat -tlnp | grep 8080
```

2. **数据库连接失败**
```bash
# 检查PostgreSQL状态
sudo systemctl status postgresql

# 检查连接
psql -h localhost -U campus_user -d campus_trade
```

3. **内存不足**
```bash
# 查看内存使用
free -h
htop

# 调整JVM参数
sudo systemctl edit campus-trade
```

### 日志分析

1. **应用日志**
```bash
tail -f /opt/campus-trade/logs/application.log
```

2. **系统日志**
```bash
sudo journalctl -u campus-trade --since "1 hour ago"
```

## 9. 安全配置

### 防火墙配置

```bash
# 安装ufw
sudo apt install ufw

# 配置防火墙
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 数据库安全

```bash
# 修改默认端口
sudo nano /etc/postgresql/12/main/postgresql.conf
# port = 5433

# 限制连接
sudo nano /etc/postgresql/12/main/pg_hba.conf
# host all all 127.0.0.1/32 md5
```

## 10. 更新部署

### 应用更新

1. **停止服务**
```bash
sudo systemctl stop campus-trade
```

2. **备份当前版本**
```bash
sudo cp /opt/campus-trade/campus-second-hand-trade-1.0.0.jar /opt/backup/
```

3. **部署新版本**
```bash
sudo cp target/campus-second-hand-trade-1.0.1.jar /opt/campus-trade/
```

4. **启动服务**
```bash
sudo systemctl start campus-trade
```

### 数据库更新

1. **备份数据库**
```bash
/opt/backup/backup_db.sh
```

2. **执行更新脚本**
```bash
psql -h localhost -U campus_user -d campus_trade -f update.sql
```

3. **验证更新**
```bash
psql -h localhost -U campus_user -d campus_trade -c "SELECT version();"
```
