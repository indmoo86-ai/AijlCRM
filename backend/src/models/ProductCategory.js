/**
 * 产品分类表 Model
 * 对应数据库表：product_category
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const ProductCategory = sequelize.define('ProductCategory', {
  category_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '分类ID'
  },
  category_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '分类名称'
  },
  category_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '分类编码'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序号'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '分类描述'
  },
  is_active: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '是否启用（1=启用，0=停用）'
  },
  creator_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '创建人ID'
  }
}, {
  tableName: 'product_category',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = ProductCategory;
