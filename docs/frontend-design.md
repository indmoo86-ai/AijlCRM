# 艾居来 CRM - 前端页面结构与路由设计

**文档版本**：v1.0
**创建日期**：2025-12-24
**项目名称**：艾居来 CRM
**技术栈**：Vue 3.5.24 + Vue Router 4.2.5 + Element Plus 2.4.4

---

## 一、页面架构概览

### 1.1 整体布局

```
艾居来 CRM
├── 登录页（独立布局）
└── 主应用布局（Layout）
    ├── 顶部导航栏（Header）
    │   ├── Logo
    │   ├── 系统名称
    │   └── 用户信息 + 退出登录
    ├── 左侧菜单栏（Sidebar）
    │   └── 9个一级菜单
    └── 内容区域（Main Content）
        └── 40+ 核心页面
```

### 1.2 页面统计

| 模块 | 页面数量 | 说明 |
|-----|---------|------|
| 登录认证 | 1 | 登录页 |
| 首页 | 1 | Dashboard |
| 产品管理 | 5 | 分类列表、产品列表、新增/编辑产品、产品详情 |
| 客户管理 | 4 | 客户列表、客户详情、新增/编辑客户、联系人管理 |
| 线索管理 | 3 | 线索池、跟进记录列表、新增/编辑跟进记录 |
| 报价管理 | 4 | 报价单列表、创建报价单、报价单详情、产品选配 |
| 合同管理 | 5 | 合同列表、创建合同、合同详情、补充协议、合同审核 |
| 任务管理 | 3 | 我的任务、所有任务、已完成任务 |
| 发货管理 | 3 | 发货单列表、创建发货单、发货单详情 |
| 收款管理 | 3 | 收款记录列表、新增收款记录、应收账款统计 |
| 发票管理 | 3 | 发票列表、新增发票、发票详情 |
| 售后服务 | 4 | 工单列表、创建工单、工单详情、工单派单 |
| 系统管理 | 5 | 用户管理、角色管理、权限配置、操作日志、系统设置 |
| **合计** | **44** | 所有核心页面 |

---

## 二、路由设计规范

### 2.1 路由命名规则

```javascript
// 路由命名规范
{
  path: '/模块英文名',
  name: 'ModuleName',
  component: () => import('@/views/模块名/页面名.vue')
}

// 示例：
{
  path: '/customers',
  name: 'CustomerList',
  component: () => import('@/views/customer/CustomerList.vue')
}
```

### 2.2 路由层级结构

```
/                          首页（需登录）
/login                     登录页（无需登录）
/dashboard                 首页仪表盘（需登录）

/products                  产品管理
  /products/categories     产品分类
  /products/list           产品列表
  /products/create         新增产品
  /products/edit/:id       编辑产品
  /products/detail/:id     产品详情

/customers                 客户管理
  /customers/list          客户列表
  /customers/create        新增客户
  /customers/edit/:id      编辑客户
  /customers/detail/:id    客户详情（含8个Tab）

/leads                     线索管理
  /leads/pool              线索池
  /leads/follow-ups        跟进记录
  /leads/create-follow-up  新增跟进

/quotations                报价管理
  /quotations/list         报价单列表
  /quotations/create       创建报价单（向导式）
  /quotations/detail/:id   报价单详情

/contracts                 合同管理
  /contracts/list          合同列表
  /contracts/create        创建合同
  /contracts/detail/:id    合同详情（含11个Tab）
  /contracts/amendments    补充协议

/tasks                     任务管理
  /tasks/my                我的任务
  /tasks/all               所有任务
  /tasks/completed         已完成任务

/shipments                 发货管理
  /shipments/list          发货单列表
  /shipments/create        创建发货单
  /shipments/detail/:id    发货单详情

/payments                  收款管理
  /payments/list           收款记录
  /payments/create         新增收款
  /payments/receivables    应收账款统计

/invoices                  发票管理
  /invoices/list           发票列表
  /invoices/create         新增发票
  /invoices/detail/:id     发票详情

/service-tickets           售后服务
  /service-tickets/list    工单列表
  /service-tickets/create  创建工单
  /service-tickets/detail/:id  工单详情
  /service-tickets/assign  工单派单

/system                    系统管理
  /system/users            用户管理
  /system/roles            角色管理
  /system/permissions      权限配置
  /system/audit-logs       操作日志
  /system/settings         系统设置
```

---

## 三、详细页面设计

### 3.1 登录页（/login）

**文件路径**：`/frontend/src/views/auth/Login.vue`

**功能描述**：
- 手机号 + 密码登录
- 密码强度验证（至少8位，包含大小写字母和数字）
- 连续失败5次锁定30分钟
- 登录成功后跳转到首页

**页面元素**：
```vue
<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>艾居来 CRM 登录</h2>
      <el-form>
        <el-form-item label="手机号">
          <el-input v-model="phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input type="password" v-model="password" placeholder="请输入密码" />
        </el-form-item>
        <el-button type="primary" @click="handleLogin">登录</el-button>
      </el-form>
    </el-card>
  </div>
</template>
```

**API调用**：`POST /v1/auth/login`

---

### 3.2 首页仪表盘（/dashboard）

**文件路径**：`/frontend/src/views/dashboard/Index.vue`

**功能描述**：
- 数据概览卡片（今日新增线索、待跟进客户、待处理任务、本月合同金额）
- 我的任务列表（按优先级和到期时间排序）
- 快捷入口（新增客户、创建报价单、创建合同、创建工单）
- 近期动态（最近7天的关键业务动态）

**页面布局**：
```
┌────────────────────────────────────────────┐
│  数据概览卡片（4个）                         │
├────────────┬───────────────────────────────┤
│            │                               │
│  我的任务   │    快捷入口 + 近期动态          │
│  列表      │                               │
│            │                               │
└────────────┴───────────────────────────────┘
```

**数据卡片内容**：
1. 今日新增线索：显示数量 + 环比昨日
2. 待跟进客户：显示数量 + 点击查看
3. 待处理任务：显示数量 + 逾期任务数
4. 本月合同金额：显示金额 + 环比上月

**API调用**：
- `GET /v1/dashboard/statistics` - 获取数据概览
- `GET /v1/dashboard/my-tasks` - 获取我的任务
- `GET /v1/dashboard/recent-activities` - 获取近期动态

---

### 3.3 产品管理模块

#### 3.3.1 产品分类列表（/products/categories）

**文件路径**：`/frontend/src/views/product/CategoryList.vue`

**功能描述**：
- 显示5-6个产品大类
- 新增/编辑/删除分类
- 调整分类显示顺序
- 启用/停用分类

**表格列**：
- 分类编码
- 分类名称
- 描述
- 显示顺序
- 状态（启用/停用）
- 创建时间
- 操作（编辑/删除/上移/下移）

**API调用**：
- `GET /v1/product-categories` - 获取分类列表
- `POST /v1/product-categories` - 新增分类
- `PUT /v1/product-categories/:id` - 编辑分类
- `DELETE /v1/product-categories/:id` - 删除分类

#### 3.3.2 产品列表（/products/list）

**文件路径**：`/frontend/src/views/product/ProductList.vue`

**功能描述**：
- 产品列表展示（200-300个SKU）
- 筛选条件：产品分类、产品状态（草稿/在售/停售）
- 搜索：产品编码、产品名称
- 批量导入/导出
- 新增产品按钮

**表格列**：
- 产品编码
- 产品名称
- 所属分类
- 成本价
- 标准报价
- 单位
- 状态（草稿/在售/停售）
- 创建时间
- 操作（查看详情/编辑/删除）

**API调用**：
- `GET /v1/products?page=1&limit=20&category_id=1&status=active&search=xxx` - 获取产品列表
- `POST /v1/products/import` - 批量导入
- `GET /v1/products/export` - 批量导出
- `DELETE /v1/products/:id` - 删除产品（软删除）

#### 3.3.3 新增/编辑产品（/products/create 或 /products/edit/:id）

**文件路径**：`/frontend/src/views/product/ProductForm.vue`

**功能描述**：
- 产品基础信息录入
- 产品图片上传（最多5张）
- 产品规格说明
- 价格设置（成本价、标准报价）

**表单字段**：
- 产品编码（必填，唯一）
- 产品名称（必填）
- 所属分类（必填，下拉选择）
- 产品图片（可选，最多5张）
- 供应商（可选）
- 成本价（必填，≥0）
- 标准报价（必填，≥成本价）
- 计量单位（必填，下拉：台/套/个/件等）
- 产品规格说明（可选，富文本）
- 备注（可选）
- 状态（草稿/在售/停售）

