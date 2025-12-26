# 艾居来 CRM - 开发规范文档

**文档版本**：v1.0
**创建日期**：2025-12-24
**适用范围**：前端开发 + 后端开发
**目标**：统一代码风格，提升代码质量，便于团队协作

---

## 一、代码规范

### 1.1 前端代码规范（Vue 3 + JavaScript）

#### 1.1.1 命名规范

| 类型 | 规范 | 示例 | 说明 |
|-----|------|------|------|
| **文件命名** | PascalCase | `CustomerList.vue` | 组件文件使用大驼峰 |
| **组件名** | PascalCase | `<CustomerList />` | 组件使用时保持大驼峰 |
| **目录命名** | kebab-case | `customer-management/` | 目录使用短横线分隔 |
| **变量命名** | camelCase | `customerList` | 小驼峰命名 |
| **常量命名** | UPPER_SNAKE_CASE | `API_BASE_URL` | 全大写下划线分隔 |
| **私有属性** | _camelCase | `_privateMethod()` | 前缀下划线 |
| **路由命名** | PascalCase | `name: 'CustomerList'` | 路由name使用大驼峰 |
| **Store命名** | camelCase | `useAuthStore` | Store使用use前缀 |

**示例**：
```javascript
// ✅ 正确
const userName = 'John'
const MAX_COUNT = 100
const customerList = []

function getUserInfo() {}
function _privateHelper() {}

// ❌ 错误
const UserName = 'John'  // 应该用小驼峰
const maxcount = 100     // 常量应该全大写
const customer_list = [] // 应该用小驼峰
```

#### 1.1.2 Vue组件规范

**组件结构顺序**：
```vue
<template>
  <!-- 模板代码 -->
</template>

<script setup>
// 1. 导入依赖
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 2. 定义Props
const props = defineProps({
  customerId: {
    type: Number,
    required: true
  }
})

// 3. 定义Emits
const emit = defineEmits(['update', 'delete'])

// 4. 响应式数据
const customerData = ref(null)
const loading = ref(false)

// 5. 计算属性
const fullName = computed(() => {
  return `${customerData.value?.firstName} ${customerData.value?.lastName}`
})

// 6. 方法
const fetchCustomer = async () => {
  loading.value = true
  try {
    // API调用
  } finally {
    loading.value = false
  }
}

// 7. 生命周期
onMounted(() => {
  fetchCustomer()
})
</script>

<style scoped>
/* 样式代码 */
</style>
```

**Props定义规范**：
```javascript
// ✅ 正确：完整的Props定义
const props = defineProps({
  customerId: {
    type: Number,
    required: true
  },
  customerType: {
    type: String,
    default: 'hotel',
    validator: (value) => ['hotel', 'distributor', 'homestay'].includes(value)
  },
  maxCount: {
    type: Number,
    default: 10
  }
})

// ❌ 错误：不完整的Props定义
const props = defineProps(['customerId', 'customerType'])
```

**Emits定义规范**：
```javascript
// ✅ 正确：明确声明所有事件
const emit = defineEmits(['update:modelValue', 'submit', 'cancel'])

// 使用时
emit('update:modelValue', newValue)
emit('submit', formData)

// ❌ 错误：不声明直接使用
emit('someEvent')  // 应该先在defineEmits中声明
```

**模板语法规范**：
```vue
<!-- ✅ 正确 -->
<template>
  <!-- 使用v-if/v-else-if/v-else -->
  <div v-if="loading">加载中...</div>
  <div v-else-if="error">{{ error }}</div>
  <div v-else>{{ data }}</div>

  <!-- 列表渲染必须有key -->
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>

  <!-- 事件绑定使用@简写 -->
  <button @click="handleClick">点击</button>

  <!-- 属性绑定使用:简写 -->
  <input :value="inputValue" @input="handleInput">

  <!-- 多个属性换行 -->
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    label-width="120px"
  >
  </el-form>
</template>

<!-- ❌ 错误 -->
<template>
  <!-- 缺少key -->
  <div v-for="item in items">{{ item.name }}</div>

  <!-- 不使用简写 -->
  <button v-on:click="handleClick">点击</button>
  <input v-bind:value="inputValue">
</template>
```

#### 1.1.3 JavaScript代码规范

**变量声明**：
```javascript
// ✅ 正确：使用const和let，不使用var
const API_URL = 'https://api.example.com'
let count = 0

// ❌ 错误：使用var
var count = 0
```

**函数声明**：
```javascript
// ✅ 正确：使用箭头函数（简洁）
const add = (a, b) => a + b

const fetchData = async () => {
  const response = await api.get('/data')
  return response.data
}

// ✅ 正确：普通函数（需要this绑定时）
function handleClick() {
  this.count++
}

// ❌ 错误：不必要的普通函数
function add(a, b) {
  return a + b
}
```

