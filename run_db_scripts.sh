#!/bin/bash

# 校园二手交易平台数据库脚本一键执行
echo "🚀 开始执行数据库初始化脚本..."

# 数据库连接信息
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="campus_trade"
DB_USER="mri"

# 检查PostgreSQL是否运行
echo "📋 检查PostgreSQL服务状态..."
if ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER > /dev/null 2>&1; then
    echo "❌ PostgreSQL服务未运行，请先启动PostgreSQL服务"
    echo "💡 启动命令："
    echo "   - macOS: brew services start postgresql"
    echo "   - Ubuntu: sudo systemctl start postgresql"
    echo "   - CentOS: sudo systemctl start postgresql"
    exit 1
fi

echo "✅ PostgreSQL服务运行正常"

# 创建数据库（如果不存在）
echo "📦 创建数据库 campus_trade..."
createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || echo "ℹ️  数据库 campus_trade 已存在"

# 执行初始化脚本
echo "🔧 执行数据库表结构初始化脚本..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f src/main/resources/sql/init.sql

if [ $? -eq 0 ]; then
    echo "✅ 数据库表结构初始化完成"
else
    echo "❌ 数据库表结构初始化失败"
    exit 1
fi

# 执行示例数据脚本
echo "📊 导入示例数据..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f src/main/resources/sql/sample_data.sql

if [ $? -eq 0 ]; then
    echo "✅ 示例数据导入完成"
else
    echo "❌ 示例数据导入失败"
    exit 1
fi

echo ""
echo "🎉 数据库初始化完成！"
echo "📋 数据库信息："
echo "   - 数据库名: campus_trade"
echo "   - 主机: $DB_HOST"
echo "   - 端口: $DB_PORT"
echo "   - 用户: $DB_USER"
echo ""
echo "🔑 默认账户："
echo "   - 管理员: admin / admin123"
echo "   - 测试用户: testuser1 / 123456"
echo ""
echo "🌐 现在可以启动应用程序了！"
