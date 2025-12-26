/**
 * 操作审计日志模型 - AuditLog
 * 对应数据表: audit_log
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  log_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '日志ID'
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '操作人ID'
  },
  user_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '操作人姓名（冗余）'
  },
  module_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '操作模块'
  },
  action_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '操作类型（create=新增，update=修改，delete=删除，view=查看，login=登录，logout=登出）'
  },
  action_desc: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '操作描述'
  },
  target_type: {
    type: DataTypes.STRING(50),
    comment: '操作对象类型'
  },
  target_id: {
    type: DataTypes.BIGINT,
    comment: '操作对象ID'
  },
  request_ip: {
    type: DataTypes.STRING(50),
    comment: '请求IP地址'
  },
  request_url: {
    type: DataTypes.STRING(500),
    comment: '请求URL'
  },
  request_method: {
    type: DataTypes.STRING(10),
    comment: '请求方法（GET/POST/PUT/DELETE）'
  },
  request_params: {
    type: DataTypes.TEXT,
    comment: '请求参数（JSON格式，敏感信息需脱敏）'
  },
  response_status: {
    type: DataTypes.INTEGER,
    comment: '响应状态码'
  }
}, {
  tableName: 'audit_log',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['module_name'] },
    { fields: ['action_type'] },
    { fields: ['target_type', 'target_id'] },
    { fields: ['created_at'] }
  ]
});

module.exports = AuditLog;