**对象和数组**：
```javascript
// ✅ 正确：使用对象字面量
const customer = {
  id: 1,
  name: 'John',
  type: 'hotel'
}

// ✅ 正确：使用解构赋值
const { id, name } = customer
const [first, second] = array

// ✅ 正确：使用扩展运算符
const newCustomer = { ...customer, name: 'Jane' }
const newArray = [...oldArray, newItem]

// ❌ 错误：不使用字面量
const customer = new Object()
customer.id = 1
```

**异步处理**：
```javascript
// ✅ 正确：使用async/await
const fetchCustomer = async (id) => {
  try {
    const response = await api.get(`/customers/${id}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch customer:', error)
    throw error
  }
}

// ❌ 错误：使用Promise链
const fetchCustomer = (id) => {
  return api.get(`/customers/${id}`)
    .then(response => response.data)
    .catch(error => {
      console.error(error)
      throw error
    })
}
```

**注释规范**：
```javascript
/**
 * 获取客户详情
 * @param {number} customerId - 客户ID
 * @returns {Promise<Object>} 客户详情对象
 * @throws {Error} 当客户不存在时抛出错误
 */
const fetchCustomer = async (customerId) => {
  // 发送API请求
  const response = await api.get(`/customers/${customerId}`)

  // 返回数据
  return response.data
}

// 单行注释前空一行
const count = 0

// 这是一个计数器
const increment = () => count++
```

#### 1.1.4 CSS/SCSS规范

**BEM命名规范**：
```scss
// ✅ 正确：BEM命名
.customer-list {
  &__item {
    padding: 10px;

    &--active {
      background-color: #f0f0f0;
    }
  }

  &__title {
    font-size: 16px;
  }
}

// 编译后：
// .customer-list {}
// .customer-list__item {}
// .customer-list__item--active {}
// .customer-list__title {}

// ❌ 错误：随意命名
.list {
  .item {
    .title {}
  }
}
```

**样式组织**：
```scss
<style scoped lang="scss">
// 1. 变量定义
$primary-color: #409eff;
$border-radius: 4px;

// 2. 主容器
.customer-detail {
  padding: 20px;

  // 3. 子元素（按DOM结构顺序）
  &__header {
    margin-bottom: 20px;
  }

  &__content {
    background: #fff;
  }

  &__footer {
    margin-top: 20px;
  }
}

// 4. 响应式（如需要）
@media (max-width: 768px) {
  .customer-detail {
    padding: 10px;
  }
}
</style>
```

---

### 1.2 后端代码规范（Node.js + Express）

#### 1.2.1 命名规范

| 类型 | 规范 | 示例 | 说明 |
|-----|------|------|------|
| **文件命名** | camelCase | `customerController.js` | 文件使用小驼峰 |
| **类命名** | PascalCase | `class CustomerService {}` | 类使用大驼峰 |
| **函数命名** | camelCase | `function getCustomer() {}` | 函数使用小驼峰 |
| **常量命名** | UPPER_SNAKE_CASE | `const MAX_RETRY = 3` | 全大写下划线分隔 |
| **私有方法** | _camelCase | `_validateData()` | 前缀下划线 |
| **Model命名** | PascalCase | `Customer.findAll()` | Sequelize Model大驼峰 |
| **路由路径** | kebab-case | `/api/v1/customer-follow-ups` | URL使用短横线 |

#### 1.2.2 文件结构规范

**Controller文件结构**：
```javascript
// src/controllers/customerController.js

// 1. 导入依赖
const { Customer, CustomerContact } = require('../models')
const { ApiResponse } = require('../utils/response')
const { validateCustomer } = require('../validators/customerValidator')

