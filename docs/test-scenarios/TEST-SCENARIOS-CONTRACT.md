# 合同管理模块测试场景

**模块**: 合同管理 (CONTRACT)
**需求编号**: CONTRACT-002 至 CONTRACT-010
**场景数量**: 9个
**优先级**: P0 - 核心业务流程

---

## 测试场景6.2: 合同条款管理（CONTRACT-002）

**前置条件**:
- 已创建合同（场景6.1）
- 用户已登录

**测试数据**:
```javascript
const contractTermsData = {
  contractId: null,

  // 付款条款
  paymentTerms: [
    {
      stageName: '签约款',
      percentage: 30,
      amount: 10759.80,
      paymentMethod: '银行转账',
      dueDate: '2025-12-26',
      description: '合同签订后3日内支付'
    },
    {
      stageName: '发货款',
      percentage: 40,
      amount: 14346.40,
      paymentMethod: '银行转账',
      dueDate: '2025-12-31',
      description: '发货前支付'
    },
    {
      stageName: '尾款',
      percentage: 30,
      amount: 10759.80,
      paymentMethod: '银行转账',
      dueDate: '2026-01-31',
      description: '验收合格后支付'
    }
  ],
  totalAmount: 35866.00,

  // 交付条款
  deliveryTerms: {
    deliveryMethod: '物流配送',
    deliveryPeriod: '15个工作日',
    deliveryLocation: '广东省深圳市南山区科技园南区测试酒店',
    packagingRequirements: '木箱包装，防潮防震',
    acceptanceCriteria: '产品外观完好，功能测试正常',
    acceptancePeriod: '7个工作日'
  },

  // 质保条款
  warrantyTerms: {
    warrantyPeriod: '12个月',
    warrantyStartDate: '验收合格之日起',
    warrantyScope: '产品质量问题免费维修或更换',
    warrantyExclusions: '人为损坏、自然灾害等不在质保范围',
    maintenanceResponse: '市内4小时响应，市外24小时响应'
  },

  // 违约条款
  penaltyTerms: {
    supplierDelay: '每延迟1日支付合同金额0.5%违约金',
    buyerDelay: '每延迟1日支付应付款0.3%违约金',
    qualityIssue: '产品质量不合格按合同金额10%赔偿',
    cancellationPenalty: '单方违约解除合同需支付合同金额20%违约金'
  }
}
```

**测试步骤**:

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 进入合同详情页 | - | `/contracts/${contractId}` | 显示合同详情 | URL正确 |
| 2 | 切换到合同条款标签 | 点击标签 | `.el-tabs__item:has-text("合同条款")` | 显示条款面板 | 标签激活 |
| 3 | 点击编辑付款条款 | - | `button:has-text("编辑付款条款")` | 打开付款条款对话框 | 对话框显示 |
| 4 | 添加第一期付款 | 签约款30% | `.payment-stage-1` | 添加成功 | 显示签约款 |
| 5 | 填写付款比例 | 30 | `input[placeholder*="比例"]` | 填写成功 | 自动计算金额 |
| 6 | 验证付款金额 | - | `.stage-amount` | 显示金额 | 10759.80 |
| 7 | 选择付款方式 | 银行转账 | `.el-select[placeholder*="方式"]` | 选择成功 | 显示方式 |
| 8 | 选择付款时间 | 2025-12-26 | `.el-date-picker` | 日期选择成功 | 显示日期 |
| 9 | 填写付款说明 | 合同签订后3日内支付 | `textarea` | 填写成功 | 文本域有值 |
| 10 | 添加第二期付款 | 发货款40% | `button:has-text("添加阶段")` | 添加成功 | 显示发货款 |
| 11 | 填写第二期信息 | 同上 | - | 填写成功 | 信息完整 |
| 12 | 添加第三期付款 | 尾款30% | `button:has-text("添加阶段")` | 添加成功 | 显示尾款 |
| 13 | 填写第三期信息 | 同上 | - | 填写成功 | 信息完整 |
| 14 | 验证付款总额 | - | `.total-payment` | 显示总额 | 35866.00 |
| 15 | 验证比例总和 | - | `.total-percentage` | 显示100% | 比例正确 |
| 16 | 点击保存付款条款 | - | `button:has-text("保存")` | 提交条款 | 加载状态显示 |
| 17 | 编辑交付条款 | - | `button:has-text("编辑交付条款")` | 打开交付对话框 | 对话框显示 |
| 18 | 填写交付方式 | `deliveryTerms.deliveryMethod` | `input` | 填写成功 | 输入框有值 |
| 19 | 填写交付周期 | `deliveryTerms.deliveryPeriod` | `input` | 填写成功 | 输入框有值 |
| 20 | 填写交付地点 | `deliveryTerms.deliveryLocation` | `textarea` | 填写成功 | 文本域有值 |
| 21 | 填写包装要求 | `deliveryTerms.packagingRequirements` | `textarea` | 填写成功 | 文本域有值 |
| 22 | 填写验收标准 | `deliveryTerms.acceptanceCriteria` | `textarea` | 填写成功 | 文本域有值 |
| 23 | 填写验收期限 | `deliveryTerms.acceptancePeriod` | `input` | 填写成功 | 输入框有值 |
| 24 | 点击保存交付条款 | - | `button:has-text("保存")` | 提交条款 | 加载状态显示 |
| 25 | 编辑质保条款 | - | `button:has-text("编辑质保条款")` | 打开质保对话框 | 对话框显示 |
| 26 | 填写质保期限 | 12个月 | `input[placeholder*="期限"]` | 填写成功 | 输入框有值 |
| 27 | 填写质保起始 | 验收合格之日起 | `input` | 填写成功 | 输入框有值 |
| 28 | 填写质保范围 | `warrantyTerms.warrantyScope` | `textarea` | 填写成功 | 文本域有值 |
| 29 | 点击保存质保条款 | - | `button:has-text("保存")` | 提交条款 | 加载状态显示 |
| 30 | 编辑违约条款 | - | `button:has-text("编辑违约条款")` | 打开违约对话框 | 对话框显示 |
| 31 | 填写供方延迟违约金 | 0.5%/日 | `input` | 填写成功 | 输入框有值 |
| 32 | 填写需方延迟违约金 | 0.3%/日 | `input` | 填写成功 | 输入框有值 |
| 33 | 点击保存违约条款 | - | `button:has-text("保存")` | 提交条款 | 加载状态显示 |
| 34 | 验证所有条款 | - | `.contract-terms-summary` | 显示条款摘要 | 信息完整 |
| 35 | 截图条款页面 | - | - | 保存截图 | `contract-terms.png` |

