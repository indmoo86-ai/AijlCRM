# CRM系统详细测试清单

**创建时间**: 2025-12-26
**测试目的**: 完整验证所有用户故事的端到端流程
**测试方式**: Playwright MCP自动化测试

---

## 测试环境准备

### 前置条件
- ✅ 前端服务运行: http://localhost:5173
- ✅ 后端服务运行: http://localhost:3000
- ✅ MySQL数据库运行: localhost:3306
- ✅ 测试账号已创建: admin / 123456

### 测试数据标识
所有测试数据使用时间戳标识，格式: `测试名称_YYYYMMDD_HHMMSS`
便于识别和清理测试数据

---

## 用户故事1: 用户登录

### 测试场景1.1: 正常登录流程

**前置条件**:
- 浏览器未登录状态
- 测试账号存在于数据库

**测试步骤**:

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 访问系统首页 | URL: http://localhost:5173 | - | 自动跳转到登录页 | URL包含`/login` |
| 2 | 定位用户名输入框 | - | `input[placeholder*="用户名"]` | 找到输入框 | 元素存在且可见 |
| 3 | 输入用户名 | `admin` | `input[placeholder*="用户名"]` | 输入成功 | 输入框value为"admin" |
| 4 | 定位密码输入框 | - | `input[type="password"]` | 找到输入框 | 元素存在且可见 |
| 5 | 输入密码 | `123456` | `input[type="password"]` | 输入成功 | 输入框value为"123456" |
| 6 | 点击登录按钮 | - | `button:has-text("登录")` | 按钮被点击 | 按钮loading状态激活 |
| 7 | 等待响应 | 等待3秒 | - | 收到登录响应 | 页面开始跳转 |
| 8 | 验证跳转 | - | - | 跳转到工作台 | URL包含`/dashboard` |
| 9 | 验证页面内容 | - | `text=工作台` 或 `text=艾居来` | 工作台内容显示 | 页面包含工作台文字 |
| 10 | 验证用户信息 | - | `text=系统管理员` 或头像区域 | 用户信息显示 | 显示用户名称 |

**预期输出**:
```json
{
  "loginSuccess": true,
  "redirectUrl": "http://localhost:5173/dashboard",
  "userInfo": {
    "username": "admin",
    "name": "系统管理员",
    "role": 6
  },
  "token": "eyJhbGc..."
}
```

**截图要求**:
- `login-form.png` - 登录表单填写完成
- `login-success.png` - 登录成功后的工作台

### 测试场景1.2: 错误密码登录

**测试步骤**:

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 访问登录页 | URL: http://localhost:5173/login | - | 显示登录表单 | 表单元素存在 |
| 2 | 输入用户名 | `admin` | `input[placeholder*="用户名"]` | 输入成功 | - |
| 3 | 输入错误密码 | `wrongpassword` | `input[type="password"]` | 输入成功 | - |
| 4 | 点击登录 | - | `button:has-text("登录")` | 显示错误提示 | 出现错误消息 |
| 5 | 验证停留在登录页 | - | - | 未跳转 | URL仍为`/login` |

**预期输出**:
```json
{
  "loginSuccess": false,
  "errorMessage": "用户名或密码错误",
  "statusCode": 401
}
```

---

## 用户故事2: 创建线索

### 测试场景2.1: 完整创建线索流程

**前置条件**:
- 用户已登录
- 在工作台页面

**测试数据**:
```javascript
const leadData = {
  companyName: `测试酒店_${timestamp}`,
  contactPerson: '张经理',
  contactPhone: '13800138001',
  contactEmail: 'zhang@testhotel.com',
  province: '广东省',
  city: '深圳市',
  district: '南山区',
  address: '科技园南区',
  roomCount: '120',
  leadSource: '电话咨询',
  leadStage: '初步接触',
  estimatedAmount: '50000',
  estimatedDealTime: '2025-03-01',
  remark: '客户对智能门锁很感兴趣'
}
```

**测试步骤**:

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 导航到线索管理 | 点击菜单或访问URL | `/leads` 或菜单项 | 进入线索列表页 | URL为`/leads` |
| 2 | 点击新建按钮 | - | `button:has-text("新建线索")` | 打开新建对话框 | 对话框显示 |
| 3 | 填写公司名称 | `leadData.companyName` | `input[placeholder*="公司"]` | 填写成功 | 输入框有值 |
| 4 | 填写联系人 | `leadData.contactPerson` | `input[placeholder*="联系人"]` | 填写成功 | 输入框有值 |
| 5 | 填写联系电话 | `leadData.contactPhone` | `input[placeholder*="电话"]` | 填写成功 | 输入框有值 |
| 6 | 填写联系邮箱 | `leadData.contactEmail` | `input[placeholder*="邮箱"]` | 填写成功 | 输入框有值 |
| 7 | 选择省份 | `leadData.province` | `.el-select` 第1个 | 选择成功 | 显示已选项 |
| 8 | 选择城市 | `leadData.city` | `.el-select` 第2个 | 选择成功 | 显示已选项 |
| 9 | 选择区县 | `leadData.district` | `.el-select` 第3个 | 选择成功 | 显示已选项 |
| 10 | 填写详细地址 | `leadData.address` | `input[placeholder*="地址"]` | 填写成功 | 输入框有值 |
| 11 | 填写客房数量 | `leadData.roomCount` | `input[placeholder*="客房"]` | 填写成功 | 输入框有值 |
| 12 | 选择线索来源 | `leadData.leadSource` | `.el-select[placeholder*="来源"]` | 选择成功 | 显示已选项 |
| 13 | 选择线索阶段 | `leadData.leadStage` | `.el-select[placeholder*="阶段"]` | 选择成功 | 显示已选项 |
| 14 | 填写预计金额 | `leadData.estimatedAmount` | `input[placeholder*="金额"]` | 填写成功 | 输入框有值 |
| 15 | 选择预计成交时间 | `leadData.estimatedDealTime` | `.el-date-picker` | 选择成功 | 显示日期 |
| 16 | 填写备注 | `leadData.remark` | `textarea[placeholder*="备注"]` | 填写成功 | 文本域有值 |
| 17 | 截图表单 | - | - | 保存截图 | `lead-form-filled.png` |
| 18 | 点击保存 | - | `button:has-text("确定")` | 提交表单 | 加载状态显示 |
| 19 | 等待响应 | 等待2秒 | - | 对话框关闭 | 对话框消失 |
| 20 | 验证成功消息 | - | `.el-message--success` | 显示成功提示 | 提示"创建成功" |
| 21 | 验证列表更新 | - | `table` | 列表包含新数据 | 找到公司名称 |
| 22 | 点击新建的线索 | - | `text=${leadData.companyName}` | 进入详情页 | URL包含`/leads/[id]` |
| 23 | 验证详情数据 | - | 详情页各字段 | 数据完整显示 | 所有字段正确 |

**预期API响应**:
```json
{
  "success": true,
  "code": 201,
  "message": "线索创建成功",
  "data": {
    "id": 1,
    "leadNo": "LD202512260001",
    "companyName": "测试酒店_20251226143000",
    "contactPerson": "张经理",
    "contactPhone": "13800138001",
    "contactEmail": "zhang@testhotel.com",
    "province": "广东省",
    "city": "深圳市",
    "district": "南山区",
    "address": "科技园南区",
    "roomCount": 120,
    "leadSource": "电话咨询",
    "leadStage": "初步接触",
    "estimatedAmount": "50000.00",
    "estimatedDealTime": "2025-03-01",
    "remark": "客户对智能门锁很感兴趣",
    "status": "valid",
    "createdAt": "2025-12-26T14:30:00.000Z"
  }
}
```

**截图要求**:
- `lead-form-empty.png` - 空白表单
- `lead-form-filled.png` - 填写完整的表单
- `lead-created-success.png` - 创建成功提示
- `lead-list-updated.png` - 更新后的列表
- `lead-detail.png` - 线索详情页

---

## 用户故事2.2: 线索跟踪记录（重要补充）

### 测试场景2.2: 添加线索跟踪记录

**前置条件**:
- 用户已登录
- 已创建线索（场景2.1）

**测试数据**:
```javascript
const followUpData = {
  bizType: 1, // 1=线索
  bizId: null, // 从场景2.1获取
  followType: '电话沟通',
  content: `${timestamp} - 与客户张经理电话沟通，客户对智能门锁系统很感兴趣，提到需要支持100间客房的部署。客户关心产品稳定性和售后服务。约定下周二进行产品演示。`,
  intentionLevel: '高', // 高/中/低
  nextPlan: '准备产品演示材料，重点介绍稳定性和售后服务体系',
  nextFollowDate: '2025-12-31',
  attachments: []
}
```

**测试步骤**:

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 进入线索详情页 | 点击线索 | `text=${leadData.companyName}` | 打开详情页 | URL包含`/leads/[id]` |
| 2 | 切换到跟踪记录标签 | 点击标签 | `.el-tabs__item:has-text("跟踪记录")` | 显示跟踪记录面板 | 标签激活状态 |
| 3 | 点击添加跟踪记录 | - | `button:has-text("添加跟踪")` | 打开跟踪对话框 | 对话框显示 |
| 4 | 选择跟踪方式 | `followUpData.followType` | `.el-select[placeholder*="跟踪方式"]` | 选择成功 | 显示"电话沟通" |
| 5 | 填写跟踪内容 | `followUpData.content` | `textarea[placeholder*="跟踪内容"]` | 填写成功 | 文本域有内容 |
| 6 | 选择意向等级 | `followUpData.intentionLevel` | `.el-radio:has-text("高")` | 选中"高" | 单选框选中 |
| 7 | 填写下次计划 | `followUpData.nextPlan` | `textarea[placeholder*="下次计划"]` | 填写成功 | 文本域有内容 |
| 8 | 选择下次跟踪日期 | `followUpData.nextFollowDate` | `.el-date-picker` | 选择成功 | 显示日期 |
| 9 | 截图表单 | - | - | 保存截图 | `followup-form.png` |
| 10 | 点击保存 | - | `button:has-text("确定")` | 提交表单 | 加载状态显示 |
| 11 | 验证成功消息 | - | `.el-message--success` | 显示成功提示 | 提示"添加成功" |
| 12 | 验证跟踪记录显示 | - | `.follow-up-timeline` | 跟踪记录出现 | 找到最新记录 |
| 13 | 验证线索意向等级更新 | - | `.intention-level` | 意向等级为"高" | 等级已更新 |
| 14 | 验证下次跟踪日期 | - | `.next-follow-date` | 显示下次跟踪日期 | 日期正确 |

**预期API请求**:
```json
POST /api/follow-ups
{
  "bizType": 1,
  "bizId": 1,
  "followType": "电话沟通",
  "content": "2025-12-26 - 与客户张经理电话沟通...",
  "intentionLevel": "高",
  "nextPlan": "准备产品演示材料...",
  "nextFollowDate": "2025-12-31"
}
```

