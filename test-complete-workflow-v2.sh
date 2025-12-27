#!/bin/bash

# AijlCRM 完整业务流程测试脚本 V2
# 测试从线索到售后的完整业务链路
# 显示完整响应并验证数据

BASE_URL="http://localhost:3000/api"
TOKEN=""
TEST_DIR="/tmp/crm-test-$(date +%s)"

mkdir -p $TEST_DIR

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "================================"
echo "AijlCRM 完整业务流程测试 V2"
echo "================================"
echo ""

# 测试1: 用户登录
echo -e "${YELLOW}[1/12] 测试用户登录...${NC}"
curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "123456"
  }' > $TEST_DIR/01-login.json

cat $TEST_DIR/01-login.json | python3 -m json.tool 2>/dev/null | head -10

TOKEN=$(cat $TEST_DIR/01-login.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ 登录失败${NC}"
  cat $TEST_DIR/01-login.json
  exit 1
else
  echo -e "${GREEN}✓ 登录成功${NC}"
fi
echo ""

# 测试2: 创建产品分类
echo -e "${YELLOW}[2/12] 测试创建产品分类...${NC}"
curl -s -X POST "${BASE_URL}/products/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "category_name": "智能门锁",
    "category_code": "smart-lock",
    "description": "智能门锁系列产品"
  }' > $TEST_DIR/02-category.json

cat $TEST_DIR/02-category.json | python3 -m json.tool 2>/dev/null | head -15

CATEGORY_ID=$(cat $TEST_DIR/02-category.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('categoryId', ''))" 2>/dev/null)

if [ -z "$CATEGORY_ID" ]; then
  echo -e "${RED}✗ 产品分类创建失败${NC}"
else
  echo -e "${GREEN}✓ 产品分类创建成功，ID: $CATEGORY_ID${NC}"
fi
echo ""

# 测试3: 创建产品
echo -e "${YELLOW}[3/12] 测试创建产品...${NC}"
curl -s -X POST "${BASE_URL}/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"product_code\": \"LOCK-$(date +%s)\",
    \"product_name\": \"智能门锁 Pro\",
    \"brand\": \"艾居来\",
    \"category_id\": $CATEGORY_ID,
    \"cost_price\": 500.00,
    \"sale_price\": 800.00,
    \"unit\": \"台\",
    \"description\": \"高端智能门锁\"
  }" > $TEST_DIR/03-product.json

cat $TEST_DIR/03-product.json | python3 -m json.tool 2>/dev/null | head -15

PRODUCT_ID=$(cat $TEST_DIR/03-product.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('productId', ''))" 2>/dev/null)

if [ -z "$PRODUCT_ID" ]; then
  echo -e "${RED}✗ 产品创建失败${NC}"
else
  echo -e "${GREEN}✓ 产品创建成功，ID: $PRODUCT_ID${NC}"
fi
echo ""

# 测试4: 创建线索
echo -e "${YELLOW}[4/12] 测试创建线索...${NC}"
curl -s -X POST "${BASE_URL}/leads" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "customerName": "张经理",
    "hotelName": "测试酒店-V2-'$(date +%H%M%S)'",
    "phone": "13800138002",
    "channelSource": "网络推广",
    "salesOwnerId": 1,
    "province": "广东省",
    "city": "深圳市"
  }' > $TEST_DIR/04-lead.json

cat $TEST_DIR/04-lead.json | python3 -m json.tool 2>/dev/null | head -15

LEAD_ID=$(cat $TEST_DIR/04-lead.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('leadId', ''))" 2>/dev/null)
LEAD_NO=$(cat $TEST_DIR/04-lead.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('leadNo', ''))" 2>/dev/null)

if [ -z "$LEAD_ID" ]; then
  echo -e "${RED}✗ 线索创建失败${NC}"
else
  echo -e "${GREEN}✓ 线索创建成功，ID: $LEAD_ID, 编号: $LEAD_NO${NC}"
fi
echo ""

echo "================================"
echo "测试数据保存在: $TEST_DIR"
echo "================================"
echo ""
echo "数据汇总:"
echo "  - 分类ID: $CATEGORY_ID"
echo "  - 产品ID: $PRODUCT_ID"
echo "  - 线索ID: $LEAD_ID"
echo "  - 线索编号: $LEAD_NO"
echo ""
