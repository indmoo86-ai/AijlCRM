/**
 * 报价单管理 Controller
 */
const Quotation = require('../models/Quotation');
const QuotationItem = require('../models/QuotationItem');
const Product = require('../models/Product');
const { success, error } = require('../utils/response');
const { Op } = require('sequelize');

/**
 * 创建报价单
 * POST /api/quotations
 */
exports.createQuotation = async (req, res) => {
  try {
    // 支持驼峰和下划线两种命名方式
    const customer_id = req.body.customer_id || req.body.customerId;
    const quotation_date = req.body.quotation_date || req.body.quotationDate || new Date();
    const valid_until = req.body.valid_until || req.body.validUntil || req.body.validDays
      ? new Date(Date.now() + (req.body.validDays || 30) * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const { items, notes } = req.body;

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
        // 支持驼峰和下划线命名
        const product_id = item.product_id || item.productId;
        const unit_price = item.unit_price || item.unitPrice;
        const discount_rate = item.discount_rate || item.discountRate || 1;
        const quantity = item.quantity;

        // 如果没有提供product_code和product_name，从数据库获取
        let product_code = item.product_code || item.productCode;
        let product_name = item.product_name || item.productName;

        if (!product_code || !product_name) {
          const product = await Product.findByPk(product_id);
          if (product) {
            product_code = product.product_code;
            product_name = product.product_name;
          }
        }

        const subtotal = quantity * unit_price * discount_rate;
        totalAmount += subtotal;

        await QuotationItem.create({
          quotation_id: quotation.quotation_id,
          product_id: product_id,
          product_code: product_code,
          product_name: product_name,
          quantity: quantity,
          unit_price: unit_price,
          subtotal: subtotal,
          notes: item.notes
        });
      }

      await quotation.update({ total_amount: totalAmount });
    }

    // 返回标准化的响应格式，包含quotationId字段
    const responseData = {
      quotationId: quotation.quotation_id,
      ...quotation.toJSON()
    };

    return success(res, responseData, '报价单创建成功', 201);
  } catch (err) {
    console.error('创建报价单失败:', err);
    console.error('错误详情:', err.message);
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

/**
 * 提交报价单审批
 * PUT /api/quotations/:id/submit
 */
exports.submitQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findByPk(id);

    if (!quotation) {
      return error(res, '报价单不存在', 404);
    }

    if (quotation.status !== 'draft') {
      return error(res, '只有草稿状态的报价单才能提交审批', 400);
    }

    await quotation.update({
      status: 'pending',
      submitted_at: new Date(),
      submitted_by: req.user.id,
      updated_by: req.user.id
    });

    return success(res, {
      quotationId: quotation.quotation_id,
      status: quotation.status,
      submittedAt: quotation.submitted_at
    }, '报价单已提交审批');
  } catch (err) {
    console.error('提交报价单审批失败:', err);
    return error(res, '提交审批失败', 500);
  }
};

/**
 * 审批报价单
 * PUT /api/quotations/:id/approve
 */
exports.approveQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, comment } = req.body;

    const quotation = await Quotation.findByPk(id);

    if (!quotation) {
      return error(res, '报价单不存在', 404);
    }

    if (quotation.status !== 'pending') {
      return error(res, '只有待审批状态的报价单才能审批', 400);
    }

    const newStatus = approved ? 'approved' : 'rejected';

    await quotation.update({
      status: newStatus,
      approved_at: new Date(),
      approved_by: req.user.id,
      approval_comment: comment,
      updated_by: req.user.id
    });

    return success(res, {
      quotationId: quotation.quotation_id,
      status: quotation.status,
      approved: approved,
      approvedAt: quotation.approved_at,
      comment: comment
    }, approved ? '报价单审批通过' : '报价单已拒绝');
  } catch (err) {
    console.error('审批报价单失败:', err);
    return error(res, '审批失败', 500);
  }
};

/**
 * 发送报价单给客户
 * PUT /api/quotations/:id/send
 */
exports.sendQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findByPk(id);

    if (!quotation) {
      return error(res, '报价单不存在', 404);
    }

    if (quotation.status !== 'approved' && quotation.status !== 'draft') {
      return error(res, '只有已审批或草稿状态的报价单才能发送', 400);
    }

    await quotation.update({
      status: 'sent',
      sent_at: new Date(),
      sent_by: req.user.id,
      updated_by: req.user.id
    });

    return success(res, {
      quotationId: quotation.quotation_id,
      status: quotation.status,
      sentAt: quotation.sent_at
    }, '报价单已发送');
  } catch (err) {
    console.error('发送报价单失败:', err);
    return error(res, '发送失败', 500);
  }
};