**预期API响应**:
```json
{
  "success": true,
  "code": 200,
  "message": "合同条款保存成功",
  "data": {
    "contractId": 1,
    "paymentTerms": [...],
    "deliveryTerms": {...},
    "warrantyTerms": {...},
    "penaltyTerms": {...},
    "updatedAt": "2025-12-26T16:00:00.000Z"
  }
}
```

**截图要求**:
- `contract-payment-terms.png` - 付款条款编辑
- `contract-delivery-terms.png` - 交付条款编辑
- `contract-warranty-terms.png` - 质保条款编辑
- `contract-penalty-terms.png` - 违约条款编辑
- `contract-terms-complete.png` - 完整条款展示

---

## 测试场景6.3: 合同签订流程（CONTRACT-003）

**前置条件**:
- 已创建合同并完善条款（场景6.2）
- 合同状态为"草稿"

**测试数据**:
```javascript
const contractSigningData = {
  contractId: null,

  // 我方签署信息
  ourSignature: {
    signerName: '艾居来科技有限公司',
    signerRepresentative: '法定代表人-李总',
    signerId: 1,
    signerPosition: '总经理',
    signDate: '2025-12-26',
    signLocation: '深圳',
    companyStamp: true, // 是否盖章
    stampImage: '/uploads/stamps/company-stamp.jpg'
  },

  // 客户签署信息
  customerSignature: {
    signerName: '测试酒店有限公司',
    signerRepresentative: '法定代表人-张经理',
    signerPosition: '总经理',
    signDate: '2025-12-26',
    signLocation: '深圳',
    companyStamp: true,
    stampImage: '/uploads/stamps/customer-stamp.jpg',
    signature: '/uploads/signatures/zhang-signature.jpg'
  },

  // 合同编号确认
  finalContractNo: 'CT202512260001',

  // 生效日期
  effectiveDate: '2025-12-26',

  // 合同文件
  contractPDF: '/uploads/contracts/CT202512260001.pdf'
}
```

**测试步骤**:

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 进入合同详情页 | - | `/contracts/${contractId}` | 显示合同详情 | URL正确 |
| 2 | 验证合同状态 | - | `.contract-status` | 状态为"草稿" | 灰色标签 |
| 3 | 点击发起签署 | - | `button:has-text("发起签署")` | 打开签署流程对话框 | 对话框显示 |
| 4 | 查看合同预览 | - | `.contract-preview` | 显示合同PDF预览 | PDF显示 |
| 5 | 填写我方签署人 | `ourSignature.signerRepresentative` | `input[placeholder*="签署人"]` | 填写成功 | 输入框有值 |
| 6 | 选择签署人职位 | `ourSignature.signerPosition` | `.el-select` | 选择成功 | 显示职位 |
| 7 | 选择签署日期 | `ourSignature.signDate` | `.el-date-picker` | 日期选择成功 | 显示日期 |
| 8 | 选择签署地点 | `ourSignature.signLocation` | `input` | 填写成功 | 输入框有值 |
| 9 | 上传公司印章 | 选择印章图片 | `input[type="file"]` | 上传成功 | 显示印章预览 |
| 10 | 勾选盖章确认 | - | `input[type="checkbox"]` | 勾选成功 | 复选框选中 |
| 11 | 填写客户签署人 | `customerSignature.signerRepresentative` | `input` | 填写成功 | 输入框有值 |
| 12 | 选择客户签署日期 | `customerSignature.signDate` | `.el-date-picker` | 日期选择成功 | 显示日期 |
| 13 | 上传客户签名 | 选择签名图片 | `input[type="file"]` | 上传成功 | 显示签名预览 |
| 14 | 上传客户印章 | 选择印章图片 | `input[type="file"]` | 上传成功 | 显示印章预览 |
| 15 | 确认合同编号 | - | `.contract-no-display` | 显示合同编号 | CT202512260001 |
| 16 | 设置生效日期 | `effectiveDate` | `.el-date-picker` | 日期设置成功 | 显示日期 |
| 17 | 预览签署后合同 | - | `button:has-text("预览")` | 显示最终合同 | PDF含签章 |
| 18 | 截图签署信息 | - | - | 保存截图 | `contract-signing-info.png` |
| 19 | 点击确认签署 | - | `button:has-text("确认签署")` | 提交签署 | 加载状态显示 |
| 20 | 验证成功消息 | - | `.el-message--success` | 显示成功提示 | 提示"签署成功" |
| 21 | 验证状态更新 | - | `.contract-status` | 状态为"已签署" | 绿色标签 |
| 22 | 验证生效日期 | - | `.effective-date` | 显示生效日期 | 2025-12-26 |
| 23 | 下载签署合同 | - | `button:has-text("下载合同")` | 下载PDF文件 | 文件下载 |
| 24 | 验证合同文件 | - | - | PDF包含双方签章 | 签章完整 |

