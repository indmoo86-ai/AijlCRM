# 艾居来 CRM - RESTful API 接口设计文档

**文档版本**：v1.0  
**创建日期**：2025-12-24  
**依据文档**：requirements.md v9.1（79个User Stories）  
**API风格**：RESTful  
**认证方式**：JWT Bearer Token  

---

## 目录

1. [API设计原则](#1-api设计原则)
2. [通用规范](#2-通用规范)
3. [认证鉴权](#3-认证鉴权)
4. [API端点清单](#4-api端点清单)
5. [详细接口说明](#5-详细接口说明)
6. [错误码定义](#6-错误码定义)

---

## 1. API设计原则

### 1.1 RESTful 设计原则

-  资源导向**：URL表示资源，HTTP方法表示操作
- **无状态**：每次请求包含完整信息（通过JWT Token）
- **统一接口**：标准化的HTTP方法（GET/POST/PUT/PATCH/DELETE）
- **分层系统**：前后端分离，支持负载均衡和缓存

### 1.2 URL 设计规范

```
基础URL：https://api.aijulai.com/v1
资源命名：使用小写复数名词，单词间用短横线连接
版本控制：URL中包含版本号 /v1

示例：
GET    /v1/customers          # 获取客户列表
GET    /v1/customers/:id      # 获取单个客户
POST   /v1/customers          # 创建客户
PUT    /v1/customers/:id      # 更新客户（全量）
PATCH  /v1/customers/:id      # 更新客户（部分）
DELETE /v1/customers/:id      # 删除客户
```

### 1.3 HTTP 方法语义

| HTTP方法 | 语义 | 幂等性 | 安全性 |
|---------|------|--------|--------|
| GET     | 获取资源 | ✅ | ✅ |
| POST    | 创建资源 | ❌ | ❌ |
| PUT     | 全量更新资源 | ✅ | ❌ |
| PATCH   | 部分更新资源 | ❌ | ❌ |
| DELETE  | 删除资源 | ✅ | ❌ |

---

## 2. 通用规范

### 2.1 通用请求头

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
Accept: application/json
X-Request-ID: <UUID>              # 请求追踪ID（可选）
```

### 2.2 通用响应格式

#### 成功响应

```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": {
    // 业务数据
  },
  "timestamp": "2025-12-24T10:30:00Z"
}
```

#### 列表响应（分页）

```json
{
  "success": true,
  "code": 200,
  "message": "查询成功",
  "data": {
    "items": [/* 数据列表 */],
    "pagination": {
      "total": 100,         // 总记录数
      "page": 1,            // 当前页码
      "pageSize": 20,       // 每页条数
      "totalPages": 5       // 总页数
    }
  },
  "timestamp": "2025-12-24T10:30:00Z"
}
```

#### 错误响应

```json
{
  "success": false,
  "code": 400,
  "message": "参数校验失败",
  "error": {
    "type": "ValidationError",
    "details": [
      {
        "field": "customer_name",
        "message": "客户名称不能为空"
      }
    ]
  },
  "timestamp": "2025-12-24T10:30:00Z"
}
```

### 2.3 分页参数

```
?page=1                  # 页码（从1开始）
&pageSize=20             # 每页条数（默认20，最大100）
&sort=created_at         # 排序字段
&order=desc              # 排序方向（asc/desc）
```

### 2.4 查询过滤参数

```
?status=active           # 精确匹配
&customer_type=hotel     # 枚举值匹配
&keyword=酒店            # 关键词搜索
&start_date=2025-01-01   # 日期范围
&end_date=2025-12-31
```

---

## 3. 认证鉴权

### 3.1 登录认证

**端点**：`POST /v1/auth/login`

**请求体**：
```json
{
  "phone": "13800138000",
  "password": "password123"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 604800,    // 7天（秒）
    "user": {
      "id": 1,
      "username": "admin",
      "realName": "系统管理员",
      "phone": "13800138000",
      "roles": ["admin"]
    }
  }
}
```

### 3.2 JWT Token 说明

- **有效期**：7天
- **自动刷新**：Token过期前1天内请求时自动刷新
- **存储位置**：前端存储在 localStorage 或 sessionStorage
- **传输方式**：`Authorization: Bearer <token>`

### 3.3 权限校验

- **模块级权限**：基于角色的权限控制（RBAC）
- **数据权限**：v1.0阶段所有用户可见全部数据
- **操作权限**：根据角色判断是否允许（创建/编辑/删除/导出）

---

## 4. API端点清单

### 4.1 基础数据模块

#### 产品管理 (6个端点)

| 方法 | 端点 | 说明 | 权限 |
|------|------|------|------|
| GET | `/v1/products` | 查询产品列表 | product:view |
| GET | `/v1/products/:id` | 查询产品详情 | product:view |
| POST | `/v1/products` | 创建产品 | product:create |
| PUT | `/v1/products/:id` | 更新产品 | product:edit |
| DELETE | `/v1/products/:id` | 删除产品（软删除） | product:delete |
| GET | `/v1/product-categories` | 查询产品分类列表 | product:view |
| POST | `/v1/products/import` | 批量导入产品 | product:import |
| GET | `/v1/products/export` | 导出产品数据 | product:export |

#### 客户管理 (7个端点)

| 方法 | 端点 | 说明 | 权限 |
|------|------|------|------|
| GET | `/v1/customers` | 查询客户列表 | customer:view |
| GET | `/v1/customers/:id` | 查询客户详情 | customer:view |
| POST | `/v1/customers` | 创建客户 | customer:create |
| PUT | `/v1/customers/:id` | 更新客户 | customer:edit |
| DELETE | `/v1/customers/:id` | 删除客户 | customer:delete |
| PATCH | `/v1/customers/:id/stage` | 更新客户阶段 | customer:edit |
| PATCH | `/v1/customers/:id/owner` | 转移客户负责人 | customer:transfer |
| GET | `/v1/customers/:id/contacts` | 查询客户联系人列表 | customer:view |
| POST | `/v1/customers/:id/contacts` | 添加客户联系人 | customer:edit |
| GET | `/v1/customer-sources` | 查询客户来源列表 | customer:view |

#### 用户权限管理 (8个端点)

| 方法 | 端点 | 说明 | 权限 |
|------|------|------|------|
| POST | `/v1/auth/login` | 用户登录 | public |
| POST | `/v1/auth/logout` | 用户登出 | authenticated |
| POST | `/v1/auth/refresh-token` | 刷新Token | authenticated |
| GET | `/v1/users` | 查询用户列表 | user:view |
| GET | `/v1/users/:id` | 查询用户详情 | user:view |
| POST | `/v1/users` | 创建用户 | user:create |
| PUT | `/v1/users/:id` | 更新用户 | user:edit |
| PATCH | `/v1/users/:id/status` | 启用/禁用用户 | user:edit |
| POST | `/v1/users/:id/reset-password` | 重置密码 | user:edit |
| GET | `/v1/roles` | 查询角色列表 | role:view |
| GET | `/v1/permissions` | 查询权限列表 | permission:view |
| GET | `/v1/audit-logs` | 查询操作日志 | audit:view |

### 4.2 业务流程模块

#### 销售线索管理 (8个端点)

| 方法 | 端点 | 说明 | 权限 |
|------|------|------|------|
| GET | `/v1/leads` | 查询线索列表（customer_stage=lead） | lead:view |
| GET | `/v1/leads/:id` | 查询线索详情 | lead:view |
| POST | `/v1/leads` | 创建线索 | lead:create |
| PUT | `/v1/leads/:id` | 更新线索 | lead:edit |
| PATCH | `/v1/leads/:id/assign` | 分配线索 | lead:assign |
| PATCH | `/v1/leads/:id/claim` | 领取线索 | lead:claim |
| PATCH | `/v1/leads/:id/abandon` | 放弃线索 | lead:edit |
| POST | `/v1/leads/import` | 批量导入线索 | lead:import |
| GET | `/v1/leads/export` | 导出线索数据 | lead:export |
| GET | `/v1/leads/pool` | 查询线索池 | lead:view |

#### 报价单管理 (7个端点)

| 方法 | 端点 | 说明 | 权限 |
|------|------|------|------|
| GET | `/v1/quotations` | 查询报价单列表 | quotation:view |
| GET | `/v1/quotations/:id` | 查询报价单详情 | quotation:view |
| POST | `/v1/quotations` | 创建报价单 | quotation:create |
| PUT | `/v1/quotations/:id` | 更新报价单 | quotation:edit |
| DELETE | `/v1/quotations/:id` | 删除报价单 | quotation:delete |
| PATCH | `/v1/quotations/:id/status` | 更新报价单状态 | quotation:edit |
| POST | `/v1/quotations/:id/generate-pdf` | 生成PDF | quotation:pdf |
| POST | `/v1/quotations/:id/convert-to-contract` | 转合同 | quotation:convert |
| PATCH | `/v1/quotations/:id/extend-validity` | 延长有效期 | quotation:edit |

#### 合同管理 (10个端点)

| 方法 | 端点 | 说明 | 权限 |
|------|------|------|------|
| GET | `/v1/contracts` | 查询合同列表 | contract:view |
| GET | `/v1/contracts/:id` | 查询合同详情 | contract:view |
| POST | `/v1/contracts` | 创建合同 | contract:create |
| PUT | `/v1/contracts/:id` | 更新合同 | contract:edit |
| DELETE | `/v1/contracts/:id` | 删除合同 | contract:delete |
| PATCH | `/v1/contracts/:id/status` | 更新合同状态 | contract:edit |
| POST | `/v1/contracts/:id/amendments` | 创建补充协议 | contract:amendment |
| GET | `/v1/contracts/:id/execution-status` | 查询执行进度 | contract:view |
| POST | `/v1/contracts/:id/upload-file` | 上传合同文件 | contract:upload |
| GET | `/v1/contracts/:id/timeline` | 查询合同时间线 | contract:view |

#### 待办任务管理 (8个端点)

| 方法 | 端点 | 说明 | 权限 |
|------|------|------|------|
| GET | `/v1/tasks` | 查询任务列表 | task:view |
| GET | `/v1/tasks/my-tasks` | 查询我的任务 | task:view |
| GET | `/v1/tasks/:id` | 查询任务详情 | task:view |
| POST | `/v1/tasks` | 创建任务 | task:create |
| PATCH | `/v1/tasks/:id/assign` | 分配任务 | task:assign |
| PATCH | `/v1/tasks/:id/status` | 更新任务状态 | task:edit |
| POST | `/v1/tasks/:id/complete` | 完成任务 | task:edit |
| GET | `/v1/tasks/statistics` | 任务统计 | task:view |

#### 发货管理 (8个端点)

| 方法 | 端点 | 说明 | 权限 |
|------|------|------|------|
| GET | `/v1/shipments` | 查询发货单列表 | shipment:view |
| GET | `/v1/shipments/:id` | 查询发货单详情 | shipment:view |
| POST | `/v1/shipments` | 创建发货单 | shipment:create |
| PUT | `/v1/shipments/:id` | 更新发货单 | shipment:edit |
| DELETE | `/v1/shipments/:id` | 删除发货单 | shipment:delete |
| PATCH | `/v1/shipments/:id/confirm` | 确认发货 | shipment:confirm |
| PATCH | `/v1/shipments/:id/logistics` | 更新物流信息 | shipment:edit |
| PATCH | `/v1/shipments/:id/deliver` | 确认签收 | shipment:deliver |

#### 收款管理 (8个端点)

| 方法 | 端点 | 说明 | 权限 |
|------|------|------|------|
| GET | `/v1/payments` | 查询收款记录列表 | payment:view |
| GET | `/v1/payments/:id` | 查询收款记录详情 | payment:view |
| POST | `/v1/payments` | 创建收款记录 | payment:create |
| PUT | `/v1/payments/:id` | 更新收款记录 | payment:edit |
| DELETE | `/v1/payments/:id` | 删除收款记录 | payment:delete |
| PATCH | `/v1/payments/:id/confirm` | 确认收款 | payment:confirm |
| GET | `/v1/payments/receivables` | 应收账款统计 | payment:view |
| GET | `/v1/payments/export` | 导出收款数据 | payment:export |

#### 发票管理 (8个端点)

| 方法 | 端点 | 说明 | 权限 |
|------|------|------|------|
| GET | `/v1/invoices` | 查询发票列表 | invoice:view |
| GET | `/v1/invoices/:id` | 查询发票详情 | invoice:view |
| POST | `/v1/invoices` | 创建发票记录 | invoice:create |
| PUT | `/v1/invoices/:id` | 更新发票记录 | invoice:edit |
| DELETE | `/v1/invoices/:id` | 删除发票记录 | invoice:delete |
| PATCH | `/v1/invoices/:id/issue` | 确认开具 | invoice:issue |
| PATCH | `/v1/invoices/:id/cancel` | 作废发票 | invoice:cancel |
| GET | `/v1/invoices/statistics` | 发票统计 | invoice:view |

#### 售后服务管理 (9个端点)

| 方法 | 端点 | 说明 | 权限 |
|------|------|------|------|
| GET | `/v1/service-tickets` | 查询工单列表 | service:view |
| GET | `/v1/service-tickets/:id` | 查询工单详情 | service:view |
| POST | `/v1/service-tickets` | 创建工单 | service:create |
| PUT | `/v1/service-tickets/:id` | 更新工单 | service:edit |
| PATCH | `/v1/service-tickets/:id/assign` | 分配/转派工单 | service:assign |
| PATCH | `/v1/service-tickets/:id/status` | 更新工单状态 | service:edit |
| POST | `/v1/service-tickets/:id/logs` | 添加操作记录 | service:edit |
| POST | `/v1/service-tickets/:id/rate` | 客户评价 | service:rate |
| GET | `/v1/service-tickets/statistics` | 工单统计 | service:view |

#### 客户跟进记录 (4个端点)

| 方法 | 端点 | 说明 | 权限 |
|------|------|------|------|
| GET | `/v1/customers/:id/follow-ups` | 查询跟进记录列表 | customer:view |
| GET | `/v1/follow-ups/:id` | 查询跟进记录详情 | customer:view |
| POST | `/v1/follow-ups` | 创建跟进记录 | customer:follow |
| PATCH | `/v1/follow-ups/:id/cancel` | 作废跟进记录 | customer:follow |

---

## 5. 详细接口说明

### 5.1 创建客户

**端点**：`POST /v1/customers`

**请求体**：
```json
{
  "customer_name": "XX连锁酒店集团",
  "customer_type": "chain_hotel",
  "customer_level": "A",
  "customer_stage": "lead",
  "source_id": 1,
  "phone": "13800138000",
  "email": "contact@example.com",
  "province": "广东省",
  "city": "深圳市",
  "address": "南山区科技园",
  "contacts": [
    {
      "contact_name": "张经理",
      "position": "采购总监",
      "phone": "13900139000",
      "is_primary": 1
    }
  ]
}
```

**响应**：
```json
{
  "success": true,
  "code": 201,
  "message": "客户创建成功",
  "data": {
    "id": 1001,
    "customer_code": "CUST-20251224-001",
    "customer_name": "XX连锁酒店集团",
    "customer_type": "chain_hotel",
    "customer_stage": "lead",
    "created_at": "2025-12-24T10:30:00Z"
  }
}
```

### 5.2 创建报价单

**端点**：`POST /v1/quotations`

**请求体**：
```json
{
  "customer_id": 1001,
  "quotation_title": "XX酒店智能硬件采购报价单",
  "valid_from": "2025-12-24",
  "valid_until": "2026-01-23",
  "items": [
    {
      "product_id": 1,
      "quantity": 50,
      "standard_price": 3000.00,
      "actual_price": 2800.00
    },
    {
      "product_id": 2,
      "quantity": 100,
      "standard_price": 500.00,
      "actual_price": 450.00
    }
  ],
  "remarks": "批量采购优惠"
}
```

**响应**：
```json
{
  "success": true,
  "code": 201,
  "message": "报价单创建成功",
  "data": {
    "id": 2001,
    "quotation_code": "QUOTE-20251224-001",
    "customer_id": 1001,
    "total_amount": 185000.00,
    "discount_amount": 15000.00,
    "status": "draft",
    "created_at": "2025-12-24T10:35:00Z"
  }
}
```

### 5.3 查询合同执行进度

**端点**：`GET /v1/contracts/:id/execution-status`

**响应**：
```json
{
  "success": true,
  "data": {
    "contract_id": 3001,
    "contract_code": "CONTRACT-20251224-001",
    "contract_amount": 185000.00,
    "execution_progress": {
      "shipment": {
        "shipped_amount": 185000.00,
        "shipped_percentage": 100.00,
        "status": "completed"
      },
      "payment": {
        "received_amount": 129500.00,
        "received_percentage": 70.00,
        "status": "in_progress",
        "remaining_amount": 55500.00
      },
      "invoice": {
        "invoiced_amount": 129500.00,
        "invoiced_percentage": 70.00,
        "status": "in_progress"
      }
    },
    "next_payment_due": {
      "stage": "尾款",
      "amount": 55500.00,
      "due_date": "2026-02-01"
    }
  }
}
```

---

## 6. 错误码定义

### 6.1 HTTP 状态码

| 状态码 | 说明 | 使用场景 |
|--------|------|---------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 204 | No Content | 删除成功（无返回内容） |
| 400 | Bad Request | 参数校验失败 |
| 401 | Unauthorized | 未认证或Token失效 |
| 403 | Forbidden | 无权限访问 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突（如编码重复） |
| 422 | Unprocessable Entity | 业务逻辑校验失败 |
| 500 | Internal Server Error | 服务器内部错误 |

### 6.2 业务错误码

| 错误码 | 说明 |
|--------|------|
| 10001 | 参数校验失败 |
| 10002 | 资源不存在 |
| 10003 | 资源已存在（编码重复） |
| 20001 | 用户名或密码错误 |
| 20002 | Token无效或已过期 |
| 20003 | 无权限访问 |
| 20004 | 账户已被锁定 |
| 30001 | 客户阶段不允许回退 |
| 30002 | 报价单已过期 |
| 30003 | 合同不允许删除（已关联业务） |
| 30004 | 发货数量超过合同数量 |
| 40001 | 文件上传失败 |
| 40002 | PDF生成失败 |
| 50000 | 系统内部错误 |

---

## 附录：完整API端点统计

- **基础数据模块**：24个端点
- **业务流程模块**：62个端点
- **总计**：86个API端点

---

**文档维护说明**：
- 本文档应随需求变更同步更新
- 详细的请求/响应schema建议使用OpenAPI/Swagger生成
- API变更需遵循版本控制策略（/v1 → /v2）

