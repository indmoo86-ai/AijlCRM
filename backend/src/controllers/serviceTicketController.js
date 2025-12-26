/**
 * 售后服务管理 Controller
 */
const ServiceTicket = require('../models/ServiceTicket');
const ServiceTicketLog = require('../models/ServiceTicketLog');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');

/**
 * 查询工单列表
 * GET /api/service-tickets
 */
exports.getTicketList = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, customerId, status, priority, assignedTo, ticketType } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (customerId) where.customer_id = customerId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assigned_to = assignedTo;
    if (ticketType) where.ticket_type = ticketType;

    const { count, rows } = await ServiceTicket.findAndCountAll({
      where,
      order: [['priority', 'DESC'], ['reported_at', 'DESC']],
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
    console.error('查询工单列表失败:', error);
    return errorResponse(res, '查询工单列表失败', 500);
  }
};

/**
 * 创建工单
 * POST /api/service-tickets
 */
exports.createTicket = async (req, res) => {
  try {
    const {
      customerId,
      customerContactId,
      contractId,
      productId,
      ticketType,
      ticketTitle,
      priority,
      problemDescription,
      expectedResolveDate
    } = req.body;

    // 生成工单编号
    const ticket_no = 'TICKET-' + Date.now();

    const ticket = await ServiceTicket.create({
      ticket_no,
      customer_id: customerId,
      customer_contact_id: customerContactId,
      contract_id: contractId,
      product_id: productId,
      ticket_type: ticketType,
      ticket_title: ticketTitle,
      priority,
      problem_description: problemDescription,
      expected_resolve_date: expectedResolveDate,
      status: 'pending',
      reported_at: new Date(),
      reported_by: req.user.user_id,
      created_by: req.user.user_id
    });

    return successResponse(res, {
      ticketId: ticket.ticket_id,
      ticketNo: ticket.ticket_no,
      customerId: ticket.customer_id,
      status: ticket.status,
      createdAt: ticket.created_at
    }, '工单创建成功');
  } catch (error) {
    console.error('创建工单失败:', error);
    return errorResponse(res, '创建工单失败', 500);
  }
};

/**
 * 查询工单详情
 * GET /api/service-tickets/:id
 */
exports.getTicketDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await ServiceTicket.findByPk(id, {
      include: [
        { model: ServiceTicketLog, as: 'logs', order: [['created_at', 'DESC']] }
      ]
    });

    if (!ticket) {
      return errorResponse(res, '工单不存在', 404);
    }

    return successResponse(res, ticket, '查询成功');
  } catch (error) {
    console.error('查询工单详情失败:', error);
    return errorResponse(res, '查询工单详情失败', 500);
  }
};

/**
 * 修改工单
 * PUT /api/service-tickets/:id
 */
exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await ServiceTicket.findByPk(id);

    if (!ticket) {
      return errorResponse(res, '工单不存在', 404);
    }

    await ticket.update({
      ...req.body,
      updated_by: req.user.user_id
    });

    return successResponse(res, ticket, '工单更新成功');
  } catch (error) {
    console.error('更新工单失败:', error);
    return errorResponse(res, '更新工单失败', 500);
  }
};

/**
 * 分配工单
 * PUT /api/service-tickets/:id/assign
 */
exports.assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo, assignNote } = req.body;

    const ticket = await ServiceTicket.findByPk(id);
    if (!ticket) {
      return errorResponse(res, '工单不存在', 404);
    }

    const oldAssignedTo = ticket.assigned_to;

    await ticket.update({
      assigned_to: assignedTo,
      status: ticket.status === 'pending' ? 'in_progress' : ticket.status,
      updated_by: req.user.user_id
    });

    // 创建操作日志
    await ServiceTicketLog.create({
      ticket_id: id,
      log_type: 'assign',
      old_assigned_to: oldAssignedTo,
      new_assigned_to: assignedTo,
      log_content: assignNote || '工单已分配',
      created_by: req.user.user_id
    });

    return successResponse(res, ticket, '工单分配成功');
  } catch (error) {
    console.error('分配工单失败:', error);
    return errorResponse(res, '分配工单失败', 500);
  }
};

