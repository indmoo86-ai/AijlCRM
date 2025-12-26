# 艾居来 CRM - 技术架构设计文档

**文档版本**：v1.0
**创建日期**：2025-12-24
**项目名称**：艾居来 CRM
**架构师**：Claude AI

---

## 一、架构设计目标

### 1.1 业务目标

| 目标 | 说明 |
|-----|------|
| **标准化流程** | 建立标准化的业务流程节点和检查点，避免业务疏漏 |
| **自动化提醒** | 系统自动生成待办任务，随时提醒关键节点 |
| **数据串通** | 打通销售线索 → 跟踪 → 合同 → 服务 → 财务 → 发票的完整业务链 |
| **移动优先** | 响应式设计，支持移动端访问 |

### 1.2 技术目标

| 目标 | 指标 |
|-----|------|
| **性能** | 页面加载时间 < 2秒，API响应时间 < 500ms |
| **可靠性** | 系统可用性 99.5%，数据零丢失 |
| **可维护性** | 代码覆盖率 > 70%，文档完整 |
| **可扩展性** | 支持10-50用户扩展，模块化设计便于功能扩展 |
| **安全性** | 数据加密传输（HTTPS），密码加密存储，操作审计 |

### 1.3 架构原则

1. **前后端分离**：前端SPA + 后端RESTful API
2. **模块化设计**：高内聚低耦合，便于测试和维护
3. **开源优先**：使用成熟稳定的开源技术栈
4. **快速迭代**：敏捷开发，MVP快速上线
5. **成本控制**：云端部署，按需扩展，控制初期成本

---

## 二、技术栈选型

### 2.1 前端技术栈

| 技术 | 版本 | 选型理由 |
|-----|------|---------|
| **Vue.js** | 3.5.24 | 渐进式框架，学习曲线平缓，组合式API提升代码复用性 |
| **Vite** | 7.2.4 | 快速的构建工具，开发体验好，构建速度快 |
| **Vue Router** | 4.2.5 | Vue官方路由，SPA必备 |
| **Pinia** | 2.1.7 | Vue 3官方推荐的状态管理，轻量简洁 |
| **Element Plus** | 2.4.4 | 成熟的企业级UI组件库，开箱即用，中文文档完善 |
| **Axios** | 1.6.2 | 最流行的HTTP客户端，拦截器机制方便统一处理 |
| **Day.js** | 1.11.10 | 轻量级日期处理库，替代Moment.js |
| **ECharts** | 5.4.3 | 强大的数据可视化库，用于Dashboard图表 |
| **jsPDF** | 2.5.1 | 前端生成PDF，用于报价单和合同导出 |
| **Vue-Quill** | 2.0.0 | 富文本编辑器，用于跟进记录、合同条款等 |

### 2.2 后端技术栈

| 技术 | 版本 | 选型理由 |
|-----|------|---------|
| **Node.js** | 18 LTS | 长期支持版本，稳定可靠，JavaScript全栈 |
| **Express** | 4.18.2 | 简单灵活的Web框架，中间件生态丰富 |
| **Sequelize** | 6.35.2 | 成熟的Node.js ORM，支持MySQL，模型定义清晰 |
| **MySQL** | 8.0 | 成熟稳定的关系型数据库，事务支持完善 |
| **jsonwebtoken** | 9.0.2 | JWT认证，无状态认证机制 |
| **bcryptjs** | 2.4.3 | 密码加密，单向散列保证安全 |
| **multer** | 1.4.5-lts.1 | 文件上传中间件 |
| **node-cron** | 3.0.3 | 定时任务调度，用于任务提醒 |
| **winston** | 3.11.0 | 日志记录，支持多种输出方式 |
| **joi** | 17.11.0 | 参数校验，保证API输入合法性 |

### 2.3 数据库

| 组件 | 版本 | 说明 |
|-----|------|------|
| **MySQL** | 8.0+ | 主数据库 |
| **Redis**（v2.0） | 7.2 | 缓存、Session存储（后期扩展） |

### 2.4 部署与运维

| 技术 | 版本 | 用途 |
|-----|------|------|
| **阿里云ECS** | - | 云服务器（应用部署） |
| **阿里云RDS** | MySQL 8.0 | 云数据库（数据存储） |
| **阿里云OSS** | - | 对象存储（文件上传） |
| **Docker** | 24+ | 容器化部署 |
| **Docker Compose** | 2.23+ | 多容器编排 |
| **Nginx** | 1.24+ | 反向代理、静态资源服务 |
| **PM2** | 5.3+ | Node.js进程管理 |
| **GitHub Actions**（可选） | - | CI/CD自动化 |

---

## 三、系统架构设计

### 3.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         用户层                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ PC浏览器  │  │ 手机浏览器 │  │  iPad    │  │  微信H5  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   CDN加速（可选）   │
                    └─────────┬─────────┘
                              │
┌─────────────────────────────▼─────────────────────────────┐
│                      Nginx反向代理                         │
│  - 静态资源服务（前端SPA）                                  │
│  - API请求转发                                             │
│  - SSL/TLS终结                                             │
│  - Gzip压缩                                                │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│      前端应用层（SPA）     │     │      后端应用层（API）    │
│                         │     │                         │
│  Vue 3 + Vite           │     │  Node.js + Express      │
│  ├── 页面组件（44个）     │     │  ├── 路由层（Routes）    │
│  ├── 状态管理（Pinia）    │     │  ├── 控制器（Controllers）│
│  ├── API调用（Axios）     │     │  ├── 业务逻辑（Services）│
│  └── UI组件（Element+）   │     │  ├── 数据模型（Models）  │
│                         │     │  ├── 中间件（Middleware）│
│                         │     │  └── 工具函数（Utils）   │
└─────────────────────────┘     └─────────────────────────┘
                                              │
                              ┌───────────────┼───────────────┐
                              │               │               │
                              ▼               ▼               ▼
                    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
                    │  MySQL数据库  │  │  阿里云OSS   │  │  定时任务     │
                    │              │  │              │  │              │
                    │  28张核心表   │  │  图片/文件    │  │  node-cron   │
                    │  ACID事务支持 │  │  存储服务     │  │  任务提醒     │
                    └──────────────┘  └──────────────┘  └──────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  数据备份         │
                    │  - 每日全量备份    │
                    │  - 每小时增量备份  │
                    └──────────────────┘