**预期API响应**:
```json
{
  "success": true,
  "code": 201,
  "message": "跟踪记录添加成功",
  "data": {
    "id": 1,
    "bizType": 1,
    "bizId": 1,
    "followType": "电话沟通",
    "content": "2025-12-26 - 与客户张经理电话沟通...",
    "intentionLevel": "高",
    "nextPlan": "准备产品演示材料...",
    "nextFollowDate": "2025-12-31",
    "operatorId": 1,
    "createdAt": "2025-12-26T15:00:00.000Z"
  }
}
```

**截图要求**:
- `followup-form-empty.png` - 空白跟踪记录表单
- `followup-form-filled.png` - 填写完成的表单
- `followup-timeline.png` - 跟踪记录时间轴
- `lead-intention-updated.png` - 更新后的线索意向等级

---

## 用户故事2.3: 线索分配给销售（重要补充）

### 测试场景2.3: 分配线索负责人

**前置条件**:
- 用户已登录（需要管理员权限）
- 已创建线索（场景2.1）
- 系统中存在销售人员账号

**测试数据**:
```javascript
const assignmentData = {
  leadId: null, // 从场景2.1获取
  salesOwnerId: 2, // 销售人员用户ID
  assignmentReason: '该客户位于深圳南山区，分配给负责该区域的销售李明',
  notifySales: true // 是否通知销售人员
}
```

**测试步骤**:

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 进入线索列表页 | - | `/leads` | 显示线索列表 | URL为`/leads` |
| 2 | 找到目标线索 | - | `tr:has-text("${leadData.companyName}")` | 定位到线索行 | 行存在 |
| 3 | 点击分配按钮 | - | `button:has-text("分配")` | 打开分配对话框 | 对话框显示 |
| 4 | 选择销售负责人 | `assignmentData.salesOwnerId` | `.el-select[placeholder*="销售"]` | 选择成功 | 显示销售人员名称 |
| 5 | 填写分配说明 | `assignmentData.assignmentReason` | `textarea[placeholder*="分配说明"]` | 填写成功 | 文本域有内容 |
| 6 | 勾选通知选项 | `assignmentData.notifySales` | `input[type="checkbox"]:has-text("通知")` | 勾选成功 | 复选框选中 |
| 7 | 截图分配表单 | - | - | 保存截图 | `lead-assignment.png` |
| 8 | 点击确认分配 | - | `button:has-text("确定")` | 提交分配 | 加载状态显示 |
| 9 | 验证成功消息 | - | `.el-message--success` | 显示成功提示 | 提示"分配成功" |
| 10 | 验证列表更新 | - | `tr:has-text("${leadData.companyName}")` | 显示负责人 | 显示销售人员名称 |
| 11 | 进入线索详情 | 点击线索 | `text=${leadData.companyName}` | 打开详情页 | URL包含`/leads/[id]` |
| 12 | 验证负责人信息 | - | `.sales-owner` | 显示负责人信息 | 名称、联系方式正确 |

**预期API请求**:
```json
PUT /api/leads/:id/assign
{
  "salesOwnerId": 2,
  "assignmentReason": "该客户位于深圳南山区，分配给负责该区域的销售李明",
  "notifySales": true
}
```

**预期API响应**:
```json
{
  "success": true,
  "code": 200,
  "message": "线索分配成功",
  "data": {
    "id": 1,
    "leadNo": "LD202512260001",
    "companyName": "测试酒店_20251226143000",
    "salesOwnerId": 2,
    "salesOwner": {
      "id": 2,
      "name": "李明",
      "phone": "13900139000",
      "email": "liming@example.com"
    },
    "updatedAt": "2025-12-26T15:05:00.000Z"
  }
}
```

**截图要求**:
- `lead-assignment-dialog.png` - 分配对话框
- `lead-assigned-list.png` - 分配后的列表视图
- `lead-assigned-detail.png` - 分配后的详情页

---

## 用户故事2.4: 创建跟进任务（重要补充）

### 测试场景2.4: 为线索创建跟进任务

**前置条件**:
- 用户已登录
- 已创建线索（场景2.1）
- 已分配销售负责人（场景2.3）

**测试数据**:
```javascript
const taskData = {
  taskType: '客户跟进',
  taskTitle: `跟进${leadData.companyName} - 产品演示`,
  taskDescription: '准备智能门锁产品演示材料，重点介绍：\n1. 产品稳定性和可靠性\n2. 售后服务体系\n3. 100间客房部署方案\n4. 成功案例分享',
  priority: 'high', // high/medium/low
  status: 'pending',
  sourceType: 'lead',
  sourceId: null, // 从场景2.1获取
  dueDate: '2025-12-31',
  dueTime: '14:00:00',
  reminderTime: '2025-12-31 10:00:00',
  assigneeId: 2, // 销售人员ID
  assignerId: 1 // 当前用户ID（管理员）
}
```

**测试步骤**:

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 进入线索详情页 | - | `/leads/${leadId}` | 显示线索详情 | URL正确 |
| 2 | 切换到任务标签 | 点击标签 | `.el-tabs__item:has-text("任务")` | 显示任务面板 | 标签激活 |
| 3 | 点击创建任务 | - | `button:has-text("创建任务")` | 打开任务对话框 | 对话框显示 |
| 4 | 选择任务类型 | `taskData.taskType` | `.el-select[placeholder*="任务类型"]` | 选择成功 | 显示"客户跟进" |
| 5 | 填写任务标题 | `taskData.taskTitle` | `input[placeholder*="标题"]` | 填写成功 | 输入框有值 |
| 6 | 填写任务描述 | `taskData.taskDescription` | `textarea[placeholder*="描述"]` | 填写成功 | 多行文本显示 |
| 7 | 选择优先级 | `taskData.priority` | `.el-radio:has-text("高")` | 选中"高" | 高优先级选中 |
| 8 | 选择负责人 | `taskData.assigneeId` | `.el-select[placeholder*="负责人"]` | 选择成功 | 显示销售人员名称 |
| 9 | 选择截止日期 | `taskData.dueDate` | `.el-date-picker[placeholder*="日期"]` | 选择成功 | 显示日期 |
| 10 | 选择截止时间 | `taskData.dueTime` | `.el-time-picker` | 选择成功 | 显示时间 |
| 11 | 设置提醒时间 | `taskData.reminderTime` | `.el-date-picker[placeholder*="提醒"]` | 选择成功 | 显示提醒时间 |
| 12 | 截图任务表单 | - | - | 保存截图 | `task-form-filled.png` |
| 13 | 点击创建 | - | `button:has-text("创建")` | 提交任务 | 加载状态显示 |
| 14 | 验证成功消息 | - | `.el-message--success` | 显示成功提示 | 提示"任务创建成功" |
| 15 | 验证任务列表 | - | `.task-list` | 任务出现在列表 | 找到新建任务 |
| 16 | 验证任务详情 | - | `.task-item` | 任务信息完整 | 标题、优先级、负责人正确 |
| 17 | 验证任务状态 | - | `.task-status` | 状态为"待处理" | 状态标签显示 |

**预期API请求**:
```json
POST /api/tasks
{
  "taskType": "客户跟进",
  "taskTitle": "跟进测试酒店_20251226143000 - 产品演示",
  "taskDescription": "准备智能门锁产品演示材料...",
  "priority": "high",
  "status": "pending",
  "sourceType": "lead",
  "sourceId": 1,
  "dueDate": "2025-12-31",
  "dueTime": "14:00:00",
  "reminderTime": "2025-12-31T10:00:00.000Z",
  "assigneeId": 2,
  "assignerId": 1
}
```

**预期API响应**:
```json
{
  "success": true,
  "code": 201,
  "message": "任务创建成功",
  "data": {
    "taskId": 1,
    "taskType": "客户跟进",
    "taskTitle": "跟进测试酒店_20251226143000 - 产品演示",
    "taskDescription": "准备智能门锁产品演示材料...",
    "priority": "high",
    "status": "pending",
    "sourceType": "lead",
    "sourceId": 1,
    "dueDate": "2025-12-31",
    "dueTime": "14:00:00",
    "reminderTime": "2025-12-31T10:00:00.000Z",
    "assigneeId": 2,
    "assignee": {
      "id": 2,
      "name": "李明"
    },
    "assignerId": 1,
    "assigner": {
      "id": 1,
      "name": "系统管理员"
    },
    "assignedAt": "2025-12-26T15:10:00.000Z",
    "createdAt": "2025-12-26T15:10:00.000Z"
  }
}
```

**截图要求**:
- `task-create-dialog.png` - 任务创建对话框
- `task-form-filled.png` - 填写完成的任务表单
- `task-list-updated.png` - 更新后的任务列表
- `task-detail-view.png` - 任务详情视图

---

## 用户故事2.5: 任务执行和完成（重要补充）

### 测试场景2.5: 销售人员执行任务

**前置条件**:
- 销售人员已登录（李明，userId=2）
- 已创建任务（场景2.4）

**测试数据**:
```javascript
const taskExecutionData = {
  taskId: null, // 从场景2.4获取
  status: 'in_progress', // 开始执行
  resultNote: '已完成产品演示准备工作：\n1. 准备了产品介绍PPT（30页）\n2. 整理了3个类似规模酒店的成功案例\n3. 准备了产品样品\n4. 已与客户确认演示时间：12月31日下午2点',
  completedStatus: 'completed',
  completionNote: '产品演示已成功完成。客户对产品稳定性和售后服务表示满意，特别关注批量部署方案。客户要求提供详细报价，预计1月中旬做出采购决定。'
}
```

**测试步骤**:

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 进入我的任务页面 | - | `/tasks/my` | 显示任务列表 | URL为`/tasks/my` |
| 2 | 找到待处理任务 | - | `tr:has-text("产品演示")` | 定位到任务行 | 任务存在 |
| 3 | 点击开始任务 | - | `button:has-text("开始")` | 状态变为进行中 | 按钮变为"完成" |
| 4 | 验证状态更新 | - | `.task-status` | 显示"进行中" | 状态标签更新 |
| 5 | 点击任务标题 | - | `text=${taskData.taskTitle}` | 打开任务详情 | 详情页显示 |
| 6 | 添加执行备注 | `taskExecutionData.resultNote` | `textarea[placeholder*="执行备注"]` | 填写成功 | 文本域有内容 |
| 7 | 点击保存备注 | - | `button:has-text("保存")` | 备注保存成功 | 成功提示 |
| 8 | 截图任务执行中 | - | - | 保存截图 | `task-in-progress.png` |
| 9 | 返回任务列表 | - | `/tasks/my` | 回到列表页 | URL正确 |
| 10 | 点击完成任务 | - | `button:has-text("完成")` | 打开完成对话框 | 对话框显示 |
| 11 | 填写完成说明 | `taskExecutionData.completionNote` | `textarea[placeholder*="完成说明"]` | 填写成功 | 文本域有内容 |
| 12 | 截图完成表单 | - | - | 保存截图 | `task-completion-form.png` |
| 13 | 点击确认完成 | - | `button:has-text("确定")` | 提交完成 | 加载状态显示 |
| 14 | 验证成功消息 | - | `.el-message--success` | 显示成功提示 | 提示"任务已完成" |
| 15 | 验证任务状态 | - | `.task-status` | 状态为"已完成" | 绿色完成标签 |
| 16 | 验证完成时间 | - | `.completed-at` | 显示完成时间 | 时间正确 |

