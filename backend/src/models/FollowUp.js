const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FollowUp = sequelize.define('FollowUp', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  bizType: {
    type: DataTypes.TINYINT,
    allowNull: false,
    field: 'biz_type',
    comment: '1线索/2客户/3商机'
  },
  bizId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'biz_id'
  },
  followType: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'follow_type'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  intentionLevel: {
    type: DataTypes.STRING(20),
    field: 'intention_level'
  },
  nextPlan: {
    type: DataTypes.STRING(500),
    field: 'next_plan'
  },
  nextFollowDate: {
    type: DataTypes.DATEONLY,
    field: 'next_follow_date'
  },
  attachments: {
    type: DataTypes.JSON
  },
  operatorId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'operator_id'
  }
}, {
  tableName: 't_follow_up',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = FollowUp;
