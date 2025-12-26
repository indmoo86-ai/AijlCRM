# 收款管理模块测试场景

## 模块说明

**模块名称**: 收款管理
**模块编码**: PAY
**场景数量**: 8个
**优先级**: P0（高优先级）
**依赖模块**: 合同管理、客户管理

---

## 测试场景7.1: 创建收款记录（PAY-001）

**前置条件**:
- 已登录系统
- 已创建并签署合同（CONTRACT-001）
- 合同中包含付款计划

**测试数据**:
```javascript
const paymentData = {
  contractId: null, // 从合同场景获取
  contractNo: 'CT202512260001',
  customerName: '测试酒店有限公司',

  // 收款信息
  paymentStage: '签约款',
  paymentAmount: 10759.80,
  actualAmount: 10759.80,
  paymentDate: '2025-12-26',

  // 付款方式
  paymentMethod: '银行转账',
  payerAccount: '中国银行 6217********1234',
  receiverAccount: '艾居来科技 6228********5678',
  transactionNo: 'TXN202512260001',

  // 发票关联
  needInvoice: true,
  invoiceStatus: 'pending',

  // 备注
  remark: '首笔签约款，银行转账已到账',

  // 附件
  attachments: [
    {
      fileName: '银行回单.jpg',
      fileType: 'receipt',
      fileSize: 1.2 * 1024 * 1024
    }
  ],

  // 操作人
  collectorId: null, // 当前登录用户
  collectorName: '财务部-李会计'
}
```

**测试步骤**: (22步)

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 | API调用 | 截图 |
|------|------|---------|--------|---------|--------|---------|------|
| 1 | 进入收款管理页面 | - | `/payments` | 显示收款列表 | URL正确 | - | ✓ |
| 2 | 点击新建收款 | - | `button:has-text("新建收款")` | 打开收款表单 | 表单显示 | - | ✓ |
| 3 | 选择关联合同 | CT202512260001 | `.contract-selector` | 合同已选择 | 显示合同信息 | GET /api/contracts | ✓ |
| 4 | 自动填充客户名称 | - | `input[name="customerName"]` | 客户名称自动填充 | 值正确 | - | - |
| 5 | 选择收款阶段 | 签约款 | `.el-select[placeholder*="阶段"]` | 阶段已选择 | 显示"签约款" | - | ✓ |
| 6 | 自动填充应收金额 | - | `input[name="paymentAmount"]` | 金额自动填充 | 10759.80元 | - | - |
| 7 | 输入实际收款金额 | 10759.80 | `input[name="actualAmount"]` | 填写成功 | 值匹配 | - | - |
| 8 | 验证金额一致性 | - | `.amount-check` | 显示"金额一致" | 绿色提示 | - | ✓ |
| 9 | 选择收款日期 | 2025-12-26 | `.el-date-picker` | 日期已选择 | 日期正确 | - | - |
| 10 | 选择付款方式 | 银行转账 | `.el-select[placeholder*="方式"]` | 方式已选择 | 显示方式 | - | - |
| 11 | 输入付款账户 | 中国银行...1234 | `input[name="payerAccount"]` | 填写成功 | 账户显示 | - | - |
| 12 | 输入收款账户 | 艾居来科技...5678 | `input[name="receiverAccount"]` | 填写成功 | 账户显示 | - | - |
| 13 | 输入交易流水号 | TXN202512260001 | `input[name="transactionNo"]` | 填写成功 | 流水号显示 | - | - |
| 14 | 勾选需要开票 | - | `input[type="checkbox"][name="needInvoice"]` | 复选框选中 | 已勾选 | - | ✓ |
| 15 | 上传银行回单 | - | `input[type="file"]` | 文件已选择 | 文件名显示 | - | ✓ |
| 16 | 验证文件大小 | - | `.file-size` | 显示文件大小 | 1.2MB | - | - |
| 17 | 填写备注 | - | `textarea[name="remark"]` | 填写成功 | 文本域有值 | - | - |
| 18 | 点击保存 | - | `button:has-text("保存")` | 提交表单 | 加载中 | POST /api/payments | ✓ |
| 19 | 验证保存成功 | - | `.el-message--success` | 显示成功提示 | "收款记录创建成功" | - | ✓ |
| 20 | 验证自动生成编号 | - | `.payment-no` | 显示收款编号 | PAY202512260001 | - | ✓ |
| 21 | 验证合同回款状态更新 | - | - | 合同回款进度更新 | 30%已回款 | GET /api/contracts/:id/execution | - |
| 22 | 验证列表更新 | - | `table tbody tr:first-child` | 新记录在列表首行 | 数据正确 | - | ✓ |

---

## 测试场景7.2: 多种付款方式管理（PAY-002）

**前置条件**:
- 已登录系统
- 已创建合同

