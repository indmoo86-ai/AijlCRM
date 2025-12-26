# API 测试指南

## 测试方式总览

本项目提供三种 API 测试方式：

| 方式 | 适用场景 | 优点 |
|------|----------|------|
| **自动化脚本** | CI/CD、回归测试 | 全自动、可重复、快速 |
| **Postman Collection** | 手动测试、调试 | 可视化、灵活、易用 |
| **curl 命令** | 快速验证单个接口 | 简单、直接、无依赖 |

---

## 方式一：自动化测试脚本（推荐）

### 准备工作

```bash
# 1. 确保后端服务已启动
cd backend
npm start

# 2. 确保已创建种子数据
node scripts/seed-data.js
```

### 执行测试

```bash
# 运行完整测试套件
cd backend
node scripts/test-api.js
```

### 测试覆盖

自动化脚本测试 **10 个核心模块**, **30+ 个关键接口**:

1. **认证模块** ✓
   - 管理员登录
   - 销售人员登录
   - 错误密码测试

2. **产品管理** ✓
   - 查询产品列表
   - 创建新产品
   - 查询产品详情

3. **线索管理** ✓
   - 创建销售线索
   - 添加跟进记录
   - 查询线索列表

4. **客户管理** ✓
   - 线索转客户
   - 添加客户联系人
   - 查询客户列表

5. **报价管理** ✓
   - 创建报价单
   - 提交报价单

6. **合同管理** ✓
   - 创建合同
   - 签署合同

7. **收款管理** ✓
   - 创建收款记录
   - 确认收款（自动更新合同 received_amount）

8. **发货管理** ✓
   - 创建发货单
   - 确认发货（自动更新合同 shipped_amount）

9. **发票管理** ✓
   - 创建发票
   - 确认开票（自动更新合同 invoiced_amount）

10. **合同执行进度** ✓
    - 查询发货进度
    - 查询收款进度
    - 查询开票进度

### 预期输出

```
============================================================
  艾居来 CRM - API 自动化测试
  测试目标: http://localhost:3000
  开始时间: 2025-12-25 10:00:00
============================================================

============================================================
测试模块 1: 用户认证
============================================================
ℹ 1.1 测试管理员登录...
✓ 管理员登录成功 - Token: eyJhbGciOiJIUzI1NiIs...
ℹ 1.2 测试销售人员登录...
✓ 销售人员登录成功 - 用户: 张销售
ℹ 1.3 测试错误密码登录...
✓ 错误密码登录被正确拒绝

============================================================
测试模块 2: 产品管理
============================================================
ℹ 2.1 查询产品列表...
✓ 查询到 3 个产品
  第一个产品: 酒店智能门锁 Pro (¥880)
ℹ 2.2 创建新产品...
✓ 创建产品成功 - ID: 4
...

============================================================
测试摘要
============================================================
总测试套件: 10
通过: 10
失败: 0
成功率: 100.0%

============================================================
  测试完成时间: 2025-12-25 10:00:30
============================================================
```

---

## 方式二：Postman Collection

### 导入 Collection

1. 打开 Postman
2. 点击 **Import** 按钮
3. 选择文件: `/Users/robin/claude code/CRM/postman/AiJuLai-CRM-APIs.postman_collection.json`
4. 导入成功后会看到 **"艾居来 CRM - API Collection"**

### 创建环境变量

1. 点击 **Environments** → **+** 创建新环境
2. 命名为 **"CRM Local"**
3. 添加变量:
   ```
   baseUrl = http://localhost:3000
   token = (留空，登录后自动填充)
   userId = (留空，登录后自动填充)
   productId = (留空，创建产品后自动填充)
   leadId = (留空，创建线索后自动填充)
   customerId = (留空，线索转客户后自动填充)
   quotationId = (留空，创建报价后自动填充)
   contractId = (留空，创建合同后自动填充)
   paymentId = (留空，创建收款后自动填充)
   shipmentId = (留空，创建发货后自动填充)
   invoiceId = (留空，创建发票后自动填充)
   ticketId = (留空，创建工单后自动填充)
   ```
4. 选择该环境为当前环境

### 测试流程

**第一步：登录获取 Token**
1. 展开 **"1. 认证模块"**
2. 点击 **"用户登录"**
3. 点击 **Send**
4. 查看 **Tests** 标签，确认 token 已自动保存

**第二步：按顺序测试各模块**
1. 2. 产品管理 → 查询产品列表
2. 3. 线索管理 → 创建线索 → 添加跟进 → 线索转客户
3. 4. 客户管理 → 查询客户 → 添加联系人
4. 5. 报价管理 → 创建报价 → 提交报价
5. 6. 合同管理 → 创建合同 → 签署合同
6. 7. 收款管理 → 创建收款 → 确认收款
7. 8. 发货管理 → 创建发货 → 确认发货
8. 9. 发票管理 → 创建发票 → 确认开票
9. 6. 合同管理 → 查询合同执行进度

**提示:**
- Collection 中的请求已按业务流程排序
- 每个请求执行后会自动保存相关 ID 到环境变量
- 后续请求会自动使用这些 ID