**预期API请求（开始任务）**:
```json
PATCH /api/tasks/:id/start
{
  "status": "in_progress",
  "resultNote": "已完成产品演示准备工作..."
}
```

**预期API响应（开始任务）**:
```json
{
  "success": true,
  "code": 200,
  "message": "任务已开始",
  "data": {
    "taskId": 1,
    "status": "in_progress",
    "startedAt": "2025-12-26T15:15:00.000Z"
  }
}
```

**预期API请求（完成任务）**:
```json
PATCH /api/tasks/:id/complete
{
  "status": "completed",
  "resultNote": "产品演示已成功完成。客户对产品稳定性和售后服务表示满意..."
}
```

**预期API响应（完成任务）**:
```json
{
  "success": true,
  "code": 200,
  "message": "任务已完成",
  "data": {
    "taskId": 1,
    "status": "completed",
    "completedAt": "2025-12-31T16:30:00.000Z",
    "resultNote": "产品演示已成功完成..."
  }
}
```

**截图要求**:
- `task-list-pending.png` - 待处理任务列表
- `task-in-progress.png` - 任务执行中状态
- `task-completion-form.png` - 任务完成表单
- `task-completed.png` - 已完成任务状态

---

## 用户故事3: 线索转客户

### 测试场景3.1: 线索转客户完整流程

**前置条件**:
- 已创建线索（使用场景2.1的数据）
- 线索状态为"有效"

**测试步骤**:

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 导航到线索列表 | - | `/leads` | 显示线索列表 | URL为`/leads` |
| 2 | 搜索刚创建的线索 | `leadData.companyName` | 搜索框 | 找到目标线索 | 列表显示该线索 |
| 3 | 点击线索行 | - | `tr:has-text("${leadData.companyName}")` | 进入详情页 | URL包含`/leads/[id]` |
| 4 | 截图详情页 | - | - | 保存截图 | `lead-before-convert.png` |
| 5 | 点击转客户按钮 | - | `button:has-text("转为客户")` | 显示确认对话框 | 对话框出现 |
| 6 | 查看转换说明 | - | 对话框内容 | 显示转换提示 | 包含提示文字 |
| 7 | 点击确认 | - | `button:has-text("确定")` | 开始转换 | 加载状态显示 |
| 8 | 等待转换 | 等待2秒 | - | 转换完成 | - |
| 9 | 验证成功消息 | - | `.el-message--success` | 显示成功提示 | "转换成功" |
| 10 | 验证线索状态 | - | 状态字段 | 状态变为"已转客户" | 状态更新 |
| 11 | 点击查看客户 | - | `button:has-text("查看客户")` | 跳转到客户详情 | URL包含`/customers/[id]` |
| 12 | 验证客户数据 | - | 客户详情页 | 数据正确迁移 | 公司名称等匹配 |
| 13 | 验证客户编号 | - | 客户编号字段 | 自动生成客户编号 | 格式为`CU202512xxxx` |
| 14 | 验证来源线索 | - | 来源线索字段 | 显示原线索编号 | 线索编号正确 |

**预期API响应**:
```json
{
  "success": true,
  "code": 200,
  "message": "线索转换成功",
  "data": {
    "lead": {
      "id": 1,
      "status": "converted",
      "convertedAt": "2025-12-26T14:35:00.000Z"
    },
    "customer": {
      "id": 1,
      "customerNo": "CU202512260001",
      "customerName": "测试酒店_20251226143000",
      "customerType": 1,
      "sourceLeadId": 1,
      "province": "广东省",
      "city": "深圳市",
      "district": "南山区",
      "address": "科技园南区",
      "roomCount": 120,
      "createdAt": "2025-12-26T14:35:00.000Z"
    }
  }
}
```

**截图要求**:
- `lead-before-convert.png` - 转换前的线索详情
- `convert-confirm-dialog.png` - 转换确认对话框
- `convert-success.png` - 转换成功提示
- `customer-created.png` - 新创建的客户详情

---

## 用户故事4: 创建产品

### 测试场景4.1: 创建产品完整流程

**前置条件**:
- 用户已登录
- 需要先创建产品分类

**测试数据**:
```javascript
const categoryData = {
  categoryName: '智能门锁',
  categoryCode: 'LOCK',
  sortOrder: '1',
  description: '酒店智能门锁系列产品'
}

const productData = {
  productCode: `PRD${timestamp}`,
  productName: `智能门锁A1_${timestamp}`,
  brand: '艾居来',
  categoryId: null, // 从分类创建后获取
  supplier: '深圳智能科技有限公司',
  costPrice: '180.00',
  salePrice: '299.00',
  unit: '台',
  stockQuantity: '1000',
  minStockQuantity: '100',
  productImages: [], // 可选
  description: '支持IC卡、指纹、密码、手机开锁，低功耗设计',
  specifications: '尺寸:300x80x45mm,重量:2.5kg',
  status: 'active'
}
```

**测试步骤**:

#### 4.1.1 创建产品分类

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 导航到产品管理 | - | `/products` | 显示产品列表 | URL为`/products` |
| 2 | 点击分类管理 | - | `button:has-text("分类管理")` | 打开分类管理 | 对话框显示 |
| 3 | 点击新建分类 | - | `button:has-text("新建分类")` | 显示分类表单 | 表单出现 |
| 4 | 填写分类名称 | `categoryData.categoryName` | `input[placeholder*="分类名称"]` | 填写成功 | 输入框有值 |
| 5 | 填写分类编码 | `categoryData.categoryCode` | `input[placeholder*="编码"]` | 填写成功 | 输入框有值 |
| 6 | 填写排序号 | `categoryData.sortOrder` | `input[placeholder*="排序"]` | 填写成功 | 输入框有值 |
| 7 | 填写描述 | `categoryData.description` | `textarea` | 填写成功 | 文本域有值 |
| 8 | 保存分类 | - | `button:has-text("确定")` | 分类创建成功 | 提示成功 |
| 9 | 记录分类ID | - | - | 获取分类ID | 用于创建产品 |

#### 4.1.2 创建产品

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 10 | 点击新建产品 | - | `button:has-text("新建产品")` | 打开产品表单 | 对话框显示 |
| 11 | 填写产品编码 | `productData.productCode` | `input[placeholder*="产品编码"]` | 填写成功 | 输入框有值 |
| 12 | 填写产品名称 | `productData.productName` | `input[placeholder*="产品名称"]` | 填写成功 | 输入框有值 |
| 13 | 填写品牌 | `productData.brand` | `input[placeholder*="品牌"]` | 填写成功 | 输入框有值 |
| 14 | 选择产品分类 | 刚创建的分类 | `.el-select[placeholder*="分类"]` | 选择成功 | 显示分类名 |
| 15 | 填写供应商 | `productData.supplier` | `input[placeholder*="供应商"]` | 填写成功 | 输入框有值 |
| 16 | 填写成本价 | `productData.costPrice` | `input[placeholder*="成本价"]` | 填写成功 | 输入框有值 |
| 17 | 填写销售价 | `productData.salePrice` | `input[placeholder*="销售价"]` | 填写成功 | 输入框有值 |
| 18 | 填写单位 | `productData.unit` | `input[placeholder*="单位"]` | 填写成功 | 输入框有值 |
| 19 | 填写库存数量 | `productData.stockQuantity` | `input[placeholder*="库存"]` | 填写成功 | 输入框有值 |
| 20 | 填写最低库存 | `productData.minStockQuantity` | `input[placeholder*="最低"]` | 填写成功 | 输入框有值 |
| 21 | 填写产品描述 | `productData.description` | `textarea[placeholder*="描述"]` | 填写成功 | 文本域有值 |
| 22 | 填写规格参数 | `productData.specifications` | `textarea[placeholder*="规格"]` | 填写成功 | 文本域有值 |
| 23 | 截图表单 | - | - | 保存截图 | `product-form-filled.png` |
| 24 | 点击保存 | - | `button:has-text("确定")` | 提交表单 | 加载状态显示 |
| 25 | 验证成功 | - | `.el-message--success` | 显示成功提示 | "创建成功" |
| 26 | 验证列表 | - | `table` | 列表包含新产品 | 找到产品名称 |
| 27 | 记录产品ID | - | - | 获取产品ID | 用于后续测试 |

**预期API响应**:
```json
{
  "success": true,
  "code": 201,
  "message": "产品创建成功",
  "data": {
    "productId": 1,
    "productCode": "PRD20251226143000",
    "productName": "智能门锁A1_20251226143000",
    "brand": "艾居来",
    "categoryId": 1,
    "supplier": "深圳智能科技有限公司",
    "costPrice": "180.00",
    "salePrice": "299.00",
    "unit": "台",
    "stockQuantity": 1000,
    "minStockQuantity": 100,
    "description": "支持IC卡、指纹、密码、手机开锁，低功耗设计",
    "specifications": "尺寸:300x80x45mm,重量:2.5kg",
    "status": "active",
    "createdAt": "2025-12-26T14:40:00.000Z"
  }
}
```

**截图要求**:
- `category-form.png` - 分类创建表单
- `category-created.png` - 分类创建成功
- `product-form-empty.png` - 空白产品表单
- `product-form-filled.png` - 填写完整的产品表单
- `product-created.png` - 产品创建成功
- `product-list.png` - 产品列表

---

## 用户故事5: 创建报价单

### 测试场景5.1: 创建报价单完整流程

**前置条件**:
- 已有客户（场景3创建）
- 已有产品（场景4创建）

**测试数据**:
```javascript
const quotationData = {
  customerId: null, // 从客户列表获取
  quotationNo: null, // 系统自动生成
  quotationDate: '2025-12-26',
  validUntil: '2026-01-26',
  contactPerson: '张经理',
  contactPhone: '13800138001',
  deliveryAddress: '广东省深圳市南山区科技园南区',
  deliveryDate: '2026-02-01',
  paymentTerms: '签约付30%，发货付50%，验收付20%',

  items: [
    {
      productId: null, // 从产品列表获取
      productName: '智能门锁A1',
      quantity: 100,
      unitPrice: 299.00,
      discountRate: 0.95, // 95折
      subtotal: 28405.00 // 100 * 299 * 0.95
    },
    {
      productId: null,
      productName: '智能控制面板',
      quantity: 50,
      unitPrice: 199.00,
      discountRate: 0.95,
      subtotal: 9452.50
    }
  ],

  totalAmount: 37857.50,
  discountAmount: 1991.50,
  finalAmount: 35866.00,
  remark: '首次合作客户，给予5%折扣优惠'
}
```

