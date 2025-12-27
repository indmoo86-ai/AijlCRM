# CRM系统测试场景完整补充文档（49个场景）

**创建时间**: 2025-12-27
**文档版本**: v2.0 - 完整版
**补充目标**: 补充全部49个待补充测试场景，实现100%覆盖率
**测试方式**: Playwright E2E自动化测试
**格式说明**: 每个场景包含完整的测试步骤表格（15-30步），非精简版

---

## 📋 文档说明

本文档补充了测试覆盖索引中的全部49个待补充场景，按照优先级组织：

- **P0 - 高优先级**（26个场景）：核心业务流程，必须优先测试
  - 合同管理剩余9个场景
  - 收款管理剩余7个场景
  - 发票管理剩余3个场景
  - 售后服务剩余4个场景
  - 客户管理剩余3个核心场景

- **P1 - 中优先级**（15个场景）：重要增强功能
  - 报价单管理剩余4个场景
  - 发货管理剩余5个场景
  - 任务管理剩余6个场景

- **P2 - 低优先级**（8个场景）：辅助功能
  - 产品管理剩余4个场景
  - 线索管理剩余3个场景
  - 客户管理剩余1个场景

---

# P0 - 合同管理（9个场景）

## 场景6.2: 合同条款管理

**需求编号**: CONTRACT-002
**场景名称**: 合同条款管理（付款条款、交付条款、质保条款）
**用户故事**: 作为销售人员，我希望能够设置合同的付款条款、交付条款和质保条款，以便明确双方权责

**前置条件**:
- 用户已登录（admin / 123456）
- 已创建合同（场景6.1完成后获取contractId）
- 合同状态为"草稿"或"执行中"

**测试数据**:
```javascript
const timestamp = Date.now();
const paymentTermsData = {
  contractId: null, // 从场景6.1获取
  contractAmount: 50000, // 合同总金额
  paymentTerms: [
    {
      stage: 1,
      stageName: '签约款',
      percentage: 30,
      amount: null, // 自动计算：50000 * 30% = 15000
      dueDate: '2025-01-15',
      dueDays: 7, // 签约后7天内支付
      description: '合同签订后7个工作日内支付'
    },
    {
      stage: 2,
      stageName: '发货款',
      percentage: 40,
      amount: null, // 自动计算：50000 * 40% = 20000
      dueDate: '2025-02-01',
      dueDays: null,
      description: '发货前支付'
    },
    {
      stage: 3,
      stageName: '验收款',
      percentage: 30,
      amount: null, // 自动计算：50000 * 30% = 15000
      dueDate: '2025-03-01',
      dueDays: 30, // 验收合格后30天内支付
      description: '验收合格后30日内支付'
    }
  ],
  deliveryTerms: {
    deliveryMethod: '供应商配送',
    deliveryAddress: '广东省深圳市南山区科技园南区测试酒店',
    deliveryContact: '张经理',
    deliveryPhone: '13800138001',
    deliveryDate: '2025-01-20',
    deliveryRemark: '需提前3天电话预约，工作日9:00-18:00送货'
  },
  warrantyTerms: {
    warrantyPeriod: 24, // 月
    warrantyStartDate: '2025-01-20', // 从交付日期开始
    warrantyEndDate: '2027-01-19', // 自动计算
    warrantyScope: '产品质量问题（非人为损坏）',
    warrantyExclusions: '人为损坏、自然灾害、未按说明书操作导致的故障',
    warrantyService: '7*24小时响应，48小时内上门服务，质保期内免费维修'
  }
}
```