**测试数据**:
```javascript
const paymentMethodsData = {
  // 银行转账
  bankTransfer: {
    paymentMethod: '银行转账',
    payerBank: '中国银行',
    payerAccount: '6217 0000 1234 5678',
    receiverBank: '招商银行',
    receiverAccount: '6228 0000 8765 4321',
    transactionNo: 'TXN202512260001',
    transferDate: '2025-12-26',
    amount: 10759.80
  },

  // 支付宝
  alipay: {
    paymentMethod: '支付宝',
    alipayAccount: 'test@hotel.com',
    transactionId: '2025122622001234567890',
    amount: 5000.00,
    paymentDate: '2025-12-26 14:30:00'
  },

  // 微信支付
  wechat: {
    paymentMethod: '微信支付',
    wechatAccount: '张经理',
    transactionId: '4200001234567890',
    amount: 3000.00,
    paymentDate: '2025-12-26 15:00:00'
  },

  // 现金
  cash: {
    paymentMethod: '现金',
    receiverName: '财务部-李会计',
    receiptNo: 'CASH20251226001',
    amount: 2000.00,
    receivedDate: '2025-12-26 10:00:00'
  },

  // 支票
  check: {
    paymentMethod: '支票',
    checkNo: 'CK2025122601',
    checkBank: '工商银行',
    checkDate: '2025-12-26',
    dueDate: '2025-12-30',
    amount: 8000.00
  }
}
```

**测试步骤**: (28步)

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 进入收款管理页面 | - | `/payments` | 显示收款列表 | URL正确 |
| 2 | 点击新建收款 | - | `button:has-text("新建收款")` | 打开收款表单 | 表单显示 |
| 3 | 选择关联合同 | - | `.contract-selector` | 合同已选择 | 合同信息显示 |
| 4 | **测试银行转账方式** | - | - | - | - |
| 5 | 选择付款方式 | 银行转账 | `.el-select[placeholder*="方式"]` | 方式已选择 | 显示"银行转账" |
| 6 | 验证转账字段显示 | - | `.bank-transfer-fields` | 显示转账字段 | 银行账户等字段 |
| 7 | 填写付款银行 | 中国银行 | `input[name="payerBank"]` | 填写成功 | 银行名称显示 |
| 8 | 填写付款账户 | 6217...5678 | `input[name="payerAccount"]` | 填写成功 | 账户显示 |
| 9 | 填写收款银行 | 招商银行 | `input[name="receiverBank"]` | 填写成功 | 银行名称显示 |
| 10 | 填写收款账户 | 6228...4321 | `input[name="receiverAccount"]` | 填写成功 | 账户显示 |
| 11 | 填写交易流水号 | TXN202512260001 | `input[name="transactionNo"]` | 填写成功 | 流水号显示 |
| 12 | **测试支付宝方式** | - | - | - | - |
| 13 | 切换付款方式 | 支付宝 | `.el-select` | 方式切换成功 | 显示"支付宝" |
| 14 | 验证支付宝字段显示 | - | `.alipay-fields` | 显示支付宝字段 | 支付宝账户等 |
| 15 | 填写支付宝账户 | test@hotel.com | `input[name="alipayAccount"]` | 填写成功 | 账户显示 |
| 16 | 填写支付宝交易号 | 2025122622... | `input[name="transactionId"]` | 填写成功 | 交易号显示 |
| 17 | **测试微信支付方式** | - | - | - | - |
| 18 | 切换付款方式 | 微信支付 | `.el-select` | 方式切换成功 | 显示"微信支付" |
| 19 | 验证微信字段显示 | - | `.wechat-fields` | 显示微信字段 | 微信账户等 |
| 20 | 填写微信账户 | 张经理 | `input[name="wechatAccount"]` | 填写成功 | 账户显示 |
| 21 | 填写微信交易号 | 4200001234... | `input[name="transactionId"]` | 填写成功 | 交易号显示 |
| 22 | **测试现金方式** | - | - | - | - |
| 23 | 切换付款方式 | 现金 | `.el-select` | 方式切换成功 | 显示"现金" |
| 24 | 填写收款人 | 李会计 | `input[name="receiverName"]` | 填写成功 | 收款人显示 |
| 25 | 填写现金收据号 | CASH20251226001 | `input[name="receiptNo"]` | 填写成功 | 收据号显示 |
| 26 | **测试支票方式** | - | - | - | - |
| 27 | 切换付款方式 | 支票 | `.el-select` | 方式切换成功 | 显示"支票" |
| 28 | 填写支票信息 | - | `.check-fields input` | 填写成功 | 支票信息完整 |

---

## 测试场景7.3: 分期付款跟踪（PAY-003）

**前置条件**:
- 已创建包含分期付款计划的合同
- 合同包含3期付款：签约款30%、发货款40%、尾款30%

**测试数据**:
```javascript
const installmentPaymentData = {
  contractId: null,
  contractNo: 'CT202512260001',
  contractAmount: 35866.00,

  // 分期计划
  installmentPlan: [
    {
      stage: 1,
      stageName: '签约款',
      percentage: 30,
      plannedAmount: 10759.80,
      dueDate: '2025-12-26',
      status: 'paid',
      actualAmount: 10759.80,
      paidDate: '2025-12-26',
      paymentNo: 'PAY202512260001'
    },
    {
      stage: 2,
      stageName: '发货款',
      percentage: 40,
      plannedAmount: 14346.40,
      dueDate: '2026-01-15',
      status: 'partial',
      actualAmount: 10000.00,
      paidDate: '2026-01-10',
      paymentNo: 'PAY202601100001',
      remainingAmount: 4346.40
    },
    {
      stage: 3,
      stageName: '尾款',
      percentage: 30,
      plannedAmount: 10759.80,
      dueDate: '2026-02-28',
      status: 'pending',
      actualAmount: 0,
      paidDate: null,
      paymentNo: null
    }
  ],

  // 收款统计
  summary: {
    totalPlanned: 35866.00,
    totalPaid: 20759.80,
    totalRemaining: 15106.20,
    completionRate: 57.88,
    paidStages: 1,
    partialStages: 1,
    pendingStages: 1
  }
}
```