**测试步骤**:

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 导航到报价管理 | - | `/quotations` | 显示报价列表 | URL为`/quotations` |
| 2 | 点击新建报价单 | - | `button:has-text("新建报价")` | 打开报价表单 | 对话框显示 |
| 3 | 选择客户 | 搜索并选择客户 | `.el-select[placeholder*="客户"]` | 客户已选择 | 显示客户名称 |
| 4 | 填写报价日期 | `quotationData.quotationDate` | `.el-date-picker` 第1个 | 日期填写成功 | 显示日期 |
| 5 | 填写有效期至 | `quotationData.validUntil` | `.el-date-picker` 第2个 | 日期填写成功 | 显示日期 |
| 6 | 填写联系人 | `quotationData.contactPerson` | `input[placeholder*="联系人"]` | 填写成功 | 输入框有值 |
| 7 | 填写联系电话 | `quotationData.contactPhone` | `input[placeholder*="电话"]` | 填写成功 | 输入框有值 |
| 8 | 填写交货地址 | `quotationData.deliveryAddress` | `input[placeholder*="地址"]` | 填写成功 | 输入框有值 |
| 9 | 填写交货日期 | `quotationData.deliveryDate` | `.el-date-picker` 第3个 | 日期填写成功 | 显示日期 |
| 10 | 填写付款条款 | `quotationData.paymentTerms` | `textarea[placeholder*="付款"]` | 填写成功 | 文本域有值 |
| 11 | 点击添加产品 | - | `button:has-text("添加产品")` | 产品选择器出现 | 下拉框展开 |
| 12 | 选择产品1 | 搜索并选择产品 | `.el-select[placeholder*="产品"]` | 产品已选择 | 显示产品名称 |
| 13 | 填写数量1 | `quotationData.items[0].quantity` | `input[placeholder*="数量"]` 第1行 | 填写成功 | 输入框有值 |
| 14 | 填写单价1 | `quotationData.items[0].unitPrice` | `input[placeholder*="单价"]` 第1行 | 填写成功 | 输入框有值 |
| 15 | 填写折扣率1 | `0.95` | `input[placeholder*="折扣"]` 第1行 | 填写成功 | 输入框有值 |
| 16 | 验证小计1 | - | 小计列 第1行 | 自动计算小计 | 显示28405.00 |
| 17 | 点击添加产品 | - | `button:has-text("添加产品")` | 新增第2行 | 表格增加行 |
| 18 | 选择产品2 | 搜索并选择产品 | `.el-select[placeholder*="产品"]` 第2行 | 产品已选择 | 显示产品名称 |
| 19 | 填写数量2 | `quotationData.items[1].quantity` | `input[placeholder*="数量"]` 第2行 | 填写成功 | 输入框有值 |
| 20 | 填写单价2 | `quotationData.items[1].unitPrice` | `input[placeholder*="单价"]` 第2行 | 填写成功 | 输入框有值 |
| 21 | 填写折扣率2 | `0.95` | `input[placeholder*="折扣"]` 第2行 | 填写成功 | 输入框有值 |
| 22 | 验证小计2 | - | 小计列 第2行 | 自动计算小计 | 显示9452.50 |
| 23 | 验证合计 | - | 表格底部合计行 | 自动计算总计 | 总数量150，总金额35866.00 |
| 24 | 填写备注 | `quotationData.remark` | `textarea[placeholder*="备注"]` | 填写成功 | 文本域有值 |
| 25 | 截图表单 | - | - | 保存截图 | `quotation-form-filled.png` |
| 26 | 点击保存 | - | `button:has-text("保存")` | 保存为草稿 | 提示成功 |
| 27 | 验证报价单号 | - | 报价单详情 | 自动生成报价单号 | 格式为`QT202512xxxx` |
| 28 | 验证状态 | - | 状态字段 | 状态为"草稿" | 状态正确 |
| 29 | 点击提交 | - | `button:has-text("提交")` | 状态变为"已提交" | 状态更新 |

**预期API响应**:
```json
{
  "success": true,
  "code": 201,
  "message": "报价单创建成功",
  "data": {
    "quotationId": 1,
    "quotationNo": "QT202512260001",
    "customerId": 1,
    "customerName": "测试酒店_20251226143000",
    "quotationDate": "2025-12-26",
    "validUntil": "2026-01-26",
    "contactPerson": "张经理",
    "contactPhone": "13800138001",
    "deliveryAddress": "广东省深圳市南山区科技园南区",
    "deliveryDate": "2026-02-01",
    "paymentTerms": "签约付30%，发货付50%，验收付20%",
    "totalQuantity": 150,
    "totalAmount": "37857.50",
    "discountAmount": "1991.50",
    "finalAmount": "35866.00",
    "status": "draft",
    "remark": "首次合作客户，给予5%折扣优惠",
    "items": [
      {
        "itemId": 1,
        "productId": 1,
        "productName": "智能门锁A1_20251226143000",
        "quantity": 100,
        "unitPrice": "299.00",
        "discountRate": "0.95",
        "subtotal": "28405.00"
      },
      {
        "itemId": 2,
        "productId": 2,
        "productName": "智能控制面板",
        "quantity": 50,
        "unitPrice": "199.00",
        "discountRate": "0.95",
        "subtotal": "9452.50"
      }
    ],
    "createdAt": "2025-12-26T14:45:00.000Z"
  }
}
```

**截图要求**:
- `quotation-form-empty.png` - 空白报价表单
- `quotation-product-select.png` - 产品选择
- `quotation-items-filled.png` - 产品明细填写完成
- `quotation-total-calculated.png` - 合计自动计算
- `quotation-form-filled.png` - 完整表单
- `quotation-created.png` - 创建成功
- `quotation-detail.png` - 报价单详情

---

## 用户故事5.2: 报价单审批流程（重要补充）

### 测试场景5.2: 提交报价单审批

**前置条件**:
- 已创建报价单（场景5.1）
- 报价单状态为"草稿"
- 用户具有提交审批权限

**测试数据**:
```javascript
const approvalData = {
  quotationId: null, // 从场景5.1获取
  submitReason: '客户对报价方案认可，请审批通过后发送给客户',
  approverId: 1, // 审批人ID（管理员）
  urgency: 'normal' // normal/urgent
}
```

**测试步骤**:

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 进入报价单详情页 | - | `/quotations/${quotationId}` | 显示报价单详情 | URL正确 |
| 2 | 验证当前状态 | - | `.quotation-status` | 状态为"草稿" | 状态标签显示 |
| 3 | 点击提交审批 | - | `button:has-text("提交审批")` | 打开审批对话框 | 对话框显示 |
| 4 | 选择审批人 | `approvalData.approverId` | `.el-select[placeholder*="审批人"]` | 选择成功 | 显示审批人名称 |
| 5 | 填写提交说明 | `approvalData.submitReason` | `textarea[placeholder*="提交说明"]` | 填写成功 | 文本域有内容 |
| 6 | 选择紧急程度 | `approvalData.urgency` | `.el-radio:has-text("普通")` | 选中成功 | 单选框选中 |
| 7 | 截图审批表单 | - | - | 保存截图 | `quotation-submit-approval.png` |
| 8 | 点击提交 | - | `button:has-text("确定")` | 提交审批 | 加载状态显示 |
| 9 | 验证成功消息 | - | `.el-message--success` | 显示成功提示 | 提示"提交成功" |
| 10 | 验证状态更新 | - | `.quotation-status` | 状态为"待审批" | 状态标签更新 |
| 11 | 验证审批信息 | - | `.approval-info` | 显示审批人和提交时间 | 信息完整 |

**预期API请求**:
```json
POST /api/quotations/:id/submit-approval
{
  "approverId": 1,
  "submitReason": "客户对报价方案认可，请审批通过后发送给客户",
  "urgency": "normal"
}
```

**预期API响应**:
```json
{
  "success": true,
  "code": 200,
  "message": "报价单已提交审批",
  "data": {
    "quotationId": 1,
    "status": "pending_approval",
    "approvalRecord": {
      "id": 1,
      "quotationId": 1,
      "submitterId": 2,
      "approverId": 1,
      "submitReason": "客户对报价方案认可...",
      "urgency": "normal",
      "status": "pending",
      "submittedAt": "2025-12-26T16:00:00.000Z"
    }
  }
}
```

**截图要求**:
- `quotation-submit-approval-dialog.png` - 提交审批对话框
- `quotation-pending-approval.png` - 待审批状态

---

## 用户故事5.3: 报价单审批处理（重要补充）

### 测试场景5.3: 审批人处理报价单

**前置条件**:
- 管理员已登录（审批人）
- 报价单处于"待审批"状态（场景5.2）

**测试数据**:
```javascript
const approvalDecision = {
  quotationId: null,
  action: 'approve', // approve/reject
  approvalComment: '报价方案合理，产品配置符合客户需求，同意发送给客户。',
  modifications: '' // 如果需要修改的建议
}
```

**测试步骤**:

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 进入待审批列表 | - | `/approvals/pending` | 显示待审批列表 | URL正确 |
| 2 | 找到报价单审批 | - | `tr:has-text("报价单")` | 定位到审批项 | 审批项存在 |
| 3 | 点击查看详情 | - | 审批项 | 打开审批详情 | 详情对话框显示 |
| 4 | 查看报价单内容 | - | `.quotation-detail` | 显示完整报价信息 | 产品、金额完整 |
| 5 | 查看提交说明 | - | `.submit-reason` | 显示提交理由 | 文字显示 |
| 6 | 点击审批通过 | - | `button:has-text("通过")` | 打开审批表单 | 表单显示 |
| 7 | 填写审批意见 | `approvalDecision.approvalComment` | `textarea[placeholder*="审批意见"]` | 填写成功 | 文本域有内容 |
| 8 | 截图审批意见 | - | - | 保存截图 | `approval-comment.png` |
| 9 | 点击确认通过 | - | `button:has-text("确定")` | 提交审批 | 加载状态显示 |
| 10 | 验证成功消息 | - | `.el-message--success` | 显示成功提示 | 提示"审批完成" |
| 11 | 验证审批列表 | - | 待审批列表 | 该项移除 | 列表更新 |
| 12 | 进入报价单详情 | - | `/quotations/${quotationId}` | 打开报价单 | 详情页显示 |
| 13 | 验证状态更新 | - | `.quotation-status` | 状态为"已批准" | 绿色状态标签 |
| 14 | 验证审批记录 | - | `.approval-history` | 显示审批记录 | 审批人、时间、意见完整 |

**预期API请求**:
```json
POST /api/quotations/:id/approve
{
  "action": "approve",
  "approvalComment": "报价方案合理，产品配置符合客户需求，同意发送给客户。"
}
```

**预期API响应**:
```json
{
  "success": true,
  "code": 200,
  "message": "审批完成",
  "data": {
    "quotationId": 1,
    "status": "approved",
    "approvalRecord": {
      "id": 1,
      "status": "approved",
      "approvalComment": "报价方案合理，产品配置符合客户需求...",
      "approvedAt": "2025-12-26T16:30:00.000Z",
      "approverId": 1
    }
  }
}
```

**截图要求**:
- `approval-pending-list.png` - 待审批列表
- `approval-detail-view.png` - 审批详情视图
- `approval-comment.png` - 填写审批意见
- `approval-approved.png` - 审批通过后状态

---

## 用户故事6: 创建合同

### 测试场景6.1: 基于报价单创建合同

**前置条件**:
- 已创建报价单（场景5）
- 报价单状态为"已批准"