```

### 3.2 前后端分离架构

```
前端（Vue 3 SPA）
  ├── 路由守卫（认证检查）
  ├── HTTP拦截器（Token注入、错误处理）
  ├── 状态管理（用户信息、权限）
  └── API调用
           │
           │ HTTPS
           │ RESTful API
           │
           ▼
后端（Express API）
  ├── JWT验证中间件（认证）
  ├── 权限验证中间件（授权）
  ├── 参数校验中间件（Joi）
  ├── 业务逻辑处理
  ├── ORM数据访问（Sequelize）
  └── 统一响应格式
```

### 3.3 数据流架构

```
用户操作
   │
   ▼
Vue组件（UI层）
   │
   ▼
Pinia Store（状态管理）
   │
   ▼
API Service（axios封装）
   │
   │ HTTP Request（JSON）
   │ Authorization: Bearer <token>
   │
   ▼
Express Router（路由层）
   │
   ▼
Controller（控制器层）
   │ - 参数校验
   │ - 权限检查
   │
   ▼
Service（业务逻辑层）
   │ - 业务规则处理
   │ - 多表关联操作
   │ - 事务管理
   │
   ▼
Model（数据访问层）
   │ - Sequelize ORM
   │ - SQL生成
   │
   ▼
MySQL Database
   │
   ▼
返回结果（JSON）
   │
   ▼
前端更新UI
```

---

## 四、前端架构设计

### 4.1 前端目录结构

```
frontend/
├── public/                     # 静态资源（不经过webpack处理）
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── assets/                 # 静态资源（经过webpack处理）
│   │   ├── images/             # 图片资源
│   │   ├── styles/             # 全局样式
│   │   │   ├── variables.scss  # CSS变量
│   │   │   ├── mixins.scss     # CSS混入
│   │   │   └── global.scss     # 全局样式
│   │   └── icons/              # SVG图标
│   │
│   ├── components/             # 通用组件
│   │   ├── common/             # 基础组件
│   │   │   ├── SearchBar.vue
│   │   │   ├── DataTable.vue
│   │   │   ├── FormDialog.vue
│   │   │   └── UploadFile.vue
│   │   ├── customer/           # 客户相关组件
│   │   │   └── ContactDialog.vue
│   │   ├── contract/           # 合同相关组件
│   │   │   └── AmendmentDialog.vue
│   │   └── service-ticket/     # 售后相关组件
│   │       └── AssignDialog.vue
│   │
│   ├── layout/                 # 布局组件
│   │   ├── Index.vue           # 主布局
│   │   └── components/
│   │       ├── Header.vue      # 顶部导航
│   │       ├── Sidebar.vue     # 左侧菜单
│   │       ├── Breadcrumb.vue  # 面包屑
│   │       └── Footer.vue      # 底部（可选）
│   │
│   ├── views/                  # 页面组件（44个页面）
│   │   ├── auth/               # 认证
│   │   │   └── Login.vue
│   │   ├── dashboard/          # 首页
│   │   │   └── Index.vue
│   │   ├── product/            # 产品管理（5个页面）
│   │   ├── customer/           # 客户管理（4个页面）
│   │   ├── lead/               # 线索管理（3个页面）
│   │   ├── quotation/          # 报价管理（4个页面）
│   │   ├── contract/           # 合同管理（5个页面）
│   │   ├── task/               # 任务管理（3个页面）
│   │   ├── shipment/           # 发货管理（3个页面）
│   │   ├── payment/            # 收款管理（3个页面）
│   │   ├── invoice/            # 发票管理（3个页面）
│   │   ├── service-ticket/     # 售后服务（4个页面）
│   │   ├── system/             # 系统管理（5个页面）
│   │   └── error/              # 错误页面
│   │       └── 404.vue
│   │
│   ├── router/                 # 路由配置
│   │   ├── index.js            # 路由主配置
│   │   └── guards.js           # 路由守卫
│   │
│   ├── stores/                 # Pinia状态管理
│   │   ├── auth.js             # 认证状态
│   │   ├── user.js             # 用户信息
│   │   ├── app.js              # 应用配置
│   │   └── modules/            # 业务模块状态
│   │       ├── customer.js
│   │       ├── product.js
│   │       └── contract.js
│   │
│   ├── api/                    # API接口封装
│   │   ├── index.js            # axios实例配置
│   │   ├── auth.js             # 认证接口
│   │   ├── customer.js         # 客户接口
│   │   ├── product.js          # 产品接口
│   │   ├── quotation.js        # 报价单接口
│   │   ├── contract.js         # 合同接口
│   │   ├── task.js             # 任务接口
│   │   ├── shipment.js         # 发货接口
│   │   ├── payment.js          # 收款接口
│   │   ├── invoice.js          # 发票接口
│   │   ├── serviceTicket.js    # 售后接口
│   │   └── system.js           # 系统管理接口
│   │
│   ├── utils/                  # 工具函数
│   │   ├── request.js          # Axios封装
│   │   ├── auth.js             # 认证工具
│   │   ├── storage.js          # localStorage/sessionStorage封装
│   │   ├── date.js             # 日期格式化
│   │   ├── validation.js       # 表单验证规则
│   │   ├── permission.js       # 权限检查
│   │   ├── download.js         # 文件下载
│   │   └── constants.js        # 常量定义
│   │
│   ├── directives/             # 自定义指令
│   │   ├── permission.js       # 权限指令 v-permission
│   │   └── loading.js          # 加载指令
│   │
│   ├── plugins/                # 插件
│   │   ├── element-plus.js     # Element Plus按需引入
│   │   └── echarts.js          # ECharts按需引入
│   │
│   ├── App.vue                 # 根组件
│   └── main.js                 # 入口文件
│
├── .env.development            # 开发环境变量
├── .env.production             # 生产环境变量
├── .eslintrc.js                # ESLint配置
├── .prettierrc.js              # Prettier配置
├── vite.config.js              # Vite配置
├── package.json                # 依赖配置
└── README.md                   # 前端说明文档
```

### 4.2 状态管理设计（Pinia）

```javascript
// stores/auth.js
export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token'),
    user: null,
    permissions: []
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    hasPermission: (state) => (permission) => {
      return state.permissions.includes(permission)
    }
  },

  actions: {
    async login(credentials) { /* ... */ },
    async logout() { /* ... */ },
    async getUserInfo() { /* ... */ }
  }
})
```

### 4.3 API调用封装

```javascript
// api/index.js - Axios实例配置
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers['Authorization'] = `Bearer ${authStore.token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
service.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // Token过期，跳转登录
      const authStore = useAuthStore()
      authStore.logout()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)
```

