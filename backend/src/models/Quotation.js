/**
 * 报价单主表 Model
 * 对应数据库表：quotation
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const Quotation = sequelize.define('Quotation', {
  quotation_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '报价单ID'
  },
  quotation_no: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '报价单编号'
  },
  customer_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '客户ID'
  },
  lead_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '关联线索ID'
  },
  hotel_name: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '酒店名称'
  },
  province: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '省份'
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '城市'
  },
  district: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '区县'
  },
  room_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '房间数量'
  },
  quotation_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '报价日期'
  },
  valid_until: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '有效期至'
  },
  total_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '产品总数量'
  },
  total_cost: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    comment: '成本价总计'
  },
  total_sale_price: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    comment: '销售价总计（名义总价）'
  },
  total_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    comment: '报价总金额（实际总价/优惠后）'
  },
  discount_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    comment: '优惠金额'
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'draft',
    comment: '报价单状态: draft草稿/sent已发送/accepted已接受/voided已作废'
  },
  previous_version_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '上一版本报价单ID（修改时生成新版本）'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '备注'
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '版本号'
  },
  owner_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '负责人ID'
  },
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
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '创建时间'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '更新时间'
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '软删除时间'
  }
}, {
  tableName: 'quotation',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = Quotation;
