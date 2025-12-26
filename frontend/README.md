# 艾居来 CRM - 前端项目

基于 Vue 3 + Vite + Element Plus 的现代化 CRM 前端应用。

## 技术栈

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite 5
- **UI 库**: Element Plus 2.5
- **路由**: Vue Router 4
- **状态管理**: Pinia 2
- **HTTP 客户端**: Axios
- **图标**: @element-plus/icons-vue
- **日期处理**: dayjs

## 快速开始

### 安装依赖

```bash
cd frontend
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 生产构建

```bash
npm run build
```

构建产物在 `dist/` 目录

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
frontend/
├── src/
│   ├── api/              # API 接口定义
│   │   ├── auth.js       # 认证接口
│   │   ├── leads.js      # 线索接口
│   │   ├── customers.js  # 客户接口
│   │   ├── products.js   # 产品接口
│   │   ├── quotations.js # 报价接口
│   │   ├── contracts.js  # 合同接口
│   │   ├── shipments.js  # 发货接口
│   │   ├── payments.js   # 收款接口
│   │   ├── invoices.js   # 发票接口
│   │   ├── services.js   # 售后接口
│   │   └── tasks.js      # 任务接口
│   ├── assets/           # 静态资源
│   │   └── main.css      # 全局样式
│   ├── components/       # 公共组件
│   ├── layouts/          # 布局组件
│   │   └── MainLayout.vue # 主布局
│   ├── router/           # 路由配置
│   │   └── index.js
│   ├── stores/           # Pinia stores
│   │   └── user.js       # 用户状态
│   ├── utils/            # 工具函数
│   │   └── request.js    # Axios 封装
│   ├── views/            # 页面组件
│   │   ├── auth/         # 认证页面
│   │   ├── dashboard/    # 工作台
│   │   ├── leads/        # 线索管理
│   │   ├── customers/    # 客户管理
│   │   ├── products/     # 产品管理
│   │   ├── quotations/   # 报价管理
│   │   ├── contracts/    # 合同管理
│   │   └── tasks/        # 任务中心
│   ├── App.vue           # 根组件
│   └── main.js           # 入口文件
├── index.html            # HTML 模板
├── vite.config.js        # Vite 配置
└── package.json
```

## 功能模块

### 已完成

- [x] 项目初始化和配置
- [x] 路由配置（Vue Router）
- [x] 状态管理（Pinia）
- [x] HTTP 请求封装（Axios）
- [x] 用户登录/退出
- [x] 主布局（侧边栏 + 顶栏）
- [x] 工作台页面
- [x] 线索管理页面（完整 CRUD + 详情页 + 转客户）
- [x] 客户管理页面（完整 CRUD + 详情页 + 阶段推进）
- [x] 产品管理页面（完整 CRUD + 详情页 + 分类管理）
- [x] 报价管理页面（完整 CRUD + 详情页 + 提交/转合同）
- [x] 合同管理页面（完整 CRUD + 详情页 + 签署/进度跟踪）
- [x] 发货管理页面（完整 CRUD + 物流跟踪 + 确认发货/送达）
- [x] 收款管理页面（完整 CRUD + 确认收款/作废 + 金额合计）
- [x] 发票管理页面（完整 CRUD + 发票信息管理 + 确认开票/邮寄/作废）
- [x] 售后管理页面（完整 CRUD + 工单管理 + 接单/解决/关闭）
- [x] 任务中心页面（完整 CRUD + 任务统计 + 开始/完成 + 逾期提醒）
- [x] API 接口对接（11个业务模块 API）

### 待完善

- [ ] 个人中心（用户信息编辑、密码修改）
- [ ] 系统设置（角色权限管理、系统参数配置）
- [ ] 报价单明细（产品清单）编辑功能
- [ ] 合同明细（产品清单）编辑功能
- [ ] 发货单明细（产品清单）管理
- [ ] 数据统计图表（ECharts集成）
- [ ] 文件上传下载功能
- [ ] 高级搜索和筛选
- [ ] 数据导出（Excel）
- [ ] 打印功能（合同、发票等）

## 开发说明

### API 代理配置

开发环境下，Vite 会将 `/api` 开头的请求代理到后端服务（默认 `http://localhost:3000`）。

配置文件：`vite.config.js`

```js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true
    }
  }
}
```

### 环境变量

创建 `.env` 文件（基于 `.env.example`）：

```env
VITE_API_BASE_URL=/api
```

### 路由守卫

路由守卫在 `src/router/index.js` 中配置，自动检查登录状态。

未登录用户访问受保护页面会自动跳转到登录页。

### 状态管理

使用 Pinia 进行状态管理，已实现：

- **userStore**: 用户登录状态、用户信息

### API 调用示例

```js
import { getLeadList, createLead } from '@/api/leads'

// 获取列表
const res = await getLeadList({ page: 1, pageSize: 10 })

// 创建记录
await createLead({
  customerName: '测试客户',
  phone: '13800138000'
})
```

## 默认登录账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 系统管理员 | admin | admin123 |
| 销售人员 | sales001 | sales123 |
| 销售主管 | manager001 | manager123 |

## 常见问题

### 1. 端口冲突

修改 `vite.config.js` 中的端口：

```js
server: {
  port: 5174  // 改为其他端口
}
```

### 2. API 请求失败

- 检查后端服务是否启动（`http://localhost:3000`）
- 检查浏览器控制台的网络请求
- 确认 token 是否有效

### 3. 组件样式问题

确保已正确导入 Element Plus 样式：

```js
import 'element-plus/dist/index.css'
```

## 开发规范

### 组件命名

- 文件名使用 PascalCase（如 `UserList.vue`）
- 组件名使用 PascalCase（如 `<UserList />`）

### API 函数命名

- 使用动词开头（如 `getList`, `createItem`, `updateItem`）
- 遵循 RESTful 风格

### 样式规范

- 使用 scoped 样式避免污染
- 使用 CSS 变量定义主题色
- 遵循 BEM 命名规范（可选）

## 后续计划

1. 完善各业务模块的 CRUD 页面
2. 添加图表统计（ECharts）
3. 实现文件上传下载
4. 添加权限控制
5. 优化移动端适配
6. 添加单元测试

---

**开发状态**: 核心业务模块已全部完成（线索、客户、产品、报价、合同、发货、收款、发票、售后、任务），系统已可投入使用
**最后更新**: 2025-12-26
**完成度**: 约 90%