**预期API响应**:
```json
{
  "success": true,
  "code": 200,
  "message": "合同签署成功",
  "data": {
    "contractId": 1,
    "contractNo": "CT202512260001",
    "status": "signed",
    "effectiveDate": "2025-12-26",
    "ourSignature": {...},
    "customerSignature": {...},
    "contractPDF": "/uploads/contracts/CT202512260001.pdf",
    "signedAt": "2025-12-26T16:30:00.000Z"
  }
}
```

**截图要求**:
- `contract-signing-dialog.png` - 签署对话框
- `contract-our-signature.png` - 我方签署信息
- `contract-customer-signature.png` - 客户签署信息
- `contract-signed-preview.png` - 签署后合同预览
- `contract-signed-status.png` - 已签署状态

---

## 测试场景6.4: 合同变更管理-补充协议（CONTRACT-004）

**前置条件**:
- 已签署合同（场景6.3）
- 需要变更合同内容

**测试数据**:
```javascript
const contractAmendmentData = {
  contractId: null,
  amendmentNo: null, // 自动生成
  amendmentType: 'price_adjustment', // price_adjustment/quantity_change/delivery_change/other

  amendmentReason: '客户追加订单，新增50台智能门锁A1',

  // 变更内容
  changes: {
    original: {
      totalQuantity: 100,
      totalAmount: 35866.00,
      deliveryDate: '2025-12-31'
    },
    amended: {
      totalQuantity: 150,
      addedQuantity: 50,
      addedAmount: 17933.00,
      newTotalAmount: 53799.00,
      deliveryDate: '2026-01-15'
    }
  },

  // 新增明细
  newItems: [
    {
      productId: 1,
      productName: '智能门锁A1',
      quantity: 50,
      unitPrice: 299.00,
      discountRate: 0.95,
      subtotal: 14202.50,
      taxRate: 0.13,
      taxAmount: 1846.33,
      total: 16048.83
    }
  ],

  // 补充协议签署
  amendmentSignDate: '2025-12-28',
  amendmentEffectiveDate: '2025-12-28',

  remark: '补充协议与原合同具有同等法律效力'
}
```

