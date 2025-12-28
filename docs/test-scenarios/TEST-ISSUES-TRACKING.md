# 测试问题跟踪清单

**文档版本**: 1.0
**创建日期**: 2025-12-27
**测试框架**: Playwright E2E
**测试方式**: 完全模拟人工操作

---

## 测试执行规则

### 测试流程
1. **执行测试** - 运行场景测试
2. **发现问题** - 记录问题到"待解决"
3. **修改代码** - 修复问题
4. **标记待确认** - 标记为"待确认"状态
5. **再次测试** - 重新执行测试
6. **确认结果**:
   - ✅ 通过 → 标记为"已解决"
   - ❌ 失败 → 标记为"未解决"，继续修改

### 测试要求
- ✅ 完全模拟人工操作
- ✅ 每个步骤都有操作和预期结果
- ✅ 预期结果必须与实际结果一致
- ✅ 失败后必须截图保存
- ✅ 所有问题必须追踪到解决

---

## 问题状态说明

| 状态 | 标记 | 说明 |
|------|------|------|
| 待解决 | 🔴 | 首次发现的问题，等待修复 |
| 待确认 | 🟡 | 已修复，等待再次测试确认 |
| 已解决 | ✅ | 测试通过，问题已解决 |
| 未解决 | ❌ | 再次测试失败，需继续修复 |
| 已忽略 | ⏭️ | 非关键问题，暂时忽略 |

---

## 测试执行记录

### 执行日期: 2025-12-27

#### 测试环境
- 操作系统: Linux
- 浏览器: Chromium
- 测试框架: Playwright
- 前端服务: http://localhost:5173
- 后端服务: http://localhost:3000

#### 测试进度

| 模块 | 总场景 | 已测试 | 通过 | 失败 | 进度 |
|------|--------|--------|------|------|------|
| 用户认证 | 2 | 2 | 2 | 0 | 100% ✅ |
| 产品管理 | 6 | 5 | 4 | 1 | 83% |
| 客户管理 | 7 | 2 | 2 | 0 | 29% |
| 线索管理 | 8 | 2 | 2 | 0 | 25% |
| 报价单管理 | 7 | 2 | 2 | 0 | 29% |
| 合同管理 | 10 | 6 | 5 | 1 | 60% |
| 任务管理 | 8 | 1 | 0 | 1 | 13% |
| 发货管理 | 8 | 3 | 3 | 0 | 38% |
| 收款管理 | 8 | 3 | 3 | 0 | 38% |
| 发票管理 | 8 | 3 | 3 | 0 | 38% |
| 售后服务 | 9 | 2 | 2 | 0 | 22% |
| **总计** | **79** | **29** | **26** | **3** | **36.7%** |

---

## 问题清单

### 🔴 待解决问题

#### 问题 #001: Playwright浏览器下载失败

**状态**: 🔴 待解决

**场景**: 测试环境配置 - Playwright浏览器安装

**测试步骤**: 执行 `npx playwright install chromium`

**预期结果**: Chromium浏览器成功下载并安装

**实际结果**: 下载失败，返回403错误 "Host not allowed"

**错误信息**:
```
Error: Download failed: server returned code 403 body 'Host not allowed'.
URL: https://cdn.playwright.dev/dbazure/download/playwright/builds/chromium/1200/chromium-linux.zip
```

**复现步骤**:
1. cd /home/user/AijlCRM/tests/e2e
2. npx playwright install chromium
3. 返回403 Host not allowed错误

**修复方案**:
方案1: ❌ 使用Puppeteer替代Playwright - 同样403错误
方案2: 配置Playwright使用系统Chrome - 系统未安装Chrome
方案3: 配置代理或镜像源 - 需要网络配置权限
方案4: ✅ 采用API级别测试 + 手动UI验证方式
方案5: 使用预下载的Chromium二进制文件

**测试结果**:
- [x] 第1次测试: 2025-12-27 - ❌ Playwright安装失败(403)
- [x] 第2次测试: 2025-12-27 - ❌ Puppeteer安装失败(403)

**修复代码**:
```javascript
// 采用API级别测试替代方案
// 1. 测试API端点功能
// 2. 验证业务逻辑
// 3. 手动记录UI交互结果
```

**备注**: 网络环境阻止了所有浏览器CDN访问，建议采用混合测试策略：API自动化测试 + 手动UI测试文档记录