// 2. 定义Controller类
class CustomerController {
  /**
   * 获取客户列表
   * @route GET /api/v1/customers
   */
  async getCustomers(req, res, next) {
    try {
      const { page = 1, limit = 20, search, status } = req.query

      // 业务逻辑
      const result = await Customer.findAndCountAll({
        where: { /* 查询条件 */ },
        limit,
        offset: (page - 1) * limit
      })

      // 返回响应
      return res.json(ApiResponse.paginated(
        result.rows,
        result.count,
        page,
        limit
      ))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 获取客户详情
   * @route GET /api/v1/customers/:id
   */
  async getCustomerById(req, res, next) {
    try {
      const { id } = req.params

      const customer = await Customer.findByPk(id, {
        include: [{ model: CustomerContact }]
      })

      if (!customer) {
        return res.status(404).json(
          ApiResponse.error('Customer not found', 404)
        )
      }

      return res.json(ApiResponse.success(customer))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 创建客户
   * @route POST /api/v1/customers
   */
  async createCustomer(req, res, next) {
    try {
      // 参数校验
      const { error, value } = validateCustomer(req.body)
      if (error) {
        return res.status(400).json(
          ApiResponse.error('Validation failed', 400, error.details)
        )
      }

      // 创建客户
      const customer = await Customer.create({
        ...value,
        created_by: req.user.id
      })

      return res.status(201).json(
        ApiResponse.success(customer, 'Customer created successfully')
      )
    } catch (error) {
      next(error)
    }
  }

  // ... 更多方法
}

// 3. 导出实例
module.exports = new CustomerController()
```

**Service文件结构**：
```javascript
// src/services/customerService.js

const { Customer, CustomerContact, sequelize } = require('../models')

class CustomerService {
  /**
   * 创建客户及联系人（事务）
   */
  async createCustomerWithContact(customerData, contactData) {
    const transaction = await sequelize.transaction()

    try {
      // 创建客户
      const customer = await Customer.create(customerData, { transaction })

      // 创建联系人
      if (contactData) {
        await CustomerContact.create({
          ...contactData,
          customer_id: customer.id
        }, { transaction })
      }

      await transaction.commit()
      return customer
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  /**
   * 转移客户负责人
   */
  async transferOwner(customerId, newOwnerId, operatorId) {
    const customer = await Customer.findByPk(customerId)

    if (!customer) {
      throw new Error('Customer not found')
    }

    const oldOwnerId = customer.owner_id

    // 更新负责人
    await customer.update({
      owner_id: newOwnerId,
      updated_by: operatorId
    })

    // 记录操作日志
    await this._logOwnerTransfer(customerId, oldOwnerId, newOwnerId, operatorId)

    return customer
  }

  /**
   * 私有方法：记录负责人变更日志
   */
  async _logOwnerTransfer(customerId, oldOwnerId, newOwnerId, operatorId) {
    // 日志记录逻辑
  }
}

module.exports = new CustomerService()
```

**Model文件结构**：
```javascript
// src/models/Customer.js

const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    customer_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '客户编码'
    },
    customer_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '客户名称'
    },
    customer_type: {
      type: DataTypes.ENUM(
        'chain_hotel',
        'independent_hotel',
        'distributor',
        'homestay',
        'apartment'
      ),
      allowNull: false,
      comment: '客户类型'
    },
    // ... 更多字段
  }, {
    tableName: 'customer',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    comment: '客户表'
  })

  // 定义关联关系
  Customer.associate = (models) => {
    Customer.hasMany(models.CustomerContact, {
      foreignKey: 'customer_id',
      as: 'contacts'
    })

    Customer.hasMany(models.Quotation, {
      foreignKey: 'customer_id',
      as: 'quotations'
    })
  }

  return Customer
}
```

#### 1.2.3 错误处理规范

**统一错误类**：
```javascript
// src/utils/errors.js

class AppError extends Error {
  constructor(message, statusCode = 500, data = null) {
    super(message)
    this.statusCode = statusCode
    this.data = data
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400, errors)
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404)
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401)
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError
}
```

**使用示例**：
```javascript
const { NotFoundError, ValidationError } = require('../utils/errors')

// 在Controller中使用
async getCustomerById(req, res, next) {
  try {
    const customer = await Customer.findByPk(req.params.id)

    if (!customer) {
      throw new NotFoundError('Customer')
    }

    return res.json(ApiResponse.success(customer))
  } catch (error) {
    next(error)  // 传递给错误处理中间件
  }
}
```

#### 1.2.4 异步处理规范

**使用async/await**：
```javascript
// ✅ 正确：使用async/await
const getCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.findAll()
    res.json(ApiResponse.success(customers))
  } catch (error) {
    next(error)
  }
}

// ❌ 错误：使用回调
const getCustomers = (req, res, next) => {
  Customer.findAll()
    .then(customers => {
      res.json(ApiResponse.success(customers))
    })
    .catch(error => {
      next(error)
    })
}
```

**并发处理**：
```javascript
// ✅ 正确：使用Promise.all处理并发
const getCustomerDetails = async (customerId) => {
  const [customer, contacts, quotations] = await Promise.all([
    Customer.findByPk(customerId),
    CustomerContact.findAll({ where: { customer_id: customerId } }),
    Quotation.findAll({ where: { customer_id: customerId } })
  ])

  return { customer, contacts, quotations }
}

// ❌ 错误：串行执行
const getCustomerDetails = async (customerId) => {
  const customer = await Customer.findByPk(customerId)
  const contacts = await CustomerContact.findAll({ where: { customer_id: customerId } })
  const quotations = await Quotation.findAll({ where: { customer_id: customerId } })

  return { customer, contacts, quotations }
}
```

---

## 二、Git工作流程规范

### 2.1 分支管理策略

#### 2.1.1 分支类型

```
main (主分支)
  ├── develop (开发分支)
  │   ├── feature/user-management (功能分支)
  │   ├── feature/customer-crud
  │   └── feature/contract-management
  ├── release/v1.0 (发布分支)
  └── hotfix/fix-login-bug (热修复分支)
