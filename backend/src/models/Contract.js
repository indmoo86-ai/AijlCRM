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
  amount_in_words: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '金额大写'
  },
  // 签署信息
  signing_location: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '签署地点'
  },
  // 甲方信息
  party_a_name: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '甲方名称'
  },
  party_a_address: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '甲方地址'
  },
  party_a_representative: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '甲方代表'
  },
  party_a_phone: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '甲方电话'
  },
  party_a_fax: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '甲方传真'
  },
  // 乙方信息
  party_b_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '乙方合同主体ID'
  },
  party_b_name: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '乙方名称'
  },
  party_b_representative: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '乙方代表'
  },
  party_b_phone: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '乙方电话'
  },
  party_b_address: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '乙方地址'
  },
  party_b_tax_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '乙方税号/身份证号'
  },
  party_b_bank_name: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '乙方开户行'
  },
  party_b_bank_account: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '乙方银行账号'
  },
  // 项目信息
  hotel_name: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '酒店名称'
  },
  room_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '房间数量'
  },
  project_address: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '项目地址'
  },
  // 交付信息
  delivery_method: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '交货方式'
  },
  delivery_address: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '交货地点'
  },
  freight_bearer: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'party_a',
    comment: '运费承担方：party_a甲方/party_b乙方'
  },
  // 质保信息
  warranty_period: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 5,
    comment: '质保期限（年）'
  },
  lifetime_maintenance: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true,
    comment: '是否终身保修'
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
  // 发票信息
  invoice_type: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'normal',
    comment: '发票类型（none=不开票, normal=普通发票, special=专用发票）'
  },
  invoice_company: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '开票单位'
  },
  invoice_tax_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '税号'
  },
  invoice_remark: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '开票备注'
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
  // 合同寄送相关
  tracking_no: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '快递单号'
  },
  sent_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '寄出日期'
  },
  received_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '收回日期'
  },
  // 作废相关
  previous_status: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '作废前状态（用于恢复）'
  },
  voided_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '作废时间'
  },
  voided_by: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '作废人'
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
  lead_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '关联线索ID'
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