**测试数据**:
```javascript
const contractData = {
  quotationId: null, // 从报价单获取
  contractNo: null, // 系统自动生成
  customerId: null, // 从报价单继承
  contractName: '智能门锁采购合同',
  contractType: 'sales', // 销售合同
  signDate: '2025-12-26',
  effectiveDate: '2025-12-26',
  expiryDate: '2026-12-26',
  contractAmount: 35866.00, // 从报价单继承

  // 合同条款
  paymentTerms: '签约付30%，发货付50%，验收付20%',
  deliveryTerms: '签约后60天内交货',
  warrantyTerms: '质保期2年',
  otherTerms: '设备安装调试由乙方负责',

  // 甲方信息（客户）
  partyAName: '测试酒店_20251226143000',
  partyAContact: '张经理',
  partyAPhone: '13800138001',
  partyAAddress: '广东省深圳市南山区科技园南区',

  // 乙方信息（我方）
  partyBName: '艾居来智能科技有限公司',
  partyBContact: '李经理',
  partyBPhone: '0755-12345678',
  partyBAddress: '深圳市南山区科技园',

  remark: '重点客户合同，优先处理'
}
```

**测试步骤**:

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 导航到合同管理 | - | `/contracts` | 显示合同列表 | URL为`/contracts` |
| 2 | 点击新建合同 | - | `button:has-text("新建合同")` | 打开合同表单 | 对话框显示 |
| 3 | 选择关联报价单 | 选择已批准的报价单 | `.el-select[placeholder*="报价单"]` | 报价单已选择 | 显示报价单号 |
| 4 | 验证数据继承 | - | 各字段 | 客户和产品信息自动填充 | 数据正确继承 |
| 5 | 填写合同名称 | `contractData.contractName` | `input[placeholder*="合同名称"]` | 填写成功 | 输入框有值 |
| 6 | 选择合同类型 | `contractData.contractType` | `.el-select[placeholder*="类型"]` | 类型已选择 | 显示"销售合同" |
| 7 | 填写签订日期 | `contractData.signDate` | `.el-date-picker` 第1个 | 日期填写成功 | 显示日期 |
| 8 | 填写生效日期 | `contractData.effectiveDate` | `.el-date-picker` 第2个 | 日期填写成功 | 显示日期 |
| 9 | 填写到期日期 | `contractData.expiryDate` | `.el-date-picker` 第3个 | 日期填写成功 | 显示日期 |
| 10 | 填写付款条款 | `contractData.paymentTerms` | `textarea` 第1个 | 填写成功 | 文本域有值 |
| 11 | 填写交货条款 | `contractData.deliveryTerms` | `textarea` 第2个 | 填写成功 | 文本域有值 |
| 12 | 填写质保条款 | `contractData.warrantyTerms` | `textarea` 第3个 | 填写成功 | 文本域有值 |
| 13 | 填写其他条款 | `contractData.otherTerms` | `textarea` 第4个 | 填写成功 | 文本域有值 |
| 14 | 填写甲方联系人 | `contractData.partyAContact` | `input[placeholder*="甲方联系人"]` | 填写成功 | 输入框有值 |
| 15 | 填写甲方电话 | `contractData.partyAPhone` | `input[placeholder*="甲方电话"]` | 填写成功 | 输入框有值 |
| 16 | 填写乙方名称 | `contractData.partyBName` | `input[placeholder*="乙方名称"]` | 填写成功 | 输入框有值 |
| 17 | 填写乙方联系人 | `contractData.partyBContact` | `input[placeholder*="乙方联系人"]` | 填写成功 | 输入框有值 |
| 18 | 填写乙方电话 | `contractData.partyBPhone` | `input[placeholder*="乙方电话"]` | 填写成功 | 输入框有值 |
| 19 | 填写备注 | `contractData.remark` | `textarea[placeholder*="备注"]` | 填写成功 | 文本域有值 |
| 20 | 验证产品明细 | - | 产品明细表格 | 产品列表正确 | 从报价单继承 |
| 21 | 验证合同金额 | - | 金额字段 | 金额正确 | 显示35866.00 |
| 22 | 截图表单 | - | - | 保存截图 | `contract-form-filled.png` |
| 23 | 点击保存 | - | `button:has-text("保存")` | 保存为草稿 | 提示成功 |
| 24 | 验证合同号 | - | 合同详情 | 自动生成合同号 | 格式为`CT202512xxxx` |
| 25 | 点击签署 | - | `button:has-text("签署合同")` | 显示签署对话框 | 对话框出现 |
| 26 | 确认签署 | - | `button:has-text("确定")` | 合同签署成功 | 状态变为"已签署" |
| 27 | 验证执行进度 | - | 执行进度区域 | 显示进度条 | 已发货0%，已收款0%，已开票0% |

**预期API响应**:
```json
{
  "success": true,
  "code": 201,
  "message": "合同创建成功",
  "data": {
    "contractId": 1,
    "contractNo": "CT202512260001",
    "quotationId": 1,
    "customerId": 1,
    "customerName": "测试酒店_20251226143000",
    "contractName": "智能门锁采购合同",
    "contractType": "sales",
    "signDate": "2025-12-26",
    "effectiveDate": "2025-12-26",
    "expiryDate": "2026-12-26",
    "contractAmount": "35866.00",
    "paymentTerms": "签约付30%，发货付50%，验收付20%",
    "deliveryTerms": "签约后60天内交货",
    "warrantyTerms": "质保期2年",
    "otherTerms": "设备安装调试由乙方负责",
    "partyAName": "测试酒店_20251226143000",
    "partyAContact": "张经理",
    "partyAPhone": "13800138001",
    "partyBName": "艾居来智能科技有限公司",
    "partyBContact": "李经理",
    "partyBPhone": "0755-12345678",
    "status": "signed",
    "shippedAmount": "0.00",
    "paidAmount": "0.00",
    "invoicedAmount": "0.00",
    "completionRate": 0,
    "remark": "重点客户合同，优先处理",
    "items": [/* 继承自报价单 */],
    "createdAt": "2025-12-26T14:50:00.000Z",
    "signedAt": "2025-12-26T14:51:00.000Z"
  }
}
```

**截图要求**:
- `contract-form-from-quotation.png` - 从报价单创建合同
- `contract-form-filled.png` - 完整合同表单
- `contract-sign-confirm.png` - 签署确认对话框
- `contract-signed.png` - 合同签署成功
- `contract-progress-initial.png` - 初始执行进度

---

## 用户故事3.2: 客户持续跟踪（重要补充）

### 测试场景3.2: 添加客户跟踪记录

**前置条件**:
- 已转换客户（场景3.1）
- 用户已登录

**测试数据**:
```javascript
const customerFollowUpData = {
  bizType: 2, // 2=客户
  bizId: null, // 从场景3.1获取客户ID
  followType: '现场拜访',
  content: `${timestamp} - 现场拜访客户酒店，查看实际安装环境。客户经理张经理带领参观了3-5层客房区域，确认100间客房改造需求。客户特别关注：
  1. 门锁安装对现有门体的改动要求
  2. 施工周期和对酒店营业的影响
  3. 系统稳定性和售后响应时间
  已约定下周三提交详细技术方案和报价。`,
  intentionLevel: '高',
  nextPlan: '1. 完成现场测量数据整理\n2. 准备定制化技术方案\n3. 联系工程部协调施工计划',
  nextFollowDate: '2026-01-02',
  attachments: [
    { name: '现场照片1.jpg', url: '/uploads/photos/site1.jpg' },
    { name: '现场测量数据.xlsx', url: '/uploads/docs/measurement.xlsx' }
  ]
}
```

**测试步骤**:

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 进入客户详情页 | - | `/customers/${customerId}` | 显示客户详情 | URL正确 |
| 2 | 切换到跟踪记录标签 | 点击标签 | `.el-tabs__item:has-text("跟踪记录")` | 显示跟踪面板 | 标签激活 |
| 3 | 点击添加跟踪 | - | `button:has-text("添加跟踪")` | 打开跟踪对话框 | 对话框显示 |
| 4 | 选择跟踪方式 | `customerFollowUpData.followType` | `.el-select[placeholder*="跟踪方式"]` | 选择成功 | 显示"现场拜访" |
| 5 | 填写跟踪内容 | `customerFollowUpData.content` | `textarea[placeholder*="跟踪内容"]` | 填写成功 | 多行文本显示 |
| 6 | 选择意向等级 | `customerFollowUpData.intentionLevel` | `.el-radio:has-text("高")` | 选中"高" | 单选框选中 |
| 7 | 填写下次计划 | `customerFollowUpData.nextPlan` | `textarea[placeholder*="下次计划"]` | 填写成功 | 多行文本显示 |
| 8 | 选择下次跟踪日期 | `customerFollowUpData.nextFollowDate` | `.el-date-picker` | 选择成功 | 显示日期 |
| 9 | 点击上传附件 | - | `button:has-text("上传")` | 打开文件选择 | 文件对话框显示 |
| 10 | 上传现场照片 | 选择文件 | `input[type="file"]` | 上传成功 | 显示文件名 |
| 11 | 上传测量数据 | 选择文件 | `input[type="file"]` | 上传成功 | 显示文件名 |
| 12 | 截图表单 | - | - | 保存截图 | `customer-followup-form.png` |
| 13 | 点击保存 | - | `button:has-text("确定")` | 提交表单 | 加载状态显示 |
| 14 | 验证成功消息 | - | `.el-message--success` | 显示成功提示 | 提示"添加成功" |
| 15 | 验证跟踪记录显示 | - | `.follow-up-timeline` | 记录出现 | 找到最新记录 |
| 16 | 验证附件显示 | - | `.attachment-list` | 附件可下载 | 2个附件显示 |

**预期API请求**:
```json
POST /api/follow-ups
{
  "bizType": 2,
  "bizId": 1,
  "followType": "现场拜访",
  "content": "2025-12-26 - 现场拜访客户酒店...",
  "intentionLevel": "高",
  "nextPlan": "1. 完成现场测量数据整理...",
  "nextFollowDate": "2026-01-02",
  "attachments": [
    { "name": "现场照片1.jpg", "url": "/uploads/photos/site1.jpg" },
    { "name": "现场测量数据.xlsx", "url": "/uploads/docs/measurement.xlsx" }
  ]
}
```

**预期API响应**:
```json
{
  "success": true,
  "code": 201,
  "message": "客户跟踪记录添加成功",
  "data": {
    "id": 2,
    "bizType": 2,
    "bizId": 1,
    "followType": "现场拜访",
    "content": "2025-12-26 - 现场拜访客户酒店...",
    "intentionLevel": "高",
    "nextPlan": "1. 完成现场测量数据整理...",
    "nextFollowDate": "2026-01-02",
    "attachments": [...],
    "operatorId": 2,
    "createdAt": "2025-12-26T17:00:00.000Z"
  }
}
```

**截图要求**:
- `customer-followup-form-filled.png` - 填写完成的跟踪表单
- `customer-followup-with-attachments.png` - 带附件的跟踪记录
- `customer-followup-timeline.png` - 客户跟踪时间轴

---

## 用户故事7: 创建发货单

### 测试场景7.1: 基于合同创建发货单

**前置条件**:
- 已签署合同（场景6）
- 合同状态为"执行中"