**API调用**：
- `POST /v1/products` - 新增产品
- `GET /v1/products/:id` - 获取产品详情（编辑时）
- `PUT /v1/products/:id` - 更新产品

#### 3.3.4 产品详情（/products/detail/:id）

**文件路径**：`/frontend/src/views/product/ProductDetail.vue`

**功能描述**：
- 展示产品完整信息
- 查看产品图片轮播
- 编辑按钮（跳转到编辑页）
- 关联查询：该产品的所有报价单、合同

**页面布局**：
```
┌─────────────────────────────────────────┐
│  产品基本信息卡片                         │
│  - 产品编码、名称、分类                    │
│  - 成本价、标准报价、单位                  │
│  - 状态、创建时间、更新时间                │
├─────────────────────────────────────────┤
│  产品图片轮播                             │
├─────────────────────────────────────────┤
│  规格说明（富文本展示）                    │
├─────────────────────────────────────────┤
│  关联数据Tab                              │
│  - Tab1: 引用此产品的报价单               │
│  - Tab2: 引用此产品的合同                 │
└─────────────────────────────────────────┘
```

**API调用**：
- `GET /v1/products/:id` - 获取产品详情
- `GET /v1/products/:id/quotations` - 获取关联报价单
- `GET /v1/products/:id/contracts` - 获取关联合同

---

### 3.4 客户管理模块

#### 3.4.1 客户列表（/customers/list）

**文件路径**：`/frontend/src/views/customer/CustomerList.vue`

**功能描述**：
- 客户列表展示（全生命周期）
- 筛选条件：客户类型、客户等级（A/B/C）、客户阶段（6个阶段）、负责人
- 搜索：客户名称、客户编码、联系人手机
- 新增客户按钮
- 批量导入/导出

**表格列**：
- 客户编码
- 客户名称
- 客户类型（连锁酒店集团/单体酒店/经销商/民宿/公寓）
- 客户等级（A/B/C）
- 客户阶段（销售线索/初步接触/意向客户/商务洽谈/成交客户/流失客户）
- 负责人
- 主要联系人
- 联系电话
- 创建时间
- 最后跟进时间
- 操作（查看详情/编辑/转移负责人）

**API调用**：
- `GET /v1/customers?page=1&limit=20&type=chain_hotel&stage=lead&owner_id=1&search=xxx` - 获取客户列表
- `POST /v1/customers/import` - 批量导入
- `GET /v1/customers/export` - 批量导出

#### 3.4.2 客户详情（/customers/detail/:id）

**文件路径**：`/frontend/src/views/customer/CustomerDetail.vue`

**功能描述**：
- 客户详情页是**第一条主线（客户线）的枢纽页面**
- 展示客户完整信息
- 8个Tab展示关联数据

**页面布局**：
```
┌─────────────────────────────────────────┐
│  客户基本信息卡片                         │
│  - 客户编码、名称、类型、等级、阶段         │
│  - 负责人、来源渠道                       │
│  - 地址、网站、邮箱                       │
│  - 创建时间、更新时间                     │
│  [编辑按钮] [转移负责人按钮]               │
├─────────────────────────────────────────┤
│  Tab导航栏                                │
│  [联系人] [跟进记录] [报价单] [合同]       │
│  [发货单] [收款记录] [发票] [服务工单]     │
├─────────────────────────────────────────┤
│  Tab内容区域                              │
│  - Tab1: 联系人列表（可新增/编辑/删除）    │
│  - Tab2: 跟进记录列表（可新增）            │
│  - Tab3: 报价单列表（可创建报价单）        │
│  - Tab4: 合同列表（可创建合同）            │
│  - Tab5: 发货单列表                       │
│  - Tab6: 收款记录列表                     │
│  - Tab7: 发票列表                         │
│  - Tab8: 服务工单列表（可创建工单）        │
└─────────────────────────────────────────┘
```

**API调用**：
- `GET /v1/customers/:id` - 获取客户详情
- `GET /v1/customers/:id/contacts` - 获取联系人列表
- `GET /v1/customers/:id/follow-ups` - 获取跟进记录
- `GET /v1/customers/:id/quotations` - 获取报价单列表
- `GET /v1/customers/:id/contracts` - 获取合同列表
- `GET /v1/customers/:id/shipments` - 获取发货单列表
- `GET /v1/customers/:id/payments` - 获取收款记录
- `GET /v1/customers/:id/invoices` - 获取发票列表
- `GET /v1/customers/:id/service-tickets` - 获取服务工单列表

#### 3.4.3 新增/编辑客户（/customers/create 或 /customers/edit/:id）

**文件路径**：`/frontend/src/views/customer/CustomerForm.vue`

**功能描述**：
- 客户基础信息录入
- 主要联系人信息录入（至少一个）

**表单字段**：

**客户信息部分**：
- 客户名称（必填）
- 客户类型（必填，下拉：连锁酒店集团/单体酒店/经销商/民宿/公寓）
- 客户等级（必填，下拉：A类/B类/C类）
- 客户阶段（必填，下拉：销售线索/初步接触/意向客户/商务洽谈/成交客户/流失客户）
- 来源渠道（必填，下拉：新媒体营销/线下展会/老客户转介绍/官网咨询/电话来访/其他）
- 负责人（必填，下拉选择用户）
- 地址（可选）
- 网站（可选）
- 邮箱（可选）
- 备注（可选）

**主要联系人信息部分**：
- 联系人姓名（必填）
- 职位（可选）
- 手机号（必填）
- 微信号（可选）
- 邮箱（可选）

**API调用**：
- `POST /v1/customers` - 新增客户
- `GET /v1/customers/:id` - 获取客户详情（编辑时）
- `PUT /v1/customers/:id` - 更新客户

#### 3.4.4 联系人管理（弹窗或侧边抽屉）

**文件路径**：`/frontend/src/components/customer/ContactDialog.vue`

**功能描述**：
- 在客户详情页点击"新增联系人"按钮弹出
- 添加多个联系人
- 设置主要联系人

**表单字段**：
- 联系人姓名（必填）
- 职位（可选）
- 手机号（必填）
- 微信号（可选）
- 邮箱（可选）
- 是否主要联系人（单选）

**API调用**：
- `POST /v1/customers/:customerId/contacts` - 新增联系人
- `PUT /v1/customers/:customerId/contacts/:id` - 更新联系人
- `DELETE /v1/customers/:customerId/contacts/:id` - 删除联系人

---

### 3.5 线索管理模块

#### 3.5.1 线索池（/leads/pool）

**文件路径**：`/frontend/src/views/lead/LeadPool.vue`

**功能描述**：
- 显示所有处于"销售线索"阶段的客户
- 营销人员可以手动指派给销售人员
- 系统提供默认推荐（推荐给销售角色中等级最高的人）
- 快速筛选：全部线索/我负责的线索/未分配线索

**表格列**：
- 客户名称
- 客户类型
- 来源渠道
- 主要联系人
- 联系电话
- 创建时间
- 负责人（未分配显示"待分配"）
- 操作（指派/查看详情/添加跟进）

**指派对话框**：
- 显示推荐销售人员（带"推荐"标签）
- 可手动选择其他销售人员
- 填写指派备注

**API调用**：
- `GET /v1/customers?stage=lead&page=1&limit=20` - 获取线索列表
- `POST /v1/customers/:id/assign` - 指派线索
- `GET /v1/users?role=sales` - 获取销售人员列表（用于指派）

#### 3.5.2 跟进记录列表（/leads/follow-ups）

**文件路径**：`/frontend/src/views/lead/FollowUpList.vue`

**功能描述**：
- 查看所有跟进记录（按时间倒序）
- 筛选条件：跟进方式、跟进类型（销售跟进/售后跟进）、跟进人、时间范围
- 搜索：客户名称
- 新增跟进记录按钮

**表格列**：
- 客户名称（点击可跳转客户详情）
- 跟进类型（销售跟进/售后跟进）
- 跟进方式（电话/微信/上门拜访/邮件/其他）
- 跟进日期
- 跟进内容（摘要显示）
- 下次跟进计划
- 跟进人
- 创建时间
- 操作（查看详情/标记作废）

**API调用**：
- `GET /v1/customer-follow-ups?page=1&limit=20&customer_id=1&follow_up_type=sales` - 获取跟进记录列表

