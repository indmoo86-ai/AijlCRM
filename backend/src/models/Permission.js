/**
 * 权限模型 - Permission
 * 对应数据表: permission
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Permission = sequelize.define('Permission', {
  permission_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '权限ID'
  },
  permission_code: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '权限编码'
  },
  permission_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '权限名称'
  },
  module_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '所属模块'
  },
  permission_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '权限类型（menu=菜单访问，action=操作权限）'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序号'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '权限描述'
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
  tableName: 'permission',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['permission_code'], unique: true },
    { fields: ['module_name'] },
    { fields: ['permission_type'] }
  ]
});

module.exports = Permission;