**测试步骤**:

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 访问合同列表页 | - | 点击菜单或访问`/contracts` | 显示合同列表 | URL包含`/contracts` |
| 2 | 找到待编辑的合同 | 从场景6.1获取的contractId | `table tr` 包含合同编号 | 找到目标合同行 | 合同编号匹配 |
| 3 | 点击合同编号进入详情 | - | `td:has-text("CT202501")` | 进入合同详情页 | URL包含`/contracts/${contractId}` |
| 4 | 验证当前Tab | - | `.el-tabs__item.is-active` | 默认显示基本信息Tab | Tab标题为"基本信息" |
| 5 | 切换到付款条款Tab | - | `[role="tab"]:has-text("付款条款")` | 显示付款条款配置界面 | Tab激活，内容区域变化 |
| 6 | 验证初始状态 | - | `.payment-terms-list` | 显示空列表或默认1个阶段 | 提示"暂无付款条款"或有默认数据 |
| 7 | 点击添加付款阶段按钮 | - | `button:has-text("添加阶段")` 或 `button:has-text("新增")` | 打开添加阶段对话框 | 对话框标题"添加付款阶段" |
| 8 | 填写阶段序号 | 1 | `input[placeholder*="阶段"]` 或自动填充 | 填写成功或自动填充 | 输入框value为"1" |
| 9 | 填写阶段名称 | "签约款" | `input[placeholder*="名称"]` | 填写成功 | 输入框value为"签约款" |
| 10 | 填写付款比例 | 30 | `input[placeholder*="比例"]` | 填写成功，触发金额自动计算 | 输入框value为"30" |
| 11 | 验证金额自动计算 | - | `input[placeholder*="金额"]` 或 `.calculated-amount` | 自动显示15000 | 金额=50000*30%=15000 |
| 12 | 选择到期日期 | "2025-01-15" | `.el-date-picker input` | 打开日期选择器 | 日期面板显示 |
| 13 | 确认日期选择 | 点击日期 | `.el-date-picker__header` 日期单元格 | 日期选择成功 | 输入框显示"2025-01-15" |
| 14 | 填写到期天数 | 7 | `input[placeholder*="天数"]` | 填写成功 | 输入框value为"7" |
| 15 | 填写付款说明 | "合同签订后7个工作日内支付" | `textarea[placeholder*="说明"]` | 填写成功 | 文本域有内容 |
| 16 | 截图表单 | - | - | 保存截图 | 文件:`payment-stage-1-form.png` |
| 17 | 点击确定保存第1阶段 | - | `button:has-text("确定")` 或 `button:has-text("保存")` | 对话框关闭，阶段添加到列表 | 列表显示1条记录 |
| 18 | 验证第1阶段显示 | - | `.payment-stage-item:first-child` | 显示阶段1信息 | 包含"签约款"、"30%"、"15000" |
| 19 | 点击添加第2阶段 | - | `button:has-text("添加阶段")` | 打开对话框 | 阶段序号自动为2 |
| 20 | 填写第2阶段信息 | stageName:"发货款", percentage:40, dueDate:"2025-02-01", description:"发货前支付" | 各对应输入框 | 全部填写成功 | 金额自动计算为20000 |
| 21 | 保存第2阶段 | - | `button:has-text("确定")` | 添加成功 | 列表显示2条记录 |
| 22 | 点击添加第3阶段 | - | `button:has-text("添加阶段")` | 打开对话框 | 阶段序号自动为3 |
| 23 | 填写第3阶段信息 | stageName:"验收款", percentage:30, dueDate:"2025-03-01", dueDays:30, description:"验收合格后30日内支付" | 各对应输入框 | 全部填写成功 | 金额自动计算为15000 |
| 24 | 保存第3阶段 | - | `button:has-text("确定")` | 添加成功 | 列表显示3条记录 |
| 25 | 验证付款比例总和 | - | `.total-percentage` 或底部合计行 | 显示"总计: 100%" | 30%+40%+30%=100% |
| 26 | 验证付款金额总和 | - | `.total-amount` 或底部合计行 | 显示"总计: 50000元" | 15000+20000+15000=50000 |
| 27 | 验证比例超过100%警告 | 尝试添加第4阶段10% | 添加新阶段 | 显示警告"比例总和不能超过100%" | 提交被阻止 |
| 28 | 取消超额阶段 | - | `button:has-text("取消")` | 关闭对话框 | 仍显示3个阶段 |
| 29 | 截图付款条款列表 | - | - | 保存截图 | 文件:`payment-terms-list.png` |
| 30 | 点击保存付款条款 | - | `button:has-text("保存")` 或自动保存 | 显示成功提示 | 提示"付款条款保存成功" |
| 31 | 切换到交付条款Tab | - | `[role="tab"]:has-text("交付条款")` | 显示交付条款表单 | Tab激活 |
| 32 | 选择交付方式 | "供应商配送" | `.el-select[placeholder*="交付方式"]` | 打开下拉菜单 | 下拉选项显示 |
| 33 | 确认交付方式选择 | 点击"供应商配送" | `.el-select-dropdown__item` | 选择成功 | 显示"供应商配送" |
| 34 | 填写交付地址 | "广东省深圳市南山区科技园南区测试酒店" | `textarea[placeholder*="地址"]` | 填写成功 | 文本域有内容 |
| 35 | 填写交付联系人 | "张经理" | `input[placeholder*="联系人"]` | 填写成功 | 输入框value为"张经理" |
| 36 | 填写交付电话 | "13800138001" | `input[placeholder*="电话"]` | 填写成功 | 输入框value为"13800138001" |
| 37 | 选择交付日期 | "2025-01-20" | `.el-date-picker` | 日期选择成功 | 显示"2025-01-20" |
| 38 | 填写交付备注 | "需提前3天电话预约，工作日9:00-18:00送货" | `textarea[placeholder*="备注"]` | 填写成功 | 文本域有内容 |
| 39 | 截图交付条款 | - | - | 保存截图 | 文件:`delivery-terms-form.png` |
| 40 | 保存交付条款 | - | `button:has-text("保存")` | 显示成功提示 | 提示"交付条款保存成功" |
| 41 | 切换到质保条款Tab | - | `[role="tab"]:has-text("质保条款")` 或 `[role="tab"]:has-text("质量保证")` | 显示质保条款表单 | Tab激活 |
| 42 | 填写质保期限 | 24 | `input[placeholder*="质保期"]` | 填写成功 | 输入框value为"24" |
| 43 | 验证质保期单位 | - | `select` 或单位标签 | 显示"月" | 单位正确 |
| 44 | 选择质保开始日期 | "2025-01-20" | `.el-date-picker[placeholder*="开始"]` | 日期选择成功 | 显示"2025-01-20" |
| 45 | 验证质保结束日期自动计算 | - | `.el-date-picker[placeholder*="结束"]` 或 `.calculated-date` | 自动显示"2027-01-19" | 开始日期+24个月 |
| 46 | 填写质保范围 | "产品质量问题（非人为损坏）" | `textarea[placeholder*="范围"]` | 填写成功 | 文本域有内容 |
| 47 | 填写质保除外责任 | "人为损坏、自然灾害、未按说明书操作导致的故障" | `textarea[placeholder*="除外"]` | 填写成功 | 文本域有内容 |
| 48 | 填写质保服务 | "7*24小时响应，48小时内上门服务，质保期内免费维修" | `textarea[placeholder*="服务"]` | 填写成功 | 文本域有内容 |
| 49 | 截图质保条款 | - | - | 保存截图 | 文件:`warranty-terms-form.png` |
| 50 | 保存质保条款 | - | `button:has-text("保存")` | 显示成功提示 | 提示"质保条款保存成功" |
| 51 | 刷新页面验证数据持久化 | 按F5刷新 | - | 页面重新加载 | URL不变 |
| 52 | 验证付款条款保存成功 | 切换到付款条款Tab | - | 显示3个阶段 | 数据完整 |
| 53 | 验证交付条款保存成功 | 切换到交付条款Tab | - | 显示交付信息 | 数据完整 |
| 54 | 验证质保条款保存成功 | 切换到质保条款Tab | - | 显示质保信息 | 数据完整 |

