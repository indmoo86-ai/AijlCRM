# 艾居来CRM系统 - 后端开发指南

## 🎯 后端现状

### ✅ 已完成的部分

1. **基础框架**（100%）
   - Express.js 服务器
   - Sequelize ORM
   - JWT认证
   - CORS配置
   - 文件上传（Multer）

2. **数据模型**（100%）
   - User（用户）
   - Role（角色）
   - Permission（权限）
   - Lead（线索）
   - Customer（客户）
   - Product（产品）
   - Quotation（报价单）
   - QuotationItem（报价明细）
   - Contract（合同）
   - ContractItem（合同明细）
   - Shipment（发货单）
   - Payment（回款）
   - Invoice（发票）
   - ServiceTicket（服务工单）
   - Task（任务）
   - Attachment（附件）
   - 等30+个表模型

3. **路由和控制器**（95%）
   - ✅ /api/auth - 认证API
   - ✅ /api/leads - 线索管理
   - ✅ /api/customers - 客户管理
   - ✅ /api/products - 产品管理
   - ✅ /api/quotations - 报价管理
   - ✅ /api/contracts - 合同管理
   - ✅ /api/shipments - 发货管理
   - ✅ /api/payments - 回款管理
   - ✅ /api/invoices - 发票管理
   - ✅ /api/service-tickets - 服务工单
   - ✅ /api/tasks - 任务管理
   - ✅ /api/attachments - **附件管理（新增）**
   - ✅ /api/dashboard - **仪表板API（新增）**

---

## 🚀 快速开始

### 第1步：安装依赖

```bash
cd backend
npm install
```

### 第2步：配置环境变量

检查 `.env` 文件，确保配置正确：

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=aijulai_crm
DB_USER=root
DB_PASSWORD=your_password

# JWT配置
JWT_SECRET=smart_hotel_crm_secret_key_2024
```

### 第3步：初始化数据库

```bash
# 创建数据库和表
npm run init-db

# 创建测试数据
npm run seed
```

### 第4步：启动服务

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

服务将运行在：http://localhost:3000

---

## 📡 API接口文档

### 认证接口

#### POST /api/auth/login
登录获取Token

**请求体**：
```json
{
  "username": "admin",
  "password": "123456"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": 1,
      "username": "admin",
      "full_name": "管理员",
      "role": "admin"
    }
  }
}
```

#### GET /api/auth/profile
获取当前用户信息（需要Token）

**响应**：
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "username": "admin",
    "full_name": "管理员",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

### 附件管理接口（新增）

#### GET /api/attachments/:businessType/:businessId
获取指定业务对象的附件列表

**参数**：
- businessType: 业务类型（lead/customer/quotation/contract等）
- businessId: 业务对象ID

**响应**：
```json
{
  "success": true,
  "data": [
    {
      "attachment_id": 1,
      "business_type": "contract",
      "business_id": 123,
      "original_name": "合同扫描件.pdf",
      "file_name": "xxx-xxx-xxx.pdf",
      "file_path": "2025/12/26/xxx-xxx-xxx.pdf",
      "file_size": 1024000,
      "file_type": "application/pdf",
      "uploader_name": "admin",
      "created_at": "2025-12-26T10:00:00.000Z"
    }
  ]
}
```

#### POST /api/attachments
上传附件

**请求**：multipart/form-data
- file: 文件
- business_type: 业务类型
- business_id: 业务对象ID

**响应**：
```json
{
  "success": true,
  "message": "文件上传成功",
  "data": {
    "attachment_id": 1,
    "original_name": "合同扫描件.pdf",
    "file_path": "2025/12/26/xxx-xxx-xxx.pdf"
  }
}
```

#### GET /api/attachments/:id/download
下载附件

返回文件流

#### DELETE /api/attachments/:id
删除附件

**响应**：
```json
{
  "success": true,
  "message": "删除成功"
}
```

---

### 仪表板接口（新增）

#### GET /api/dashboard/stats
获取仪表板统计数据

**响应**：
```json
{
  "success": true,
  "data": {
    "leads": {
      "count": 120,
      "monthlyChange": 15
    },
    "customers": {
      "count": 80,
      "monthlyChange": 10
    },
    "tasks": {
      "pending": 25,
      "overdue": 3
    },
    "contracts": {
      "monthlyAmount": 57000,
      "count": 5
    }
  }
}
```

#### GET /api/dashboard/sales-funnel
获取销售漏斗数据

**响应**：
```json
{
  "success": true,
  "data": [
    { "name": "线索", "value": 120 },
    { "name": "客户", "value": 80 },
    { "name": "报价", "value": 50 },
    { "name": "合同", "value": 30 },
    { "name": "成交", "value": 25 }
  ]
}
```

#### GET /api/dashboard/performance-trend
获取业绩趋势数据

**查询参数**：
- period: week/month/quarter（默认month）

**响应**：
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-12-01",
      "count": 3,
      "amount": 15000
    },
    {
      "date": "2025-12-02",
      "count": 2,
      "amount": 10000
    }
  ]
}
```

---

### 其他业务接口

详细API文档请参考各控制器文件：

- **线索管理**：`src/controllers/leadController.js`
- **客户管理**：`src/controllers/customerController.js`
- **产品管理**：`src/controllers/productController.js`
- **报价管理**：`src/controllers/quotationController.js`
- **合同管理**：`src/controllers/contractController.js`
- **任务管理**：`src/controllers/taskController.js`
- 等等...

---

## 🔐 认证机制

所有API（除了登录和注册）都需要JWT Token认证。

