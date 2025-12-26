#!/bin/bash

# 智慧酒店CRM系统 - 本地开发启动脚本

echo "========================================"
echo "  智慧酒店CRM系统 - 本地开发环境启动"
echo "========================================"
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

echo "✓ Node.js 版本: $(node -v)"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

echo "✓ npm 版本: $(npm -v)"

# 检查MySQL
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL未安装或未在PATH中"
    echo "   请确保MySQL已安装并正在运行"
fi

echo ""
echo "开始启动开发环境..."
echo ""

# 后端
echo "1️⃣  准备后端服务..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "   📦 安装后端依赖..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "   📝 创建环境变量文件..."
    cp .env.example .env
    echo "   ⚠️  请编辑 backend/.env 配置数据库连接！"
fi

echo "   🚀 启动后端服务 (http://localhost:3000)..."
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "   后端进程 PID: $BACKEND_PID"

cd ..

# 等待后端启动
echo "   ⏳ 等待后端服务启动..."
sleep 3

# 前端
echo ""
echo "2️⃣  准备前端服务..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "   📦 安装前端依赖..."
    npm install
fi

echo "   🚀 启动前端服务 (http://localhost:5173)..."
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   前端进程 PID: $FRONTEND_PID"

cd ..

echo ""
echo "========================================"
echo "✅ 开发环境启动成功！"
echo "========================================"
echo ""
echo "📍 访问地址:"
echo "   前端: http://localhost:5173"
echo "   后端: http://localhost:3000"
echo ""
echo "🔐 默认账号:"
echo "   用户名: admin"
echo "   密码: admin123"
echo ""
echo "📋 进程信息:"
echo "   后端PID: $BACKEND_PID"
echo "   前端PID: $FRONTEND_PID"
echo ""
echo "📝 日志文件:"
echo "   后端: backend.log"
echo "   前端: frontend.log"
echo ""
echo "🛑 停止服务:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "========================================"
echo ""

# 保存PID到文件
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

echo "按 Ctrl+C 可停止服务"
echo ""

# 等待用户中断
trap "echo ''; echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; rm -f .backend.pid .frontend.pid; echo '✅ 服务已停止'; exit" INT

# 持续等待
wait
