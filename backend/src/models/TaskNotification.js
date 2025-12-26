/**
 * 任务提醒记录模型 - TaskNotification（预留v2.0）
 * 对应数据表: task_notification
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TaskNotification = sequelize.define('TaskNotification', {
  notification_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '提醒记录ID'
  },
  task_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '任务ID'
  },
  notification_channel: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '提醒渠道（system=系统内，email=邮件，wechat=微信，sms=短信）'
  },
  recipient_user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '接收人ID'
  },
  notification_title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '提醒标题'
  },
  notification_content: {
    type: DataTypes.TEXT,
    comment: '提醒内容'
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '发送时间'
  },
  is_read: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '是否已读（1=已读，0=未读）'
  },
  read_at: {
    type: DataTypes.DATE,
    comment: '阅读时间'
  },
  send_status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '发送状态（success=成功，failed=失败，pending=待发送）'
  },
  error_message: {
    type: DataTypes.STRING(500),
    comment: '失败错误信息'
  }
}, {
  tableName: 'task_notification',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['task_id'] },
    { fields: ['recipient_user_id'] },
    { fields: ['notification_channel'] },
    { fields: ['is_read'] },
    { fields: ['sent_at'] }
  ]
});

module.exports = TaskNotification;