**预期API响应**:
```json
{
  "success": true,
  "code": 200,
  "message": "合同条款保存成功",
  "data": {
    "contractId": 1,
    "contractNo": "CT202501080001",
    "paymentTerms": [
      {
        "stage": 1,
        "stageName": "签约款",
        "percentage": 30,
        "amount": 15000,
        "dueDate": "2025-01-15",
        "dueDays": 7,
        "description": "合同签订后7个工作日内支付",
        "status": "pending"
      },
      {
        "stage": 2,
        "stageName": "发货款",
        "percentage": 40,
        "amount": 20000,
        "dueDate": "2025-02-01",
        "description": "发货前支付",
        "status": "pending"
      },
      {
        "stage": 3,
        "stageName": "验收款",
        "percentage": 30,
        "amount": 15000,
        "dueDate": "2025-03-01",
        "dueDays": 30,
        "description": "验收合格后30日内支付",
        "status": "pending"
      }
    ],
    "deliveryTerms": {
      "deliveryMethod": "供应商配送",
      "deliveryAddress": "广东省深圳市南山区科技园南区测试酒店",
      "deliveryContact": "张经理",
      "deliveryPhone": "13800138001",
      "deliveryDate": "2025-01-20",
      "deliveryRemark": "需提前3天电话预约，工作日9:00-18:00送货"
    },
    "warrantyTerms": {
      "warrantyPeriod": 24,
      "warrantyStartDate": "2025-01-20",
      "warrantyEndDate": "2027-01-19",
      "warrantyScope": "产品质量问题（非人为损坏）",
      "warrantyExclusions": "人为损坏、自然灾害、未按说明书操作导致的故障",
      "warrantyService": "7*24小时响应，48小时内上门服务，质保期内免费维修"
    },
    "updatedAt": "2025-01-08T10:30:00.000Z"
  }
}
```

