/**
 * 服务工单操作记录表 Model
 * 对应数据库表：service_ticket_log
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const ServiceTicketLog = sequelize.define('ServiceTicketLog', {
  log_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '日志记录ID'
  },
  ticket_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '工单ID'
  },
  log_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '日志类型'
  },
  old_status: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '变更前状态'
  },
  new_status: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '变更后状态'
  },
  old_assigned_to: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '变更前处理人ID'
  },
  new_assigned_to: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '变更后处理人ID'
  },
  log_content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '日志内容'
  },
  attachment_urls: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '附件URL列表（JSON数组）'
  },
  // 审计字段
  created_by: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '操作人ID'
  }
}, {
  tableName: 'service_ticket_log',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = ServiceTicketLog;
