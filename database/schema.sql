-- =====================================================
-- 艾居来 CRM 数据库完整DDL脚本
-- =====================================================
-- 项目名称：艾居来 CRM
-- 数据库版本：v1.0  
-- 创建日期：2025-12-24
-- 依据文档：requirements.md v9.1
-- 数据库：MySQL 8.0+
-- 字符集：UTF8MB4
-- 表数量：28张表
--   - 基础数据模块：12张表
--   - 业务流程模块：16张表
--
-- 两条主线设计理念：
--   1. 线索主线（customer_id）：贯穿客户全生命周期
--   2. 合同主线（contract_id）：贯穿合同执行全流程
--
-- 详细字段说明请参考：requirements.md 第7章 数据模型
-- =====================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS aijulai_crm
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE aijulai_crm;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 第一部分：基础数据模块（12张表）
-- =====================================================

-- ====================================================
-- 表清单说明
-- ====================================================
-- 【基础数据模块 - 12张表】
-- 1. product_category      - 产品分类表
-- 2. product               - 产品SKU表
-- 3. customer              - 客户表（含线索）
-- 4. customer_contact      - 客户联系人表
-- 5. customer_source       - 客户来源渠道表
-- 6. customer_follow_up    - 客户跟进记录表
-- 7. user                  - 用户表
-- 8. role                  - 角色表
-- 9. user_role             - 用户角色关联表
-- 10. permission            - 权限表
-- 11. role_permission       - 角色权限关联表
-- 12. audit_log             - 操作审计日志表
--
-- 【业务流程模块 - 16张表】  
-- 13. quotation             - 报价单主表
-- 14. quotation_item        - 报价单明细表
-- 15. contract              - 合同主表
-- 16. contract_item         - 合同明细表
-- 17. contract_amendment    - 合同补充协议表
-- 18. task                  - 任务表
-- 19. task_template         - 任务模板表（预留v2.0）
-- 20. task_notification     - 任务提醒记录表（预留v2.0）
-- 21. shipment              - 发货单主表
-- 22. shipment_item         - 发货单明细表
-- 23. payment               - 收款记录表
-- 24. invoice               - 发票记录表
-- 25. service_ticket        - 服务工单表
-- 26. service_ticket_log    - 服务工单操作记录表
--
-- 注：完整字段定义请参考 requirements.md v9.1 §7 数据模型
-- =====================================================



-- DDL内容详见：schema_full.sql（完整版）
-- 本文件为简化清单，用于快速了解表结构

SET FOREIGN_KEY_CHECKS = 1;