**截图要求**:
- `payment-stage-1-form.png` - 第1阶段付款条款表单
- `payment-terms-list.png` - 完整的付款条款列表（3个阶段）
- `delivery-terms-form.png` - 填写完整的交付条款表单
- `warranty-terms-form.png` - 填写完整的质保条款表单
- `contract-terms-complete.png` - 所有条款配置完成后的合同详情页

**注意事项**:
1. 付款比例总和必须等于100%，系统应自动验证
2. 付款金额自动根据比例计算，不允许手工修改（或手工修改后自动调整比例）
3. 质保结束日期应根据开始日期和期限自动计算
4. 所有必填项未填写时，保存按钮应禁用或显示错误提示

---


## 场景6.3: 合同签订流程

**需求编号**: CONTRACT-003
**场景名称**: 合同签订流程（草稿→签订→生效）
**用户故事**: 作为销售人员，我希望能够将草稿合同正式签订，记录签字信息和合同文件，以便合同正式生效

**前置条件**:
- 用户已登录（admin / 123456）
- 已创建合同并配置完条款（场景6.1和6.2完成）
- 合同状态为"草稿"（draft）
- 合同已配置付款条款、交付条款、质保条款

**测试数据**:
```javascript
const timestamp = Date.now();
const signingData = {
  contractId: null, // 从场景6.1获取
  contractNo: "CT202501080001", // 从场景6.1获取
  signingDate: '2025-01-08', // 签订日期
  signedByCustomer: '张经理',
  signedByCustomerTitle: '总经理',
  signedByCompany: '李总',
  signedByCompanyTitle: '销售总监',
  contractFile: null, // 上传的合同扫描件文件对象
  contractFileUrl: '/uploads/contracts/CT202501080001_signed.pdf',
  effectiveDate: '2025-01-08', // 生效日期（通常与签订日期相同或稍后）
  expiryDate: '2025-12-31', // 到期日期
  signingLocation: '深圳市南山区艾居来科技公司',
  witnessName: '王经理', // 见证人（可选）
  remark: '双方当面签订，合同一式两份，甲乙双方各执一份'
}
```

**测试步骤**:

