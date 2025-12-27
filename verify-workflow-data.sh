#!/bin/bash

echo "================================"
echo "验证完整业务流程数据"
echo "================================"
echo ""

# 登录获取token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ 登录失败"
  exit 1
fi

echo "✅ 登录成功"
echo ""

# 1. 查询线索
echo "1. 查询线索数据..."
LEADS=$(curl -s "http://localhost:3000/api/leads?page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN")
echo "$LEADS" | grep -o '"hotelName":"[^"]*"' | head -3
echo ""

# 2. 查询客户
echo "2. 查询客户数据..."
CUSTOMERS=$(curl -s "http://localhost:3000/api/customers?page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN")
echo "$CUSTOMERS" | grep -o '"customerName":"[^"]*"' | head -3
echo ""

# 3. 查询产品
echo "3. 查询产品数据..."
PRODUCTS=$(curl -s "http://localhost:3000/api/products?page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN")
echo "$PRODUCTS" | grep -o '"productName":"[^"]*"' | head -3
echo ""

# 4. 查询合同
echo "4. 查询合同数据..."
CONTRACTS=$(curl -s "http://localhost:3000/api/contracts?page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN")
echo "$CONTRACTS" | grep -o '"contractNo":"[^"]*"' | head -3
CONTRACT_NO=$(echo "$CONTRACTS" | grep -o '"contractNo":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "  最新合同编号: $CONTRACT_NO"
echo ""

# 5. 查询发货单
echo "5. 查询发货单数据..."
SHIPMENTS=$(curl -s "http://localhost:3000/api/shipments?page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN")
echo "$SHIPMENTS" | grep -o '"shipmentNo":"[^"]*"' | head -3
echo ""

# 6. 查询收款记录
echo "6. 查询收款记录..."
PAYMENTS=$(curl -s "http://localhost:3000/api/payments?page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN")
echo "$PAYMENTS" | grep -o '"paymentNo":"[^"]*"' | head -3
echo ""

# 7. 查询发票
echo "7. 查询发票数据..."
INVOICES=$(curl -s "http://localhost:3000/api/invoices?page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN")
echo "$INVOICES" | grep -o '"invoiceNo":"[^"]*"' | head -3
echo ""

# 8. 查询售后工单
echo "8. 查询售后工单..."
TICKETS=$(curl -s "http://localhost:3000/api/service-tickets?page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN")
echo "$TICKETS" | grep -o '"ticketNo":"[^"]*"' | head -3
echo ""

# 9. 测试线索跟踪功能
echo "9. 测试线索跟踪功能..."
if [ ! -z "$CONTRACT_NO" ]; then
  # 获取最新线索ID
  LEAD_ID=$(echo "$LEADS" | grep -o '"leadId":[0-9]*' | head -1 | cut -d':' -f2)

  if [ ! -z "$LEAD_ID" ]; then
    echo "  测试为线索 $LEAD_ID 添加跟踪记录..."
    FOLLOWUP=$(curl -s -X POST "http://localhost:3000/api/leads/follow-ups" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{
        \"leadId\": $LEAD_ID,
        \"followUpType\": \"phone_call\",
        \"followUpContent\": \"电话沟通，客户对产品很感兴趣，约定下周见面详谈\",
        \"nextFollowUpDate\": \"$(date -v+7d '+%Y-%m-%d' 2>/dev/null || date -d '+7 days' '+%Y-%m-%d')\"
      }")

    if echo "$FOLLOWUP" | grep -q '"success":true'; then
      echo "  ✅ 跟踪记录创建成功"
    else
      echo "  ❌ 跟踪记录创建失败"
      echo "  $FOLLOWUP"
    fi
  fi
fi
echo ""

echo "================================"
echo "数据验证完成"
echo "================================"
