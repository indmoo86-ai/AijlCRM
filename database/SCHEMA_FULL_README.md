# 艾居来 CRM 完整数据库架构说明

## 文件信息

- **文件名**: `schema_full.sql`
- **生成日期**: 2025-12-24
- **数据源**: `/Users/robin/claude code/CRM/requirements.md` §7 数据模型
- **数据库名**: `aijulai_crm`
- **字符集**: UTF8MB4 (utf8mb4_unicode_ci)
- **总表数**: 27张表

## 数据表结构概览

### 第一部分：基础数据模块（12张表）

#### 7.1 产品实体
1. **product_category** - 产品分类表
   - 主键: `category_id`
   - 唯一键: `category_code`
   - 关系: 被product表外键引用

2. **product** - 产品SKU表
   - 主键: `product_id`
   - 唯一键: `product_code`
   - 外键: `category_id` → product_category
   - 包含6个自定义扩展字段（custom_field_1~6）
   - 软删除支持（deleted_at）

#### 7.2 客户实体
3. **customer** - 客户表
   - 主键: `customer_id`
   - 唯一键: `customer_code`
   - 关键字段: `customer_stage`（客户生命周期阶段）
   - 包含5个自定义扩展字段
   - 软删除支持

4. **customer_contact** - 客户联系人表
   - 主键: `contact_id`
   - 外键: `customer_id` → customer
   - 支持多联系人，主要联系人标识（is_primary）

5. **customer_source** - 客户来源渠道表（字典表）
   - 主键: `source_id`
   - 唯一键: `source_code`
   - 可选配置表，用于动态管理客户来源

6. **customer_follow_up** - 客户跟进记录表
   - 主键: `follow_up_id`
   - 外键: `customer_id` → customer
   - 区分跟进类型（sales销售跟进 / after_sales售后回访）
   - 支持阶段变更记录（stage_before/stage_after）

#### 7.3 用户与权限实体
7. **user** - 用户表
   - 主键: `user_id`
   - 唯一键: `mobile`（手机号登录）, `user_code`（工号）
   - 安全字段: `password_hash`, `failed_login_count`, `locked_until`
   - 软删除支持

8. **role** - 角色表
   - 主键: `role_id`
   - 唯一键: `role_code`
   - 5个系统内置角色（is_system=1）

9. **user_role** - 用户角色关联表
   - 主键: `user_role_id`
   - 唯一键: (`user_id`, `role_id`)
   - 支持多角色分配

10. **permission** - 权限表
    - 主键: `permission_id`
    - 唯一键: `permission_code`
    - 模块级权限粒度

11. **role_permission** - 角色权限关联表
    - 主键: `role_permission_id`
    - 唯一键: (`role_id`, `permission_id`)

12. **audit_log** - 操作审计日志表
    - 主键: `log_id`
    - 记录所有关键操作（新增/修改/删除/登录）
    - 不允许删除，仅查询

---

### 第二部分：业务流程模块（14张表）

#### 7.4 报价单实体
13. **quotation** - 报价单主表
    - 主键: `quotation_id`
    - 唯一键: `quotation_no`
    - 外键: `customer_id` → customer
    - 状态: draft → sent → accepted/rejected/expired/superseded
    - 支持有效期管理和延期

14. **quotation_item** - 报价单明细表
    - 主键: `item_id`
    - 外键: `quotation_id` → quotation, `product_id` → product
    - 支持折扣计算（standard_price vs actual_price）
    - 产品信息冗余存储（快照）

#### 7.5 合同实体
15. **contract** - 合同主表
    - 主键: `contract_id`
    - 唯一键: `contract_no`
    - 外键: `customer_id` → customer, `source_quotation_id` → quotation
    - 状态: draft → under_review → approved → signed → executing → completed/terminated
    - 条款字段采用JSON格式（payment_terms, warranty_terms）
    - 执行进度跟踪（shipped_amount, received_amount, invoiced_amount）

16. **contract_item** - 合同明细表
    - 主键: `item_id`
    - 外键: `contract_id` → contract, `product_id` → product
    - 发货进度跟踪（shipped_quantity）

17. **contract_amendment** - 合同补充协议表
    - 主键: `amendment_id`
    - 唯一键: `amendment_no`
    - 外键: `contract_id` → contract
    - 支持产品变更、金额变更、条款变更等

#### 7.6 待办任务实体
18. **task** - 任务表
    - 主键: `task_id`
    - 唯一键: `unique_key`（防重键）
    - 多态关联（source_type + source_id）
    - 支持自动任务生成和提醒

19. **task_template** - 任务模板表（预留v2.0）
    - 主键: `template_id`
    - 用于配置化任务生成规则