**测试步骤**: (25步)

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 进入合同详情页 | - | `/contracts/${contractId}` | 显示合同详情 | URL正确 |
| 2 | 切换到收款计划标签 | - | `.el-tabs__item:has-text("收款计划")` | 显示收款计划 | 标签激活 |
| 3 | 查看分期付款表格 | - | `.installment-table` | 显示3期付款 | 3行数据 |
| 4 | 验证第1期状态 | - | `.stage-1 .status` | 显示"已付清" | 绿色标签 |
| 5 | 验证第1期金额 | - | `.stage-1 .actual-amount` | 显示10759.80 | 金额正确 |
| 6 | 验证第1期付款日期 | - | `.stage-1 .paid-date` | 显示2025-12-26 | 日期正确 |
| 7 | 点击第1期查看详情 | - | `.stage-1 button:has-text("查看")` | 打开详情对话框 | 对话框显示 |
| 8 | 验证收款记录 | - | `.payment-detail` | 显示收款信息 | 完整信息显示 |
| 9 | 关闭详情对话框 | - | `.el-dialog__close` | 对话框关闭 | 对话框消失 |
| 10 | 验证第2期状态 | - | `.stage-2 .status` | 显示"部分付款" | 橙色标签 |
| 11 | 验证第2期已付金额 | - | `.stage-2 .actual-amount` | 显示10000.00 | 金额正确 |
| 12 | 验证第2期剩余金额 | - | `.stage-2 .remaining-amount` | 显示4346.40 | 金额正确 |
| 13 | 点击第2期补充付款 | - | `.stage-2 button:has-text("补充付款")` | 打开收款表单 | 表单显示 |
| 14 | 自动填充收款阶段 | - | `input[name="paymentStage"]` | 阶段自动填充 | "发货款" |
| 15 | 自动填充剩余金额 | - | `input[name="paymentAmount"]` | 金额自动填充 | 4346.40 |
| 16 | 填写实际收款金额 | 4346.40 | `input[name="actualAmount"]` | 填写成功 | 金额显示 |
| 17 | 选择收款日期 | 2026-01-20 | `.el-date-picker` | 日期已选择 | 日期正确 |
| 18 | 选择付款方式 | 银行转账 | `.el-select` | 方式已选择 | 显示方式 |
| 19 | 点击保存 | - | `button:has-text("保存")` | 提交表单 | 加载中 |
| 20 | 验证保存成功 | - | `.el-message--success` | 显示成功提示 | "收款记录创建成功" |
| 21 | 验证第2期状态更新 | - | `.stage-2 .status` | 显示"已付清" | 绿色标签 |
| 22 | 验证第3期状态 | - | `.stage-3 .status` | 显示"待付款" | 灰色标签 |
| 23 | 查看收款进度条 | - | `.payment-progress` | 显示进度 | 进度条显示 |
| 24 | 验证完成率 | - | `.completion-rate` | 显示完成率 | 69.99% |
| 25 | 查看收款汇总 | - | `.payment-summary` | 显示汇总信息 | 统计正确 |

---

## 测试场景7.4: 部分收款支持（PAY-004）

**前置条件**:
- 已创建合同和收款计划
- 某期应收金额为14346.40元

**测试数据**:
```javascript
const partialPaymentData = {
  contractId: null,
  paymentStage: '发货款',
  plannedAmount: 14346.40,

  // 第一笔部分收款
  firstPayment: {
    actualAmount: 10000.00,
    paymentDate: '2026-01-10',
    paymentMethod: '银行转账',
    transactionNo: 'TXN202601100001',
    remark: '首笔发货款，剩余4346.40元待收'
  },

  // 第二笔部分收款
  secondPayment: {
    actualAmount: 4000.00,
    paymentDate: '2026-01-15',
    paymentMethod: '支付宝',
    transactionId: '2026011522001234567890',
    remark: '第二笔发货款，剩余346.40元'
  },

  // 第三笔收尾款
  thirdPayment: {
    actualAmount: 346.40,
    paymentDate: '2026-01-20',
    paymentMethod: '微信支付',
    transactionId: '4200001234567891',
    remark: '发货款收齐'
  },

  // 收款明细
  paymentDetails: [
    { sequence: 1, amount: 10000.00, date: '2026-01-10', method: '银行转账' },
    { sequence: 2, amount: 4000.00, date: '2026-01-15', method: '支付宝' },
    { sequence: 3, amount: 346.40, date: '2026-01-20', method: '微信支付' }
  ],

  // 累计统计
  cumulativeTotal: {
    plannedAmount: 14346.40,
    paidAmount: 14346.40,
    remainingAmount: 0,
    paymentCount: 3,
    status: 'completed'
  }
}
```

