/**
 * 附件表 Model
 * 对应数据库表：attachment
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const Attachment = sequelize.define('Attachment', {
  attachment_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '附件ID'
  },
  business_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '业务类型（lead/customer/quotation/contract/shipment/payment/invoice/service）'
  },
  business_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '业务对象ID'
  },
  original_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '原始文件名'
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '存储文件名（UUID）'
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '文件存储路径'
  },
  file_size: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '文件大小（字节）'
  },
  file_type: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '文件MIME类型'
  },
  file_extension: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '文件扩展名'
  },
  uploader_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '上传人ID'
  },
  uploader_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '上传人姓名（冗余字段）'
  },
  download_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '下载次数'
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
  tableName: 'attachment',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  indexes: [
    {
      name: 'idx_business',
      fields: ['business_type', 'business_id']
    },
    {
      name: 'idx_uploader',
      fields: ['uploader_id']
    }
  ]
});

module.exports = Attachment;