20. **task_notification** - 任务提醒记录表（预留v2.0）
    - 主键: `notification_id`
    - 外键: `task_id` → task
    - 支持多渠道提醒（system/email/wechat/sms）

#### 7.7 发货管理实体
21. **shipment** - 发货单主表
    - 主键: `shipment_id`
    - 唯一键: `shipment_no`
    - 外键: `contract_id` → contract, `customer_id` → customer（冗余）
    - 状态: draft → pending → shipped → in_transit → delivered/cancelled
    - 物流信息管理

22. **shipment_item** - 发货单明细表
    - 主键: `item_id`
    - 外键: `shipment_id` → shipment, `contract_item_id` → contract_item
    - 发货数量跟踪（contract_quantity, already_shipped_quantity, this_shipment_quantity, remaining_quantity）

23. **shipment_tracking** - 发货单物流跟踪表（预留v2.0）
    - 主键: `tracking_id`
    - 外键: `shipment_id` → shipment
    - 对接第三方物流API

#### 7.8 收款管理实体
24. **payment** - 收款记录表
    - 主键: `payment_id`
    - 唯一键: `payment_no`
    - 外键: `contract_id` → contract, `customer_id` → customer（冗余）
    - 状态: draft → confirmed/cancelled
    - 核销管理（stage_paid_amount, stage_balance_amount, is_stage_settled）

#### 7.9 发票管理实体
25. **invoice** - 发票记录表
    - 主键: `invoice_id`
    - 唯一键: `invoice_no`（税务发票号码）
    - 外键: `contract_id` → contract, `customer_id` → customer（冗余）
    - 状态: draft → confirmed/voided
    - 发票类型（vat_special增值税专用发票 / vat_normal增值税普通发票）

#### 7.10 售后服务实体
26. **service_ticket** - 服务工单表
    - 主键: `ticket_id`
    - 唯一键: `ticket_no`
    - 外键: `customer_id` → customer, `contract_id` → contract（可选）
    - 状态: pending → in_progress → pending_acceptance → resolved → closed/cancelled
    - 质保期判断（is_under_warranty）
    - 费用管理（service_fee, parts_cost, total_cost）
    - 客户满意度评价（customer_rating, customer_feedback）

27. **service_ticket_log** - 服务工单操作记录表
    - 主键: `log_id`
    - 外键: `ticket_id` → service_ticket
    - 记录工单全生命周期操作日志

---

## 核心设计特性

### 1. 两条主线架构

#### 线索主线（Customer Line）
- 核心字段: `customer_id`
- 关联表: customer → quotation → contract → shipment/payment/invoice/service_ticket
- 用途: 追溯所有业务活动的客户来源

#### 合同主线（Contract Line）
- 核心字段: `contract_id`
- 关联表: contract → shipment → payment → invoice → service_ticket（可选）
- 用途: 追溯合同履约全过程

### 2. 字段命名规范

- **主键**: `{entity}_id`（如：product_id, customer_id, contract_id）
- **编码**: `{entity}_code`（如：product_code, customer_code）
- **名称**: `{entity}_name`（如：product_name, customer_name）
- **外键**: 与被引用表的主键名称保持一致

### 3. 数据冗余策略

#### 业务快照冗余（防止历史数据失真）
- 报价单明细: product_code, product_name, product_unit
- 合同明细: product_code, product_name, product_unit
- 发货单明细: product_code, product_name, product_unit
- 工单: product_name, product_code

#### 统计性能冗余（减少JOIN查询）
- contract表: shipped_amount, received_amount, invoiced_amount, execution_progress
- contract_item表: shipped_quantity
- payment表: stage_paid_amount, stage_balance_amount, is_stage_settled
- 业务表中的customer_id冗余（从contract继承）

### 4. 数据完整性保证

#### 外键约束（35个）
- `ON DELETE RESTRICT`: 防止误删被引用数据（如产品被合同引用）
- `ON DELETE CASCADE`: 级联删除从属数据（如删除合同时删除明细）
- `ON DELETE SET NULL`: 软关联，删除后置空（如删除联系人）

#### CHECK约束（43个）
- 金额非负校验: `CHECK (amount >= 0)`
- 数量范围校验: `CHECK (quantity > 0)`
- 日期逻辑校验: `CHECK (valid_until >= valid_from)`
- 枚举值校验: `CHECK (status IN (...))`

### 5. 软删除机制

以下表支持软删除（deleted_at字段）:
- product, customer, customer_follow_up
- user, quotation, contract, contract_amendment
- task, shipment, payment, invoice, service_ticket

### 6. 审计追溯

