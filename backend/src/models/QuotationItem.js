/**
 * 报价单明细表 Model
 * 对应数据库表：quotation_item
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const QuotationItem = sequelize.define('QuotationItem', {
  item_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '明细ID'
  },
  quotation_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '报价单ID'
  },
  product_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '产品ID'
  },
  product_code: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '产品编码快照'
  },
  product_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '产品名称快照'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '数量'
  },
  unit_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: '单价'
  },
  subtotal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: '小计'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '备注'
  }
}, {
  tableName: 'quotation_item',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = QuotationItem;