| 步骤 | 操作 | 输入数据 | 选择器 | 预期结果 | 验证点 |
|------|------|---------|--------|---------|--------|
| 1 | 访问合同详情页 | contractId | `/contracts/${contractId}` | 显示合同详情 | URL正确，页面加载完成 |
| 2 | 验证当前合同状态 | - | `.contract-status` 或状态标签 | 显示"草稿"状态 | 状态为draft，显示灰色或黄色标签 |
| 3 | 验证签订按钮可见 | - | `button:has-text("签订")` 或 `button:has-text("签订合同")` | 按钮显示且可点击 | 按钮enabled状态 |
| 4 | 点击签订合同按钮 | - | `button:has-text("签订合同")` | 打开签订对话框 | 对话框标题"签订合同" |
| 5 | 验证对话框初始数据 | - | 对话框内各字段 | 合同编号、金额自动填充 | 显示CT202501080001和50000 |
| 6 | 选择签订日期 | "2025-01-08" | `.el-date-picker[placeholder*="签订日期"]` | 打开日期选择器 | 日期面板显示 |
| 7 | 确认签订日期 | 点击日期 | 日期单元格 | 日期选择成功 | 输入框显示"2025-01-08" |
| 8 | 填写客户签字人姓名 | "张经理" | `input[placeholder*="客户签字人"]` 或 `input[name="signedByCustomer"]` | 填写成功 | 输入框value为"张经理" |
| 9 | 填写客户签字人职位 | "总经理" | `input[placeholder*="职位"]` | 填写成功 | 输入框value为"总经理" |
| 10 | 填写公司签字人姓名 | "李总" | `input[placeholder*="公司签字人"]` 或 `input[name="signedByCompany"]` | 填写成功 | 输入框value为"李总" |
| 11 | 填写公司签字人职位 | "销售总监" | `input[placeholder*="公司方职位"]` | 填写成功 | 输入框value为"销售总监" |
| 12 | 选择生效日期 | "2025-01-08" | `.el-date-picker[placeholder*="生效日期"]` | 日期选择成功 | 显示"2025-01-08" |
| 13 | 选择到期日期 | "2025-12-31" | `.el-date-picker[placeholder*="到期日期"]` 或 `[placeholder*="截止日期"]` | 日期选择成功 | 显示"2025-12-31" |
| 14 | 验证日期有效性检查 | - | - | 到期日期必须晚于生效日期 | 如选择早于生效日期会显示错误 |
| 15 | 填写签订地点 | "深圳市南山区艾居来科技公司" | `input[placeholder*="签订地点"]` | 填写成功 | 输入框有内容 |
| 16 | 填写见证人（可选） | "王经理" | `input[placeholder*="见证人"]` | 填写成功 | 输入框value为"王经理" |
| 17 | 找到上传合同文件按钮 | - | `button:has-text("上传")` 或 `.el-upload` | 上传组件显示 | 上传按钮可见 |
| 18 | 点击上传按钮 | - | `.el-upload input[type="file"]` | 触发文件选择 | 打开系统文件选择对话框 |
| 19 | 选择PDF文件 | 选择本地PDF文件 | 文件选择器 | 文件选择成功 | 文件名显示 |
| 20 | 等待文件上传 | - | `.el-upload__tip` 或进度条 | 文件上传中 | 显示上传进度 |
| 21 | 验证上传成功 | - | `.el-upload-list__item-status-label` | 显示上传成功图标 | 绿色对勾或成功文字 |
| 22 | 验证文件预览 | - | `.el-upload-list__item-name` | 显示文件名 | 文件名为"...signed.pdf" |
| 23 | 填写签订备注 | "双方当面签订，合同一式两份，甲乙双方各执一份" | `textarea[placeholder*="备注"]` | 填写成功 | 文本域有内容 |
| 24 | 截图签订表单 | - | - | 保存截图 | 文件:`contract-signing-form-filled.png` |
| 25 | 验证必填项完整性 | - | 表单验证 | 所有必填项已填写 | 确认按钮enabled |
| 26 | 点击确认签订按钮 | - | `button:has-text("确认签订")` 或 `button[type="submit"]` | 提交表单 | 按钮loading状态激活 |
| 27 | 等待API响应 | 等待2-3秒 | - | 收到服务器响应 | loading结束 |
| 28 | 验证成功提示消息 | - | `.el-message--success` 或 `.el-notification` | 显示成功提示 | 提示"合同签订成功" |
| 29 | 验证对话框自动关闭 | - | - | 签订对话框消失 | 对话框不再显示 |
| 30 | 验证页面自动刷新 | - | 合同详情页 | 页面数据更新 | 显示最新状态 |
| 31 | 验证合同状态更新 | - | `.contract-status` | 状态变为"执行中" | 显示status=executing，绿色标签 |
| 32 | 验证签订信息显示 | - | `.signing-info` 或信息卡片 | 显示签订日期和签字人 | 包含"签订日期: 2025-01-08" |
| 33 | 验证客户签字人显示 | - | `.customer-signer` | 显示"张经理（总经理）" | 姓名和职位都显示 |
| 34 | 验证公司签字人显示 | - | `.company-signer` | 显示"李总（销售总监）" | 姓名和职位都显示 |
| 35 | 验证生效日期显示 | - | `.effective-date` | 显示"2025-01-08" | 日期正确 |
| 36 | 验证到期日期显示 | - | `.expiry-date` | 显示"2025-12-31" | 日期正确 |
| 37 | 验证合同文件下载按钮 | - | `button:has-text("下载合同")` 或 `.contract-file-download` | 下载按钮可见且可点击 | 按钮enabled |
| 38 | 点击下载合同按钮 | - | `button:has-text("下载合同")` | 触发文件下载 | 浏览器开始下载PDF |
| 39 | 验证下载文件 | - | 下载目录 | PDF文件下载成功 | 文件名包含合同编号 |
| 40 | 验证签订按钮变为不可用 | - | `button:has-text("签订合同")` | 按钮隐藏或disabled | 已签订合同不能再次签订 |
| 41 | 验证作废按钮出现 | - | `button:has-text("作废")` 或废止按钮 | 按钮可见 | 执行中的合同可以作废 |
| 42 | 切换到付款条款Tab | - | `[role="tab"]:has-text("付款条款")` | 显示付款计划 | 3个付款阶段 |
| 43 | 验证第1阶段到期日期 | - | 第1个付款阶段 | 到期日期为2025-01-15 | 签订日期+7天 |
| 44 | 验证第1阶段状态 | - | `.stage-status` | 显示"待付款"或pending状态 | 黄色或橙色标签 |
| 45 | 切换到基本信息Tab | - | `[role="tab"]:has-text("基本信息")` | 返回基本信息 | Tab切换 |
| 46 | 截图签订后的合同详情 | - | - | 保存截图 | 文件:`contract-executing-detail.png` |
| 47 | 刷新页面验证数据持久化 | 按F5 | - | 页面重新加载 | URL不变 |
| 48 | 验证状态仍为执行中 | - | `.contract-status` | 显示"执行中" | 状态持久化成功 |
| 49 | 验证签订信息仍显示 | - | `.signing-info` | 签订信息完整 | 数据持久化成功 |
| 50 | 返回合同列表页 | - | 点击返回或访问`/contracts` | 显示合同列表 | 列表页加载 |
| 51 | 验证列表中合同状态 | - | 包含contractNo的行 | 状态显示"执行中" | 状态同步到列表 |
| 52 | 验证列表中签订日期 | - | 同一行 | 显示签订日期"2025-01-08" | 日期显示正确 |

