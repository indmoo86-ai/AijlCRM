const { Lead, User, FollowUp, Customer } = require('../models');
const { success, error, paginate } = require('../utils/response');
const { Op } = require('sequelize');

// 获取线索列表
exports.getLeads = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      status,
      channel,
      salesOwnerId,
      mediaOwnerId,
      province,
      city,
      keyword,
      startDate,
      endDate,
      demandCategory,
      intentionLevel
    } = req.query;

    const where = {};

    // 筛选条件
    if (status) where.status = status;
    if (channel) where.channelSource = channel;
    if (salesOwnerId) where.salesOwnerId = salesOwnerId;
    if (mediaOwnerId) where.mediaOwnerId = mediaOwnerId;
    if (province) where.province = province;
    if (city) where.city = city;
    if (intentionLevel) where.intentionLevel = intentionLevel;
    // 需求分类搜索（demandCategories是JSON数组格式存储）
    if (demandCategory) {
      where.demandCategories = { [Op.like]: `%${demandCategory}%` };
    }

    // 关键词搜索
    if (keyword) {
      where[Op.or] = [
        { customerName: { [Op.like]: `%${keyword}%` } },
        { hotelName: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ];
    }

    // 日期范围
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = end;
      }
    }

    // 权限过滤：销售人员只能看自己的
    if (req.user.role === 1) {
      where.salesOwnerId = req.user.id;
    }

    const offset = (page - 1) * pageSize;
    const { count, rows } = await Lead.findAndCountAll({
      where,
      include: [
        { model: User, as: 'salesOwner', attributes: ['id', 'name'] },
        { model: User, as: 'mediaOwner', attributes: ['id', 'name'] },
        { model: User, as: 'createdByUser', attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(pageSize),
      offset: parseInt(offset)
    });

    return paginate(res, rows, page, pageSize, count);

  } catch (err) {
    console.error('获取线索列表错误:', err);
    return error(res, '获取失败', 500);
  }
};

