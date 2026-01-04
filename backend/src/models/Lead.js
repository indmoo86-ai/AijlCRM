const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Lead = sequelize.define('Lead', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  leadNo: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    field: 'lead_no'
  },
  customerName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'customer_name'
  },
  hotelName: {
    type: DataTypes.STRING(200),
    field: 'hotel_name'
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
  roomCount: {
    type: DataTypes.INTEGER,
    field: 'room_count'
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  wechat: {
    type: DataTypes.STRING(50)
  },
  channelSource: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'channel_source'
  },
  firstDemand: {
    type: DataTypes.TEXT,
    field: 'first_demand'
  },
  mediaOwnerId: {
    type: DataTypes.BIGINT,
    field: 'media_owner_id'
  },
  salesOwnerId: {
    type: DataTypes.BIGINT,
    field: 'sales_owner_id'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '1新建/2跟进中/3已转化/4已放弃'
  },
  intentionLevel: {
    type: DataTypes.STRING(20),
    field: 'intention_level'
  },
  stallReason: {
    type: DataTypes.STRING(500),
    field: 'stall_reason'
  },
  expectedSignDate: {
    type: DataTypes.DATEONLY,
    field: 'expected_sign_date'
  },
  referrerCustomerId: {
    type: DataTypes.BIGINT,
    field: 'referrer_customer_id'
  },
  customerId: {
    type: DataTypes.BIGINT,
    field: 'customer_id',
    comment: '关联客户ID'
  },
  lastFollowTime: {
    type: DataTypes.DATE,
    field: 'last_follow_time'
  },
  nextFollowDate: {
    type: DataTypes.DATEONLY,
    field: 'next_follow_date'
  },
  remark: {
    type: DataTypes.TEXT
  },
  demandCategories: {
    type: DataTypes.TEXT,
    field: 'demand_categories',
    comment: '需求分类JSON数组'
  },
  createdBy: {
    type: DataTypes.BIGINT,
    field: 'created_by',
    comment: '创建人ID'
  },
  warningLevel: {
    type: DataTypes.TINYINT,
    field: 'warning_level',
    defaultValue: 0,
    comment: '预警级别：0正常(绿色)/1轻度预警(橙色)/2严重预警(红色)'
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
  tableName: 't_lead',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 生成线索编号
Lead.generateLeadNo = async function() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const prefix = `LD${year}${month}${day}`;

  const lastLead = await Lead.findOne({
    where: {
      leadNo: {
        [sequelize.Sequelize.Op.like]: `${prefix}%`
      }
    },
    order: [['lead_no', 'DESC']]
  });

  let sequence = 1;
  if (lastLead) {
    const lastSequence = parseInt(lastLead.leadNo.slice(-3));
    sequence = lastSequence + 1;
  }

  return `${prefix}${String(sequence).padStart(3, '0')}`;
};

module.exports = Lead;