### 4.4 路由守卫

```javascript
// router/guards.js
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 检查是否需要认证
  if (to.meta.requiresAuth !== false) {
    if (!authStore.isAuthenticated) {
      // 未登录，跳转到登录页
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }

    // 检查权限
    if (to.meta.permission && !authStore.hasPermission(to.meta.permission)) {
      ElMessage.error('无权限访问')
      next('/403')
      return
    }
  }

  next()
})
```

---

## 五、后端架构设计

### 5.1 后端目录结构

```
backend/
├── src/
│   ├── config/                 # 配置文件
│   │   ├── database.js         # 数据库配置
│   │   ├── jwt.js              # JWT配置
│   │   ├── oss.js              # 阿里云OSS配置
│   │   └── app.js              # 应用配置
│   │
│   ├── models/                 # 数据模型（Sequelize）
│   │   ├── index.js            # 模型导出和关联关系定义
│   │   ├── User.js             # 用户模型
│   │   ├── Role.js             # 角色模型
│   │   ├── Permission.js       # 权限模型
│   │   ├── Customer.js         # 客户模型
│   │   ├── Product.js          # 产品模型
│   │   ├── Quotation.js        # 报价单模型
│   │   ├── Contract.js         # 合同模型
│   │   ├── Task.js             # 任务模型
│   │   ├── Shipment.js         # 发货单模型
│   │   ├── Payment.js          # 收款记录模型
│   │   ├── Invoice.js          # 发票模型
│   │   ├── ServiceTicket.js    # 服务工单模型
│   │   └── AuditLog.js         # 操作日志模型
│   │
│   ├── controllers/            # 控制器层（处理HTTP请求）
│   │   ├── authController.js   # 认证控制器
│   │   ├── userController.js   # 用户管理
│   │   ├── productController.js # 产品管理
│   │   ├── customerController.js # 客户管理
│   │   ├── quotationController.js # 报价管理
│   │   ├── contractController.js # 合同管理
│   │   ├── taskController.js   # 任务管理
│   │   ├── shipmentController.js # 发货管理
│   │   ├── paymentController.js # 收款管理
│   │   ├── invoiceController.js # 发票管理
│   │   └── serviceTicketController.js # 售后管理
│   │
│   ├── services/               # 业务逻辑层
│   │   ├── authService.js      # 认证业务逻辑
│   │   ├── customerService.js  # 客户业务逻辑
│   │   ├── contractService.js  # 合同业务逻辑
│   │   ├── taskService.js      # 任务业务逻辑
│   │   └── notificationService.js # 通知业务逻辑
│   │
│   ├── routes/                 # 路由定义
│   │   ├── index.js            # 路由汇总
│   │   ├── auth.js             # 认证路由
│   │   ├── users.js            # 用户路由
│   │   ├── products.js         # 产品路由
│   │   ├── customers.js        # 客户路由
│   │   ├── quotations.js       # 报价单路由
│   │   ├── contracts.js        # 合同路由
│   │   ├── tasks.js            # 任务路由
│   │   ├── shipments.js        # 发货路由
│   │   ├── payments.js         # 收款路由
│   │   ├── invoices.js         # 发票路由
│   │   └── serviceTickets.js   # 售后路由
│   │
│   ├── middleware/             # 中间件
│   │   ├── auth.js             # JWT认证中间件
│   │   ├── permission.js       # 权限验证中间件
│   │   ├── validate.js         # 参数校验中间件
│   │   ├── error.js            # 错误处理中间件
│   │   ├── logger.js           # 日志中间件
│   │   └── upload.js           # 文件上传中间件
│   │
│   ├── validators/             # 参数校验规则（Joi）
│   │   ├── authValidator.js    # 认证参数校验
│   │   ├── customerValidator.js # 客户参数校验
│   │   ├── contractValidator.js # 合同参数校验
│   │   └── ...
│   │
│   ├── utils/                  # 工具函数
│   │   ├── jwt.js              # JWT工具
│   │   ├── password.js         # 密码加密
│   │   ├── response.js         # 统一响应格式
│   │   ├── pagination.js       # 分页工具
│   │   ├── upload.js           # 文件上传工具
│   │   └── date.js             # 日期工具
│   │
│   ├── tasks/                  # 定时任务
│   │   ├── index.js            # 任务调度器
│   │   ├── quotationExpiry.js  # 报价单过期检查
│   │   ├── contractReminder.js # 合同提醒
│   │   └── taskNotification.js # 任务通知
│   │
│   ├── constants/              # 常量定义
│   │   ├── roles.js            # 角色常量
│   │   ├── permissions.js      # 权限常量
│   │   ├── status.js           # 状态常量
│   │   └── enums.js            # 枚举值
│   │
│   ├── db/                     # 数据库相关
│   │   ├── seeders/            # 初始化数据
│   │   │   ├── 01-roles.js
│   │   │   ├── 02-permissions.js
│   │   │   └── 03-admin-user.js
│   │   └── migrations/         # 数据库迁移（可选）
│   │
│   ├── app.js                  # Express应用配置
│   └── server.js               # 应用启动入口
│
├── logs/                       # 日志文件
│   ├── access.log              # 访问日志
│   ├── error.log               # 错误日志
│   └── app.log                 # 应用日志
│
├── uploads/                    # 本地文件上传目录（开发环境）
│
├── tests/                      # 测试文件
│   ├── unit/                   # 单元测试
│   └── integration/            # 集成测试
│
├── .env.development            # 开发环境变量
├── .env.production             # 生产环境变量
├── .eslintrc.js                # ESLint配置
├── .prettierrc.js              # Prettier配置
├── package.json                # 依赖配置
├── nodemon.json                # Nodemon配置
└── README.md                   # 后端说明文档
```

