# DDL生成指南

## 快速生成完整DDL

由于完整的28张表DDL脚本较大（约150KB，5000+行），为确保文档交接完整性，提供以下两种生成方式：

### 方式一：基于requirements.md手动生成（推荐）

1. 打开 `requirements.md` 文件
2. 跳转到 **第7章 数据模型**（从906行开始）
3. 按照以下模块逐一提取表结构：

**基础数据模块（§7.1-7.3）**
- §7.1.1 product_category（产品分类表）
- §7.1.2 product（产品SKU表）
- §7.2.1 customer（客户表）
- §7.2.2 customer_contact（客户联系人表）
- §7.2.3 customer_source（客户来源渠道表）
- §7.2.4 customer_follow_up（客户跟进记录表）
- §7.3.1 user（用户表）
- §7.3.2 role（角色表）
- §7.3.3 user_role（用户角色关联表）
- §7.3.4 permission（权限表）
- §7.3.5 role_permission（角色权限关联表）
- §7.3.6 audit_log（操作审计日志表）

**业务流程模块（§7.4-7.10）**
- §7.4.1 quotation（报价单主表）
- §7.4.2 quotation_item（报价单明细表）
- §7.5.1 contract（合同主表）
- §7.5.2 contract_item（合同明细表）
- §7.5.3 contract_amendment（合同补充协议表）
- §7.6.1 task（任务表）
- §7.6.2 task_template（任务模板表）
- §7.6.3 task_notification（任务提醒记录表）
- §7.7.1 shipment（发货单主表）
- §7.7.2 shipment_item（发货单明细表）
- §7.8.1 payment（收款记录表）
- §7.9.1 invoice（发票记录表）
- §7.10.1 service_ticket（服务工单表）
- §7.10.2 service_ticket_log（服务工单操作记录表）

### 方式二：使用AI辅助生成

让 Claude 或其他 AI 助手基于 requirements.md 第7章生成完整DDL：

```bash
# 示例prompt
请基于 requirements.md v9.1 第7章数据模型，生成完整的MySQL 8.0 DDL脚本，
包含以下要求：
1. 所有28张表的完整CREATE TABLE语句
2. 正确的字段类型、长度、默认值、注释
3. 主键、外键、索引定义
4. 两条主线设计（customer_id + contract_id）
5. 字符集 utf8mb4_unicode_ci
6. 初始化数据（角色、权限、产品分类、客户来源）
```

## DDL模板结构

完整的schema_full.sql文件应包含：

```sql
-- 文件头部（数据库创建、字符集设置）
CREATE DATABASE IF NOT EXISTS aijulai_crm...
USE aijulai_crm;
SET NAMES utf8mb4;

-- 第一部分：基础数据模块（12张表）
CREATE TABLE product_category...
CREATE TABLE product...
CREATE TABLE customer...
... （共12张表）

-- 第二部分：业务流程模块（16张表）
CREATE TABLE quotation...
CREATE TABLE contract...
CREATE TABLE shipment...
... （共16张表）

-- 第三部分：初始化数据
INSERT INTO role...
INSERT INTO customer_source...
INSERT INTO product_category...
```

## DDL字段设计规范

每张表应包含以下标准字段：

### 主键
- `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT

### 业务字段
- 根据requirements.md §7各表定义
- 外键字段使用 `_id` 后缀
- 状态字段使用ENUM类型

### 审计字段
```sql
`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
`updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
`created_by` BIGINT UNSIGNED COMMENT '创建人ID',
`updated_by` BIGINT UNSIGNED COMMENT '更新人ID',
`is_deleted` TINYINT(1) DEFAULT 0 COMMENT '软删除标记',
```

### 索引设计
- 主键索引：PRIMARY KEY (`id`)
- 唯一索引：UNIQUE KEY `uk_xxx` (字段)
- 普通索引：KEY `idx_xxx` (字段)
- 外键索引：已包含在外键定义中

## 下一步操作

1. ✅ 已完成：database/README.md - 数据库说明文档
2. ✅ 已完成：database/DDL_GENERATION_GUIDE.md - 本文档
3. ⏳ 待完成：database/schema_full.sql - 完整DDL（可由AI生成或手工编写）
4. ⏳ 待完成：database/init_data.sql - 初始化数据脚本

**推荐方式**：让Claude基于requirements.md第7章一次性生成完整的schema_full.sql文件