**测试步骤**: (30步)

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 进入合同详情页 | - | `/contracts/${contractId}` | 显示合同详情 | URL正确 |
| 2 | 切换到收款计划 | - | `.el-tabs__item:has-text("收款计划")` | 显示收款计划 | 标签激活 |
| 3 | 查看发货款阶段 | - | `.stage-shipment` | 显示发货款 | 应收14346.40 |
| 4 | 点击登记收款 | - | `button:has-text("登记收款")` | 打开收款表单 | 表单显示 |
| 5 | **第一笔部分收款** | - | - | - | - |
| 6 | 验证应收金额 | - | `input[name="paymentAmount"]` | 显示14346.40 | 金额正确 |
| 7 | 输入实际收款金额 | 10000.00 | `input[name="actualAmount"]` | 填写成功 | 金额显示 |
| 8 | 验证金额差异提示 | - | `.amount-difference` | 显示差异提示 | "差额4346.40" |
| 9 | 选择收款日期 | 2026-01-10 | `.el-date-picker` | 日期已选择 | 日期正确 |
| 10 | 选择付款方式 | 银行转账 | `.el-select` | 方式已选择 | 显示方式 |
| 11 | 填写交易流水号 | TXN202601100001 | `input[name="transactionNo"]` | 填写成功 | 流水号显示 |
| 12 | 填写备注 | 首笔发货款 | `textarea` | 填写成功 | 文本域有值 |
| 13 | 点击保存 | - | `button:has-text("保存")` | 提交表单 | 加载中 |
| 14 | 验证保存成功 | - | `.el-message--success` | 显示成功提示 | "部分收款登记成功" |
| 15 | 验证阶段状态 | - | `.stage-shipment .status` | 显示"部分付款" | 橙色标签 |
| 16 | 验证已收金额 | - | `.stage-shipment .paid-amount` | 显示10000.00 | 金额正确 |
| 17 | 验证剩余金额 | - | `.stage-shipment .remaining-amount` | 显示4346.40 | 金额正确 |
| 18 | **第二笔部分收款** | - | - | - | - |
| 19 | 点击继续收款 | - | `button:has-text("继续收款")` | 打开收款表单 | 表单显示 |
| 20 | 验证剩余金额 | - | `input[name="paymentAmount"]` | 显示4346.40 | 剩余金额正确 |
| 21 | 输入实际收款金额 | 4000.00 | `input[name="actualAmount"]` | 填写成功 | 金额显示 |
| 22 | 验证新差额 | - | `.amount-difference` | 显示差异提示 | "差额346.40" |
| 23 | 选择付款方式 | 支付宝 | `.el-select` | 方式已选择 | 显示方式 |
| 24 | 点击保存 | - | `button:has-text("保存")` | 提交表单 | 加载中 |
| 25 | **第三笔收尾款** | - | - | - | - |
| 26 | 点击继续收款 | - | `button:has-text("继续收款")` | 打开收款表单 | 表单显示 |
| 27 | 输入尾款金额 | 346.40 | `input[name="actualAmount"]` | 填写成功 | 金额显示 |
| 28 | 验证金额一致 | - | `.amount-check` | 显示"金额一致" | 绿色提示 |
| 29 | 选择付款方式 | 微信支付 | `.el-select` | 方式已选择 | 显示方式 |
| 30 | 点击保存并验证 | - | `button:has-text("保存")` | 阶段状态变为"已付清" | 绿色标签 |

---

## 测试场景7.5: 收款对账与自动更新（PAY-005）

**前置条件**:
- 已创建多笔收款记录
- 银行对账单已准备

**测试数据**:
```javascript
const reconciliationData = {
  // 系统收款记录
  systemRecords: [
    {
      paymentNo: 'PAY202512260001',
      transactionNo: 'TXN202512260001',
      amount: 10759.80,
      paymentDate: '2025-12-26',
      status: 'confirmed'
    },
    {
      paymentNo: 'PAY202601100001',
      transactionNo: 'TXN202601100001',
      amount: 10000.00,
      paymentDate: '2026-01-10',
      status: 'unconfirmed'
    },
    {
      paymentNo: 'PAY202601150001',
      transactionNo: null,
      amount: 4000.00,
      paymentDate: '2026-01-15',
      status: 'unconfirmed'
    }
  ],

  // 银行对账单（导入文件）
  bankStatement: [
    {
      transactionNo: 'TXN202512260001',
      amount: 10759.80,
      transactionDate: '2025-12-26 09:30:00',
      payerAccount: '6217********1234',
      status: 'success'
    },
    {
      transactionNo: 'TXN202601100001',
      amount: 10000.00,
      transactionDate: '2026-01-10 14:15:00',
      payerAccount: '6217********1234',
      status: 'success'
    },
    {
      transactionNo: 'TXN202601150002', // 系统中未登记
      amount: 5000.00,
      transactionDate: '2026-01-15 10:20:00',
      payerAccount: '6217********5678',
      status: 'success'
    }
  ],

  // 对账结果
  reconciliationResult: {
    matchedCount: 2,
    unmatchedSystemCount: 1,
    unmatchedBankCount: 1,
    totalDifference: 5000.00,

    matched: [
      { paymentNo: 'PAY202512260001', transactionNo: 'TXN202512260001', amount: 10759.80 },
      { paymentNo: 'PAY202601100001', transactionNo: 'TXN202601100001', amount: 10000.00 }
    ],

    unmatchedSystem: [
      { paymentNo: 'PAY202601150001', amount: 4000.00, reason: '未找到对应银行流水' }
    ],

    unmatchedBank: [
      { transactionNo: 'TXN202601150002', amount: 5000.00, reason: '系统中未登记' }
    ]
  }
}
```

