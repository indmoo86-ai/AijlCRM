const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const ContractParty = sequelize.define('ContractParty', {
  party_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '合同主体ID'
  },
  party_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'company',
    comment: '主体类型（company=公司，individual=个人）'
  },
  party_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '主体名称'
  },
  representative: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '代表人/法定代表人'
  },
  contact_phone: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '联系方式'
  },
  tax_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '税号或身份证号'
  },
  bank_name: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '开户行'
  },
  bank_account: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '银行账号'
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '地址'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active',
    comment: '状态（active=启用，inactive=禁用）'
  },
  is_default: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '是否默认（1=是，0=否）'
  },
  created_by: {
    type: DataTypes.BIGINT,
    allowNull: true,
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
    comment: '删除时间'
  }
}, {
  tableName: 'contract_party',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  indexes: [
    { fields: ['party_type'] },
    { fields: ['status'] },
    { fields: ['is_default'] }
  ]
});

module.exports = ContractParty;
