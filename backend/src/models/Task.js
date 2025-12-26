/**
 * 任务表 Model
 * 对应数据库表：task
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const Task = sequelize.define('Task', {
  task_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '任务ID'
  },
  task_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '任务类型'
  },
  task_title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '任务标题'
  },
  task_description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '任务描述'
  },
  priority: {
    type: DataTypes.STRING(20),
    defaultValue: 'medium',
    comment: '优先级（high=高，medium=中，low=低）'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
    comment: '任务状态'
  },
  // 关联业务对象字段
  source_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '源业务对象类型'
  },
  source_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '源业务对象ID'
  },
  unique_key: {
    type: DataTypes.STRING(200),
    allowNull: true,
    unique: true,
    comment: '防重键'
  },
  // 任务时间字段
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '截止日期'
  },
  due_time: {
    type: DataTypes.TIME,
    allowNull: true,
    comment: '截止时间'
  },
  reminder_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '提前提醒时间'
  },
  // 任务分配字段
  assignee_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '任务负责人ID'
  },
  assigner_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '任务分配人ID'
  },
  assigned_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '任务分配时间'
  },
  // 任务执行字段
  started_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '任务开始处理时间'
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '任务完成时间'
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '任务取消时间'
  },
  cancel_reason: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '取消原因'
  },
  result_note: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '任务处理结果备注'
  },
  // 提醒通知字段
  is_notified: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '是否已发送提醒通知'
  },
  notified_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '提醒发送时间'
  },
  notification_channels: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '提醒渠道记录（JSON格式）'
  },
  // 审计字段
  created_by: {
    type: DataTypes.BIGINT,
    allowNull: true,
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
  tableName: 'task',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = Task;