#### 3.5.3 新增/编辑跟进记录（/leads/create-follow-up）

**文件路径**：`/frontend/src/views/lead/FollowUpForm.vue`

**功能描述**：
- 添加客户跟进记录
- 自动生成待办任务（如果设置了下次跟进计划）

**表单字段**：
- 客户（必填，搜索选择）
- 跟进类型（必填，单选：销售跟进/售后跟进）
- 跟进方式（必填，下拉：电话/微信/上门拜访/邮件/其他）
- 跟进日期（必填，日期选择器，默认今天）
- 跟进内容（必填，富文本，记录沟通详情、客户反馈、需求等）
- 下次跟进计划（可选，日期选择器）
- 附件（可选，上传文件）

**业务规则**：
- 如果填写了"下次跟进计划"，系统自动生成一条待办任务
- 任务标题：【跟进提醒】客户名称
- 任务到期日：下次跟进计划日期
- 任务负责人：当前用户

**API调用**：
- `POST /v1/customer-follow-ups` - 新增跟进记录
- `GET /v1/customers?stage=lead&search=xxx` - 搜索客户（用于选择）

---

### 3.6 报价管理模块

#### 3.6.1 报价单列表（/quotations/list）

**文件路径**：`/frontend/src/views/quotation/QuotationList.vue`

**功能描述**：
- 显示所有报价单
- 筛选条件：报价单状态（草稿/已发送/已接受/已拒绝/已过期/已替代）、创建人、创建时间范围
- 搜索：报价单编号、客户名称
- 创建报价单按钮

**表格列**：
- 报价单编号
- 客户名称（点击可跳转客户详情）
- 报价总额
- 有效期至
- 状态（草稿/已发送/已接受/已拒绝/已过期/已替代）
- 创建人
- 创建时间
- 操作（查看详情/生成PDF/转合同/复制新报价单/删除）

**状态说明**：
- 草稿：报价单保存但未发送
- 已发送：报价单已生成并发送给客户
- 已接受：客户接受报价，可转为合同
- 已拒绝：客户拒绝报价
- 已过期：超过有效期未转合同
- 已替代：被新版本报价单替代

**API调用**：
- `GET /v1/quotations?page=1&limit=20&status=draft&search=xxx` - 获取报价单列表
- `DELETE /v1/quotations/:id` - 删除报价单（仅草稿状态可删除）

#### 3.6.2 创建报价单（/quotations/create）

**文件路径**：`/frontend/src/views/quotation/QuotationCreate.vue`

**功能描述**：
- 向导式创建报价单（3步）
- Step 1: 选择客户（必须从线索中选择，确保报价单有来源）
- Step 2: 选择产品并填写数量、价格
- Step 3: 填写报价单其他信息，预览并保存

**Step 1 - 选择客户**：
- 搜索客户（仅显示非流失客户）
- 显示客户基本信息：客户名称、类型、负责人、主要联系人
- 选择后显示该客户的历史报价单（供参考）

**Step 2 - 选择产品**：
- 产品搜索（按分类、名称搜索）
- 产品列表展示：产品编码、名称、标准报价、单位
- 点击"添加"按钮将产品加入报价单
- 报价单明细表格：
  - 产品名称
  - 标准报价（自动带出）
  - 实际报价（可编辑，默认=标准报价）
  - 折扣率（自动计算）
  - 数量（可编辑）
  - 小计（自动计算：实际报价 × 数量）
  - 操作（删除）
- 显示报价总额

**Step 3 - 填写其他信息**：
- 报价单标题（必填，默认：XX客户产品报价单）
- 有效期至（必填，默认：30天后）
- 报价说明（可选，富文本）
- 备注（可选）
- 状态选择：保存为草稿 / 直接生成报价单
- 预览报价单（点击按钮弹出预览对话框）

**API调用**：
- `GET /v1/customers?search=xxx` - 搜索客户
- `GET /v1/customers/:id/quotations` - 获取客户历史报价单
- `GET /v1/products?search=xxx` - 搜索产品
- `POST /v1/quotations` - 创建报价单

#### 3.6.3 报价单详情（/quotations/detail/:id）

**文件路径**：`/frontend/src/views/quotation/QuotationDetail.vue`

**功能描述**：
- 展示报价单完整信息
- 报价单状态流转操作
- 生成PDF报价单
- 转为合同

**页面布局**：
```
┌─────────────────────────────────────────┐
│  报价单基本信息卡片                       │
│  - 报价单编号、客户名称                    │
│  - 报价总额、有效期至                      │
│  - 状态、创建人、创建时间                  │
│  [生成PDF] [转合同] [复制新报价单]         │
├─────────────────────────────────────────┤
│  报价单明细表格                           │
│  - 产品名称、标准报价、实际报价            │
│  - 折扣率、数量、小计                      │
├─────────────────────────────────────────┤
│  报价说明（富文本展示）                    │
├─────────────────────────────────────────┤
│  备注                                    │
└─────────────────────────────────────────┘
```

**操作按钮**：
- 生成PDF：生成标准格式的PDF报价单文件
- 转合同：将报价单转为合同（仅"已接受"状态可操作）
- 复制新报价单：基于当前报价单创建新版本
- 标记已接受/已拒绝/已过期（状态流转）

**API调用**：
- `GET /v1/quotations/:id` - 获取报价单详情
- `GET /v1/quotations/:id/pdf` - 生成PDF
- `POST /v1/quotations/:id/convert-to-contract` - 转为合同
- `POST /v1/quotations/:id/copy` - 复制报价单
- `PUT /v1/quotations/:id/status` - 更新状态

---

### 3.7 合同管理模块

#### 3.7.1 合同列表（/contracts/list）

**文件路径**：`/frontend/src/views/contract/ContractList.vue`

**功能描述**：
- 显示所有合同
- 筛选条件：合同状态（草稿/待审核/生效/已完成/已取消）、签订日期范围、负责人
- 搜索：合同编号、客户名称
- 创建合同按钮

**表格列**：
- 合同编号
- 客户名称（点击可跳转客户详情）
- 合同金额
- 签订日期
- 合同状态（草稿/待审核/生效/已完成/已取消）
- 执行进度（发货进度、收款进度）
- 负责人
- 创建时间
- 操作（查看详情/编辑/取消/生成PDF）

**API调用**：
- `GET /v1/contracts?page=1&limit=20&status=effective&search=xxx` - 获取合同列表

#### 3.7.2 创建合同（/contracts/create）

**文件路径**：`/frontend/src/views/contract/ContractCreate.vue`

**功能描述**：
- 向导式创建合同（3步）
- Step 1: 选择客户和关联报价单（可选）
- Step 2: 选择产品并填写数量、价格
- Step 3: 填写合同其他信息

**Step 1 - 选择客户和报价单**：
- 搜索客户（仅显示非流失客户）
- 显示客户的已接受报价单列表
- 可选择报价单快速创建合同（自动带入产品明细）
- 或选择不关联报价单，手动添加产品

**Step 2 - 选择产品**：
- 如果选择了报价单，自动带入产品明细
- 如果未选择报价单，手动搜索添加产品
- 合同明细表格：
  - 产品名称
  - 单价（可编辑）
  - 数量（可编辑）
  - 小计（自动计算）
  - 操作（删除）
- 显示合同总额

**Step 3 - 填写合同信息**：
- 合同编号（必填，建议格式：HT-YYYYMMDD-流水号）
- 签订日期（必填，默认今天）
- 合同期限开始日期（必填）
- 合同期限结束日期（可选）
- 付款条件（可选，富文本）
- 交货条款（可选，富文本）
- 质保条款（可选，富文本）
- 违约责任（可选，富文本）
- 其他条款（可选，富文本）
- 备注（可选）
- 状态选择：保存为草稿 / 直接提交审核

**API调用**：
- `GET /v1/customers?search=xxx` - 搜索客户
- `GET /v1/customers/:id/quotations?status=accepted` - 获取客户已接受报价单
- `GET /v1/quotations/:id` - 获取报价单详情（用于快速创建合同）
- `POST /v1/contracts` - 创建合同

#### 3.7.3 合同详情（/contracts/detail/:id）

**文件路径**：`/frontend/src/views/contract/ContractDetail.vue`

**功能描述**：
- 合同详情页是**第二条主线（合同线）的枢纽页面**
- 展示合同完整信息
- 11个Tab展示关联数据和执行情况