**测试数据**:
```javascript
const shipmentData = {
  contractId: null, // 从合同获取
  shipmentNo: null, // 系统自动生成
  customerId: null, // 从合同继承
  shipmentDate: '2025-12-27',

  shippingInfo: {
    courierCompany: '顺丰速运',
    trackingNo: 'SF1234567890',
    recipientName: '张经理',
    recipientPhone: '13800138001',
    shippingAddress: '广东省深圳市南山区科技园南区测试酒店',
    estimatedArrival: '2025-12-29'
  },

  items: [
    {
      productId: 1,
      productName: '智能门锁A1',
      contractQuantity: 100,
      shippedQuantity: 50, // 首批发货50台
      unitPrice: 299.00,
      amount: 14202.50 // 50 * 299 * 0.95
    }
  ],

  totalQuantity: 50,
  totalAmount: 14202.50,
  remark: '首批发货，剩余50台将在下月发出'
}
```

**测试步骤**:

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 导航到发货管理 | - | `/shipments` | 显示发货列表 | URL为`/shipments` |
| 2 | 点击新建发货单 | - | `button:has-text("新建发货单")` | 打开发货表单 | 对话框显示 |
| 3 | 选择合同 | 选择已签署的合同 | `.el-select[placeholder*="合同"]` | 合同已选择 | 显示合同号 |
| 4 | 验证数据继承 | - | 各字段 | 客户和产品信息自动填充 | 数据正确继承 |
| 5 | 填写发货日期 | `shipmentData.shipmentDate` | `.el-date-picker` | 日期填写成功 | 显示日期 |
| 6 | 填写快递公司 | `shipmentData.shippingInfo.courierCompany` | `input[placeholder*="快递公司"]` | 填写成功 | 输入框有值 |
| 7 | 填写运单号 | `shipmentData.shippingInfo.trackingNo` | `input[placeholder*="运单号"]` | 填写成功 | 输入框有值 |
| 8 | 填写收货人 | `shipmentData.shippingInfo.recipientName` | `input[placeholder*="收货人"]` | 填写成功 | 输入框有值 |
| 9 | 填写收货电话 | `shipmentData.shippingInfo.recipientPhone` | `input[placeholder*="电话"]` | 填写成功 | 输入框有值 |
| 10 | 填写收货地址 | `shipmentData.shippingInfo.shippingAddress` | `input[placeholder*="地址"]` | 填写成功 | 输入框有值 |
| 11 | 填写预计到达 | `shipmentData.shippingInfo.estimatedArrival` | `.el-date-picker` | 日期填写成功 | 显示日期 |
| 12 | 查看产品明细 | - | 产品明细表格 | 显示合同产品 | 产品列表正确 |
| 13 | 填写发货数量 | `shipmentData.items[0].shippedQuantity` | `input[placeholder*="发货数量"]` 第1行 | 填写成功 | 输入框有值 |
| 14 | 验证数量限制 | 输入超过合同数量 | 发货数量输入框 | 显示错误提示 | "不能超过合同数量" |
| 15 | 修正数量 | `50` | 发货数量输入框 | 验证通过 | 数量合法 |
| 16 | 验证自动计算 | - | 金额列 | 自动计算金额 | 显示14202.50 |
| 17 | 填写备注 | `shipmentData.remark` | `textarea[placeholder*="备注"]` | 填写成功 | 文本域有值 |
| 18 | 截图表单 | - | - | 保存截图 | `shipment-form-filled.png` |
| 19 | 点击保存 | - | `button:has-text("保存")` | 保存为待发货 | 提示成功 |
| 20 | 验证发货单号 | - | 发货单详情 | 自动生成发货单号 | 格式为`SH202512xxxx` |
| 21 | 点击确认发货 | - | `button:has-text("确认发货")` | 状态变为"已发货" | 状态更新 |
| 22 | 返回合同详情 | - | 关联合同链接 | 查看合同 | 跳转到合同详情 |
| 23 | 验证合同进度 | - | 执行进度 | 发货进度更新 | 已发货约40% (14202.50/35866) |

**预期API响应**:
```json
{
  "success": true,
  "code": 201,
  "message": "发货单创建成功",
  "data": {
    "shipmentId": 1,
    "shipmentNo": "SH202512270001",
    "contractId": 1,
    "contractNo": "CT202512260001",
    "customerId": 1,
    "customerName": "测试酒店_20251226143000",
    "shipmentDate": "2025-12-27",
    "courierCompany": "顺丰速运",
    "trackingNo": "SF1234567890",
    "recipientName": "张经理",
    "recipientPhone": "13800138001",
    "shippingAddress": "广东省深圳市南山区科技园南区测试酒店",
    "estimatedArrival": "2025-12-29",
    "totalQuantity": 50,
    "totalAmount": "14202.50",
    "status": "shipped",
    "remark": "首批发货，剩余50台将在下月发出",
    "items": [
      {
        "itemId": 1,
        "productId": 1,
        "productName": "智能门锁A1_20251226143000",
        "contractQuantity": 100,
        "shippedQuantity": 50,
        "unitPrice": "299.00",
        "amount": "14202.50"
      }
    ],
    "createdAt": "2025-12-26T15:00:00.000Z",
    "shippedAt": "2025-12-26T15:01:00.000Z"
  }
}
```

**截图要求**:
- `shipment-form-from-contract.png` - 从合同创建发货单
- `shipment-items.png` - 发货明细
- `shipment-form-filled.png` - 完整发货表单
- `shipment-confirmed.png` - 确认发货成功
- `contract-shipment-progress.png` - 合同发货进度更新

---

## 用户故事7.2: 发货物流追踪（重要补充）

### 测试场景7.2: 更新发货物流信息

**前置条件**:
- 已创建发货单（场景7.1）
- 发货单状态为"已发货"

**测试数据**:
```javascript
const logisticsTrackingData = {
  shipmentId: null, // 从场景7.1获取
  trackingNo: 'SF1234567890',
  courierCompany: '顺丰速运',
  logisticsUpdates: [
    {
      updateTime: '2025-12-26 15:30:00',
      status: 'picked_up',
      location: '深圳市南山区揽件中心',
      description: '快递已揽件',
      operator: '顺丰-张三'
    },
    {
      updateTime: '2025-12-26 20:00:00',
      status: 'in_transit',
      location: '深圳转运中心',
      description: '快件已到达深圳转运中心',
      operator: '转运中心'
    },
    {
      updateTime: '2025-12-27 08:00:00',
      status: 'out_for_delivery',
      location: '深圳市南山区派送中心',
      description: '派送员李四正在派送，预计今日送达',
      operator: '派送员-李四',
      courierPhone: '13900139001'
    },
    {
      updateTime: '2025-12-27 14:30:00',
      status: 'delivered',
      location: '测试酒店',
      description: '快件已签收，签收人：张经理',
      operator: '派送员-李四',
      signature: '/uploads/signatures/sign_001.jpg',
      receivedBy: '张经理',
      receivedPhone: '13800138001'
    }
  ]
}
```

**测试步骤**:

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 进入发货单详情页 | - | `/shipments/${shipmentId}` | 显示发货单详情 | URL正确 |
| 2 | 查看物流信息区域 | - | `.logistics-tracking` | 显示物流追踪面板 | 面板存在 |
| 3 | 点击更新物流 | - | `button:has-text("更新物流")` | 打开物流更新对话框 | 对话框显示 |
| 4 | 查看快递单号 | - | `.tracking-number` | 显示快递单号 | SF1234567890 |
| 5 | 点击获取最新物流 | - | `button:has-text("获取最新物流")` | 调用物流API | 加载状态显示 |
| 6 | 验证物流信息更新 | - | `.logistics-timeline` | 显示物流时间轴 | 4条物流记录 |
| 7 | 验证第1条记录 | - | `.timeline-item:first` | 显示揽件信息 | "快递已揽件" |
| 8 | 验证第2条记录 | - | `.timeline-item:nth(2)` | 显示转运信息 | "转运中心" |
| 9 | 验证第3条记录 | - | `.timeline-item:nth(3)` | 显示派送信息 | "正在派送" |
| 10 | 验证第4条记录 | - | `.timeline-item:last` | 显示签收信息 | "已签收" |
| 11 | 验证签收人信息 | - | `.received-by` | 显示签收人 | "张经理" |
| 12 | 查看签收图片 | 点击查看 | `.signature-image` | 显示签收照片 | 图片显示 |
| 13 | 截图物流轨迹 | - | - | 保存截图 | `logistics-tracking.png` |
| 14 | 验证发货状态更新 | - | `.shipment-status` | 状态为"已签收" | 绿色标签 |
| 15 | 返回发货列表 | - | `/shipments` | 显示列表 | URL正确 |
| 16 | 验证列表状态 | - | `tr:has-text("SH202512270001")` | 状态已更新 | 显示"已签收" |

**预期API请求（获取物流信息）**:
```json
GET /api/shipments/:id/tracking
```

**预期API响应（物流信息）**:
```json
{
  "success": true,
  "code": 200,
  "message": "物流信息获取成功",
  "data": {
    "shipmentId": 1,
    "trackingNo": "SF1234567890",
    "courierCompany": "顺丰速运",
    "currentStatus": "delivered",
    "currentLocation": "测试酒店",
    "estimatedArrival": "2025-12-29",
    "actualArrival": "2025-12-27",
    "trackingHistory": [
      {
        "updateTime": "2025-12-26T15:30:00.000Z",
        "status": "picked_up",
        "location": "深圳市南山区揽件中心",
        "description": "快递已揽件",
        "operator": "顺丰-张三"
      },
      {
        "updateTime": "2025-12-26T20:00:00.000Z",
        "status": "in_transit",
        "location": "深圳转运中心",
        "description": "快件已到达深圳转运中心",
        "operator": "转运中心"
      },
      {
        "updateTime": "2025-12-27T08:00:00.000Z",
        "status": "out_for_delivery",
        "location": "深圳市南山区派送中心",
        "description": "派送员李四正在派送，预计今日送达",
        "operator": "派送员-李四",
        "courierPhone": "13900139001"
      },
      {
        "updateTime": "2025-12-27T14:30:00.000Z",
        "status": "delivered",
        "location": "测试酒店",
        "description": "快件已签收，签收人：张经理",
        "operator": "派送员-李四",
        "signature": "/uploads/signatures/sign_001.jpg",
        "receivedBy": "张经理",
        "receivedPhone": "13800138001"
      }
    ],
    "shipmentStatus": "delivered"
  }
}
```

**预期API请求（手动更新物流）**:
```json
POST /api/shipments/:id/tracking
{
  "status": "delivered",
  "location": "测试酒店",
  "description": "客户已签收",
  "receivedBy": "张经理",
  "receivedPhone": "13800138001",
  "receivedAt": "2025-12-27T14:30:00.000Z"
}
```

**截图要求**:
- `logistics-tracking-timeline.png` - 物流追踪时间轴
- `logistics-in-transit.png` - 运输中状态
- `logistics-delivered.png` - 已签收状态
- `logistics-signature.png` - 签收照片

---

## 用户故事7.3: 分批发货管理（重要补充）

### 测试场景7.3: 创建第二批发货单

**前置条件**:
- 已完成第一批发货（场景7.1，发货50台）
- 合同总量100台，剩余50台待发货