### 5.2 分层架构设计

```
┌─────────────────────────────────────────┐
│         HTTP请求（RESTful API）           │
└─────────────────┬───────────────────────┘
                  │
    ┌─────────────▼─────────────┐
    │      路由层（Routes）       │
    │  - 定义API端点             │
    │  - 绑定到Controller方法    │
    └─────────────┬─────────────┘
                  │
    ┌─────────────▼─────────────┐
    │   中间件层（Middleware）    │
    │  - JWT认证                 │
    │  - 权限验证                │
    │  - 参数校验（Joi）          │
    │  - 请求日志                │
    └─────────────┬─────────────┘
                  │
    ┌─────────────▼─────────────┐
    │   控制器层（Controllers）   │
    │  - 接收HTTP请求            │
    │  - 调用Service处理业务     │
    │  - 返回HTTP响应            │
    └─────────────┬─────────────┘
                  │
    ┌─────────────▼─────────────┐
    │  业务逻辑层（Services）     │
    │  - 核心业务逻辑             │
    │  - 多模型操作              │
    │  - 事务管理                │
    │  - 业务规则校验            │
    └─────────────┬─────────────┘
                  │
    ┌─────────────▼─────────────┐
    │   数据访问层（Models）      │
    │  - Sequelize ORM           │
    │  - 数据模型定义            │
    │  - 关联关系定义            │
    └─────────────┬─────────────┘
                  │
    ┌─────────────▼─────────────┐
    │      MySQL数据库           │
    └───────────────────────────┘
```

### 5.3 统一响应格式

```javascript
// utils/response.js
class ApiResponse {
  static success(data = null, message = 'success') {
    return {
      code: 200,
      message,
      data,
      timestamp: Date.now()
    }
  }

  static error(message = 'error', code = 500, data = null) {
    return {
      code,
      message,
      data,
      timestamp: Date.now()
    }
  }

  static paginated(items, total, page, limit) {
    return {
      code: 200,
      message: 'success',
      data: {
        items,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
      timestamp: Date.now()
    }
  }
}
```

### 5.4 错误处理机制

```javascript
// middleware/error.js
const errorHandler = (err, req, res, next) => {
  // 日志记录
  logger.error(err)

  // Joi验证错误
  if (err.isJoi) {
    return res.status(400).json({
      code: 400,
      message: 'Validation Error',
      errors: err.details.map(d => d.message)
    })
  }

  // Sequelize错误
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      code: 400,
      message: 'Database Validation Error',
      errors: err.errors.map(e => e.message)
    })
  }

  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      code: 401,
      message: 'Invalid Token'
    })
  }

  // 默认错误
  res.status(err.status || 500).json({
    code: err.status || 500,
    message: err.message || 'Internal Server Error'
  })
}
```

---

## 六、数据库设计策略

### 6.1 数据库架构

```
MySQL 8.0 (RDS)
├── aijulai_crm (主数据库)
│   ├── 基础数据模块（12张表）
│   │   ├── product_category
│   │   ├── product
│   │   ├── customer
│   │   ├── customer_contact
│   │   ├── customer_source
│   │   ├── customer_follow_up
│   │   ├── user
│   │   ├── role
│   │   ├── user_role
│   │   ├── permission
│   │   ├── role_permission
│   │   └── audit_log
│   │
│   └── 业务流程模块（16张表）
│       ├── quotation
│       ├── quotation_item
│       ├── contract
│       ├── contract_item
│       ├── contract_amendment
│       ├── task
│       ├── task_template
│       ├── task_notification
│       ├── shipment
│       ├── shipment_item
│       ├── payment
│       ├── invoice
│       ├── service_ticket
│       ├── service_ticket_log
│       └── （预留2张表）
│
└── 索引策略
    ├── 主键索引（所有表）
    ├── 唯一索引（编码字段）
    ├── 外键索引（关联字段）
    ├── 组合索引（常用查询字段）
    └── 全文索引（搜索字段，v2.0）
```

### 6.2 数据库设计原则

| 原则 | 说明 |
|-----|------|
| **规范化** | 符合第三范式（3NF），减少数据冗余 |
| **冗余字段** | 关键字段适当冗余（如customer_id在payment表），提升查询性能 |
| **软删除** | 所有表使用is_deleted字段，不物理删除 |
| **审计字段** | 所有表包含created_at, updated_at, created_by, updated_by |
| **字符集** | UTF8MB4，支持表情符号和特殊字符 |
| **引擎** | InnoDB，支持事务和外键 |
| **主键** | BIGINT UNSIGNED AUTO_INCREMENT，支持大数据量 |

### 6.3 索引设计