**测试步骤**: (26步)

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 进入收款管理页面 | - | `/payments` | 显示收款列表 | URL正确 |
| 2 | 点击对账管理 | - | `button:has-text("对账管理")` | 进入对账页面 | 页面切换 |
| 3 | 选择对账日期范围 | 2025-12至2026-01 | `.el-date-picker[type="daterange"]` | 日期已选择 | 日期范围显示 |
| 4 | 查看系统记录 | - | `.system-records-table` | 显示3条记录 | 表格显示 |
| 5 | 验证未对账记录 | - | `.status-unconfirmed` | 显示2条未对账 | 橙色标记 |
| 6 | 点击导入银行对账单 | - | `button:has-text("导入对账单")` | 打开上传对话框 | 对话框显示 |
| 7 | 下载模板 | - | `button:has-text("下载模板")` | 下载Excel模板 | 文件下载 |
| 8 | 选择对账单文件 | - | `input[type="file"]` | 文件已选择 | 文件名显示 |
| 9 | 点击上传 | - | `button:has-text("上传")` | 开始上传 | 进度条显示 |
| 10 | 验证上传成功 | - | `.el-message--success` | 显示成功提示 | "文件上传成功" |
| 11 | 点击开始对账 | - | `button:has-text("开始对账")` | 执行对账 | 加载中 |
| 12 | 查看对账结果 | - | `.reconciliation-result` | 显示对账结果 | 结果面板显示 |
| 13 | 验证匹配数量 | - | `.matched-count` | 显示2条匹配 | 绿色数字 |
| 14 | 验证未匹配系统记录 | - | `.unmatched-system-count` | 显示1条未匹配 | 橙色数字 |
| 15 | 验证未匹配银行记录 | - | `.unmatched-bank-count` | 显示1条未匹配 | 红色数字 |
| 16 | 查看匹配详情 | - | `.matched-list` | 显示2条匹配记录 | 列表显示 |
| 17 | 验证第1条匹配 | - | `.matched-item-1` | PAY202512260001匹配 | 绿色图标 |
| 18 | 验证第2条匹配 | - | `.matched-item-2` | PAY202601100001匹配 | 绿色图标 |
| 19 | 查看未匹配系统记录 | - | `.unmatched-system-list` | 显示1条记录 | PAY202601150001 |
| 20 | 查看未匹配原因 | - | `.unmatched-reason` | 显示原因 | "未找到对应银行流水" |
| 21 | 查看未匹配银行记录 | - | `.unmatched-bank-list` | 显示1条记录 | TXN202601150002 |
| 22 | 点击补录收款记录 | - | `button:has-text("补录")` | 打开收款表单 | 表单显示 |
| 23 | 自动填充银行信息 | - | - | 银行信息自动填充 | 流水号、金额自动填充 |
| 24 | 关联合同 | - | `.contract-selector` | 选择合同 | 合同已选择 |
| 25 | 保存补录记录 | - | `button:has-text("保存")` | 保存成功 | 成功提示 |
| 26 | 确认对账结果 | - | `button:has-text("确认对账")` | 更新收款状态 | 状态更新为已确认 |

---

## 测试场景7.6: 应收账款统计（PAY-006）

**前置条件**:
- 系统中存在多个合同和收款记录
- 涵盖不同客户、不同时间段

**测试数据**:
```javascript
const receivablesStatisticsData = {
  dateRange: {
    start: '2025-01-01',
    end: '2025-12-31'
  },

  // 整体统计
  overall: {
    totalContracts: 120,
    totalContractAmount: 7200000.00,
    totalReceivables: 7200000.00,
    totalReceived: 5100000.00,
    totalRemaining: 2100000.00,
    collectionRate: 70.83,

    onTimePayments: 85,
    overduePayments: 15,
    onTimeRate: 85.00
  },

  // 按客户统计
  byCustomer: [
    {
      customerId: 1,
      customerName: '测试酒店有限公司',
      contractCount: 3,
      totalAmount: 180000.00,
      receivedAmount: 150000.00,
      remainingAmount: 30000.00,
      collectionRate: 83.33
    },
    {
      customerId: 2,
      customerName: 'XX连锁酒店集团',
      contractCount: 5,
      totalAmount: 500000.00,
      receivedAmount: 350000.00,
      remainingAmount: 150000.00,
      collectionRate: 70.00
    }
  ],

  // 按时间统计（月度）
  byMonth: [
    { month: '2025-01', receivables: 680000, received: 520000, remaining: 160000 },
    { month: '2025-02', receivables: 720000, received: 580000, remaining: 140000 },
    { month: '2025-03', receivables: 850000, received: 720000, remaining: 130000 }
  ],

  // 账龄分析
  agingAnalysis: [
    { ageRange: '未到期', amount: 800000, percentage: 38.10 },
    { ageRange: '0-30天', amount: 600000, percentage: 28.57 },
    { ageRange: '31-60天', amount: 400000, percentage: 19.05 },
    { ageRange: '61-90天', amount: 200000, percentage: 9.52 },
    { ageRange: '90天以上', amount: 100000, percentage: 4.76 }
  ],

  // TOP逾期客户
  overdueCustomers: [
    {
      rank: 1,
      customerName: 'YY大酒店',
      overdueAmount: 80000,
      overdueDays: 45,
      contactPerson: '陈经理',
      phone: '13800138001'
    },
    {
      rank: 2,
      customerName: 'ZZ度假村',
      overdueAmount: 50000,
      overdueDays: 30,
      contactPerson: '林总',
      phone: '13800138002'
    }
  ]
}
```

