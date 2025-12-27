# 艾居来 CRM 项目工作方式说明

## 项目基本信息

- **项目名称**：艾居来 CRM
- **项目定位**：酒店智能硬件营销领域的客户关系管理系统
- **部署方式**：云端部署（阿里云）
- **用户规模**：10个以内用户
- **技术选型原则**：优先使用成熟开源方案，选择最方便快捷的技术栈

## 核心功能模块

1. **基础数据模块**（优先开发）
   - 产品管理
   - 客户管理
   - 用户角色权限管理

2. **线索管理模块**
   - 线索录入
   - 持续跟踪
   - 状态管理

3. **方案生成模块**
   - 在线产品选配
   - 自动生成PDF格式方案文件

4. **项目管理模块**
   - 线索转化为项目
   - 合同管理
   - 发货管理
   - 回款管理
   - 售后管理

## 开发工作流程

### 第一阶段：需求分析
1. 使用 requirements-analyst agent 逐步确认需求细节
2. 针对每个模块进行系统化需求梳理
3. 生成正式的软件需求规格说明书（SRS）
4. 输出文档：`requirements.md`

### 第二阶段：方案设计
1. 使用 Plan agent 设计技术方案
2. 推荐成熟的开源技术栈和框架
3. 设计系统架构（前端、后端、数据库）
4. 与客户确认技术选型
5. 输出文档：`architecture.md`

### 第三阶段：迭代开发
1. 使用 TodoWrite 工具管理所有开发任务
2. 按模块进行开发，确保每个模块独立可测试
3. 持续更新待办清单，记录开发进度
4. 开发任务状态：pending（待处理）→ in_progress（进行中）→ completed（已完成）

### 第四阶段：质量保证
每个独立模块完成后：
1. 使用 code-test-auditor agent 进行审计：
   - 需求对照检查
   - 生成测试用例
   - 执行自动化测试
   - 生成问题清单和覆盖率矩阵
2. 逐步修复发现的问题
3. 与客户进行人工测试确认
4. 测试通过后再进入下一个模块开发
5. 如果模块无法独立测试，直接进入下一个功能开发
6. **重要**：如果在测试和优化过程中对需求或设计做了修改，必须同步更新相关文档：
   - 需求变更 → 更新 `requirements.md` 和 `changelog.md`
   - 架构调整 → 更新 `architecture.md`
   - API变更 → 更新 `docs/API.md` 和 `docs/API_DESIGN.md`
   - 数据库变更 → 更新 `database/SCHEMA_FULL_README.md`
   - 所有变更都要记录到 `changelog.md` 中

### 第五阶段：持续改进
1. 记录所有变更需求到 `changelog.md`
2. 维护技术文档和用户手册
3. 根据反馈持续优化

## 文档管理规范

### 文档目录索引

**完整文档目录**: `docs/DOCUMENT_INDEX.md` ⭐

该文档提供项目所有文档的索引、说明和推荐阅读顺序。

### 核心文档快速索引

- `claude.md` - 工作方式说明（本文档）
- `requirements.md` - 软件需求规格说明书
- `architecture.md` - 技术方案和系统架构
- `README.md` - 项目说明和快速开始指南
- `COMPLETE_WORKFLOW_TEST_REPORT.md` - 完整业务流程测试报告（最新）
- `LESSONS_LEARNED.md` - 测试过程中的问题和教训总结（最新）
- `docs/test-scenarios/TEST-COVERAGE-COMPLETE-INDEX.md` - 79个测试场景清单

## 开发原则

1. **模块化优先**：确保每个功能模块独立、可测试
2. **开源优先**：优先采用成熟稳定的开源方案
3. **敏捷迭代**：快速开发、快速验证、快速调整
4. **质量保证**：代码审查、测试覆盖、需求对照
5. **文档同步**：代码和文档同步更新
   - 测试和优化过程中如果修改了需求或设计，必须立即更新相关文档
   - 确保文档始终反映系统的真实状态
   - 所有变更必须记录到 `changelog.md`