---

### 🟡 待确认问题

*目前无待确认问题*

---

### ❌ 未解决问题

*目前无未解决问题*

---

### ✅ 已解决问题

#### 问题 #002: JWT Secret环境变量缺失

**状态**: ✅ 已解决

**场景**: Scene 1.1 - 用户成功登录

**测试步骤**: API测试 - POST /api/auth/login

**预期结果**: 返回200状态码，包含token和用户信息

**实际结果**: 返回500错误 "secretOrPrivateKey must have a value"

**错误信息**:
```
Error: secretOrPrivateKey must have a value
    at module.exports [as sign] (/home/user/AijlCRM/backend/node_modules/jsonwebtoken/sign.js:111:20)
```

**复现步骤**:
1. 启动后端服务
2. 发送POST请求到 /api/auth/login
3. 返回500错误

**修复方案**: 创建.env文件并设置JWT_SECRET

**修复代码**:
```bash
cp /home/user/AijlCRM/backend/.env.example /home/user/AijlCRM/backend/.env
```

**测试结果**:
- [x] 第1次测试: 2025-12-27 - ❌ 失败 (JWT secret缺失)
- [x] 第2次测试: 2025-12-27 - ✅ 通过

**备注**: .env文件是必需的，应在项目初始化时从.env.example复制创建

#### 问题 #003: Seed数据脚本字段映射错误

**状态**: ✅ 已解决

**场景**: 数据库初始化 - 种子数据插入

**预期结果**: Permission和RolePermission数据成功插入

**实际结果**: ValidationError - module_name和creator_id字段为null

**错误信息**:
```
ValidationError: notNull Violation: Permission.module_name cannot be null
ValidationError: notNull Violation: RolePermission.creator_id cannot be null
```

**修复方案**: 修复seed-data.js中的字段映射

**修复代码**:
```javascript
// Permission: 将module字段转换为module_name，添加permission_type
const permissionData = {
  ...permData,
  module_name: permData.module,
  permission_type: 'action'
};

// RolePermission: 添加creator_id默认值
await RolePermission.findOrCreate({
  where: { role_id: adminRole.role_id, permission_id: perm.permission_id },
  defaults: { role_id: adminRole.role_id, permission_id: perm.permission_id, creator_id: 1 }
});
```

**测试结果**:
- [x] 第1次测试: 2025-12-27 - ❌ 失败
- [x] 第2次测试: 2025-12-27 - ✅ 通过

**修复提交**: 1dca860

**备注**: Permission模型和RolePermission模型的字段定义与seed数据脚本不匹配，已修复

#### 问题 #004: Lead模型字段映射错误

**状态**: ✅ 已解决

**场景**: Scene 2.1 - 创建线索

**预期结果**: 使用snake_case字段名创建线索

**实际结果**: Lead模型使用camelCase字段名，导致validation错误

**错误信息**:
```
ValidationError: notNull Violation: Lead.customerName cannot be null
ValidationError: notNull Violation: Lead.channelSource cannot be null
```

**修复方案**: 使用Lead模型的camelCase字段名

**修复代码**:
```javascript
const leadData = {
  customerName: '北京国际大酒店',  // 不是customer_name
  channelSource: '官网咨询',        // 不是source_id
  salesOwnerId: 1,                 // 必需字段
  // ...其他字段
};
```

**测试结果**:
- [x] 第1次测试: 2025-12-27 - ❌ 失败 (字段名错误)
- [x] 第2次测试: 2025-12-27 - ✅ 通过

**备注**: Lead模型字段使用camelCase，与其他模型的snake_case不同，需要注意

#### 问题 #005: 合同执行进度API数据库字段错误

**状态**: 🔴 待解决

**场景**: Scene 6.5 - 合同执行跟踪

**测试步骤**: API测试 - GET /api/contracts/:id/progress

**预期结果**: 返回合同的发货、回款、发票进度数据

**实际结果**: 返回500错误 "SQLITE_ERROR: no such column: paid_amount"

**错误信息**:
```
SQLITE_ERROR: no such column: paid_amount
SQL: SELECT `payment_id`, `payment_no`, `payment_stage`, `paid_amount`, ...
FROM `payment` AS `Payment` WHERE (`Payment`.`deleted_at` IS NULL AND
`Payment`.`contract_id` = '4') ORDER BY `Payment`.`payment_date` DESC;
```

