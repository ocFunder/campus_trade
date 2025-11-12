@echo off
chcp 65001 >nul
echo 🚀 开始执行数据库初始化脚本...

REM 数据库连接信息
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=campus_trade
set DB_USER=mri

REM 检查PostgreSQL是否安装
echo 📋 检查PostgreSQL安装...
where psql >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到PostgreSQL，请先安装PostgreSQL
    echo 💡 下载地址: https://www.postgresql.org/download/
    pause
    exit /b 1
)

echo ✅ PostgreSQL已安装

REM 创建数据库（如果不存在）
echo 📦 创建数据库 campus_trade...
createdb -h %DB_HOST% -p %DB_PORT% -U %DB_USER% %DB_NAME% 2>nul
if %errorlevel% neq 0 (
    echo ℹ️  数据库 campus_trade 已存在或创建失败
)

REM 执行初始化脚本
echo 🔧 执行数据库表结构初始化脚本...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f src\main\resources\sql\init.sql

if %errorlevel% equ 0 (
    echo ✅ 数据库表结构初始化完成
) else (
    echo ❌ 数据库表结构初始化失败
    pause
    exit /b 1
)

REM 执行示例数据脚本
echo 📊 导入示例数据...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f src\main\resources\sql\sample_data.sql

if %errorlevel% equ 0 (
    echo ✅ 示例数据导入完成
) else (
    echo ❌ 示例数据导入失败
    pause
    exit /b 1
)

echo.
echo 🎉 数据库初始化完成！
echo 📋 数据库信息：
echo    - 数据库名: campus_trade
echo    - 主机: %DB_HOST%
echo    - 端口: %DB_PORT%
echo    - 用户: %DB_USER%
echo.
echo 🔑 默认账户：
echo    - 管理员: admin / admin123
echo    - 测试用户: testuser1 / 123456
echo.
echo 🌐 现在可以启动应用程序了！
pause