**页面布局**：
```
┌─────────────────────────────────────────┐
│  合同基本信息卡片                         │
│  - 合同编号、客户名称、合同金额            │
│  - 签订日期、合同期限                     │
│  - 状态、负责人                           │
│  [编辑] [生成PDF] [取消合同]              │
├─────────────────────────────────────────┤
│  执行进度卡片                             │
│  - 发货进度：已发货 / 合同总量             │
│  - 收款进度：已收款 / 合同金额             │
│  - 开票进度：已开票 / 合同金额             │
├─────────────────────────────────────────┤
│  Tab导航栏                                │
│  [合同明细] [发货单] [收款记录] [发票]     │
│  [服务工单] [补充协议] [任务] [跟进记录]   │
│  [操作日志] [合同文件] [客户信息]          │
├─────────────────────────────────────────┤
│  Tab内容区域                              │
│  - Tab1: 合同明细（产品清单）              │
│  - Tab2: 发货单列表（可创建发货单）        │
│  - Tab3: 收款记录列表（可新增收款记录）     │
│  - Tab4: 发票列表（可新增发票）            │
│  - Tab5: 服务工单列表（可创建工单）        │
│  - Tab6: 补充协议列表（可新增补充协议）     │
│  - Tab7: 任务列表（关联此合同的所有任务）   │
│  - Tab8: 跟进记录列表（可新增跟进记录）     │
│  - Tab9: 操作日志（所有操作历史）          │
│  - Tab10: 合同文件（上传/下载合同PDF等）    │
│  - Tab11: 客户信息（展示客户详细信息）      │
└─────────────────────────────────────────┘
```

**API调用**：
- `GET /v1/contracts/:id` - 获取合同详情
- `GET /v1/contracts/:id/items` - 获取合同明细
- `GET /v1/contracts/:id/shipments` - 获取发货单列表
- `GET /v1/contracts/:id/payments` - 获取收款记录
- `GET /v1/contracts/:id/invoices` - 获取发票列表
- `GET /v1/contracts/:id/service-tickets` - 获取服务工单列表
- `GET /v1/contracts/:id/amendments` - 获取补充协议列表
- `GET /v1/contracts/:id/tasks` - 获取任务列表
- `GET /v1/contracts/:id/follow-ups` - 获取跟进记录
- `GET /v1/contracts/:id/audit-logs` - 获取操作日志
- `GET /v1/contracts/:id/files` - 获取合同文件列表

#### 3.7.4 补充协议管理（弹窗或侧边抽屉）

**文件路径**：`/frontend/src/components/contract/AmendmentDialog.vue`

**功能描述**：
- 在合同详情页点击"新增补充协议"按钮弹出
- 记录合同变更内容

**表单字段**：
- 补充协议编号（必填，建议格式：合同编号-BZ01）
- 签订日期（必填）
- 补充协议内容（必填，富文本）
- 附件（可选，上传协议文件）

**API调用**：
- `POST /v1/contracts/:contractId/amendments` - 新增补充协议
- `GET /v1/contracts/:contractId/amendments/:id` - 获取补充协议详情

---

### 3.8 任务管理模块

#### 3.8.1 我的任务（/tasks/my）

**文件路径**：`/frontend/src/views/task/MyTasks.vue`

**功能描述**：
- 显示分配给当前用户的所有任务
- 按优先级和到期时间排序
- 任务分组：今日任务、本周任务、逾期任务

**任务卡片展示**：
```
┌────────────────────────────────────┐
│ [紧急] 跟进XX客户                   │
│ 类型: 跟进提醒  |  状态: 待处理      │
│ 到期: 2025-12-25                   │
│ 来源: 客户-CUST-20251201-001       │
│ [查看详情] [完成任务]               │
└────────────────────────────────────┘
```

**筛选条件**：
- 任务类型（跟进提醒/报价单到期提醒/合同提醒/发货提醒/收款提醒/开票提醒/服务提醒/手动创建）
- 任务状态（待处理/进行中/已完成/已取消）
- 到期日期范围

**API调用**：
- `GET /v1/tasks/my?status=pending&due_date_from=xxx&due_date_to=xxx` - 获取我的任务

#### 3.8.2 所有任务（/tasks/all）

**文件路径**：`/frontend/src/views/task/AllTasks.vue`

**功能描述**：
- 显示系统所有任务（管理员可见）
- 任务分配和管理

**表格列**：
- 任务编号
- 任务标题
- 任务类型
- 负责人
- 到期日期
- 状态（待处理/进行中/已完成/已取消）
- 优先级（紧急/高/中/低）
- 来源（显示来源类型和ID）
- 创建时间
- 操作（查看详情/重新分配/取消任务）

**API调用**：
- `GET /v1/tasks?page=1&limit=20&status=pending&assigned_to=xxx` - 获取所有任务

#### 3.8.3 已完成任务（/tasks/completed）

**文件路径**：`/frontend/src/views/task/CompletedTasks.vue`

**功能描述**：
- 显示已完成的任务
- 查看任务完成情况和完成时间

**表格列**：
- 任务编号
- 任务标题
- 任务类型
- 负责人
- 完成时间
- 耗时（从创建到完成的天数）
- 操作（查看详情）

**API调用**：
- `GET /v1/tasks?status=completed&page=1&limit=20` - 获取已完成任务

---

### 3.9 发货管理模块

#### 3.9.1 发货单列表（/shipments/list）

**文件路径**：`/frontend/src/views/shipment/ShipmentList.vue`

**功能描述**：
- 显示所有发货单
- 筛选条件：发货单状态（草稿/已确认/已发货/已签收/已取消）、发货日期范围
- 搜索：发货单编号、客户名称、合同编号

**表格列**：
- 发货单编号
- 合同编号（点击可跳转合同详情）
- 客户名称
- 发货日期
- 物流公司
- 物流单号
- 状态（草稿/已确认/已发货/已签收/已取消）
- 创建人
- 创建时间
- 操作（查看详情/编辑/确认发货/录入物流/删除）

**API调用**：
- `GET /v1/shipments?page=1&limit=20&status=shipped&search=xxx` - 获取发货单列表

#### 3.9.2 创建发货单（/shipments/create）

**文件路径**：`/frontend/src/views/shipment/ShipmentCreate.vue`

**功能描述**：
- 基于合同创建发货单
- 选择合同明细中的产品进行发货

**表单字段**：

**Step 1 - 选择合同**：
- 搜索合同（仅显示生效状态的合同）
- 显示合同基本信息：合同编号、客户名称、合同金额
- 显示合同执行情况：已发货数量/合同数量

**Step 2 - 选择发货产品**：
- 展示合同明细表格
- 每个产品显示：产品名称、合同数量、已发货数量、待发货数量
- 填写本次发货数量（≤待发货数量）
- 自动过滤已发货完成的产品

**Step 3 - 填写发货信息**：
- 发货单编号（自动生成，格式：SH-YYYYMMDD-流水号）
- 发货日期（必填，默认今天）
- 收货地址（必填，可从客户信息自动带入）
- 收货人（必填）
- 收货人电话（必填）
- 发货备注（可选）
- 状态选择：保存为草稿 / 直接确认发货

**API调用**：
- `GET /v1/contracts?status=effective&search=xxx` - 搜索合同
- `GET /v1/contracts/:id/items` - 获取合同明细
- `POST /v1/shipments` - 创建发货单

#### 3.9.3 发货单详情（/shipments/detail/:id）

**文件路径**：`/frontend/src/views/shipment/ShipmentDetail.vue`

**功能描述**：
- 展示发货单完整信息
- 录入物流信息
- 更新发货状态

**页面布局**：
```
┌─────────────────────────────────────────┐
│  发货单基本信息卡片                       │
│  - 发货单编号、合同编号、客户名称          │
│  - 发货日期、状态                         │
│  [编辑] [确认发货] [录入物流] [取消]      │
├─────────────────────────────────────────┤
│  发货明细表格                             │
│  - 产品名称、发货数量、单位                │
├─────────────────────────────────────────┤
│  收货信息卡片                             │
│  - 收货地址、收货人、收货人电话            │
├─────────────────────────────────────────┤
│  物流信息卡片                             │
│  - 物流公司、物流单号                      │
│  - 物流跟踪记录（时间轴展示）              │
│  [更新物流信息] [标记已签收]               │
└─────────────────────────────────────────┘
```

