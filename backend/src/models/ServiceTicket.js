/**
 * 服务工单表 Model
 * 对应数据库表：service_ticket
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const ServiceTicket = sequelize.define('ServiceTicket', {
  ticket_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '工单ID'
  },
  ticket_no: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '工单编号'
  },
  ticket_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '工单类型'
  },
  ticket_title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '工单标题'
  },
  priority: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '优先级'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
    comment: '工单状态'
  },
  // 关联字段
  customer_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '客户ID'
  },
  customer_contact_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '客户联系人ID'
  },
  contract_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '关联合同ID'
  },
  product_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '故障产品ID'
  },
  product_name: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '产品名称（冗余）'
  },
  product_code: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '产品编码（冗余）'
  },
  // 工单内容字段
  problem_description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '问题描述'
  },
  problem_analysis: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '问题分析'
  },
  solution: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '解决方案'
  },
  attachment_urls: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '附件URL列表（JSON数组）'
  },
  // 质保与费用字段
  is_under_warranty: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '是否在质保期内'
  },
  warranty_end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '质保期结束日期'
  },
  service_fee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: '服务费用'
  },
  parts_cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: '配件费用'
  },
  total_cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: '总费用'
  },
  payment_status: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '费用支付状态'
  },
  // 配件更换字段
  replaced_parts: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '更换配件清单（JSON数组）'
  },
  // 人员与时间字段
  assigned_to: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '当前处理人ID'
  },
  reported_by: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '报修人ID'
  },
  reported_at: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '报修时间'
  },
  first_response_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '首次响应时间'
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '解决时间'
  },
  closed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '关闭时间'
  },
  expected_resolve_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '期望解决日期'
  },
  // 客户满意度字段
  customer_rating: {
    type: DataTypes.TINYINT,
    allowNull: true,
    comment: '客户评分（1-5分）'
  },
  customer_feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '客户反馈'
  },
  rated_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '评价时间'
  },
  // 审计字段
  created_by: {
    type: DataTypes.BIGINT,
    allowNull: false,
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
  tableName: 'service_ticket',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = ServiceTicket;
