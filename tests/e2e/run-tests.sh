#!/bin/bash

# 艾居来CRM系统 E2E测试运行脚本

set -e

echo "🚀 艾居来CRM系统 E2E自动化测试"
echo "================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 错误: 未检测到Node.js，请先安装Node.js${NC}"
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

# 检查前端服务
echo "🔍 检查前端服务..."
if curl -s http://localhost:5173 > /dev/null; then
    echo -e "${GREEN}✅ 前端服务正常运行 (http://localhost:5173)${NC}"
else
    echo -e "${YELLOW}⚠️  警告: 前端服务未运行，请先启动前端服务${NC}"
    echo "   cd frontend && npm run dev"
    exit 1
fi

# 检查后端服务
echo "🔍 检查后端服务..."
if curl -s http://localhost:3000/api > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 后端服务正常运行 (http://localhost:3000)${NC}"
else
    echo -e "${YELLOW}⚠️  警告: 后端服务未运行或无法访问${NC}"
    echo "   建议先启动后端服务: cd backend && npm run dev"
fi

echo ""

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装测试依赖..."
    npm install
    echo ""
fi

# 检查Playwright浏览器
if [ ! -d "$HOME/.cache/ms-playwright" ]; then
    echo "🌐 安装Playwright浏览器..."
    npm run install
    echo ""
fi

# 创建截图目录
mkdir -p test-results/screenshots

# 运行测试
echo "🧪 开始执行E2E测试..."
echo "================================"
echo ""

# 根据参数选择运行模式
case "$1" in
    "headed")
        echo "运行模式: 有头模式（可见浏览器）"
        npm run test:headed
        ;;
    "debug")
        echo "运行模式: 调试模式"
        npm run test:debug
        ;;
    "single")
        if [ -z "$2" ]; then
            echo -e "${RED}❌ 错误: 请指定测试文件${NC}"
            echo "用法: ./run-tests.sh single specs/01-login.spec.js"
            exit 1
        fi
        echo "运行模式: 单个测试文件 - $2"
        npx playwright test "$2"
        ;;
    *)
        echo "运行模式: 无头模式（后台运行）"
        npm test
        ;;
esac

TEST_EXIT_CODE=$?

echo ""
echo "================================"

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ 测试执行完成！${NC}"
    echo ""
    echo "📊 查看测试报告:"
    echo "   npm run test:report"
    echo ""
    echo "📸 截图位置:"
    echo "   test-results/screenshots/"
else
    echo -e "${RED}❌ 测试执行失败！${NC}"
    echo ""
    echo "📊 查看详细报告:"
    echo "   npm run test:report"
    echo ""
    echo "🔍 调试建议:"
    echo "   1. 运行调试模式: ./run-tests.sh debug"
    echo "   2. 查看截图: test-results/screenshots/"
    echo "   3. 查看视频: test-results/videos/"
fi

echo ""
exit $TEST_EXIT_CODE
