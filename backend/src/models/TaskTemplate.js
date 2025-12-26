/**
 * 任务模板模型 - TaskTemplate（预留v2.0）
 * 对应数据表: task_template
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TaskTemplate = sequelize.define('TaskTemplate', {
  template_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '模板ID'
  },
  template_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '模板名称'
  },
  template_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '模板类型'
  },
  task_title_template: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '任务标题模板'
  },
  task_description_template: {
    type: DataTypes.TEXT,
    comment: '任务描述模板'
  },
  default_priority: {
    type: DataTypes.STRING(20),
    defaultValue: 'medium',
    comment: '默认优先级'
  },
  default_due_days: {
    type: DataTypes.INTEGER,
    comment: '默认截止天数'
  },
  is_active: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '是否启用'
  },
  created_by: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '创建人ID'
  },
  updated_by: {
    type: DataTypes.BIGINT,
    comment: '修改人ID'
  }
}, {
  tableName: 'task_template',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['template_type'] },
    { fields: ['is_active'] }
  ]
});

module.exports = TaskTemplate;