// 创建线索
exports.createLead = async (req, res) => {
  try {
    console.log('创建线索请求体:', JSON.stringify(req.body, null, 2));
    console.log('当前用户:', req.user);

    // 支持驼峰和下划线两种命名方式
    const leadData = {
      customerName: req.body.customerName || req.body.customer_name,
      hotelName: req.body.hotelName || req.body.hotel_name || req.body.customer_name,
      province: req.body.province,
      city: req.body.city,
      district: req.body.district,
      address: req.body.address,
      roomCount: req.body.roomCount || req.body.room_count,
      phone: req.body.phone || req.body.contact_phone,
      wechat: req.body.wechat,
      channelSource: req.body.channelSource || req.body.channel_source || req.body.source || 'other',
      firstDemand: req.body.firstDemand || req.body.first_demand || req.body.requirement || req.body.notes,
      mediaOwnerId: req.body.mediaOwnerId || req.body.media_owner_id,
      salesOwnerId: req.body.salesOwnerId || req.body.sales_owner_id || req.user?.id,
      status: req.body.status || 1,
      intentionLevel: req.body.intentionLevel || req.body.intention_level || req.body.priority,
      expectedSignDate: req.body.expectedSignDate || req.body.expected_sign_date || req.body.expected_close_date,
      estimatedAmount: req.body.estimatedAmount || req.body.estimated_amount,
      contactPerson: req.body.contactPerson || req.body.contact_person,
      contactEmail: req.body.contactEmail || req.body.contact_email,
      demandCategories: req.body.demandCategories || req.body.demand_categories,
      createdBy: req.user?.id
    };

    // 生成线索编号
    leadData.leadNo = await Lead.generateLeadNo();

    console.log('准备创建线索数据:', JSON.stringify(leadData, null, 2));

    // 根据手机号+省份查找是否已有客户
    let customer = null;
    let isNewCustomer = false;

    if (leadData.phone && leadData.province) {
      // 查找手机号+省份相同的已有客户
      customer = await Customer.findOne({
        where: {
          phone: leadData.phone,
          province: leadData.province
        }
      });
    }

    // 创建线索
    const lead = await Lead.create(leadData);

    if (customer) {
      // 已有客户，关联线索到该客户
      console.log(`发现已有客户(ID:${customer.id})，手机号:${leadData.phone}，省份:${leadData.province}`);
      await lead.update({ customerId: customer.id });
    } else {
      // 新客户，自动创建
      isNewCustomer = true;
      const customerNo = await Customer.generateCustomerNo();
      customer = await Customer.create({
        customerNo,
        customerName: leadData.customerName || leadData.hotelName,
        customerType: 1, // 潜在客户
        province: leadData.province,
        city: leadData.city,
        district: leadData.district,
        address: leadData.address,
        roomCount: leadData.roomCount,
        phone: leadData.phone,
        salesOwnerId: leadData.salesOwnerId,
        sourceLeadId: lead.id,
        totalAmount: 0,
        contractCount: 0,
        referralCount: 0
      });
      // 更新线索关联的客户ID
      await lead.update({ customerId: customer.id });
      console.log(`创建新客户(ID:${customer.id})，客户编号:${customer.customerNo}`);
    }

    // 返回标准化的响应格式，包含leadId和customerId字段
    const responseData = {
      leadId: lead.id,
      customerId: customer.id,
      customerNo: customer.customerNo,
      isNewCustomer,
      ...lead.toJSON(),
      customer: customer.toJSON()
    };

    const message = isNewCustomer ? '创建成功，已自动创建客户' : '创建成功，已关联到已有客户';
    return success(res, responseData, message, 201);

  } catch (err) {
    console.error('创建线索错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '创建失败', 500);
  }
};

// 获取线索详情
exports.getLeadDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findByPk(id, {
      include: [
        { model: User, as: 'salesOwner', attributes: ['id', 'name', 'phone'] },
        { model: User, as: 'mediaOwner', attributes: ['id', 'name', 'phone'] }
      ]
    });

    if (!lead) {
      return error(res, '线索不存在', 404);
    }

    // 权限检查
    if (req.user.role === 1 && lead.salesOwnerId !== req.user.id) {
      return error(res, '无权访问', 403);
    }

    // 获取跟进记录
    const followUps = await FollowUp.findAll({
      where: { bizType: 1, bizId: id },
      include: [{ model: User, as: 'operator', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']]
    });

    return success(res, {
      lead,
      followUps
    });

  } catch (err) {
    console.error('获取线索详情错误:', err);
    return error(res, '获取失败', 500);
  }
};

// 更新线索
exports.updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const lead = await Lead.findByPk(id);
    if (!lead) {
      return error(res, '线索不存在', 404);
    }

    // 权限检查
    if (req.user.role === 1 && lead.salesOwnerId !== req.user.id) {
      return error(res, '无权操作', 403);
    }

    // 已转化的线索不可编辑
    if (lead.status === 3) {
      return error(res, '已转化的线索不可编辑', 400);
    }

    await lead.update(updateData);

    return success(res, lead, '更新成功');

  } catch (err) {
    console.error('更新线索错误:', err);
    return error(res, '更新失败', 500);
  }
};