```

| 分支类型 | 命名规范 | 说明 | 生命周期 |
|---------|---------|------|---------|
| **main** | `main` | 生产环境代码，永远保持可部署状态 | 永久 |
| **develop** | `develop` | 开发分支，集成最新开发代码 | 永久 |
| **feature** | `feature/功能名称` | 新功能开发 | 临时 |
| **release** | `release/v版本号` | 发布准备 | 临时 |
| **hotfix** | `hotfix/bug描述` | 紧急修复生产环境Bug | 临时 |
| **bugfix** | `bugfix/bug描述` | 修复开发环境Bug | 临时 |

#### 2.1.2 分支工作流程

**功能开发流程**：
```bash
# 1. 从develop创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/customer-management

# 2. 开发功能（多次提交）
git add .
git commit -m "feat: 添加客户列表页面"
git commit -m "feat: 添加客户详情页面"

# 3. 定期同步develop分支
git checkout develop
git pull origin develop
git checkout feature/customer-management
git merge develop

# 4. 功能完成，合并到develop
git checkout develop
git merge --no-ff feature/customer-management
git push origin develop

# 5. 删除功能分支
git branch -d feature/customer-management
```

**发布流程**：
```bash
# 1. 从develop创建发布分支
git checkout develop
git checkout -b release/v1.0

# 2. 版本号修改、Bug修复
git commit -m "chore: 更新版本号到v1.0"
git commit -m "fix: 修复登录页样式问题"

# 3. 合并到main和develop
git checkout main
git merge --no-ff release/v1.0
git tag -a v1.0 -m "Release version 1.0"
git push origin main --tags

git checkout develop
git merge --no-ff release/v1.0
git push origin develop

# 4. 删除发布分支
git branch -d release/v1.0
```

**热修复流程**：
```bash
# 1. 从main创建热修复分支
git checkout main
git checkout -b hotfix/fix-login-bug

# 2. 修复Bug
git commit -m "fix: 修复登录失败的Bug"

# 3. 合并到main和develop
git checkout main
git merge --no-ff hotfix/fix-login-bug
git tag -a v1.0.1 -m "Hotfix: 修复登录Bug"
git push origin main --tags

git checkout develop
git merge --no-ff hotfix/fix-login-bug
git push origin develop

# 4. 删除热修复分支
git branch -d hotfix/fix-login-bug
```

### 2.2 提交信息规范

#### 2.2.1 Commit Message格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

**示例**：
```
feat(customer): 添加客户列表分页功能

- 实现分页组件
- 添加分页API调用
- 更新客户列表UI

Closes #123
```

#### 2.2.2 Type类型

| Type | 说明 | 示例 |
|------|------|------|
| **feat** | 新功能 | `feat: 添加客户管理模块` |
| **fix** | Bug修复 | `fix: 修复登录失败的问题` |
| **docs** | 文档修改 | `docs: 更新API文档` |
| **style** | 代码格式（不影响功能） | `style: 格式化代码` |
| **refactor** | 重构（不是新功能也不是Bug修复） | `refactor: 重构权限验证逻辑` |
| **perf** | 性能优化 | `perf: 优化客户列表查询性能` |
| **test** | 测试相关 | `test: 添加客户模块单元测试` |
| **chore** | 构建/工具相关 | `chore: 更新依赖包版本` |
| **ci** | CI/CD相关 | `ci: 添加GitHub Actions配置` |
| **revert** | 回退提交 | `revert: 回退feat(customer)提交` |

#### 2.2.3 Scope范围

| Scope | 说明 |
|-------|------|
| **customer** | 客户模块 |
| **product** | 产品模块 |
| **quotation** | 报价模块 |
| **contract** | 合同模块 |
| **task** | 任务模块 |
| **auth** | 认证模块 |
| **ui** | UI组件 |
| **api** | API接口 |
| **db** | 数据库 |

#### 2.2.4 提交信息示例

```bash
# ✅ 正确示例
git commit -m "feat(customer): 添加客户列表筛选功能"
git commit -m "fix(auth): 修复Token过期后无法自动刷新的问题"
git commit -m "docs: 更新README安装说明"
git commit -m "refactor(api): 重构API错误处理逻辑"
git commit -m "perf(customer): 优化客户列表查询SQL"
git commit -m "test(contract): 添加合同创建的单元测试"

# ❌ 错误示例
git commit -m "更新代码"
git commit -m "修复bug"
git commit -m "Add feature"
git commit -m "WIP"
```

### 2.3 代码审查规范

#### 2.3.1 Pull Request规范

**PR标题格式**：
```
[类型] 功能描述

示例：
[Feature] 客户管理模块
[Bugfix] 修复登录页面样式问题
[Refactor] 重构权限验证逻辑
```

**PR描述模板**：
```markdown
## 变更类型
- [ ] 新功能
- [ ] Bug修复
- [ ] 重构
- [ ] 文档更新
- [ ] 性能优化

## 变更描述
简要描述本次PR的主要变更内容