### 请求头格式

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 获取Token

```bash
# 登录获取Token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

### 使用Token请求API

```bash
curl -X GET http://localhost:3000/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🗄️ 数据库结构

### 核心表

1. **users** - 用户表
2. **roles** - 角色表
3. **permissions** - 权限表
4. **leads** - 线索表
5. **customers** - 客户表
6. **products** - 产品表
7. **quotations** - 报价单表
8. **quotation_items** - 报价明细表
9. **contracts** - 合同表
10. **contract_items** - 合同明细表
11. **attachments** - 附件表（新增）

### 数据库初始化

```bash
# 运行初始化脚本
node scripts/init-database.js

# 创建测试数据
node scripts/seed-data.js
```

---

## 📂 项目结构

```
backend/
├── src/
│   ├── app.js                    # 应用入口
│   ├── config/
│   │   └── database.js           # 数据库配置
│   ├── models/                   # 数据模型（30+个）
│   │   ├── User.js
│   │   ├── Lead.js
│   │   ├── Customer.js
│   │   ├── Product.js
│   │   ├── Quotation.js
│   │   ├── Contract.js
│   │   ├── Attachment.js         # ✨ 附件模型
│   │   └── ...
│   ├── controllers/              # 控制器
│   │   ├── authController.js
│   │   ├── leadController.js
│   │   ├── customerController.js
│   │   ├── productController.js
│   │   ├── quotationController.js
│   │   ├── contractController.js
│   │   ├── attachmentController.js  # ✨ 附件控制器（新增）
│   │   ├── dashboardController.js   # ✨ 仪表板控制器（新增）
│   │   └── ...
│   ├── routes/                   # 路由
│   │   ├── auth.js
│   │   ├── leads.js
│   │   ├── customers.js
│   │   ├── products.js
│   │   ├── quotations.js
│   │   ├── contracts.js
│   │   ├── attachments.js        # ✨ 附件路由（新增）
│   │   ├── dashboard.js          # ✨ 仪表板路由（新增）
│   │   └── ...
│   ├── middleware/               # 中间件
│   │   └── auth.js               # JWT认证中间件
│   └── utils/                    # 工具函数
├── uploads/                      # 文件上传目录
│   └── temp/                     # 临时上传目录
├── scripts/                      # 脚本
│   ├── init-database.js          # 数据库初始化
│   └── seed-data.js              # 测试数据
├── .env                          # 环境变量
├── package.json
└── BACKEND-GUIDE.md              # 本文档
```

---

## 🧪 测试API

### 使用Postman

导入以下环境变量：
- `BASE_URL`: http://localhost:3000
- `TOKEN`: 登录后获取的JWT Token

### 使用curl

```bash
# 1. 登录获取Token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}' \
  | jq -r '.data.token')

# 2. 获取客户列表
curl -X GET http://localhost:3000/api/customers \
  -H "Authorization: Bearer $TOKEN"

# 3. 创建线索
curl -X POST http://localhost:3000/api/leads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lead_name": "测试酒店",
    "contact_name": "张经理",
    "phone": "13800138000"
  }'

# 4. 上传附件
curl -X POST http://localhost:3000/api/attachments \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/file.pdf" \
  -F "business_type=contract" \
  -F "business_id=1"
```

---

## ⚠️ 注意事项

### 1. 数据库连接

确保MySQL数据库已启动并可访问：

```bash
mysql -u root -p
CREATE DATABASE aijulai_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 文件上传目录权限

确保uploads目录有写权限：

```bash
chmod -R 755 uploads/
```

### 3. 跨域配置

开发环境默认允许 `http://localhost:5173` 跨域。
生产环境需要修改 `.env` 中的 `CORS_ORIGIN`。

### 4. JWT过期时间

默认Token有效期为7天，可在 `.env` 中修改 `JWT_EXPIRES_IN`。

---

## 🐛 常见问题

### Q1: 数据库连接失败

**原因**：数据库未启动或配置错误

**解决**：
1. 检查MySQL是否运行：`mysql.server start`
2. 检查`.env`中的数据库配置
3. 确认数据库已创建：`CREATE DATABASE aijulai_crm;`

### Q2: Token验证失败

**原因**：Token过期或无效

**解决**：
1. 重新登录获取新Token
2. 检查请求头格式：`Authorization: Bearer <token>`

### Q3: 文件上传失败

**原因**：uploads目录不存在或无权限

**解决**：
```bash
mkdir -p uploads/temp
chmod -R 755 uploads
```

### Q4: 端口被占用

**原因**：3000端口已被其他进程使用

**解决**：
```bash
# 查找占用端口的进程
lsof -i :3000

# 修改端口（.env文件）
PORT=3001
```

---

## 🚀 下一步

### 立即可做

1. **启动后端服务**
   ```bash
   npm run dev
   ```

2. **测试API**
   ```bash
   curl http://localhost:3000/health
   ```

3. **连接前端**
   - 前端已配置好API Base URL
   - 确保CORS配置正确

### 待完善功能

1. **用户管理API** - 添加、编辑、删除用户
2. **角色权限API** - 角色和权限管理
3. **系统设置API** - 系统参数配置
4. **数据导出** - Excel导出功能
5. **消息通知** - 邮件和短信通知

---

## 📖 参考文档

- [Express.js文档](https://expressjs.com/)
- [Sequelize文档](https://sequelize.org/)
- [JWT文档](https://jwt.io/)
- [Multer文档](https://github.com/expressjs/multer)

---

**文档更新日期**：2025-12-26
**版本**：v1.0
