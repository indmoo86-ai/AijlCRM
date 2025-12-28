/**
 * 角色权限关联模型 - RolePermission
 * 对应数据表: role_permission
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RolePermission = sequelize.define('RolePermission', {
  role_permission_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '关联ID'
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '角色ID'
  },
  permission_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '权限ID'
  },
  creator_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '分配人ID'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '创建时间'
  }
}, {
  tableName: 'role_permission',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['role_id', 'permission_id'], unique: true },
    { fields: ['role_id'] },
    { fields: ['permission_id'] }
  ]
});

module.exports = RolePermission;