---

## 方式三：curl 命令

### 1. 用户登录

```bash
# 管理员登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# 保存返回的 token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 2. 查询产品列表

```bash
curl http://localhost:3000/api/products?page=1&pageSize=10 \
  -H "Authorization: Bearer $TOKEN"
```

### 3. 创建线索

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "测试酒店",
    "hotelName": "豪华酒店",
    "province": "广东省",
    "city": "深圳市",
    "roomCount": 200,
    "phone": "13800138000",
    "channelSource": "website",
    "intentionLevel": "high",
    "estimatedAmount": 500000
  }'
```

### 4. 查询合同执行进度

```bash
# 假设合同 ID 为 1
curl http://localhost:3000/api/contracts/1/progress \
  -H "Authorization: Bearer $TOKEN"
```

---

## 测试数据说明

### 初始用户账号

| 角色 | 用户名 | 密码 | 权限 |
|------|--------|------|------|
| 系统管理员 | admin | admin123 | 全部权限 |
| 销售人员 | sales001 | sales123 | 线索、客户、产品、报价、合同 |
| 销售主管 | manager001 | manager123 | 除系统管理外的全部权限 |

### 种子数据

运行 `node backend/scripts/seed-data.js` 后会创建：

- **6 个产品分类**
- **3 个示例产品**:
  - 酒店智能门锁 Pro (¥880)
  - 客房智能控制面板 (¥520)
  - 酒店智能门锁 标准版 (¥580)
- **10 个客户来源渠道**
- **6 个系统角色**
- **40 个权限**

---

## 核心业务流程测试

### 完整销售流程

```bash
# 1. 登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"sales001","password":"sales123"}' \
  | jq -r '.data.token' > token.txt

TOKEN=$(cat token.txt)

# 2. 创建线索
LEAD_ID=$(curl -X POST http://localhost:3000/api/leads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "深圳XX酒店",
    "roomCount": 150,
    "phone": "13800000001",
    "channelSource": "website",
    "intentionLevel": "high",
    "estimatedAmount": 300000
  }' | jq -r '.data.id')

echo "线索ID: $LEAD_ID"

# 3. 添加跟进记录
curl -X POST http://localhost:3000/api/leads/$LEAD_ID/follow-up \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "followType": "phone",
    "content": "电话沟通，客户很感兴趣",
    "intentionLevel": "high"
  }'

# 4. 线索转客户
CUSTOMER_ID=$(curl -X POST http://localhost:3000/api/leads/$LEAD_ID/convert \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerType": "chain_hotel",
    "customerLevel": "A"
  }' | jq -r '.data.id')

echo "客户ID: $CUSTOMER_ID"

# 5. 创建报价单
QUOTATION_ID=$(curl -X POST http://localhost:3000/api/quotations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"customerId\": $CUSTOMER_ID,
    \"quotationTitle\": \"智能客房方案\",
    \"validUntil\": \"2025-02-28\",
    \"totalAmount\": 300000,
    \"items\": [
      {\"productId\": 1, \"quantity\": 100, \"unitPrice\": 880, \"totalPrice\": 88000}
    ]
  }" | jq -r '.data.quotationId')

echo "报价单ID: $QUOTATION_ID"

# 6. 创建合同
CONTRACT_ID=$(curl -X POST http://localhost:3000/api/contracts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"contractTitle\": \"智能客房改造合同\",
    \"customerId\": $CUSTOMER_ID,
    \"sourceQuotationId\": $QUOTATION_ID,
    \"contractAmount\": 300000,
    \"signDate\": \"2025-12-25\"
  }" | jq -r '.data.contractId')

echo "合同ID: $CONTRACT_ID"

# 7. 签署合同
curl -X PUT http://localhost:3000/api/contracts/$CONTRACT_ID/sign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerSignDate": "2025-12-25",
    "companySignDate": "2025-12-25"
  }'

# 8. 创建并确认收款
PAYMENT_ID=$(curl -X POST http://localhost:3000/api/payments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"contractId\": $CONTRACT_ID,
    \"customerId\": $CUSTOMER_ID,
    \"paymentStage\": \"签约款\",
    \"paidAmount\": 90000,
    \"paymentMethod\": \"bank_transfer\",
    \"paymentDate\": \"2025-12-25\"
  }" | jq -r '.data.paymentId')

curl -X PUT http://localhost:3000/api/payments/$PAYMENT_ID/confirm \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"confirmNote": "已到账"}'

# 9. 创建并确认发货
SHIPMENT_ID=$(curl -X POST http://localhost:3000/api/shipments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"contractId\": $CONTRACT_ID,
    \"shipmentTitle\": \"首批发货\",
    \"shippingAddress\": \"深圳市福田区\",
    \"contactPerson\": \"张经理\",
    \"contactPhone\": \"13800000001\",
    \"shipmentAmount\": 150000
  }" | jq -r '.data.shipmentId')

curl -X PUT http://localhost:3000/api/shipments/$SHIPMENT_ID/confirm \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "logisticsCompany": "顺丰",
    "trackingNo": "SF123456",
    "actualShipDate": "2025-12-26"
  }'

# 10. 查询合同执行进度
curl http://localhost:3000/api/contracts/$CONTRACT_ID/progress \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data'
```

