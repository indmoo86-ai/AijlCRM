/**
 * 角色模型 - Role
 * 对应数据表: role
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Role = sequelize.define('Role', {
  role_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '角色ID'
  },
  role_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '角色编码'
  },
  role_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '角色名称'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '角色描述'
  },
  is_system: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '是否系统内置角色（1=是，0=否）'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序号'
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
  }
}, {
  tableName: 'role',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['role_code'], unique: true }
  ]
});

module.exports = Role;
