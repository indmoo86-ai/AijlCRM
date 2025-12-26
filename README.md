# 艾居来 CRM - 酒店智能硬件营销客户关系管理系统

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/aijulai-crm)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![Vue](https://img.shields.io/badge/vue-3.5.24-brightgreen.svg)](https://vuejs.org)

> 专为酒店智能硬件营销团队打造的全流程CRM系统，实现从线索获取到客户全生命周期管理的数字化、标准化运营。

---

## 📋 目录

- [项目概述](#项目概述)
- [核心特性](#核心特性)
- [技术架构](#技术架构)
- [功能模块](#功能模块)
- [快速开始](#快速开始)
- [文档导航](#文档导航)
- [开发指南](#开发指南)
- [部署说明](#部署说明)
- [常见问题](#常见问题)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

---

## 🎯 项目概述

### 业务背景

艾居来公司专注于酒店智能硬件产品的销售，产品涵盖智能门锁、智能控制系统、能源管理等多个品类。客户类型包括：
- 连锁酒店集团
- 单体酒店
- 经销商
- 民宿/公寓

### 核心问题

本系统旨在解决以下业务痛点：

1. **标准化流程，避免疏漏**
   - 建立标准化的业务流程节点和检查点
   - 确保每个环节都有明确的操作规范

2. **系统待办事项随时提醒**
   - 自动生成基于流程节点的待办任务
   - 多维度任务提醒（到期时间、优先级）

3. **全流程数据串通**
   - 打通销售线索 → 跟踪 → 合同 → 服务 → 财务 → 发票的完整业务链
   - 确保数据完整可追溯

### 设计理念："两条主线"架构

本系统采用独特的**两条主线架构**，确保业务数据的完整性和可追溯性：

```
第一条主线：客户线（Customer Line）
  客户表(customer) 为核心
    ├── 联系人
    ├── 跟进记录
    ├── 报价单（必须关联客户）
    ├── 合同（必须关联客户）
    ├── 发货单（继承自合同，冗余customer_id）
    ├── 收款记录（继承自合同，冗余customer_id）
    ├── 发票（继承自合同，冗余customer_id）
    └── 服务工单

第二条主线：合同线（Contract Line）
  合同表(contract) 为核心
    ├── 合同明细
    ├── 补充协议
    ├── 发货单
    ├── 收款记录
    ├── 发票
    ├── 服务工单
    └── 任务

设计原则：
✓ 所有报价单必须关联客户（确保有来源）
✓ 所有合同必须关联客户
✓ 发货、收款、发票都同时关联客户和合同
✓ 客户详情页和合同详情页是两大枢纽页面
```

---

## ✨ 核心特性

### 🎯 业务特性

- **全生命周期管理**：从线索获取到售后服务的完整流程管理
- **智能任务提醒**：基于业务节点自动生成待办任务
- **两条主线架构**：客户线+合同线双向追溯，确保数据完整性
- **多渠道线索管理**：支持新媒体营销、线下展会、老客户转介绍等多种渠道
- **灵活的权限管理**：5种固定角色（系统管理员、营销人员、销售人员、财务人员、运营人员）
- **完整的操作审计**：所有关键操作自动记录审计日志

### 💻 技术特性

- **前后端分离**：Vue 3 SPA + Express RESTful API
- **现代化技术栈**：Vue 3 Composition API + Pinia + Element Plus
- **容器化部署**：Docker + Docker Compose 一键部署
- **云原生架构**：支持阿里云ECS + RDS + OSS
- **高性能**：页面加载<2秒，API响应<500ms
- **高安全性**：HTTPS传输、JWT认证、密码加密、SQL注入防护

---

## 🏗️ 技术架构

### 技术栈总览

| 层次 | 技术选型 | 版本 | 说明 |
|-----|---------|------|------|
| **前端框架** | Vue.js | 3.5.24 | 渐进式JavaScript框架 |
| **构建工具** | Vite | 7.2.4 | 下一代前端构建工具 |
| **UI组件库** | Element Plus | 2.4.4 | 企业级UI组件库 |
| **状态管理** | Pinia | 2.1.7 | Vue官方推荐状态管理 |
| **路由管理** | Vue Router | 4.2.5 | Vue官方路由 |
| **HTTP客户端** | Axios | 1.6.2 | Promise based HTTP client |
| **后端框架** | Express | 4.18.2 | Node.js Web框架 |
| **运行时** | Node.js | 18 LTS | JavaScript运行时 |
| **数据库** | MySQL | 8.0 | 关系型数据库 |
| **ORM** | Sequelize | 6.35.2 | Node.js ORM |
| **认证** | JWT | 9.0.2 | JSON Web Token |
| **密码加密** | bcryptjs | 2.4.3 | 密码散列 |
| **定时任务** | node-cron | 3.0.3 | 任务调度 |
| **容器化** | Docker | 24+ | 容器技术 |
| **Web服务器** | Nginx | 1.24+ | 反向代理 |
| **云服务** | 阿里云 | - | ECS + RDS + OSS |

### 系统架构图

```
┌─────────────────────────────────────────────────────┐
│                    用户层                            │
│         PC浏览器 / 手机浏览器 / iPad                  │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────┐
│                 Nginx 反向代理                       │
│          静态资源服务 + API请求转发                   │
└─────────────┬───────────────────┬───────────────────┘
              │                   │
              ▼                   ▼
┌─────────────────────┐  ┌─────────────────────┐
│   Vue 3 前端应用     │  │  Express 后端API     │
│   - 44个核心页面     │  │  - RESTful API      │
│   - Pinia状态管理    │  │  - JWT认证          │
│   - Element Plus UI │  │  - 业务逻辑层        │
└─────────────────────┘  └──────────┬──────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌──────────────┐ ┌──────────┐ ┌──────────┐
            │  MySQL 8.0   │ │ 阿里云OSS │ │ 定时任务  │
            │   28张表     │ │ 文件存储  │ │ 任务提醒  │
            └──────────────┘ └──────────┘ └──────────┘
```

详细架构设计请参考：[architecture.md](architecture.md)

---

## 📦 功能模块

本系统包含 **9大业务模块**，共 **79个User Stories**，涵盖从线索到售后的完整业务流程。

### 1. 基础数据模块

| 子模块 | 功能说明 | 页面数 |
|-------|---------|-------|
| **产品管理** | 产品分类、产品SKU管理、图片上传、价格管理 | 5 |
| **客户管理** | 客户档案、联系人、客户详情（8个Tab） | 4 |
| **用户角色权限** | 用户管理、5种固定角色、权限配置、操作日志 | 5 |

### 2. 业务流程模块

| 子模块 | 功能说明 | 页面数 |
|-------|---------|-------|
| **线索管理** | 线索池、线索指派、跟进记录、来源渠道管理 | 3 |
| **报价管理** | 创建报价单（向导式）、报价单列表、PDF生成、转合同 | 4 |
| **合同管理** | 合同创建、合同详情（11个Tab）、补充协议、执行进度 | 5 |
| **任务管理** | 我的任务、所有任务、自动任务生成、到期提醒 | 3 |
| **发货管理** | 发货单创建、物流跟踪、发货进度、签收确认 | 3 |
| **收款管理** | 收款记录、收款凭证、应收账款统计、收款进度 | 3 |
| **发票管理** | 发票登记、发票扫描件上传、开票统计、开票进度 | 3 |
| **售后服务** | 工单创建、工单派单、处理记录、工单状态流转 | 4 |

### 3. 系统管理模块

| 功能 | 说明 |
|-----|------|
| **Dashboard** | 数据概览、我的任务、快捷入口、近期动态 |
| **系统设置** | 系统配置、个人设置、密码修改 |

**总计**：44个核心页面，79个User Stories

详细功能列表请参考：[requirements.md](requirements.md) (8282行，371KB)

---

## 🚀 快速开始

### 环境要求

| 软件 | 版本要求 | 说明 |
|-----|---------|------|
| Node.js | >= 18.0.0 | LTS版本 |
| MySQL | >= 8.0 | 关系型数据库 |
| Docker | >= 24.0 (可选) | 容器化部署 |
| Git | 最新版本 | 版本控制 |

### 方式一：本地开发

#### 1. 克隆项目

```bash
# 如果你已经在项目目录下，跳过此步骤
cd "/Users/robin/claude code/CRM"
```

#### 2. 数据库初始化

```bash
# 登录MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE aijulai_crm DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 导入表结构
USE aijulai_crm;
SOURCE database/schema_core.sql;

# 退出MySQL
EXIT;
```

#### 3. 后端配置与启动

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 复制环境变量文件
cp .env.example .env

# 编辑.env文件，配置数据库连接信息
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=aijulai_crm
# DB_USER=root
# DB_PASSWORD=your_password
# JWT_SECRET=your_jwt_secret_key

# 启动开发服务器
npm run dev
```

后端服务将运行在：`http://localhost:3000`

#### 4. 前端配置与启动

```bash
# 打开新终端，进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将运行在：`http://localhost:5173`

#### 5. 访问系统

打开浏览器访问：`http://localhost:5173`

**默认管理员账号**：
- 用户名：`admin`
- 密码：`Admin@123`

> ⚠️ **重要提示**：首次登录后请立即修改默认密码！

### 方式二：Docker部署（推荐生产环境）

#### 1. 准备环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑.env文件，修改以下配置：
# - MYSQL_ROOT_PASSWORD（数据库root密码）
# - DB_PASSWORD（应用数据库密码）
# - JWT_SECRET（JWT密钥）
# - OSS相关配置（如果使用阿里云OSS）
```

#### 2. 启动所有服务

```bash
# 构建并启动
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

启动的服务：
- `mysql` - MySQL数据库 (端口: 3306)
- `backend` - 后端API服务 (端口: 3000)
- `nginx` - 前端Web服务 (端口: 80, 443)

#### 3. 访问系统

打开浏览器访问：`http://服务器IP地址`

#### 4. 停止服务

```bash
# 停止服务
docker-compose down

# 停止服务并删除数据卷（⚠️ 会删除数据库数据）
docker-compose down -v
```

---

## 📚 文档导航

本项目提供完整的设计文档，方便快速了解系统架构和开发规范。

### 核心文档

| 文档 | 说明 | 大小/行数 | 链接 |
|-----|------|----------|------|
| **claude.md** | 项目工作方式说明，AI辅助开发指南 | - | [查看](claude.md) |
| **WORK-SUMMARY.md** | 项目工作总结，当前进度和已完成工作 | - | [查看](WORK-SUMMARY.md) |
| **requirements.md** | 软件需求规格说明书（SRS），79个User Stories | 8282行 / 371KB | [查看](requirements.md) |
| **architecture.md** | 技术架构设计文档，包含技术选型、系统架构、部署方案 | - | [查看](architecture.md) |

### 测试场景文档

| 文档 | 说明 | 链接 |
|-----|------|------|
| **docs/test-scenarios/TEST-COVERAGE-COMPLETE-INDEX.md** | 测试覆盖率索引（79个用户故事） | [查看](docs/test-scenarios/TEST-COVERAGE-COMPLETE-INDEX.md) |
| **docs/test-scenarios/TEST-SCENARIOS-CONTRACT.md** | 合同管理测试场景（10个场景，222步） | [查看](docs/test-scenarios/TEST-SCENARIOS-CONTRACT.md) |
| **docs/test-scenarios/TEST-SCENARIOS-PAYMENT.md** | 收款管理测试场景（8个场景，197步） | [查看](docs/test-scenarios/TEST-SCENARIOS-PAYMENT.md) |

### 开发指南文档

| 文档 | 说明 | 链接 |
|-----|------|------|
| **docs/guides/DATABASE_SETUP.md** | 数据库设置指南 | [查看](docs/guides/DATABASE_SETUP.md) |
| **docs/guides/API_TESTING_GUIDE.md** | API测试指南 | [查看](docs/guides/API_TESTING_GUIDE.md) |
| **docs/guides/E2E-TESTING-GUIDE.md** | 端到端测试指南 | [查看](docs/guides/E2E-TESTING-GUIDE.md) |

### 数据库文档

| 文档 | 说明 | 链接 |
|-----|------|------|
| **database/init.sql** | MySQL数据库初始化脚本，18张表完整定义 | [查看](database/init.sql) |

### 历史文档（已归档）

| 文档 | 说明 | 链接 |
|-----|------|------|
| **历史状态报告** | 各阶段项目状态报告 | [查看](docs/archive/) |

---

## 👨‍💻 开发指南

### 开发流程

推荐的开发工作流程（基于Git Flow）：

```bash
# 1. 从develop创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/customer-management

# 2. 开发功能（遵循代码规范）
# ... 编码 ...

# 3. 提交代码（遵循Commit Message规范）
git add .
git commit -m "feat(customer): 添加客户列表页面"

# 4. 定期同步develop分支
git checkout develop
git pull origin develop
git checkout feature/customer-management
git merge develop

# 5. 功能完成，创建Pull Request
git push origin feature/customer-management
# 在GitHub/GitLab创建PR，等待Code Review

# 6. 合并到develop
# Code Review通过后，由Maintainer合并
```

详细Git工作流程请参考：[docs/DEVELOPMENT_STANDARDS.md - Git工作流程规范](docs/DEVELOPMENT_STANDARDS.md#二git工作流程规范)

### 代码规范

#### 前端代码规范

```javascript
// ✅ 正确：组件命名使用PascalCase
// CustomerList.vue

// ✅ 正确：变量使用camelCase
const customerList = []
const userName = 'John'

// ✅ 正确：常量使用UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.aijulai.com'

// ✅ 正确：使用Composition API
<script setup>
import { ref, computed, onMounted } from 'vue'

const count = ref(0)
const doubleCount = computed(() => count.value * 2)

onMounted(() => {
  console.log('Component mounted')
})
</script>
```

#### 后端代码规范

```javascript
// ✅ 正确：Controller使用类
class CustomerController {
  async getCustomers(req, res, next) {
    try {
      const customers = await Customer.findAll()
      return res.json(ApiResponse.success(customers))
    } catch (error) {
      next(error)
    }
  }
}

// ✅ 正确：使用async/await
const fetchData = async () => {
  try {
    const result = await someAsyncOperation()
    return result
  } catch (error) {
    console.error(error)
    throw error
  }
}
```

#### Commit Message规范

```bash
# 格式：<type>(<scope>): <subject>

# ✅ 正确示例
git commit -m "feat(customer): 添加客户列表筛选功能"
git commit -m "fix(auth): 修复Token过期后无法自动刷新的问题"
git commit -m "docs: 更新README安装说明"
git commit -m "refactor(api): 重构API错误处理逻辑"
git commit -m "perf(customer): 优化客户列表查询性能"
git commit -m "test(contract): 添加合同创建的单元测试"

# ❌ 错误示例
git commit -m "更新代码"
git commit -m "修复bug"
git commit -m "WIP"
```

**Type类型**：
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档修改
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

详细代码规范请参考：[docs/DEVELOPMENT_STANDARDS.md](docs/DEVELOPMENT_STANDARDS.md)

### 测试规范

```bash
# 前端测试
cd frontend
npm run test          # 运行单元测试
npm run test:coverage # 生成覆盖率报告

# 后端测试
cd backend
npm run test          # 运行单元测试
npm run test:coverage # 生成覆盖率报告
npm run test:e2e      # 运行E2E测试
```

**测试覆盖率要求**：
- 单元测试覆盖率：> 70%
- 集成测试覆盖率：> 50%
- E2E测试：核心业务流程100%覆盖

详细测试规范请参考：[docs/DEVELOPMENT_STANDARDS.md - 测试规范](docs/DEVELOPMENT_STANDARDS.md#三测试规范)

### API开发规范

所有API遵循RESTful设计规范：

```
基础URL：https://api.aijulai.com/v1

示例：
GET    /v1/customers           # 获取客户列表
POST   /v1/customers           # 创建客户
GET    /v1/customers/:id       # 获取客户详情
PUT    /v1/customers/:id       # 更新客户
DELETE /v1/customers/:id       # 删除客户（软删除）

# 统一响应格式
{
  "code": 200,
  "message": "success",
  "data": { ... },
  "timestamp": 1703433600000
}
```

详细API设计请参考：[docs/API_DESIGN.md](docs/API_DESIGN.md)

---

## 🌐 部署说明

### 阿里云部署（推荐）

#### 资源配置

| 资源 | 推荐配置 | 月度费用（预估） |
|-----|---------|----------------|
| **ECS云服务器** | 2核4G (ecs.c6.large) | ¥150 |
| **RDS云数据库** | MySQL 8.0, 2核4G, 100GB | ¥200 |
| **OSS对象存储** | 标准存储, 10GB | ¥2 |
| **流量费用** | 100GB/月 | ¥50 |
| **快照备份** | 100GB | ¥8 |
| **合计** | - | **¥410/月** |

> 💡 **提示**：使用包年包月可享受7折左右优惠，实际成本约 ¥290/月

#### 部署步骤

1. **购买阿里云资源**
   - ECS云服务器（CentOS 7.9 或 Ubuntu 20.04）
   - RDS云数据库（MySQL 8.0）
   - OSS对象存储（文件上传）

2. **配置服务器**
   ```bash
   # 安装Docker
   curl -fsSL https://get.docker.com | bash -s docker

   # 安装Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **上传代码**
   ```bash
   # 使用Git克隆（推荐）
   git clone https://github.com/yourusername/aijulai-crm.git
   cd aijulai-crm

   # 或使用scp上传
   scp -r ./aijulai-crm user@your-server-ip:/opt/
   ```

4. **配置环境变量**
   ```bash
   # 编辑.env文件
   vim .env

   # 配置数据库连接（RDS）
   DB_HOST=rm-xxxxx.mysql.rds.aliyuncs.com
   DB_PORT=3306
   DB_NAME=aijulai_crm
   DB_USER=your_user
   DB_PASSWORD=your_password

   # 配置OSS
   OSS_REGION=oss-cn-hangzhou
   OSS_ACCESS_KEY_ID=your_access_key
   OSS_ACCESS_KEY_SECRET=your_access_secret
   OSS_BUCKET=your_bucket_name
   ```

5. **部署应用**
   ```bash
   # 构建并启动
   docker-compose up -d

   # 查看日志
   docker-compose logs -f
   ```

6. **配置域名和SSL**
   ```bash
   # 安装Certbot
   sudo apt install certbot python3-certbot-nginx

   # 申请SSL证书
   sudo certbot --nginx -d crm.yourdomain.com
   ```

详细部署方案请参考：[architecture.md - 部署架构设计](architecture.md#七部署架构设计)

### 数据备份策略

| 备份类型 | 频率 | 保留时间 | 执行方式 |
|---------|------|---------|---------|
| **全量备份** | 每天凌晨2点 | 30天 | RDS自动备份 |
| **增量备份** | 每小时 | 7天 | Binlog增量备份 |
| **手动备份** | 重大变更前 | 永久保留 | 手动执行 |

```bash
# 手动备份数据库
docker exec crm-mysql mysqldump -u root -p aijulai_crm > backup_$(date +%Y%m%d_%H%M%S).sql

# 手动备份上传文件
docker cp crm-backend:/app/uploads ./uploads_backup_$(date +%Y%m%d)
```

---

## 📁 项目结构

```
CRM/
├── README.md                              # 项目说明（本文档）
├── CLAUDE.md                              # AI辅助开发指南
├── PROJECT_STATUS.md                      # 项目完成情况总结
├── requirements.md                        # 需求规格说明书（SRS）
├── architecture.md                        # 技术架构设计文档
├── oql.md                                 # 开放问题清单
│
├── docs/                                  # 文档目录
│   ├── API_DESIGN.md                      # API接口设计文档
│   ├── frontend-design.md                 # 前端页面结构设计
│   └── DEVELOPMENT_STANDARDS.md           # 开发规范文档
│
├── database/                              # 数据库目录
│   └── schema_core.sql                    # 数据库DDL脚本（28张表）
│
├── frontend/                              # 前端项目
│   ├── public/                            # 静态资源
│   ├── src/
│   │   ├── assets/                        # 资源文件（图片、样式）
│   │   ├── components/                    # 通用组件
│   │   ├── layout/                        # 布局组件
│   │   ├── views/                         # 页面组件（44个页面）
│   │   │   ├── auth/                      # 认证（登录）
│   │   │   ├── dashboard/                 # 首页
│   │   │   ├── product/                   # 产品管理（5个页面）
│   │   │   ├── customer/                  # 客户管理（4个页面）
│   │   │   ├── lead/                      # 线索管理（3个页面）
│   │   │   ├── quotation/                 # 报价管理（4个页面）
│   │   │   ├── contract/                  # 合同管理（5个页面）
│   │   │   ├── task/                      # 任务管理（3个页面）
│   │   │   ├── shipment/                  # 发货管理（3个页面）
│   │   │   ├── payment/                   # 收款管理（3个页面）
│   │   │   ├── invoice/                   # 发票管理（3个页面）
│   │   │   ├── service-ticket/            # 售后服务（4个页面）
│   │   │   ├── system/                    # 系统管理（5个页面）
│   │   │   └── error/                     # 错误页面
│   │   ├── router/                        # 路由配置
│   │   ├── stores/                        # Pinia状态管理
│   │   ├── api/                           # API接口封装
│   │   ├── utils/                         # 工具函数
│   │   ├── App.vue                        # 根组件
│   │   └── main.js                        # 入口文件
│   ├── .env.development                   # 开发环境变量
│   ├── .env.production                    # 生产环境变量
│   ├── vite.config.js                     # Vite配置
│   ├── package.json                       # 依赖配置
│   └── Dockerfile                         # Docker镜像构建
│
├── backend/                               # 后端项目
│   ├── src/
│   │   ├── config/                        # 配置文件
│   │   ├── models/                        # 数据模型（28个Model）
│   │   ├── controllers/                   # 控制器层
│   │   ├── services/                      # 业务逻辑层
│   │   ├── routes/                        # 路由定义
│   │   ├── middleware/                    # 中间件
│   │   ├── validators/                    # 参数校验
│   │   ├── utils/                         # 工具函数
│   │   ├── tasks/                         # 定时任务
│   │   ├── constants/                     # 常量定义
│   │   ├── db/                            # 数据库相关
│   │   │   └── seeders/                   # 初始化数据
│   │   ├── app.js                         # Express应用配置
│   │   └── server.js                      # 应用启动入口
│   ├── logs/                              # 日志文件
│   ├── uploads/                           # 本地文件上传目录
│   ├── tests/                             # 测试文件
│   ├── .env.development                   # 开发环境变量
│   ├── .env.production                    # 生产环境变量
│   ├── package.json                       # 依赖配置
│   ├── nodemon.json                       # Nodemon配置
│   └── Dockerfile                         # Docker镜像构建
│
├── nginx/                                 # Nginx配置
│   ├── nginx.conf                         # Nginx主配置
│   └── ssl/                               # SSL证书
│
├── docker-compose.yml                     # Docker Compose配置
├── .env.example                           # 环境变量示例
├── .gitignore                             # Git忽略文件
├── .eslintrc.js                           # ESLint配置
├── .prettierrc.js                         # Prettier配置
└── LICENSE                                # 开源许可证
```

---

## ❓ 常见问题

### 开发环境问题

**Q1: 数据库连接失败怎么办？**

A: 请检查以下几点：
1. MySQL服务是否启动：`sudo systemctl status mysql`
2. `.env`文件中的数据库配置是否正确
3. 数据库用户是否有足够的权限
4. 防火墙是否阻止了3306端口

**Q2: 前端请求跨域怎么办？**

A:
- 开发环境：已在`vite.config.js`中配置代理，无需处理
- 生产环境：通过Nginx反向代理解决，参考`nginx/nginx.conf`

**Q3: npm install失败怎么办？**

A:
```bash
# 清除npm缓存
npm cache clean --force

# 删除node_modules和package-lock.json
rm -rf node_modules package-lock.json

# 使用淘宝镜像
npm install --registry=https://registry.npmmirror.com

# 重新安装
npm install
```

**Q4: 文件上传失败怎么办？**

A:
1. 检查`backend/uploads`目录权限：`chmod 755 uploads`
2. 检查`multer`配置中的文件大小限制
3. 检查Nginx的`client_max_body_size`配置

### Docker部署问题

**Q5: Docker容器启动失败？**

A:
```bash
# 查看容器日志
docker-compose logs -f backend
docker-compose logs -f mysql

# 检查端口占用
sudo lsof -i :3000
sudo lsof -i :3306
sudo lsof -i :80

# 重新构建镜像
docker-compose build --no-cache
docker-compose up -d
```

**Q6: 数据库初始化失败？**

A:
```bash
# 进入MySQL容器
docker exec -it crm-mysql bash

# 登录MySQL
mysql -u root -p

# 手动导入SQL文件
USE aijulai_crm;
SOURCE /docker-entrypoint-initdb.d/schema_core.sql;
```

### 业务功能问题

**Q7: 忘记管理员密码怎么办？**

A:
```bash
# 进入MySQL
mysql -u root -p

# 重置admin密码（密码：Admin@123）
USE aijulai_crm;
UPDATE user SET password = '$2a$10$xxxxx' WHERE username = 'admin';
```

**Q8: 如何添加新的角色？**

A: v1.0版本使用固定的5种角色，不支持自定义角色。如需扩展，请参考`backend/src/db/seeders/01-roles.js`

### 性能优化问题

**Q9: 页面加载慢怎么优化？**

A:
1. 前端开启路由懒加载（已配置）
2. 使用CDN加速静态资源
3. 开启Nginx Gzip压缩（已配置）
4. 优化图片大小，使用webp格式
5. 使用分页加载，避免一次性加载大量数据

**Q10: 数据库查询慢怎么优化？**

A:
1. 检查索引是否创建：`SHOW INDEX FROM customer`
2. 分析慢查询日志
3. 使用`EXPLAIN`分析查询计划
4. 添加合适的索引
5. 避免N+1查询，使用`include`预加载关联数据

---

## 🤝 贡献指南

欢迎贡献代码！请遵循以下流程：

### 贡献流程

1. **Fork项目**
   ```bash
   # 在GitHub上点击Fork按钮
   ```

2. **创建功能分支**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **提交代码**
   ```bash
   git add .
   git commit -m "feat: 添加某某功能"
   ```

4. **推送到Fork仓库**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **创建Pull Request**
   - 在GitHub上创建PR
   - 填写PR模板
   - 等待Code Review

### 代码审查标准

Pull Request需要满足以下条件才能合并：

- [ ] 遵循代码规范（ESLint通过）
- [ ] 有对应的单元测试
- [ ] 测试全部通过
- [ ] 有清晰的Commit Message
- [ ] 有完整的PR描述
- [ ] 通过Code Review
- [ ] CI/CD检查通过

详细贡献指南请参考：[docs/DEVELOPMENT_STANDARDS.md](docs/DEVELOPMENT_STANDARDS.md)

---

## 📞 技术支持

### 获取帮助

- 📖 **查看文档**：本README及[文档导航](#文档导航)中的各类文档
- 💬 **提交Issue**：[GitHub Issues](https://github.com/yourusername/aijulai-crm/issues)
- 📧 **邮件联系**：support@aijulai.com

### 问题反馈

提交Issue时请提供以下信息：

1. **问题描述**：清晰描述遇到的问题
2. **复现步骤**：如何重现该问题
3. **期望行为**：期望的正确行为
4. **实际行为**：实际发生的行为
5. **环境信息**：
   - 操作系统（Windows/Mac/Linux）
   - Node.js版本
   - MySQL版本
   - 浏览器版本
6. **错误日志**：相关的错误日志和截图

---

## 📊 项目进度

### 当前状态

| 阶段 | 进度 | 状态 |
|-----|------|------|
| **需求分析** | 100% | ✅ 已完成 |
| **数据库设计** | 100% | ✅ 已完成 |
| **API设计** | 100% | ✅ 已完成 |
| **前端设计** | 100% | ✅ 已完成 |
| **技术架构** | 100% | ✅ 已完成 |
| **开发规范** | 100% | ✅ 已完成 |
| **基础设施** | 0% | ⏳ 待开始 |
| **功能开发** | 0% | ⏳ 待开始 |
| **测试** | 0% | ⏳ 待开始 |
| **部署上线** | 0% | ⏳ 待开始 |

### 开发计划

详细的开发迭代计划请参考：[architecture.md - 开发迭代计划](architecture.md#八开发迭代计划)

**预计时间线**：
- Phase 1-2: 基础设施 + 基础数据模块（3-5周）
- Phase 3-7: 业务流程模块（6-8周）
- Phase 8-10: 系统管理 + 测试 + 部署（3-4周）

**总计**：10-12周（MVP版本）

---

## 📜 版本历史

### v1.0.0 (2025-12-24)

**设计阶段完成**：
- ✅ 完成79个User Stories需求分析
- ✅ 完成28张数据表设计
- ✅ 完成100+ RESTful API设计
- ✅ 完成44个前端页面设计
- ✅ 完成技术架构设计
- ✅ 完成开发规范文档

**待开发**：
- ⏳ 功能开发
- ⏳ 测试
- ⏳ 部署

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源许可证。

```
MIT License

Copyright (c) 2025 艾居来科技

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 致谢

感谢以下开源项目和技术社区：

- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Element Plus](https://element-plus.org/) - Vue 3 UI组件库
- [Express](https://expressjs.com/) - Node.js Web框架
- [Sequelize](https://sequelize.org/) - Node.js ORM
- [MySQL](https://www.mysql.com/) - 关系型数据库
- [Docker](https://www.docker.com/) - 容器技术

特别感谢 Claude AI 在项目设计阶段提供的辅助支持。

---

<div align="center">

**艾居来 CRM** - 让酒店智能硬件营销更简单

Made with ❤️ by 艾居来科技

[⬆ 回到顶部](#艾居来-crm---酒店智能硬件营销客户关系管理系统)

</div>
