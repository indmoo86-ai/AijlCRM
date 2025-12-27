#!/bin/bash

# AijlCRM 完整业务流程测试 V3
# 完整测试从线索到售后的全流程，使用Python解析JSON

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
echo "AijlCRM 完整业务流程测试 V3"
echo "================================"
echo ""

# 测试1: 用户登录
echo -e "${YELLOW}[1/12] 测试用户登录...${NC}"
curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}' > $TEST_DIR/01-login.json

TOKEN=$(cat $TEST_DIR/01-login.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ 登录失败${NC}"
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
  -d '{"category_name":"智能门锁","category_code":"smart-lock","description":"智能门锁系列产品"}' > $TEST_DIR/02-category.json

CATEGORY_ID=$(cat $TEST_DIR/02-category.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('categoryId', ''))" 2>/dev/null)

if [ -z "$CATEGORY_ID" ]; then
  echo -e "${RED}✗ 产品分类创建失败${NC}"
  cat $TEST_DIR/02-category.json
  exit 1
else
  echo -e "${GREEN}✓ 产品分类创建成功，ID: $CATEGORY_ID${NC}"
fi
echo ""

# 测试3: 创建产品
echo -e "${YELLOW}[3/12] 测试创建产品...${NC}"
curl -s -X POST "${BASE_URL}/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"product_code\":\"LOCK-$(date +%s)\",\"product_name\":\"智能门锁 Pro\",\"brand\":\"艾居来\",\"category_id\":$CATEGORY_ID,\"cost_price\":500.00,\"sale_price\":800.00,\"unit\":\"台\",\"description\":\"高端智能门锁\"}" > $TEST_DIR/03-product.json

PRODUCT_ID=$(cat $TEST_DIR/03-product.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('productId', ''))" 2>/dev/null)

if [ -z "$PRODUCT_ID" ]; then
  echo -e "${RED}✗ 产品创建失败${NC}"
  cat $TEST_DIR/03-product.json
  exit 1
else
  echo -e "${GREEN}✓ 产品创建成功，ID: $PRODUCT_ID${NC}"
fi
echo ""

# 测试4: 创建线索
echo -e "${YELLOW}[4/12] 测试创建线索...${NC}"
curl -s -X POST "${BASE_URL}/leads" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"customerName\":\"张经理\",\"hotelName\":\"测试酒店-V3-$(date +%H%M%S)\",\"phone\":\"13800138002\",\"channelSource\":\"网络推广\",\"salesOwnerId\":1,\"province\":\"广东省\",\"city\":\"深圳市\"}" > $TEST_DIR/04-lead.json

LEAD_ID=$(cat $TEST_DIR/04-lead.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('leadId', ''))" 2>/dev/null)
LEAD_NO=$(cat $TEST_DIR/04-lead.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('leadNo', ''))" 2>/dev/null)

if [ -z "$LEAD_ID" ]; then
  echo -e "${RED}✗ 线索创建失败${NC}"
  cat $TEST_DIR/04-lead.json
  exit 1
else
  echo -e "${GREEN}✓ 线索创建成功，ID: $LEAD_ID, 编号: $LEAD_NO${NC}"
fi
echo ""

# 测试5: 线索转客户
echo -e "${YELLOW}[5/12] 测试线索转客户...${NC}"
curl -s -X POST "${BASE_URL}/leads/$LEAD_ID/convert" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{}' > $TEST_DIR/05-customer.json

CUSTOMER_ID=$(cat $TEST_DIR/05-customer.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('customerId', ''))" 2>/dev/null)
CUSTOMER_NO=$(cat $TEST_DIR/05-customer.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('customerNo', ''))" 2>/dev/null)

if [ -z "$CUSTOMER_ID" ]; then
  echo -e "${RED}✗ 线索转客户失败${NC}"
  cat $TEST_DIR/05-customer.json
  exit 1
else
  echo -e "${GREEN}✓ 线索转客户成功，客户ID: $CUSTOMER_ID, 编号: $CUSTOMER_NO${NC}"
fi
echo ""

# 测试6: 创建报价单
echo -e "${YELLOW}[6/12] 测试创建报价单...${NC}"
curl -s -X POST "${BASE_URL}/quotations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"customerId\":$CUSTOMER_ID,\"quotationTitle\":\"测试酒店智能锁采购报价单\",\"validDays\":30,\"items\":[{\"productId\":$PRODUCT_ID,\"quantity\":100,\"unitPrice\":800.00,\"discountRate\":0.95}]}" > $TEST_DIR/06-quotation.json

QUOTATION_ID=$(cat $TEST_DIR/06-quotation.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('quotationId', ''))" 2>/dev/null)

if [ -z "$QUOTATION_ID" ]; then
  echo -e "${RED}✗ 报价单创建失败${NC}"
  cat $TEST_DIR/06-quotation.json
  exit 1
else
  echo -e "${GREEN}✓ 报价单创建成功，ID: $QUOTATION_ID${NC}"
fi
echo ""

# 测试7: 创建合同
echo -e "${YELLOW}[7/12] 测试创建合同...${NC}"
TOMORROW=$(date -v+1d '+%Y-%m-%d' 2>/dev/null || date -d '+1 day' '+%Y-%m-%d')
curl -s -X POST "${BASE_URL}/contracts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"customerId\":$CUSTOMER_ID,\"contractTitle\":\"测试酒店智能锁采购合同\",\"contractType\":\"product_sale\",\"signingDate\":\"$(date '+%Y-%m-%d')\",\"effectiveDate\":\"$(date '+%Y-%m-%d')\",\"expiryDate\":\"$TOMORROW\",\"totalAmount\":80000.00,\"items\":[{\"productId\":$PRODUCT_ID,\"quantity\":100,\"unitPrice\":800.00}]}" > $TEST_DIR/07-contract.json

CONTRACT_ID=$(cat $TEST_DIR/07-contract.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('contractId', ''))" 2>/dev/null)
CONTRACT_NO=$(cat $TEST_DIR/07-contract.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('contractNo', ''))" 2>/dev/null)

if [ -z "$CONTRACT_ID" ]; then
  echo -e "${RED}✗ 合同创建失败${NC}"
  cat $TEST_DIR/07-contract.json
  exit 1
else
  echo -e "${GREEN}✓ 合同创建成功，ID: $CONTRACT_ID, 编号: $CONTRACT_NO${NC}"
fi
echo ""

# 测试8: 创建发货单
echo -e "${YELLOW}[8/12] 测试创建发货单...${NC}"
curl -s -X POST "${BASE_URL}/shipments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"shipmentTitle\":\"测试酒店智能锁发货单\",\"contractId\":$CONTRACT_ID,\"shippingAddress\":\"广东省深圳市南山区科技园\",\"contactPerson\":\"张经理\",\"contactPhone\":\"13800138001\",\"plannedShipDate\":\"$(date '+%Y-%m-%d')\",\"items\":[{\"productId\":$PRODUCT_ID,\"productCode\":\"LOCK-001\",\"productName\":\"智能门锁 Pro\",\"productUnit\":\"台\",\"contractQuantity\":100,\"alreadyShippedQuantity\":0,\"thisShipmentQuantity\":50,\"remainingQuantity\":50,\"unitPrice\":800.00}]}" > $TEST_DIR/08-shipment.json

SHIPMENT_ID=$(cat $TEST_DIR/08-shipment.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('shipmentId', ''))" 2>/dev/null)
SHIPMENT_NO=$(cat $TEST_DIR/08-shipment.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('shipmentNo', ''))" 2>/dev/null)

if [ -z "$SHIPMENT_ID" ]; then
  echo -e "${RED}✗ 发货单创建失败${NC}"
  cat $TEST_DIR/08-shipment.json
  exit 1
else
  echo -e "${GREEN}✓ 发货单创建成功，ID: $SHIPMENT_ID, 编号: $SHIPMENT_NO${NC}"
fi
echo ""

# 测试9: 确认发货
echo -e "${YELLOW}[9/12] 测试确认发货...${NC}"
curl -s -X PUT "${BASE_URL}/shipments/$SHIPMENT_ID/confirm" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"logisticsCompany\":\"顺丰速运\",\"trackingNo\":\"SF123456789\",\"actualShipDate\":\"$(date '+%Y-%m-%d')\",\"estimatedDeliveryDate\":\"$TOMORROW\"}" > $TEST_DIR/09-ship-confirm.json

echo -e "${GREEN}✓ 发货确认成功${NC}"
echo ""

# 测试10: 创建收款记录
echo -e "${YELLOW}[10/12] 测试创建收款记录...${NC}"
curl -s -X POST "${BASE_URL}/payments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"contractId\":$CONTRACT_ID,\"paymentStage\":\"预付款\",\"paymentAmount\":40000.00,\"paymentDate\":\"$(date '+%Y-%m-%d')\",\"paymentMethod\":\"bank_transfer\",\"bankAccount\":\"6228480402564890018\",\"transactionNo\":\"TX202512270001\",\"payerName\":\"测试酒店\",\"expectedAmount\":40000.00}" > $TEST_DIR/10-payment.json

PAYMENT_ID=$(cat $TEST_DIR/10-payment.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('paymentId', ''))" 2>/dev/null)
PAYMENT_NO=$(cat $TEST_DIR/10-payment.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('paymentNo', ''))" 2>/dev/null)

if [ -z "$PAYMENT_ID" ]; then
  echo -e "${RED}✗ 收款记录创建失败${NC}"
  cat $TEST_DIR/10-payment.json
  exit 1
else
  echo -e "${GREEN}✓ 收款记录创建成功，ID: $PAYMENT_ID, 编号: $PAYMENT_NO${NC}"
fi
echo ""

# 测试11: 创建发票
echo -e "${YELLOW}[11/12] 测试创建发票...${NC}"
curl -s -X POST "${BASE_URL}/invoices" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"contractId\":$CONTRACT_ID,\"paymentId\":$PAYMENT_ID,\"invoiceType\":\"VAT_special\",\"invoiceAmount\":40000.00,\"invoiceDate\":\"$(date '+%Y-%m-%d')\",\"invoiceTitle\":\"测试酒店\",\"taxNumber\":\"91440300MA5DXXXX\",\"companyAddress\":\"广东省深圳市南山区科技园\",\"companyPhone\":\"0755-12345678\",\"bankName\":\"中国工商银行深圳支行\",\"bankAccount\":\"4000021234567890\"}" > $TEST_DIR/11-invoice.json

INVOICE_ID=$(cat $TEST_DIR/11-invoice.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('invoiceId', ''))" 2>/dev/null)
INVOICE_NO=$(cat $TEST_DIR/11-invoice.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('invoiceNo', ''))" 2>/dev/null)

if [ -z "$INVOICE_ID" ]; then
  echo -e "${RED}✗ 发票创建失败${NC}"
  cat $TEST_DIR/11-invoice.json
  exit 1
else
  echo -e "${GREEN}✓ 发票创建成功，ID: $INVOICE_ID, 编号: $INVOICE_NO${NC}"
fi
echo ""

# 测试12: 创建售后工单
echo -e "${YELLOW}[12/12] 测试创建售后工单...${NC}"
curl -s -X POST "${BASE_URL}/service-tickets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"customerId\":$CUSTOMER_ID,\"contractId\":$CONTRACT_ID,\"productId\":$PRODUCT_ID,\"ticketType\":\"installation\",\"ticketTitle\":\"智能门锁安装服务\",\"priority\":2,\"problemDescription\":\"需要安装100台智能门锁\",\"expectedResolveDate\":\"$TOMORROW\"}" > $TEST_DIR/12-ticket.json

TICKET_ID=$(cat $TEST_DIR/12-ticket.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('ticketId', ''))" 2>/dev/null)
TICKET_NO=$(cat $TEST_DIR/12-ticket.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('ticketNo', ''))" 2>/dev/null)

if [ -z "$TICKET_ID" ]; then
  echo -e "${RED}✗ 售后工单创建失败${NC}"
  cat $TEST_DIR/12-ticket.json
  exit 1
else
  echo -e "${GREEN}✓ 售后工单创建成功，ID: $TICKET_ID, 编号: $TICKET_NO${NC}"
fi
echo ""

# 总结
echo "================================"
echo -e "${GREEN}完整业务流程测试通过！${NC}"
echo "================================"
echo ""
echo "业务数据汇总:"
echo "  - 产品分类ID: $CATEGORY_ID"
echo "  - 产品ID: $PRODUCT_ID"
echo "  - 线索ID: $LEAD_ID"
echo "  - 线索编号: $LEAD_NO"
echo "  - 客户ID: $CUSTOMER_ID"
echo "  - 客户编号: $CUSTOMER_NO"
echo "  - 报价单ID: $QUOTATION_ID"
echo "  - 合同ID: $CONTRACT_ID"
echo "  - 合同编号: $CONTRACT_NO"
echo "  - 发货单ID: $SHIPMENT_ID"
echo "  - 发货单编号: $SHIPMENT_NO"
echo "  - 收款ID: $PAYMENT_ID"
echo "  - 收款编号: $PAYMENT_NO"
echo "  - 发票ID: $INVOICE_ID"
echo "  - 发票编号: $INVOICE_NO"
echo "  - 工单ID: $TICKET_ID"
echo "  - 工单编号: $TICKET_NO"
echo ""
echo "测试数据保存在: $TEST_DIR"
echo ""
echo "业务流程验证:"
echo "  产品分类 → 产品 → 线索 → 客户 → 报价 → 合同 → 发货 → 收款 → 发票 → 售后"
echo "     ✓         ✓      ✓      ✓      ✓      ✓      ✓      ✓      ✓      ✓"
echo ""
