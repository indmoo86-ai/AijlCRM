# API接口文档

## 基础信息

- **Base URL**: `http://your-domain.com/api`
- **认证方式**: JWT Bearer Token
- **请求格式**: JSON
- **响应格式**: JSON

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": "2024-12-17T10:00:00.000Z"
}
```

### 失败响应
```json
{
  "success": false,
  "code": 400,
  "message": "操作失败",
  "errors": null,
  "timestamp": "2024-12-17T10:00:00.000Z"
}
```

### 分页响应
```json
{
  "success": true,
  "code": 200,
  "message": "查询成功",
  "data": {
    "list": [],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  },
  "timestamp": "2024-12-17T10:00:00.000Z"
}
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 1. 认证相关

### 1.1 用户登录

**接口**: `POST /auth/login`

**请求参数**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "name": "系统管理员",
      "role": 6,
      "avatar": null
    }
  }
}
```

### 1.2 获取当前用户信息

**接口**: `GET /auth/profile`

**请求头**:
```
Authorization: Bearer {token}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "name": "系统管理员",
    "role": 6,
    "department": "管理部",
    "phone": "13800138000",
    "email": "admin@example.com"
  }
}
```

### 1.3 修改密码

**接口**: `PUT /auth/password`

**请求参数**:
```json
{
  "oldPassword": "admin123",
  "newPassword": "newpass123"
}
```

---

## 2. 产品管理

本模块支持产品分类管理、产品SKU管理、产品状态管理、搜索筛选和批量导入导出。

### 2.1 创建产品分类

**接口**: `POST /api/products/categories`

**请求参数**:
```json
{
  "categoryName": "智能客控系统",
  "categoryCode": "ROOM_CONTROL",
  "sortOrder": 1,
  "description": "酒店智能客控系统产品分类"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "categoryId": 1,
    "categoryName": "智能客控系统",
    "categoryCode": "ROOM_CONTROL",
    "sortOrder": 1,
    "isActive": 1,
    "createdAt": "2024-12-24T10:00:00.000Z"
  }
}
```

### 2.2 查询产品分类列表

**接口**: `GET /api/products/categories`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| isActive | int | 否 | 是否启用：1启用/0停用 |

**响应数据**: 参考分页响应格式

### 2.3 修改产品分类

**接口**: `PUT /api/products/categories/:id`

**请求参数**:
```json
{
  "categoryName": "智能客控系统-更新",
  "sortOrder": 2,
  "description": "更新后的描述"
}
```

### 2.4 启用/停用产品分类

**接口**: `PUT /api/products/categories/:id/status`

**请求参数**:
```json
{
  "isActive": 0
}
```

### 2.5 创建产品SKU

**接口**: `POST /api/products`

**请求参数**:
```json
{
  "productCode": "RCS-001",
  "productName": "智能客控主机标准版",
  "brand": "艾居来",
  "categoryId": 1,
  "supplier": "深圳XX科技有限公司",
  "costPrice": 800.00,
  "salePrice": 1500.00,
  "unit": "台",
  "productImages": ["http://example.com/img1.jpg", "http://example.com/img2.jpg"],
  "description": "标准版智能客控主机，支持灯光、窗帘、空调等设备控制",
  "status": "active"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "productId": 101,
    "productCode": "RCS-001",
    "productName": "智能客控主机标准版",
    "brand": "艾居来",
    "categoryId": 1,
    "salePrice": 1500.00,
    "status": "active",
    "createdAt": "2024-12-24T10:00:00.000Z"
  }
}
```

### 2.6 查询产品列表

**接口**: `GET /api/products`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页数量，默认20 |
| categoryId | int | 否 | 产品分类ID |
| brand | string | 否 | 品牌 |
| status | string | 否 | 产品状态：active在售/inactive停售/draft草稿 |
| keyword | string | 否 | 关键词搜索（产品名称/编码） |

**响应数据**: 参考分页响应格式

### 2.7 查询产品详情

**接口**: `GET /api/products/:id`

**响应数据**:
```json
{
  "success": true,
  "data": {
    "productId": 101,
    "productCode": "RCS-001",
    "productName": "智能客控主机标准版",
    "brand": "艾居来",
    "categoryId": 1,
    "categoryName": "智能客控系统",
    "supplier": "深圳XX科技有限公司",
    "costPrice": 800.00,
    "salePrice": 1500.00,
    "unit": "台",
    "productImages": ["http://example.com/img1.jpg"],
    "description": "标准版智能客控主机",
    "status": "active",
    "createdAt": "2024-12-24T10:00:00.000Z",
    "updatedAt": "2024-12-24T10:00:00.000Z"
  }
}
```

### 2.8 修改产品信息

**接口**: `PUT /api/products/:id`

**请求参数**:
```json
{
  "productName": "智能客控主机标准版V2",
  "salePrice": 1600.00,
  "description": "更新后的产品描述"
}
```

### 2.9 修改产品状态（上架/下架）

**接口**: `PUT /api/products/:id/status`

**请求参数**:
```json
{
  "status": "inactive"
}
```

### 2.10 批量导入产品

**接口**: `POST /api/products/import`

**请求格式**: `multipart/form-data`

**请求参数**:
- file: Excel文件（.xlsx格式）

**响应数据**:
```json
{
  "success": true,
  "data": {
    "totalRows": 100,
    "successCount": 95,
    "failCount": 5,
    "errors": [
      {
        "row": 10,
        "error": "产品编码已存在"
      }
    ]
  }
}
```

### 2.11 导出产品数据

**接口**: `GET /api/products/export`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| categoryId | int | 否 | 产品分类ID |
| status | string | 否 | 产品状态 |

**响应数据**: 返回Excel文件流

---

## 3. 客户管理

本模块管理客户信息、客户联系人、客户阶段管理、客户负责人转移和数据导入导出。

### 3.1 获取客户列表

**接口**: `GET /api/customers`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页数量，默认20 |
| customerStage | string | 否 | 客户阶段：lead/initial_contact/prospect/negotiation/client/inactive |
| customerType | string | 否 | 客户类型：chain_hotel/single_hotel/distributor/homestay/apartment |
| customerLevel | string | 否 | 客户等级：A/B/C |
| ownerId | int | 否 | 负责人ID |
| source | string | 否 | 客户来源 |
| province | string | 否 | 省份 |
| city | string | 否 | 城市 |
| keyword | string | 否 | 关键词搜索（客户名称/联系电话） |

**响应数据**: 参考分页响应格式

### 3.2 创建客户

**接口**: `POST /api/customers`

**请求参数**:
```json
{
  "customerName": "XX商务酒店",
  "customerType": "single_hotel",
  "customerLevel": "B",
  "customerStage": "lead",
  "industry": "经济型酒店",
  "province": "广东省",
  "city": "深圳市",
  "address": "南山区科技园南路XX号",
  "contactPhone": "0755-12345678",
  "hotelRooms": 100,
  "hotelStar": "三星",
  "source": "social_media",
  "description": "通过抖音沟通获取的线索",
  "ownerId": 3
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "customerId": 1001,
    "customerCode": "CUST-2024-001",
    "customerName": "XX商务酒店",
    "customerStage": "lead",
    "ownerId": 3,
    "createdAt": "2024-12-24T10:00:00.000Z"
  }
}
```

### 3.3 获取客户详情

**接口**: `GET /api/customers/:id`

**响应数据**:
```json
{
  "success": true,
  "data": {
    "customer": {
      "customerId": 1001,
      "customerCode": "CUST-2024-001",
      "customerName": "XX商务酒店",
      "customerType": "single_hotel",
      "customerStage": "lead",
      "province": "广东省",
      "city": "深圳市",
      "ownerId": 3,
      "ownerName": "张销售"
    },
    "contacts": [
      {
        "contactId": 1,
        "contactName": "李经理",
        "position": "总经理",
        "mobile": "13800138000",
        "isPrimary": 1
      }
    ],
    "quotations": [],
    "contracts": [],
    "followUps": []
  }
}
```

### 3.4 修改客户信息

**接口**: `PUT /api/customers/:id`

**请求参数**:
```json
{
  "customerName": "XX商务酒店集团",
  "customerLevel": "A",
  "description": "已升级为集团客户"
}
```

### 3.5 添加客户联系人

**接口**: `POST /api/customers/:id/contacts`

**请求参数**:
```json
{
  "contactName": "李经理",
  "position": "总经理",
  "mobile": "13800138001",
  "wechat": "lixxx",
  "email": "li@example.com",
  "isPrimary": 1,
  "description": "主要决策人"
}
```

### 3.6 推进客户阶段

**接口**: `PUT /api/customers/:id/stage`

**请求参数**:
```json
{
  "targetStage": "prospect",
  "stageDesc": "客户已确认有采购意向，进入意向客户阶段"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "customerId": 1001,
    "customerStage": "prospect",
    "stageBefore": "initial_contact",
    "stageAfter": "prospect",
    "stageUpdatedAt": "2024-12-24T10:00:00.000Z"
  }
}
```

### 3.7 转移客户负责人

**接口**: `PUT /api/customers/:id/owner`

**请求参数**:
```json
{
  "newOwnerId": 5,
  "transferReason": "销售人员离职，转移客户"
}
```

### 3.8 导出客户数据

**接口**: `GET /api/customers/export`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| customerStage | string | 否 | 客户阶段 |
| ownerId | int | 否 | 负责人ID |
| startDate | date | 否 | 创建开始日期 |
| endDate | date | 否 | 创建结束日期 |

**响应数据**: 返回Excel文件流

---

## 4. 用户权限管理

本模块管理用户账户、角色权限配置、用户启用/禁用和操作日志查询。

### 4.1 获取用户列表

**接口**: `GET /api/users`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页数量，默认20 |
| isActive | int | 否 | 是否启用：1启用/0禁用 |
| keyword | string | 否 | 关键词搜索（姓名/手机号） |

**响应数据**: 参考分页响应格式

### 4.2 创建用户

**接口**: `POST /api/users`

**请求参数**:
```json
{
  "userCode": "EMP001",
  "realName": "张三",
  "mobile": "13800138001",
  "email": "zhangsan@example.com",
  "password": "123456",
  "roleIds": [1, 2]
}
```

### 4.3 修改用户信息

**接口**: `PUT /api/users/:id`

**请求参数**:
```json
{
  "realName": "张三-销售",
  "email": "zhangsan@example.com"
}
```

### 4.4 启用/禁用用户

**接口**: `PUT /api/users/:id/status`

**请求参数**:
```json
{
  "isActive": 0,
  "reason": "员工离职"
}
```

### 4.5 查询角色列表

**接口**: `GET /api/roles`

**响应数据**:
```json
{
  "success": true,
  "data": [
    {
      "roleId": 1,
      "roleCode": "sales",
      "roleName": "销售人员",
      "description": "管理线索、客户、报价单、合同"
    },
    {
      "roleId": 2,
      "roleCode": "media",
      "roleName": "新媒体运营",
      "description": "录入和查看线索"
    }
  ]
}
```

### 4.6 配置角色权限

**接口**: `PUT /api/roles/:id/permissions`

**请求参数**:
```json
{
  "permissionIds": [1, 2, 3, 5, 8, 10]
}
```

### 4.7 分配用户角色

**接口**: `PUT /api/users/:id/roles`

**请求参数**:
```json
{
  "roleIds": [1, 3]
}
```

### 4.8 操作日志查询

**接口**: `GET /api/logs`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页数量，默认20 |
| userId | int | 否 | 操作人ID |
| moduleName | string | 否 | 操作模块 |
| actionType | string | 否 | 操作类型 |
| startDate | date | 否 | 开始日期 |
| endDate | date | 否 | 结束日期 |

**响应数据**: 参考分页响应格式

---

## 5. 线索管理

本模块管理销售线索录入、分配、跟进、阶段推进、线索池管理和批量导入导出。

### 5.1 获取线索列表

**接口**: `GET /api/leads`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页数量，默认20 |
| customerStage | string | 否 | 线索阶段：lead/initial_contact/prospect/negotiation |
| source | string | 否 | 渠道来源 |
| ownerId | int | 否 | 销售负责人ID（为空表示公海池线索） |
| province | string | 否 | 省份 |
| city | string | 否 | 城市 |
| keyword | string | 否 | 关键词搜索（客户名称/联系人/手机） |
| startDate | date | 否 | 创建开始日期 |
| endDate | date | 否 | 创建结束日期 |

**响应数据**: 参考分页响应格式

### 5.2 创建线索

**接口**: `POST /api/leads`

**请求参数**:
```json
{
  "customerName": "XX温泉酒店",
  "customerType": "single_hotel",
  "province": "广东省",
  "city": "深圳市",
  "address": "南山区XX路XX号",
  "contactPhone": "13800138000",
  "hotelRooms": 80,
  "source": "social_media",
  "description": "抖音私信咨询智能客控系统",
  "ownerId": 3
}
```

### 5.3 获取线索详情

**接口**: `GET /api/leads/:id`

**响应数据**:
```json
{
  "success": true,
  "data": {
    "customer": {
      "customerId": 1001,
      "customerName": "XX温泉酒店",
      "customerStage": "lead",
      "source": "social_media",
      "ownerId": 3,
      "ownerName": "张销售"
    },
    "contacts": [],
    "followUps": []
  }
}
```

### 5.4 更新线索

**接口**: `PUT /api/leads/:id`

**请求参数**:
```json
{
  "customerName": "XX温泉度假酒店",
  "hotelRooms": 100,
  "description": "客户确认有100间客房需要智能化改造"
}
```

### 5.5 添加跟进记录

**接口**: `POST /api/leads/:id/follow-up`

**请求参数**:
```json
{
  "followUpMethod": "phone",
  "contactPerson": "李经理",
  "followUpContent": "电话沟通客户需求，客户表示有智能客控系统采购意向",
  "customerFeedback": "客户希望了解产品详细报价",
  "nextFollowUpTime": "2024-12-26T10:00:00.000Z",
  "nextFollowUpContent": "准备报价单并预约现场拜访",
  "followUpResult": "successful",
  "attachmentUrls": []
}
```

### 5.6 线索转客户

**接口**: `POST /api/leads/:id/convert`

**请求参数**:
```json
{
  "targetStage": "prospect",
  "convertDesc": "客户已确认采购意向，转为意向客户"
}
```

### 5.7 分配线索

**接口**: `PUT /api/leads/:id/assign`

**请求参数**:
```json
{
  "ownerId": 3,
  "assignReason": "按区域分配线索"
}
```

### 5.8 放弃线索（放入公海池）

**接口**: `PUT /api/leads/:id/pool`

**请求参数**:
```json
{
  "abandonReason": "客户暂无预算，3个月后再联系"
}
```

**说明**: 放弃线索后，ownerId设为NULL，线索进入公海池，其他销售可领取

### 5.9 批量导入线索

**接口**: `POST /api/leads/import`

**请求格式**: `multipart/form-data`

**请求参数**:
- file: Excel文件（.xlsx格式）

**响应数据**:
```json
{
  "success": true,
  "data": {
    "totalRows": 50,
    "successCount": 48,
    "failCount": 2,
    "errors": [
      {
        "row": 10,
        "error": "客户名称重复"
      }
    ]
  }
}
```

### 5.10 线索统计分析

**接口**: `GET /api/leads/statistics`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| startDate | date | 否 | 开始日期 |
| endDate | date | 否 | 结束日期 |
| ownerId | int | 否 | 负责人ID |

**响应数据**:
```json
{
  "success": true,
  "data": {
    "totalLeads": 500,
    "byStage": {
      "lead": 200,
      "initial_contact": 150,
      "prospect": 100,
      "negotiation": 50
    },
    "bySource": {
      "social_media": 300,
      "exhibition": 100,
      "referral": 50,
      "website": 50
    },
    "conversionRate": 25.5
  }
}
```

---

## 6. 报价单管理

本模块管理报价单创建、产品选配、版本管理、有效期管理、PDF生成和转合同。

### 6.1 创建报价单

**接口**: `POST /api/quotations`

**请求参数**:
```json
{
  "quotationTitle": "XX酒店智能客控系统报价单",
  "customerId": 1001,
  "customerContactId": 5,
  "validFrom": "2024-12-24",
  "validUntil": "2025-01-23",
  "paymentTerms": "签约后支付50%，验收后支付50%",
  "deliveryTerms": "签约后15个工作日内发货",
  "items": [
    {
      "productId": 101,
      "quantity": 100,
      "standardPrice": 1500.00,
      "actualPrice": 1400.00,
      "discountRate": 6.67,
      "itemNote": "批量采购优惠"
    }
  ],
  "notes": "本报价单有效期30天"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "quotationId": 2001,
    "quotationNo": "QUOT-2024-001",
    "quotationTitle": "XX酒店智能客控系统报价单",
    "customerId": 1001,
    "totalAmount": 140000.00,
    "discountTotal": 10000.00,
    "status": "draft",
    "validFrom": "2024-12-24",
    "validUntil": "2025-01-23",
    "createdAt": "2024-12-24T10:00:00.000Z"
  }
}
```

### 6.2 查询报价单列表

**接口**: `GET /api/quotations`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页数量，默认20 |
| customerId | int | 否 | 客户ID |
| status | string | 否 | 状态：draft/sent/accepted/rejected/expired/superseded |
| ownerId | int | 否 | 负责人ID |
| startDate | date | 否 | 创建开始日期 |
| endDate | date | 否 | 创建结束日期 |

**响应数据**: 参考分页响应格式

### 6.3 查询报价单详情

**接口**: `GET /api/quotations/:id`

**响应数据**:
```json
{
  "success": true,
  "data": {
    "quotationId": 2001,
    "quotationNo": "QUOT-2024-001",
    "quotationTitle": "XX酒店智能客控系统报价单",
    "customerId": 1001,
    "customerName": "XX商务酒店",
    "customerContactId": 5,
    "contactName": "李经理",
    "status": "sent",
    "totalAmount": 140000.00,
    "discountTotal": 10000.00,
    "validFrom": "2024-12-24",
    "validUntil": "2025-01-23",
    "paymentTerms": "签约后支付50%，验收后支付50%",
    "deliveryTerms": "签约后15个工作日内发货",
    "pdfFileUrl": "http://example.com/quotations/QUOT-2024-001.pdf",
    "items": [
      {
        "itemId": 1,
        "productId": 101,
        "productCode": "RCS-001",
        "productName": "智能客控主机标准版",
        "quantity": 100,
        "standardPrice": 1500.00,
        "actualPrice": 1400.00,
        "discountAmount": 100.00,
        "discountRate": 6.67,
        "subtotal": 140000.00
      }
    ],
    "createdAt": "2024-12-24T10:00:00.000Z",
    "sentAt": "2024-12-24T14:00:00.000Z"
  }
}
```

### 6.4 修改报价单

**接口**: `PUT /api/quotations/:id`

**请求参数**:
```json
{
  "quotationTitle": "XX酒店智能客控系统报价单（修订版）",
  "validUntil": "2025-02-23",
  "items": [
    {
      "productId": 101,
      "quantity": 120,
      "actualPrice": 1350.00
    }
  ]
}
```

**说明**: 仅状态为draft的报价单可修改，已发送的报价单需创建新版本

### 6.5 添加报价单产品

**接口**: `POST /api/quotations/:id/items`

**请求参数**:
```json
{
  "productId": 102,
  "quantity": 100,
  "standardPrice": 500.00,
  "actualPrice": 450.00,
  "itemNote": "配套产品"
}
```

### 6.6 删除报价单产品

**接口**: `DELETE /api/quotations/:id/items/:itemId`

### 6.7 延长报价单有效期

**接口**: `PUT /api/quotations/:id/validity`

**请求参数**:
```json
{
  "newValidUntil": "2025-02-23",
  "extensionReason": "客户要求延期"
}
```

### 6.8 生成报价单PDF

**接口**: `POST /api/quotations/:id/pdf`

**响应数据**:
```json
{
  "success": true,
  "data": {
    "pdfFileUrl": "http://example.com/quotations/QUOT-2024-001.pdf",
    "generatedAt": "2024-12-24T10:00:00.000Z"
  }
}
```

### 6.9 报价单转合同

**接口**: `POST /api/quotations/:id/convert-to-contract`

**请求参数**:
```json
{
  "contractTitle": "XX酒店智能客控系统采购合同",
  "signedDate": "2024-12-25",
  "deliveryDeadline": "2025-01-10"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "contractId": 3001,
    "contractNo": "CONT-2024-001",
    "contractTitle": "XX酒店智能客控系统采购合同",
    "quotationId": 2001,
    "customerId": 1001,
    "contractAmount": 140000.00,
    "status": "draft",
    "createdAt": "2024-12-24T10:00:00.000Z"
  }
}
```

---

## 7. 合同管理

本模块管理合同创建、条款管理、签订流程、变更管理、执行跟踪和文件管理。

### 7.1 获取合同列表

**接口**: `GET /api/contracts`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页数量，默认20 |
| customerId | int | 否 | 客户ID |
| status | string | 否 | 状态：draft/signed/executing/completed/terminated |
| ownerId | int | 否 | 负责人ID |
| startDate | date | 否 | 签订开始日期 |
| endDate | date | 否 | 签订结束日期 |

**响应数据**: 参考分页响应格式

### 7.2 创建合同

**接口**: `POST /api/contracts`

**请求参数**:
```json
{
  "contractTitle": "XX酒店智能客控系统采购合同",
  "customerId": 1001,
  "customerContactId": 5,
  "sourceQuotationId": 2001,
  "contractAmount": 140000.00,
  "signedDate": "2024-12-25",
  "deliveryDeadline": "2025-01-10",
  "paymentTerms": [
    {
      "stage": "首付款",
      "paymentRatio": 50,
      "paymentAmount": 70000.00,
      "planDate": "2024-12-26",
      "paymentCondition": "签约后3个工作日内支付"
    },
    {
      "stage": "尾款",
      "paymentRatio": 50,
      "paymentAmount": 70000.00,
      "planDate": "2025-01-15",
      "paymentCondition": "验收合格后支付"
    }
  ],
  "deliveryTerms": "签约后15个工作日内发货到指定地点",
  "warrantyTerms": {
    "warrantyPeriod": "12个月",
    "warrantyStartType": "delivery",
    "warrantyScope": "产品质量问题免费保修"
  },
  "items": [
    {
      "productId": 101,
      "quantity": 100,
      "unitPrice": 1400.00
    }
  ]
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "contractId": 3001,
    "contractNo": "CONT-2024-001",
    "contractTitle": "XX酒店智能客控系统采购合同",
    "customerId": 1001,
    "contractAmount": 140000.00,
    "status": "draft",
    "createdAt": "2024-12-24T10:00:00.000Z"
  }
}
```

### 7.3 查询合同详情

**接口**: `GET /api/contracts/:id`

**响应数据**:
```json
{
  "success": true,
  "data": {
    "contractId": 3001,
    "contractNo": "CONT-2024-001",
    "contractTitle": "XX酒店智能客控系统采购合同",
    "customerId": 1001,
    "customerName": "XX商务酒店",
    "status": "executing",
    "contractAmount": 140000.00,
    "signedDate": "2024-12-25",
    "deliveryDeadline": "2025-01-10",
    "paymentTerms": [
      {
        "stage": "首付款",
        "paymentAmount": 70000.00,
        "planDate": "2024-12-26"
      }
    ],
    "deliveryTerms": "签约后15个工作日内发货",
    "warrantyTerms": {
      "warrantyPeriod": "12个月",
      "warrantyStartDate": "2025-01-08",
      "warrantyEndDate": "2026-01-08"
    },
    "executionProgress": 35.5,
    "shippedAmount": 140000.00,
    "receivedAmount": 70000.00,
    "invoicedAmount": 0.00,
    "items": [
      {
        "productId": 101,
        "productName": "智能客控主机标准版",
        "quantity": 100,
        "unitPrice": 1400.00,
        "subtotal": 140000.00,
        "shippedQuantity": 100
      }
    ],
    "shipments": [],
    "payments": [],
    "invoices": [],
    "amendments": []
  }
}
```

### 7.4 修改合同信息

**接口**: `PUT /api/contracts/:id`

**请求参数**:
```json
{
  "contractTitle": "XX酒店智能客控系统采购合同（修订）",
  "deliveryDeadline": "2025-01-15"
}
```

**说明**: 仅状态为draft的合同可修改，已签订的合同需创建补充协议

### 7.5 合同签订

**接口**: `PUT /api/contracts/:id/sign`

**请求参数**:
```json
{
  "signedDate": "2024-12-25",
  "contractFileUrl": "http://example.com/contracts/CONT-2024-001.pdf"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "contractId": 3001,
    "status": "signed",
    "signedDate": "2024-12-25",
    "signedAt": "2024-12-25T10:00:00.000Z"
  }
}
```

### 7.6 创建补充协议

**接口**: `POST /api/contracts/:id/amendments`

**请求参数**:
```json
{
  "amendmentTitle": "补充协议：增加产品数量",
  "amendmentType": "product_change",
  "amendmentContent": "因客户实际需求增加，合同产品数量从100台增加至120台",
  "amountChange": 28000.00,
  "newContractAmount": 168000.00,
  "signedDate": "2024-12-30"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "amendmentId": 1,
    "amendmentNo": "AMEND-2024-001",
    "contractId": 3001,
    "amendmentType": "product_change",
    "amountChange": 28000.00,
    "newContractAmount": 168000.00,
    "status": "draft",
    "createdAt": "2024-12-30T10:00:00.000Z"
  }
}
```

### 7.7 查询补充协议列表

**接口**: `GET /api/contracts/:id/amendments`

**响应数据**:
```json
{
  "success": true,
  "data": [
    {
      "amendmentId": 1,
      "amendmentNo": "AMEND-2024-001",
      "amendmentTitle": "补充协议：增加产品数量",
      "amendmentType": "product_change",
      "amountChange": 28000.00,
      "status": "signed",
      "signedDate": "2024-12-30"
    }
  ]
}
```

### 7.8 上传合同文件

**接口**: `POST /api/contracts/:id/files`

**请求格式**: `multipart/form-data`

**请求参数**:
- file: 合同文件（PDF格式）
- fileType: 文件类型（contract/amendment/attachment）

**响应数据**:
```json
{
  "success": true,
  "data": {
    "fileUrl": "http://example.com/contracts/CONT-2024-001-v1.pdf",
    "fileVersion": 1,
    "uploadedAt": "2024-12-25T10:00:00.000Z"
  }
}
```

### 7.9 查询合同文件列表

**接口**: `GET /api/contracts/:id/files`

**响应数据**:
```json
{
  "success": true,
  "data": [
    {
      "fileId": 1,
      "fileUrl": "http://example.com/contracts/CONT-2024-001-v1.pdf",
      "fileType": "contract",
      "fileVersion": 1,
      "uploadedAt": "2024-12-25T10:00:00.000Z"
    }
  ]
}
```

### 7.10 删除合同文件

**接口**: `DELETE /api/contracts/:id/files/:fileId`

### 7.11 查询合同执行进度

**接口**: `GET /api/contracts/:id/progress`

**响应数据**:
```json
{
  "success": true,
  "data": {
    "contractId": 3001,
    "contractAmount": 140000.00,
    "shippedAmount": 140000.00,
    "shippedProgress": 100.0,
    "receivedAmount": 70000.00,
    "receivedProgress": 50.0,
    "invoicedAmount": 0.00,
    "invoicedProgress": 0.0,
    "executionProgress": 50.0,
    "shipments": [
      {
        "shipmentNo": "SHIP-2024-001",
        "shipmentAmount": 140000.00,
        "actualShipDate": "2025-01-08"
      }
    ],
    "payments": [
      {
        "paymentNo": "PAY-2024-001",
        "paymentAmount": 70000.00,
        "paymentDate": "2024-12-26"
      }
    ]
  }
}
```

---

## 8. 待办任务管理

本模块管理待办任务的创建、分配、处理和统计分析。

### 8.1 查询任务列表

**接口**: `GET /api/tasks`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页数量，默认20 |
| status | string | 否 | 状态：pending/in_progress/completed/cancelled/overdue |
| priority | string | 否 | 优先级：high/medium/low |
| assigneeId | int | 否 | 任务负责人ID |
| taskType | string | 否 | 任务类型 |
| dueDate | date | 否 | 截止日期 |

**响应数据**: 参考分页响应格式

### 8.2 查询任务详情

**接口**: `GET /api/tasks/:id`

**响应数据**:
```json
{
  "success": true,
  "data": {
    "taskId": 5001,
    "taskType": "lead_follow_up",
    "taskTitle": "跟进线索：XX温泉酒店",
    "taskDescription": "客户要求本周内提供详细报价",
    "priority": "high",
    "status": "pending",
    "sourceType": "customer",
    "sourceId": 1001,
    "dueDate": "2024-12-26",
    "dueTime": "10:00:00",
    "assigneeId": 3,
    "assigneeName": "张销售",
    "createdAt": "2024-12-24T10:00:00.000Z"
  }
}
```

### 8.3 分配任务

**接口**: `PUT /api/tasks/:id/assign`

**请求参数**:
```json
{
  "assigneeId": 5,
  "assignReason": "原负责人离职，重新分配"
}
```

### 8.4 完成任务

**接口**: `PUT /api/tasks/:id/complete`

**请求参数**:
```json
{
  "resultNote": "已电话沟通客户，客户要求延期1周"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "taskId": 5001,
    "status": "completed",
    "completedAt": "2024-12-25T15:00:00.000Z"
  }
}
```

### 8.5 延期任务

**接口**: `PUT /api/tasks/:id/defer`

**请求参数**:
```json
{
  "newDueDate": "2024-12-28",
  "deferReason": "客户要求延期"
}
```

### 8.6 查询逾期任务

**接口**: `GET /api/tasks/overdue`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| assigneeId | int | 否 | 任务负责人ID |
| taskType | string | 否 | 任务类型 |

**响应数据**: 参考分页响应格式

### 8.7 任务统计分析

**接口**: `GET /api/tasks/statistics`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| assigneeId | int | 否 | 任务负责人ID |
| startDate | date | 否 | 开始日期 |
| endDate | date | 否 | 结束日期 |

**响应数据**:
```json
{
  "success": true,
  "data": {
    "totalTasks": 200,
    "pendingTasks": 50,
    "completedTasks": 140,
    "overdueTasks": 10,
    "completionRate": 70.0,
    "overdueRate": 5.0,
    "avgResponseTime": 3.5,
    "byType": {
      "lead_follow_up": 80,
      "quotation_expiring": 30,
      "contract_delivery": 40,
      "payment_reminder": 50
    }
  }
}
```

---

## 9. 发货管理

本模块管理发货单创建、物流信息管理、发货状态跟踪和分批发货。

### 9.1 创建发货单

**接口**: `POST /api/shipments`

**请求参数**:
```json
{
  "shipmentTitle": "XX酒店智能客控系统发货单",
  "contractId": 3001,
  "shippingAddress": "广东省深圳市南山区XX路XX号XX酒店",
  "contactPerson": "李经理",
  "contactPhone": "13800138000",
  "plannedShipDate": "2025-01-08",
  "items": [
    {
      "contractItemId": 1,
      "productId": 101,
      "thisShipmentQuantity": 100
    }
  ],
  "notes": "客户要求春节前到货"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "shipmentId": 4001,
    "shipmentNo": "SHIP-2024-001",
    "shipmentTitle": "XX酒店智能客控系统发货单",
    "contractId": 3001,
    "customerId": 1001,
    "shipmentAmount": 140000.00,
    "status": "draft",
    "createdAt": "2024-12-24T10:00:00.000Z"
  }
}
```

### 9.2 查询发货单列表

**接口**: `GET /api/shipments`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页数量，默认20 |
| contractId | int | 否 | 合同ID |
| customerId | int | 否 | 客户ID |
| status | string | 否 | 状态：draft/pending/shipped/in_transit/delivered/cancelled |
| startDate | date | 否 | 发货开始日期 |
| endDate | date | 否 | 发货结束日期 |

**响应数据**: 参考分页响应格式

### 9.3 查询发货单详情

**接口**: `GET /api/shipments/:id`

**响应数据**:
```json
{
  "success": true,
  "data": {
    "shipmentId": 4001,
    "shipmentNo": "SHIP-2024-001",
    "contractId": 3001,
    "contractNo": "CONT-2024-001",
    "customerId": 1001,
    "customerName": "XX商务酒店",
    "status": "shipped",
    "shipmentAmount": 140000.00,
    "logisticsCompany": "顺丰速运",
    "trackingNo": "SF1234567890",
    "shippingAddress": "广东省深圳市南山区XX路XX号",
    "contactPerson": "李经理",
    "contactPhone": "13800138000",
    "plannedShipDate": "2025-01-08",
    "actualShipDate": "2025-01-08",
    "estimatedDeliveryDate": "2025-01-10",
    "items": [
      {
        "itemId": 1,
        "productId": 101,
        "productName": "智能客控主机标准版",
        "contractQuantity": 100,
        "alreadyShippedQuantity": 0,
        "thisShipmentQuantity": 100,
        "remainingQuantity": 0,
        "unitPrice": 1400.00,
        "subtotal": 140000.00
      }
    ]
  }
}
```

### 9.4 修改发货单

**接口**: `PUT /api/shipments/:id`

**请求参数**:
```json
{
  "plannedShipDate": "2025-01-10",
  "notes": "客户要求延期发货"
}
```

**说明**: 仅状态为draft的发货单可修改

### 9.5 确认发货

**接口**: `PUT /api/shipments/:id/confirm`

**请求参数**:
```json
{
  "logisticsCompany": "顺丰速运",
  "trackingNo": "SF1234567890",
  "actualShipDate": "2025-01-08",
  "estimatedDeliveryDate": "2025-01-10"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "shipmentId": 4001,
    "status": "shipped",
    "actualShipDate": "2025-01-08",
    "shippedAt": "2025-01-08T10:00:00.000Z"
  }
}
```

### 9.6 更新物流信息

**接口**: `PUT /api/shipments/:id/logistics`

**请求参数**:
```json
{
  "logisticsCompany": "德邦物流",
  "trackingNo": "DB9876543210",
  "updateReason": "物流公司变更"
}
```

### 9.7 签收确认

**接口**: `PUT /api/shipments/:id/sign`

**请求参数**:
```json
{
  "actualDeliveryDate": "2025-01-10",
  "signNotes": "客户已签收，产品完好"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "shipmentId": 4001,
    "status": "delivered",
    "actualDeliveryDate": "2025-01-10",
    "deliveredAt": "2025-01-10T15:00:00.000Z"
  }
}
```

### 9.8 取消发货

**接口**: `PUT /api/shipments/:id/cancel`

**请求参数**:
```json
{
  "cancelReason": "客户要求暂停发货"
}
```

---

## 10. 收款管理

本模块管理收款记录创建、收款方式管理、分期收款跟踪和应收账款统计。

### 10.1 查询收款记录列表

**接口**: `GET /api/payments`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页数量，默认20 |
| contractId | int | 否 | 合同ID |
| customerId | int | 否 | 客户ID |
| status | string | 否 | 状态：draft/confirmed/cancelled |
| paymentMethod | string | 否 | 收款方式 |
| startDate | date | 否 | 收款开始日期 |
| endDate | date | 否 | 收款结束日期 |

**响应数据**: 参考分页响应格式

### 10.2 创建收款记录

**接口**: `POST /api/payments`

**请求参数**:
```json
{
  "contractId": 3001,
  "paymentStage": "首付款",
  "paymentAmount": 70000.00,
  "paymentDate": "2024-12-26",
  "paymentMethod": "bank_transfer",
  "bankAccount": "工商银行深圳分行账户",
  "transactionNo": "202412260001",
  "payerName": "XX商务酒店有限公司",
  "expectedAmount": 70000.00,
  "paymentNote": "首付款按时到账"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "paymentId": 6001,
    "paymentNo": "PAY-2024-001",
    "contractId": 3001,
    "customerId": 1001,
    "paymentStage": "首付款",
    "paymentAmount": 70000.00,
    "status": "draft",
    "createdAt": "2024-12-26T10:00:00.000Z"
  }
}
```

### 10.3 查询收款详情

**接口**: `GET /api/payments/:id`

**响应数据**:
```json
{
  "success": true,
  "data": {
    "paymentId": 6001,
    "paymentNo": "PAY-2024-001",
    "contractId": 3001,
    "contractNo": "CONT-2024-001",
    "customerId": 1001,
    "customerName": "XX商务酒店",
    "paymentStage": "首付款",
    "paymentAmount": 70000.00,
    "paymentDate": "2024-12-26",
    "paymentMethod": "bank_transfer",
    "bankAccount": "工商银行深圳分行账户",
    "transactionNo": "202412260001",
    "payerName": "XX商务酒店有限公司",
    "expectedAmount": 70000.00,
    "stagePaidAmount": 70000.00,
    "stageBalanceAmount": 0.00,
    "isStageSettled": 1,
    "status": "confirmed",
    "confirmDate": "2024-12-26T14:00:00.000Z",
    "createdAt": "2024-12-26T10:00:00.000Z"
  }
}
```

### 10.4 确认收款

**接口**: `PUT /api/payments/:id/confirm`

**请求参数**:
```json
{
  "confirmNote": "已核实银行到账"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "paymentId": 6001,
    "status": "confirmed",
    "confirmDate": "2024-12-26T14:00:00.000Z"
  }
}
```

**说明**: 收款确认后自动更新contract.received_amount

### 10.5 作废收款

**接口**: `PUT /api/payments/:id/void`

**请求参数**:
```json
{
  "voidReason": "收款记录重复，作废"
}
```

**说明**: 作废收款后自动回退contract.received_amount

### 10.6 应收账款统计

**接口**: `GET /api/payments/statistics`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| customerId | int | 否 | 客户ID |
| startDate | date | 否 | 开始日期 |
| endDate | date | 否 | 结束日期 |

**响应数据**:
```json
{
  "success": true,
  "data": {
    "totalContractAmount": 500000.00,
    "totalReceivedAmount": 250000.00,
    "totalReceivableAmount": 250000.00,
    "receivedRate": 50.0,
    "overdueReceivableAmount": 50000.00,
    "byCustomer": [
      {
        "customerId": 1001,
        "customerName": "XX商务酒店",
        "contractAmount": 140000.00,
        "receivedAmount": 70000.00,
        "receivableAmount": 70000.00
      }
    ]
  }
}
```

### 10.7 查询逾期应收

**接口**: `GET /api/payments/overdue`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| customerId | int | 否 | 客户ID |

**响应数据**:
```json
{
  "success": true,
  "data": [
    {
      "contractId": 3002,
      "contractNo": "CONT-2024-002",
      "customerId": 1002,
      "customerName": "YY酒店",
      "paymentStage": "尾款",
      "expectedAmount": 50000.00,
      "receivedAmount": 0.00,
      "balanceAmount": 50000.00,
      "planDate": "2024-12-20",
      "overdueDays": 6
    }
  ]
}
```

### 10.8 导出收款记录

**接口**: `GET /api/payments/export`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| contractId | int | 否 | 合同ID |
| customerId | int | 否 | 客户ID |
| startDate | date | 否 | 收款开始日期 |
| endDate | date | 否 | 收款结束日期 |

**响应数据**: 返回Excel文件流

---

## 11. 发票管理

本模块管理发票记录创建、发票类型与信息管理、发票状态管理和发票统计分析。

### 11.1 查询发票列表

**接口**: `GET /api/invoices`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页数量，默认20 |
| contractId | int | 否 | 合同ID |
| customerId | int | 否 | 客户ID |
| status | string | 否 | 状态：draft/confirmed/voided |
| invoiceType | string | 否 | 发票类型：vat_special/vat_normal |
| startDate | date | 否 | 开票开始日期 |
| endDate | date | 否 | 开票结束日期 |

**响应数据**: 参考分页响应格式

### 11.2 创建发票记录

**接口**: `POST /api/invoices`

**请求参数**:
```json
{
  "contractId": 3001,
  "paymentId": 6001,
  "invoiceType": "vat_special",
  "invoiceAmount": 70000.00,
  "invoiceDate": "2024-12-27",
  "invoiceTitle": "XX商务酒店有限公司",
  "taxNumber": "91440300XXXXXXXXXX",
  "companyAddress": "广东省深圳市南山区XX路XX号",
  "companyPhone": "0755-12345678",
  "bankName": "工商银行深圳分行",
  "bankAccount": "6222XXXXXXXXXXXX",
  "invoiceNote": "首付款开票"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "invoiceId": 7001,
    "invoiceNo": "待开具后自动填充",
    "contractId": 3001,
    "customerId": 1001,
    "invoiceType": "vat_special",
    "invoiceAmount": 70000.00,
    "status": "draft",
    "createdAt": "2024-12-27T10:00:00.000Z"
  }
}
```

### 11.3 查询发票详情

**接口**: `GET /api/invoices/:id`

**响应数据**:
```json
{
  "success": true,
  "data": {
    "invoiceId": 7001,
    "invoiceNo": "12345678",
    "contractId": 3001,
    "contractNo": "CONT-2024-001",
    "customerId": 1001,
    "customerName": "XX商务酒店",
    "paymentId": 6001,
    "invoiceType": "vat_special",
    "invoiceAmount": 70000.00,
    "invoiceDate": "2024-12-27",
    "invoiceTitle": "XX商务酒店有限公司",
    "taxNumber": "91440300XXXXXXXXXX",
    "companyAddress": "广东省深圳市南山区XX路XX号",
    "companyPhone": "0755-12345678",
    "bankName": "工商银行深圳分行",
    "bankAccount": "6222XXXXXXXXXXXX",
    "status": "confirmed",
    "confirmDate": "2024-12-27T14:00:00.000Z",
    "createdAt": "2024-12-27T10:00:00.000Z"
  }
}
```

### 11.4 修改发票信息

**接口**: `PUT /api/invoices/:id`

**请求参数**:
```json
{
  "invoiceTitle": "XX商务酒店集团有限公司",
  "companyAddress": "更新后的地址"
}
```

**说明**: 仅状态为draft的发票可修改

### 11.5 确认开票

**接口**: `PUT /api/invoices/:id/confirm`

**请求参数**:
```json
{
  "invoiceNo": "12345678",
  "invoiceDate": "2024-12-27"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "invoiceId": 7001,
    "invoiceNo": "12345678",
    "status": "confirmed",
    "confirmDate": "2024-12-27T14:00:00.000Z"
  }
}
```

**说明**: 确认开票后自动更新contract.invoiced_amount

### 11.6 作废发票

**接口**: `PUT /api/invoices/:id/void`

**请求参数**:
```json
{
  "voidReason": "客户信息错误，需重新开具"
}
```

**说明**: 作废发票后自动回退contract.invoiced_amount

### 11.7 发票统计分析

**接口**: `GET /api/invoices/statistics`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| customerId | int | 否 | 客户ID |
| startDate | date | 否 | 开始日期 |
| endDate | date | 否 | 结束日期 |

**响应数据**:
```json
{
  "success": true,
  "data": {
    "totalInvoicedAmount": 200000.00,
    "totalUninvoicedAmount": 300000.00,
    "invoicedRate": 40.0,
    "byType": {
      "vat_special": 150000.00,
      "vat_normal": 50000.00
    },
    "byMonth": [
      {
        "month": "2024-12",
        "invoicedAmount": 70000.00,
        "invoiceCount": 2
      }
    ]
  }
}
```

### 11.8 导出发票记录

**接口**: `GET /api/invoices/export`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| contractId | int | 否 | 合同ID |
| customerId | int | 否 | 客户ID |
| startDate | date | 否 | 开票开始日期 |
| endDate | date | 否 | 开票结束日期 |

**响应数据**: 返回Excel文件流

---

## 12. 售后服务

本模块管理服务工单创建、工单状态跟踪、工单分配与转派、客户满意度评价和工单统计分析。

### 12.1 查询工单列表

**接口**: `GET /api/service-tickets`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页数量，默认20 |
| customerId | int | 否 | 客户ID |
| contractId | int | 否 | 合同ID |
| ticketType | string | 否 | 工单类型：repair/replacement/technical_support/inspection |
| priority | string | 否 | 优先级：urgent/high/medium/low |
| status | string | 否 | 状态：pending/in_progress/pending_acceptance/resolved/closed/cancelled |
| assignedTo | int | 否 | 处理人ID |
| isUnderWarranty | int | 否 | 是否在保：1在保/0不在保 |

**响应数据**: 参考分页响应格式

### 12.2 创建服务工单

**接口**: `POST /api/service-tickets`

**请求参数**:
```json
{
  "ticketType": "repair",
  "ticketTitle": "XX酒店3楼客控系统故障",
  "priority": "high",
  "customerId": 1001,
  "customerContactId": 5,
  "contractId": 3001,
  "productId": 101,
  "problemDescription": "3楼客控系统无法正常控制灯光和空调",
  "expectedResolveDate": "2024-12-28",
  "attachmentUrls": ["http://example.com/fault-photo.jpg"]
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "ticketId": 8001,
    "ticketNo": "TICKET-2024-001",
    "ticketType": "repair",
    "ticketTitle": "XX酒店3楼客控系统故障",
    "priority": "high",
    "status": "pending",
    "customerId": 1001,
    "isUnderWarranty": 1,
    "warrantyEndDate": "2026-01-08",
    "reportedAt": "2024-12-26T10:00:00.000Z",
    "createdAt": "2024-12-26T10:00:00.000Z"
  }
}
```

### 12.3 查询工单详情

**接口**: `GET /api/service-tickets/:id`

**响应数据**:
```json
{
  "success": true,
  "data": {
    "ticketId": 8001,
    "ticketNo": "TICKET-2024-001",
    "ticketType": "repair",
    "ticketTitle": "XX酒店3楼客控系统故障",
    "priority": "high",
    "status": "resolved",
    "customerId": 1001,
    "customerName": "XX商务酒店",
    "customerContactId": 5,
    "contactName": "李经理",
    "contactPhone": "13800138000",
    "contractId": 3001,
    "productId": 101,
    "productName": "智能客控主机标准版",
    "problemDescription": "3楼客控系统无法正常控制灯光和空调",
    "problemAnalysis": "经检查发现主机故障",
    "solution": "更换主机后问题解决",
    "isUnderWarranty": 1,
    "warrantyEndDate": "2026-01-08",
    "serviceFee": 0.00,
    "partsCost": 800.00,
    "totalCost": 800.00,
    "paymentStatus": "waived",
    "assignedTo": 10,
    "assignedToName": "王工程师",
    "reportedAt": "2024-12-26T10:00:00.000Z",
    "firstResponseAt": "2024-12-26T11:00:00.000Z",
    "resolvedAt": "2024-12-27T15:00:00.000Z",
    "customerRating": 5,
    "customerFeedback": "服务及时，问题解决快",
    "logs": [
      {
        "logId": 1,
        "logType": "assign",
        "logContent": "工单已分配给王工程师处理",
        "createdBy": 1,
        "createdAt": "2024-12-26T10:30:00.000Z"
      }
    ]
  }
}
```

### 12.4 修改工单信息

**接口**: `PUT /api/service-tickets/:id`

**请求参数**:
```json
{
  "priority": "urgent",
  "expectedResolveDate": "2024-12-27",
  "updateReason": "客户要求加急处理"
}
```

### 12.5 分配/转派工单

**接口**: `PUT /api/service-tickets/:id/assign`

**请求参数**:
```json
{
  "assignedTo": 10,
  "assignReason": "按区域分配工单"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "ticketId": 8001,
    "status": "in_progress",
    "assignedTo": 10,
    "assignedToName": "王工程师"
  }
}
```

### 12.6 解决工单

**接口**: `PUT /api/service-tickets/:id/resolve`

**请求参数**:
```json
{
  "problemAnalysis": "经检查发现主机故障",
  "solution": "更换主机后问题解决",
  "serviceFee": 0.00,
  "partsCost": 800.00,
  "replacedParts": [
    {
      "partName": "智能客控主机",
      "partCode": "RCS-001",
      "quantity": 1,
      "unitCost": 800.00
    }
  ],
  "attachmentUrls": ["http://example.com/repair-photo.jpg"]
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "ticketId": 8001,
    "status": "resolved",
    "resolvedAt": "2024-12-27T15:00:00.000Z"
  }
}
```

### 12.7 关闭工单

**接口**: `PUT /api/service-tickets/:id/close`

**请求参数**:
```json
{
  "closeNote": "客户确认问题已解决，工单关闭"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "ticketId": 8001,
    "status": "closed",
    "closedAt": "2024-12-28T10:00:00.000Z"
  }
}
```

### 12.8 添加工单操作记录

**接口**: `POST /api/service-tickets/:id/logs`

**请求参数**:
```json
{
  "logType": "comment",
  "logContent": "已联系客户确认问题现象",
  "attachmentUrls": []
}
```

### 12.9 客户评价

**接口**: `POST /api/service-tickets/:id/rating`

**请求参数**:
```json
{
  "customerRating": 5,
  "customerFeedback": "服务及时，问题解决快，非常满意"
}
```

**响应数据**:
```json
{
  "success": true,
  "data": {
    "ticketId": 8001,
    "customerRating": 5,
    "ratedAt": "2024-12-28T16:00:00.000Z"
  }
}
```

### 12.10 工单统计分析

**接口**: `GET /api/service-tickets/statistics`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| customerId | int | 否 | 客户ID |
| startDate | date | 否 | 开始日期 |
| endDate | date | 否 | 结束日期 |

**响应数据**:
```json
{
  "success": true,
  "data": {
    "totalTickets": 100,
    "byStatus": {
      "pending": 10,
      "in_progress": 20,
      "resolved": 50,
      "closed": 20
    },
    "byType": {
      "repair": 60,
      "replacement": 20,
      "technical_support": 15,
      "inspection": 5
    },
    "byPriority": {
      "urgent": 10,
      "high": 30,
      "medium": 40,
      "low": 20
    },
    "avgResponseTime": 2.5,
    "avgResolveTime": 24.5,
    "avgCustomerRating": 4.6,
    "warrantyTickets": 70,
    "nonWarrantyTickets": 30
  }
}
```

---

## 13. 数据看板

### 13.1 获取看板数据

**接口**: `GET /api/dashboard`

**响应数据**:
```json
{
  "success": true,
  "data": {
    "salesFunnel": {
      "leads": 100,
      "customers": 50,
      "quotations": 30,
      "contracts": 15
    },
    "channelAnalysis": [
      {
        "channel": "social_media",
        "count": 60,
        "conversionRate": 25.5
      }
    ],
    "performanceStats": {
      "totalContractAmount": 500000.00,
      "totalReceivedAmount": 250000.00,
      "totalInvoicedAmount": 200000.00
    },
    "paymentStats": {
      "receivableAmount": 250000.00,
      "overdueAmount": 50000.00
    },
    "customerAnalysis": {
      "totalCustomers": 50,
      "activeCustomers": 40,
      "inactiveCustomers": 10
    }
  }
}
```

---

## 附录

### A. 角色权限说明

| 角色ID | 角色名称 | 说明 |
|--------|----------|------|
| 1 | 销售人员 | 管理线索、客户、报价单、合同 |
| 2 | 新媒体运营 | 录入和查看线索 |
| 3 | 销售主管 | 管理团队数据 |
| 4 | 运维人员 | 处理工单、发货管理 |
| 5 | 财务人员 | 管理收款和发票 |
| 6 | 管理员 | 所有权限 |

### B. 文件上传

**接口**: `POST /api/upload`

**请求格式**: `multipart/form-data`

**响应数据**:
```json
{
  "success": true,
  "data": {
    "url": "/uploads/2024/12/xxxxx.jpg",
    "filename": "xxxxx.jpg",
    "size": 102400
  }
}
```

---

**文档版本**: V2.0
**最后更新**: 2024-12-24
**覆盖范围**: 完整覆盖requirements.md中定义的全部79个User Stories
