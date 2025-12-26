#!/bin/bash

# 使用Docker快速启动MySQL数据库

set -e

echo "🐳 使用Docker启动MySQL数据库..."
echo "================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 读取后端.env配置
if [ -f "backend/.env" ]; then
    source backend/.env
else
    echo -e "${RED}❌ 找不到 backend/.env 文件${NC}"
    exit 1
fi

# MySQL配置
CONTAINER_NAME="aijulai-crm-mysql"
MYSQL_ROOT_PASSWORD=${DB_PASSWORD:-""}
MYSQL_DATABASE=${DB_NAME:-"aijulai_crm"}
MYSQL_PORT=${DB_PORT:-3306}

echo "📋 配置信息："
echo "   容器名称: $CONTAINER_NAME"
echo "   数据库名: $MYSQL_DATABASE"
echo "   端口: $MYSQL_PORT"
echo "   Root密码: ${MYSQL_ROOT_PASSWORD:-'(空)'}"
echo ""

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker守护进程未运行${NC}"
    echo "请先启动Docker Desktop"
    echo ""
    echo "或者手动启动Docker守护进程："
    echo "  open -a Docker"
    exit 1
fi

# 检查容器是否已存在
if docker ps -a | grep -q $CONTAINER_NAME; then
    echo -e "${YELLOW}⚠️  MySQL容器已存在${NC}"

    # 检查容器状态
    if docker ps | grep -q $CONTAINER_NAME; then
        echo -e "${GREEN}✅ MySQL容器正在运行${NC}"
    else
        echo "启动已存在的容器..."
        docker start $CONTAINER_NAME
        echo -e "${GREEN}✅ MySQL容器已启动${NC}"
    fi
else
    echo "创建并启动MySQL容器..."

    # 创建并启动MySQL容器
    if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
        docker run -d \
            --name $CONTAINER_NAME \
            -p $MYSQL_PORT:3306 \
            -e MYSQL_ALLOW_EMPTY_PASSWORD=yes \
            -e MYSQL_DATABASE=$MYSQL_DATABASE \
            -e MYSQL_ROOT_HOST=% \
            mysql:8.0 \
            --character-set-server=utf8mb4 \
            --collation-server=utf8mb4_unicode_ci \
            --default-authentication-plugin=mysql_native_password
    else
        docker run -d \
            --name $CONTAINER_NAME \
            -p $MYSQL_PORT:3306 \
            -e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
            -e MYSQL_DATABASE=$MYSQL_DATABASE \
            -e MYSQL_ROOT_HOST=% \
            mysql:8.0 \
            --character-set-server=utf8mb4 \
            --collation-server=utf8mb4_unicode_ci \
            --default-authentication-plugin=mysql_native_password
    fi

    echo -e "${GREEN}✅ MySQL容器已创建并启动${NC}"
fi

echo ""
echo "⏳ 等待MySQL启动..."
sleep 10

# 测试连接
echo "🔍 测试数据库连接..."
if docker exec $CONTAINER_NAME mysql -uroot ${MYSQL_ROOT_PASSWORD:+-p$MYSQL_ROOT_PASSWORD} -e "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 数据库连接成功${NC}"
else
    echo -e "${RED}❌ 数据库连接失败${NC}"
    echo "查看容器日志："
    docker logs $CONTAINER_NAME
    exit 1
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ MySQL数据库已就绪！${NC}"
echo ""
echo "📝 连接信息："
echo "   主机: localhost"
echo "   端口: $MYSQL_PORT"
echo "   用户: root"
echo "   密码: ${MYSQL_ROOT_PASSWORD:-'(空)'}"
echo "   数据库: $MYSQL_DATABASE"
echo ""
echo "🔧 管理命令："
echo "   停止容器: docker stop $CONTAINER_NAME"
echo "   启动容器: docker start $CONTAINER_NAME"
echo "   删除容器: docker rm -f $CONTAINER_NAME"
echo "   查看日志: docker logs $CONTAINER_NAME"
echo "   进入MySQL: docker exec -it $CONTAINER_NAME mysql -uroot ${MYSQL_ROOT_PASSWORD:+-p$MYSQL_ROOT_PASSWORD} $MYSQL_DATABASE"
echo ""
echo "🎯 下一步："
echo "   cd backend"
echo "   node scripts/init-database.js"
echo "   node scripts/seed-data.js"
echo ""