**物流信息对话框**：
- 物流公司（必填，下拉：顺丰/德邦/中通/圆通/申通/韵达/其他）
- 物流单号（必填）
- 物流备注（可选）

**API调用**：
- `GET /v1/shipments/:id` - 获取发货单详情
- `PUT /v1/shipments/:id/logistics` - 录入物流信息
- `PUT /v1/shipments/:id/status` - 更新状态

---

### 3.10 收款管理模块

#### 3.10.1 收款记录列表（/payments/list）

**文件路径**：`/frontend/src/views/payment/PaymentList.vue`

**功能描述**：
- 显示所有收款记录
- 筛选条件：收款状态（待确认/已确认/已取消）、收款日期范围
- 搜索：收款编号、客户名称、合同编号

**表格列**：
- 收款编号
- 合同编号（点击可跳转合同详情）
- 客户名称（点击可跳转客户详情）
- 收款金额
- 收款日期
- 收款方式（银行转账/现金/支票/其他）
- 状态（待确认/已确认/已取消）
- 创建人
- 创建时间
- 操作（查看详情/确认收款/取消）

**汇总统计卡片**：
- 本月收款总额
- 本年收款总额
- 待确认收款金额

**API调用**：
- `GET /v1/payments?page=1&limit=20&status=confirmed&search=xxx` - 获取收款记录列表
- `GET /v1/payments/statistics` - 获取收款统计

#### 3.10.2 新增收款记录（/payments/create）

**文件路径**：`/frontend/src/views/payment/PaymentCreate.vue`

**功能描述**：
- 记录合同收款
- 自动更新合同收款进度

**表单字段**：

**Step 1 - 选择合同**：
- 搜索合同（仅显示生效状态的合同）
- 显示合同基本信息：合同编号、客户名称、合同金额
- 显示收款情况：已收款金额、待收款金额

**Step 2 - 填写收款信息**：
- 收款编号（自动生成，格式：PAY-YYYYMMDD-流水号）
- 收款金额（必填，≤待收款金额）
- 收款日期（必填，默认今天）
- 收款方式（必填，下拉：银行转账/现金/支票/其他）
- 收款账户（可选，文本）
- 收款凭证（可选，上传图片）
- 备注（可选）
- 状态选择：待确认 / 已确认

**API调用**：
- `GET /v1/contracts?status=effective&search=xxx` - 搜索合同
- `GET /v1/contracts/:id` - 获取合同详情（含收款情况）
- `POST /v1/payments` - 新增收款记录

#### 3.10.3 应收账款统计（/payments/receivables）

**文件路径**：`/frontend/src/views/payment/Receivables.vue`

**功能描述**：
- 统计所有合同的应收账款情况
- 按客户、按合同、按账龄分析

**页面布局**：
```
┌─────────────────────────────────────────┐
│  应收账款概览卡片                         │
│  - 应收账款总额                           │
│  - 逾期应收账款（合同到期但未收齐款）       │
│  - 本月应收                              │
├─────────────────────────────────────────┤
│  应收账款明细表格                         │
│  - 合同编号、客户名称                      │
│  - 合同金额、已收款金额、待收款金额        │
│  - 最近收款日期、账龄（天）                │
│  - 操作（查看合同/新增收款记录）           │
└─────────────────────────────────────────┘
```

**API调用**：
- `GET /v1/payments/receivables` - 获取应收账款统计

---

### 3.11 发票管理模块

#### 3.11.1 发票列表（/invoices/list）

**文件路径**：`/frontend/src/views/invoice/InvoiceList.vue`

**功能描述**：
- 显示所有发票记录
- 筛选条件：发票状态（待开具/已开具/已取消）、发票类型（增值税专用发票/增值税普通发票）
- 搜索：发票编号、客户名称、合同编号

**表格列**：
- 发票编号（内部编号）
- 发票号码（税务发票号码）
- 合同编号（点击可跳转合同详情）
- 客户名称（点击可跳转客户详情）
- 发票类型（增值税专用发票/增值税普通发票）
- 发票金额
- 开具日期
- 状态（待开具/已开具/已取消）
- 创建人
- 创建时间
- 操作（查看详情/上传发票扫描件/取消）

**汇总统计卡片**：
- 本月开票金额
- 本年开票金额
- 待开具发票金额

**API调用**：
- `GET /v1/invoices?page=1&limit=20&status=issued&search=xxx` - 获取发票列表
- `GET /v1/invoices/statistics` - 获取开票统计

#### 3.11.2 新增发票（/invoices/create）

**文件路径**：`/frontend/src/views/invoice/InvoiceCreate.vue`

**功能描述**：
- 记录合同开票
- 自动更新合同开票进度

**表单字段**：

**Step 1 - 选择合同**：
- 搜索合同（仅显示生效状态的合同）
- 显示合同基本信息：合同编号、客户名称、合同金额
- 显示开票情况：已开票金额、待开票金额

**Step 2 - 填写发票信息**：
- 发票编号（内部编号，自动生成，格式：INV-YYYYMMDD-流水号）
- 发票类型（必填，下拉：增值税专用发票/增值税普通发票）
- 发票金额（必填，≤待开票金额）
- 开具日期（可选，默认为空，开具后填写）
- 发票号码（可选，税务发票号码，开具后填写）
- 开票抬头（必填，从客户信息自动带入，可修改）
- 纳税人识别号（必填，从客户信息自动带入，可修改）
- 开户银行（可选）
- 银行账号（可选）
- 发票扫描件（可选，上传图片或PDF）
- 备注（可选）
- 状态选择：待开具 / 已开具

**API调用**：
- `GET /v1/contracts?status=effective&search=xxx` - 搜索合同
- `GET /v1/contracts/:id` - 获取合同详情（含开票情况）
- `POST /v1/invoices` - 新增发票

#### 3.11.3 发票详情（/invoices/detail/:id）

**文件路径**：`/frontend/src/views/invoice/InvoiceDetail.vue`

**功能描述**：
- 展示发票完整信息
- 上传发票扫描件
- 更新发票状态

**页面布局**：
```
┌─────────────────────────────────────────┐
│  发票基本信息卡片                         │
│  - 发票编号、发票号码、合同编号            │
│  - 客户名称、发票类型、发票金额            │
│  - 开具日期、状态                         │
│  [编辑] [上传扫描件] [取消发票]            │
├─────────────────────────────────────────┤
│  开票信息卡片                             │
│  - 开票抬头、纳税人识别号                  │
│  - 开户银行、银行账号                      │
├─────────────────────────────────────────┤
│  发票扫描件（图片预览）                    │
│  [下载扫描件]                             │
└─────────────────────────────────────────┘
```

**API调用**：
- `GET /v1/invoices/:id` - 获取发票详情
- `PUT /v1/invoices/:id` - 更新发票信息
- `POST /v1/invoices/:id/upload-scan` - 上传发票扫描件

---

### 3.12 售后服务模块

#### 3.12.1 工单列表（/service-tickets/list）

**文件路径**：`/frontend/src/views/service-ticket/TicketList.vue`

**功能描述**：
- 显示所有服务工单
- 筛选条件：工单类型（维修/更换/技术支持/巡检）、优先级（紧急/高/中/低）、状态（待处理/处理中/待验收/已解决/已关闭）
- 搜索：工单编号、客户名称、合同编号

**表格列**：
- 工单编号
- 客户名称（点击可跳转客户详情）
- 合同编号（点击可跳转合同详情）
- 工单类型（维修/更换/技术支持/巡检）
- 优先级（紧急/高/中/低）
- 状态（待处理/处理中/待验收/已解决/已关闭）
- 负责人
- 创建时间
- 最后更新时间
- 操作（查看详情/派单/更新状态）

**API调用**：
- `GET /v1/service-tickets?page=1&limit=20&status=in_progress&search=xxx` - 获取工单列表

#### 3.12.2 创建工单（/service-tickets/create）

**文件路径**：`/frontend/src/views/service-ticket/TicketCreate.vue`

**功能描述**：
- 创建售后服务工单
- 可关联合同（可选）

**表单字段**：
- 客户（必填，搜索选择）
- 关联合同（可选，搜索选择该客户的合同）
- 工单类型（必填，下拉：维修/更换/技术支持/巡检）
- 优先级（必填，下拉：紧急/高/中/低）
- 问题描述（必填，富文本）
- 联系人（必填，从客户联系人中选择）
- 联系电话（必填，自动带入）
- 现场地址（可选）
- 附件（可选，上传图片或文件）
- 负责人（必填，下拉选择运营人员）
- 计划上门时间（可选）