**测试数据**:
```javascript
const secondShipmentData = {
  contractId: null, // 同场景7.1
  shipmentNo: null, // 自动生成
  shipmentDate: '2026-01-15',
  courierCompany: '顺丰速运',
  trackingNo: 'SF9876543210',
  recipientName: '张经理',
  recipientPhone: '13800138001',
  shippingAddress: '广东省深圳市南山区科技园南区测试酒店',
  estimatedArrival: '2026-01-17',
  remark: '第二批发货，完成全部合同交付',
  items: [
    {
      productId: null, // 从合同明细获取
      productName: '智能门锁A1',
      contractQuantity: 100,
      firstShipmentQty: 50, // 第一批已发货
      remainingQty: 50, // 剩余数量
      currentShipmentQty: 50, // 本次发货
      unitPrice: 299.00,
      amount: 14202.50
    }
  ],
  totalQuantity: 50,
  totalAmount: 14202.50
}
```

**测试步骤**:

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 进入合同详情页 | - | `/contracts/${contractId}` | 显示合同详情 | URL正确 |
| 2 | 查看发货进度 | - | `.shipment-progress` | 显示发货统计 | 已发货50/100 |
| 3 | 点击创建发货单 | - | `button:has-text("创建发货单")` | 打开发货表单 | 对话框显示 |
| 4 | 验证剩余数量 | - | `.remaining-quantity` | 显示剩余50台 | 数量正确 |
| 5 | 选择发货产品 | 勾选产品 | `.product-checkbox` | 产品已选择 | 复选框选中 |
| 6 | 填写本次发货数量 | `50` | `input[placeholder*="发货数量"]` | 填写成功 | 输入框有值 |
| 7 | 验证数量限制 | - | - | 不能超过剩余数量 | 验证通过 |
| 8 | 填写发货日期 | `secondShipmentData.shipmentDate` | `.el-date-picker` | 日期填写成功 | 显示日期 |
| 9 | 选择快递公司 | `secondShipmentData.courierCompany` | `.el-select` | 选择成功 | 显示"顺丰" |
| 10 | 填写快递单号 | `secondShipmentData.trackingNo` | `input[placeholder*="单号"]` | 填写成功 | 输入框有值 |
| 11 | 填写预计到达 | `secondShipmentData.estimatedArrival` | `.el-date-picker` | 日期填写成功 | 显示日期 |
| 12 | 填写备注 | `secondShipmentData.remark` | `textarea` | 填写成功 | 文本域有值 |
| 13 | 截图表单 | - | - | 保存截图 | `second-shipment-form.png` |
| 14 | 点击确认发货 | - | `button:has-text("确认发货")` | 提交表单 | 加载状态显示 |
| 15 | 验证成功消息 | - | `.el-message--success` | 显示成功提示 | 提示"发货成功" |
| 16 | 验证发货进度 | - | `.shipment-progress` | 进度更新为100% | 已发货100/100 |
| 17 | 验证合同状态 | - | `.contract-status` | 状态更新 | 显示"已完成交付" |

**预期API响应**:
```json
{
  "success": true,
  "code": 201,
  "message": "第二批发货单创建成功",
  "data": {
    "shipmentId": 2,
    "shipmentNo": "SH202601150001",
    "contractId": 1,
    "batchNumber": 2,
    "totalBatches": 2,
    "shipmentDate": "2026-01-15",
    "trackingNo": "SF9876543210",
    "totalQuantity": 50,
    "totalAmount": "14202.50",
    "status": "shipped",
    "contractProgress": {
      "totalQuantity": 100,
      "shippedQuantity": 100,
      "remainingQuantity": 0,
      "completionRate": "100%",
      "isCompleted": true
    }
  }
}
```

**截图要求**:
- `second-shipment-form.png` - 第二批发货表单
- `shipment-progress-50.png` - 50%发货进度
- `shipment-progress-100.png` - 100%发货进度
- `contract-delivery-completed.png` - 合同交付完成状态

---

## 用户故事8: 创建回款记录

### 测试场景8.1: 基于合同创建回款记录

**前置条件**:
- 已签署合同（场景6）
- 合同已发货（场景7）

**测试数据**:
```javascript
const paymentData = {
  contractId: null, // 从合同获取
  paymentNo: null, // 系统自动生成
  customerId: null, // 从合同继承

  paymentStage: '签约款', // 或 '发货款', '尾款'
  paymentAmount: 10759.80, // 35866 * 30%
  paymentDate: '2025-12-26',
  paymentMethod: '银行转账',

  bankInfo: {
    bankAccount: '622848*********1234',
    transactionNo: 'TRX20251226001',
    payerName: '测试酒店有限公司'
  },

  expectedAmount: 10759.80, // 该期应收金额
  confirmDate: '2025-12-26',
  remark: '首付款30%，已到账确认'
}
```

**测试步骤**:

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 导航到回款管理 | - | `/payments` | 显示回款列表 | URL为`/payments` |
| 2 | 点击新建回款 | - | `button:has-text("新建回款")` | 打开回款表单 | 对话框显示 |
| 3 | 选择合同 | 选择已签署的合同 | `.el-select[placeholder*="合同"]` | 合同已选择 | 显示合同号 |
| 4 | 验证合同金额 | - | 合同金额显示 | 显示合同总金额 | 35866.00 |
| 5 | 选择回款阶段 | `paymentData.paymentStage` | `.el-select[placeholder*="阶段"]` | 阶段已选择 | 显示"签约款" |
| 6 | 填写回款金额 | `paymentData.paymentAmount` | `input[placeholder*="金额"]` | 填写成功 | 输入框有值 |
| 7 | 验证金额合理性 | - | - | 系统验证通过 | 不超过应收金额 |
| 8 | 填写回款日期 | `paymentData.paymentDate` | `.el-date-picker` | 日期填写成功 | 显示日期 |
| 9 | 选择收款方式 | `paymentData.paymentMethod` | `.el-select[placeholder*="方式"]` | 方式已选择 | 显示"银行转账" |
| 10 | 填写银行账号 | `paymentData.bankInfo.bankAccount` | `input[placeholder*="账号"]` | 填写成功 | 输入框有值 |
| 11 | 填写交易单号 | `paymentData.bankInfo.transactionNo` | `input[placeholder*="交易"]` | 填写成功 | 输入框有值 |
| 12 | 填写付款方 | `paymentData.bankInfo.payerName` | `input[placeholder*="付款方"]` | 填写成功 | 输入框有值 |
| 13 | 填写备注 | `paymentData.remark` | `textarea[placeholder*="备注"]` | 填写成功 | 文本域有值 |
| 14 | 截图表单 | - | - | 保存截图 | `payment-form-filled.png` |
| 15 | 点击保存 | - | `button:has-text("保存")` | 保存为待确认 | 提示成功 |
| 16 | 验证回款单号 | - | 回款详情 | 自动生成回款单号 | 格式为`PM202512xxxx` |
| 17 | 点击确认收款 | - | `button:has-text("确认收款")` | 状态变为"已确认" | 状态更新 |
| 18 | 验证确认时间 | - | 确认时间字段 | 记录确认时间 | 时间正确 |
| 19 | 返回合同详情 | - | 关联合同链接 | 查看合同 | 跳转到合同详情 |
| 20 | 验证合同进度 | - | 执行进度 | 回款进度更新 | 已收款30% (10759.80/35866) |
| 21 | 验证回款汇总 | - | 回款列表 | 显示汇总金额 | 表格底部显示总计 |

**预期API响应**:
```json
{
  "success": true,
  "code": 201,
  "message": "回款记录创建成功",
  "data": {
    "paymentId": 1,
    "paymentNo": "PM202512260001",
    "contractId": 1,
    "contractNo": "CT202512260001",
    "customerId": 1,
    "customerName": "测试酒店_20251226143000",
    "paymentStage": "签约款",
    "paymentAmount": "10759.80",
    "paymentDate": "2025-12-26",
    "paymentMethod": "银行转账",
    "bankAccount": "622848*********1234",
    "transactionNo": "TRX20251226001",
    "payerName": "测试酒店有限公司",
    "expectedAmount": "10759.80",
    "stagePaidAmount": "10759.80",
    "stageBalanceAmount": "0.00",
    "isStageSettled": true,
    "status": "confirmed",
    "confirmDate": "2025-12-26T15:05:00.000Z",
    "confirmedBy": 2,
    "remark": "首付款30%，已到账确认",
    "createdAt": "2025-12-26T15:04:00.000Z"
  }
}
```

**截图要求**:
- `payment-form-from-contract.png` - 从合同创建回款
- `payment-form-filled.png` - 完整回款表单
- `payment-confirmed.png` - 确认收款成功
- `contract-payment-progress.png` - 合同回款进度更新
- `payment-list-summary.png` - 回款列表汇总

---

## 测试执行指南

### 测试执行顺序
必须按照以下顺序执行测试，因为存在数据依赖：

```
1. 用户登录 (场景1.1)
   ↓
2. 创建线索 (场景2.1)
   ↓
3. 线索转客户 (场景3.1)
   ↓
4. 创建产品分类和产品 (场景4.1)
   ↓
5. 创建报价单 (场景5.1)
   ↓
6. 创建合同 (场景6.1)
   ↓
7. 创建发货单 (场景7.1)
   ↓
8. 创建回款记录 (场景8.1)
```

### Playwright测试脚本结构

```javascript
// 测试脚本模板
const { test, expect } = require('@playwright/test');

// 全局测试数据存储
const testData = {
  timestamp: Date.now(),
  leadId: null,
  customerId: null,
  categoryId: null,
  productId: null,
  quotationId: null,
  contractId: null,
  shipmentId: null,
  paymentId: null
};

test.describe('CRM系统完整用户故事测试', () => {

  test('场景1.1: 用户登录', async ({ page }) => {
    // 按照测试步骤执行...
  });

  test('场景2.1: 创建线索', async ({ page }) => {
    // 按照测试步骤执行...
    // 保存lineId到testData
  });

  // ... 更多测试用例
});
```

### 验证点检查清单

每个测试场景需要验证：
- ✅ URL正确性
- ✅ 页面元素存在性
- ✅ 数据填写成功
- ✅ API响应正确
- ✅ 成功提示显示
- ✅ 列表数据更新
- ✅ 详情数据完整
- ✅ 状态流转正确
- ✅ 关联数据准确
- ✅ 计算结果正确

### 错误处理

测试过程中如果发生错误：
1. 截图保存错误状态
2. 记录错误信息到日志
3. 保存当前测试数据
4. 标记失败的步骤
5. 继续执行后续测试（如果可能）

### 测试数据清理

测试完成后：
1. 可选：删除测试数据（带timestamp的数据）
2. 保留测试截图供分析
3. 生成测试报告
4. 记录测试覆盖率

---

## 附录

### A. 常用选择器参考

