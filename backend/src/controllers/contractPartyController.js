/**
 * 合同主体管理控制器
 */
const { ContractParty } = require('../models');
const { success, error, paginate } = require('../utils/response');
const { Op } = require('sequelize');

/**
 * 创建合同主体
 */
exports.createContractParty = async (req, res) => {
  try {
    const {
      party_type = 'company',
      party_name,
      representative,
      contact_phone,
      tax_id,
      bank_name,
      bank_account,
      address,
      is_default = 0
    } = req.body;

    // 参数验证
    if (!party_name) {
      return error(res, '主体名称不能为空', 400);
    }

    // 如果设置为默认，取消其他默认
    if (is_default === 1) {
      await ContractParty.update(
        { is_default: 0 },
        { where: { is_default: 1 } }
      );
    }

    const party = await ContractParty.create({
      party_type,
      party_name,
      representative,
      contact_phone,
      tax_id,
      bank_name,
      bank_account,
      address,
      is_default,
      status: 'active',
      created_by: req.user?.id
    });

    const responseData = {
      partyId: party.party_id,
      ...party.toJSON()
    };

    return success(res, responseData, '合同主体创建成功', 201);
  } catch (err) {
    console.error('创建合同主体错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '创建失败', 500);
  }
};

/**
 * 获取合同主体列表
 */
exports.getContractPartyList = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      party_type,
      status,
      keyword
    } = req.query;

    const where = {};

    if (party_type) {
      where.party_type = party_type;
    }

    if (status) {
      where.status = status;
    }

    if (keyword) {
      where[Op.or] = [
        { party_name: { [Op.like]: `%${keyword}%` } },
        { representative: { [Op.like]: `%${keyword}%` } },
        { tax_id: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await ContractParty.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      order: [
        ['is_default', 'DESC'],
        ['created_at', 'DESC']
      ]
    });

    return paginate(res, rows, page, pageSize, count);
  } catch (err) {
    console.error('获取合同主体列表错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '查询失败', 500);
  }
};

/**
 * 获取启用的合同主体列表（用于下拉选择）
 */
exports.getActiveContractParties = async (req, res) => {
  try {
    const parties = await ContractParty.findAll({
      where: { status: 'active' },
      order: [
        ['is_default', 'DESC'],
        ['party_name', 'ASC']
      ],
      attributes: [
        'party_id',
        'party_type',
        'party_name',
        'representative',
        'contact_phone',
        'tax_id',
        'bank_name',
        'bank_account',
        'address',
        'is_default'
      ]
    });

    return success(res, parties, '查询成功');
  } catch (err) {
    console.error('获取启用合同主体列表错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '查询失败', 500);
  }
};

/**
 * 获取合同主体详情
 */
exports.getContractPartyDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const party = await ContractParty.findByPk(id);

    if (!party) {
      return error(res, '合同主体不存在', 404);
    }

    return success(res, party, '查询成功');
  } catch (err) {
    console.error('获取合同主体详情错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '查询失败', 500);
  }
};

/**
 * 更新合同主体
 */
exports.updateContractParty = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      party_type,
      party_name,
      representative,
      contact_phone,
      tax_id,
      bank_name,
      bank_account,
      address,
      is_default
    } = req.body;

    const party = await ContractParty.findByPk(id);

    if (!party) {
      return error(res, '合同主体不存在', 404);
    }

    // 如果设置为默认，取消其他默认
    if (is_default === 1 && party.is_default !== 1) {
      await ContractParty.update(
        { is_default: 0 },
        { where: { is_default: 1, party_id: { [Op.ne]: id } } }
      );
    }

    await party.update({
      party_type: party_type !== undefined ? party_type : party.party_type,
      party_name: party_name !== undefined ? party_name : party.party_name,
      representative: representative !== undefined ? representative : party.representative,
      contact_phone: contact_phone !== undefined ? contact_phone : party.contact_phone,
      tax_id: tax_id !== undefined ? tax_id : party.tax_id,
      bank_name: bank_name !== undefined ? bank_name : party.bank_name,
      bank_account: bank_account !== undefined ? bank_account : party.bank_account,
      address: address !== undefined ? address : party.address,
      is_default: is_default !== undefined ? is_default : party.is_default,
      updated_by: req.user?.id
    });

    return success(res, party, '更新成功');
  } catch (err) {
    console.error('更新合同主体错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '更新失败', 500);
  }
};

/**
 * 更新合同主体状态（启用/禁用）
 */
exports.updateContractPartyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return error(res, '无效的状态值', 400);
    }

    const party = await ContractParty.findByPk(id);

    if (!party) {
      return error(res, '合同主体不存在', 404);
    }

    await party.update({
      status,
      updated_by: req.user?.id
    });

    const statusText = status === 'active' ? '启用' : '禁用';
    return success(res, party, `${statusText}成功`);
  } catch (err) {
    console.error('更新合同主体状态错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '操作失败', 500);
  }
};

/**
 * 删除合同主体（软删除）
 */
exports.deleteContractParty = async (req, res) => {
  try {
    const { id } = req.params;

    const party = await ContractParty.findByPk(id);

    if (!party) {
      return error(res, '合同主体不存在', 404);
    }

    await party.destroy();

    return success(res, null, '删除成功');
  } catch (err) {
    console.error('删除合同主体错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '删除失败', 500);
  }
};
