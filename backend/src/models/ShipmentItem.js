/**
 * 发货单明细表 Model
 * 对应数据库表：shipment_item
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const ShipmentItem = sequelize.define('ShipmentItem', {
  item_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '明细ID'
  },
  shipment_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '发货单ID'
  },
  contract_item_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '合同明细ID'
  },
  product_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '产品ID'
  },
  product_code: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '产品编码（冗余）'
  },
  product_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '产品名称（冗余）'
  },
  product_unit: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '单位（冗余）'
  },
  // 数量字段
  contract_quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '合同约定数量'
  },
  already_shipped_quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '之前已发货数量'
  },
  this_shipment_quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '本次发货数量'
  },
  remaining_quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '剩余待发货数量'
  },
  // 金额字段
  unit_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: '单价'
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: '小计'
  },
  // 排序字段
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序号'
  }
}, {
  tableName: 'shipment_item',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = ShipmentItem;