**测试步骤**: (24步)

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 进入应收账款统计页 | - | `/payments/statistics` | 显示统计页面 | URL正确 |
| 2 | 选择统计时间范围 | 2025年 | `.el-date-picker[type="daterange"]` | 日期已选择 | 日期范围显示 |
| 3 | 查看整体统计卡片 | - | `.overall-statistics` | 显示整体数据 | 卡片显示 |
| 4 | 验证合同总额 | - | `.total-contract-amount` | 显示7200000.00 | 金额正确 |
| 5 | 验证已收金额 | - | `.total-received` | 显示5100000.00 | 金额正确 |
| 6 | 验证待收金额 | - | `.total-remaining` | 显示2100000.00 | 金额正确 |
| 7 | 验证回款率 | - | `.collection-rate` | 显示70.83% | 百分比正确 |
| 8 | 查看回款趋势图 | - | `.collection-trend-chart` | 显示折线图 | 图表显示 |
| 9 | 切换到按客户统计 | - | `.el-tabs__item:has-text("按客户")` | 显示客户统计 | 标签激活 |
| 10 | 查看客户排行表 | - | `.customer-ranking-table` | 显示客户列表 | 表格显示 |
| 11 | 验证客户1数据 | - | `.customer-1` | 显示测试酒店 | 数据正确 |
| 12 | 验证客户1回款率 | - | `.customer-1 .collection-rate` | 显示83.33% | 百分比正确 |
| 13 | 点击查看客户详情 | - | `.customer-1 button:has-text("详情")` | 打开详情对话框 | 对话框显示 |
| 14 | 查看客户收款明细 | - | `.customer-payment-details` | 显示收款列表 | 明细显示 |
| 15 | 切换到账龄分析 | - | `.el-tabs__item:has-text("账龄分析")` | 显示账龄分析 | 标签激活 |
| 16 | 查看账龄分布饼图 | - | `.aging-pie-chart` | 显示饼图 | 图表显示 |
| 17 | 验证未到期金额 | - | `.aging-未到期` | 显示800000 | 金额正确 |
| 18 | 验证未到期占比 | - | `.aging-未到期 .percentage` | 显示38.10% | 占比正确 |
| 19 | 验证逾期总额 | - | `.total-overdue` | 显示700000 | 金额正确 |
| 20 | 切换到逾期客户 | - | `.el-tabs__item:has-text("逾期客户")` | 显示逾期列表 | 标签激活 |
| 21 | 查看逾期排行榜 | - | `.overdue-ranking-table` | 显示逾期客户 | 表格显示 |
| 22 | 验证TOP1逾期客户 | - | `.rank-1` | 显示YY大酒店 | 数据正确 |
| 23 | 验证逾期天数 | - | `.rank-1 .overdue-days` | 显示45天 | 天数正确 |
| 24 | 导出统计报表 | - | `button:has-text("导出报表")` | 下载Excel | 文件下载 |

---

## 测试场景7.7: 逾期收款提醒（PAY-007）

**前置条件**:
- 系统中存在逾期未收款项
- 提醒功能已启用

**测试数据**:
```javascript
const overdueReminderData = {
  // 逾期收款记录
  overduePayments: [
    {
      paymentId: 1,
      contractNo: 'CT202511150001',
      customerName: 'YY大酒店',
      paymentStage: '发货款',
      plannedAmount: 80000.00,
      dueDate: '2025-11-30',
      overdueDays: 27,
      salesOwner: '李明',
      contactPerson: '陈经理',
      phone: '13800138001',
      reminderCount: 2,
      lastReminderDate: '2025-12-20'
    },
    {
      paymentId: 2,
      contractNo: 'CT202511200001',
      customerName: 'ZZ度假村',
      paymentStage: '尾款',
      plannedAmount: 50000.00,
      dueDate: '2025-11-25',
      overdueDays: 32,
      salesOwner: '王芳',
      contactPerson: '林总',
      phone: '13800138002',
      reminderCount: 3,
      lastReminderDate: '2025-12-18'
    }
  ],

  // 提醒配置
  reminderConfig: {
    enableAutoReminder: true,
    reminderIntervalDays: 7,
    reminderChannels: ['system', 'email', 'sms'],
    escalationEnabled: true,
    escalationDays: 30,
    escalationRecipients: ['销售经理', '财务总监']
  },

  // 提醒模板
  reminderTemplate: {
    title: '收款逾期提醒',
    content: `尊敬的{{customerName}}：

您的合同{{contractNo}}中{{paymentStage}}已逾期{{overdueDays}}天，
应收金额：{{plannedAmount}}元，
到期日期：{{dueDate}}