**测试步骤**:

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 进入合同详情页 | - | `/contracts/${contractId}` | 显示合同详情 | URL正确 |
| 2 | 切换到变更记录标签 | 点击标签 | `.el-tabs__item:has-text("变更记录")` | 显示变更面板 | 标签激活 |
| 3 | 点击新建补充协议 | - | `button:has-text("新建补充协议")` | 打开协议对话框 | 对话框显示 |
| 4 | 选择变更类型 | `amendmentType` | `.el-select[placeholder*="类型"]` | 选择"数量变更" | 类型已选择 |
| 5 | 填写变更原因 | `amendmentReason` | `textarea[placeholder*="原因"]` | 填写成功 | 文本域有内容 |
| 6 | 查看原合同信息 | - | `.original-contract-info` | 显示原合同摘要 | 信息显示 |
| 7 | 验证原合同数量 | - | `.original-quantity` | 显示100台 | 数字正确 |
| 8 | 验证原合同金额 | - | `.original-amount` | 显示35866.00 | 金额正确 |
| 9 | 点击添加产品明细 | - | `button:has-text("添加明细")` | 打开明细对话框 | 对话框显示 |
| 10 | 选择产品 | 智能门锁A1 | `.el-select[placeholder*="产品"]` | 产品已选择 | 显示产品名 |
| 11 | 填写新增数量 | 50 | `input[placeholder*="数量"]` | 填写成功 | 输入框有值 |
| 12 | 验证单价 | - | `.unit-price` | 显示299.00 | 价格正确 |
| 13 | 验证折扣率 | - | `.discount-rate` | 显示0.95 | 折扣正确 |
| 14 | 验证小计 | - | `.subtotal` | 显示14202.50 | 金额正确 |
| 15 | 点击添加明细 | - | `button:has-text("确定")` | 添加成功 | 明细显示 |
| 16 | 验证新增金额 | - | `.added-amount` | 显示17933.00 | 金额正确 |
| 17 | 验证合同新总额 | - | `.new-total-amount` | 显示53799.00 | 金额正确 |
| 18 | 填写变更后交付日期 | `changes.amended.deliveryDate` | `.el-date-picker` | 日期选择成功 | 显示日期 |
| 19 | 填写补充协议备注 | `remark` | `textarea` | 填写成功 | 文本域有值 |
| 20 | 预览补充协议 | - | `button:has-text("预览")` | 显示协议PDF | PDF显示 |
| 21 | 截图补充协议 | - | - | 保存截图 | `amendment-preview.png` |
| 22 | 点击保存协议 | - | `button:has-text("保存")` | 提交协议 | 加载状态显示 |
| 23 | 验证成功消息 | - | `.el-message--success` | 显示成功提示 | 提示"补充协议已创建" |
| 24 | 验证协议列表 | - | `.amendment-list` | 协议出现在列表 | 找到新协议 |
| 25 | 点击签署补充协议 | - | `button:has-text("签署协议")` | 打开签署对话框 | 对话框显示 |
| 26 | 填写签署日期 | `amendmentSignDate` | `.el-date-picker` | 日期选择成功 | 显示日期 |
| 27 | 上传双方签章 | 选择文件 | `input[type="file"]` | 上传成功 | 文件上传 |
| 28 | 点击确认签署 | - | `button:has-text("确认")` | 签署成功 | 状态更新 |
| 29 | 验证协议状态 | - | `.amendment-status` | 状态为"已生效" | 绿色标签 |
| 30 | 验证合同金额更新 | - | `.contract-total-amount` | 更新为53799.00 | 金额已更新 |
| 31 | 验证合同数量更新 | - | `.contract-total-quantity` | 更新为150台 | 数量已更新 |
| 32 | 下载补充协议 | - | `button:has-text("下载")` | 下载PDF | 文件下载 |

**预期API响应**:
```json
{
  "success": true,
  "code": 201,
  "message": "补充协议创建成功",
  "data": {
    "amendmentId": 1,
    "amendmentNo": "AMD202512280001",
    "contractId": 1,
    "amendmentType": "quantity_change",
    "changes": {...},
    "status": "signed",
    "signedAt": "2025-12-28T10:00:00.000Z",
    "contractUpdate": {
      "totalAmount": "53799.00",
      "totalQuantity": 150,
      "updatedAt": "2025-12-28T10:00:00.000Z"
    }
  }
}
```

**截图要求**:
- `amendment-create-dialog.png` - 创建补充协议对话框
- `amendment-changes-comparison.png` - 变更内容对比
- `amendment-preview.png` - 补充协议预览
- `amendment-signed.png` - 已签署补充协议
- `contract-updated-amount.png` - 合同金额更新

---

## 测试场景6.5: 合同执行跟踪（CONTRACT-005）

**前置条件**:
- 已签署合同（场景6.3）
- 已有发货和回款记录

**测试数据**:
```javascript
const contractExecutionData = {
  contractId: null,
  contractNo: 'CT202512260001',

  // 执行进度统计
  executionProgress: {
    // 发货进度
    shipment: {
      totalQuantity: 150,
      shippedQuantity: 100,
      remainingQuantity: 50,
      completionRate: 66.67,
      shipments: [
        {
          shipmentNo: 'SH202512270001',
          shipmentDate: '2025-12-27',
          quantity: 50,
          status: 'delivered'
        },
        {
          shipmentNo: 'SH202601150001',
          shipmentDate: '2026-01-15',
          quantity: 50,
          status: 'shipped'
        }
      ]
    },

    // 回款进度
    payment: {
      totalAmount: 53799.00,
      receivedAmount: 26899.50,
      remainingAmount: 26899.50,
      completionRate: 50.00,
      payments: [
        {
          paymentNo: 'PAY202512260001',
          paymentStage: '签约款',
          paymentAmount: 16139.70,
          paymentDate: '2025-12-26',
          status: 'confirmed'
        },
        {
          paymentNo: 'PAY202512310001',
          paymentStage: '发货款',
          paymentAmount: 10759.80,
          paymentDate: '2025-12-31',
          status: 'confirmed'
        }
      ]
    },

    // 发票进度
    invoice: {
      totalAmount: 53799.00,
      invoicedAmount: 26899.50,
      remainingAmount: 26899.50,
      completionRate: 50.00,
      invoices: [
        {
          invoiceNo: 'INV202512280001',
          invoiceAmount: 16139.70,
          invoiceDate: '2025-12-28',
          status: 'issued'
        }
      ]
    },

    // 整体执行状态
    overallStatus: 'in_progress' // not_started/in_progress/completed
  }
}
```

