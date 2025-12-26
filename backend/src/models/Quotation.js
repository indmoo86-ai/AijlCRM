/**
 * 报价单主表 Model
 * 对应数据库表：quotation
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const Quotation = sequelize.define('Quotation', {
  quotation_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '报价单ID'
  },
  quotation_no: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '报价单编号'
  },
  customer_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '客户ID'
  },
  quotation_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '报价日期'
  },
  valid_until: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '有效期至'
  },
  total_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    comment: '报价总金额'
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'draft',
    comment: '报价单状态'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '备注'
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '版本号'
  },
  owner_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '负责人ID'
  },
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
  tableName: 'quotation',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = Quotation;
