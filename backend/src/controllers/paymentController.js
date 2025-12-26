/**
 * 收款管理 Controller
 */
const Payment = require('../models/Payment');
const Contract = require('../models/Contract');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');

/**
 * 查询收款记录列表
 * GET /api/payments
 */
exports.getPaymentList = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, contractId, customerId, status, paymentMethod, startDate, endDate } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (contractId) where.contract_id = contractId;
    if (customerId) where.customer_id = customerId;
    if (status) where.status = status;
    if (paymentMethod) where.payment_method = paymentMethod;
    if (startDate && endDate) {
      where.payment_date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const { count, rows } = await Payment.findAndCountAll({
      where,
      order: [['payment_date', 'DESC'], ['created_at', 'DESC']],
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
    console.error('查询收款记录列表失败:', error);
    return errorResponse(res, '查询收款记录列表失败', 500);
  }
};

/**
 * 创建收款记录
 * POST /api/payments
 */
exports.createPayment = async (req, res) => {
  try {
    const {
      contractId,
      paymentStage,
      paymentAmount,
      paymentDate,
      paymentMethod,
      bankAccount,
      transactionNo,
      payerName,
      expectedAmount,
      paymentNote
    } = req.body;

    // 获取合同信息
    const contract = await Contract.findByPk(contractId);
    if (!contract) {
      return errorResponse(res, '合同不存在', 404);
    }

    // 生成收款编号
    const payment_no = 'PAY-' + Date.now();

    const payment = await Payment.create({
      payment_no,
      contract_id: contractId,
      customer_id: contract.customer_id,
      payment_stage: paymentStage,
      payment_amount: paymentAmount,
      payment_date: paymentDate,
      payment_method: paymentMethod,
      bank_account: bankAccount,
      transaction_no: transactionNo,
      payer_name: payerName,
      expected_amount: expectedAmount,
      payment_note: paymentNote,
      status: 'draft',
      owner_id: req.user.user_id,
      created_by: req.user.user_id
    });

    return successResponse(res, {
      paymentId: payment.payment_id,
      paymentNo: payment.payment_no,
      contractId: payment.contract_id,
      customerId: payment.customer_id,
      paymentStage: payment.payment_stage,
      paymentAmount: payment.payment_amount,
      status: payment.status,
      createdAt: payment.created_at
    }, '收款记录创建成功');
  } catch (error) {
    console.error('创建收款记录失败:', error);
    return errorResponse(res, '创建收款记录失败', 500);
  }
};

/**
 * 查询收款详情
 * GET /api/payments/:id
 */
exports.getPaymentDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id);

    if (!payment) {
      return errorResponse(res, '收款记录不存在', 404);
    }

    return successResponse(res, payment, '查询成功');
  } catch (error) {
    console.error('查询收款详情失败:', error);
    return errorResponse(res, '查询收款详情失败', 500);
  }
};

/**
 * 确认收款
 * PUT /api/payments/:id/confirm
 */
exports.confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmNote } = req.body;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return errorResponse(res, '收款记录不存在', 404);
    }

    if (payment.status === 'confirmed') {
      return errorResponse(res, '收款记录已确认', 400);
    }

    await payment.update({
      status: 'confirmed',
      confirm_date: new Date(),
      confirmed_by: req.user.user_id,
      payment_note: confirmNote ? `${payment.payment_note || ''}\n确认备注：${confirmNote}` : payment.payment_note
    });

    // 更新合同的received_amount
    const contract = await Contract.findByPk(payment.contract_id);
    if (contract) {
      const newReceivedAmount = parseFloat(contract.received_amount || 0) + parseFloat(payment.paid_amount || 0);
      await contract.update({
        received_amount: newReceivedAmount,
        updated_by: req.user.user_id
      });
    }

    return successResponse(res, {
      paymentId: payment.payment_id,
      status: payment.status,
      confirmDate: payment.confirm_date
    }, '收款确认成功');
  } catch (error) {
    console.error('确认收款失败:', error);
    return errorResponse(res, '确认收款失败', 500);
  }
};

/**
 * 作废收款
 * PUT /api/payments/:id/void
 */
exports.voidPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { voidReason } = req.body;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return errorResponse(res, '收款记录不存在', 404);
    }

    if (payment.status === 'cancelled') {
      return errorResponse(res, '收款记录已作废', 400);
    }

    // 记录之前的状态，用于判断是否需要回退received_amount
    const wasConfirmed = payment.status === 'confirmed';

    await payment.update({
      status: 'cancelled',
      payment_note: voidReason ? `${payment.payment_note || ''}\n作废原因：${voidReason}` : payment.payment_note
    });

    // 如果之前已确认，回退合同的received_amount
    if (wasConfirmed) {
      const contract = await Contract.findByPk(payment.contract_id);
      if (contract) {
        const newReceivedAmount = parseFloat(contract.received_amount || 0) - parseFloat(payment.paid_amount || 0);
        await contract.update({
          received_amount: Math.max(0, newReceivedAmount), // 确保不会小于0
          updated_by: req.user.user_id
        });
      }
    }

    return successResponse(res, payment, '收款作废成功');
  } catch (error) {
    console.error('作废收款失败:', error);
    return errorResponse(res, '作废收款失败', 500);
  }
};

/**
 * 应收账款统计
 * GET /api/payments/statistics
 */
exports.getPaymentStatistics = async (req, res) => {
  try {
    const { customerId, startDate, endDate } = req.query;

    const where = {};
    if (customerId) where.customer_id = customerId;
    if (startDate && endDate) {
      where.payment_date = {
        [Op.between]: [startDate, endDate]
      };
    }

    // 总收款金额
    const totalReceivedResult = await Payment.sum('payment_amount', {
      where: { ...where, status: 'confirmed' }
    });
    const totalReceivedAmount = totalReceivedResult || 0;

    // TODO: 实现更详细的应收账款统计

    return successResponse(res, {
      totalContractAmount: 0, // TODO: 从合同表统计
      totalReceivedAmount,
      totalReceivableAmount: 0, // TODO: 计算应收未收
      receivedRate: 0,
      overdueReceivableAmount: 0
    }, '查询成功');
  } catch (error) {
    console.error('应收账款统计失败:', error);
    return errorResponse(res, '应收账款统计失败', 500);
  }
};
