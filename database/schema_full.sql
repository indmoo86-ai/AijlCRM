-- =====================================================
-- 艾居来 CRM 系统 - 完整数据库架构 DDL
-- Generated from: requirements.md §7 数据模型
-- Database: aijulai_crm
-- Character Set: UTF8MB4
-- Total Tables: 26
-- =====================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS aijulai_crm
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE aijulai_crm;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 第一部分：基础数据模块（12张表）
-- =====================================================

-- -----------------------------------------------------
-- 7.1.1 产品分类表（product_category）
-- -----------------------------------------------------
DROP TABLE IF EXISTS product_category;
CREATE TABLE product_category (
  category_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
  category_code VARCHAR(50) NOT NULL COMMENT '分类编码',
  sort_order INT DEFAULT 0 COMMENT '排序号',
  description TEXT COMMENT '分类描述',
  is_active TINYINT DEFAULT 1 COMMENT '是否启用（1=启用，0=停用）',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  creator_id BIGINT NOT NULL COMMENT '创建人ID',
  PRIMARY KEY (category_id),
  UNIQUE KEY uk_category_code (category_code),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品分类表';

-- -----------------------------------------------------
-- 7.1.2 产品SKU表（product）
-- -----------------------------------------------------
DROP TABLE IF EXISTS product;
CREATE TABLE product (
  product_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '产品ID',
  product_code VARCHAR(100) NOT NULL COMMENT '产品编码',
  product_name VARCHAR(200) NOT NULL COMMENT '产品名称',
  brand VARCHAR(100) COMMENT '品牌',
  category_id BIGINT NOT NULL COMMENT '所属分类ID',
  supplier VARCHAR(200) COMMENT '供应商名称',
  cost_price DECIMAL(12,2) DEFAULT 0.00 COMMENT '成本价（元）',
  sale_price DECIMAL(12,2) DEFAULT 0.00 COMMENT '报价/销售价（元）',
  unit VARCHAR(20) DEFAULT '台' COMMENT '单位',
  product_images TEXT COMMENT '产品图片URL列表（JSON数组）',
  description TEXT COMMENT '产品描述/备注',
  status VARCHAR(20) DEFAULT 'active' COMMENT '产品状态（active=在售，inactive=停售，draft=草稿）',
  -- 预留扩展字段
  custom_field_1 VARCHAR(500) COMMENT '自定义字段1',
  custom_field_2 VARCHAR(500) COMMENT '自定义字段2',
  custom_field_3 VARCHAR(500) COMMENT '自定义字段3',
  custom_field_4 TEXT COMMENT '自定义字段4（可存储JSON）',
  custom_field_5 TEXT COMMENT '自定义字段5（可存储JSON）',
  custom_field_6 TEXT COMMENT '自定义字段6（可存储JSON）',
  -- 权限控制字段（预留）
  owner_id BIGINT COMMENT '负责人ID',
  department_id BIGINT COMMENT '所属部门ID',
  data_permission_level TINYINT DEFAULT 0 COMMENT '数据权限级别（0=公开，1=部门，2=个人）',
  -- 审计字段
  created_by BIGINT NOT NULL COMMENT '创建人ID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_by BIGINT COMMENT '修改人ID',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted_at DATETIME COMMENT '软删除时间',
  PRIMARY KEY (product_id),
  UNIQUE KEY uk_product_code (product_code),
  INDEX idx_category_id (category_id),
  INDEX idx_brand (brand),
  INDEX idx_status (status),
  INDEX idx_supplier (supplier),
  INDEX idx_created_by (created_by),
  INDEX idx_created_at (created_at),
  INDEX idx_deleted_at (deleted_at),
  CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES product_category(category_id),
  CONSTRAINT chk_product_cost_price CHECK (cost_price >= 0),
  CONSTRAINT chk_product_sale_price CHECK (sale_price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品SKU表';

-- -----------------------------------------------------
-- 7.2.1 客户表（customer）
-- -----------------------------------------------------
DROP TABLE IF EXISTS customer;
CREATE TABLE customer (
  customer_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '客户ID',
  customer_code VARCHAR(100) NOT NULL COMMENT '客户编码',
  customer_name VARCHAR(200) NOT NULL COMMENT '客户名称（公司名称）',
  customer_type VARCHAR(50) NOT NULL COMMENT '客户类型（chain_hotel=连锁酒店集团，single_hotel=单体酒店，distributor=经销商，homestay=民宿，apartment=公寓）',
  customer_level VARCHAR(20) COMMENT '客户等级（A=大客户，B=中型客户，C=小客户）',
  customer_stage VARCHAR(50) NOT NULL COMMENT '客户阶段（lead=销售线索，initial_contact=初步接触，prospect=意向客户，negotiation=商务洽谈，client=成交客户，inactive=流失客户）',
  industry VARCHAR(100) COMMENT '行业',
  province VARCHAR(50) COMMENT '省份',
  city VARCHAR(50) COMMENT '城市',
  address VARCHAR(500) COMMENT '详细地址',
  contact_phone VARCHAR(50) COMMENT '客户联系电话（总机）',
  hotel_rooms INT COMMENT '酒店房间数量',
  hotel_star VARCHAR(20) COMMENT '酒店星级',
  source VARCHAR(50) COMMENT '客户来源（social_media=新媒体营销，exhibition=线下展会，referral=老客户转介绍，website=官网咨询，phone=电话来访，other=其他）',
  description TEXT COMMENT '备注',
  -- 预留扩展字段
  custom_field_1 VARCHAR(500) COMMENT '自定义字段1',
  custom_field_2 VARCHAR(500) COMMENT '自定义字段2',
  custom_field_3 VARCHAR(500) COMMENT '自定义字段3',
  custom_field_4 TEXT COMMENT '自定义字段4（可存储JSON）',
  custom_field_5 TEXT COMMENT '自定义字段5（可存储JSON）',
  -- 权限控制字段
  creator_id BIGINT NOT NULL COMMENT '创建人ID',
  owner_id BIGINT NOT NULL COMMENT '负责人ID（销售人员）',
  department_id BIGINT COMMENT '所属部门ID',
  data_permission_level TINYINT DEFAULT 0 COMMENT '数据权限级别（0=公开，1=部门，2=个人）',
  -- 审计字段
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  stage_updated_at DATETIME COMMENT '阶段最后更新时间',
  deleted_at DATETIME COMMENT '软删除时间',
  PRIMARY KEY (customer_id),
  UNIQUE KEY uk_customer_code (customer_code),
  INDEX idx_customer_stage (customer_stage),
  INDEX idx_customer_type (customer_type),
  INDEX idx_customer_level (customer_level),
  INDEX idx_owner_id (owner_id),
  INDEX idx_source (source),
  INDEX idx_province_city (province, city),
  INDEX idx_created_at (created_at),
  INDEX idx_stage_updated_at (stage_updated_at),
  INDEX idx_deleted_at (deleted_at),
  CONSTRAINT chk_customer_hotel_rooms CHECK (hotel_rooms IS NULL OR hotel_rooms >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户表';

-- -----------------------------------------------------
-- 7.2.2 客户联系人表（customer_contact）
-- -----------------------------------------------------
DROP TABLE IF EXISTS customer_contact;
CREATE TABLE customer_contact (
  contact_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '联系人ID',
  customer_id BIGINT NOT NULL COMMENT '所属客户ID',
  contact_name VARCHAR(100) NOT NULL COMMENT '联系人姓名',
  position VARCHAR(100) COMMENT '职位',
  mobile VARCHAR(50) COMMENT '手机号',
  wechat VARCHAR(100) COMMENT '微信号',
  email VARCHAR(200) COMMENT '邮箱',
  is_primary TINYINT DEFAULT 0 COMMENT '是否主要联系人（1=是，0=否）',
  description TEXT COMMENT '备注',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  creator_id BIGINT NOT NULL COMMENT '创建人ID',
  PRIMARY KEY (contact_id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_is_primary (is_primary),
  INDEX idx_mobile (mobile),
  CONSTRAINT fk_contact_customer FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户联系人表';

-- -----------------------------------------------------
-- 7.2.3 客户来源渠道表（customer_source）- 可选字典表
-- -----------------------------------------------------
DROP TABLE IF EXISTS customer_source;
CREATE TABLE customer_source (
  source_id INT NOT NULL AUTO_INCREMENT COMMENT '来源ID',
  source_code VARCHAR(50) NOT NULL COMMENT '来源编码',
  source_name VARCHAR(100) NOT NULL COMMENT '来源名称',
  is_active TINYINT DEFAULT 1 COMMENT '是否启用',
  sort_order INT DEFAULT 0 COMMENT '排序号',
  description TEXT COMMENT '描述',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (source_id),
  UNIQUE KEY uk_source_code (source_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户来源渠道表（字典表）';

-- -----------------------------------------------------
-- 7.2.4 客户跟进记录表（customer_follow_up）
-- -----------------------------------------------------
DROP TABLE IF EXISTS customer_follow_up;
CREATE TABLE customer_follow_up (
  follow_up_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '跟进记录ID',
  customer_id BIGINT NOT NULL COMMENT '所属客户ID',
  follow_up_type VARCHAR(20) NOT NULL COMMENT '跟进类型（sales=销售跟进，after_sales=售后回访）',
  follow_up_method VARCHAR(20) NOT NULL COMMENT '跟进方式（phone=电话，wechat=微信，visit=拜访，email=邮件，other=其他）',
  follow_up_time DATETIME NOT NULL COMMENT '跟进时间',
  contact_person VARCHAR(100) COMMENT '联系的对方人员姓名',
  follow_up_content TEXT NOT NULL COMMENT '跟进内容',
  customer_feedback TEXT COMMENT '客户反馈',
  next_follow_up_time DATETIME COMMENT '下次跟进计划时间',
  next_follow_up_content VARCHAR(500) COMMENT '下次跟进计划内容',
  stage_before VARCHAR(50) COMMENT '跟进前客户阶段',
  stage_after VARCHAR(50) COMMENT '跟进后客户阶段',
  is_stage_changed TINYINT DEFAULT 0 COMMENT '本次跟进是否变更了客户阶段（1=是，0=否）',
  attachment_urls TEXT COMMENT '附件URL列表（JSON数组）',
  follow_up_result VARCHAR(20) COMMENT '跟进结果（successful=成功推进，pending=待定，failed=失败/拒绝）',
  -- 审计字段
  creator_id BIGINT NOT NULL COMMENT '跟进人ID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted_at DATETIME COMMENT '软删除时间',
  PRIMARY KEY (follow_up_id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_follow_up_type (follow_up_type),
  INDEX idx_follow_up_time (follow_up_time),
  INDEX idx_creator_id (creator_id),
  INDEX idx_next_follow_up_time (next_follow_up_time),
  INDEX idx_is_stage_changed (is_stage_changed),
  INDEX idx_created_at (created_at),
  INDEX idx_deleted_at (deleted_at),
  CONSTRAINT fk_followup_customer FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户跟进记录表';

-- -----------------------------------------------------
-- 7.3.1 用户表（user）
-- -----------------------------------------------------
DROP TABLE IF EXISTS user;
CREATE TABLE user (
  user_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  user_code VARCHAR(50) COMMENT '用户工号',
  real_name VARCHAR(100) NOT NULL COMMENT '真实姓名',
  mobile VARCHAR(20) NOT NULL COMMENT '手机号（用于登录）',
  email VARCHAR(200) COMMENT '邮箱',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希值',
  avatar VARCHAR(500) COMMENT '头像URL',
  is_active TINYINT DEFAULT 1 COMMENT '是否启用（1=启用，0=禁用）',
  is_first_login TINYINT DEFAULT 1 COMMENT '是否首次登录（1=是，0=否）',
  last_login_at DATETIME COMMENT '最后登录时间',
  last_login_ip VARCHAR(50) COMMENT '最后登录IP',
  failed_login_count INT DEFAULT 0 COMMENT '连续登录失败次数',
  locked_until DATETIME COMMENT '账户锁定截止时间',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  creator_id BIGINT COMMENT '创建人ID',
  deleted_at DATETIME COMMENT '软删除时间',
  PRIMARY KEY (user_id),
  UNIQUE KEY uk_mobile (mobile),
  UNIQUE KEY uk_user_code (user_code),
  INDEX idx_is_active (is_active),
  INDEX idx_created_at (created_at),
  INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- -----------------------------------------------------
-- 7.3.2 角色表（role）
-- -----------------------------------------------------
DROP TABLE IF EXISTS role;
CREATE TABLE role (
  role_id INT NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  role_code VARCHAR(50) NOT NULL COMMENT '角色编码',
  role_name VARCHAR(100) NOT NULL COMMENT '角色名称',
  description TEXT COMMENT '角色描述',
  is_system TINYINT DEFAULT 1 COMMENT '是否系统内置角色（1=是，0=否）',
  sort_order INT DEFAULT 0 COMMENT '排序号',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (role_id),
  UNIQUE KEY uk_role_code (role_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- -----------------------------------------------------
-- 7.3.3 用户角色关联表（user_role）
-- -----------------------------------------------------
DROP TABLE IF EXISTS user_role;
CREATE TABLE user_role (
  user_role_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '关联ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  role_id INT NOT NULL COMMENT '角色ID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
  creator_id BIGINT NOT NULL COMMENT '分配人ID',
  PRIMARY KEY (user_role_id),
  UNIQUE KEY uk_user_role (user_id, role_id),
  INDEX idx_user_id (user_id),
  INDEX idx_role_id (role_id),
  CONSTRAINT fk_userrole_user FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_userrole_role FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';

-- -----------------------------------------------------
-- 7.3.4 权限表（permission）
-- -----------------------------------------------------
DROP TABLE IF EXISTS permission;
CREATE TABLE permission (
  permission_id INT NOT NULL AUTO_INCREMENT COMMENT '权限ID',
  permission_code VARCHAR(100) NOT NULL COMMENT '权限编码',
  permission_name VARCHAR(100) NOT NULL COMMENT '权限名称',
  module_name VARCHAR(50) NOT NULL COMMENT '所属模块',
  permission_type VARCHAR(20) NOT NULL COMMENT '权限类型（menu=菜单访问，action=操作权限）',
  sort_order INT DEFAULT 0 COMMENT '排序号',
  description TEXT COMMENT '权限描述',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (permission_id),
  UNIQUE KEY uk_permission_code (permission_code),
  INDEX idx_module_name (module_name),
  INDEX idx_permission_type (permission_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';

-- -----------------------------------------------------
-- 7.3.5 角色权限关联表（role_permission）
-- -----------------------------------------------------
DROP TABLE IF EXISTS role_permission;
CREATE TABLE role_permission (
  role_permission_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '关联ID',
  role_id INT NOT NULL COMMENT '角色ID',
  permission_id INT NOT NULL COMMENT '权限ID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
  creator_id BIGINT NOT NULL COMMENT '分配人ID',
  PRIMARY KEY (role_permission_id),
  UNIQUE KEY uk_role_permission (role_id, permission_id),
  INDEX idx_role_id (role_id),
  INDEX idx_permission_id (permission_id),
  CONSTRAINT fk_roleperm_role FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE CASCADE,
  CONSTRAINT fk_roleperm_permission FOREIGN KEY (permission_id) REFERENCES permission(permission_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';

-- -----------------------------------------------------
-- 7.3.6 操作审计日志表（audit_log）
-- -----------------------------------------------------
DROP TABLE IF EXISTS audit_log;
CREATE TABLE audit_log (
  log_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  user_id BIGINT NOT NULL COMMENT '操作人ID',
  user_name VARCHAR(100) NOT NULL COMMENT '操作人姓名（冗余）',
  module_name VARCHAR(50) NOT NULL COMMENT '操作模块',
  action_type VARCHAR(50) NOT NULL COMMENT '操作类型（create=新增，update=修改，delete=删除，view=查看，login=登录，logout=登出）',
  action_desc TEXT NOT NULL COMMENT '操作描述',
  target_type VARCHAR(50) COMMENT '操作对象类型',
  target_id BIGINT COMMENT '操作对象ID',
  request_ip VARCHAR(50) COMMENT '请求IP地址',
  request_url VARCHAR(500) COMMENT '请求URL',
  request_method VARCHAR(10) COMMENT '请求方法（GET/POST/PUT/DELETE）',
  request_params TEXT COMMENT '请求参数（JSON格式，敏感信息需脱敏）',
  response_status INT COMMENT '响应状态码',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (log_id),
  INDEX idx_user_id (user_id),
  INDEX idx_module_name (module_name),
  INDEX idx_action_type (action_type),
  INDEX idx_target_type_id (target_type, target_id),
  INDEX idx_created_at (created_at),
  CONSTRAINT fk_auditlog_user FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作审计日志表';

-- =====================================================
-- 第二部分：业务流程模块（14张表）
-- =====================================================

-- -----------------------------------------------------
-- 7.4.1 报价单主表（quotation）
-- -----------------------------------------------------
DROP TABLE IF EXISTS quotation;
CREATE TABLE quotation (
  quotation_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '报价单ID',
  quotation_no VARCHAR(100) NOT NULL COMMENT '报价单编号',
  quotation_title VARCHAR(200) NOT NULL COMMENT '报价单标题',
  customer_id BIGINT NOT NULL COMMENT '客户ID',
  customer_contact_id BIGINT COMMENT '客户联系人ID',
  status VARCHAR(20) NOT NULL COMMENT '报价单状态（draft=草稿，sent=已发送，accepted=已接受，rejected=已拒绝，expired=已过期，superseded=已被替代）',
  total_amount DECIMAL(12,2) NOT NULL COMMENT '报价总金额',
  discount_total DECIMAL(12,2) DEFAULT 0.00 COMMENT '总优惠金额',
  payment_terms TEXT COMMENT '付款条件',
  delivery_terms TEXT COMMENT '交付条件',
  valid_from DATE NOT NULL COMMENT '生效日期',
  valid_until DATE NOT NULL COMMENT '失效日期',
  extension_count INT DEFAULT 0 COMMENT '延期次数',
  last_extension_at DATETIME COMMENT '最后延期时间',
  pdf_file_url VARCHAR(500) COMMENT '生成的PDF文件URL',
  pdf_generated_at DATETIME COMMENT 'PDF生成时间',
  notes TEXT COMMENT '备注说明',
  -- 关联字段
  source_quotation_id BIGINT COMMENT '来源报价单ID',
  related_contract_id BIGINT COMMENT '关联合同ID',
  -- 权限控制字段
  owner_id BIGINT NOT NULL COMMENT '负责人ID',
  department_id BIGINT COMMENT '所属部门ID',
  data_permission_level TINYINT DEFAULT 0 COMMENT '数据权限级别（0=公开，1=部门，2=个人）',
  -- 审计字段
  created_by BIGINT NOT NULL COMMENT '创建人ID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_by BIGINT COMMENT '修改人ID',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  sent_at DATETIME COMMENT '发送时间',
  sent_by BIGINT COMMENT '发送人ID',
  deleted_at DATETIME COMMENT '软删除时间',
  PRIMARY KEY (quotation_id),
  UNIQUE KEY uk_quotation_no (quotation_no),
  INDEX idx_customer_id (customer_id),
  INDEX idx_status (status),
  INDEX idx_owner_id (owner_id),
  INDEX idx_created_at (created_at),
  INDEX idx_valid_until (valid_until),
  INDEX idx_sent_at (sent_at),
  INDEX idx_deleted_at (deleted_at),
  CONSTRAINT fk_quotation_customer FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE RESTRICT,
  CONSTRAINT fk_quotation_contact FOREIGN KEY (customer_contact_id) REFERENCES customer_contact(contact_id) ON DELETE SET NULL,
  CONSTRAINT chk_quotation_total_amount CHECK (total_amount >= 0),
  CONSTRAINT chk_quotation_discount_total CHECK (discount_total >= 0),
  CONSTRAINT chk_quotation_valid_dates CHECK (valid_until >= valid_from),
  CONSTRAINT chk_quotation_extension_count CHECK (extension_count >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报价单主表';

-- -----------------------------------------------------
-- 7.4.2 报价单明细表（quotation_item）
-- -----------------------------------------------------
DROP TABLE IF EXISTS quotation_item;
CREATE TABLE quotation_item (
  item_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '明细ID',
  quotation_id BIGINT NOT NULL COMMENT '报价单ID',
  product_id BIGINT NOT NULL COMMENT '产品ID',
  product_code VARCHAR(100) NOT NULL COMMENT '产品编码（冗余）',
  product_name VARCHAR(200) NOT NULL COMMENT '产品名称（冗余）',
  product_unit VARCHAR(20) NOT NULL COMMENT '单位（冗余）',
  quantity DECIMAL(10,2) NOT NULL COMMENT '数量',
  standard_price DECIMAL(12,2) NOT NULL COMMENT '标准报价',
  actual_price DECIMAL(12,2) NOT NULL COMMENT '实际销售单价',
  discount_amount DECIMAL(12,2) DEFAULT 0.00 COMMENT '优惠金额',
  discount_rate DECIMAL(5,2) DEFAULT 0.00 COMMENT '折扣率（%）',
  subtotal DECIMAL(12,2) NOT NULL COMMENT '小计',
  sort_order INT DEFAULT 0 COMMENT '排序号',
  item_note VARCHAR(500) COMMENT '明细备注',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (item_id),
  INDEX idx_quotation_id (quotation_id),
  INDEX idx_product_id (product_id),
  CONSTRAINT fk_quotitem_quotation FOREIGN KEY (quotation_id) REFERENCES quotation(quotation_id) ON DELETE CASCADE,
  CONSTRAINT fk_quotitem_product FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE RESTRICT,
  CONSTRAINT chk_quotitem_quantity CHECK (quantity > 0),
  CONSTRAINT chk_quotitem_standard_price CHECK (standard_price >= 0),
  CONSTRAINT chk_quotitem_actual_price CHECK (actual_price >= 0),
  CONSTRAINT chk_quotitem_discount_amount CHECK (discount_amount >= 0),
  CONSTRAINT chk_quotitem_discount_rate CHECK (discount_rate >= 0 AND discount_rate <= 100),
  CONSTRAINT chk_quotitem_subtotal CHECK (subtotal >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报价单明细表';

-- -----------------------------------------------------
-- 7.5.1 合同主表（contract）
-- -----------------------------------------------------
DROP TABLE IF EXISTS contract;
CREATE TABLE contract (
  contract_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '合同ID',
  contract_no VARCHAR(100) NOT NULL COMMENT '合同编号',
  contract_title VARCHAR(200) NOT NULL COMMENT '合同标题',
  customer_id BIGINT NOT NULL COMMENT '客户ID',
  customer_contact_id BIGINT COMMENT '客户联系人ID',
  status VARCHAR(20) NOT NULL COMMENT '合同状态（draft=草稿，under_review=待审核，approved=已批准，signed=已签订，executing=执行中，completed=已完成，terminated=已终止）',
  contract_amount DECIMAL(12,2) NOT NULL COMMENT '合同总金额',
  -- 条款字段
  payment_terms JSON COMMENT '付款条款（JSON格式）',
  delivery_terms TEXT COMMENT '交付条款',
  warranty_terms JSON COMMENT '质保条款（JSON格式）',
  penalty_terms TEXT COMMENT '违约条款',
  additional_terms TEXT COMMENT '补充条款',
  -- 日期字段
  signed_date DATE COMMENT '合同签订日期',
  delivery_deadline DATE COMMENT '交付期限',
  actual_delivery_date DATE COMMENT '实际交付日期',
  warranty_start_date DATE COMMENT '质保期开始日期',
  warranty_end_date DATE COMMENT '质保期结束日期',
  -- 执行进度字段（冗余统计）
  shipped_amount DECIMAL(12,2) DEFAULT 0.00 COMMENT '已发货金额',
  received_amount DECIMAL(12,2) DEFAULT 0.00 COMMENT '已收款金额',
  invoiced_amount DECIMAL(12,2) DEFAULT 0.00 COMMENT '已开票金额',
  execution_progress DECIMAL(5,2) DEFAULT 0.00 COMMENT '执行进度百分比',
  -- 文件管理字段
  contract_file_url VARCHAR(500) COMMENT '合同文件URL',
  contract_file_uploaded_at DATETIME COMMENT '合同文件上传时间',
  contract_file_version INT DEFAULT 1 COMMENT '合同文件版本号',
  -- 关联字段
  source_quotation_id BIGINT COMMENT '来源报价单ID',
  -- 权限控制字段
  owner_id BIGINT NOT NULL COMMENT '负责人ID',
  department_id BIGINT COMMENT '所属部门ID',
  data_permission_level TINYINT DEFAULT 0 COMMENT '数据权限级别（0=公开，1=部门，2=个人）',
  -- 审计字段
  created_by BIGINT NOT NULL COMMENT '创建人ID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_by BIGINT COMMENT '修改人ID',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  signed_by BIGINT COMMENT '签订确认人ID',
  deleted_at DATETIME COMMENT '软删除时间',
  PRIMARY KEY (contract_id),
  UNIQUE KEY uk_contract_no (contract_no),
  INDEX idx_customer_id (customer_id),
  INDEX idx_status (status),
  INDEX idx_owner_id (owner_id),
  INDEX idx_signed_date (signed_date),
  INDEX idx_delivery_deadline (delivery_deadline),
  INDEX idx_warranty_end_date (warranty_end_date),
  INDEX idx_created_at (created_at),
  INDEX idx_deleted_at (deleted_at),
  CONSTRAINT fk_contract_customer FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE RESTRICT,
  CONSTRAINT fk_contract_contact FOREIGN KEY (customer_contact_id) REFERENCES customer_contact(contact_id) ON DELETE SET NULL,
  CONSTRAINT fk_contract_quotation FOREIGN KEY (source_quotation_id) REFERENCES quotation(quotation_id) ON DELETE RESTRICT,
  CONSTRAINT chk_contract_amount CHECK (contract_amount >= 0),
  CONSTRAINT chk_contract_shipped_amount CHECK (shipped_amount >= 0 AND shipped_amount <= contract_amount),
  CONSTRAINT chk_contract_received_amount CHECK (received_amount >= 0 AND received_amount <= contract_amount),
  CONSTRAINT chk_contract_invoiced_amount CHECK (invoiced_amount >= 0 AND invoiced_amount <= contract_amount),
  CONSTRAINT chk_contract_execution_progress CHECK (execution_progress >= 0 AND execution_progress <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='合同主表';

-- -----------------------------------------------------
-- 7.5.2 合同明细表（contract_item）
-- -----------------------------------------------------
DROP TABLE IF EXISTS contract_item;
CREATE TABLE contract_item (
  item_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '明细ID',
  contract_id BIGINT NOT NULL COMMENT '合同ID',
  product_id BIGINT NOT NULL COMMENT '产品ID',
  product_code VARCHAR(100) NOT NULL COMMENT '产品编码（冗余）',
  product_name VARCHAR(200) NOT NULL COMMENT '产品名称（冗余）',
  product_unit VARCHAR(20) NOT NULL COMMENT '单位（冗余）',
  quantity DECIMAL(10,2) NOT NULL COMMENT '数量',
  unit_price DECIMAL(12,2) NOT NULL COMMENT '单价',
  subtotal DECIMAL(12,2) NOT NULL COMMENT '小计',
  sort_order INT DEFAULT 0 COMMENT '排序号',
  item_note VARCHAR(500) COMMENT '明细备注',
  -- 执行进度字段
  shipped_quantity DECIMAL(10,2) DEFAULT 0.00 COMMENT '已发货数量',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (item_id),
  INDEX idx_contract_id (contract_id),
  INDEX idx_product_id (product_id),
  CONSTRAINT fk_contitem_contract FOREIGN KEY (contract_id) REFERENCES contract(contract_id) ON DELETE CASCADE,
  CONSTRAINT fk_contitem_product FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE RESTRICT,
  CONSTRAINT chk_contitem_quantity CHECK (quantity > 0),
  CONSTRAINT chk_contitem_unit_price CHECK (unit_price >= 0),
  CONSTRAINT chk_contitem_subtotal CHECK (subtotal >= 0),
  CONSTRAINT chk_contitem_shipped_quantity CHECK (shipped_quantity >= 0 AND shipped_quantity <= quantity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='合同明细表';

-- -----------------------------------------------------
-- 7.5.3 合同补充协议表（contract_amendment）
-- -----------------------------------------------------
DROP TABLE IF EXISTS contract_amendment;
CREATE TABLE contract_amendment (
  amendment_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '补充协议ID',
  amendment_no VARCHAR(100) NOT NULL COMMENT '补充协议编号',
  contract_id BIGINT NOT NULL COMMENT '原合同ID',
  amendment_type VARCHAR(50) NOT NULL COMMENT '变更类型（product_change=产品变更，amount_change=金额变更，term_change=条款变更，deadline_change=期限变更，other=其他）',
  amendment_title VARCHAR(200) NOT NULL COMMENT '补充协议标题',
  amendment_content TEXT NOT NULL COMMENT '变更内容说明',
  amount_change DECIMAL(12,2) DEFAULT 0.00 COMMENT '金额变化（正数=增加，负数=减少）',
  new_contract_amount DECIMAL(12,2) COMMENT '变更后的合同总金额',
  signed_date DATE COMMENT '补充协议签订日期',
  amendment_file_url VARCHAR(500) COMMENT '补充协议文件URL',
  status VARCHAR(20) NOT NULL COMMENT '状态（draft=草稿，signed=已签订，cancelled=已取消）',
  -- 审计字段
  created_by BIGINT NOT NULL COMMENT '创建人ID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_by BIGINT COMMENT '修改人ID',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted_at DATETIME COMMENT '软删除时间',
  PRIMARY KEY (amendment_id),
  UNIQUE KEY uk_amendment_no (amendment_no),
  INDEX idx_contract_id (contract_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  CONSTRAINT fk_amendment_contract FOREIGN KEY (contract_id) REFERENCES contract(contract_id) ON DELETE RESTRICT,
  CONSTRAINT chk_amendment_new_amount CHECK (new_contract_amount IS NULL OR new_contract_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='合同补充协议表';

-- -----------------------------------------------------
-- 7.6.1 任务表（task）
-- -----------------------------------------------------
DROP TABLE IF EXISTS task;
CREATE TABLE task (
  task_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '任务ID',
  task_type VARCHAR(50) NOT NULL COMMENT '任务类型',
  task_title VARCHAR(200) NOT NULL COMMENT '任务标题',
  task_description TEXT COMMENT '任务描述',
  priority VARCHAR(20) DEFAULT 'medium' COMMENT '优先级（high=高，medium=中，low=低）',
  status VARCHAR(20) NOT NULL COMMENT '任务状态（pending=待处理，in_progress=处理中，completed=已完成，cancelled=已取消，overdue=已逾期）',
  -- 关联业务对象字段
  source_type VARCHAR(50) COMMENT '源业务对象类型',
  source_id BIGINT COMMENT '源业务对象ID',
  unique_key VARCHAR(200) COMMENT '防重键',
  -- 任务时间字段
  due_date DATE COMMENT '截止日期',
  due_time TIME COMMENT '截止时间',
  reminder_time DATETIME COMMENT '提前提醒时间',
  -- 任务分配字段
  assignee_id BIGINT NOT NULL COMMENT '任务负责人ID',
  assigner_id BIGINT COMMENT '任务分配人ID',
  assigned_at DATETIME COMMENT '任务分配时间',
  -- 任务执行字段
  started_at DATETIME COMMENT '任务开始处理时间',
  completed_at DATETIME COMMENT '任务完成时间',
  cancelled_at DATETIME COMMENT '任务取消时间',
  cancel_reason VARCHAR(500) COMMENT '取消原因',
  result_note TEXT COMMENT '任务处理结果备注',
  -- 提醒通知字段
  is_notified TINYINT DEFAULT 0 COMMENT '是否已发送提醒通知（1=已发送，0=未发送）',
  notified_at DATETIME COMMENT '提醒发送时间',
  notification_channels JSON COMMENT '提醒渠道记录（JSON格式）',
  -- 审计字段
  created_by BIGINT COMMENT '创建人ID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_by BIGINT COMMENT '修改人ID',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted_at DATETIME COMMENT '软删除时间',
  PRIMARY KEY (task_id),
  UNIQUE KEY uk_unique_key (unique_key),
  INDEX idx_task_type (task_type),
  INDEX idx_status (status),
  INDEX idx_assignee_id (assignee_id),
  INDEX idx_due_date (due_date),
  INDEX idx_source_type_id (source_type, source_id),
  INDEX idx_priority (priority),
  INDEX idx_created_at (created_at),
  INDEX idx_deleted_at (deleted_at),
  CONSTRAINT chk_task_priority CHECK (priority IN ('high', 'medium', 'low')),
  CONSTRAINT chk_task_status CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'overdue'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务表';

-- -----------------------------------------------------
-- 7.6.2 任务模板表（task_template）- 预留v2.0
-- -----------------------------------------------------
DROP TABLE IF EXISTS task_template;
CREATE TABLE task_template (
  template_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '模板ID',
  template_name VARCHAR(100) NOT NULL COMMENT '模板名称',
  template_type VARCHAR(50) NOT NULL COMMENT '模板类型',
  task_title_template VARCHAR(200) NOT NULL COMMENT '任务标题模板',
  task_description_template TEXT COMMENT '任务描述模板',
  default_priority VARCHAR(20) DEFAULT 'medium' COMMENT '默认优先级',
  default_due_days INT COMMENT '默认截止天数',
  is_active TINYINT DEFAULT 1 COMMENT '是否启用',
  created_by BIGINT NOT NULL COMMENT '创建人ID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_by BIGINT COMMENT '修改人ID',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (template_id),
  INDEX idx_template_type (template_type),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务模板表（预留v2.0）';

-- -----------------------------------------------------
-- 7.6.3 任务提醒记录表（task_notification）- 预留v2.0
-- -----------------------------------------------------
DROP TABLE IF EXISTS task_notification;
CREATE TABLE task_notification (
  notification_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '提醒记录ID',
  task_id BIGINT NOT NULL COMMENT '任务ID',
  notification_channel VARCHAR(20) NOT NULL COMMENT '提醒渠道（system=系统内，email=邮件，wechat=微信，sms=短信）',
  recipient_user_id BIGINT NOT NULL COMMENT '接收人ID',
  notification_title VARCHAR(200) NOT NULL COMMENT '提醒标题',
  notification_content TEXT COMMENT '提醒内容',
  sent_at DATETIME NOT NULL COMMENT '发送时间',
  is_read TINYINT DEFAULT 0 COMMENT '是否已读（1=已读，0=未读）',
  read_at DATETIME COMMENT '阅读时间',
  send_status VARCHAR(20) NOT NULL COMMENT '发送状态（success=成功，failed=失败，pending=待发送）',
  error_message VARCHAR(500) COMMENT '失败错误信息',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (notification_id),
  INDEX idx_task_id (task_id),
  INDEX idx_recipient_user_id (recipient_user_id),
  INDEX idx_notification_channel (notification_channel),
  INDEX idx_is_read (is_read),
  INDEX idx_sent_at (sent_at),
  CONSTRAINT fk_tasknotif_task FOREIGN KEY (task_id) REFERENCES task(task_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务提醒记录表（预留v2.0）';

-- -----------------------------------------------------
-- 7.7.1 发货单主表（shipment）
-- -----------------------------------------------------
DROP TABLE IF EXISTS shipment;
CREATE TABLE shipment (
  shipment_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '发货单ID',
  shipment_no VARCHAR(100) NOT NULL COMMENT '发货单编号',
  shipment_title VARCHAR(200) NOT NULL COMMENT '发货单标题',
  contract_id BIGINT NOT NULL COMMENT '合同ID',
  customer_id BIGINT NOT NULL COMMENT '客户ID（冗余）',
  status VARCHAR(20) NOT NULL COMMENT '发货状态（draft=草稿，pending=待发货，shipped=已发货，in_transit=运输中，delivered=已签收，cancelled=已取消）',
  -- 物流信息字段
  logistics_company VARCHAR(100) COMMENT '物流公司',
  tracking_no VARCHAR(100) COMMENT '运单号',
  shipping_address TEXT COMMENT '收货地址',
  contact_person VARCHAR(100) COMMENT '收货联系人姓名',
  contact_phone VARCHAR(50) COMMENT '收货联系人电话',
  -- 日期字段
  planned_ship_date DATE COMMENT '计划发货日期',
  actual_ship_date DATE COMMENT '实际发货日期',
  estimated_delivery_date DATE COMMENT '预计到货日期',
  actual_delivery_date DATE COMMENT '实际签收日期',
  -- 金额字段
  shipment_amount DECIMAL(12,2) NOT NULL COMMENT '本次发货金额',
  -- 备注字段
  notes TEXT COMMENT '发货备注',
  cancel_reason VARCHAR(500) COMMENT '取消原因',
  -- 权限控制字段
  owner_id BIGINT NOT NULL COMMENT '负责人ID',
  department_id BIGINT COMMENT '所属部门ID',
  data_permission_level TINYINT DEFAULT 0 COMMENT '数据权限级别（0=公开，1=部门，2=个人）',
  -- 审计字段
  created_by BIGINT NOT NULL COMMENT '创建人ID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_by BIGINT COMMENT '修改人ID',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  shipped_by BIGINT COMMENT '发货确认人ID',
  shipped_at DATETIME COMMENT '发货确认时间',
  delivered_by BIGINT COMMENT '签收确认人ID',
  delivered_at DATETIME COMMENT '签收确认时间',
  deleted_at DATETIME COMMENT '软删除时间',
  PRIMARY KEY (shipment_id),
  UNIQUE KEY uk_shipment_no (shipment_no),
  INDEX idx_contract_id (contract_id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_status (status),
  INDEX idx_owner_id (owner_id),
  INDEX idx_planned_ship_date (planned_ship_date),
  INDEX idx_actual_ship_date (actual_ship_date),
  INDEX idx_created_at (created_at),
  INDEX idx_deleted_at (deleted_at),
  CONSTRAINT fk_shipment_contract FOREIGN KEY (contract_id) REFERENCES contract(contract_id) ON DELETE RESTRICT,
  CONSTRAINT fk_shipment_customer FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE RESTRICT,
  CONSTRAINT chk_shipment_amount CHECK (shipment_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='发货单主表';

-- -----------------------------------------------------
-- 7.7.2 发货单明细表（shipment_item）
-- -----------------------------------------------------
DROP TABLE IF EXISTS shipment_item;
CREATE TABLE shipment_item (
  item_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '明细ID',
  shipment_id BIGINT NOT NULL COMMENT '发货单ID',
  contract_item_id BIGINT NOT NULL COMMENT '合同明细ID',
  product_id BIGINT NOT NULL COMMENT '产品ID',
  product_code VARCHAR(100) NOT NULL COMMENT '产品编码（冗余）',
  product_name VARCHAR(200) NOT NULL COMMENT '产品名称（冗余）',
  product_unit VARCHAR(20) NOT NULL COMMENT '单位（冗余）',
  -- 数量字段
  contract_quantity DECIMAL(10,2) NOT NULL COMMENT '合同约定数量',
  already_shipped_quantity DECIMAL(10,2) NOT NULL COMMENT '之前已发货数量',
  this_shipment_quantity DECIMAL(10,2) NOT NULL COMMENT '本次发货数量',
  remaining_quantity DECIMAL(10,2) NOT NULL COMMENT '剩余待发货数量',
  -- 金额字段
  unit_price DECIMAL(12,2) NOT NULL COMMENT '单价',
  subtotal DECIMAL(12,2) NOT NULL COMMENT '小计',
  -- 排序字段
  sort_order INT DEFAULT 0 COMMENT '排序号',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (item_id),
  INDEX idx_shipment_id (shipment_id),
  INDEX idx_contract_item_id (contract_item_id),
  INDEX idx_product_id (product_id),
  CONSTRAINT fk_shipitem_shipment FOREIGN KEY (shipment_id) REFERENCES shipment(shipment_id) ON DELETE CASCADE,
  CONSTRAINT fk_shipitem_contitem FOREIGN KEY (contract_item_id) REFERENCES contract_item(item_id) ON DELETE RESTRICT,
  CONSTRAINT fk_shipitem_product FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE RESTRICT,
  CONSTRAINT chk_shipitem_contract_quantity CHECK (contract_quantity > 0),
  CONSTRAINT chk_shipitem_already_shipped_quantity CHECK (already_shipped_quantity >= 0),
  CONSTRAINT chk_shipitem_this_shipment_quantity CHECK (this_shipment_quantity > 0),
  CONSTRAINT chk_shipitem_remaining_quantity CHECK (remaining_quantity >= 0),
  CONSTRAINT chk_shipitem_unit_price CHECK (unit_price >= 0),
  CONSTRAINT chk_shipitem_subtotal CHECK (subtotal >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='发货单明细表';

-- -----------------------------------------------------
-- 7.7.3 发货单物流跟踪表（shipment_tracking）- 预留v2.0
-- -----------------------------------------------------
DROP TABLE IF EXISTS shipment_tracking;
CREATE TABLE shipment_tracking (
  tracking_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '物流跟踪记录ID',
  shipment_id BIGINT NOT NULL COMMENT '发货单ID',
  tracking_time DATETIME NOT NULL COMMENT '物流节点时间',
  tracking_location VARCHAR(200) COMMENT '物流节点位置',
  tracking_status VARCHAR(50) COMMENT '物流状态',
  tracking_description TEXT COMMENT '物流描述',
  data_source VARCHAR(20) DEFAULT 'manual' COMMENT '数据来源（manual=手动录入，api=物流API自动同步）',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (tracking_id),
  INDEX idx_shipment_id (shipment_id),
  INDEX idx_tracking_time (tracking_time),
  CONSTRAINT fk_tracking_shipment FOREIGN KEY (shipment_id) REFERENCES shipment(shipment_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='发货单物流跟踪表（预留v2.0）';

-- -----------------------------------------------------
-- 7.8.1 收款记录表（payment）
-- -----------------------------------------------------
DROP TABLE IF EXISTS payment;
CREATE TABLE payment (
  payment_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '收款记录ID',
  payment_no VARCHAR(100) NOT NULL COMMENT '收款编号',
  contract_id BIGINT NOT NULL COMMENT '合同ID',
  customer_id BIGINT NOT NULL COMMENT '客户ID（冗余）',
  payment_stage VARCHAR(100) NOT NULL COMMENT '收款阶段',
  payment_amount DECIMAL(12,2) NOT NULL COMMENT '本次收款金额',
  payment_date DATE NOT NULL COMMENT '收款日期',
  payment_method VARCHAR(50) NOT NULL COMMENT '收款方式（bank_transfer=银行转账，check=支票，cash=现金，third_party=第三方支付，other=其他）',
  bank_account VARCHAR(200) COMMENT '收款银行账户',
  transaction_no VARCHAR(200) COMMENT '银行流水号/交易单号',
  payer_name VARCHAR(200) COMMENT '付款方名称',
  -- 核销相关字段
  expected_amount DECIMAL(12,2) COMMENT '该期应收金额',
  stage_paid_amount DECIMAL(12,2) DEFAULT 0.00 COMMENT '该期已收款总额',
  stage_balance_amount DECIMAL(12,2) DEFAULT 0.00 COMMENT '该期剩余应收金额',
  is_stage_settled TINYINT DEFAULT 0 COMMENT '该期是否已核销完成（1=该期已收齐，0=未收齐）',
  -- 状态字段
  status VARCHAR(20) NOT NULL COMMENT '收款状态（draft=草稿，confirmed=已确认，cancelled=已取消）',
  confirm_date DATETIME COMMENT '确认时间',
  confirmed_by BIGINT COMMENT '确认人ID',
  -- 备注字段
  payment_note VARCHAR(500) COMMENT '收款备注',
  -- 权限控制字段
  owner_id BIGINT NOT NULL COMMENT '负责人ID',
  department_id BIGINT COMMENT '所属部门ID',
  data_permission_level TINYINT DEFAULT 0 COMMENT '数据权限级别（0=公开，1=部门，2=个人）',
  -- 审计字段
  created_by BIGINT NOT NULL COMMENT '创建人ID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_by BIGINT COMMENT '修改人ID',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted_at DATETIME COMMENT '软删除时间',
  PRIMARY KEY (payment_id),
  UNIQUE KEY uk_payment_no (payment_no),
  INDEX idx_contract_id (contract_id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_payment_stage (payment_stage),
  INDEX idx_payment_date (payment_date),
  INDEX idx_payment_method (payment_method),
  INDEX idx_status (status),
  INDEX idx_owner_id (owner_id),
  INDEX idx_created_at (created_at),
  INDEX idx_deleted_at (deleted_at),
  CONSTRAINT fk_payment_contract FOREIGN KEY (contract_id) REFERENCES contract(contract_id) ON DELETE RESTRICT,
  CONSTRAINT fk_payment_customer FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE RESTRICT,
  CONSTRAINT chk_payment_amount CHECK (payment_amount > 0),
  CONSTRAINT chk_payment_expected_amount CHECK (expected_amount IS NULL OR expected_amount >= 0),
  CONSTRAINT chk_payment_stage_paid_amount CHECK (stage_paid_amount >= 0),
  CONSTRAINT chk_payment_stage_balance_amount CHECK (stage_balance_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收款记录表';

-- -----------------------------------------------------
-- 7.9.1 发票记录表（invoice）
-- -----------------------------------------------------
DROP TABLE IF EXISTS invoice;
CREATE TABLE invoice (
  invoice_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '发票记录ID',
  invoice_no VARCHAR(100) NOT NULL COMMENT '发票号码',
  contract_id BIGINT NOT NULL COMMENT '合同ID',
  customer_id BIGINT NOT NULL COMMENT '客户ID（冗余）',
  payment_id BIGINT COMMENT '收款记录ID',
  -- 发票基本信息
  invoice_type VARCHAR(50) NOT NULL COMMENT '发票类型（vat_special=增值税专用发票，vat_normal=增值税普通发票）',
  invoice_amount DECIMAL(12,2) NOT NULL COMMENT '开票金额',
  invoice_date DATE NOT NULL COMMENT '开票日期',
  -- 发票抬头信息
  invoice_title VARCHAR(200) NOT NULL COMMENT '发票抬头',
  tax_number VARCHAR(100) COMMENT '纳税人识别号',
  company_address VARCHAR(500) COMMENT '公司地址',
  company_phone VARCHAR(100) COMMENT '公司电话',
  bank_name VARCHAR(200) COMMENT '开户银行',
  bank_account VARCHAR(100) COMMENT '银行账号',
  -- 状态字段
  status VARCHAR(20) NOT NULL COMMENT '发票状态（draft=待开票，confirmed=已开具，voided=已作废）',
  confirm_date DATETIME COMMENT '开具时间',
  confirmed_by BIGINT COMMENT '开具人ID',
  void_date DATETIME COMMENT '作废时间',
  void_reason VARCHAR(500) COMMENT '作废原因',
  voided_by BIGINT COMMENT '作废人ID',
  -- 备注字段
  invoice_note VARCHAR(500) COMMENT '发票备注',
  -- 权限控制字段
  owner_id BIGINT NOT NULL COMMENT '负责人ID',
  department_id BIGINT COMMENT '所属部门ID',
  data_permission_level TINYINT DEFAULT 0 COMMENT '数据权限级别（0=公开，1=部门，2=个人）',
  -- 审计字段
  created_by BIGINT NOT NULL COMMENT '创建人ID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_by BIGINT COMMENT '修改人ID',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted_at DATETIME COMMENT '软删除时间',
  PRIMARY KEY (invoice_id),
  UNIQUE KEY uk_invoice_no (invoice_no),
  INDEX idx_contract_id (contract_id),
  INDEX idx_customer_id (customer_id),
  INDEX idx_payment_id (payment_id),
  INDEX idx_invoice_type (invoice_type),
  INDEX idx_invoice_date (invoice_date),
  INDEX idx_status (status),
  INDEX idx_owner_id (owner_id),
  INDEX idx_created_at (created_at),
  INDEX idx_deleted_at (deleted_at),
  CONSTRAINT fk_invoice_contract FOREIGN KEY (contract_id) REFERENCES contract(contract_id) ON DELETE RESTRICT,
  CONSTRAINT fk_invoice_customer FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE RESTRICT,
  CONSTRAINT fk_invoice_payment FOREIGN KEY (payment_id) REFERENCES payment(payment_id) ON DELETE SET NULL,
  CONSTRAINT chk_invoice_amount CHECK (invoice_amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='发票记录表';

-- -----------------------------------------------------
-- 7.10.1 服务工单表（service_ticket）
-- -----------------------------------------------------
DROP TABLE IF EXISTS service_ticket;
CREATE TABLE service_ticket (
  ticket_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '工单ID',
  ticket_no VARCHAR(100) NOT NULL COMMENT '工单编号',
  ticket_type VARCHAR(50) NOT NULL COMMENT '工单类型（repair=故障维修，replacement=产品更换，technical_support=技术支持，inspection=定期巡检）',
  ticket_title VARCHAR(200) NOT NULL COMMENT '工单标题',
  priority VARCHAR(20) NOT NULL COMMENT '优先级（urgent=紧急，high=高，medium=中，low=低）',
  status VARCHAR(20) NOT NULL COMMENT '工单状态（pending=待处理，in_progress=处理中，pending_acceptance=待验收，resolved=已解决，closed=已关闭，cancelled=已取消）',
  -- 关联字段
  customer_id BIGINT NOT NULL COMMENT '客户ID',
  customer_contact_id BIGINT COMMENT '客户联系人ID',
  contract_id BIGINT COMMENT '关联合同ID',
  product_id BIGINT COMMENT '故障产品ID',
  product_name VARCHAR(200) COMMENT '产品名称（冗余）',
  product_code VARCHAR(100) COMMENT '产品编码（冗余）',
  -- 工单内容字段
  problem_description TEXT NOT NULL COMMENT '问题描述',
  problem_analysis TEXT COMMENT '问题分析',
  solution TEXT COMMENT '解决方案',
  attachment_urls TEXT COMMENT '附件URL列表（JSON数组）',
  -- 质保与费用字段
  is_under_warranty TINYINT DEFAULT 0 COMMENT '是否在质保期内（1=在保，0=不在保）',
  warranty_end_date DATE COMMENT '质保期结束日期',
  service_fee DECIMAL(10,2) DEFAULT 0.00 COMMENT '服务费用',
  parts_cost DECIMAL(10,2) DEFAULT 0.00 COMMENT '配件费用',
  total_cost DECIMAL(10,2) DEFAULT 0.00 COMMENT '总费用',
  payment_status VARCHAR(20) COMMENT '费用支付状态（unpaid=未支付，paid=已支付，waived=免费）',
  -- 配件更换字段
  replaced_parts TEXT COMMENT '更换配件清单（JSON数组）',
  -- 人员与时间字段
  assigned_to BIGINT COMMENT '当前处理人ID',
  reported_by BIGINT COMMENT '报修人ID',
  reported_at DATETIME NOT NULL COMMENT '报修时间',
  first_response_at DATETIME COMMENT '首次响应时间',
  resolved_at DATETIME COMMENT '解决时间',
  closed_at DATETIME COMMENT '关闭时间',
  expected_resolve_date DATE COMMENT '期望解决日期',
  -- 客户满意度字段
  customer_rating TINYINT COMMENT '客户评分（1-5分）',
  customer_feedback TEXT COMMENT '客户反馈',
  rated_at DATETIME COMMENT '评价时间',
  -- 审计字段
  created_by BIGINT NOT NULL COMMENT '创建人ID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_by BIGINT COMMENT '修改人ID',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted_at DATETIME COMMENT '软删除时间',
  PRIMARY KEY (ticket_id),
  UNIQUE KEY uk_ticket_no (ticket_no),
  INDEX idx_customer_id (customer_id),
  INDEX idx_contract_id (contract_id),
  INDEX idx_product_id (product_id),
  INDEX idx_ticket_type (ticket_type),
  INDEX idx_priority (priority),
  INDEX idx_status (status),
  INDEX idx_assigned_to (assigned_to),
  INDEX idx_is_under_warranty (is_under_warranty),
  INDEX idx_reported_at (reported_at),
  INDEX idx_expected_resolve_date (expected_resolve_date),
  INDEX idx_customer_rating (customer_rating),
  INDEX idx_created_at (created_at),
  INDEX idx_deleted_at (deleted_at),
  CONSTRAINT fk_ticket_customer FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE RESTRICT,
  CONSTRAINT fk_ticket_contact FOREIGN KEY (customer_contact_id) REFERENCES customer_contact(contact_id) ON DELETE SET NULL,
  CONSTRAINT fk_ticket_contract FOREIGN KEY (contract_id) REFERENCES contract(contract_id) ON DELETE RESTRICT,
  CONSTRAINT fk_ticket_product FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE RESTRICT,
  CONSTRAINT chk_ticket_service_fee CHECK (service_fee >= 0),
  CONSTRAINT chk_ticket_parts_cost CHECK (parts_cost >= 0),
  CONSTRAINT chk_ticket_total_cost CHECK (total_cost >= 0),
  CONSTRAINT chk_ticket_customer_rating CHECK (customer_rating IS NULL OR (customer_rating >= 1 AND customer_rating <= 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='服务工单表';

-- -----------------------------------------------------
-- 7.10.2 服务工单操作记录表（service_ticket_log）
-- -----------------------------------------------------
DROP TABLE IF EXISTS service_ticket_log;
CREATE TABLE service_ticket_log (
  log_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '日志记录ID',
  ticket_id BIGINT NOT NULL COMMENT '工单ID',
  log_type VARCHAR(50) NOT NULL COMMENT '日志类型（status_change=状态变更，assign=分配/转派，update=更新内容，comment=备注，rating=客户评价）',
  old_status VARCHAR(20) COMMENT '变更前状态',
  new_status VARCHAR(20) COMMENT '变更后状态',
  old_assigned_to BIGINT COMMENT '变更前处理人ID',
  new_assigned_to BIGINT COMMENT '变更后处理人ID',
  log_content TEXT NOT NULL COMMENT '日志内容',
  attachment_urls TEXT COMMENT '附件URL列表（JSON数组）',
  -- 审计字段
  created_by BIGINT NOT NULL COMMENT '操作人ID',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (log_id),
  INDEX idx_ticket_id (ticket_id),
  INDEX idx_log_type (log_type),
  INDEX idx_created_by (created_by),
  INDEX idx_created_at (created_at),
  CONSTRAINT fk_ticketlog_ticket FOREIGN KEY (ticket_id) REFERENCES service_ticket(ticket_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='服务工单操作记录表';

-- =====================================================
-- 恢复外键检查
-- =====================================================
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 数据表清单（26张表）
-- =====================================================
-- 基础数据模块（12张表）：
--   1. product_category - 产品分类表
--   2. product - 产品SKU表
--   3. customer - 客户表
--   4. customer_contact - 客户联系人表
--   5. customer_source - 客户来源渠道表
--   6. customer_follow_up - 客户跟进记录表
--   7. user - 用户表
--   8. role - 角色表
--   9. user_role - 用户角色关联表
--  10. permission - 权限表
--  11. role_permission - 角色权限关联表
--  12. audit_log - 操作审计日志表
--
-- 业务流程模块（14张表）：
--  13. quotation - 报价单主表
--  14. quotation_item - 报价单明细表
--  15. contract - 合同主表
--  16. contract_item - 合同明细表
--  17. contract_amendment - 合同补充协议表
--  18. task - 任务表
--  19. task_template - 任务模板表（预留v2.0）
--  20. task_notification - 任务提醒记录表（预留v2.0）
--  21. shipment - 发货单主表
--  22. shipment_item - 发货单明细表
--  23. shipment_tracking - 发货单物流跟踪表（预留v2.0）
--  24. payment - 收款记录表
--  25. invoice - 发票记录表
--  26. service_ticket - 服务工单表
--  27. service_ticket_log - 服务工单操作记录表
-- =====================================================
