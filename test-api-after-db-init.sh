#!/bin/bash

echo "================================"
echo "测试数据库初始化后的API状态"
echo "================================"
echo ""

# 1. 登录获取token
echo "1. 登录获取token..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ 登录失败"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "✅ 登录成功，Token已获取"
echo ""

# 2. 测试各个API
echo "2. 测试各个API..."
echo ""

# 测试产品API
echo -n "   产品API: "
PRODUCTS=$(curl -s "http://localhost:3000/api/products?page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN")
if echo "$PRODUCTS" | grep -q '"success":true'; then
  echo "✅ 通过"
else
  echo "❌ 失败"
  echo "   $PRODUCTS"
fi

# 测试客户API
echo -n "   客户API: "
CUSTOMERS=$(curl -s "http://localhost:3000/api/customers?page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN")
if echo "$CUSTOMERS" | grep -q '"success":true'; then
  echo "✅ 通过"
else
  echo "❌ 失败"
  echo "   $CUSTOMERS"
fi

# 测试线索API
echo -n "   线索API: "
LEADS=$(curl -s "http://localhost:3000/api/leads?page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN")
if echo "$LEADS" | grep -q '"success":true'; then
  echo "✅ 通过"
else
  echo "❌ 失败"
  echo "   $LEADS"
fi

# 测试报价API
echo -n "   报价API: "
QUOTATIONS=$(curl -s "http://localhost:3000/api/quotations?page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN")
if echo "$QUOTATIONS" | grep -q '"success":true'; then
  echo "✅ 通过"
else
  echo "❌ 失败"
  echo "   $QUOTATIONS"
fi

# 测试合同API
echo -n "   合同API: "
CONTRACTS=$(curl -s "http://localhost:3000/api/contracts?page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN")
if echo "$CONTRACTS" | grep -q '"success":true'; then
  echo "✅ 通过"
else
  echo "❌ 失败"
  echo "   $CONTRACTS"
fi

echo ""
echo "================================"
echo "测试完成"
echo "================================"
