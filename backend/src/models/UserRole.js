/**
 * 用户角色关联模型 - UserRole
 * 对应数据表: user_role
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserRole = sequelize.define('UserRole', {
  user_role_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '关联ID'
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '用户ID'
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '角色ID'
  },
  creator_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '分配人ID'
  }
}, {
  tableName: 'user_role',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['user_id', 'role_id'], unique: true },
    { fields: ['user_id'] },
    { fields: ['role_id'] }
  ]
});

module.exports = UserRole;