```sql
-- 示例：customer表索引
CREATE TABLE `customer` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `customer_code` VARCHAR(50) NOT NULL,
  `customer_name` VARCHAR(200) NOT NULL,
  `owner_id` BIGINT UNSIGNED,
  `customer_stage` ENUM(...),
  `created_at` DATETIME NOT NULL,

  -- 索引设计
  UNIQUE KEY `uk_customer_code` (`customer_code`),    -- 唯一索引：客户编码
  KEY `idx_owner_id` (`owner_id`),                    -- 普通索引：负责人查询
  KEY `idx_stage_owner` (`customer_stage`, `owner_id`), -- 组合索引：阶段+负责人
  KEY `idx_created_at` (`created_at`),                -- 普通索引：时间范围查询
  KEY `idx_deleted` (`is_deleted`)                    -- 普通索引：软删除过滤
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 6.4 数据备份策略

| 备份类型 | 频率 | 保留时间 | 说明 |
|---------|------|---------|------|
| **全量备份** | 每天凌晨2点 | 30天 | RDS自动备份 |
| **增量备份** | 每小时 | 7天 | Binlog增量备份 |
| **手动备份** | 重大变更前 | 永久 | 重要操作前备份 |

---

## 七、部署架构设计

### 7.1 阿里云部署架构

```
┌────────────────────────────────────────────────────────────┐
│                     公网（Internet）                        │
└────────────────────────┬───────────────────────────────────┘
                         │
                         │ HTTPS (443)
                         │
            ┌────────────▼────────────┐
            │   阿里云SLB（负载均衡）   │  ← 可选（v2.0扩展）
            │   - SSL证书配置          │
            │   - 健康检查            │
            └────────────┬────────────┘
                         │
    ┌────────────────────┴────────────────────┐
    │                                         │
    │         阿里云VPC（虚拟私有网络）          │
    │                                         │
    │  ┌──────────────────────────────────┐  │
    │  │  ECS 1（应用服务器）              │  │
    │  │  - 2核4G（或4核8G）                │  │
    │  │  - CentOS 7.9                    │  │
    │  │  - Docker + Docker Compose       │  │
    │  │  ┌────────────────────────────┐  │  │
    │  │  │  Nginx容器                  │  │  │
    │  │  │  - 前端静态资源              │  │  │
    │  │  │  - 反向代理                 │  │  │
    │  │  └────────────────────────────┘  │  │
    │  │  ┌────────────────────────────┐  │  │
    │  │  │  后端容器（Node.js）         │  │  │
    │  │  │  - Express应用              │  │  │
    │  │  │  - PM2进程管理              │  │  │
    │  │  └────────────────────────────┘  │  │
    │  └──────────────────────────────────┘  │
    │                                         │
    │  ┌──────────────────────────────────┐  │
    │  │  RDS（云数据库）                  │  │
    │  │  - MySQL 8.0                     │  │
    │  │  - 2核4G（或更高）                │  │
    │  │  - 100GB存储                     │  │
    │  │  - 自动备份                       │  │
    │  └──────────────────────────────────┘  │
    │                                         │
    │  ┌──────────────────────────────────┐  │
    │  │  OSS（对象存储）                  │  │
    │  │  - 图片/文件存储                  │  │
    │  │  - CDN加速（可选）                │  │
    │  └──────────────────────────────────┘  │
    │                                         │
    └─────────────────────────────────────────┘
```

### 7.2 Docker容器化部署

#### 7.2.1 Docker Compose配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Nginx服务（前端+反向代理）
  nginx:
    image: nginx:1.24-alpine
    container_name: aijulai-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./frontend/dist:/usr/share/nginx/html
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - backend
    restart: always
    networks:
      - aijulai-network

  # 后端服务
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: aijulai-backend
    ports:
      - "3000:3000"
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/logs:/app/logs
    environment:
      - NODE_ENV=production
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - OSS_ACCESS_KEY=${OSS_ACCESS_KEY}
      - OSS_ACCESS_SECRET=${OSS_ACCESS_SECRET}
    restart: always
    networks:
      - aijulai-network

  # MySQL数据库（开发环境）
  mysql:
    image: mysql:8.0
    container_name: aijulai-mysql
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
      - ./database/schema_core.sql:/docker-entrypoint-initdb.d/01-schema.sql
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=${DB_NAME}
      - MYSQL_USER=${DB_USER}
      - MYSQL_PASSWORD=${DB_PASSWORD}
    command: --default-authentication-plugin=mysql_native_password
    restart: always
    networks:
      - aijulai-network

volumes:
  mysql-data:

networks:
  aijulai-network:
    driver: bridge
```

#### 7.2.2 后端Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
```

### 7.3 Nginx配置

```nginx
# nginx/nginx.conf
upstream backend {
    server backend:3000;
}