**复现步骤**:
1. 创建并签署合同
2. 调用GET /api/contracts/:id/progress
3. 返回500错误

**修复方案**: 修改contractController.js中的getContractProgress方法，使用正确的Payment表字段名

**测试结果**:
- [x] 第1次测试: 2025-12-28 - ❌ 失败 (数据库字段不存在)

**备注**: Payment表中不存在`paid_amount`字段，应该是`payment_amount`或其他字段名。这是后端代码与数据库schema不匹配导致的bug。

#### 问题 #006: 任务管理API端点未实现

**状态**: 🔴 待解决

**场景**: 任务管理 - 创建和查询任务

**测试步骤**: API测试 - POST /api/tasks

**预期结果**: 创建任务并返回任务数据

**实际结果**: 返回404错误 "Not Found"

**错误信息**:
```
Request failed with status code 404
```

**复现步骤**:
1. 发送POST请求到 /api/tasks
2. 返回404错误

**修复方案**: 实现任务管理API路由和控制器

**测试结果**:
- [x] 第1次测试: 2025-12-28 - ❌ 失败 (API端点不存在)

**备注**: 任务管理模块的API端点（/api/tasks）未实现，需要添加路由配置和控制器实现。

---

## 问题模板

### 问题记录格式

```markdown
#### 问题 #[编号]: [问题简述]

**状态**: 🔴 待解决 / 🟡 待确认 / ✅ 已解决 / ❌ 未解决

**场景**: [场景编号] [场景名称]

**测试步骤**: 第[X]步 - [步骤描述]

**预期结果**: [预期结果描述]

**实际结果**: [实际结果描述]

**错误信息**:
```
[错误日志或截图]
```

**复现步骤**:
1. [步骤1]
2. [步骤2]
3. [步骤3]

**修复方案**: [修复方案描述]

**修复代码**:
```javascript
// 修复代码
```

**测试结果**:
- [ ] 第1次测试: [日期] - [结果]
- [ ] 第2次测试: [日期] - [结果]
- [ ] 第3次测试: [日期] - [结果]

**截图**:
- 错误截图: [截图路径]
- 修复后截图: [截图路径]

**相关Issue**: #[Issue编号]

**修复提交**: [commit hash]

**备注**: [其他说明]
```

---

## 测试优先级

### 第一轮测试（P0 - 核心业务流程）

按以下顺序执行：

1. ✅ **用户认证** (2个场景) - 基础功能
   - Scene 1.1: 用户登录
   - Scene 1.2: 错误密码登录

2. **线索→客户转化** (基础场景)
   - Scene 2.1: 创建线索
   - Scene 3.1: 线索转客户

3. **报价→合同流程** (核心流程)
   - Scene 5.1: 创建报价单
   - Scene 6.1: 基于报价单创建合同

4. **合同管理** (9个P0场景)
   - Scene 6.2-6.10

5. **收款管理** (7个P0场景)
   - Scene PAY-002 to PAY-008

6. **发票管理** (3个P0场景)
   - Scene INV-002 to INV-004

7. **售后服务** (4个P0场景)
   - Scene SVC-003, SVC-004, SVC-007, SVC-009

### 第二轮测试（P1 - 重要增强功能）

8. **报价单管理** (4个场景)
9. **发货管理** (5个场景)
10. **任务管理** (6个场景)

### 第三轮测试（P2 - 辅助功能）

11. **产品管理** (4个场景)
12. **线索管理** (3个场景)
13. **客户管理辅助** (2个场景)

---

## 测试命令

### 运行全部测试
```bash
cd tests/e2e
npx playwright test
```

### 运行单个测试文件
```bash
npx playwright test specs/01-login.spec.js
```

### 运行带UI的测试（调试模式）
```bash
npx playwright test --headed
```

### 查看测试报告
```bash
npx playwright show-report test-results/html-report
```

---

## 下一步行动

- [ ] 启动前后端服务
- [ ] 执行第一轮P0测试
- [ ] 记录发现的问题
- [ ] 修复问题并再次测试
- [ ] 完成全部测试并生成报告

---

**维护者**: Claude AI
**最后更新**: 2025-12-27
**状态**: 准备开始测试