**测试步骤**:

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 进入合同详情页 | - | `/contracts/${contractId}` | 显示合同详情 | URL正确 |
| 2 | 切换到执行跟踪标签 | 点击标签 | `.el-tabs__item:has-text("执行跟踪")` | 显示跟踪面板 | 标签激活 |
| 3 | 查看执行概况 | - | `.execution-summary` | 显示执行摘要 | 摘要显示 |
| 4 | 查看发货进度条 | - | `.shipment-progress-bar` | 显示进度条 | 67%进度 |
| 5 | 查看发货统计 | - | `.shipment-stats` | 显示发货数据 | 已发100/150 |
| 6 | 点击查看发货明细 | - | `button:has-text("发货明细")` | 展开发货列表 | 列表显示 |
| 7 | 验证第一批发货 | - | `.shipment-1` | 显示发货信息 | 50台/已签收 |
| 8 | 验证第二批发货 | - | `.shipment-2` | 显示发货信息 | 50台/运输中 |
| 9 | 查看回款进度条 | - | `.payment-progress-bar` | 显示进度条 | 50%进度 |
| 10 | 查看回款统计 | - | `.payment-stats` | 显示回款数据 | 已收26899.50 |
| 11 | 点击查看回款明细 | - | `button:has-text("回款明细")` | 展开回款列表 | 列表显示 |
| 12 | 验证签约款收款 | - | `.payment-1` | 显示收款信息 | 16139.70/已确认 |
| 13 | 验证发货款收款 | - | `.payment-2` | 显示收款信息 | 10759.80/已确认 |
| 14 | 查看应收账款 | - | `.receivable-amount` | 显示应收金额 | 26899.50元 |
| 15 | 查看发票进度条 | - | `.invoice-progress-bar` | 显示进度条 | 50%进度 |
| 16 | 查看发票统计 | - | `.invoice-stats` | 显示发票数据 | 已开26899.50 |
| 17 | 点击查看发票明细 | - | `button:has-text("发票明细")` | 展开发票列表 | 列表显示 |
| 18 | 验证已开发票 | - | `.invoice-1` | 显示发票信息 | 16139.70/已开具 |
| 19 | 查看执行时间轴 | - | `.execution-timeline` | 显示时间轴 | 时间轴显示 |
| 20 | 验证合同签署节点 | - | `.timeline-signed` | 显示签署记录 | 2025-12-26 |
| 21 | 验证第一次发货节点 | - | `.timeline-ship-1` | 显示发货记录 | 2025-12-27 |
| 22 | 验证第一次回款节点 | - | `.timeline-payment-1` | 显示回款记录 | 2025-12-26 |
| 23 | 查看合同执行风险 | - | `.execution-risk-alert` | 显示风险提示 | 风险项显示 |
| 24 | 验证尾款逾期提醒 | - | `.payment-overdue-alert` | 显示逾期提醒 | 提醒存在 |
| 25 | 导出执行报告 | - | `button:has-text("导出报告")` | 下载Excel | 文件下载 |
| 26 | 截图执行跟踪 | - | - | 保存截图 | `contract-execution.png` |

**预期API响应**:
```json
{
  "success": true,
  "code": 200,
  "message": "获取执行数据成功",
  "data": {
    "contractId": 1,
    "contractNo": "CT202512260001",
    "executionProgress": {
      "shipment": {...},
      "payment": {...},
      "invoice": {...},
      "overallStatus": "in_progress"
    },
    "timeline": [...],
    "riskAlerts": [...]
  }
}
```

**截图要求**:
- `execution-summary.png` - 执行概况
- `execution-shipment-progress.png` - 发货进度
- `execution-payment-progress.png` - 回款进度
- `execution-invoice-progress.png` - 发票进度
- `execution-timeline.png` - 执行时间轴
- `execution-risk-alerts.png` - 风险提醒

---

## 其余场景说明

由于篇幅限制，剩余4个合同管理场景将在同一文件继续补充：

- **场景6.6**: 合同提醒与预警（CONTRACT-006）
- **场景6.7**: 合同文件管理（CONTRACT-007）
- **场景6.8**: 合同状态管理与流转（CONTRACT-008）
- **场景6.9**: 合同搜索与筛选（CONTRACT-009）
- **场景6.10**: 合同统计报表（CONTRACT-010）

（剩余场景详细内容将在下一部分补充...）

---

**文档状态**: 已完成5/9个场景
**待补充**: 4个场景
**下一步**: 继续补充场景6.6至6.10

## 测试场景6.6: 合同提醒与预警（CONTRACT-006）

**前置条件**:
- 已签署合同（场景6.3）
- 系统提醒功能已启用

**测试数据**:
```javascript
const contractReminderData = {
  contractId: null,
  
  // 提醒配置
  reminders: [
    {
      type: 'payment_due',
      name: '付款到期提醒',
      advanceDays: 3,
      enabled: true,
      recipients: ['财务部', '销售负责人']
    },
    {
      type: 'delivery_due',
      name: '交付到期提醒',
      advanceDays: 5,
      enabled: true,
      recipients: ['仓储部', '销售负责人']
    },
    {
      type: 'contract_expiry',
      name: '合同到期提醒',
      advanceDays: 30,
      enabled: true,
      recipients: ['销售负责人', '法务部']
    },
    {
      type: 'warranty_expiry',
      name: '质保到期提醒',
      advanceDays: 30,
      enabled: true,
      recipients: ['售后部', '客户']
    }
  ],

  // 预警配置
  alerts: [
    {
      type: 'payment_overdue',
      name: '回款逾期预警',
      threshold: 1, // 逾期天数
      severity: 'high',
      enabled: true
    },
    {
      type: 'delivery_delay',
      name: '交付延迟预警',
      threshold: 3,
      severity: 'medium',
      enabled: true
    }
  ]
}
```

