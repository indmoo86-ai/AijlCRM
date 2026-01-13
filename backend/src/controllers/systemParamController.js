const { SystemParam } = require('../models');

// 默认系统参数
const DEFAULT_PARAMS = [
  // 基本设置
  { key: 'system_name', value: '艾居来CRM', type: 'string', group: 'basic', name: '系统名称' },
  { key: 'company_name', value: '艾居来智能科技有限公司', type: 'string', group: 'basic', name: '公司名称' },
  { key: 'contact_phone', value: '', type: 'string', group: 'basic', name: '联系电话' },
  { key: 'contact_email', value: '', type: 'string', group: 'basic', name: '联系邮箱' },
  // 业务设置
  { key: 'quotation_validity_days', value: '30', type: 'number', group: 'business', name: '报价单有效期(天)' },
  { key: 'contract_default_months', value: '12', type: 'number', group: 'business', name: '合同默认期限(月)' },
  { key: 'task_reminder_days', value: '3', type: 'number', group: 'business', name: '任务提醒提前天数' },
  // 发票税率设置
  { key: 'special_invoice_tax_rate', value: '13', type: 'number', group: 'invoice', name: '专票税点(%)' },
  { key: 'normal_invoice_tax_rate', value: '3', type: 'number', group: 'invoice', name: '普票税点(%)' },
  { key: 'special_invoice_tax_burden', value: '8', type: 'number', group: 'invoice', name: '专票税负成本(%)' },
  { key: 'normal_invoice_tax_burden', value: '3', type: 'number', group: 'invoice', name: '普票税负成本(%)' },
  // 其他设置
  { key: 'email_notification_enabled', value: 'false', type: 'boolean', group: 'other', name: '邮件通知' },
  { key: 'sms_notification_enabled', value: 'false', type: 'boolean', group: 'other', name: '短信通知' },
  { key: 'auto_backup_enabled', value: 'false', type: 'boolean', group: 'other', name: '自动备份' }
];

/**
 * 初始化默认参数
 */
const initDefaultParams = async () => {
  for (const param of DEFAULT_PARAMS) {
    const existing = await SystemParam.findOne({ where: { param_key: param.key } });
    if (!existing) {
      await SystemParam.create({
        param_key: param.key,
        param_value: param.value,
        param_type: param.type,
        param_group: param.group,
        param_name: param.name
      });
    }
  }
};

/**
 * 获取系统参数
 * GET /api/settings/system-params
 */
exports.getSystemParams = async (req, res) => {
  try {
    // 确保默认参数存在
    await initDefaultParams();

    const params = await SystemParam.findAll();
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

    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('获取系统参数失败:', err);
    return res.status(500).json({
      success: false,
      message: '获取系统参数失败'
    });
  }
};

/**
 * 更新系统参数
 * PUT /api/settings/system-params
 */
exports.updateSystemParams = async (req, res) => {
  try {
    const updates = req.body;

    for (const [key, value] of Object.entries(updates)) {
      const param = await SystemParam.findOne({ where: { param_key: key } });
      if (param) {
        let paramValue = value;
        if (param.param_type === 'boolean') {
          paramValue = value ? 'true' : 'false';
        } else if (param.param_type === 'json' && typeof value === 'object') {
          paramValue = JSON.stringify(value);
        } else {
          paramValue = String(value);
        }
        await param.update({ param_value: paramValue });
      } else {
        // 如果参数不存在，创建新参数
        let paramType = 'string';
        if (typeof value === 'boolean') paramType = 'boolean';
        else if (typeof value === 'number') paramType = 'number';
        else if (typeof value === 'object') paramType = 'json';

        let paramValue = value;
        if (paramType === 'boolean') {
          paramValue = value ? 'true' : 'false';
        } else if (paramType === 'json') {
          paramValue = JSON.stringify(value);
        } else {
          paramValue = String(value);
        }

        await SystemParam.create({
          param_key: key,
          param_value: paramValue,
          param_type: paramType
        });
      }
    }

    return res.json({
      success: true,
      message: '保存成功'
    });
  } catch (err) {
    console.error('更新系统参数失败:', err);
    return res.status(500).json({
      success: false,
      message: '更新系统参数失败'
    });
  }
};

/**
 * 获取发票税率设置
 * GET /api/settings/invoice-tax-settings
 */
exports.getInvoiceTaxSettings = async (req, res) => {
  try {
    const specialTaxRate = await SystemParam.getValue('special_invoice_tax_rate', 13);
    const normalTaxRate = await SystemParam.getValue('normal_invoice_tax_rate', 3);
    const specialTaxBurden = await SystemParam.getValue('special_invoice_tax_burden', 8);
    const normalTaxBurden = await SystemParam.getValue('normal_invoice_tax_burden', 3);

    return res.json({
      success: true,
      data: {
        special_invoice_tax_rate: specialTaxRate,
        normal_invoice_tax_rate: normalTaxRate,
        special_invoice_tax_burden: specialTaxBurden,
        normal_invoice_tax_burden: normalTaxBurden
      }
    });
  } catch (err) {
    console.error('获取发票税率设置失败:', err);
    return res.status(500).json({
      success: false,
      message: '获取发票税率设置失败'
    });
  }
};