**API调用**：
- `GET /v1/customers?search=xxx` - 搜索客户
- `GET /v1/customers/:id/contracts` - 获取客户合同列表
- `POST /v1/service-tickets` - 创建工单

#### 3.12.3 工单详情（/service-tickets/detail/:id）

**文件路径**：`/frontend/src/views/service-ticket/TicketDetail.vue`

**功能描述**：
- 展示工单完整信息
- 记录工单处理过程
- 更新工单状态

**页面布局**：
```
┌─────────────────────────────────────────┐
│  工单基本信息卡片                         │
│  - 工单编号、客户名称、合同编号            │
│  - 工单类型、优先级、状态                  │
│  - 负责人、创建时间                       │
│  [派单] [更新状态] [关闭工单]              │
├─────────────────────────────────────────┤
│  问题描述卡片（富文本展示）                │
├─────────────────────────────────────────┤
│  联系信息卡片                             │
│  - 联系人、联系电话、现场地址              │
├─────────────────────────────────────────┤
│  工单处理记录（时间轴）                    │
│  - 2025-12-24 10:00  工单创建            │
│  - 2025-12-24 11:00  派单给XXX          │
│  - 2025-12-24 14:00  上门服务            │
│  - 2025-12-24 16:00  问题已解决          │
│  [添加处理记录]                           │
├─────────────────────────────────────────┤
│  附件列表（图片/文件下载）                 │
└─────────────────────────────────────────┘
```

**添加处理记录对话框**：
- 操作类型（必填，下拉：派单/上门服务/更换配件/问题解决/客户验收/其他）
- 操作描述（必填，富文本）
- 附件（可选，上传图片或文件）

**API调用**：
- `GET /v1/service-tickets/:id` - 获取工单详情
- `GET /v1/service-tickets/:id/logs` - 获取工单处理记录
- `POST /v1/service-tickets/:id/logs` - 添加处理记录
- `PUT /v1/service-tickets/:id/status` - 更新状态
- `PUT /v1/service-tickets/:id/assign` - 派单

#### 3.12.4 工单派单（弹窗）

**文件路径**：`/frontend/src/components/service-ticket/AssignDialog.vue`

**功能描述**：
- 将工单分配给运营人员

**表单字段**：
- 负责人（必填，下拉选择运营人员）
- 计划上门时间（可选）
- 派单备注（可选）

**API调用**：
- `GET /v1/users?role=operations` - 获取运营人员列表
- `PUT /v1/service-tickets/:id/assign` - 派单

---

### 3.13 系统管理模块

#### 3.13.1 用户管理（/system/users）

**文件路径**：`/frontend/src/views/system/UserManagement.vue`

**功能描述**：
- 管理系统用户账户
- 新增/编辑/启用/禁用用户
- 重置密码

**表格列**：
- 用户名
- 真实姓名
- 手机号
- 角色（可能有多个）
- 状态（启用/禁用/锁定）
- 最后登录时间
- 创建时间
- 操作（编辑/重置密码/启用/禁用/删除）

**新增/编辑用户对话框**：
- 用户名（必填）
- 真实姓名（必填）
- 手机号（必填，唯一）
- 密码（新增必填，编辑时可选）
- 角色（必填，多选：系统管理员/营销人员/销售人员/财务人员/运营人员）
- 状态（启用/禁用）

**API调用**：
- `GET /v1/users?page=1&limit=20` - 获取用户列表
- `POST /v1/users` - 新增用户
- `PUT /v1/users/:id` - 更新用户
- `PUT /v1/users/:id/reset-password` - 重置密码
- `DELETE /v1/users/:id` - 删除用户（软删除）

#### 3.13.2 角色管理（/system/roles）

**文件路径**：`/frontend/src/views/system/RoleManagement.vue`

**功能描述**：
- 查看固定的5个角色
- 为角色配置权限

**表格列**：
- 角色编码
- 角色名称
- 是否系统角色
- 权限数量
- 创建时间
- 操作（配置权限/查看详情）

**配置权限对话框**：
- 显示所有权限列表（树形结构，按模块分组）
- 勾选该角色拥有的权限
- 保存权限配置

**API调用**：
- `GET /v1/roles` - 获取角色列表
- `GET /v1/roles/:id/permissions` - 获取角色权限
- `PUT /v1/roles/:id/permissions` - 更新角色权限

#### 3.13.3 权限配置（/system/permissions）

**文件路径**：`/frontend/src/views/system/PermissionManagement.vue`

**功能描述**：
- 查看所有权限列表（按模块分组）
- v1.0阶段仅查看，不支持新增/编辑/删除

**表格列**（树形结构）：
- 权限编码
- 权限名称
- 所属模块
- 操作类型（查看/新增/编辑/删除/导出等）
- 创建时间

**API调用**：
- `GET /v1/permissions` - 获取权限列表

#### 3.13.4 操作日志（/system/audit-logs）

**文件路径**：`/frontend/src/views/system/AuditLogs.vue`

**功能描述**：
- 查看所有操作审计日志
- 筛选条件：操作模块、操作类型、操作人、时间范围
- 搜索：实体ID

**表格列**：
- 操作时间
- 操作人
- 操作模块
- 操作类型（新增/修改/删除/查看/导出等）
- 实体类型（客户/产品/合同等）
- 实体ID
- IP地址
- 操作描述
- 操作（查看详情）

**查看详情对话框**：
- 展示完整的请求参数（JSON格式，敏感信息已脱敏）
- 展示操作前后的数据对比（如果有）

**API调用**：
- `GET /v1/audit-logs?page=1&limit=20&module=customer&action=create&user_id=1` - 获取操作日志列表
- `GET /v1/audit-logs/:id` - 获取日志详情

#### 3.13.5 系统设置（/system/settings）

**文件路径**：`/frontend/src/views/system/Settings.vue`

**功能描述**：
- 系统全局配置（v1.0阶段预留）

**配置项**：
- 系统名称
- Logo上传
- 报价单有效期默认天数（默认30天）
- 任务提前提醒天数（默认3天）
- 文件上传大小限制（默认10MB）

**API调用**：
- `GET /v1/system/settings` - 获取系统设置
- `PUT /v1/system/settings` - 更新系统设置

---

## 四、路由配置代码

### 4.1 完整路由配置

**文件路径**：`/frontend/src/router/index.js`