## 变更清单
- [ ] 添加客户列表页面
- [ ] 添加客户详情页面
- [ ] 添加客户CRUD API

## 测试清单
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 手动测试通过

## 截图（如有UI变更）
[截图]

## 相关Issue
Closes #123
```

#### 2.3.2 Code Review检查点

**功能性**：
- [ ] 代码实现符合需求
- [ ] 边界条件处理正确
- [ ] 错误处理完善

**代码质量**：
- [ ] 遵循代码规范
- [ ] 命名清晰易懂
- [ ] 没有重复代码
- [ ] 复杂逻辑有注释

**性能**：
- [ ] 没有性能问题
- [ ] 数据库查询优化
- [ ] 避免N+1查询

**安全**：
- [ ] 没有SQL注入风险
- [ ] 没有XSS漏洞
- [ ] 敏感数据已加密

**测试**：
- [ ] 有对应的单元测试
- [ ] 测试覆盖率足够

---

## 三、测试规范

### 3.1 测试策略

```
测试金字塔：
        /\
       /  \  E2E测试（10%）
      /____\
     /      \  集成测试（30%）
    /________\
   /          \  单元测试（60%）
  /__________\
```

### 3.2 单元测试规范

#### 3.2.1 前端单元测试（Vitest + Vue Test Utils）

**测试文件命名**：`ComponentName.spec.js`

**测试示例**：
```javascript
// src/components/CustomerList.spec.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CustomerList from './CustomerList.vue'

describe('CustomerList.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(CustomerList, {
      props: {
        customers: [
          { id: 1, name: 'Customer A' },
          { id: 2, name: 'Customer B' }
        ]
      }
    })
  })

  it('应该正确渲染客户列表', () => {
    const items = wrapper.findAll('.customer-list__item')
    expect(items).toHaveLength(2)
  })

  it('点击客户应该触发select事件', async () => {
    const firstItem = wrapper.find('.customer-list__item')
    await firstItem.trigger('click')

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')[0]).toEqual([1])
  })

  it('筛选功能应该正常工作', async () => {
    await wrapper.vm.filterCustomers('Customer A')

    const items = wrapper.findAll('.customer-list__item')
    expect(items).toHaveLength(1)
  })
})
```

**API调用测试（Mock）**：
```javascript
import { describe, it, expect, vi } from 'vitest'
import { getCustomers } from '@/api/customer'

// Mock axios
vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn()
  }
}))

describe('Customer API', () => {
  it('应该成功获取客户列表', async () => {
    const mockData = {
      code: 200,
      data: {
        items: [{ id: 1, name: 'Test' }],
        pagination: { total: 1 }
      }
    }

    const request = await import('@/utils/request')
    request.default.get.mockResolvedValue(mockData)

    const result = await getCustomers({ page: 1, limit: 20 })

    expect(result.data.items).toHaveLength(1)
    expect(request.default.get).toHaveBeenCalledWith('/v1/customers', {
      params: { page: 1, limit: 20 }
    })
  })
})
```

#### 3.2.2 后端单元测试（Jest）

**测试文件命名**：`functionName.test.js`

**Controller测试**：
```javascript
// tests/unit/controllers/customerController.test.js
const { CustomerController } = require('../../../src/controllers/customerController')
const { Customer } = require('../../../src/models')

// Mock模型
jest.mock('../../../src/models')

describe('CustomerController', () => {
  let req, res, next

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {},
      user: { id: 1 }
    }
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    }
    next = jest.fn()
  })

  describe('getCustomers', () => {
    it('应该返回客户列表', async () => {
      const mockCustomers = {
        rows: [{ id: 1, name: 'Test' }],
        count: 1
      }
      Customer.findAndCountAll.mockResolvedValue(mockCustomers)

      req.query = { page: 1, limit: 20 }

      await CustomerController.getCustomers(req, res, next)

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 200,
          data: expect.objectContaining({
            items: mockCustomers.rows,
            pagination: expect.any(Object)
          })
        })
      )
    })

    it('数据库错误应该调用next', async () => {
      const error = new Error('Database error')
      Customer.findAndCountAll.mockRejectedValue(error)

      await CustomerController.getCustomers(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })
})
```

**Service测试**：
```javascript
// tests/unit/services/customerService.test.js
const CustomerService = require('../../../src/services/customerService')
const { Customer, sequelize } = require('../../../src/models')

jest.mock('../../../src/models')