预期输出：
```json
{
  "contractId": 1,
  "contractAmount": 300000,
  "shippedAmount": 150000,
  "shippedProgress": 50,
  "receivedAmount": 90000,
  "receivedProgress": 30,
  "invoicedAmount": 0,
  "invoicedProgress": 0,
  "shipments": [
    {
      "shipmentId": 1,
      "shipmentNo": "SHIP-...",
      "status": "shipped",
      "shipmentAmount": 150000,
      "logisticsCompany": "顺丰",
      "trackingNo": "SF123456"
    }
  ],
  "payments": [
    {
      "paymentId": 1,
      "paymentNo": "PAY-...",
      "paidAmount": 90000,
      "status": "confirmed",
      "paymentDate": "2025-12-25"
    }
  ]
}
```

---

## 验证数据一致性

合同金额自动更新测试：

```bash
# 1. 查询合同详情（初始状态）
curl http://localhost:3000/api/contracts/$CONTRACT_ID \
  -H "Authorization: Bearer $TOKEN" \
  | jq '{
    contractAmount: .data.contractAmount,
    shippedAmount: .data.shippedAmount,
    receivedAmount: .data.receivedAmount,
    invoicedAmount: .data.invoicedAmount
  }'

# 初始输出应该是：
# {
#   "contractAmount": 300000,
#   "shippedAmount": 0,
#   "receivedAmount": 0,
#   "invoicedAmount": 0
# }

# 2. 确认发货后再次查询
# shippedAmount 应该自动增加

# 3. 确认收款后再次查询
# receivedAmount 应该自动增加

# 4. 确认开票后再次查询
# invoicedAmount 应该自动增加
```

---

## 常见问题

### Q1: 测试脚本报 "ECONNREFUSED" 错误

**原因**: 后端服务未启动

**解决**:
```bash
cd backend
npm start
```

### Q2: 401 Unauthorized 错误

**原因**: Token 过期或未设置

**解决**:
1. 重新登录获取新 token
2. 检查 Authorization header 格式: `Bearer <token>`

### Q3: 400 Bad Request 错误

**原因**: 请求参数错误

**解决**:
1. 检查 Content-Type 是否为 `application/json`
2. 检查 JSON 格式是否正确
3. 查看响应中的错误信息

### Q4: 种子数据已存在

**原因**: 多次运行种子数据脚本

**解决**:
```bash
# 重置数据库
docker exec -it aijulai-mysql mysql -uroot -paijulai2024 \
  -e "DROP DATABASE IF EXISTS aijulai_crm; CREATE DATABASE aijulai_crm;"

# 重新初始化
docker exec -i aijulai-mysql mysql -uroot -paijulai2024 aijulai_crm < database/schema_full.sql
node backend/scripts/seed-data.js
```

---

## 测试清单

使用此清单确保所有功能已测试：

### 认证模块
- [ ] 管理员登录成功
- [ ] 销售人员登录成功
- [ ] 错误密码被拒绝
- [ ] Token 自动保存

### 产品管理
- [ ] 查询产品列表（分页）
- [ ] 创建新产品
- [ ] 查询产品详情
- [ ] 更新产品信息
- [ ] 删除产品

### 线索管理
- [ ] 创建销售线索
- [ ] 查询线索列表
- [ ] 添加跟进记录
- [ ] 线索转客户
- [ ] 转移线索负责人

### 客户管理
- [ ] 查询客户列表
- [ ] 查询客户详情
- [ ] 添加客户联系人
- [ ] 推进客户阶段
- [ ] 转移客户负责人

### 报价管理
- [ ] 创建报价单
- [ ] 查询报价列表
- [ ] 提交报价单
- [ ] 审批报价单

### 合同管理
- [ ] 创建合同
- [ ] 查询合同列表
- [ ] 签署合同
- [ ] 创建合同变更
- [ ] 查询合同执行进度

### 收款管理
- [ ] 创建收款记录
- [ ] 确认收款
- [ ] 作废收款
- [ ] 验证合同 received_amount 自动更新
- [ ] 查询收款统计

### 发货管理
- [ ] 创建发货单
- [ ] 确认发货
- [ ] 更新物流信息
- [ ] 确认签收
- [ ] 取消发货
- [ ] 验证合同 shipped_amount 自动更新

### 发票管理
- [ ] 创建发票
- [ ] 确认开票
- [ ] 作废发票
- [ ] 验证合同 invoiced_amount 自动更新
- [ ] 查询发票统计

### 售后管理
- [ ] 创建工单
- [ ] 分配工单
- [ ] 处理工单
- [ ] 关闭工单
- [ ] 客户评价

---

**最后更新**: 2025-12-25
**测试覆盖率**: 70+ API 接口, 10 个业务模块
