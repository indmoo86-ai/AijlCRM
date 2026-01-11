const { Lead, User, FollowUp, Customer, Task } = require('../models');
const { success, error, paginate } = require('../utils/response');
const { Op } = require('sequelize');
const { LEAD_STATUS } = require('../constants/status');
const StateMachineService = require('../services/stateMachineService');

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
      intentionLevel,
      warningLevel
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
    // 预警状态筛选
    if (warningLevel !== undefined && warningLevel !== '') {
      where.warningLevel = parseInt(warningLevel);
    }
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

    // 获取每个线索的最新跟踪记录
    const leadIds = rows.map(lead => lead.id).filter(Boolean);
    let followUpMap = {};

    if (leadIds.length > 0) {
      const latestFollowUps = await FollowUp.findAll({
        where: {
          bizType: 1,
          bizId: { [Op.in]: leadIds }
        },
        include: [{ model: User, as: 'operator', attributes: ['id', 'name'] }],
        order: [['created_at', 'DESC']]
      });

      console.log(`[getLeads] 查询线索IDs: ${leadIds.join(',')}, 找到跟踪记录: ${latestFollowUps.length}条`);

      // 按线索ID分组，取每个线索的最新跟踪记录
      latestFollowUps.forEach(followUp => {
        if (!followUpMap[followUp.bizId]) {
          followUpMap[followUp.bizId] = followUp;
        }
      });

      console.log(`[getLeads] followUpMap keys: ${Object.keys(followUpMap).join(',')}`);
    }

    // 将最新跟踪记录附加到线索数据
    const rowsWithFollowUp = rows.map(lead => {
      const leadJson = lead.toJSON();
      leadJson.latestFollowUp = followUpMap[lead.id] || null;
      return leadJson;
    });

    const withFollowUpCount = rowsWithFollowUp.filter(r => r.latestFollowUp).length;
    console.log(`[getLeads] 返回 ${rowsWithFollowUp.length} 条线索，其中 ${withFollowUpCount} 条有跟踪记录`);

    return paginate(res, rowsWithFollowUp, page, pageSize, count);

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
      createdBy: req.user?.id
    };

    // 处理需求分类：如果是数组则转为JSON字符串
    const demandCategories = req.body.demandCategories || req.body.demand_categories;
    if (demandCategories) {
      leadData.demandCategories = Array.isArray(demandCategories)
        ? JSON.stringify(demandCategories)
        : demandCategories;
    }

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
        wechat: leadData.wechat,
        salesOwnerId: leadData.salesOwnerId,
        sourceLeadId: lead.id,
        channelSource: leadData.channelSource, // 来源渠道
        createdBy: req.user?.id, // 创建人
        totalAmount: 0,
        contractCount: 0,
        referralCount: 0
      });
      // 更新线索关联的客户ID
      await lead.update({ customerId: customer.id });
      console.log(`创建新客户(ID:${customer.id})，客户编号:${customer.customerNo}`);
    }

    // 创建跟踪记录
    try {
      await FollowUp.create({
        bizType: 1, // 线索
        bizId: lead.id,
        followType: 'create',
        content: `创建了线索，客户：${leadData.customerName || leadData.hotelName}，房间数：${leadData.roomCount || '-'}`,
        operatorId: req.user?.id
      });
    } catch (followUpErr) {
      console.error('创建跟踪记录失败:', followUpErr);
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
    const { Quotation, Contract } = require('../models');

    const lead = await Lead.findByPk(id, {
      include: [
        { model: User, as: 'salesOwner', attributes: ['id', 'name', 'phone'] },
        { model: User, as: 'mediaOwner', attributes: ['id', 'name', 'phone'] },
        { model: User, as: 'createdByUser', attributes: ['id', 'name'] },
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'customerNo', 'customerName', 'customerType', 'phone', 'totalAmount', 'contractCount']
        }
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

    // 获取关联的报价单（优先通过lead_id，其次通过customer_id）
    const { QuotationItem } = require('../models');
    let quotations = [];
    // 先通过lead_id查找
    quotations = await Quotation.findAll({
      where: { lead_id: id },
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name'] },
        { model: QuotationItem, as: 'items' }
      ],
      order: [['version', 'DESC'], ['created_at', 'DESC']],
      limit: 20
    });
    // 如果没有找到，再通过customer_id查找
    if (quotations.length === 0 && lead.customerId) {
      quotations = await Quotation.findAll({
        where: { customer_id: lead.customerId },
        include: [
          { model: User, as: 'owner', attributes: ['id', 'name'] },
          { model: QuotationItem, as: 'items' }
        ],
        order: [['version', 'DESC'], ['created_at', 'DESC']],
        limit: 20
      });
    }

    // 获取关联的合同（通过lead_id或customer_id）
    const { ContractItem } = require('../models');
    let contracts = [];
    // 先通过lead_id查找
    contracts = await Contract.findAll({
      where: { lead_id: id },
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name'] },
        { model: ContractItem, as: 'items' }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });
    // 如果没有找到，再通过customer_id查找
    if (contracts.length === 0 && lead.customerId) {
      contracts = await Contract.findAll({
        where: { customer_id: lead.customerId },
        include: [
          { model: User, as: 'owner', attributes: ['id', 'name'] },
          { model: ContractItem, as: 'items' }
        ],
        order: [['created_at', 'DESC']],
        limit: 10
      });
    }

    // 计算时间提醒
    const now = new Date();
    const timeReminders = [];

    // 下次跟进日期提醒
    if (lead.nextFollowDate) {
      const nextFollowDate = new Date(lead.nextFollowDate);
      const diffDays = Math.ceil((nextFollowDate - now) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        timeReminders.push({ type: 'overdue', message: `已逾期${Math.abs(diffDays)}天未跟进`, date: lead.nextFollowDate });
      } else if (diffDays === 0) {
        timeReminders.push({ type: 'today', message: '今日需跟进', date: lead.nextFollowDate });
      } else if (diffDays <= 3) {
        timeReminders.push({ type: 'upcoming', message: `${diffDays}天后需跟进`, date: lead.nextFollowDate });
      }
    }

    // 预期签约日期提醒
    if (lead.expectedSignDate) {
      const expectedDate = new Date(lead.expectedSignDate);
      const diffDays = Math.ceil((expectedDate - now) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        timeReminders.push({ type: 'overdue', message: `预期签约已过期${Math.abs(diffDays)}天`, date: lead.expectedSignDate });
      } else if (diffDays <= 7) {
        timeReminders.push({ type: 'upcoming', message: `距预期签约还有${diffDays}天`, date: lead.expectedSignDate });
      }
    }

    // 长期未跟进提醒
    if (lead.lastFollowTime) {
      const lastFollow = new Date(lead.lastFollowTime);
      const diffDays = Math.ceil((now - lastFollow) / (1000 * 60 * 60 * 24));
      if (diffDays > 14) {
        timeReminders.push({ type: 'warning', message: `已${diffDays}天未跟进`, date: lead.lastFollowTime });
      }
    } else if (lead.created_at) {
      const createdAt = new Date(lead.created_at);
      const diffDays = Math.ceil((now - createdAt) / (1000 * 60 * 60 * 24));
      if (diffDays > 7) {
        timeReminders.push({ type: 'warning', message: `创建${diffDays}天未跟进`, date: lead.created_at });
      }
    }

    return success(res, {
      lead,
      followUps,
      quotations,
      contracts,
      timeReminders
    });

  } catch (err) {
    console.error('获取线索详情错误:', err);
    console.error('错误详情:', err.message);
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
    if (lead.status === LEAD_STATUS.CONVERTED) {
      return error(res, '已转化的线索不可编辑', 400);
    }

    // 记录变更内容
    const changes = [];
    const oldData = lead.toJSON();

    // 检测关键字段变更
    const fieldLabels = {
      customerName: '客户名称',
      hotelName: '酒店名称',
      phone: '联系电话',
      wechat: '微信',
      province: '省份',
      city: '城市',
      district: '区县',
      roomCount: '房间数',
      intentionLevel: '意向程度',
      channelSource: '来源渠道',
      firstDemand: '需求描述',
      demandCategories: '需求分类'
    };

    for (const [field, label] of Object.entries(fieldLabels)) {
      if (updateData[field] !== undefined && updateData[field] !== oldData[field]) {
        const oldVal = oldData[field] || '-';
        const newVal = updateData[field] || '-';
        changes.push(`${label}: ${oldVal} → ${newVal}`);
      }
    }

    await lead.update(updateData);

    // 创建跟踪记录
    if (changes.length > 0) {
      try {
        await FollowUp.create({
          bizType: 1, // 线索
          bizId: lead.id,
          followType: 'edit',
          content: `编辑了线索信息：${changes.join('；')}`,
          operatorId: req.user?.id
        });
      } catch (followUpErr) {
        console.error('创建跟踪记录失败:', followUpErr);
      }
    }

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
    const nextFollowDate = followUpData.nextFollowDate || followUpData.next_follow_date;
    const nextFollowPlan = followUpData.nextFollowPlan || followUpData.next_follow_plan;
    const intentionLevel = followUpData.intentionLevel || followUpData.intention_level;
    const attachments = followUpData.attachments || followUpData.attachments;

    // 创建跟进记录
    const followUp = await FollowUp.create({
      bizType: 1, // 线索
      bizId: id,
      followType,
      content,
      nextFollowDate,
      nextPlan: nextFollowPlan,
      intentionLevel,
      attachments: attachments ? (typeof attachments === 'string' ? JSON.parse(attachments) : attachments) : null,
      operatorId: req.user.id
    });

    // 更新线索的最后跟进时间和意向度
    const updateData = {
      lastFollowTime: new Date(),
      warningLevel: 0 // 跟踪后重置预警状态为正常
    };
    if (intentionLevel) {
      updateData.intentionLevel = intentionLevel;
    }
    if (nextFollowDate) {
      updateData.nextFollowDate = nextFollowDate;
    }

    // 如果是新建状态,自动变更为跟进中
    if (lead.status === LEAD_STATUS.NEW) {
      if (StateMachineService.validateTransition('lead', lead.status, LEAD_STATUS.FOLLOWING)) {
        updateData.status = LEAD_STATUS.FOLLOWING;
      }
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

    // 状态机验证
    if (!StateMachineService.validateTransition('lead', lead.status, LEAD_STATUS.CONVERTED)) {
      return error(res, '当前线索状态无法进行转化操作', 400);
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
      phone: lead.phone,
      wechat: lead.wechat,
      salesOwnerId: lead.salesOwnerId || req.user.id,
      sourceLeadId: id,
      channelSource: lead.channelSource, // 来源渠道
      createdBy: req.user?.id // 创建人
    });

    // 更新线索状态为已转化
    await lead.update({ status: LEAD_STATUS.CONVERTED });

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

    // 自动创建任务给新负责人
    try {
      await Task.create({
        task_type: 'lead_assign',
        task_title: `新分配线索：${lead.customerName || lead.hotelName}`,
        task_description: `线索已分配给您，请尽快跟进。\n客户：${lead.customerName}\n电话：${lead.phone}\n意向度：${lead.intentionLevel || '未设置'}`,
        priority: 'high',
        status: 'pending',
        source_type: 'lead',
        source_id: lead.id,
        assignee_id: salesOwnerId,
        assigner_id: req.user.id,
        assigned_at: new Date(),
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时内跟进
        created_by: req.user.id
      });
    } catch (taskErr) {
      console.error('自动创建分配任务失败:', taskErr);
    }

    // 添加跟踪记录
    try {
      const newOwner = await User.findByPk(salesOwnerId);
      await FollowUp.create({
        bizType: 1, // 线索
        bizId: lead.id,
        followType: 'assign',
        content: `线索分配给：${newOwner ? newOwner.name : salesOwnerId}`,
        operatorId: req.user.id
      });
    } catch (followUpErr) {
      console.error('创建分配跟踪记录失败:', followUpErr);
    }

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

    // 状态机验证
    if (!StateMachineService.validateTransition('lead', lead.status, LEAD_STATUS.ABANDONED)) {
      return error(res, '当前线索状态无法放弃', 400);
    }

    if (!stallReason) {
      return error(res, '请填写放弃原因', 400);
    }

    await lead.update({
      status: LEAD_STATUS.ABANDONED,
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
    if (lead.status === LEAD_STATUS.CONVERTED) {
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