describe('CustomerService', () => {
  describe('createCustomerWithContact', () => {
    it('应该创建客户和联系人（事务）', async () => {
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn()
      }
      sequelize.transaction.mockResolvedValue(mockTransaction)

      const mockCustomer = { id: 1, name: 'Test' }
      Customer.create.mockResolvedValue(mockCustomer)

      const customerData = { name: 'Test' }
      const contactData = { name: 'Contact' }

      const result = await CustomerService.createCustomerWithContact(
        customerData,
        contactData
      )

      expect(Customer.create).toHaveBeenCalledWith(
        customerData,
        { transaction: mockTransaction }
      )
      expect(mockTransaction.commit).toHaveBeenCalled()
      expect(result).toEqual(mockCustomer)
    })

    it('发生错误应该回滚事务', async () => {
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn()
      }
      sequelize.transaction.mockResolvedValue(mockTransaction)

      const error = new Error('Create failed')
      Customer.create.mockRejectedValue(error)

      await expect(
        CustomerService.createCustomerWithContact({}, {})
      ).rejects.toThrow('Create failed')

      expect(mockTransaction.rollback).toHaveBeenCalled()
      expect(mockTransaction.commit).not.toHaveBeenCalled()
    })
  })
})
```

### 3.3 集成测试规范

**API集成测试**：
```javascript
// tests/integration/customer.test.js
const request = require('supertest')
const app = require('../../src/app')
const { Customer } = require('../../src/models')

describe('Customer API Integration', () => {
  let authToken

  beforeAll(async () => {
    // 登录获取Token
    const response = await request(app)
      .post('/v1/auth/login')
      .send({
        username: 'admin',
        password: 'password'
      })

    authToken = response.body.data.token
  })

  describe('GET /v1/customers', () => {
    it('应该返回客户列表', async () => {
      const response = await request(app)
        .get('/v1/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 20 })
        .expect(200)

      expect(response.body.code).toBe(200)
      expect(response.body.data.items).toBeInstanceOf(Array)
      expect(response.body.data.pagination).toBeDefined()
    })

    it('未认证应该返回401', async () => {
      await request(app)
        .get('/v1/customers')
        .expect(401)
    })
  })

  describe('POST /v1/customers', () => {
    it('应该成功创建客户', async () => {
      const newCustomer = {
        customer_name: 'Test Hotel',
        customer_type: 'hotel',
        customer_stage: 'lead'
      }

      const response = await request(app)
        .post('/v1/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newCustomer)
        .expect(201)

      expect(response.body.code).toBe(200)
      expect(response.body.data.customer_name).toBe('Test Hotel')
    })

    it('参数验证失败应该返回400', async () => {
      const response = await request(app)
        .post('/v1/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})  // 缺少必填字段
        .expect(400)

      expect(response.body.code).toBe(400)
    })
  })
})
```

### 3.4 E2E测试规范

**使用Playwright进行E2E测试**：
```javascript
// tests/e2e/customer-management.spec.js
const { test, expect } = require('@playwright/test')

test.describe('客户管理流程', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('http://localhost:5173/login')
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'password')
    await page.click('button[type="submit"]')

    // 等待跳转到首页
    await page.waitForURL('http://localhost:5173/dashboard')
  })

  test('应该能够查看客户列表', async ({ page }) => {
    // 导航到客户列表
    await page.click('text=客户管理')
    await page.click('text=客户列表')

    // 验证页面加载
    await expect(page.locator('h1')).toContainText('客户列表')

    // 验证表格显示
    const table = page.locator('.el-table')
    await expect(table).toBeVisible()
  })

  test('应该能够创建新客户', async ({ page }) => {
    // 导航到新增客户页面
    await page.click('text=客户管理')
    await page.click('text=新增客户')

    // 填写表单
    await page.fill('input[name="customer_name"]', 'Test Hotel')
    await page.selectOption('select[name="customer_type"]', 'hotel')
    await page.fill('input[name="contact_name"]', 'John Doe')
    await page.fill('input[name="contact_phone"]', '13800138000')

    // 提交表单
    await page.click('button:has-text("保存")')

    // 验证成功提示
    await expect(page.locator('.el-message')).toContainText('创建成功')

    // 验证跳转到列表页
    await expect(page).toHaveURL(/\/customers\/list/)
  })

  test('应该能够搜索客户', async ({ page }) => {
    await page.goto('http://localhost:5173/customers/list')

    // 输入搜索关键词
    await page.fill('input[placeholder="搜索客户"]', 'Test Hotel')
    await page.press('input[placeholder="搜索客户"]', 'Enter')

    // 验证搜索结果
    const firstRow = page.locator('.el-table tbody tr').first()
    await expect(firstRow).toContainText('Test Hotel')
  })
})
```

### 3.5 测试覆盖率要求

| 测试类型 | 覆盖率目标 | 说明 |
|---------|-----------|------|
| **单元测试** | > 70% | 核心业务逻辑必须有单元测试 |
| **集成测试** | > 50% | 所有API端点必须有集成测试 |
| **E2E测试** | 核心流程100% | 关键业务流程必须有E2E测试 |

**覆盖率检查命令**：
```bash
# 前端
npm run test:coverage

# 后端
npm run test:coverage

