/**
 * 产品SKU模型 - Product
 * 对应数据表: product
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  product_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '产品ID'
  },
  product_code: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '产品编码'
  },
  product_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '产品名称'
  },
  brand: {
    type: DataTypes.STRING(100),
    comment: '品牌'
  },
  category_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '所属分类ID'
  },
  supplier: {
    type: DataTypes.STRING(200),
    comment: '供应商名称'
  },
  cost_price: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    comment: '成本价（元）'
  },
  sale_price: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    comment: '报价/销售价（元）'
  },
  unit: {
    type: DataTypes.STRING(20),
    defaultValue: '台',
    comment: '单位'
  },
  product_images: {
    type: DataTypes.TEXT,
    comment: '产品图片URL列表（JSON数组）'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '产品描述/备注'
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'active',
    comment: '产品状态（active=在售，inactive=停售，draft=草稿）'
  },
  owner_id: {
    type: DataTypes.BIGINT,
    comment: '负责人ID'
  },
  department_id: {
    type: DataTypes.BIGINT,
    comment: '所属部门ID'
  },
  created_by: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '创建人ID'
  },
  updated_by: {
    type: DataTypes.BIGINT,
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
    comment: '软删除时间'
  }
}, {
  tableName: 'product',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
  indexes: [
    { fields: ['product_code'], unique: true },
    { fields: ['category_id'] },
    { fields: ['brand'] },
    { fields: ['status'] },
    { fields: ['supplier'] }
  ]
});

module.exports = Product;