请尽快安排付款，如有疑问请联系：
{{salesOwner}} {{salesPhone}}

艾居来CRM系统自动提醒
{{reminderDate}}`
  }
}
```

**测试步骤**: (22步)

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 进入收款管理页面 | - | `/payments` | 显示收款列表 | URL正确 |
| 2 | 切换到逾期提醒 | - | `.el-tabs__item:has-text("逾期提醒")` | 显示逾期列表 | 标签激活 |
| 3 | 查看逾期统计 | - | `.overdue-statistics` | 显示统计卡片 | 2条逾期 |
| 4 | 验证逾期总额 | - | `.total-overdue-amount` | 显示130000.00 | 金额正确 |
| 5 | 查看逾期列表 | - | `.overdue-list-table` | 显示2条记录 | 表格显示 |
| 6 | 验证逾期天数排序 | - | `th:has-text("逾期天数")` | 按天数倒序 | 32天在首行 |
| 7 | 查看第1条逾期记录 | - | `.overdue-item-1` | 显示ZZ度假村 | 数据正确 |
| 8 | 验证逾期32天 | - | `.overdue-item-1 .overdue-days` | 显示32天 | 红色高亮 |
| 9 | 验证已提醒3次 | - | `.overdue-item-1 .reminder-count` | 显示3次 | 次数正确 |
| 10 | 点击发送提醒 | - | `.overdue-item-1 button:has-text("发送提醒")` | 打开提醒对话框 | 对话框显示 |
| 11 | 查看提醒模板 | - | `.reminder-template` | 显示提醒内容 | 模板显示 |
| 12 | 验证模板变量替换 | - | `.reminder-preview` | 显示替换后内容 | 变量已替换 |
| 13 | 选择提醒渠道 | 邮件+短信 | `.reminder-channels` | 渠道已选择 | 复选框选中 |
| 14 | 验证收件人 | - | `.recipients` | 显示林总 | 联系人正确 |
| 15 | 点击发送 | - | `button:has-text("发送")` | 发送提醒 | 加载中 |
| 16 | 验证发送成功 | - | `.el-message--success` | 显示成功提示 | "提醒已发送" |
| 17 | 验证提醒次数更新 | - | `.overdue-item-1 .reminder-count` | 显示4次 | 次数+1 |
| 18 | 查看提醒历史 | - | `button:has-text("提醒历史")` | 打开历史面板 | 面板显示 |
| 19 | 验证历史记录 | - | `.reminder-history-list` | 显示4条记录 | 列表显示 |
| 20 | 配置自动提醒 | - | `button:has-text("提醒设置")` | 打开设置对话框 | 对话框显示 |
| 21 | 启用自动提醒 | - | `input[type="checkbox"][name="enableAutoReminder"]` | 复选框选中 | 已启用 |
| 22 | 设置提醒间隔 | 7天 | `input[name="reminderIntervalDays"]` | 填写成功 | 值为7 |

---

## 测试场景7.8: 收款记录查询与导出（PAY-008）

**前置条件**:
- 系统中存在多条收款记录
- 涵盖不同合同、客户、付款方式

**测试数据**:
```javascript
const paymentQueryData = {
  // 查询条件
  searchCriteria: {
    keyword: '测试酒店',
    paymentNo: 'PAY202512260001',
    contractNo: 'CT202512260001',
    customerName: '测试酒店',
    paymentMethod: '银行转账',
    dateRange: {
      start: '2025-12-01',
      end: '2025-12-31'
    },
    amountRange: {
      min: 5000,
      max: 20000
    },
    paymentStage: '签约款',
    status: 'confirmed',
    collectorId: 1
  },

  // 查询结果
  searchResults: [
    {
      paymentNo: 'PAY202512260001',
      contractNo: 'CT202512260001',
      customerName: '测试酒店有限公司',
      paymentStage: '签约款',
      paymentAmount: 10759.80,
      actualAmount: 10759.80,
      paymentDate: '2025-12-26',
      paymentMethod: '银行转账',
      transactionNo: 'TXN202512260001',
      status: 'confirmed',
      collectorName: '李会计'
    }
  ],

  // 导出配置
  exportConfig: {
    exportFormat: 'excel',
    exportFields: [
      '收款编号',
      '合同编号',
      '客户名称',
      '收款阶段',
      '应收金额',
      '实收金额',
      '收款日期',
      '付款方式',
      '交易流水号',
      '收款状态',
      '收款人'
    ],
    fileName: '收款记录_2025年12月.xlsx'
  }
}
```

