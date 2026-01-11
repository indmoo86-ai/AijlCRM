/**
 * 客户管理 Controller
 */
const Customer = require('../models/Customer');
const CustomerContact = require('../models/CustomerContact');
const Lead = require('../models/Lead');
const FollowUp = require('../models/FollowUp');
const Contract = require('../models/Contract');
const Quotation = require('../models/Quotation');
const User = require('../models/User');
const { success, error } = require('../utils/response');
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

    return success(res, {
      list: rows,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: count,
        totalPages: Math.ceil(count / pageSize)
      }
    }, '查询成功');
  } catch (err) {
    console.error('查询客户列表失败:', err);
    return error(res, '查询客户列表失败', 500);
  }
};

/**
 * 创建客户
 * POST /api/customers
 */
exports.createCustomer = async (req, res) => {
  try {
    // 参数命名兼容性处理（支持驼峰和下划线）
    const customerName = req.body.customerName || req.body.customer_name;
    const customerType = req.body.customerType || req.body.customer_type;
    const customerLevel = req.body.customerLevel || req.body.customer_level;
    const customerStage = req.body.customerStage || req.body.customer_stage;
    const industry = req.body.industry;
    const province = req.body.province;
    const city = req.body.city;
    const address = req.body.address;
    const contactPhone = req.body.contactPhone || req.body.contact_phone;
    const hotelRooms = req.body.hotelRooms || req.body.hotel_rooms;
    const hotelStar = req.body.hotelStar || req.body.hotel_star;
    const source = req.body.source;
    const description = req.body.description;
    const ownerId = req.body.ownerId || req.body.owner_id || req.user.id;

    // 生成客户编码
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const customerNo = `CUST-${dateStr}-${Date.now().toString().slice(-4)}`;

    const customer = await Customer.create({
      customerNo,
      customerName,
      customerType: customerType || 1,
      industry,
      province,
      city,
      address,
      roomCount: hotelRooms,
      salesOwnerId: ownerId
    });

    // 响应格式标准化（包含主键ID + 完整数据）
    const responseData = {
      customerId: customer.id,
      ...customer.toJSON()
    };

    return success(res, responseData, '客户创建成功', 201);
  } catch (err) {
    console.error('创建客户失败:', err);
    console.error('错误详情:', err.message);
    return error(res, '创建客户失败', 500);
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
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'salesOwner',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!customer) {
      return error(res, '客户不存在', 404);
    }

    // 查询关联的线索
    const leads = await Lead.findAll({
      where: { customer_id: id },
      order: [['created_at', 'DESC']]
    });

    // 获取最近一次沟通时间（从线索跟踪记录和客户回访记录中获取最新的）
    let lastCommunicationTime = null;
    let lastCommunicationContent = null;
    let lastCommunicationOperator = null;
    let lastCommunicationType = null;

    // 1. 查询客户回访记录（bizType=2）
    const customerFollowUp = await FollowUp.findOne({
      where: {
        bizType: 2, // 2 = 客户
        bizId: id
      },
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'operator', attributes: ['id', 'name'] }]
    });

    // 2. 查询线索跟进记录（bizType=1）
    let leadFollowUp = null;
    if (leads.length > 0) {
      const leadIds = leads.map(l => l.id);
      leadFollowUp = await FollowUp.findOne({
        where: {
          bizType: 1, // 1 = 线索
          bizId: { [Op.in]: leadIds }
        },
        order: [['created_at', 'DESC']],
        include: [{ model: User, as: 'operator', attributes: ['id', 'name'] }]
      });
    }

    // 3. 比较两者，取最新的
    if (customerFollowUp && leadFollowUp) {
      if (new Date(customerFollowUp.created_at) >= new Date(leadFollowUp.created_at)) {
        lastCommunicationTime = customerFollowUp.created_at;
        lastCommunicationContent = customerFollowUp.content;
        lastCommunicationOperator = customerFollowUp.operator?.name;
        lastCommunicationType = 'visit';
      } else {
        lastCommunicationTime = leadFollowUp.created_at;
        lastCommunicationContent = leadFollowUp.content;
        lastCommunicationOperator = leadFollowUp.operator?.name;
        lastCommunicationType = 'lead';
      }
    } else if (customerFollowUp) {
      lastCommunicationTime = customerFollowUp.created_at;
      lastCommunicationContent = customerFollowUp.content;
      lastCommunicationOperator = customerFollowUp.operator?.name;
      lastCommunicationType = 'visit';
    } else if (leadFollowUp) {
      lastCommunicationTime = leadFollowUp.created_at;
      lastCommunicationContent = leadFollowUp.content;
      lastCommunicationOperator = leadFollowUp.operator?.name;
      lastCommunicationType = 'lead';
    }

    // 查询关联的报价单
    const quotations = await Quotation.findAll({
      where: { customer_id: id },
      order: [['created_at', 'DESC']],
      limit: 10
    });

    // 查询关联的合同
    const contracts = await Contract.findAll({
      where: { customer_id: id },
      order: [['created_at', 'DESC']],
      limit: 10
    });

    return success(res, {
      customer,
      leads,
      quotations,
      contracts,
      lastCommunicationTime,
      lastCommunicationContent,
      lastCommunicationOperator,
      lastCommunicationType
    }, '查询成功');
  } catch (err) {
    console.error('查询客户详情失败:', err);
    console.error('错误详情:', err.message);
    return error(res, '查询客户详情失败', 500);
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
      return error(res, '客户不存在', 404);
    }

    await customer.update({
      ...req.body,
      updater_id: req.user.id
    });

    return success(res, customer, '客户信息更新成功');
  } catch (err) {
    console.error('更新客户信息失败:', err);
    return error(res, '更新客户信息失败', 500);
  }
};

