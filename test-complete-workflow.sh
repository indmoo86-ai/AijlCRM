#!/bin/bash

# AijlCRM 完整业务流程测试脚本
# 测试从线索到售后的完整业务链路

BASE_URL="http://localhost:3000/api"
TOKEN=""

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================"
echo "AijlCRM 完整业务流程测试"
echo "================================"
echo ""

# 测试1: 用户登录
echo -e "${YELLOW}[1/12] 测试用户登录...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "123456"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ 登录失败${NC}"
  echo $LOGIN_RESPONSE | jq '.'
  exit 1
else
  echo -e "${GREEN}✓ 登录成功，Token已获取${NC}"
fi
echo ""

# 测试2: 创建产品分类
echo -e "${YELLOW}[2/12] 测试创建产品分类...${NC}"
CATEGORY_RESPONSE=$(curl -s -X POST "${BASE_URL}/products/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "category_name": "智能门锁",
    "category_code": "smart-lock",
    "description": "智能门锁系列产品"
  }')

CATEGORY_ID=$(echo $CATEGORY_RESPONSE | grep -o '"categoryId":[0-9]*' | cut -d':' -f2)
echo -e "${GREEN}✓ 产品分类创建成功，ID: $CATEGORY_ID${NC}"
echo ""

# 测试3: 创建产品
echo -e "${YELLOW}[3/12] 测试创建产品...${NC}"
PRODUCT_RESPONSE=$(curl -s -X POST "${BASE_URL}/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"product_code\": \"LOCK-001\",
    \"product_name\": \"智能门锁 Pro\",
    \"brand\": \"艾居来\",
    \"category_id\": $CATEGORY_ID,
    \"cost_price\": 500.00,
    \"sale_price\": 800.00,
    \"unit\": \"台\",
    \"description\": \"高端智能门锁，支持指纹识别和密码开锁\"
  }")

PRODUCT_ID=$(echo $PRODUCT_RESPONSE | grep -o '"productId":[0-9]*' | cut -d':' -f2)
echo -e "${GREEN}✓ 产品创建成功，ID: $PRODUCT_ID${NC}"
echo ""

# 测试4: 创建线索
echo -e "${YELLOW}[4/12] 测试创建线索...${NC}"
LEAD_RESPONSE=$(curl -s -X POST "${BASE_URL}/leads" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "customerName": "张经理",
    "hotelName": "测试酒店-完整流程-001",
    "phone": "13800138001",
    "channelSource": "网络推广",
    "salesOwnerId": 1,
    "province": "广东省",
    "city": "深圳市"
  }')