```javascript
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 布局组件
import Layout from '@/layout/Index.vue'

// 登录页
import Login from '@/views/auth/Login.vue'

// 路由配置
const routes = [
  // 登录页（无需认证）
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },

  // 主应用布局
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      // ========== 首页 ==========
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        meta: { title: '首页', icon: 'dashboard' }
      },

      // ========== 产品管理 ==========
      {
        path: 'products',
        name: 'Products',
        redirect: '/products/list',
        meta: { title: '产品管理', icon: 'product' },
        children: [
          {
            path: 'categories',
            name: 'ProductCategories',
            component: () => import('@/views/product/CategoryList.vue'),
            meta: { title: '产品分类' }
          },
          {
            path: 'list',
            name: 'ProductList',
            component: () => import('@/views/product/ProductList.vue'),
            meta: { title: '产品列表' }
          },
          {
            path: 'create',
            name: 'ProductCreate',
            component: () => import('@/views/product/ProductForm.vue'),
            meta: { title: '新增产品' }
          },
          {
            path: 'edit/:id',
            name: 'ProductEdit',
            component: () => import('@/views/product/ProductForm.vue'),
            meta: { title: '编辑产品' }
          },
          {
            path: 'detail/:id',
            name: 'ProductDetail',
            component: () => import('@/views/product/ProductDetail.vue'),
            meta: { title: '产品详情' }
          }
        ]
      },

      // ========== 客户管理 ==========
      {
        path: 'customers',
        name: 'Customers',
        redirect: '/customers/list',
        meta: { title: '客户管理', icon: 'customer' },
        children: [
          {
            path: 'list',
            name: 'CustomerList',
            component: () => import('@/views/customer/CustomerList.vue'),
            meta: { title: '客户列表' }
          },
          {
            path: 'create',
            name: 'CustomerCreate',
            component: () => import('@/views/customer/CustomerForm.vue'),
            meta: { title: '新增客户' }
          },
          {
            path: 'edit/:id',
            name: 'CustomerEdit',
            component: () => import('@/views/customer/CustomerForm.vue'),
            meta: { title: '编辑客户' }
          },
          {
            path: 'detail/:id',
            name: 'CustomerDetail',
            component: () => import('@/views/customer/CustomerDetail.vue'),
            meta: { title: '客户详情' }
          }
        ]
      },

      // ========== 线索管理 ==========
      {
        path: 'leads',
        name: 'Leads',
        redirect: '/leads/pool',
        meta: { title: '线索管理', icon: 'lead' },
        children: [
          {
            path: 'pool',
            name: 'LeadPool',
            component: () => import('@/views/lead/LeadPool.vue'),
            meta: { title: '线索池' }
          },
          {
            path: 'follow-ups',
            name: 'FollowUpList',
            component: () => import('@/views/lead/FollowUpList.vue'),
            meta: { title: '跟进记录' }
          },
          {
            path: 'create-follow-up',
            name: 'CreateFollowUp',
            component: () => import('@/views/lead/FollowUpForm.vue'),
            meta: { title: '新增跟进' }
          }
        ]
      },

      // ========== 报价管理 ==========
      {
        path: 'quotations',
        name: 'Quotations',
        redirect: '/quotations/list',
        meta: { title: '报价管理', icon: 'quotation' },
        children: [
          {
            path: 'list',
            name: 'QuotationList',
            component: () => import('@/views/quotation/QuotationList.vue'),
            meta: { title: '报价单列表' }
          },
          {
            path: 'create',
            name: 'QuotationCreate',
            component: () => import('@/views/quotation/QuotationCreate.vue'),
            meta: { title: '创建报价单' }
          },
          {
            path: 'detail/:id',
            name: 'QuotationDetail',
            component: () => import('@/views/quotation/QuotationDetail.vue'),
            meta: { title: '报价单详情' }
          }
        ]
      },

      // ========== 合同管理 ==========
      {
        path: 'contracts',
        name: 'Contracts',
        redirect: '/contracts/list',
        meta: { title: '合同管理', icon: 'contract' },
        children: [
          {
            path: 'list',
            name: 'ContractList',
            component: () => import('@/views/contract/ContractList.vue'),
            meta: { title: '合同列表' }
          },
          {
            path: 'create',
            name: 'ContractCreate',
            component: () => import('@/views/contract/ContractCreate.vue'),
            meta: { title: '创建合同' }
          },
          {
            path: 'detail/:id',
            name: 'ContractDetail',
            component: () => import('@/views/contract/ContractDetail.vue'),
            meta: { title: '合同详情' }
          }
        ]
      },

      // ========== 任务管理 ==========
      {
        path: 'tasks',
        name: 'Tasks',
        redirect: '/tasks/my',
        meta: { title: '任务管理', icon: 'task' },
        children: [
          {
            path: 'my',
            name: 'MyTasks',
            component: () => import('@/views/task/MyTasks.vue'),
            meta: { title: '我的任务' }
          },
          {
            path: 'all',
            name: 'AllTasks',
            component: () => import('@/views/task/AllTasks.vue'),
            meta: { title: '所有任务' }
          },
          {
            path: 'completed',
            name: 'CompletedTasks',
            component: () => import('@/views/task/CompletedTasks.vue'),
            meta: { title: '已完成任务' }
          }
        ]
      },

      // ========== 发货管理 ==========
      {
        path: 'shipments',
        name: 'Shipments',
        redirect: '/shipments/list',
        meta: { title: '发货管理', icon: 'shipment' },
        children: [
          {
            path: 'list',
            name: 'ShipmentList',
            component: () => import('@/views/shipment/ShipmentList.vue'),
            meta: { title: '发货单列表' }
          },
          {
            path: 'create',
            name: 'ShipmentCreate',
            component: () => import('@/views/shipment/ShipmentCreate.vue'),
            meta: { title: '创建发货单' }
          },
          {
            path: 'detail/:id',
            name: 'ShipmentDetail',
            component: () => import('@/views/shipment/ShipmentDetail.vue'),
            meta: { title: '发货单详情' }
          }
        ]
      },

      // ========== 收款管理 ==========
      {
        path: 'payments',
        name: 'Payments',
        redirect: '/payments/list',
        meta: { title: '收款管理', icon: 'payment' },
        children: [
          {
            path: 'list',
            name: 'PaymentList',
            component: () => import('@/views/payment/PaymentList.vue'),
            meta: { title: '收款记录' }
          },
          {
            path: 'create',
            name: 'PaymentCreate',
            component: () => import('@/views/payment/PaymentCreate.vue'),
            meta: { title: '新增收款' }
          },
          {
            path: 'receivables',
            name: 'Receivables',
            component: () => import('@/views/payment/Receivables.vue'),
            meta: { title: '应收账款统计' }
          }
        ]
      },

      // ========== 发票管理 ==========
      {
        path: 'invoices',
        name: 'Invoices',
        redirect: '/invoices/list',
        meta: { title: '发票管理', icon: 'invoice' },
        children: [
          {
            path: 'list',
            name: 'InvoiceList',
            component: () => import('@/views/invoice/InvoiceList.vue'),
            meta: { title: '发票列表' }
          },
          {
            path: 'create',
            name: 'InvoiceCreate',
            component: () => import('@/views/invoice/InvoiceCreate.vue'),
            meta: { title: '新增发票' }
          },
          {
            path: 'detail/:id',
            name: 'InvoiceDetail',
            component: () => import('@/views/invoice/InvoiceDetail.vue'),
            meta: { title: '发票详情' }
          }
        ]
      },

      // ========== 售后服务 ==========
      {
        path: 'service-tickets',
        name: 'ServiceTickets',
        redirect: '/service-tickets/list',
        meta: { title: '售后服务', icon: 'service' },
        children: [
          {
            path: 'list',
            name: 'ServiceTicketList',
            component: () => import('@/views/service-ticket/TicketList.vue'),
            meta: { title: '工单列表' }
          },
          {
            path: 'create',
            name: 'ServiceTicketCreate',
            component: () => import('@/views/service-ticket/TicketCreate.vue'),
            meta: { title: '创建工单' }
          },
          {
            path: 'detail/:id',
            name: 'ServiceTicketDetail',
            component: () => import('@/views/service-ticket/TicketDetail.vue'),
            meta: { title: '工单详情' }
          }
        ]
      },

      // ========== 系统管理 ==========
      {
        path: 'system',
        name: 'System',
        redirect: '/system/users',
        meta: { title: '系统管理', icon: 'system' },
        children: [
          {
            path: 'users',
            name: 'UserManagement',
            component: () => import('@/views/system/UserManagement.vue'),
            meta: { title: '用户管理' }
          },
          {
            path: 'roles',
            name: 'RoleManagement',
            component: () => import('@/views/system/RoleManagement.vue'),
            meta: { title: '角色管理' }
          },
          {
            path: 'permissions',
            name: 'PermissionManagement',
            component: () => import('@/views/system/PermissionManagement.vue'),
            meta: { title: '权限配置' }
          },
          {
            path: 'audit-logs',
            name: 'AuditLogs',
            component: () => import('@/views/system/AuditLogs.vue'),
            meta: { title: '操作日志' }
          },
          {
            path: 'settings',
            name: 'SystemSettings',
            component: () => import('@/views/system/Settings.vue'),
            meta: { title: '系统设置' }
          }
        ]
      }
    ]
  },

  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue')
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 全局前置守卫（认证检查）
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 检查是否需要认证
  if (to.meta.requiresAuth !== false) {
    // 需要认证
    if (!authStore.isAuthenticated) {
      // 未登录，跳转到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      // 已登录，检查权限（可选）
      // TODO: 权限检查逻辑
      next()
    }
  } else {
    // 不需要认证
    if (to.path === '/login' && authStore.isAuthenticated) {
      // 已登录用户访问登录页，跳转到首页
      next('/dashboard')
    } else {
      next()
    }
  }
})

export default router
```

### 4.2 菜单配置（侧边栏）

**文件路径**：`/frontend/src/layout/components/Sidebar.vue`

