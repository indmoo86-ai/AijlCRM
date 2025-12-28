/**
 * 客户来源渠道模型 - CustomerSource
 * 对应数据表: customer_source（字典表）
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CustomerSource = sequelize.define('CustomerSource', {
  source_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '来源ID'
  },
  source_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '来源编码'
  },
  source_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '来源名称'
  },
  is_active: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '是否启用'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序号'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '描述'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '创建时间'
  }
}, {
  tableName: 'customer_source',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['source_code'], unique: true }
  ]
});

module.exports = CustomerSource;