server {
    listen 80;
    server_name crm.aijulai.com;

    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name crm.aijulai.com;

    # SSL证书配置
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # 前端静态资源
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }

    # API代理
    location /v1/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 文件上传大小限制
    client_max_body_size 10M;
}
```

### 7.4 阿里云资源配置

#### 7.4.1 ECS云服务器

| 配置项 | 推荐配置 | 说明 |
|-------|---------|------|
| **实例规格** | ecs.c6.large（2核4G）或 ecs.c6.xlarge（4核8G） | 根据实际负载选择 |
| **操作系统** | CentOS 7.9 64位 或 Ubuntu 20.04 64位 | 稳定的Linux发行版 |
| **系统盘** | 40GB ESSD云盘 | 系统和Docker镜像 |
| **数据盘** | 100GB ESSD云盘 | 日志和文件存储 |
| **公网带宽** | 5Mbps（按流量计费） | 初期够用，后期可升级 |
| **安全组** | 开放80、443、22端口 | HTTP、HTTPS、SSH |

#### 7.4.2 RDS云数据库

| 配置项 | 推荐配置 | 说明 |
|-------|---------|------|
| **数据库类型** | MySQL 8.0 | 高性能版或企业版 |
| **实例规格** | mysql.n2.medium.1（2核4G）| 初期配置 |
| **存储空间** | 100GB | SSD云盘 |
| **备份策略** | 每天自动备份，保留7天 | 数据安全保障 |
| **白名单** | 配置ECS内网IP | 安全隔离 |

#### 7.4.3 OSS对象存储

| 配置项 | 推荐配置 | 说明 |
|-------|---------|------|
| **存储类型** | 标准存储 | 高频访问 |
| **存储容量** | 按需付费 | 初期预计10GB/月 |
| **访问控制** | 私有读写 | 通过签名URL访问 |
| **CDN加速** | 可选 | 提升文件访问速度 |

### 7.5 成本估算

#### 月度成本预算（阿里云华东区域）

| 资源 | 配置 | 月度费用 | 说明 |
|-----|------|---------|------|
| **ECS云服务器** | 2核4G | ¥150 | 按量付费预估 |
| **RDS云数据库** | 2核4G, 100GB | ¥200 | 高可用版 |
| **OSS对象存储** | 10GB | ¥2 | 标准存储 |
| **流量费用** | 100GB/月 | ¥50 | 公网出流量 |
| **快照备份** | 100GB | ¥8 | 数据备份 |
| **合计** | - | **¥410/月** | 初期成本 |

**说明**：
- 以上为初期小规模部署的成本估算
- 使用阿里云包年包月可享受7折左右优惠
- 后期随业务增长可弹性扩容

---

## 八、开发迭代计划

### 8.1 Phase 1 - 基础设施（1-2周）

**目标**：搭建开发环境，完成认证功能

**前端任务**：
- [ ] 创建Vue 3项目脚手架（Vite）
- [ ] 配置Element Plus（按需引入）
- [ ] 创建Layout布局组件（Header + Sidebar）
- [ ] 配置Vue Router和路由守卫
- [ ] 配置Pinia状态管理
- [ ] 封装Axios（请求/响应拦截器）
- [ ] 实现登录页面
- [ ] 实现首页Dashboard（静态）

**后端任务**：
- [ ] 创建Express项目
- [ ] 配置Sequelize连接MySQL
- [ ] 创建28个Model（数据模型）
- [ ] 定义Model关联关系
- [ ] 实现JWT认证中间件
- [ ] 实现权限验证中间件
- [ ] 实现登录/登出API
- [ ] 初始化数据（角色、权限、管理员用户）

**测试验收**：
- 用户可以登录系统
- Token过期自动跳转登录页
- 登录后显示首页Dashboard

---

### 8.2 Phase 2 - 基础数据模块（2-3周）

**目标**：完成产品、客户、用户的CRUD功能

**2.1 产品管理**：
- [ ] 产品分类CRUD
- [ ] 产品列表（分页、筛选、搜索）
- [ ] 产品新增/编辑表单
- [ ] 产品详情页
- [ ] 产品图片上传（OSS）
- [ ] 产品批量导入/导出

**2.2 客户管理**：
- [ ] 客户列表（分页、筛选、搜索）
- [ ] 客户新增/编辑表单
- [ ] 客户详情页（8个Tab）
- [ ] 联系人管理
- [ ] 客户转移负责人

**2.3 用户角色权限**：
- [ ] 用户列表
- [ ] 用户新增/编辑/禁用
- [ ] 角色管理
- [ ] 权限配置
- [ ] 操作日志查询

**测试验收**：
- 完整的产品、客户、用户管理功能
- 权限控制生效
- 操作日志记录完整

---

### 8.3 Phase 3 - 线索与跟进（1-2周）

**目标**：完成线索管理和跟进记录功能

**任务**：
- [ ] 线索池页面
- [ ] 线索筛选（我的线索/未分配线索）
- [ ] 线索指派功能（推荐销售人员）
- [ ] 跟进记录列表
- [ ] 新增跟进记录表单
- [ ] 跟进记录富文本编辑器
- [ ] 跟进记录附件上传
- [ ] 下次跟进计划自动生成任务

**测试验收**：
- 营销人员可以指派线索给销售
- 销售人员可以查看我的线索
- 跟进记录可以正常添加
- 下次跟进计划自动生成待办任务

---

### 8.4 Phase 4 - 报价与合同（2-3周）

**目标**：完成报价单和合同管理功能

**4.1 报价管理**：
- [ ] 报价单列表（筛选、搜索）
- [ ] 创建报价单（向导式，3步）
  - Step 1: 选择客户（从线索中选择）
  - Step 2: 选择产品，填写数量和价格
  - Step 3: 填写其他信息，预览
- [ ] 报价单详情页
- [ ] 报价单PDF生成（jsPDF）
- [ ] 报价单转合同
- [ ] 报价单复制
- [ ] 报价单状态流转

**4.2 合同管理**：
- [ ] 合同列表（筛选、搜索）
- [ ] 创建合同（向导式，3步）
  - Step 1: 选择客户和报价单（可选）
  - Step 2: 选择产品
  - Step 3: 填写合同信息
- [ ] 合同详情页（11个Tab）
- [ ] 合同PDF生成
- [ ] 补充协议管理
- [ ] 合同执行进度展示（发货/收款/开票）
- [ ] 合同文件上传/下载

**测试验收**：
- 报价单必须关联客户（确保有来源）
- 报价单可以转为合同
- 合同详情页显示完整的执行情况
- 合同详情页是第二条主线的枢纽

---

### 8.5 Phase 5 - 任务系统（1周）

**目标**：完成任务管理和自动提醒功能

**任务**：
- [ ] 我的任务页面（卡片式展示）
- [ ] 任务按到期时间分组（今日/本周/逾期）
- [ ] 所有任务页面（管理员）
- [ ] 已完成任务页面
- [ ] 任务标记完成
- [ ] 任务重新分配
- [ ] 定时任务调度器（node-cron）
  - 报价单到期检查（每天凌晨）
  - 合同提醒（提前3天）
  - 跟进提醒（每天早上9点）

**测试验收**：
- 跟进记录填写"下次跟进计划"自动生成任务
- 任务到期前3天自动提醒
- 用户可以查看我的任务并标记完成

---

### 8.6 Phase 6 - 执行流程（2周）

**目标**：完成发货、收款、发票管理

**6.1 发货管理**：
- [ ] 发货单列表
- [ ] 创建发货单（基于合同）
- [ ] 发货单详情页
- [ ] 录入物流信息
- [ ] 发货单状态流转
- [ ] 自动更新合同发货进度

**6.2 收款管理**：
- [ ] 收款记录列表
- [ ] 新增收款记录（基于合同）
- [ ] 收款凭证上传
- [ ] 应收账款统计页面
- [ ] 自动更新合同收款进度

**6.3 发票管理**：
- [ ] 发票列表
- [ ] 新增发票（基于合同）
- [ ] 发票扫描件上传
- [ ] 开票统计
- [ ] 自动更新合同开票进度

**测试验收**：
- 发货单、收款记录、发票都必须关联合同
- 都同时冗余customer_id（两条主线架构）
- 合同详情页正确显示执行进度
- 应收账款统计准确

---

### 8.7 Phase 7 - 售后服务（1周）

**目标**：完成服务工单管理

**任务**：
- [ ] 工单列表（筛选、搜索）
- [ ] 创建工单
- [ ] 工单详情页
- [ ] 工单派单功能
- [ ] 工单处理记录（时间轴）
- [ ] 工单状态流转
- [ ] 工单关联合同和客户

**测试验收**：
- 工单可以创建并派单
- 工单处理记录完整
- 工单在客户详情页和合同详情页都能查看

---

### 8.8 Phase 8 - 首页与系统管理（1周）

**目标**：完成Dashboard和系统管理功能

**8.1 Dashboard**：
- [ ] 数据概览卡片（4个）
- [ ] 我的任务列表
- [ ] 快捷入口
- [ ] 近期动态
- [ ] ECharts图表（可选）

**8.2 系统管理**：
- [ ] 操作日志查询（详细筛选）
- [ ] 系统设置页面
- [ ] 修改个人密码
- [ ] 个人信息修改

**测试验收**：
- Dashboard数据准确
- 操作日志记录完整
- 系统设置可以保存

---

### 8.9 Phase 9 - 测试与优化（1-2周）

**目标**：全面测试和性能优化

**任务**：
- [ ] 单元测试（核心业务逻辑）
- [ ] 集成测试（API测试）
- [ ] E2E测试（关键业务流程）
- [ ] 性能优化
  - 前端代码分割
  - 图片懒加载
  - 路由懒加载
  - API响应缓存
- [ ] 安全检查
  - SQL注入防护
  - XSS防护
  - CSRF防护
- [ ] 浏览器兼容性测试
- [ ] 移动端适配测试
- [ ] Bug修复

**测试验收**：
- 核心功能测试通过
- 页面加载时间 < 2秒
- API响应时间 < 500ms
- 无严重Bug

---

### 8.10 Phase 10 - 部署与上线（1周）

**目标**：生产环境部署

**任务**：
- [ ] 购买阿里云资源（ECS + RDS + OSS）
- [ ] 配置ECS服务器
- [ ] 安装Docker和Docker Compose
- [ ] 配置RDS数据库
- [ ] 执行数据库初始化脚本
- [ ] 配置OSS对象存储
- [ ] 配置域名和SSL证书
- [ ] 构建前端生产版本
- [ ] 部署Docker容器
- [ ] 配置Nginx反向代理
- [ ] 配置PM2进程守护
- [ ] 配置定时任务
- [ ] 配置日志收集
- [ ] 配置监控告警（可选）
- [ ] 生产环境测试
- [ ] 用户培训
- [ ] 正式上线

**上线检查清单**：
- [ ] 数据库连接正常
- [ ] OSS文件上传正常
- [ ] SSL证书配置正确
- [ ] 所有API接口正常
- [ ] 定时任务正常运行
- [ ] 备份策略配置完成
- [ ] 监控告警配置完成

---

## 九、开发规范

### 9.1 Git工作流程

```
main (主分支，生产环境代码)
 │
 ├── develop (开发分支)
 │    │
 │    ├── feature/user-management (功能分支)
 │    ├── feature/customer-management
 │    ├── feature/contract-management
 │    └── ...
 │
 └── hotfix/xxx (紧急修复分支)