// 添加跟进记录
exports.addFollowUp = async (req, res) => {
  try {
    const { id } = req.params;
    const followUpData = req.body;

    const lead = await Lead.findByPk(id);
    if (!lead) {
      return error(res, '线索不存在', 404);
    }

    // 权限检查
    if (req.user.role === 1 && lead.salesOwnerId !== req.user.id) {
      return error(res, '无权操作', 403);
    }

    // 支持驼峰和下划线两种命名方式
    const followType = followUpData.followType || followUpData.follow_type;
    const content = followUpData.content;
    const nextFollowTime = followUpData.nextFollowTime || followUpData.next_follow_time;
    const nextFollowPlan = followUpData.nextFollowPlan || followUpData.next_follow_plan;
    const intentionLevel = followUpData.intentionLevel || followUpData.intention_level;

    // 创建跟进记录
    const followUp = await FollowUp.create({
      bizType: 1, // 线索
      bizId: id,
      followType,
      content,
      nextFollowTime,
      nextFollowPlan,
      intentionLevel,
      operatorId: req.user.id
    });

    // 更新线索的最后跟进时间和意向度
    const updateData = { lastFollowTime: new Date() };
    if (followUpData.intentionLevel) {
      updateData.intentionLevel = followUpData.intentionLevel;
    }
    if (followUpData.nextFollowDate) {
      updateData.nextFollowDate = followUpData.nextFollowDate;
    }

    // 如果是新建状态,自动变更为跟进中
    if (lead.status === 1) {
      updateData.status = 2;
    }

    await lead.update(updateData);

    return success(res, followUp, '添加成功', 201);

  } catch (err) {
    console.error('添加跟进记录错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '添加失败', 500);
  }
};

// 线索转客户
exports.convertToCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customerName,
      customerType,
      industry,
      createOpportunity,
      opportunityName,
      expectedAmount,
      expectedSignDate
    } = req.body;

    const lead = await Lead.findByPk(id);
    if (!lead) {
      return error(res, '线索不存在', 404);
    }

    // 权限检查
    if (req.user.role === 1 && lead.salesOwnerId !== req.user.id) {
      return error(res, '无权操作', 403);
    }

    // 检查是否已转化
    if (lead.status === 3) {
      return error(res, '线索已转化', 400);
    }

    // 生成客户编号
    const customerNo = await Customer.generateCustomerNo();

    // 创建客户 (salesOwnerId必填，如果线索没有则使用当前用户)
    const customer = await Customer.create({
      customerNo,
      customerName: customerName || lead.hotelName,
      customerType: customerType || 1,
      industry,
      province: lead.province,
      city: lead.city,
      district: lead.district,
      address: lead.address,
      roomCount: lead.roomCount,
      salesOwnerId: lead.salesOwnerId || req.user.id,
      sourceLeadId: id
    });

    // 更新线索状态为已转化
    await lead.update({ status: 3 });

    // TODO: 如果需要创建商机，这里添加商机创建逻辑

    // 返回标准化的响应格式，包含customerId字段
    const responseData = {
      customerId: customer.id,
      customerNo: customer.customerNo,
      ...customer.toJSON(),
      message: '转化成功'
    };

    return success(res, responseData, '转化成功', 201);

  } catch (err) {
    console.error('线索转客户错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '转化失败', 500);
  }
};

// 分配线索
exports.assignLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { salesOwnerId } = req.body;

    // 只有主管可以分配
    if (req.user.role !== 3 && req.user.role !== 6) {
      return error(res, '无权操作', 403);
    }

    const lead = await Lead.findByPk(id);
    if (!lead) {
      return error(res, '线索不存在', 404);
    }

    // 检查新负责人是否存在
    const newOwner = await User.findByPk(salesOwnerId);
    if (!newOwner) {
      return error(res, '指定的销售负责人不存在', 404);
    }

    await lead.update({ salesOwnerId });

    return success(res, lead, '分配成功');

  } catch (err) {
    console.error('分配线索错误:', err);
    return error(res, '分配失败', 500);
  }
};

// 放弃线索
exports.abandonLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { stallReason } = req.body;

    const lead = await Lead.findByPk(id);
    if (!lead) {
      return error(res, '线索不存在', 404);
    }

    // 权限检查
    if (req.user.role === 1 && lead.salesOwnerId !== req.user.id) {
      return error(res, '无权操作', 403);
    }

    if (!stallReason) {
      return error(res, '请填写放弃原因', 400);
    }

    await lead.update({
      status: 4,
      stallReason
    });

    return success(res, lead, '操作成功');

  } catch (err) {
    console.error('放弃线索错误:', err);
    return error(res, '操作失败', 500);
  }
};

// 删除线索
exports.deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findByPk(id);
    if (!lead) {
      return error(res, '线索不存在', 404);
    }

    // 权限检查：只有管理员或线索负责人可删除
    if (req.user.role === 1 && lead.salesOwnerId !== req.user.id) {
      return error(res, '无权操作', 403);
    }

    // 已转化的线索不可删除
    if (lead.status === 3) {
      return error(res, '已转化的线索不可删除', 400);
    }

    await lead.destroy();

    return success(res, null, '删除成功');

  } catch (err) {
    console.error('删除线索错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '删除失败', 500);
  }
};