6. **彻底修复原则**：所有操作不考虑复杂度和时间，依次进行直至修改完成
7. **系统性优化原则**：如果在测试并优化成功后，发现其他代码中也可能发生同样的问题且需要使用同样的方案，那就对所有没测试过的功能和代码统一修改

## 沟通机制

1. 需求不明确时，主动询问确认
2. 技术方案选型前，提供多个选项供选择
3. 每个模块完成后，等待测试确认
4. 发现问题时，及时记录并优先修复

## 代码质量规范（基于测试教训）

### 重要原则：从测试中学习

在2025-12-27的完整业务流程测试中，我们发现了以下系统性问题，这些问题必须在所有代码中避免：

### 1. Sequelize模型必须显式定义时间戳字段

**问题**: SQLite和MySQL对默认值的处理不同，仅配置`timestamps: true`不够。

**强制规范**:
```javascript
// ❌ 错误做法
const Model = sequelize.define('Model', {
  field: DataTypes.STRING
}, {
  timestamps: true,  // 仅此不够！
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// ✅ 正确做法
const Model = sequelize.define('Model', {
  field: DataTypes.STRING,

  // 必须显式定义时间戳字段
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '创建时间'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '更新时间'
  },
  // 如果使用软删除
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '删除时间'
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,  // 如果需要软删除
  deletedAt: 'deleted_at'
});
```

**影响**: 所有使用`timestamps: true`的模型（20+个文件）

### 2. API响应格式必须标准化

**问题**: 不同控制器返回格式不一致，导致前端/测试脚本难以统一处理。

**强制规范**:
```javascript
// ❌ 错误做法
exports.createXxx = async (req, res) => {
  const xxx = await Xxx.create(data);
  return success(res, xxx, '创建成功', 201);
  // 问题：只返回通用id字段，不明确
};

// ✅ 正确做法
exports.createXxx = async (req, res) => {
  const xxx = await Xxx.create(data);

  // 必须包含特定的ID字段
  const responseData = {
    xxxId: xxx.xxx_id,  // 特定ID字段（如leadId, customerId）
    ...xxx.toJSON()     // 包含所有原始字段
  };

  return success(res, responseData, '创建成功', 201);
};
```

**影响**: 所有控制器的create方法

### 3. 参数命名必须兼容驼峰和下划线

**问题**: 前端习惯驼峰命名，后端习惯下划线命名，需要双向兼容。

**强制规范**:
```javascript
// ✅ 正确做法：支持两种命名方式
exports.createXxx = async (req, res) => {
  // 参数映射：优先下划线，兼容驼峰
  const customer_id = req.body.customer_id || req.body.customerId;
  const product_id = req.body.product_id || req.body.productId;
  const created_at = req.body.created_at || req.body.createdAt || new Date();

  // 对items数组中的每个item也要做映射
  if (req.body.items) {
    req.body.items.forEach(item => {
      item.product_id = item.product_id || item.productId;
      item.unit_price = item.unit_price || item.unitPrice;
    });
  }

  // ...
};
```

**影响**: 所有接受外部参数的控制器方法（create, update, query等）

### 4. 必须自动补全关联数据

**问题**: 创建关联记录时，不应强制要求调用方提供所有冗余字段。

**强制规范**:
```javascript
// ✅ 正确做法：自动获取缺失的产品信息
if (items && items.length > 0) {
  for (const item of items) {
    const product_id = item.product_id || item.productId;
    let product_code = item.product_code || item.productCode;
    let product_name = item.product_name || item.productName;

    // 如果缺少产品信息，自动从数据库获取
    if (!product_code || !product_name) {
      const product = await Product.findByPk(product_id);
      if (product) {
        product_code = product_code || product.product_code;
        product_name = product_name || product.product_name;
      }
    }

    await XxxItem.create({
      product_id,
      product_code,
      product_name,
      // ...
    });
  }
}
```

**影响**: 所有包含items的create方法（quotation, contract, shipment等）

### 5. 错误日志必须详细

**问题**: 简单的错误日志不利于调试。

**强制规范**:
```javascript
// ✅ 正确做法
} catch (err) {
  console.error('创建XXX错误:', err);
  console.error('错误详情:', err.message);  // 必须添加
  console.error('请求参数:', req.body);     // 可选，帮助调试
  return error(res, '创建失败', 500);
}
```