```javascript
// 表单元素
'input[placeholder*="关键词"]'
'input[type="password"]'
'textarea[placeholder*="关键词"]'
'.el-select[placeholder*="关键词"]'
'.el-date-picker'

// 按钮
'button:has-text("按钮文字")'
'button[type="submit"]'

// 表格
'table'
'tr:has-text("内容")'
'td'

// 消息提示
'.el-message--success'
'.el-message--error'

// 对话框
'.el-dialog'
'.el-dialog__header'
'.el-dialog__footer'

// 菜单
'.el-menu-item:has-text("菜单名")'
```

### B. API端点参考

```
POST /api/auth/login - 用户登录
POST /api/leads - 创建线索
POST /api/leads/:id/convert - 线索转客户
POST /api/products/categories - 创建产品分类
POST /api/products - 创建产品
POST /api/quotations - 创建报价单
POST /api/contracts - 创建合同
POST /api/contracts/:id/sign - 签署合同
POST /api/shipments - 创建发货单
POST /api/payments - 创建回款记录
POST /api/payments/:id/verify - 确认收款
```

### C. 测试报告格式

```json
{
  "testSuite": "CRM系统用户故事测试",
  "executionTime": "2025-12-26T15:00:00.000Z",
  "duration": "1800s",
  "results": {
    "total": 8,
    "passed": 8,
    "failed": 0,
    "skipped": 0
  },
  "scenarios": [
    {
      "name": "场景1.1: 用户登录",
      "status": "passed",
      "duration": "5s",
      "steps": 10,
      "screenshots": ["login-form.png", "login-success.png"]
    }
    // ... 更多场景
  ],
  "testData": {
    "leadId": 1,
    "customerId": 1,
    "contractId": 1
    // ... 更多测试数据ID
  }
}
```

---

## 测试执行总结

### 新增补充场景统计

| 原始场景 | 补充场景 | 场景名称 | 测试步骤数 | 业务价值 |
|---------|---------|---------|----------|---------|
| 场景2.1 | **场景2.2** | 线索跟踪记录 | 14步 | 记录客户沟通历史 |
| 场景2.1 | **场景2.3** | 线索分配给销售 | 12步 | 人员协作管理 |
| 场景2.1 | **场景2.4** | 创建跟进任务 | 17步 | 任务流程管理 |
| 场景2.1 | **场景2.5** | 任务执行和完成 | 16步 | 任务闭环管理 |
| 场景3.1 | **场景3.2** | 客户持续跟踪 | 16步 | 客户关系维护 |
| 场景5.1 | **场景5.2** | 报价单审批提交 | 11步 | 审批流程启动 |
| 场景5.1 | **场景5.3** | 报价单审批处理 | 14步 | 审批决策管理 |
| 场景7.1 | **场景7.2** | 发货物流追踪 | 16步 | 物流信息跟踪 |
| 场景7.1 | **场景7.3** | 分批发货管理 | 17步 | 订单分批执行 |

**总计**: 9个新增补充场景，133个详细测试步骤

### 完整测试场景概览

**总计**: 17个完整测试场景（8个基础场景 + 9个补充场景）

#### 第一阶段：用户与权限管理
- ✅ 场景1.1: 用户登录（10步）
- ✅ 场景1.2: 错误密码登录（5步）

#### 第二阶段：线索管理全流程
- ✅ 场景2.1: 创建线索（23步）
- ✅ **场景2.2: 线索跟踪记录（14步）** - 新增
- ✅ **场景2.3: 线索分配给销售（12步）** - 新增
- ✅ **场景2.4: 创建跟进任务（17步）** - 新增
- ✅ **场景2.5: 任务执行和完成（16步）** - 新增

#### 第三阶段：客户管理
- ✅ 场景3.1: 线索转客户（14步）
- ✅ **场景3.2: 客户持续跟踪（16步）** - 新增

#### 第四阶段：产品管理
- ✅ 场景4.1: 创建产品分类和产品（27步）

#### 第五阶段：报价与审批
- ✅ 场景5.1: 创建报价单（29步）
- ✅ **场景5.2: 报价单审批提交（11步）** - 新增
- ✅ **场景5.3: 报价单审批处理（14步）** - 新增

#### 第六阶段：合同管理
- ✅ 场景6.1: 基于报价单创建合同（27步）

#### 第七阶段：发货与物流
- ✅ 场景7.1: 基于合同创建发货单（23步）
- ✅ **场景7.2: 发货物流追踪（16步）** - 新增
- ✅ **场景7.3: 分批发货管理（17步）** - 新增

#### 第八阶段：回款管理
- ✅ 场景8.1: 基于合同创建回款记录（21步）

### 核心业务流程覆盖

#### 1. 完整销售漏斗流程
```
线索获取 → 跟踪记录 → 人员分配 → 任务管理 → 线索转化
   ↓          ↓          ↓          ↓          ↓
场景2.1    场景2.2    场景2.3    场景2.4    场景3.1
                                 场景2.5
   ↓
客户跟踪 → 报价单 → 审批流程 → 合同签订 → 发货物流 → 回款管理
   ↓          ↓        ↓          ↓          ↓          ↓
场景3.2    场景5.1  场景5.2    场景6.1    场景7.1    场景8.1
                    场景5.3              场景7.2
                                         场景7.3
```

#### 2. 人员协作流程
- **线索分配**: 管理员 → 销售人员（场景2.3）
- **任务指派**: 任务创建者 → 任务执行者（场景2.4）
- **任务执行**: 销售人员执行并完成任务（场景2.5）
- **审批流程**: 提交人 → 审批人（场景5.2 + 5.3）

#### 3. 状态流转追踪
- **线索状态**: 新建 → 跟进中 → 已转化（场景2.1-2.5）
- **客户状态**: 潜在客户 → 意向客户 → 签约客户（场景3.1-3.2）
- **报价状态**: 草稿 → 待审批 → 已批准（场景5.1-5.3）
- **合同状态**: 草稿 → 已签署 → 执行中 → 已完成（场景6.1-7.3）
- **发货状态**: 待发货 → 已发货 → 运输中 → 已签收（场景7.1-7.2）
- **回款状态**: 待收款 → 部分收款 → 已收款（场景8.1）

#### 4. 数据关联验证
- 线索ID → 客户ID（场景2.1 → 3.1）
- 客户ID → 报价单ID（场景3.1 → 5.1）
- 报价单ID → 合同ID（场景5.1 → 6.1）
- 合同ID → 发货单ID（场景6.1 → 7.1）
- 合同ID → 回款记录ID（场景6.1 → 8.1）

### 测试数据依赖关系图

```
用户登录 (场景1.1)
    └─> token, userId
           │
           ├─> 创建线索 (场景2.1)
           │      └─> leadId
           │           ├─> 添加跟踪记录 (场景2.2)
           │           │      └─> followUpId
           │           ├─> 分配销售 (场景2.3)
           │           │      └─> salesOwnerId
           │           ├─> 创建任务 (场景2.4)
           │           │      └─> taskId
           │           │           └─> 执行任务 (场景2.5)
           │           └─> 转为客户 (场景3.1)
           │                   └─> customerId
           │                        ├─> 客户跟踪 (场景3.2)
           │                        └─> 创建报价单 (场景5.1)
           │                                └─> quotationId
           │                                     ├─> 提交审批 (场景5.2)
           │                                     └─> 审批处理 (场景5.3)
           │                                          └─> 创建合同 (场景6.1)
           │                                                  └─> contractId
           │                                                       ├─> 创建发货单 (场景7.1)
           │                                                       │      └─> shipmentId
           │                                                       │           ├─> 物流追踪 (场景7.2)
           │                                                       │           └─> 第二批发货 (场景7.3)
           │                                                       └─> 创建回款 (场景8.1)
           │                                                                └─> paymentId
           └─> 创建产品 (场景4.1)
                   └─> productId (用于报价单)
```

### API端点补充清单

除了原有的API端点，新增以下端点需要测试：

```
# 跟踪记录管理
POST   /api/follow-ups                    - 创建跟踪记录
GET    /api/follow-ups?bizType=&bizId=    - 获取跟踪记录列表
PUT    /api/follow-ups/:id                - 更新跟踪记录

# 线索分配
PUT    /api/leads/:id/assign              - 分配线索负责人
GET    /api/leads/my-leads                - 我的线索列表

# 任务管理
POST   /api/tasks                         - 创建任务
GET    /api/tasks/my                      - 我的任务列表
PATCH  /api/tasks/:id/start               - 开始任务
PATCH  /api/tasks/:id/complete            - 完成任务
PATCH  /api/tasks/:id/cancel              - 取消任务

# 审批流程
POST   /api/quotations/:id/submit-approval - 提交报价单审批
POST   /api/quotations/:id/approve         - 审批通过
POST   /api/quotations/:id/reject          - 审批拒绝
GET    /api/approvals/pending              - 待审批列表
GET    /api/approvals/history              - 审批历史

# 物流追踪
GET    /api/shipments/:id/tracking         - 获取物流信息
POST   /api/shipments/:id/tracking         - 手动更新物流
PUT    /api/shipments/:id/status           - 更新发货状态
```

### 测试用例标签分类

#### 按功能模块
- `#用户认证` - 场景1.1, 1.2
- `#线索管理` - 场景2.1-2.5
- `#客户管理` - 场景3.1-3.2
- `#产品管理` - 场景4.1
- `#报价管理` - 场景5.1-5.3
- `#合同管理` - 场景6.1
- `#发货管理` - 场景7.1-7.3
- `#回款管理` - 场景8.1

#### 按业务优先级
- `#P0-核心流程` - 场景1.1, 2.1, 3.1, 5.1, 6.1, 7.1, 8.1
- `#P1-重要功能` - 场景2.2, 2.3, 2.4, 3.2, 5.2, 5.3, 7.2
- `#P2-增强功能` - 场景2.5, 7.3
- `#P3-异常处理` - 场景1.2

#### 按用户角色
- `#管理员` - 场景1.1, 2.3, 5.3
- `#销售人员` - 场景2.1-2.5, 3.1-3.2, 5.1-5.2
- `#财务人员` - 场景8.1
- `#仓储人员` - 场景7.1-7.3

### 自动化测试执行建议

#### 测试执行顺序
1. **基础数据准备** (5分钟)
   - 场景1.1: 用户登录
   - 场景4.1: 创建产品

2. **第一轮：完整业务流程** (30分钟)
   - 场景2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 3.1 → 3.2
   - 场景5.1 → 5.2 → 5.3 → 6.1
   - 场景7.1 → 7.2 → 7.3 → 8.1

3. **第二轮：异常场景** (10分钟)
   - 场景1.2: 错误密码登录
   - 其他边界测试

4. **第三轮：性能测试** (可选)
   - 并发用户登录
   - 大量数据查询
   - 文件上传下载

#### 预计测试时间
- **手动测试**: 约 3-4 小时（17个场景）
- **自动化测试**: 约 45-60 分钟（首次执行）
- **回归测试**: 约 30 分钟（自动化）

---

**文档版本**: 2.0
**最后更新**: 2025-12-26
**维护者**: Claude AI
**状态**: ✅ 全面增强完成，包含完整业务流程测试
**测试场景**: 17个（8个基础 + 9个补充）
**测试步骤**: 280+ 步
**覆盖模块**: 用户认证、线索管理、客户管理、产品管理、报价审批、合同管理、发货物流、回款管理、任务协作、审批流程