```

**分支命名规范**：
- `feature/功能名称` - 新功能开发
- `bugfix/Bug描述` - Bug修复
- `hotfix/紧急修复` - 生产环境紧急修复
- `refactor/重构内容` - 代码重构

**提交信息规范**：
```
feat: 新增客户管理功能
fix: 修复报价单计算错误
docs: 更新API文档
style: 代码格式化
refactor: 重构权限验证逻辑
test: 添加单元测试
chore: 更新依赖包
```

### 9.2 代码规范

**前端**：
- ESLint + Prettier
- Vue 3 Composition API风格
- 组件命名：PascalCase
- 函数命名：camelCase
- 常量命名：UPPER_SNAKE_CASE

**后端**：
- ESLint + Prettier
- 函数命名：camelCase
- 类命名：PascalCase
- 常量命名：UPPER_SNAKE_CASE
- 异步函数使用async/await

### 9.3 API设计规范

- RESTful风格
- 资源命名：小写复数名词
- HTTP方法：GET、POST、PUT、DELETE
- 统一响应格式
- 统一错误码

### 9.4 数据库规范

- 表名：小写下划线分隔
- 字段名：小写下划线分隔
- 所有表必须有主键
- 所有表必须有审计字段
- 外键字段命名：`关联表_id`

---

## 十、安全设计

### 10.1 认证与授权

| 安全措施 | 实现方式 |
|---------|---------|
| **密码存储** | bcrypt加密（10轮加盐） |
| **Token认证** | JWT，有效期7天 |
| **Token刷新** | 提供刷新Token接口 |
| **权限验证** | 中间件验证用户权限 |
| **操作审计** | 所有操作记录audit_log表 |
| **会话管理** | 无状态JWT，支持多端登录 |

### 10.2 数据安全

| 安全措施 | 实现方式 |
|---------|---------|
| **传输加密** | HTTPS（TLS 1.2+） |
| **SQL注入防护** | ORM参数化查询 |
| **XSS防护** | 前端输出转义，后端验证 |
| **CSRF防护** | CSRF Token验证 |
| **文件上传** | 文件类型白名单，大小限制10MB |
| **敏感数据** | 手机号/身份证号部分掩码显示 |

### 10.3 访问控制

```
角色权限矩阵（示例）：

                    | 系统管理员 | 营销人员 | 销售人员 | 财务人员 | 运营人员 |
