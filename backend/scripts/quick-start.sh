#!/bin/bash

# 艾居来CRM后端快速启动脚本

set -e

echo "🚀 艾居来CRM后端 - 快速启动"
echo "================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 错误: 未检测到Node.js${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js版本: $(node --version)${NC}"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ 错误: 未检测到npm${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm版本: $(npm --version)${NC}"
echo ""

# 检查MySQL
echo "🔍 检查MySQL..."
if command -v mysql &> /dev/null; then
    echo -e "${GREEN}✅ MySQL已安装${NC}"
else
    echo -e "${YELLOW}⚠️  警告: 未检测到MySQL，请先安装MySQL${NC}"
    echo "   macOS: brew install mysql"
    echo "   启动: brew services start mysql"
fi

echo ""

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
    echo ""
fi

# 检查.env文件
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env文件不存在，从.env.example复制${NC}"
    cp .env.example .env
    echo -e "${BLUE}请编辑.env文件配置数据库信息${NC}"
    exit 1
fi

# 检查uploads目录
if [ ! -d "uploads/temp" ]; then
    echo "📁 创建uploads目录..."
    mkdir -p uploads/temp
    chmod -R 755 uploads
fi

# 读取数据库配置
source .env

# 检查数据库是否存在
echo "🗄️  检查数据库..."
DB_EXISTS=$(mysql -u${DB_USER} -p${DB_PASSWORD} -e "SHOW DATABASES LIKE '${DB_NAME}';" 2>/dev/null | grep -v Database || true)

if [ -z "$DB_EXISTS" ]; then
    echo -e "${YELLOW}⚠️  数据库${DB_NAME}不存在${NC}"
    read -p "是否创建数据库？ (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📊 创建数据库..."
        mysql -u${DB_USER} -p${DB_PASSWORD} -e "CREATE DATABASE ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        echo -e "${GREEN}✅ 数据库创建成功${NC}"

        echo "📋 初始化数据库表..."
        node scripts/init-database.js

        echo "🌱 创建测试数据..."
        node scripts/seed-data.js
    else
        echo -e "${RED}❌ 需要数据库才能启动服务${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ 数据库${DB_NAME}已存在${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ 准备完成！${NC}"
echo ""
echo "🎯 启动选项："
echo "   1. npm run dev    - 开发模式（自动重启）"
echo "   2. npm start      - 生产模式"
echo ""

read -p "是否立即启动开发服务器？ (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 启动开发服务器..."
    echo "================================"
    npm run dev
else
    echo ""
    echo "💡 提示：运行 'npm run dev' 启动服务器"
fi