/**
 * 添加客户联系人
 * POST /api/customers/:id/contacts
 */
exports.addCustomerContact = async (req, res) => {
  try {
    const { id } = req.params;

    // 参数命名兼容性处理
    const contactName = req.body.contactName || req.body.contact_name;
    const position = req.body.position;
    const mobile = req.body.mobile;
    const wechat = req.body.wechat;
    const email = req.body.email;
    const isPrimary = req.body.isPrimary || req.body.is_primary;
    const description = req.body.description;

    const customer = await Customer.findByPk(id);
    if (!customer) {
      return error(res, '客户不存在', 404);
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
      creator_id: req.user.id
    });

    // 响应格式标准化
    const responseData = {
      contactId: contact.contact_id,
      ...contact.toJSON()
    };

    return success(res, responseData, '联系人添加成功', 201);
  } catch (err) {
    console.error('添加客户联系人失败:', err);
    console.error('错误详情:', err.message);
    return error(res, '添加客户联系人失败', 500);
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
      return error(res, '客户不存在', 404);
    }

    const stageBefore = customer.customer_stage;

    await customer.update({
      customer_stage: targetStage,
      stage_updated_at: new Date(),
      updater_id: req.user.id
    });

    // TODO: 记录阶段变更日志或创建跟进记录

    return success(res, {
      customerId: customer.customer_id,
      customerStage: customer.customer_stage,
      stageBefore,
      stageAfter: targetStage,
      stageUpdatedAt: customer.stage_updated_at
    }, '客户阶段推进成功');
  } catch (err) {
    console.error('推进客户阶段失败:', err);
    return error(res, '推进客户阶段失败', 500);
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
      return error(res, '客户不存在', 404);
    }

    const oldOwnerId = customer.owner_id;

    await customer.update({
      owner_id: newOwnerId,
      updater_id: req.user.id
    });

    // TODO: 记录负责人转移日志

    return success(res, {
      customerId: customer.customer_id,
      oldOwnerId,
      newOwnerId,
      transferReason
    }, '客户负责人转移成功');
  } catch (err) {
    console.error('转移客户负责人失败:', err);
    return error(res, '转移客户负责人失败', 500);
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
    return success(res, {
      total: customers.length,
      exportUrl: `/exports/customers_${Date.now()}.xlsx`
    }, '导出成功');
  } catch (err) {
    console.error('导出客户数据失败:', err);
    return error(res, '导出客户数据失败', 500);
  }
};

/**
 * 添加客户回访记录
 * POST /api/customers/:id/visit
 */
exports.addCustomerVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, followType, nextPlan, nextFollowDate } = req.body;

    const customer = await Customer.findByPk(id);
    if (!customer) {
      return error(res, '客户不存在', 404);
    }

    // 创建跟进记录（bizType=2 表示客户）
    const followUp = await FollowUp.create({
      bizType: 2, // 客户
      bizId: id,
      followType: followType || 'visit',
      content: content || '回访记录',
      nextPlan,
      nextFollowDate,
      operatorId: req.user?.id || 1
    });

    // 更新客户最后联系时间
    await customer.update({
      lastContactTime: new Date()
    });

    const responseData = {
      followUpId: followUp.id,
      ...followUp.toJSON()
    };

    return success(res, responseData, '回访记录添加成功', 201);
  } catch (err) {
    console.error('添加客户回访记录失败:', err);
    console.error('错误详情:', err.message);
    return error(res, '添加客户回访记录失败', 500);
  }
};

/**
 * 获取客户回访记录列表
 * GET /api/customers/:id/visits
 */
exports.getCustomerVisits = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByPk(id);
    if (!customer) {
      return error(res, '客户不存在', 404);
    }

    const visits = await FollowUp.findAll({
      where: {
        bizType: 2, // 客户
        bizId: id
      },
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'operator', attributes: ['id', 'name'] }]
    });

    return success(res, { list: visits }, '查询成功');
  } catch (err) {
    console.error('查询客户回访记录失败:', err);
    return error(res, '查询客户回访记录失败', 500);
  }
};

/**
 * 删除客户
 * DELETE /api/customers/:id
 */
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByPk(id);

    if (!customer) {
      return error(res, '客户不存在', 404);
    }

    // 检查是否有关联数据（可选：报价单、合同等）
    // 这里暂时允许直接删除

    await customer.destroy();

    return success(res, null, '删除成功');
  } catch (err) {
    console.error('删除客户失败:', err);
    console.error('错误详情:', err.message);
    return error(res, '删除客户失败', 500);
  }
};