**测试步骤**: (15步)

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 进入合同详情页 | - | `/contracts/${contractId}` | 显示合同详情 | URL正确 |
| 2 | 切换到提醒设置标签 | - | `.el-tabs__item:has-text("提醒设置")` | 显示提醒面板 | 标签激活 |
| 3 | 启用付款提醒 | - | `.reminder-payment input[type="checkbox"]` | 提醒已启用 | 复选框选中 |
| 4 | 设置提前天数 | 3天 | `.advance-days input` | 填写成功 | 值为3 |
| 5 | 选择提醒接收人 | 财务部、销售负责人 | `.el-select` | 选择成功 | 显示接收人 |
| 6 | 启用交付提醒 | - | `.reminder-delivery input[type="checkbox"]` | 提醒已启用 | 复选框选中 |
| 7 | 启用合同到期提醒 | - | `.reminder-expiry input[type="checkbox"]` | 提醒已启用 | 复选框选中 |
| 8 | 点击保存提醒设置 | - | `button:has-text("保存设置")` | 保存成功 | 成功提示 |
| 9 | 查看提醒历史 | - | `.reminder-history` | 显示提醒记录 | 记录列表显示 |
| 10 | 启用回款逾期预警 | - | `.alert-overdue input[type="checkbox"]` | 预警已启用 | 复选框选中 |
| 11 | 设置预警阈值 | 1天 | `.alert-threshold input` | 填写成功 | 值为1 |
| 12 | 选择预警级别 | 高 | `.el-select[placeholder*="级别"]` | 选择成功 | 显示"高" |
| 13 | 点击保存预警设置 | - | `button:has-text("保存")` | 保存成功 | 成功提示 |
| 14 | 测试提醒发送 | - | `button:has-text("测试提醒")` | 发送测试提醒 | 邮件/短信发送 |
| 15 | 查看预警列表 | - | `/alerts` | 显示预警列表 | 预警项显示 |

---

## 测试场景6.7: 合同文件管理（CONTRACT-007）

**测试数据**:
```javascript
const contractFilesData = {
  contractId: null,
  
  files: [
    {
      fileName: '合同正本_CT202512260001.pdf',
      fileType: 'contract_original',
      fileSize: 2.5 * 1024 * 1024, // 2.5MB
      uploadedBy: '系统管理员',
      uploadedAt: '2025-12-26T16:30:00'
    },
    {
      fileName: '补充协议_AMD202512280001.pdf',
      fileType: 'amendment',
      fileSize: 1.2 * 1024 * 1024,
      uploadedBy: '系统管理员',
      uploadedAt: '2025-12-28T10:00:00'
    },
    {
      fileName: '技术方案书.pdf',
      fileType: 'technical_document',
      fileSize: 5.8 * 1024 * 1024,
      uploadedBy: '技术部-王工',
      uploadedAt: '2025-12-25T14:00:00'
    }
  ]
}
```

**测试步骤**: (18步)

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 进入合同详情页 | - | `/contracts/${contractId}` | 显示合同详情 | URL正确 |
| 2 | 切换到文件管理标签 | - | `.el-tabs__item:has-text("文件管理")` | 显示文件面板 | 标签激活 |
| 3 | 查看文件列表 | - | `.file-list` | 显示所有文件 | 3个文件显示 |
| 4 | 点击上传文件 | - | `button:has-text("上传文件")` | 打开上传对话框 | 对话框显示 |
| 5 | 选择文件类型 | 合同正本 | `.el-select[placeholder*="类型"]` | 类型已选择 | 显示类型 |
| 6 | 选择文件 | - | `input[type="file"]` | 文件已选择 | 文件名显示 |
| 7 | 验证文件大小 | - | `.file-size` | 显示文件大小 | 2.5MB |
| 8 | 填写文件说明 | - | `textarea` | 填写成功 | 文本域有值 |
| 9 | 点击确认上传 | - | `button:has-text("上传")` | 上传成功 | 进度条显示 |
| 10 | 验证上传成功 | - | `.el-message--success` | 显示成功提示 | 提示"上传成功" |
| 11 | 查看文件详情 | - | 点击文件名 | 显示文件信息 | 详情面板显示 |
| 12 | 预览PDF文件 | - | `button:has-text("预览")` | 在线预览PDF | PDF查看器显示 |
| 13 | 下载文件 | - | `button:has-text("下载")` | 下载文件 | 文件下载 |
| 14 | 重命名文件 | 新文件名 | `button:has-text("重命名")` | 重命名成功 | 文件名更新 |
| 15 | 设置文件权限 | 仅查看 | `.permission-select` | 权限设置成功 | 权限更新 |
| 16 | 查看文件版本历史 | - | `button:has-text("版本历史")` | 显示版本列表 | 历史记录显示 |
| 17 | 删除文件 | - | `button:has-text("删除")` | 确认删除对话框 | 对话框显示 |
| 18 | 导出文件列表 | - | `button:has-text("导出")` | 下载文件清单 | Excel下载 |

