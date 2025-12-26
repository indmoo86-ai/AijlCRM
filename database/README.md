# 数据库DDL文档

## 文件说明

本目录包含艾居来CRM系统的数据库设计文档：

1. **schema.sql** - 完整的MySQL DDL脚本（28张表）
2. **init_data.sql** - 初始化数据脚本（角色、权限、产品分类等）
3. **README.md** - 本说明文档

## 数据库设计概览

### 基础信息
- **数据库名称**：aijulai_crm
- **数据库类型**：MySQL 8.0+
- **字符集**：utf8mb4_unicode_ci
- **表总数**：28张
  - 基础数据模块：12张表
  - 业务流程模块：16张表

### 两条主线设计理念

系统采用"两条主线"架构设计，确保业务数据完整追溯：

1. **线索主线（customer_id）**
   - 贯穿客户全生命周期（从线索到成交客户）
   - 所有业务模块必须关联customer_id

2. **合同主线（contract_id）**  
   - 贯穿合同执行全流程（报价→合同→发货→收款→发票→售后）
   - 核心业务表必须关联contract_id

## 表结构清单

### 基础数据模块（12张表）

| 表名 | 中文名 | 说明 |
|------|--------|------|
| product_category | 产品分类表 | 管理5-6个产品大类 |
| product | 产品SKU表 | 管理200-300个产品SKU |
| customer | 客户表 | 统一管理线索和客户（通过customer_stage区分） |
| customer_contact | 客户联系人表 | 一个客户多个联系人 |
| customer_source | 客户来源渠道表 | 字典表，配置客户来源 |
| customer_follow_up | 客户跟进记录表 | 支持销售跟进和售后回访 |
| user | 用户表 | 手机号+密码登录 |
| role | 角色表 | 固定5个角色 |
| user_role | 用户角色关联表 | 一个用户可有多个角色 |
| permission | 权限表 | 模块级权限 |
| role_permission | 角色权限关联表 | 为角色配置权限 |
| audit_log | 操作审计日志表 | 记录所有关键操作 |

### 业务流程模块（16张表）

| 表名 | 中文名 | 说明 |
|------|--------|------|
| quotation | 报价单主表 | 独立报价单模式，支持版本管理 |
| quotation_item | 报价单明细表 | 报价产品明细 |
| contract | 合同主表 | 合同是业务核心，两条主线之一 |
| contract_item | 合同明细表 | 合同产品明细 |
| contract_amendment | 合同补充协议表 | 记录合同变更 |
| task | 任务表 | 待办任务，支持多态关联 |
| task_template | 任务模板表 | 预留v2.0 |
| task_notification | 任务提醒记录表 | 预留v2.0 |
| shipment | 发货单主表 | 支持部分发货/分批发货 |
| shipment_item | 发货单明细表 | 发货产品明细 |
| payment | 收款记录表 | 支持分期收款、部分收款 |
| invoice | 发票记录表 | 单表设计，可选关联收款 |
| service_ticket | 服务工单表 | 售后服务工单 |
| service_ticket_log | 服务工单操作记录表 | 工单操作历史 |

## 使用说明

### 1. 创建数据库

```bash
mysql -u root -p < schema.sql
```

### 2. 初始化数据

```bash
mysql -u root -p aijulai_crm < init_data.sql
```

### 3. 验证安装

```sql
USE aijulai_crm;
SHOW TABLES;
-- 应该显示28张表

SELECT * FROM role;
-- 应该显示5个角色

SELECT * FROM product_category;
-- 应该显示6个产品分类
```

## 详细字段说明

完整的字段定义、业务规则、索引设计请参考：
- **requirements.md** 第7章 数据模型

## 数据库设计要点

1. **主键设计**：所有表使用BIGINT UNSIGNED自增主键
2. **外键约束**：核心关联使用外键保护，避免误删
3. **软删除**：关键业务表使用is_deleted字段实现软删除
4. **审计字段**：created_at, updated_at, created_by, updated_by
5. **枚举类型**：状态字段使用ENUM确保数据一致性
6. **扩展性**：预留custom_field字段和JSON字段
7. **权限控制**：预留owner_id, department_id, data_permission_level字段

## 注意事项

⚠️ **生产环境部署前请务必**：
1. 检查所有表的字符集为utf8mb4_unicode_ci
2. 确认所有外键约束符合业务需求
3. 根据实际数据量调整索引策略
4. 配置数据库备份策略
5. 设置审计日志归档规则（建议保留1年）

