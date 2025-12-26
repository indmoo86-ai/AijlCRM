/**
 * 合同补充协议表 Model
 * 对应数据库表：contract_amendment
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const ContractAmendment = sequelize.define('ContractAmendment', {
  amendment_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '补充协议ID'
  },
  amendment_no: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '补充协议编号'
  },
  contract_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '原合同ID'
  },
  amendment_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '变更类型'
  },
  amendment_title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '补充协议标题'
  },
  amendment_content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '变更内容说明'
  },
  amount_change: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    comment: '金额变化（正数=增加，负数=减少）'
  },
  new_contract_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: '变更后的合同总金额'
  },
  signed_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '补充协议签订日期'
  },
  amendment_file_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '补充协议文件URL'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'draft',
    comment: '状态'
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
  tableName: 'contract_amendment',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = ContractAmendment;
