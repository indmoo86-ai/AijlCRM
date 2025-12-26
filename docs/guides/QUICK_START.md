# 艾居来 CRM - 快速开始指南

## 前置要求

- Node.js 18+
- Docker Desktop (或本地 MySQL 8.0+)
- Git

---

## 一、克隆并安装依赖

```bash
# 进入项目目录
cd /Users/robin/claude\ code/CRM

# 安装后端依赖
cd backend
npm install

# 返回项目根目录
cd ..
```

---

## 二、数据库设置

### 方案 A: 使用 Docker（推荐）

```bash
# 1. 启动 MySQL 容器
docker run -d \
  --name aijulai-mysql \
  -e MYSQL_ROOT_PASSWORD=aijulai2024 \
  -e MYSQL_DATABASE=aijulai_crm \
  -p 3306:3306 \
  mysql:8.0 \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci

# 2. 等待 MySQL 启动（约30秒）
docker logs -f aijulai-mysql
# 看到 "ready for connections" 后按 Ctrl+C

# 3. 执行 SQL 脚本创建表结构
docker exec -i aijulai-mysql mysql -uroot -paijulai2024 aijulai_crm < database/schema_full.sql

# 4. 验证表创建成功
docker exec -it aijulai-mysql mysql -uroot -paijulai2024 aijulai_crm -e "SHOW TABLES;"
```

### 方案 B: 使用 Sequelize Sync（快速但缺少约束）

```bash
# 更新 .env 文件中的数据库密码
# DB_PASSWORD=aijulai2024

# 运行初始化脚本
cd backend
node scripts/init-database.js
```

**详细说明见**: [DATABASE_SETUP.md](./DATABASE_SETUP.md)

---

## 三、创建种子数据（可选但推荐）

```bash
cd backend
node scripts/seed-data.js
```

**种子数据包括:**
- 3 个初始用户（管理员、销售、主管）
- 6 个系统角色 + 40+ 权限
- 6 个产品分类 + 3 个示例产品
- 10 个客户来源渠道

**登录账号:**
- 管理员: `admin` / `admin123`
- 销售: `sales001` / `sales123`
- 主管: `manager001` / `manager123`

---

## 四、启动后端服务

```bash
cd backend

# 开发模式（自动重启）
npm run dev

# 或生产模式
npm start
```

服务启动在: **http://localhost:3000**

验证服务:
```bash
curl http://localhost:3000/health
```

---

## 五、测试 API

### 使用 curl 测试

```bash
# 1. 用户登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# 复制返回的 token

# 2. 查询产品列表
curl http://localhost:3000/api/products?page=1&pageSize=10 \
  -H "Authorization: Bearer <你的token>"

# 3. 查询客户来源
curl http://localhost:3000/api/customers/sources \
  -H "Authorization: Bearer <你的token>"
```

### 使用 Postman

1. 导入 API Collection（待创建）
2. 设置环境变量 `baseUrl` = `http://localhost:3000`
3. 登录获取 token
4. 使用 token 测试其他接口

---

## 六、开发前端（待实现）

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端启动在: **http://localhost:5173**

---

## 常用命令速查

### 数据库管理

```bash
# 进入 MySQL 容器
docker exec -it aijulai-mysql mysql -uroot -paijulai2024 aijulai_crm

# 查看所有表
SHOW TABLES;

# 查看表结构
DESC product;
DESC customer;

# 查看数据
SELECT * FROM t_user;
SELECT * FROM product_category;

# 重置数据库（危险！会删除所有数据）
docker exec -it aijulai-mysql mysql -uroot -paijulai2024 \
  -e "DROP DATABASE IF EXISTS aijulai_crm; CREATE DATABASE aijulai_crm DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
docker exec -i aijulai-mysql mysql -uroot -paijulai2024 aijulai_crm < database/schema_full.sql
```

### Docker 容器管理

```bash
# 启动容器
docker start aijulai-mysql

# 停止容器
docker stop aijulai-mysql

# 查看日志
docker logs aijulai-mysql

# 查看容器状态
docker ps -a | grep aijulai

# 删除容器（会丢失数据）
docker rm -f aijulai-mysql
```

### 后端服务

```bash
# 测试数据库连接
node backend/test-db-connection.js

# 初始化数据库表
node backend/scripts/init-database.js

# 创建种子数据
node backend/scripts/seed-data.js

# 启动开发服务器（自动重启）
cd backend && npm run dev

# 启动生产服务器
cd backend && npm start
```

---

## 项目结构