**测试步骤**: (20步)

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 进入收款管理页面 | - | `/payments` | 显示收款列表 | URL正确 |
| 2 | 查看所有收款记录 | - | `table` | 显示收款列表 | 数据显示 |
| 3 | 输入关键词搜索 | 测试酒店 | `input[placeholder*="搜索"]` | 输入成功 | 输入框有值 |
| 4 | 点击搜索 | - | `button:has-text("搜索")` | 执行搜索 | 列表更新 |
| 5 | 验证搜索结果 | - | `table` | 显示匹配结果 | 找到记录 |
| 6 | 选择付款方式筛选 | 银行转账 | `.el-select[placeholder*="付款方式"]` | 方式已选择 | 显示"银行转账" |
| 7 | 选择日期范围 | 2025-12 | `.el-date-picker[type="daterange"]` | 日期已选择 | 日期范围显示 |
| 8 | 输入金额范围 | 5000-20000 | `.amount-range input` | 填写成功 | 输入框有值 |
| 9 | 选择收款阶段 | 签约款 | `.el-select[placeholder*="阶段"]` | 阶段已选择 | 显示阶段 |
| 10 | 选择收款状态 | 已确认 | `.el-select[placeholder*="状态"]` | 状态已选择 | 显示状态 |
| 11 | 点击高级搜索 | - | `button:has-text("高级搜索")` | 展开高级选项 | 更多条件显示 |
| 12 | 输入合同编号 | CT202512260001 | `input[name="contractNo"]` | 填写成功 | 编号显示 |
| 13 | 选择收款人 | 李会计 | `.el-select[placeholder*="收款人"]` | 收款人已选择 | 显示名称 |
| 14 | 点击应用筛选 | - | `button:has-text("应用")` | 执行筛选 | 列表更新 |
| 15 | 验证筛选结果数量 | - | `.result-count` | 显示结果数 | "共找到X条" |
| 16 | 点击重置筛选 | - | `button:has-text("重置")` | 清空条件 | 显示所有记录 |
| 17 | 点击导出数据 | - | `button:has-text("导出")` | 打开导出对话框 | 对话框显示 |
| 18 | 选择导出格式 | Excel | `.el-radio[label="excel"]` | 格式已选择 | 单选按钮选中 |
| 19 | 选择导出字段 | 全部字段 | `.export-fields` | 字段已选择 | 复选框全选 |
| 20 | 确认导出 | - | `button:has-text("导出")` | 下载文件 | Excel文件下载 |

---

## 收款管理模块测试总结

### 已完成场景统计

| 场景编号 | 需求编号 | 场景名称 | 步骤数 | 优先级 | 状态 |
|---------|---------|---------|-------|-------|------|
| 7.1 | PAY-001 | 创建收款记录 | 22 | P0 | ✅ 已完成 |
| 7.2 | PAY-002 | 多种付款方式管理 | 28 | P0 | ✅ 已完成 |
| 7.3 | PAY-003 | 分期付款跟踪 | 25 | P0 | ✅ 已完成 |
| 7.4 | PAY-004 | 部分收款支持 | 30 | P0 | ✅ 已完成 |
| 7.5 | PAY-005 | 收款对账与自动更新 | 26 | P0 | ✅ 已完成 |
| 7.6 | PAY-006 | 应收账款统计 | 24 | P0 | ✅ 已完成 |
| 7.7 | PAY-007 | 逾期收款提醒 | 22 | P0 | ✅ 已完成 |
| 7.8 | PAY-008 | 收款记录查询与导出 | 20 | P0 | ✅ 已完成 |

**总计**: 8个场景，197个测试步骤

### API端点清单

```
POST   /api/payments                      - 创建收款记录
GET    /api/payments                      - 查询收款列表
GET    /api/payments/:id                  - 获取收款详情
PATCH  /api/payments/:id                  - 更新收款记录
DELETE /api/payments/:id                  - 删除收款记录
GET    /api/payments/contract/:contractId - 按合同查询收款
POST   /api/payments/reconciliation       - 导入对账单
POST   /api/payments/reconciliation/match - 执行对账
GET    /api/payments/statistics           - 应收账款统计
GET    /api/payments/overdue              - 逾期收款列表
POST   /api/payments/reminder             - 发送逾期提醒
GET    /api/payments/export               - 导出收款记录
GET    /api/contracts/:id/execution       - 获取合同执行进度（含回款）
```

### 数据模型关键字段

```javascript
Payment {
  payment_id: BIGINT,
  payment_no: VARCHAR(32),      // 收款编号
  contract_id: BIGINT,           // 关联合同
  payment_stage: VARCHAR(50),    // 收款阶段
  payment_amount: DECIMAL(15,2), // 应收金额
  actual_amount: DECIMAL(15,2),  // 实收金额
  payment_date: DATE,            // 收款日期
  payment_method: VARCHAR(50),   // 付款方式
  transaction_no: VARCHAR(100),  // 交易流水号
  status: VARCHAR(20),           // 收款状态
  collector_id: BIGINT,          // 收款人ID
  remark: TEXT,                  // 备注
  created_at: DATETIME,
  updated_at: DATETIME
}
```

### 业务规则

1. **收款编号规则**: PAY + YYYYMMDD + 流水号(3位)
2. **付款方式**: 银行转账、支付宝、微信支付、现金、支票
3. **收款状态**:
   - pending: 待确认
   - confirmed: 已确认
   - cancelled: 已取消
4. **部分收款**: 支持同一阶段多次部分收款，累计金额达到应收金额即完成
5. **自动更新**:
   - 收款记录确认后自动更新合同回款进度
   - 合同回款进度 = 已收金额 / 合同总额 × 100%
6. **逾期判定**: 当前日期 > 计划收款日期 且 状态为待收款
7. **账龄计算**: 当前日期 - 计划收款日期

---

**文档状态**: ✅ 完成
**场景总数**: 8个
**测试步骤**: 197步
**下一模块**: 客户管理