```javascript
// 菜单配置数据（可从路由自动生成）
const menuItems = [
  {
    path: '/dashboard',
    title: '首页',
    icon: 'el-icon-house',
    meta: { requiresAuth: true }
  },
  {
    path: '/products',
    title: '产品管理',
    icon: 'el-icon-box',
    children: [
      { path: '/products/categories', title: '产品分类' },
      { path: '/products/list', title: '产品列表' }
    ]
  },
  {
    path: '/customers',
    title: '客户管理',
    icon: 'el-icon-user',
    children: [
      { path: '/customers/list', title: '客户列表' }
    ]
  },
  {
    path: '/leads',
    title: '线索管理',
    icon: 'el-icon-connection',
    children: [
      { path: '/leads/pool', title: '线索池' },
      { path: '/leads/follow-ups', title: '跟进记录' }
    ]
  },
  {
    path: '/quotations',
    title: '报价管理',
    icon: 'el-icon-document',
    children: [
      { path: '/quotations/list', title: '报价单列表' }
    ]
  },
  {
    path: '/contracts',
    title: '合同管理',
    icon: 'el-icon-document-checked',
    children: [
      { path: '/contracts/list', title: '合同列表' }
    ]
  },
  {
    path: '/tasks',
    title: '任务管理',
    icon: 'el-icon-bell',
    children: [
      { path: '/tasks/my', title: '我的任务' },
      { path: '/tasks/all', title: '所有任务' }
    ]
  },
  {
    path: '/shipments',
    title: '发货管理',
    icon: 'el-icon-box',
    children: [
      { path: '/shipments/list', title: '发货单列表' }
    ]
  },
  {
    path: '/payments',
    title: '收款管理',
    icon: 'el-icon-money',
    children: [
      { path: '/payments/list', title: '收款记录' },
      { path: '/payments/receivables', title: '应收账款' }
    ]
  },
  {
    path: '/invoices',
    title: '发票管理',
    icon: 'el-icon-tickets',
    children: [
      { path: '/invoices/list', title: '发票列表' }
    ]
  },
  {
    path: '/service-tickets',
    title: '售后服务',
    icon: 'el-icon-service',
    children: [
      { path: '/service-tickets/list', title: '工单列表' }
    ]
  },
  {
    path: '/system',
    title: '系统管理',
    icon: 'el-icon-setting',
    children: [
      { path: '/system/users', title: '用户管理' },
      { path: '/system/roles', title: '角色管理' },
      { path: '/system/audit-logs', title: '操作日志' }
    ]
  }
]
```

---

## 五、前端目录结构

```
/frontend/src/
├── assets/              # 静态资源
│   ├── images/          # 图片
│   ├── styles/          # 全局样式
│   └── icons/           # 图标
├── components/          # 通用组件
│   ├── customer/        # 客户相关组件
│   │   └── ContactDialog.vue
│   ├── contract/        # 合同相关组件
│   │   └── AmendmentDialog.vue
│   └── service-ticket/  # 售后相关组件
│       └── AssignDialog.vue
├── layout/              # 布局组件
│   ├── Index.vue        # 主布局
│   └── components/      # 布局子组件
│       ├── Header.vue   # 顶部导航
│       ├── Sidebar.vue  # 左侧菜单
│       └── Breadcrumb.vue  # 面包屑
├── views/               # 页面组件（按模块组织）
│   ├── auth/            # 认证
│   │   └── Login.vue
│   ├── dashboard/       # 首页
│   │   └── Index.vue
│   ├── product/         # 产品管理
│   │   ├── CategoryList.vue
│   │   ├── ProductList.vue
│   │   ├── ProductForm.vue
│   │   └── ProductDetail.vue
│   ├── customer/        # 客户管理
│   │   ├── CustomerList.vue
│   │   ├── CustomerForm.vue
│   │   └── CustomerDetail.vue
│   ├── lead/            # 线索管理
│   │   ├── LeadPool.vue
│   │   ├── FollowUpList.vue
│   │   └── FollowUpForm.vue
│   ├── quotation/       # 报价管理
│   │   ├── QuotationList.vue
│   │   ├── QuotationCreate.vue
│   │   └── QuotationDetail.vue
│   ├── contract/        # 合同管理
│   │   ├── ContractList.vue
│   │   ├── ContractCreate.vue
│   │   └── ContractDetail.vue
│   ├── task/            # 任务管理
│   │   ├── MyTasks.vue
│   │   ├── AllTasks.vue
│   │   └── CompletedTasks.vue
│   ├── shipment/        # 发货管理
│   │   ├── ShipmentList.vue
│   │   ├── ShipmentCreate.vue
│   │   └── ShipmentDetail.vue
│   ├── payment/         # 收款管理
│   │   ├── PaymentList.vue
│   │   ├── PaymentCreate.vue
│   │   └── Receivables.vue
│   ├── invoice/         # 发票管理
│   │   ├── InvoiceList.vue
│   │   ├── InvoiceCreate.vue
│   │   └── InvoiceDetail.vue
│   ├── service-ticket/  # 售后服务
│   │   ├── TicketList.vue
│   │   ├── TicketCreate.vue
│   │   └── TicketDetail.vue
│   ├── system/          # 系统管理
│   │   ├── UserManagement.vue
│   │   ├── RoleManagement.vue
│   │   ├── PermissionManagement.vue
│   │   ├── AuditLogs.vue
│   │   └── Settings.vue
│   └── error/           # 错误页面
│       └── 404.vue
├── router/              # 路由配置
│   └── index.js
├── stores/              # Pinia状态管理
│   ├── auth.js          # 认证状态
│   ├── user.js          # 用户信息
│   └── app.js           # 应用配置
├── api/                 # API接口封装
│   ├── auth.js          # 认证接口
│   ├── customer.js      # 客户接口
│   ├── product.js       # 产品接口
│   ├── quotation.js     # 报价单接口
│   ├── contract.js      # 合同接口
│   ├── task.js          # 任务接口
│   ├── shipment.js      # 发货接口
│   ├── payment.js       # 收款接口
│   ├── invoice.js       # 发票接口
│   ├── serviceTicket.js # 售后接口
│   └── system.js        # 系统管理接口
├── utils/               # 工具函数
│   ├── request.js       # Axios封装
│   ├── auth.js          # 认证工具
│   ├── date.js          # 日期格式化
│   └── validation.js    # 表单验证
├── App.vue              # 根组件
└── main.js              # 入口文件
```

---

## 六、开发建议

### 6.1 开发优先级

**Phase 1 - 基础设施（优先开发）**：
1. 布局组件（Layout, Header, Sidebar）
2. 路由配置
3. 认证状态管理（Pinia Store）
4. API请求封装（Axios）
5. 登录页

**Phase 2 - 基础数据模块**：
1. 产品管理（分类、产品列表、表单、详情）
2. 客户管理（列表、表单、详情、联系人管理）
3. 用户管理、角色管理

**Phase 3 - 线索与跟进**：
1. 线索池
2. 跟进记录
3. 线索指派功能

**Phase 4 - 报价与合同**：
1. 报价单（列表、创建、详情、生成PDF）
2. 合同（列表、创建、详情、补充协议）

**Phase 5 - 任务系统**：
1. 我的任务
2. 任务自动生成逻辑

**Phase 6 - 执行流程**：
1. 发货管理
2. 收款管理
3. 发票管理

**Phase 7 - 售后服务**：
1. 服务工单
2. 工单派单

**Phase 8 - 首页与系统管理**：
1. Dashboard数据展示
2. 操作日志
3. 系统设置

### 6.2 技术要点

1. **权限控制**：使用路由守卫 + 按钮级权限指令
2. **状态管理**：Pinia管理全局状态（用户信息、菜单权限）
3. **API调用**：统一使用Axios封装，处理Token、错误、Loading
4. **表单验证**：使用Element Plus的表单验证 + 自定义验证规则
5. **日期处理**：统一使用dayjs
6. **文件上传**：使用Element Plus的Upload组件 + 阿里云OSS
7. **PDF生成**：使用jsPDF或pdfmake
8. **富文本编辑器**：使用Tinymce或Quill
9. **数据导出**：使用xlsx或exceljs

### 6.3 代码规范

1. **组件命名**：PascalCase（如：CustomerList.vue）
2. **文件命名**：kebab-case（如：customer-list.vue）或PascalCase
3. **API命名**：camelCase（如：getCustomerList）
4. **路由命名**：PascalCase（如：CustomerList）
5. **CSS命名**：BEM规范（如：customer-list__item）

---

## 七、后续工作

1. **UI设计**：基于此文档设计高保真原型
2. **API对接**：前端与后端API联调
3. **单元测试**：关键组件和工具函数的单元测试
4. **E2E测试**：核心业务流程的端到端测试
5. **性能优化**：路由懒加载、组件按需加载、资源压缩

---

**文档结束**

生成时间：2025-12-24
文档版本：v1.0
