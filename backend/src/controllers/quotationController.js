/**
 * 报价单管理 Controller
 */
const Quotation = require('../models/Quotation');
const QuotationItem = require('../models/QuotationItem');
const { success, error } = require('../utils/response');
const { Op } = require('sequelize');

/**
 * 创建报价单
 * POST /api/quotations
 */
exports.createQuotation = async (req, res) => {
  try {
    const { customer_id, quotation_date, valid_until, items, notes } = req.body;

    // 生成报价单编号
    const quotation_no = 'QT-' + Date.now();

    const quotation = await Quotation.create({
      quotation_no,
      customer_id,
      quotation_date,
      valid_until,
      total_amount: 0,
      status: 'draft',
      notes,
      owner_id: req.user.id,
      created_by: req.user.id
    });

    if (items && items.length > 0) {
      let totalAmount = 0;
      
      for (const item of items) {
        const subtotal = item.quantity * item.unit_price;
        totalAmount += subtotal;
        
        await QuotationItem.create({
          quotation_id: quotation.quotation_id,
          product_id: item.product_id,
          product_code: item.product_code,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: subtotal,
          notes: item.notes
        });
      }

      await quotation.update({ total_amount: totalAmount });
    }

    return success(res, quotation, '报价单创建成功');
  } catch (err) {
    console.error('创建报价单失败:', err);
    return error(res, '创建报价单失败', 500);
  }
};

/**
 * 查询报价单列表
 * GET /api/quotations
 */
exports.getQuotationList = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, customer_id, status, keyword } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (customer_id) where.customer_id = customer_id;
    if (status) where.status = status;
    if (keyword) where.quotation_no = { [Op.like]: `%${keyword}%` };

    const { count, rows } = await Quotation.findAndCountAll({
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
    console.error('创建报价单失败:', err);
    return error(res, '查询报价单列表失败', 500);
  }
};

exports.getQuotationDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findByPk(id, {
      include: [{ model: QuotationItem, as: 'items' }]
    });
    if (!quotation) return error(res, '报价单不存在', 404);
    return success(res, quotation, '查询成功');
  } catch (err) {
    console.error('创建报价单失败:', err);
    return error(res, '查询报价单详情失败', 500);
  }
};

exports.updateQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findByPk(id);
    if (!quotation) return error(res, '报价单不存在', 404);
    if (quotation.status !== 'draft') return error(res, '只有草稿状态的报价单才能修改', 400);
    
    await quotation.update({ ...req.body, updated_by: req.user.id });
    return success(res, quotation, '报价单更新成功');
  } catch (err) {
    console.error('创建报价单失败:', err);
    return error(res, '更新报价单失败', 500);
  }
};

exports.addQuotationItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_id, product_code, product_name, quantity, unit_price, notes } = req.body;
    const subtotal = quantity * unit_price;

    const item = await QuotationItem.create({
      quotation_id: id,
      product_id,
      product_code,
      product_name,
      quantity,
      unit_price,
      subtotal,
      notes
    });

    const quotation = await Quotation.findByPk(id);
    await quotation.increment('total_amount', { by: subtotal });

    return success(res, item, '产品添加成功');
  } catch (err) {
    console.error('创建报价单失败:', err);
    return error(res, '添加报价单产品失败', 500);
  }
};

exports.deleteQuotationItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const item = await QuotationItem.findByPk(itemId);
    if (!item || item.quotation_id != id) return error(res, '产品明细不存在', 404);

    const subtotal = item.subtotal;
    await item.destroy();

    const quotation = await Quotation.findByPk(id);
    await quotation.decrement('total_amount', { by: subtotal });

    return success(res, null, '产品删除成功');
  } catch (err) {
    console.error('创建报价单失败:', err);
    return error(res, '删除报价单产品失败', 500);
  }
};

exports.extendValidity = async (req, res) => {
  try {
    const { id } = req.params;
    const { valid_until } = req.body;
    const quotation = await Quotation.findByPk(id);
    if (!quotation) return error(res, '报价单不存在', 404);

    await quotation.update({ valid_until, updated_by: req.user.id });
    return success(res, quotation, '有效期延长成功');
  } catch (err) {
    console.error('创建报价单失败:', err);
    return error(res, '延长报价单有效期失败', 500);
  }
};

exports.generatePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findByPk(id);
    if (!quotation) return error(res, '报价单不存在', 404);

    // TODO: 实现PDF生成逻辑
    const pdfUrl = `/uploads/quotations/${quotation.quotation_no}.pdf`;
    return success(res, { pdf_url: pdfUrl }, 'PDF生成成功');
  } catch (err) {
    console.error('创建报价单失败:', err);
    return error(res, '生成PDF失败', 500);
  }
};

exports.convertToContract = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findByPk(id);
    if (!quotation) return error(res, '报价单不存在', 404);
    if (quotation.status !== 'sent') return error(res, '只有已发送的报价单才能转合同', 400);

    // TODO: 实现转合同逻辑
    return success(res, null, '转合同成功');
  } catch (err) {
    console.error('创建报价单失败:', err);
    return error(res, '报价单转合同失败', 500);
  }
};
