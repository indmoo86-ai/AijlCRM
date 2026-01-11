const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  customerNo: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    field: 'customer_no'
  },
  customerName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'customer_name'
  },
  customerType: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    field: 'customer_type',
    comment: '1潜在/2正式/3VIP'
  },
  industry: {
    type: DataTypes.STRING(50)
  },
  province: {
    type: DataTypes.STRING(50)
  },
  city: {
    type: DataTypes.STRING(50)
  },
  district: {
    type: DataTypes.STRING(50)
  },
  address: {
    type: DataTypes.STRING(500)
  },
  phone: {
    type: DataTypes.STRING(20),
    comment: '联系电话'
  },
  wechat: {
    type: DataTypes.STRING(50),
    comment: '微信号'
  },
  roomCount: {
    type: DataTypes.INTEGER,
    field: 'room_count'
  },
  salesOwnerId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'sales_owner_id'
  },
  sourceLeadId: {
    type: DataTypes.BIGINT,
    field: 'source_lead_id'
  },
  channelSource: {
    type: DataTypes.STRING(50),
    field: 'channel_source',
    comment: '来源渠道'
  },
  createdBy: {
    type: DataTypes.BIGINT,
    field: 'created_by',
    comment: '创建人ID'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    field: 'total_amount'
  },
  contractCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'contract_count'
  },
  referralCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'referral_count'
  },
  tags: {
    type: DataTypes.JSON
  },
  lastContactTime: {
    type: DataTypes.DATE,
    field: 'last_contact_time'
  },
  remark: {
    type: DataTypes.TEXT
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
  tableName: 't_customer',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 生成客户编号
Customer.generateCustomerNo = async function() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const prefix = `CU${year}${month}`;

  const lastCustomer = await Customer.findOne({
    where: {
      customerNo: {
        [sequelize.Sequelize.Op.like]: `${prefix}%`
      }
    },
    order: [['customer_no', 'DESC']]
  });

  let sequence = 1;
  if (lastCustomer) {
    const lastSequence = parseInt(lastCustomer.customerNo.slice(-4));
    sequence = lastSequence + 1;
  }

  return `${prefix}${String(sequence).padStart(4, '0')}`;
};

module.exports = Customer;
