/**
 * 发票记录表 Model
 * 对应数据库表：invoice
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const Invoice = sequelize.define('Invoice', {
  invoice_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '发票记录ID'
  },
  invoice_no: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '发票号码'
  },
  contract_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '合同ID'
  },
  customer_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '客户ID（冗余）'
  },
  payment_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '收款记录ID'
  },
  // 发票基本信息
  invoice_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '发票类型'
  },
  invoice_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: '开票金额'
  },
  invoice_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '开票日期'
  },
  // 发票抬头信息
  invoice_title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '发票抬头'
  },
  tax_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '纳税人识别号'
  },
  company_address: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '公司地址'
  },
  company_phone: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '公司电话'
  },
  bank_name: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '开户银行'
  },
  bank_account: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '银行账号'
  },
  // 状态字段
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'draft',
    comment: '发票状态'
  },
  confirm_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '开具时间'
  },
  confirmed_by: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '开具人ID'
  },
  void_reason: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '作废原因'
  },
  // 备注字段
  invoice_note: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '发票备注'
  },
  // 权限控制字段
  owner_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '负责人ID'
  },
  department_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '所属部门ID'
  },
  data_permission_level: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '数据权限级别'
  },
  // 审计字段
  created_by: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '创建人ID'
  },
  updated_by: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '修改人ID'
  },
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
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '软删除时间'
  }
}, {
  tableName: 'invoice',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = Invoice;