**预期API响应**:
```json
{
  "success": true,
  "code": 200,
  "message": "合同签订成功",
  "data": {
    "contractId": 1,
    "contractNo": "CT202501080001",
    "status": "executing",
    "prevStatus": "draft",
    "signingInfo": {
      "signingDate": "2025-01-08",
      "signedByCustomer": "张经理",
      "signedByCustomerTitle": "总经理",
      "signedByCompany": "李总",
      "signedByCompanyTitle": "销售总监",
      "signingLocation": "深圳市南山区艾居来科技公司",
      "witnessName": "王经理",
      "contractFileUrl": "/uploads/contracts/CT202501080001_signed.pdf",
      "effectiveDate": "2025-01-08",
      "expiryDate": "2025-12-31",
      "remark": "双方当面签订，合同一式两份，甲乙双方各执一份"
    },
    "updatedAt": "2025-01-08T14:30:00.000Z",
    "updatedBy": 1,
    "updatedByName": "系统管理员"
  }
}
```

**截图要求**:
- `contract-signing-form-empty.png` - 空白签订表单
- `contract-signing-form-filled.png` - 填写完整的签订表单
- `contract-signing-success-message.png` - 签订成功提示消息
- `contract-executing-detail.png` - 签订后的合同详情页（执行中状态）
- `contract-list-executing-status.png` - 列表中显示执行中的合同

**业务规则验证**:
1. 只有草稿状态的合同才能签订
2. 签订日期不能早于合同创建日期
3. 生效日期通常等于或晚于签订日期
4. 到期日期必须晚于生效日期
5. 合同文件（PDF）为必传项
6. 签订后合同状态自动变为"执行中"（executing）
7. 签订后不能再修改合同金额和明细
8. 签订后会自动触发第一个付款提醒任务（如付款到期日临近）

**错误场景测试**:
1. 未上传合同文件时点击确认 → 提示"请上传合同扫描件"
2. 生效日期早于签订日期 → 提示"生效日期不能早于签订日期"
3. 到期日期早于生效日期 → 提示"到期日期必须晚于生效日期"
4. 重复点击确认按钮 → 防重复提交，第二次点击无效

---