--------------------|----------|---------|---------|---------|---------|
查看所有客户         |    ✓     |    ✓    |    ✓    |    ✓    |    ✓    |
编辑所有客户         |    ✓     |    ✓    |    ✗    |    ✗    |    ✗    |
删除客户            |    ✓     |    ✗    |    ✗    |    ✗    |    ✗    |
指派线索            |    ✓     |    ✓    |    ✗    |    ✗    |    ✗    |
创建报价单          |    ✓     |    ✓    |    ✓    |    ✗    |    ✗    |
创建合同            |    ✓     |    ✗    |    ✓    |    ✗    |    ✗    |
收款管理            |    ✓     |    ✗    |    ✗    |    ✓    |    ✗    |
发票管理            |    ✓     |    ✗    |    ✗    |    ✓    |    ✗    |
服务工单            |    ✓     |    ✗    |    ✗    |    ✗    |    ✓    |
用户管理            |    ✓     |    ✗    |    ✗    |    ✗    |    ✗    |
```

---

## 十一、监控与运维

### 11.1 日志管理

```
日志级别：
- ERROR: 错误日志（500错误、异常、崩溃）
- WARN: 警告日志（业务异常、性能警告）
- INFO: 信息日志（关键操作、状态变更）
- DEBUG: 调试日志（仅开发环境）

日志文件：
- access.log: 访问日志（所有HTTP请求）
- error.log: 错误日志
- app.log: 应用日志
- sql.log: SQL查询日志（开发环境）

日志轮转：
- 每天凌晨0点轮转
- 保留最近30天
- 压缩归档
```

### 11.2 监控指标

| 指标类型 | 监控项 | 告警阈值 |
|---------|-------|---------|
| **服务器** | CPU使用率 | > 80% |
| **服务器** | 内存使用率 | > 85% |
| **服务器** | 磁盘使用率 | > 90% |
| **数据库** | 连接数 | > 80% |
| **数据库** | 慢查询 | > 2秒 |
| **应用** | API响应时间 | > 1秒 |
| **应用** | 错误率 | > 1% |
| **应用** | 进程状态 | 宕机 |

### 11.3 备份策略

| 备份内容 | 频率 | 保留时间 | 恢复目标 |
|---------|------|---------|---------|
| **数据库全量** | 每天凌晨2点 | 30天 | RTO < 1小时 |
| **数据库增量** | 每小时 | 7天 | RPO < 1小时 |
| **代码仓库** | 实时（Git） | 永久 | 立即恢复 |
| **上传文件** | 每天 | 永久（OSS） | 立即恢复 |

---

## 十二、未来扩展规划

### 12.1 功能扩展（v2.0）

1. **移动端App**：React Native或Flutter开发
2. **微信集成**：企业微信、微信公众号
3. **智能推荐**：基于历史数据的产品推荐
4. **数据分析**：销售漏斗、客户画像、业绩报表
5. **工作流引擎**：可配置的审批流程
6. **消息通知**：邮件、短信、站内信
7. **多租户支持**：SaaS模式
8. **API开放平台**：供第三方集成

### 12.2 性能优化（v2.0）

1. **Redis缓存**：热点数据缓存、Session存储
2. **CDN加速**：静态资源、图片加速
3. **数据库优化**：读写分离、分库分表
4. **全文搜索**：Elasticsearch集成
5. **消息队列**：RabbitMQ处理异步任务

### 12.3 架构演进（v2.0+）

```
微服务架构（未来）：

                          ┌─────────────┐
                          │  API Gateway │
                          └──────┬──────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
    ┌─────▼─────┐        ┌──────▼──────┐       ┌──────▼──────┐
    │  用户服务  │        │   客户服务   │       │   合同服务   │
    └───────────┘        └─────────────┘       └─────────────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                          ┌──────▼──────┐
                          │  数据库集群  │
                          └─────────────┘
```

---

## 十三、总结

本架构设计文档详细规划了艾居来CRM系统的技术实现方案，涵盖了从技术选型、系统架构、前后端设计、数据库设计、部署方案到开发规范的完整内容。

**核心特点**：
1. ✅ **前后端分离**：Vue 3 SPA + Express RESTful API
2. ✅ **两条主线架构**：客户线 + 合同线，确保数据完整可追溯
3. ✅ **模块化设计**：28张表，9大业务模块，44个页面
4. ✅ **云原生部署**：Docker容器化，阿里云托管
5. ✅ **敏捷迭代**：10个Phase，循序渐进

**下一步行动**：
- 完成所有设计文档
- 搭建开发环境
- 开始Phase 1开发

---

**文档结束**

📐 **架构设计**：完整 ✅
🚀 **技术栈**：现代化、成熟、易维护
💰 **成本控制**：初期月度成本约¥410
📅 **开发周期**：预计10-12周（MVP）
✍️ **文档版本**：v1.0
📅 **更新时间**：2025-12-24