#### 操作审计字段
- `created_by` / `created_at`: 创建人和创建时间
- `updated_by` / `updated_at`: 修改人和修改时间
- 特殊审计: `sent_by`, `signed_by`, `confirmed_by`, `voided_by`

#### 审计日志表
- `audit_log`: 记录所有关键操作
- `service_ticket_log`: 工单操作日志
- 日志不允许删除，仅可查询

### 7. JSON字段使用

- `contract.payment_terms`: 付款条款（支持多期付款）
- `contract.warranty_terms`: 质保条款
- `task.notification_channels`: 提醒渠道记录
- `product.product_images`: 产品图片列表
- `customer_follow_up.attachment_urls`: 附件URL列表
- `service_ticket.replaced_parts`: 更换配件清单

---

## 索引策略

### 主键索引
所有表都有主键索引（AUTO_INCREMENT）

### 唯一键索引
- 业务编码: product_code, customer_code, quotation_no, contract_no等
- 登录凭证: user.mobile
- 防重键: task.unique_key
- 发票号码: invoice.invoice_no（税务发票号码全局唯一）

### 普通索引
- 外键字段: category_id, customer_id, contract_id等
- 状态字段: status（高频查询）
- 日期字段: created_at, signed_date, due_date等
- 业务字段: customer_stage, priority, is_active等

### 组合索引
- `(province, city)`: 地域查询
- `(source_type, source_id)`: 多态关联查询
- `(user_id, role_id)`: 用户角色关联

---

## 使用说明

### 1. 初始化数据库

```bash
mysql -u root -p < schema_full.sql
```

### 2. 验证表结构

```sql
USE aijulai_crm;
SHOW TABLES;
-- 应显示27张表

-- 查看表结构示例
DESC product;
DESC customer;
DESC contract;
```

### 3. 检查外键约束

```sql
SELECT
  TABLE_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'aijulai_crm'
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, CONSTRAINT_NAME;
```

### 4. 查看索引

```sql
SELECT
  TABLE_NAME,
  INDEX_NAME,
  COLUMN_NAME,
  NON_UNIQUE,
  SEQ_IN_INDEX
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'aijulai_crm'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;
```

---

## 注意事项

### 1. 字符集配置
- 数据库字符集: `utf8mb4`
- 排序规则: `utf8mb4_unicode_ci`
- 支持Emoji和特殊字符

### 2. 外键检查
- 导入时已临时禁用外键检查（`SET FOREIGN_KEY_CHECKS = 0`）
- 导入完成后自动恢复（`SET FOREIGN_KEY_CHECKS = 1`）

### 3. 时间戳自动管理
- `created_at`: `DEFAULT CURRENT_TIMESTAMP`
- `updated_at`: `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`

### 4. 软删除逻辑
- 软删除字段: `deleted_at DATETIME`
- `NULL`: 未删除
- 有值: 已删除（记录删除时间）
- 查询时需过滤: `WHERE deleted_at IS NULL`

### 5. JSON字段兼容性
- 需要 MySQL 5.7.8+ 或 MariaDB 10.2.7+
- JSON字段支持JSON_TABLE、JSON_EXTRACT等函数

### 6. 预留表（v2.0）
以下3张表为v2.0功能预留:
- `task_template`: 任务模板配置
- `task_notification`: 任务提醒记录
- `shipment_tracking`: 物流轨迹跟踪

---

## 数据库统计

| 类别 | 数量 |
|------|------|
| 总表数 | 27张 |
| 基础数据模块表 | 12张 |
| 业务流程模块表 | 14张 |
| v2.0预留表 | 3张 |
| 主键索引 | 27个 |
| 唯一键索引 | 36个 |
| 外键约束 | 35个 |
| CHECK约束 | 43个 |
| 软删除支持表 | 12张 |
| JSON字段数 | 9个 |
| 脚本总行数 | 1034行 |

---

## 相关文档

- **需求文档**: `/Users/robin/claude code/CRM/requirements.md` §7
- **架构设计**: `/Users/robin/claude code/CRM/architecture.md`
- **核心DDL**: `/Users/robin/claude code/CRM/database/schema_core.sql`（基础数据模块）
- **完整DDL**: `/Users/robin/claude code/CRM/database/schema_full.sql`（本文件）

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2025-12-24 | 初始版本，包含所有27张表的完整定义 |

---

## 生成工具

本DDL脚本由Claude AI根据requirements.md §7数据模型自动生成，确保：
- 字段命名完全一致
- 数据类型严格匹配
- 约束定义完整准确
- 索引配置合理优化

如需更新DDL，请修改requirements.md §7，然后重新生成。
