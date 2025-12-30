/**
 * 收款管理 Controller
 */
const Payment = require('../models/Payment');
const Contract = require('../models/Contract');
const Customer = require('../models/Customer');
const User = require('../models/User');
const { success, error } = require('../utils/response');
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
      include: [
        { model: Contract, as: 'contract', attributes: ['contract_id', 'contract_no', 'contract_title'] },
        { model: Customer, as: 'customer', attributes: ['id', 'customerName'] },
        { model: User, as: 'owner', attributes: ['id', 'username', 'name'] }
      ],
      order: [['payment_date', 'DESC'], ['created_at', 'DESC']],
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
    console.error('查询收款记录列表失败:', err);
    return error(res, '查询收款记录列表失败', 500);
  }
};

/**
 * 创建收款记录
 * POST /api/payments
 */
exports.createPayment = async (req, res) => {
  try {
    // 支持驼峰和下划线两种命名方式
    const contractId = req.body.contractId || req.body.contract_id;
    const paymentStage = req.body.paymentStage || req.body.payment_stage;
    const paymentAmount = req.body.paymentAmount || req.body.payment_amount || req.body.paidAmount || req.body.paid_amount;
    const paymentDate = req.body.paymentDate || req.body.payment_date;
    const paymentMethod = req.body.paymentMethod || req.body.payment_method;
    const bankAccount = req.body.bankAccount || req.body.bank_account;
    const transactionNo = req.body.transactionNo || req.body.transaction_no;
    const payerName = req.body.payerName || req.body.payer_name;
    const expectedAmount = req.body.expectedAmount || req.body.expected_amount;
    const paymentNote = req.body.paymentNote || req.body.payment_note;

    // 获取合同信息
    const contract = await Contract.findByPk(contractId);
    if (!contract) {
      return error(res, '合同不存在', 404);
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
      owner_id: req.user.id,
      created_by: req.user.id
    });

    const responseData = {
      paymentId: payment.payment_id,
      ...payment.toJSON()
    };
    return success(res, responseData, '收款记录创建成功', 201);
  } catch (err) {
    console.error('创建收款记录失败:', err);
    console.error('错误详情:', err.message);
    return error(res, '创建收款记录失败', 500);
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
      return error(res, '收款记录不存在', 404);
    }

    return success(res, payment, '查询成功');
  } catch (err) {
    console.error('查询收款详情失败:', err);
    return error(res, '查询收款详情失败', 500);
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
      return error(res, '收款记录不存在', 404);
    }

    if (payment.status === 'confirmed') {
      return error(res, '收款记录已确认', 400);
    }

    await payment.update({
      status: 'confirmed',
      confirm_date: new Date(),
      confirmed_by: req.user.id,
      payment_note: confirmNote ? `${payment.payment_note || ''}\n确认备注：${confirmNote}` : payment.payment_note
    });

    // 更新合同的received_amount
    const contract = await Contract.findByPk(payment.contract_id);
    if (contract) {
      const newReceivedAmount = parseFloat(contract.received_amount || 0) + parseFloat(payment.payment_amount || 0);
      await contract.update({
        received_amount: newReceivedAmount,
        updated_by: req.user.id
      });
    }

    return success(res, {
      paymentId: payment.payment_id,
      status: payment.status,
      confirmDate: payment.confirm_date
    }, '收款确认成功');
  } catch (err) {
    console.error('确认收款失败:', err);
    return error(res, '确认收款失败', 500);
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
      return error(res, '收款记录不存在', 404);
    }

    if (payment.status === 'cancelled') {
      return error(res, '收款记录已作废', 400);
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
        const newReceivedAmount = parseFloat(contract.received_amount || 0) - parseFloat(payment.payment_amount || 0);
        await contract.update({
          received_amount: Math.max(0, newReceivedAmount), // 确保不会小于0
          updated_by: req.user.id
        });
      }
    }

    return success(res, payment, '收款作废成功');
  } catch (err) {
    console.error('作废收款失败:', err);
    return error(res, '作废收款失败', 500);
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

    return success(res, {
      totalContractAmount: 0, // TODO: 从合同表统计
      totalReceivedAmount,
      totalReceivableAmount: 0, // TODO: 计算应收未收
      receivedRate: 0,
      overdueReceivableAmount: 0
    }, '查询成功');
  } catch (err) {
    console.error('应收账款统计失败:', err);
    return error(res, '应收账款统计失败', 500);
  }
};