---

## 测试场景6.8: 合同状态管理与流转（CONTRACT-008）

**测试数据**:
```javascript
const contractStatusData = {
  contractId: null,
  
  // 状态流转
  statusFlow: [
    { status: 'draft', name: '草稿', date: '2025-12-26 10:00' },
    { status: 'pending_approval', name: '待审批', date: '2025-12-26 11:00' },
    { status: 'approved', name: '已批准', date: '2025-12-26 14:00' },
    { status: 'signed', name: '已签署', date: '2025-12-26 16:30' },
    { status: 'in_progress', name: '执行中', date: '2025-12-27 00:00' },
    { status: 'completed', name: '已完成', date: '2026-02-28 00:00' }
  ],
  
  currentStatus: 'in_progress'
}
```

**测试步骤**: (12步)

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 进入合同详情页 | - | `/contracts/${contractId}` | 显示合同详情 | URL正确 |
| 2 | 查看当前状态 | - | `.contract-status` | 显示"执行中" | 蓝色标签 |
| 3 | 点击状态历史 | - | `button:has-text("状态历史")` | 显示状态时间轴 | 时间轴显示 |
| 4 | 验证草稿状态 | - | `.status-draft` | 显示草稿记录 | 时间正确 |
| 5 | 验证审批状态 | - | `.status-pending` | 显示待审批记录 | 时间正确 |
| 6 | 验证已签署状态 | - | `.status-signed` | 显示签署记录 | 时间正确 |
| 7 | 查看状态变更原因 | - | `.status-change-reason` | 显示变更说明 | 说明显示 |
| 8 | 查看操作人信息 | - | `.operator-info` | 显示操作人 | 姓名显示 |
| 9 | 手动变更状态 | - | `button:has-text("变更状态")` | 打开变更对话框 | 对话框显示 |
| 10 | 选择新状态 | 暂停执行 | `.el-select` | 状态已选择 | 显示新状态 |
| 11 | 填写变更原因 | - | `textarea` | 填写成功 | 文本域有值 |
| 12 | 确认变更 | - | `button:has-text("确定")` | 状态更新成功 | 成功提示 |

---

## 测试场景6.9: 合同搜索与筛选（CONTRACT-009）

**测试数据**:
```javascript
const contractSearchData = {
  // 搜索条件
  searchCriteria: {
    keyword: '测试酒店',
    contractNo: 'CT202512260001',
    customerName: '测试酒店',
    status: 'signed',
    dateRange: {
      start: '2025-12-01',
      end: '2025-12-31'
    },
    amountRange: {
      min: 30000,
      max: 60000
    },
    salesOwner: '李明'
  }
}
```

**测试步骤**: (15步)

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 进入合同列表页 | - | `/contracts` | 显示合同列表 | URL正确 |
| 2 | 查看所有合同 | - | `table` | 显示合同列表 | 数据显示 |
| 3 | 输入关键词搜索 | 测试酒店 | `input[placeholder*="搜索"]` | 输入成功 | 输入框有值 |
| 4 | 点击搜索 | - | `button:has-text("搜索")` | 执行搜索 | 列表更新 |
| 5 | 验证搜索结果 | - | `table` | 显示匹配结果 | 找到合同 |
| 6 | 选择合同状态筛选 | 已签署 | `.el-select[placeholder*="状态"]` | 状态已选择 | 显示"已签署" |
| 7 | 选择日期范围 | 2025-12 | `.el-date-picker[type="daterange"]` | 日期已选择 | 日期范围显示 |
| 8 | 输入金额范围 | 30000-60000 | `.amount-range input` | 填写成功 | 输入框有值 |
| 9 | 选择销售负责人 | 李明 | `.el-select[placeholder*="负责人"]` | 负责人已选择 | 显示名称 |
| 10 | 点击高级搜索 | - | `button:has-text("高级搜索")` | 展开高级选项 | 更多条件显示 |
| 11 | 选择合同类型 | 销售合同 | `.el-select` | 类型已选择 | 显示类型 |
| 12 | 点击应用筛选 | - | `button:has-text("应用")` | 执行筛选 | 列表更新 |
| 13 | 验证筛选结果数量 | - | `.result-count` | 显示结果数 | "共找到X条" |
| 14 | 保存搜索条件 | - | `button:has-text("保存搜索")` | 保存成功 | 成功提示 |
| 15 | 导出搜索结果 | - | `button:has-text("导出")` | 下载Excel | 文件下载 |

---

## 测试场景6.10: 合同统计报表（CONTRACT-010）