/**
 * 解决工单
 * PUT /api/service-tickets/:id/resolve
 */
exports.resolveTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { solution, serviceFee, partsCost, replacedParts } = req.body;

    const ticket = await ServiceTicket.findByPk(id);
    if (!ticket) {
      return errorResponse(res, '工单不存在', 404);
    }

    const totalCost = (serviceFee || 0) + (partsCost || 0);

    await ticket.update({
      status: 'resolved',
      solution,
      service_fee: serviceFee,
      parts_cost: partsCost,
      total_cost: totalCost,
      replaced_parts: replacedParts,
      resolved_at: new Date(),
      updated_by: req.user.user_id
    });

    // 创建操作日志
    await ServiceTicketLog.create({
      ticket_id: id,
      log_type: 'status_change',
      old_status: 'in_progress',
      new_status: 'resolved',
      log_content: `工单已解决：${solution}`,
      created_by: req.user.user_id
    });

    return successResponse(res, {
      ticketId: ticket.ticket_id,
      status: ticket.status,
      resolvedAt: ticket.resolved_at
    }, '工单解决成功');
  } catch (error) {
    console.error('解决工单失败:', error);
    return errorResponse(res, '解决工单失败', 500);
  }
};

/**
 * 关闭工单
 * PUT /api/service-tickets/:id/close
 */
exports.closeTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { closeNote } = req.body;

    const ticket = await ServiceTicket.findByPk(id);
    if (!ticket) {
      return errorResponse(res, '工单不存在', 404);
    }

    if (ticket.status !== 'resolved') {
      return errorResponse(res, '只有已解决的工单才能关闭', 400);
    }

    await ticket.update({
      status: 'closed',
      closed_at: new Date(),
      updated_by: req.user.user_id
    });

    // 创建操作日志
    await ServiceTicketLog.create({
      ticket_id: id,
      log_type: 'status_change',
      old_status: 'resolved',
      new_status: 'closed',
      log_content: closeNote || '工单已关闭',
      created_by: req.user.user_id
    });

    return successResponse(res, {
      ticketId: ticket.ticket_id,
      status: ticket.status,
      closedAt: ticket.closed_at
    }, '工单关闭成功');
  } catch (error) {
    console.error('关闭工单失败:', error);
    return errorResponse(res, '关闭工单失败', 500);
  }
};

/**
 * 添加操作日志
 * POST /api/service-tickets/:id/logs
 */
exports.addTicketLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { logType, logContent, attachmentUrls } = req.body;

    const ticket = await ServiceTicket.findByPk(id);
    if (!ticket) {
      return errorResponse(res, '工单不存在', 404);
    }

    const log = await ServiceTicketLog.create({
      ticket_id: id,
      log_type: logType || 'comment',
      log_content: logContent,
      attachment_urls: attachmentUrls,
      created_by: req.user.user_id
    });

    return successResponse(res, log, '日志添加成功');
  } catch (error) {
    console.error('添加操作日志失败:', error);
    return errorResponse(res, '添加操作日志失败', 500);
  }
};

/**
 * 客户评价
 * PUT /api/service-tickets/:id/rate
 */
exports.rateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerRating, customerFeedback } = req.body;

    const ticket = await ServiceTicket.findByPk(id);
    if (!ticket) {
      return errorResponse(res, '工单不存在', 404);
    }

    if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
      return errorResponse(res, '只有已解决或已关闭的工单才能评价', 400);
    }

    await ticket.update({
      customer_rating: customerRating,
      customer_feedback: customerFeedback,
      rated_at: new Date(),
      updated_by: req.user.user_id
    });

    // 创建操作日志
    await ServiceTicketLog.create({
      ticket_id: id,
      log_type: 'rating',
      log_content: `客户评价：${customerRating}分 - ${customerFeedback || ''}`,
      created_by: req.user.user_id
    });

    return successResponse(res, ticket, '评价成功');
  } catch (error) {
    console.error('客户评价失败:', error);
    return errorResponse(res, '客户评价失败', 500);
  }
};
