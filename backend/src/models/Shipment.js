/**
 * 发货单主表 Model
 * 对应数据库表：shipment
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const Shipment = sequelize.define('Shipment', {
  shipment_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '发货单ID'
  },
  shipment_no: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '发货单编号'
  },
  shipment_title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '发货单标题'
  },
  contract_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '合同ID'
  },
  customer_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '客户ID（冗余）'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'draft',
    comment: '发货状态'
  },
  // 物流信息字段
  logistics_company: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '物流公司'
  },
  tracking_no: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '运单号'
  },
  shipping_address: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '收货地址'
  },
  contact_person: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '收货联系人姓名'
  },
  contact_phone: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '收货联系人电话'
  },
  // 日期字段
  planned_ship_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '计划发货日期'
  },
  actual_ship_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '实际发货日期'
  },
  estimated_delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '预计到货日期'
  },
  actual_delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '实际签收日期'
  },
  // 金额字段
  shipment_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: '本次发货金额'
  },
  // 备注字段
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '发货备注'
  },
  cancel_reason: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '取消原因'
  },
  // 权限控制字段
  owner_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '负责人ID'
  },
  department_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '所属部门ID'
  },
  data_permission_level: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '数据权限级别（0=公开，1=部门，2=个人）'
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
  shipped_by: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '发货确认人ID'
  },
  shipped_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '发货确认时间'
  },
  delivered_by: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '签收确认人ID'
  },
  delivered_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '签收确认时间'
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '软删除时间'
  }
}, {
  tableName: 'shipment',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = Shipment;
