/**
 * 发票管理 Controller
 */
const Invoice = require('../models/Invoice');
const Contract = require('../models/Contract');
const { success, error } = require('../utils/response');
const { Op } = require('sequelize');

/**
 * 查询发票列表
 * GET /api/invoices
 */
exports.getInvoiceList = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, contractId, customerId, status, invoiceType, startDate, endDate } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (contractId) where.contract_id = contractId;
    if (customerId) where.customer_id = customerId;
    if (status) where.status = status;
    if (invoiceType) where.invoice_type = invoiceType;
    if (startDate && endDate) {
      where.invoice_date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const { count, rows } = await Invoice.findAndCountAll({
      where,
      order: [['invoice_date', 'DESC'], ['created_at', 'DESC']],
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
    console.error('查询发票列表失败:', err);
    return error(res, '查询发票列表失败', 500);
  }
};

/**
 * 创建发票记录
 * POST /api/invoices
 */
exports.createInvoice = async (req, res) => {
  try {
    // 支持驼峰和下划线两种命名方式
    const contractId = req.body.contractId || req.body.contract_id;
    const paymentId = req.body.paymentId || req.body.payment_id;
    const invoiceType = req.body.invoiceType || req.body.invoice_type;
    const invoiceAmount = req.body.invoiceAmount || req.body.invoice_amount;
    const invoiceDate = req.body.invoiceDate || req.body.invoice_date;
    const invoiceTitle = req.body.invoiceTitle || req.body.invoice_title;
    const taxNumber = req.body.taxNumber || req.body.tax_number;
    const companyAddress = req.body.companyAddress || req.body.company_address;
    const companyPhone = req.body.companyPhone || req.body.company_phone;
    const bankName = req.body.bankName || req.body.bank_name;
    const bankAccount = req.body.bankAccount || req.body.bank_account;
    const invoiceNote = req.body.invoiceNote || req.body.invoice_note;

    // 获取合同信息
    const contract = await Contract.findByPk(contractId);
    if (!contract) {
      return error(res, '合同不存在', 404);
    }

    // 发票号码在开具时填写
    const invoice_no = 'INV-' + Date.now();

    const invoice = await Invoice.create({
      invoice_no,
      contract_id: contractId,
      customer_id: contract.customer_id,
      payment_id: paymentId,
      invoice_type: invoiceType,
      invoice_amount: invoiceAmount,
      invoice_date: invoiceDate,
      invoice_title: invoiceTitle,
      tax_number: taxNumber,
      company_address: companyAddress,
      company_phone: companyPhone,
      bank_name: bankName,
      bank_account: bankAccount,
      invoice_note: invoiceNote,
      status: 'draft',
      owner_id: req.user.id,
      created_by: req.user.id
    });

    return success(res, {
      invoiceId: invoice.invoice_id,
      invoiceNo: invoice.invoice_no,
      contractId: invoice.contract_id,
      customerId: invoice.customer_id,
      invoiceType: invoice.invoice_type,
      invoiceAmount: invoice.invoice_amount,
      status: invoice.status,
      createdAt: invoice.created_at
    }, '发票记录创建成功');
  } catch (err) {
    console.error('创建发票记录失败:', err);
    console.error('错误详情:', err.message);
    return error(res, '创建发票记录失败', 500);
  }
};

/**
 * 查询发票详情
 * GET /api/invoices/:id
 */
exports.getInvoiceDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findByPk(id);

    if (!invoice) {
      return error(res, '发票记录不存在', 404);
    }

    return success(res, invoice, '查询成功');
  } catch (err) {
    console.error('查询发票详情失败:', err);
    return error(res, '查询发票详情失败', 500);
  }
};

/**
 * 修改发票信息
 * PUT /api/invoices/:id
 */
exports.updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findByPk(id);

    if (!invoice) {
      return error(res, '发票记录不存在', 404);
    }

    if (invoice.status !== 'draft') {
      return error(res, '只有草稿状态的发票才能修改', 400);
    }

    await invoice.update({
      ...req.body,
      updated_by: req.user.id
    });

    return success(res, invoice, '发票信息更新成功');
  } catch (err) {
    console.error('更新发票信息失败:', err);
    return error(res, '更新发票信息失败', 500);
  }
};

/**
 * 确认开票
 * PUT /api/invoices/:id/confirm
 */
exports.confirmInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { invoiceNo, invoiceDate } = req.body;

    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return error(res, '发票记录不存在', 404);
    }

    if (invoice.status === 'confirmed') {
      return error(res, '发票已开具', 400);
    }

    await invoice.update({
      invoice_no: invoiceNo,
      invoice_date: invoiceDate,
      status: 'confirmed',
      confirm_date: new Date(),
      confirmed_by: req.user.id,
      updated_by: req.user.id
    });

    // 更新合同的invoiced_amount
    const contract = await Contract.findByPk(invoice.contract_id);
    if (contract) {
      const newInvoicedAmount = parseFloat(contract.invoiced_amount || 0) + parseFloat(invoice.invoice_amount || 0);
      await contract.update({
        invoiced_amount: newInvoicedAmount,
        updated_by: req.user.id
      });
    }

    return success(res, {
      invoiceId: invoice.invoice_id,
      invoiceNo: invoice.invoice_no,
      status: invoice.status,
      confirmDate: invoice.confirm_date
    }, '发票开具成功');
  } catch (err) {
    console.error('确认开票失败:', err);
    return error(res, '确认开票失败', 500);
  }
};

/**
 * 作废发票
 * PUT /api/invoices/:id/void
 */
exports.voidInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { voidReason } = req.body;

    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return error(res, '发票记录不存在', 404);
    }

    if (invoice.status === 'voided') {
      return error(res, '发票已作废', 400);
    }

    // 记录之前的状态，用于判断是否需要回退invoiced_amount
    const wasConfirmed = invoice.status === 'confirmed';

    await invoice.update({
      status: 'voided',
      void_reason: voidReason,
      updated_by: req.user.id
    });

    // 如果之前已开具，回退合同的invoiced_amount
    if (wasConfirmed) {
      const contract = await Contract.findByPk(invoice.contract_id);
      if (contract) {
        const newInvoicedAmount = parseFloat(contract.invoiced_amount || 0) - parseFloat(invoice.invoice_amount || 0);
        await contract.update({
          invoiced_amount: Math.max(0, newInvoicedAmount), // 确保不会小于0
          updated_by: req.user.id
        });
      }
    }

    return success(res, invoice, '发票作废成功');
  } catch (err) {
    console.error('作废发票失败:', err);
    return error(res, '作废发票失败', 500);
  }
};

/**
 * 发票统计分析
 * GET /api/invoices/statistics
 */
exports.getInvoiceStatistics = async (req, res) => {
  try {
    const { customerId, startDate, endDate } = req.query;

    const where = {};
    if (customerId) where.customer_id = customerId;
    if (startDate && endDate) {
      where.invoice_date = {
        [Op.between]: [startDate, endDate]
      };
    }

    // 总开票金额
    const totalInvoicedResult = await Invoice.sum('invoice_amount', {
      where: { ...where, status: 'confirmed' }
    });
    const totalInvoicedAmount = totalInvoicedResult || 0;

    // TODO: 实现更详细的发票统计

    return success(res, {
      totalInvoicedAmount,
      totalInvoiceCount: 0, // TODO: 统计发票数量
      byType: {},
      byMonth: []
    }, '查询成功');
  } catch (err) {
    console.error('发票统计分析失败:', err);
    return error(res, '发票统计分析失败', 500);
  }
};
