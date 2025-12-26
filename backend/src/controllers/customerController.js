/**
 * 客户管理 Controller
 */
const Customer = require('../models/Customer');
const CustomerContact = require('../models/CustomerContact');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');

/**
 * 获取客户列表
 * GET /api/customers
 */
exports.getCustomerList = async (req, res) => {
  try {
    const { 
      page = 1, 
      pageSize = 20, 
      customerStage, 
      customerType, 
      customerLevel, 
      ownerId, 
      source, 
      province, 
      city, 
      keyword 
    } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (customerStage) where.customer_stage = customerStage;
    if (customerType) where.customer_type = customerType;
    if (customerLevel) where.customer_level = customerLevel;
    if (ownerId) where.owner_id = ownerId;
    if (source) where.source = source;
    if (province) where.province = province;
    if (city) where.city = city;
    if (keyword) {
      where[Op.or] = [
        { customer_name: { [Op.like]: `%${keyword}%` } },
        { contact_phone: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await Customer.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset: parseInt(offset)
    });

    return successResponse(res, {
      list: rows,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: count,
        totalPages: Math.ceil(count / pageSize)
      }
    }, '查询成功');
  } catch (error) {
    console.error('查询客户列表失败:', error);
    return errorResponse(res, '查询客户列表失败', 500);
  }
};

/**
 * 创建客户
 * POST /api/customers
 */
exports.createCustomer = async (req, res) => {
  try {
    const {
      customerName,
      customerType,
      customerLevel,
      customerStage,
      industry,
      province,
      city,
      address,
      contactPhone,
      hotelRooms,
      hotelStar,
      source,
      description,
      ownerId
    } = req.body;

    // 生成客户编码
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const customer_code = `CUST-${dateStr}-${Date.now().toString().slice(-4)}`;

    const customer = await Customer.create({
      customer_code,
      customer_name: customerName,
      customer_type: customerType,
      customer_level: customerLevel,
      customer_stage: customerStage || 'lead',
      industry,
      province,
      city,
      address,
      contact_phone: contactPhone,
      hotel_rooms: hotelRooms,
      hotel_star: hotelStar,
      source,
      description,
      owner_id: ownerId || req.user.user_id,
      creator_id: req.user.user_id
    });

    return successResponse(res, {
      customerId: customer.customer_id,
      customerCode: customer.customer_code,
      customerName: customer.customer_name,
      customerStage: customer.customer_stage,
      ownerId: customer.owner_id,
      createdAt: customer.created_at
    }, '客户创建成功');
  } catch (error) {
    console.error('创建客户失败:', error);
    return errorResponse(res, '创建客户失败', 500);
  }
};

/**
 * 获取客户详情
 * GET /api/customers/:id
 */
exports.getCustomerDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await Customer.findByPk(id, {
      include: [
        { 
          model: CustomerContact, 
          as: 'contacts',
          order: [['is_primary', 'DESC'], ['created_at', 'ASC']]
        }
      ]
    });

    if (!customer) {
      return errorResponse(res, '客户不存在', 404);
    }

    // TODO: 关联查询报价单、合同、跟进记录等
    return successResponse(res, {
      customer,
      quotations: [],
      contracts: [],
      followUps: []
    }, '查询成功');
  } catch (error) {
    console.error('查询客户详情失败:', error);
    return errorResponse(res, '查询客户详情失败', 500);
  }
};

/**
 * 修改客户信息
 * PUT /api/customers/:id
 */
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByPk(id);

    if (!customer) {
      return errorResponse(res, '客户不存在', 404);
    }

    await customer.update({
      ...req.body,
      updater_id: req.user.user_id
    });

    return successResponse(res, customer, '客户信息更新成功');
  } catch (error) {
    console.error('更新客户信息失败:', error);
    return errorResponse(res, '更新客户信息失败', 500);
  }
};

/**
 * 添加客户联系人
 * POST /api/customers/:id/contacts
 */
exports.addCustomerContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { contactName, position, mobile, wechat, email, isPrimary, description } = req.body;

    const customer = await Customer.findByPk(id);
    if (!customer) {
      return errorResponse(res, '客户不存在', 404);
    }

    // 如果设置为主要联系人,先将其他联系人的is_primary设为0
    if (isPrimary === 1) {
      await CustomerContact.update(
        { is_primary: 0 },
        { where: { customer_id: id } }
      );
    }

    const contact = await CustomerContact.create({
      customer_id: id,
      contact_name: contactName,
      position,
      mobile,
      wechat,
      email,
      is_primary: isPrimary || 0,
      description,
      creator_id: req.user.user_id
    });

    return successResponse(res, contact, '联系人添加成功');
  } catch (error) {
    console.error('添加客户联系人失败:', error);
    return errorResponse(res, '添加客户联系人失败', 500);
  }
};

/**
 * 推进客户阶段
 * PUT /api/customers/:id/stage
 */
exports.advanceCustomerStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetStage, stageDesc } = req.body;

    const customer = await Customer.findByPk(id);
    if (!customer) {
      return errorResponse(res, '客户不存在', 404);
    }

    const stageBefore = customer.customer_stage;

    await customer.update({
      customer_stage: targetStage,
      stage_updated_at: new Date(),
      updater_id: req.user.user_id
    });

    // TODO: 记录阶段变更日志或创建跟进记录

    return successResponse(res, {
      customerId: customer.customer_id,
      customerStage: customer.customer_stage,
      stageBefore,
      stageAfter: targetStage,
      stageUpdatedAt: customer.stage_updated_at
    }, '客户阶段推进成功');
  } catch (error) {
    console.error('推进客户阶段失败:', error);
    return errorResponse(res, '推进客户阶段失败', 500);
  }
};

/**
 * 转移客户负责人
 * PUT /api/customers/:id/owner
 */
exports.transferCustomerOwner = async (req, res) => {
  try {
    const { id } = req.params;
    const { newOwnerId, transferReason } = req.body;

    const customer = await Customer.findByPk(id);
    if (!customer) {
      return errorResponse(res, '客户不存在', 404);
    }

    const oldOwnerId = customer.owner_id;

    await customer.update({
      owner_id: newOwnerId,
      updater_id: req.user.user_id
    });

    // TODO: 记录负责人转移日志

    return successResponse(res, {
      customerId: customer.customer_id,
      oldOwnerId,
      newOwnerId,
      transferReason
    }, '客户负责人转移成功');
  } catch (error) {
    console.error('转移客户负责人失败:', error);
    return errorResponse(res, '转移客户负责人失败', 500);
  }
};

/**
 * 导出客户数据
 * GET /api/customers/export
 */
exports.exportCustomers = async (req, res) => {
  try {
    const { customerStage, ownerId, startDate, endDate } = req.query;

    const where = {};
    if (customerStage) where.customer_stage = customerStage;
    if (ownerId) where.owner_id = ownerId;
    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [startDate, endDate]
      };
    }

    const customers = await Customer.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    // TODO: 实现Excel文件生成逻辑
    return successResponse(res, {
      total: customers.length,
      exportUrl: `/exports/customers_${Date.now()}.xlsx`
    }, '导出成功');
  } catch (error) {
    console.error('导出客户数据失败:', error);
    return errorResponse(res, '导出客户数据失败', 500);
  }
};