```
CRM/
├── backend/                    # 后端目录
│   ├── src/
│   │   ├── config/            # 配置文件
│   │   │   └── database.js    # 数据库配置
│   │   ├── models/            # Sequelize 模型 (27个)
│   │   │   ├── index.js       # 模型关联定义
│   │   │   ├── User.js
│   │   │   ├── Customer.js
│   │   │   └── ...
│   │   ├── controllers/       # 业务控制器 (13个)
│   │   │   ├── authController.js
│   │   │   ├── leadController.js
│   │   │   └── ...
│   │   ├── routes/            # 路由定义 (13个)
│   │   │   ├── auth.js
│   │   │   ├── leads.js
│   │   │   └── ...
│   │   ├── middleware/        # 中间件
│   │   │   └── auth.js        # JWT 认证
│   │   ├── utils/             # 工具函数
│   │   │   └── response.js    # 统一响应格式
│   │   └── app.js             # Express 应用入口
│   ├── scripts/               # 脚本工具
│   │   ├── init-database.js   # 数据库初始化
│   │   └── seed-data.js       # 种子数据
│   ├── test-db-connection.js  # 连接测试
│   ├── .env                   # 环境变量
│   ├── package.json
│   └── ...
├── database/
│   └── schema_full.sql        # 完整 DDL (27张表)
├── frontend/                  # 前端目录（待创建）
├── docs/
│   ├── requirements.md        # 需求文档 (v9.1)
│   └── API.md                 # API 文档
├── DATABASE_SETUP.md          # 数据库部署指南
├── IMPLEMENTATION_PROGRESS.md # 实施进度报告
├── QUICK_START.md             # 本文档
├── CLAUDE.md                  # 工作方式说明
└── README.md                  # 项目说明
```

---

## 技术栈

### 后端
- **运行环境**: Node.js 18+
- **框架**: Express.js 4.18
- **ORM**: Sequelize 6.35
- **数据库**: MySQL 8.0
- **认证**: JWT (jsonwebtoken)

### 前端（待实现）
- **框架**: Vue 3
- **构建工具**: Vite
- **UI 库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4

---

## API 接口总览

**已实现 70+ API 接口**, 分布在 11 个模块:

| 模块 | 接口数 | 说明 |
|------|--------|------|
| 认证 | 2 | 登录、注册 |
| 线索管理 | 8 | CRUD、跟进、转客户、统计 |
| 产品管理 | 7 | CRUD、导入导出 |
| 报价管理 | 8 | CRUD、审批、生成PDF、转合同 |
| 客户管理 | 8 | CRUD、联系人、阶段推进、转移 |
| 合同管理 | 11 | CRUD、签署、变更、附件、进度 |
| 任务管理 | 7 | CRUD、分配、完成、统计 |
| 发货管理 | 8 | CRUD、确认、物流、签收 |
| 收款管理 | 6 | CRUD、确认、作废、统计 |
| 发票管理 | 7 | CRUD、开具、作废、统计 |
| 售后管理 | 9 | CRUD、分配、处理、评价 |

**详细 API 文档**: [docs/API.md](./docs/API.md)

---

## 核心业务流程

### 销售流程
```
线索录入 → 持续跟进 → 转为客户 → 创建报价 →
报价审批 → 签订合同 → 确认发货 → 确认收款 → 开具发票
```

### 售后流程
```
客户报障 → 创建工单 → 分配处理人 →
现场处理 → 解决问题 → 关闭工单 → 客户评价
```

---

## 故障排查

### 问题1: 数据库连接失败

```bash
# 检查 MySQL 是否启动
docker ps | grep aijulai-mysql

# 查看 MySQL 日志
docker logs aijulai-mysql

# 测试连接
node backend/test-db-connection.js
```

### 问题2: 端口被占用

```bash
# 查看 3306 端口占用
lsof -i :3306

# 查看 3000 端口占用
lsof -i :3000

# 修改 .env 中的 PORT 配置
```

### 问题3: bcrypt 安装失败

```bash
# 重新编译 bcrypt
cd backend
npm rebuild bcrypt --build-from-source
```

### 问题4: 种子数据执行失败

```bash
# 检查表是否已创建
docker exec -it aijulai-mysql mysql -uroot -paijulai2024 aijulai_crm -e "SHOW TABLES;"

# 重新初始化数据库
node backend/scripts/init-database.js
node backend/scripts/seed-data.js
```

---

## 下一步计划

- [ ] 创建 Postman API Collection
- [ ] 编写单元测试
- [ ] 前端 Vue 3 项目搭建
- [ ] 实现核心页面（登录、首页、线索、客户）
- [ ] 集成权限控制
- [ ] 部署到阿里云

---

## 获取帮助

- 📖 **需求文档**: [requirements.md](./docs/requirements.md)
- 🗄️ **数据库文档**: [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- 📈 **进度报告**: [IMPLEMENTATION_PROGRESS.md](./IMPLEMENTATION_PROGRESS.md)
- 💻 **API 文档**: [docs/API.md](./docs/API.md)

---

**最后更新**: 2025-12-25
**当前版本**: v0.8 (后端开发 85% 完成)
