/**
 * 收款记录表 Model
 * 对应数据库表：payment
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const Payment = sequelize.define('Payment', {
  payment_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '收款记录ID'
  },
  payment_no: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '收款编号'
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
  payment_stage: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '收款阶段'
  },
  payment_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: '本次收款金额'
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '收款日期'
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '收款方式'
  },
  bank_account: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '收款银行账户'
  },
  transaction_no: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '银行流水号/交易单号'
  },
  payer_name: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '付款方名称'
  },
  // 核销相关字段
  expected_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: '该期应收金额'
  },
  stage_paid_amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    comment: '该期已收款总额'
  },
  stage_balance_amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    comment: '该期剩余应收金额'
  },
  is_stage_settled: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '该期是否已核销完成'
  },
  // 状态字段
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'draft',
    comment: '收款状态'
  },
  confirm_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '确认时间'
  },
  confirmed_by: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '确认人ID'
  },
  // 备注字段
  payment_note: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '收款备注'
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
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '软删除时间'
  }
}, {
  tableName: 'payment',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = Payment;
