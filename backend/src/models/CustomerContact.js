/**
 * 客户联系人模型 - CustomerContact
 * 对应数据表: customer_contact
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CustomerContact = sequelize.define('CustomerContact', {
  contact_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '联系人ID'
  },
  customer_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '所属客户ID'
  },
  contact_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '联系人姓名'
  },
  position: {
    type: DataTypes.STRING(100),
    comment: '职位'
  },
  mobile: {
    type: DataTypes.STRING(50),
    comment: '手机号'
  },
  wechat: {
    type: DataTypes.STRING(100),
    comment: '微信号'
  },
  email: {
    type: DataTypes.STRING(200),
    comment: '邮箱'
  },
  is_primary: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '是否主要联系人（1=是，0=否）'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '备注'
  },
  creator_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '创建人ID'
  }
}, {
  tableName: 'customer_contact',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['customer_id'] },
    { fields: ['is_primary'] },
    { fields: ['mobile'] }
  ]
});

module.exports = CustomerContact;
