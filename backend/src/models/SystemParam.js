const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SystemParam = sequelize.define('SystemParam', {
  param_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '参数ID'
  },
  param_key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '参数键名'
  },
  param_value: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '参数值'
  },
  param_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'string',
    comment: '参数类型: string, number, boolean, json'
  },
  param_group: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '参数分组'
  },
  param_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '参数显示名称'
  },
  param_desc: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '参数描述'
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
  tableName: 'system_param',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  comment: '系统参数表'
});

// 获取参数值的方法
SystemParam.getValue = async function(key, defaultValue = null) {
  const param = await this.findOne({ where: { param_key: key } });
  if (!param) return defaultValue;

  // 根据类型转换值
  switch (param.param_type) {
    case 'number':
      return parseFloat(param.param_value) || defaultValue;
    case 'boolean':
      return param.param_value === 'true' || param.param_value === '1';
    case 'json':
      try {
        return JSON.parse(param.param_value);
      } catch {
        return defaultValue;
      }
    default:
      return param.param_value || defaultValue;
  }
};

// 设置参数值的方法
SystemParam.setValue = async function(key, value, options = {}) {
  const { type = 'string', group = null, name = null, desc = null } = options;

  let paramValue = value;
  if (type === 'json' && typeof value === 'object') {
    paramValue = JSON.stringify(value);
  } else if (type === 'boolean') {
    paramValue = value ? 'true' : 'false';
  } else {
    paramValue = String(value);
  }

  const [param, created] = await this.findOrCreate({
    where: { param_key: key },
    defaults: {
      param_value: paramValue,
      param_type: type,
      param_group: group,
      param_name: name,
      param_desc: desc
    }
  });

  if (!created) {
    await param.update({ param_value: paramValue });
  }

  return param;
};

// 获取一组参数
SystemParam.getGroup = async function(group) {
  const params = await this.findAll({ where: { param_group: group } });
  const result = {};
  params.forEach(p => {
    let value = p.param_value;
    switch (p.param_type) {
      case 'number':
        value = parseFloat(value) || 0;
        break;
      case 'boolean':
        value = value === 'true' || value === '1';
        break;
      case 'json':
        try {
          value = JSON.parse(value);
        } catch {
          value = null;
        }
        break;
    }
    result[p.param_key] = value;
  });
  return result;
};

module.exports = SystemParam;