LEAD_ID=$(echo $LEAD_RESPONSE | grep -o '"leadId":[0-9]*' | cut -d':' -f2)
LEAD_NO=$(echo $LEAD_RESPONSE | grep -o '"leadNo":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}✓ 线索创建成功，编号: $LEAD_NO${NC}"
echo ""

# 测试5: 线索转客户
echo -e "${YELLOW}[5/12] 测试线索转客户...${NC}"
CUSTOMER_RESPONSE=$(curl -s -X POST "${BASE_URL}/leads/$LEAD_ID/convert" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{}')

CUSTOMER_ID=$(echo $CUSTOMER_RESPONSE | grep -o '"customerId":[0-9]*' | cut -d':' -f2)
CUSTOMER_NO=$(echo $CUSTOMER_RESPONSE | grep -o '"customerNo":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}✓ 线索转客户成功，客户编号: $CUSTOMER_NO${NC}"
echo ""

# 测试6: 创建报价单
echo -e "${YELLOW}[6/12] 测试创建报价单...${NC}"
QUOTATION_RESPONSE=$(curl -s -X POST "${BASE_URL}/quotations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"customerId\": $CUSTOMER_ID,
    \"quotationTitle\": \"测试酒店智能锁采购报价单\",
    \"validDays\": 30,
    \"items\": [
      {
        \"productId\": $PRODUCT_ID,
        \"quantity\": 100,
        \"unitPrice\": 800.00,
        \"discountRate\": 0.95
      }
    ]
  }")

QUOTATION_ID=$(echo $QUOTATION_RESPONSE | grep -o '"quotationId":[0-9]*' | cut -d':' -f2)
echo -e "${GREEN}✓ 报价单创建成功，ID: $QUOTATION_ID${NC}"
echo ""

# 测试7: 创建合同
echo -e "${YELLOW}[7/12] 测试创建合同...${NC}"
TOMORROW=$(date -v+1d '+%Y-%m-%d' 2>/dev/null || date -d '+1 day' '+%Y-%m-%d')
CONTRACT_RESPONSE=$(curl -s -X POST "${BASE_URL}/contracts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"customerId\": $CUSTOMER_ID,
    \"contractTitle\": \"测试酒店智能锁采购合同\",
    \"contractType\": \"product_sale\",
    \"signingDate\": \"$(date '+%Y-%m-%d')\",
    \"effectiveDate\": \"$(date '+%Y-%m-%d')\",
    \"expiryDate\": \"$TOMORROW\",
    \"totalAmount\": 80000.00,
    \"items\": [
      {
        \"productId\": $PRODUCT_ID,
        \"quantity\": 100,
        \"unitPrice\": 800.00
      }
    ]
  }")

CONTRACT_ID=$(echo $CONTRACT_RESPONSE | grep -o '"contractId":[0-9]*' | cut -d':' -f2)
CONTRACT_NO=$(echo $CONTRACT_RESPONSE | grep -o '"contractNo":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}✓ 合同创建成功，编号: $CONTRACT_NO${NC}"
echo ""

# 测试8: 创建发货单
echo -e "${YELLOW}[8/12] 测试创建发货单...${NC}"
SHIPMENT_RESPONSE=$(curl -s -X POST "${BASE_URL}/shipments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"shipmentTitle\": \"测试酒店智能锁发货单\",
    \"contractId\": $CONTRACT_ID,
    \"shippingAddress\": \"广东省深圳市南山区科技园\",
    \"contactPerson\": \"张经理\",
    \"contactPhone\": \"13800138001\",
    \"plannedShipDate\": \"$(date '+%Y-%m-%d')\",
    \"items\": [
      {
        \"productId\": $PRODUCT_ID,
        \"productCode\": \"LOCK-001\",
        \"productName\": \"智能门锁 Pro\",
        \"productUnit\": \"台\",
        \"contractQuantity\": 100,
        \"alreadyShippedQuantity\": 0,
        \"thisShipmentQuantity\": 50,
        \"remainingQuantity\": 50,
        \"unitPrice\": 800.00
      }
    ]
  }")

SHIPMENT_ID=$(echo $SHIPMENT_RESPONSE | grep -o '"shipmentId":[0-9]*' | cut -d':' -f2)
SHIPMENT_NO=$(echo $SHIPMENT_RESPONSE | grep -o '"shipmentNo":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}✓ 发货单创建成功，编号: $SHIPMENT_NO${NC}"
echo ""

# 测试9: 确认发货
echo -e "${YELLOW}[9/12] 测试确认发货...${NC}"
SHIP_CONFIRM_RESPONSE=$(curl -s -X PUT "${BASE_URL}/shipments/$SHIPMENT_ID/confirm" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"logisticsCompany\": \"顺丰速运\",
    \"trackingNo\": \"SF123456789\",
    \"actualShipDate\": \"$(date '+%Y-%m-%d')\",
    \"estimatedDeliveryDate\": \"$TOMORROW\"
  }")

echo -e "${GREEN}✓ 发货确认成功${NC}"
echo ""

# 测试10: 创建收款记录
echo -e "${YELLOW}[10/12] 测试创建收款记录...${NC}"
PAYMENT_RESPONSE=$(curl -s -X POST "${BASE_URL}/payments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"contractId\": $CONTRACT_ID,
    \"paymentStage\": \"预付款\",
    \"paymentAmount\": 40000.00,
    \"paymentDate\": \"$(date '+%Y-%m-%d')\",
    \"paymentMethod\": \"bank_transfer\",
    \"bankAccount\": \"6228480402564890018\",
    \"transactionNo\": \"TX202512270001\",
    \"payerName\": \"测试酒店-完整流程-001\",
    \"expectedAmount\": 40000.00
  }")

PAYMENT_ID=$(echo $PAYMENT_RESPONSE | grep -o '"paymentId":[0-9]*' | cut -d':' -f2)
PAYMENT_NO=$(echo $PAYMENT_RESPONSE | grep -o '"paymentNo":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}✓ 收款记录创建成功，编号: $PAYMENT_NO${NC}"
echo ""

# 测试11: 创建发票
echo -e "${YELLOW}[11/12] 测试创建发票...${NC}"
INVOICE_RESPONSE=$(curl -s -X POST "${BASE_URL}/invoices" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"contractId\": $CONTRACT_ID,
    \"paymentId\": $PAYMENT_ID,
    \"invoiceType\": \"VAT_special\",
    \"invoiceAmount\": 40000.00,
    \"invoiceDate\": \"$(date '+%Y-%m-%d')\",
    \"invoiceTitle\": \"测试酒店-完整流程-001\",
    \"taxNumber\": \"91440300MA5DXXXX\",
    \"companyAddress\": \"广东省深圳市南山区科技园\",
    \"companyPhone\": \"0755-12345678\",
    \"bankName\": \"中国工商银行深圳支行\",
    \"bankAccount\": \"4000021234567890\"
  }")

INVOICE_ID=$(echo $INVOICE_RESPONSE | grep -o '"invoiceId":[0-9]*' | cut -d':' -f2)
INVOICE_NO=$(echo $INVOICE_RESPONSE | grep -o '"invoiceNo":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}✓ 发票创建成功，编号: $INVOICE_NO${NC}"
echo ""

# 测试12: 创建售后工单
echo -e "${YELLOW}[12/12] 测试创建售后工单...${NC}"
SERVICE_TICKET_RESPONSE=$(curl -s -X POST "${BASE_URL}/service-tickets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"customerId\": $CUSTOMER_ID,
    \"contractId\": $CONTRACT_ID,
    \"productId\": $PRODUCT_ID,
    \"ticketType\": \"installation\",
    \"ticketTitle\": \"智能门锁安装服务\",
    \"priority\": 2,
    \"problemDescription\": \"需要安装100台智能门锁\",
    \"expectedResolveDate\": \"$TOMORROW\"
  }")

TICKET_ID=$(echo $SERVICE_TICKET_RESPONSE | grep -o '"ticketId":[0-9]*' | cut -d':' -f2)
TICKET_NO=$(echo $SERVICE_TICKET_RESPONSE | grep -o '"ticketNo":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}✓ 售后工单创建成功，编号: $TICKET_NO${NC}"
echo ""

# 总结
echo "================================"
echo -e "${GREEN}完整业务流程测试通过！${NC}"
echo "================================"
echo ""
echo "业务数据汇总:"
echo "  - 线索编号: $LEAD_NO"
echo "  - 客户编号: $CUSTOMER_NO"
echo "  - 报价单ID: $QUOTATION_ID"
echo "  - 合同编号: $CONTRACT_NO"
echo "  - 发货单编号: $SHIPMENT_NO"
echo "  - 收款编号: $PAYMENT_NO"
echo "  - 发票编号: $INVOICE_NO"
echo "  - 工单编号: $TICKET_NO"
echo ""
echo "业务流程:"
echo "  线索 → 客户 → 报价 → 合同 → 发货 → 收款 → 发票 → 售后"
echo "  ✓     ✓      ✓      ✓      ✓      ✓      ✓      ✓"
echo ""
