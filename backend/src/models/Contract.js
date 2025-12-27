/**
 * 合同主表 Model
 * 对应数据库表：contract
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const Contract = sequelize.define('Contract', {
  contract_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '合同ID'
  },
  contract_no: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '合同编号'
  },
  contract_title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '合同标题'
  },
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
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'draft',
    comment: '合同状态'
  },
  contract_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: '合同总金额'
  },
  // 条款字段
  payment_terms: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '付款条款（JSON格式）'
  },
  delivery_terms: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '交付条款'
  },
  warranty_terms: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '质保条款（JSON格式）'
  },
  penalty_terms: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '违约条款'
  },
  additional_terms: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '补充条款'
  },
  // 日期字段
  signed_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '合同签订日期'
  },
  delivery_deadline: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '交付期限'
  },
  actual_delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '实际交付日期'
  },
  warranty_start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '质保期开始日期'
  },
  warranty_end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '质保期结束日期'
  },
  // 执行进度字段（冗余统计）
  shipped_amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    comment: '已发货金额'
  },
  received_amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    comment: '已收款金额'
  },
  invoiced_amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    comment: '已开票金额'
  },
  execution_progress: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    comment: '执行进度百分比'
  },
  // 文件管理字段
  contract_file_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '合同文件URL'
  },
  contract_file_uploaded_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '合同文件上传时间'
  },
  contract_file_version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '合同文件版本号'
  },
  // 关联字段
  source_quotation_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '来源报价单ID'
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
  signed_by: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '签订确认人ID'
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
  tableName: 'contract',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = Contract;