# 查看覆盖率报告
open coverage/index.html
```

---

## 四、文档规范

### 4.1 代码注释规范

**函数注释（JSDoc）**：
```javascript
/**
 * 获取客户详情
 *
 * @param {number} customerId - 客户ID
 * @param {Object} options - 查询选项
 * @param {boolean} options.includeContacts - 是否包含联系人信息
 * @param {boolean} options.includeQuotations - 是否包含报价单信息
 * @returns {Promise<Object>} 客户详情对象
 * @throws {NotFoundError} 当客户不存在时抛出
 *
 * @example
 * const customer = await getCustomer(1, { includeContacts: true })
 */
async function getCustomer(customerId, options = {}) {
  // 实现...
}
```

**复杂逻辑注释**：
```javascript
// ✅ 正确：解释为什么这样做
// 使用Map而不是对象，因为需要保持插入顺序
const customerMap = new Map()

// 先按创建时间排序，再按优先级排序，确保高优先级的客户优先显示
customers.sort((a, b) => {
  if (a.priority !== b.priority) {
    return b.priority - a.priority
  }
  return new Date(b.created_at) - new Date(a.created_at)
})

// ❌ 错误：注释重复代码
// 创建客户
const customer = await Customer.create(data)
```

### 4.2 API文档规范

**已完成**：参考 `docs/API_DESIGN.md`

### 4.3 README规范

**每个模块应该有README**：
```markdown
# 客户管理模块

## 功能概述
提供客户的CRUD功能，包括客户列表、详情、新增、编辑、删除等。

## 目录结构
\`\`\`
customer/
├── CustomerList.vue      # 客户列表页
├── CustomerDetail.vue    # 客户详情页
├── CustomerForm.vue      # 客户表单页
└── components/           # 客户相关组件
    └── ContactDialog.vue # 联系人对话框
\`\`\`

## API接口
- GET /v1/customers - 获取客户列表
- POST /v1/customers - 创建客户
- GET /v1/customers/:id - 获取客户详情
- PUT /v1/customers/:id - 更新客户
- DELETE /v1/customers/:id - 删除客户

## 使用示例
\`\`\`vue
<template>
  <CustomerList :customers="customers" @select="handleSelect" />
</template>
\`\`\`

## 注意事项
- 删除客户时需要检查是否有关联的报价单和合同
- 客户编码自动生成，格式：CUST-YYYYMMDD-XXX
```

---

## 五、性能优化规范

### 5.1 前端性能优化

**代码分割**：
```javascript
// ✅ 正确：路由懒加载
const routes = [
  {
    path: '/customers',
    component: () => import('@/views/customer/CustomerList.vue')
  }
]

// ✅ 正确：组件懒加载
const HeavyComponent = defineAsyncComponent(() =>
  import('./components/HeavyComponent.vue')
)
```

**列表优化**：
```vue
<!-- ✅ 正确：使用虚拟滚动（大列表） -->
<template>
  <el-table
    :data="customers"
    v-loading="loading"
    :height="600"
  >
    <!-- 表格列 -->
  </el-table>
</template>

<!-- ✅ 正确：分页（推荐） -->
<el-pagination
  :total="total"
  :page-size="20"
  @current-change="handlePageChange"
/>
```

**图片优化**：
```vue
<!-- ✅ 正确：图片懒加载 -->
<el-image
  :src="imageUrl"
  lazy
  :preview-src-list="[imageUrl]"
/>
```

### 5.2 后端性能优化

**数据库查询优化**：
```javascript
// ✅ 正确：使用索引字段查询
const customer = await Customer.findOne({
  where: { customer_code: 'CUST-001' }  // customer_code有索引
})

// ✅ 正确：只查询需要的字段
const customers = await Customer.findAll({
  attributes: ['id', 'customer_name', 'customer_type']
})

// ✅ 正确：使用分页
const customers = await Customer.findAndCountAll({
  limit: 20,
  offset: (page - 1) * 20
})

// ❌ 错误：N+1查询
const customers = await Customer.findAll()
for (const customer of customers) {
  customer.contacts = await CustomerContact.findAll({
    where: { customer_id: customer.id }
  })
}

// ✅ 正确：使用include避免N+1
const customers = await Customer.findAll({
  include: [{ model: CustomerContact, as: 'contacts' }]
})
```

**缓存策略**（v2.0）：
```javascript
// Redis缓存示例
const getCustomer = async (id) => {
  // 先查缓存
  const cached = await redis.get(`customer:${id}`)
  if (cached) {
    return JSON.parse(cached)
  }

  // 缓存未命中，查数据库
  const customer = await Customer.findByPk(id)

  // 写入缓存，过期时间5分钟
  await redis.setex(`customer:${id}`, 300, JSON.stringify(customer))

  return customer
}
```

---

## 六、安全开发规范

### 6.1 输入验证

**前端验证**：
```vue
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <el-form-item label="手机号" prop="phone">
      <el-input v-model="form.phone" />
    </el-form-item>
  </el-form>
</template>

<script setup>
const rules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ]
}
</script>
```

