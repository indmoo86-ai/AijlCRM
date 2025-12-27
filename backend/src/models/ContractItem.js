/**
 * 合同明细表 Model
 * 对应数据库表：contract_item
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const ContractItem = sequelize.define('ContractItem', {
  item_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '明细ID'
  },
  contract_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '合同ID'
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
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '数量'
  },
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
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序号'
  },
  item_note: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '明细备注'
  },
  // 执行进度字段
  shipped_quantity: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: '已发货数量'
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
  }
}, {
  tableName: 'contract_item',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = ContractItem;