**影响**: 所有控制器的所有方法

### 6. 测试脚本必须严格验证

**问题**: 使用grep等工具提取JSON时，字段不存在会返回空值但不报错。

**强制规范**:
```bash
# ✅ 正确做法：使用Python解析JSON并验证
ENTITY_ID=$(cat response.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('entityId', ''))")

if [ -z "$ENTITY_ID" ]; then
  echo "✗ 创建失败"
  cat response.json
  exit 1
fi

echo "✓ 创建成功，ID: $ENTITY_ID"
```

**影响**: 所有测试脚本

### 7. 必须验证数据库持久化

**问题**: API返回成功不代表数据已正确写入数据库。

**强制规范**:
- 关键业务流程测试后，查询数据库确认数据存在
- 验证数据完整性和关联关系
- 检查计算字段（如total_amount）是否正确

**影响**: 所有端到端测试

### 8. 测试和优化中的文档同步 ⭐

**问题**: 测试过程中发现的问题导致需求或设计调整，但文档未同步更新。

**强制规范**:
```
测试发现问题 → 修改代码 → 同步更新文档 → 记录到changelog
```

**必须更新的文档**:
- 需求变更：`requirements.md` + `changelog.md`
- 架构调整：`architecture.md` + `changelog.md`
- API变更：`docs/API.md` + `docs/API_DESIGN.md` + `changelog.md`
- 数据库变更：`database/SCHEMA_FULL_README.md` + `changelog.md`
- 代码规范变更：`CLAUDE.md` + `changelog.md`

**示例**:
```markdown
# 在 changelog.md 中记录
## 2025-12-27
### 需求变更
- [测试发现] Sequelize模型必须显式定义时间戳字段
- 影响范围：所有使用timestamps的模型
- 解决方案：在模型定义中添加created_at/updated_at字段
- 相关文档：已更新 CLAUDE.md 代码质量规范第1条
```

**影响**: 所有开发和测试人员

---

## 技术债务记录

### 已修复的系统性问题（2025-12-27）

✅ **问题1**: ProductCategory和Product模型时间戳字段
- 修复文件：`backend/src/models/ProductCategory.js`, `backend/src/models/Product.js`
- 解决方案：添加显式字段定义

✅ **问题2**: 8个控制器的响应格式不统一
- 修复文件：productController, leadController, quotationController, contractController, shipmentController, paymentController, invoiceController, serviceTicketController
- 解决方案：返回包含特定ID字段的标准化响应

✅ **问题3**: 参数命名不兼容
- 修复文件：所有业务控制器的create方法
- 解决方案：支持驼峰和下划线双重命名

✅ **问题4**: 缺少自动数据补全
- 修复文件：quotationController, contractController, shipmentController
- 解决方案：自动从Product表获取缺失信息

✅ **问题5**: 完整业务流程测试通过
- 测试范围：12步完整流程（线索→售后）
- 通过率：100%
- 数据持久化：13张表全部验证通过

### 待修复的系统性问题（进行中）

🔄 **问题6**: 所有未测试模型的时间戳字段
- 影响文件：约20+个模型文件
- 状态：后台任务修复中

🔄 **问题7**: 所有未测试控制器的响应格式
- 影响文件：customerController, userController, roleController, taskController等
- 状态：后台任务修复中

---

## 参考文档

详细的问题分析和教训总结，请参考：
- `LESSONS_LEARNED.md` - 测试过程中发现的问题和教训
- `COMPLETE_WORKFLOW_TEST_REPORT.md` - 完整业务流程测试报告
- `docs/test-scenarios/TEST-COVERAGE-COMPLETE-INDEX.md` - 79个测试场景清单

---

## 下一步行动

当前进度：✅ 核心业务流程测试完成（12/12步通过）

下一步：
1. 🔄 系统性修复所有模型和控制器（进行中）
2. 📋 执行79个测试场景清单中的剩余49个场景
3. 🎯 性能测试和安全测试（待核心功能测试完成后）