**后端验证**：
```javascript
const Joi = require('joi')

const customerSchema = Joi.object({
  customer_name: Joi.string().min(2).max(200).required(),
  customer_type: Joi.string().valid(
    'chain_hotel',
    'independent_hotel',
    'distributor',
    'homestay',
    'apartment'
  ).required(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required()
})

const validateCustomer = (data) => {
  return customerSchema.validate(data)
}
```

### 6.2 SQL注入防护

```javascript
// ✅ 正确：使用ORM参数化查询
const customer = await Customer.findOne({
  where: { customer_code: req.query.code }
})

// ❌ 错误：字符串拼接SQL
const query = `SELECT * FROM customer WHERE customer_code = '${req.query.code}'`
const result = await sequelize.query(query)
```

### 6.3 XSS防护

```vue
<!-- ✅ 正确：Vue自动转义 -->
<div>{{ customerName }}</div>

<!-- ❌ 错误：使用v-html渲染用户输入 -->
<div v-html="userInput"></div>

<!-- ✅ 正确：如果必须使用v-html，先进行过滤 -->
<div v-html="sanitize(userInput)"></div>
```

### 6.4 敏感数据处理

```javascript
// 手机号脱敏
const maskPhone = (phone) => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 身份证号脱敏
const maskIdCard = (idCard) => {
  return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
}

// 在API返回中使用
const customer = await Customer.findByPk(id)
return {
  ...customer.toJSON(),
  phone: maskPhone(customer.phone)
}
```

---

## 七、开发工具配置

### 7.1 ESLint配置

**前端 .eslintrc.js**：
```javascript
module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/max-attributes-per-line': ['error', {
      singleline: 3,
      multiline: 1
    }]
  }
}
```

**后端 .eslintrc.js**：
```javascript
module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2021
  },
  rules: {
    'no-console': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
  }
}
```

### 7.2 Prettier配置

**.prettierrc.js**：
```javascript
module.exports = {
  semi: false,
  singleQuote: true,
  trailingComma: 'none',
  printWidth: 100,
  tabWidth: 2,
  endOfLine: 'lf'
}
```

### 7.3 EditorConfig配置

**.editorconfig**：
```ini
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

---

## 八、开发流程检查清单

### 8.1 开发前

- [ ] 阅读需求文档，理解功能
- [ ] 查看相关的设计文档和API文档
- [ ] 从develop创建功能分支
- [ ] 确认开发环境正常

### 8.2 开发中

- [ ] 遵循代码规范
- [ ] 添加必要的注释
- [ ] 处理边界情况和错误
- [ ] 编写单元测试
- [ ] 本地测试通过

### 8.3 提交前

- [ ] 运行ESLint检查
- [ ] 运行Prettier格式化
- [ ] 运行所有测试
- [ ] 编写规范的Commit Message
- [ ] 推送到远程仓库

### 8.4 合并前

- [ ] 创建Pull Request
- [ ] 填写PR描述
- [ ] 通过代码审查
- [ ] 解决所有Review意见
- [ ] CI/CD检查通过
- [ ] 合并到develop分支

---

## 九、常见问题FAQ

### Q1: 如何处理多人协作冲突？

**A**:
1. 定期从develop拉取最新代码
2. 使用 `git merge develop` 或 `git rebase develop` 同步
3. 遇到冲突时，与相关开发者沟通解决
4. 使用VSCode的Git图形化工具辅助解决冲突

### Q2: 什么时候需要写单元测试？

**A**:
- 核心业务逻辑（必须）
- 复杂算法和计算（必须）
- 工具函数（推荐）
- 简单的CRUD操作（可选）

### Q3: 代码审查主要看什么？

**A**:
1. 功能是否正确实现
2. 是否遵循代码规范
3. 是否有潜在的Bug
4. 是否有性能问题
5. 是否有安全隐患
6. 是否有测试覆盖

### Q4: 如何优化慢查询？

**A**:
1. 添加合适的索引
2. 只查询需要的字段
3. 使用分页
4. 避免N+1查询（使用include）
5. 使用缓存（Redis）

---

## 十、参考资源

### 10.1 官方文档

- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Element Plus 文档](https://element-plus.org/zh-CN/)
- [Express 文档](https://expressjs.com/)
- [Sequelize 文档](https://sequelize.org/)

### 10.2 代码规范

- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Vue.js 风格指南](https://cn.vuejs.org/style-guide/)
- [Conventional Commits](https://www.conventionalcommits.org/)

### 10.3 测试工具

- [Vitest](https://vitest.dev/)
- [Jest](https://jestjs.io/)
- [Playwright](https://playwright.dev/)

---

**文档结束**

📝 **开发规范**：完整 ✅
🎯 **目标**：统一代码风格，提升代码质量
👥 **适用**：所有开发人员
✍️ **文档版本**：v1.0
📅 **更新时间**：2025-12-24