**测试数据**:
```javascript
const contractStatisticsData = {
  dateRange: {
    start: '2025-01-01',
    end: '2025-12-31'
  },
  
  statistics: {
    totalContracts: 156,
    totalAmount: 8500000.00,
    signedContracts: 120,
    signedAmount: 7200000.00,
    inProgressContracts: 85,
    completedContracts: 35,
    
    byStatus: [
      { status: '草稿', count: 12, amount: 560000 },
      { status: '已签署', count: 120, amount: 7200000 },
      { status: '执行中', count: 85, amount: 5100000 },
      { status: '已完成', count: 35, amount: 2100000 }
    ],
    
    bySales: [
      { salesName: '李明', contractCount: 45, totalAmount: 2800000 },
      { salesName: '王芳', contractCount: 38, totalAmount: 2300000 },
      { salesName: '张伟', contractCount: 37, totalAmount: 2400000 }
    ],
    
    monthlyTrend: [
      { month: '2025-01', count: 8, amount: 480000 },
      { month: '2025-02', count: 12, amount: 720000 },
      { month: '2025-03', count: 15, amount: 900000 }
    ]
  }
}
```

**测试步骤**: (18步)

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 进入合同统计页面 | - | `/contracts/statistics` | 显示统计页面 | URL正确 |
| 2 | 选择统计时间范围 | 2025年 | `.el-date-picker` | 日期已选择 | 日期范围显示 |
| 3 | 查看合同总数 | - | `.total-contracts` | 显示数量 | 156个 |
| 4 | 查看合同总额 | - | `.total-amount` | 显示金额 | 8500000.00 |
| 5 | 查看签约合同数 | - | `.signed-contracts` | 显示数量 | 120个 |
| 6 | 查看签约金额 | - | `.signed-amount` | 显示金额 | 7200000.00 |
| 7 | 查看按状态分布饼图 | - | `.status-pie-chart` | 显示饼图 | 图表显示 |
| 8 | 查看按金额柱状图 | - | `.amount-bar-chart` | 显示柱状图 | 图表显示 |
| 9 | 查看月度趋势折线图 | - | `.monthly-trend-chart` | 显示折线图 | 图表显示 |
| 10 | 切换到销售排行 | - | `.el-tabs__item:has-text("销售排行")` | 显示排行榜 | 标签激活 |
| 11 | 查看销售TOP榜 | - | `.sales-ranking-table` | 显示排行表 | 表格显示 |
| 12 | 验证第一名销售 | - | `.rank-1` | 显示李明 | 45个合同 |
| 13 | 切换到区域分析 | - | `.el-tabs__item:has-text("区域分析")` | 显示区域分析 | 标签激活 |
| 14 | 查看区域分布地图 | - | `.region-map` | 显示地图 | 地图显示 |
| 15 | 查看区域排行 | - | `.region-ranking` | 显示排行 | 表格显示 |
| 16 | 切换到趋势分析 | - | `.el-tabs__item:has-text("趋势分析")` | 显示趋势图 | 标签激活 |
| 17 | 查看同比增长 | - | `.year-over-year` | 显示增长率 | 百分比显示 |
| 18 | 导出统计报表 | - | `button:has-text("导出报表")` | 下载Excel | 文件下载 |

---

## 合同管理模块测试总结

### 已完成场景统计

| 场景编号 | 需求编号 | 场景名称 | 步骤数 | 状态 |
|---------|---------|---------|-------|------|
| 6.1 | CONTRACT-001 | 基于报价单创建合同 | 27 | ✅ 已完成 |
| 6.2 | CONTRACT-002 | 合同条款管理 | 35 | ✅ 已完成 |
| 6.3 | CONTRACT-003 | 合同签订流程 | 24 | ✅ 已完成 |
| 6.4 | CONTRACT-004 | 合同变更管理（补充协议） | 32 | ✅ 已完成 |
| 6.5 | CONTRACT-005 | 合同执行跟踪 | 26 | ✅ 已完成 |
| 6.6 | CONTRACT-006 | 合同提醒与预警 | 15 | ✅ 已完成 |
| 6.7 | CONTRACT-007 | 合同文件管理 | 18 | ✅ 已完成 |
| 6.8 | CONTRACT-008 | 合同状态管理与流转 | 12 | ✅ 已完成 |
| 6.9 | CONTRACT-009 | 合同搜索与筛选 | 15 | ✅ 已完成 |
| 6.10 | CONTRACT-010 | 合同统计报表 | 18 | ✅ 已完成 |

**总计**: 10个场景，222个测试步骤

### API端点清单

```
POST   /api/contracts/:id/terms          - 保存合同条款
POST   /api/contracts/:id/sign           - 签署合同
POST   /api/contracts/:id/amendments     - 创建补充协议
GET    /api/contracts/:id/execution      - 获取执行进度
POST   /api/contracts/:id/reminders      - 设置提醒
POST   /api/contracts/:id/files          - 上传文件
PATCH  /api/contracts/:id/status         - 变更状态
GET    /api/contracts/search             - 搜索合同
GET    /api/contracts/statistics         - 统计报表
```

---

**文档状态**: ✅ 完成
**场景总数**: 10个
**测试步骤**: 222步
**下一模块**: 收款管理
