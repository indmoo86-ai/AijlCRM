-- ===================================================================
-- 艾居来 CRM 核心DDL脚本（精简版）
-- ===================================================================
-- 包含所有28张表的核心字段结构
-- 完整字段定义请参考：requirements.md v9.1 §7 数据模型
-- ===================================================================

CREATE DATABASE IF NOT EXISTS aijulai_crm
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE aijulai_crm;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =============基础数据模块 (12张表)=============

-- 1. 产品分类表
CREATE TABLE product_category (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_code VARCHAR(50) NOT NULL UNIQUE,
  category_name VARCHAR(100) NOT NULL,
  description TEXT,
  status ENUM('active','inactive') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 产品SKU表
CREATE TABLE product (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_code VARCHAR(100) NOT NULL UNIQUE,
  product_name VARCHAR(200) NOT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  cost_price DECIMAL(15,2) DEFAULT 0,
  standard_price DECIMAL(15,2) DEFAULT 0,
  status ENUM('draft','active','discontinued') DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES product_category(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 客户表（含线索）
CREATE TABLE customer (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_code VARCHAR(50) NOT NULL UNIQUE,
  customer_name VARCHAR(200) NOT NULL,
  customer_type ENUM('chain_hotel','independent_hotel','distributor','homestay','apartment') NOT NULL,
  customer_stage ENUM('lead','initial_contact','prospect','negotiation','client','lost') DEFAULT 'lead',
  owner_id BIGINT UNSIGNED,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 客户联系人表
CREATE TABLE customer_contact (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT UNSIGNED NOT NULL,
  contact_name VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  is_primary TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customer(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. 客户来源渠道表
CREATE TABLE customer_source (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  source_code VARCHAR(50) NOT NULL UNIQUE,
  source_name VARCHAR(100) NOT NULL,
  status ENUM('active','inactive') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. 客户跟进记录表
CREATE TABLE customer_follow_up (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT UNSIGNED NOT NULL,
  follow_up_type ENUM('sales','after_sales') DEFAULT 'sales',
  follow_up_method ENUM('phone','wechat','visit','email','other') NOT NULL,
  follow_up_date DATE NOT NULL,
  follow_up_content TEXT NOT NULL,
  next_follow_up_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT UNSIGNED NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customer(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. 用户表
CREATE TABLE user (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  real_name VARCHAR(100) NOT NULL,
  status ENUM('active','disabled','locked') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. 角色表
CREATE TABLE role (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_code VARCHAR(50) NOT NULL UNIQUE,
  role_name VARCHAR(100) NOT NULL,
  is_system TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. 用户角色关联表
CREATE TABLE user_role (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  role_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_role (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES user(id),
  FOREIGN KEY (role_id) REFERENCES role(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. 权限表
CREATE TABLE permission (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  permission_code VARCHAR(100) NOT NULL UNIQUE,
  permission_name VARCHAR(100) NOT NULL,
  module VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. 角色权限关联表
CREATE TABLE role_permission (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_role_permission (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES role(id),
  FOREIGN KEY (permission_id) REFERENCES permission(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. 操作审计日志表
CREATE TABLE audit_log (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED,
  module VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id BIGINT UNSIGNED,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============业务流程模块 (16张表)=============

-- 13. 报价单主表
CREATE TABLE quotation (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  quotation_code VARCHAR(50) NOT NULL UNIQUE,
  customer_id BIGINT UNSIGNED NOT NULL,
  total_amount DECIMAL(15,2) DEFAULT 0,
  status ENUM('draft','sent','accepted','rejected','expired','replaced') DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT UNSIGNED NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customer(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. 报价单明细表
CREATE TABLE quotation_item (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  quotation_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  quantity DECIMAL(15,2) NOT NULL,
  actual_price DECIMAL(15,2) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  FOREIGN KEY (quotation_id) REFERENCES quotation(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. 合同主表
CREATE TABLE contract (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  contract_code VARCHAR(50) NOT NULL UNIQUE,
  customer_id BIGINT UNSIGNED NOT NULL,
  contract_amount DECIMAL(15,2) NOT NULL,
  status ENUM('draft','pending_approval','effective','completed','cancelled') DEFAULT 'draft',
  signing_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT UNSIGNED NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customer(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. 合同明细表
CREATE TABLE contract_item (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  contract_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  quantity DECIMAL(15,2) NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  FOREIGN KEY (contract_id) REFERENCES contract(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. 合同补充协议表
CREATE TABLE contract_amendment (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  contract_id BIGINT UNSIGNED NOT NULL,
  amendment_code VARCHAR(50) NOT NULL UNIQUE,
  amendment_content TEXT NOT NULL,
  signing_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES contract(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. 任务表
CREATE TABLE task (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  task_code VARCHAR(50) NOT NULL UNIQUE,
  task_title VARCHAR(200) NOT NULL,
  source_type VARCHAR(50) NOT NULL,
  source_id BIGINT UNSIGNED NOT NULL,
  task_type ENUM('follow_up','quotation_expiry','contract_reminder','shipment_reminder','payment_reminder','invoice_reminder','service_reminder','manual') NOT NULL,
  assigned_to BIGINT UNSIGNED NOT NULL,
  status ENUM('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  due_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. 任务模板表（预留v2.0）
CREATE TABLE task_template (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  template_name VARCHAR(100) NOT NULL,
  task_type VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. 任务提醒记录表（预留v2.0）
CREATE TABLE task_notification (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  task_id BIGINT UNSIGNED NOT NULL,
  notification_type ENUM('email','sms','system') NOT NULL,
  sent_at DATETIME NOT NULL,
  status ENUM('success','failed') NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. 发货单主表
CREATE TABLE shipment (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  shipment_code VARCHAR(50) NOT NULL UNIQUE,
  contract_id BIGINT UNSIGNED NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  shipment_date DATE NOT NULL,
  status ENUM('draft','confirmed','shipped','delivered','cancelled') DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES contract(id),
  FOREIGN KEY (customer_id) REFERENCES customer(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. 发货单明细表
CREATE TABLE shipment_item (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  shipment_id BIGINT UNSIGNED NOT NULL,
  contract_item_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  shipped_quantity DECIMAL(15,2) NOT NULL,
  FOREIGN KEY (shipment_id) REFERENCES shipment(id) ON DELETE CASCADE,
  FOREIGN KEY (contract_item_id) REFERENCES contract_item(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. 收款记录表
CREATE TABLE payment (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  payment_code VARCHAR(50) NOT NULL UNIQUE,
  contract_id BIGINT UNSIGNED NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  payment_amount DECIMAL(15,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method ENUM('bank_transfer','cash','check','other') NOT NULL,
  status ENUM('pending','confirmed','cancelled') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES contract(id),
  FOREIGN KEY (customer_id) REFERENCES customer(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. 发票记录表
CREATE TABLE invoice (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_code VARCHAR(50) NOT NULL UNIQUE,
  contract_id BIGINT UNSIGNED NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  invoice_type ENUM('vat_special','vat_common') NOT NULL,
  invoice_amount DECIMAL(15,2) NOT NULL,
  status ENUM('pending','issued','cancelled') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES contract(id),
  FOREIGN KEY (customer_id) REFERENCES customer(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. 服务工单表
CREATE TABLE service_ticket (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_code VARCHAR(50) NOT NULL UNIQUE,
  customer_id BIGINT UNSIGNED NOT NULL,
  contract_id BIGINT UNSIGNED,
  ticket_type ENUM('repair','replacement','support','inspection') NOT NULL,
  priority ENUM('urgent','high','medium','low') DEFAULT 'medium',
  status ENUM('pending','in_progress','pending_acceptance','resolved','closed') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customer(id),
  FOREIGN KEY (contract_id) REFERENCES contract(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 26. 服务工单操作记录表
CREATE TABLE service_ticket_log (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_id BIGINT UNSIGNED NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  action_description TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT UNSIGNED NOT NULL,
  FOREIGN KEY (ticket_id) REFERENCES service_ticket(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =============初始化数据=============
INSERT INTO role (role_code, role_name, is_system) VALUES
('admin', '系统管理员', 1),
('marketing', '营销人员', 1),
('sales', '销售人员', 1),
('finance', '财务人员', 1),
('operations', '运营人员', 1);

INSERT INTO customer_source (source_code, source_name) VALUES
('social_media', '新媒体营销'),
('exhibition', '线下展会'),
('referral', '老客户转介绍'),
('website', '官网咨询'),
('phone', '电话来访'),
('other', '其他');

INSERT INTO product_category (category_code, category_name) VALUES
('CHECKIN', '自助入住机'),
('SOCKET', '酒店插座'),
('SWITCH', '智能开关'),
('CURTAIN', '窗帘机'),
('AUDIO', '音响设备'),
('OTHER', '其他');

-- DDL脚本执行完成
SELECT '✅ 数据库初始化完成！共创建28张表' AS message;
