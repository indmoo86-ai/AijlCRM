/**
 * 报价单管理 Controller
 */
const Quotation = require('../models/Quotation');
const QuotationItem = require('../models/QuotationItem');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const User = require('../models/User');
const FollowUp = require('../models/FollowUp');
const { success, error } = require('../utils/response');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * 创建报价单
 * POST /api/quotations
 */
exports.createQuotation = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    // 支持驼峰和下划线两种命名方式
    const customer_id = req.body.customer_id || req.body.customerId;
    const lead_id = req.body.lead_id || req.body.leadId;
    const hotel_name = req.body.hotel_name || req.body.hotelName;
    const province = req.body.province;
    const city = req.body.city;
    const district = req.body.district;
    const room_count = req.body.room_count || req.body.roomCount;
    const quotation_date = req.body.quotation_date || req.body.quotationDate || new Date().toISOString().slice(0, 10);
    const valid_until = req.body.valid_until || req.body.validUntil ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { items, notes, discount_amount } = req.body;

    // 生成报价单编号
    const quotation_no = 'QT-' + Date.now();

    // 计算汇总数据
    let total_quantity = 0;
    let total_cost = 0;
    let total_sale_price = 0;
    let total_amount = 0;

    // 创建报价单主表
    const quotation = await Quotation.create({
      quotation_no,
      customer_id,
      lead_id,
      hotel_name,
      province,
      city,
      district,
      room_count,
      quotation_date,
      valid_until,
      total_quantity: 0,
      total_cost: 0,
      total_sale_price: 0,
      total_amount: 0,
      discount_amount: discount_amount || 0,
      status: 'draft',
      notes,
      owner_id: req.user.id,
      created_by: req.user.id
    }, { transaction: t });

    // 处理明细项
    if (items && items.length > 0) {
      for (const item of items) {
        // 支持驼峰和下划线命名
        const product_id = item.product_id || item.productId;
        const quantity = item.quantity || 1;
        let cost_price = item.cost_price || item.costPrice || 0;
        let sale_price = item.sale_price || item.salePrice || 0;
        let unit_price = item.unit_price || item.unitPrice || sale_price;

        // 获取产品信息
        let product_code = item.product_code || item.productCode;
        let product_name = item.product_name || item.productName;
        let specification = item.specification;

        if (!product_code || !product_name || !cost_price || !sale_price) {
          const product = await Product.findByPk(product_id);
          if (product) {
            product_code = product_code || product.product_code;
            product_name = product_name || product.product_name;
            specification = specification || product.specification;
            cost_price = cost_price || parseFloat(product.cost_price) || 0;
            sale_price = sale_price || parseFloat(product.sale_price) || 0;
            if (!unit_price) unit_price = sale_price;
          }
        }

        // 计算小计
        const cost_subtotal = quantity * cost_price;
        const sale_subtotal = quantity * sale_price;
        const subtotal = quantity * unit_price;

        // 累加汇总
        total_quantity += quantity;
        total_cost += cost_subtotal;
        total_sale_price += sale_subtotal;
        total_amount += subtotal;

        await QuotationItem.create({
          quotation_id: quotation.quotation_id,
          product_id,
          product_code,
          product_name,
          specification,
          quantity,
          cost_price,
          sale_price,
          unit_price,
          cost_subtotal,
          sale_subtotal,
          subtotal,
          notes: item.notes
        }, { transaction: t });
      }

      // 更新报价单汇总数据
      await quotation.update({
        total_quantity,
        total_cost,
        total_sale_price,
        total_amount,
        discount_amount: total_sale_price - total_amount
      }, { transaction: t });
    }

    await t.commit();

    // 如果关联了线索，自动添加跟踪记录并重置下次跟踪时间
    if (lead_id) {
      try {
        // 添加跟踪记录
        await FollowUp.create({
          bizType: 1,  // 线索
          bizId: lead_id,
          followType: 'quotation',
          content: `创建了报价单 ${quotation_no}，报价金额：¥${total_amount.toFixed(2)}`,
          operatorId: req.user.id
        });

        // 重置线索的下次跟踪时间为3天后
        const nextFollowDate = new Date();
        nextFollowDate.setDate(nextFollowDate.getDate() + 3);
        await Lead.update({
          nextFollowDate: nextFollowDate.toISOString().slice(0, 10),
          lastFollowTime: new Date()
        }, {
          where: { id: lead_id }
        });
      } catch (followUpErr) {
        console.error('创建跟踪记录失败:', followUpErr);
        // 不影响主流程
      }
    }

    // 重新查询完整数据
    const result = await Quotation.findByPk(quotation.quotation_id, {
      include: [
        { model: QuotationItem, as: 'items' },
        { model: Customer, as: 'customer' }
      ]
    });

    return success(res, {
      quotationId: quotation.quotation_id,
      ...result.toJSON()
    }, '报价单创建成功', 201);
  } catch (err) {
    await t.rollback();
    console.error('创建报价单失败:', err);
    console.error('错误详情:', err.message);
    return error(res, '创建报价单失败: ' + err.message, 500);
  }
};

/**
 * 查询报价单列表
 * GET /api/quotations
 */
exports.getQuotationList = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, customer_id, lead_id, status, keyword } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (customer_id) where.customer_id = customer_id;
    if (lead_id) where.lead_id = lead_id;
    if (status) where.status = status;
    if (keyword) {
      where[Op.or] = [
        { quotation_no: { [Op.like]: `%${keyword}%` } },
        { hotel_name: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await Quotation.findAndCountAll({
      where,
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'customerName'] },
        { model: User, as: 'owner', attributes: ['id', 'username', 'name'] },
        { model: Lead, as: 'lead', attributes: ['id', 'leadNo', 'customerName', 'hotelName'] }
      ],
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
    console.error('查询报价单列表失败:', err);
    return error(res, '查询报价单列表失败', 500);
  }
};

/**
 * 获取报价单详情
 * GET /api/quotations/:id
 */
exports.getQuotationDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findByPk(id, {
      include: [
        { model: QuotationItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: Customer, as: 'customer' },
        { model: Lead, as: 'lead' },
        { model: User, as: 'owner', attributes: ['id', 'username', 'name'] }
      ]
    });
    if (!quotation) return error(res, '报价单不存在', 404);
    return success(res, quotation, '查询成功');
  } catch (err) {
    console.error('查询报价单详情失败:', err);
    return error(res, '查询报价单详情失败', 500);
  }
};

/**
 * 更新报价单（草稿状态）
 * PUT /api/quotations/:id
 */
exports.updateQuotation = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const quotation = await Quotation.findByPk(id);
    if (!quotation) {
      await t.rollback();
      return error(res, '报价单不存在', 404);
    }
    if (quotation.status !== 'draft') {
      await t.rollback();
      return error(res, '只有草稿状态的报价单才能修改', 400);
    }

    const { items, ...updateData } = req.body;

    // 更新主表信息
    await quotation.update({
      ...updateData,
      updated_by: req.user.id
    }, { transaction: t });

    // 如果提供了明细项，重新计算
    if (items && items.length > 0) {
      // 删除原有明细
      await QuotationItem.destroy({
        where: { quotation_id: id },
        transaction: t
      });

      let total_quantity = 0;
      let total_cost = 0;
      let total_sale_price = 0;
      let total_amount = 0;

      for (const item of items) {
        const product_id = item.product_id || item.productId;
        const quantity = item.quantity || 1;
        let cost_price = item.cost_price || item.costPrice || 0;
        let sale_price = item.sale_price || item.salePrice || 0;
        let unit_price = item.unit_price || item.unitPrice || sale_price;

        let product_code = item.product_code || item.productCode;
        let product_name = item.product_name || item.productName;
        let specification = item.specification;

        if (!product_code || !product_name) {
          const product = await Product.findByPk(product_id);
          if (product) {
            product_code = product_code || product.product_code;
            product_name = product_name || product.product_name;
            specification = specification || product.specification;
            cost_price = cost_price || parseFloat(product.cost_price) || 0;
            sale_price = sale_price || parseFloat(product.sale_price) || 0;
            if (!unit_price) unit_price = sale_price;
          }
        }

        const cost_subtotal = quantity * cost_price;
        const sale_subtotal = quantity * sale_price;
        const subtotal = quantity * unit_price;

        total_quantity += quantity;
        total_cost += cost_subtotal;
        total_sale_price += sale_subtotal;
        total_amount += subtotal;

        await QuotationItem.create({
          quotation_id: id,
          product_id,
          product_code,
          product_name,
          specification,
          quantity,
          cost_price,
          sale_price,
          unit_price,
          cost_subtotal,
          sale_subtotal,
          subtotal,
          notes: item.notes
        }, { transaction: t });
      }

      await quotation.update({
        total_quantity,
        total_cost,
        total_sale_price,
        total_amount,
        discount_amount: total_sale_price - total_amount
      }, { transaction: t });
    }

    await t.commit();

    const result = await Quotation.findByPk(id, {
      include: [{ model: QuotationItem, as: 'items' }]
    });

    return success(res, result, '报价单更新成功');
  } catch (err) {
    await t.rollback();
    console.error('更新报价单失败:', err);
    return error(res, '更新报价单失败', 500);
  }
};

/**
 * 修改报价单（非草稿状态，生成新版本）
 * POST /api/quotations/:id/revise
 */
exports.reviseQuotation = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const oldQuotation = await Quotation.findByPk(id, {
      include: [{ model: QuotationItem, as: 'items' }]
    });

    if (!oldQuotation) {
      await t.rollback();
      return error(res, '报价单不存在', 404);
    }

    if (oldQuotation.status === 'voided') {
      await t.rollback();
      return error(res, '已作废的报价单不能修改', 400);
    }

    // 将旧报价单作废
    await oldQuotation.update({
      status: 'voided',
      updated_by: req.user.id
    }, { transaction: t });

    // 生成新版本号
    const newVersion = (oldQuotation.version || 1) + 1;
    const quotation_no = `QT-${Date.now()}`;

    const { items } = req.body;

    // 创建新报价单
    const newQuotation = await Quotation.create({
      quotation_no,
      customer_id: oldQuotation.customer_id,
      lead_id: oldQuotation.lead_id,
      hotel_name: req.body.hotel_name || oldQuotation.hotel_name,
      province: req.body.province || oldQuotation.province,
      city: req.body.city || oldQuotation.city,
      district: req.body.district || oldQuotation.district,
      room_count: req.body.room_count || oldQuotation.room_count,
      quotation_date: req.body.quotation_date || new Date().toISOString().slice(0, 10),
      valid_until: req.body.valid_until || oldQuotation.valid_until,
      total_quantity: 0,
      total_cost: 0,
      total_sale_price: 0,
      total_amount: 0,
      discount_amount: 0,
      status: 'draft',
      notes: req.body.notes || oldQuotation.notes,
      version: newVersion,
      previous_version_id: oldQuotation.quotation_id,
      owner_id: req.user.id,
      created_by: req.user.id
    }, { transaction: t });

    // 处理明细项（使用新提供的或复制旧的）
    const itemsToCreate = items || oldQuotation.items.map(item => ({
      product_id: item.product_id,
      product_code: item.product_code,
      product_name: item.product_name,
      specification: item.specification,
      quantity: item.quantity,
      cost_price: item.cost_price,
      sale_price: item.sale_price,
      unit_price: item.unit_price,
      notes: item.notes
    }));

    let total_quantity = 0;
    let total_cost = 0;
    let total_sale_price = 0;
    let total_amount = 0;

    for (const item of itemsToCreate) {
      const quantity = item.quantity || 1;
      const cost_price = parseFloat(item.cost_price) || 0;
      const sale_price = parseFloat(item.sale_price) || 0;
      const unit_price = parseFloat(item.unit_price) || sale_price;

      const cost_subtotal = quantity * cost_price;
      const sale_subtotal = quantity * sale_price;
      const subtotal = quantity * unit_price;

      total_quantity += quantity;
      total_cost += cost_subtotal;
      total_sale_price += sale_subtotal;
      total_amount += subtotal;

      await QuotationItem.create({
        quotation_id: newQuotation.quotation_id,
        product_id: item.product_id,
        product_code: item.product_code,
        product_name: item.product_name,
        specification: item.specification,
        quantity,
        cost_price,
        sale_price,
        unit_price,
        cost_subtotal,
        sale_subtotal,
        subtotal,
        notes: item.notes
      }, { transaction: t });
    }

    await newQuotation.update({
      total_quantity,
      total_cost,
      total_sale_price,
      total_amount,
      discount_amount: total_sale_price - total_amount
    }, { transaction: t });

    await t.commit();

    // 如果关联了线索，自动添加跟踪记录
    if (newQuotation.lead_id) {
      try {
        await FollowUp.create({
          bizType: 1,  // 线索
          bizId: newQuotation.lead_id,
          followType: 'quotation',
          content: `修改了报价单，生成新版本 ${quotation_no} (V${newVersion})，报价金额：¥${total_amount.toFixed(2)}`,
          operatorId: req.user.id
        });
      } catch (followUpErr) {
        console.error('创建跟踪记录失败:', followUpErr);
      }
    }

    const result = await Quotation.findByPk(newQuotation.quotation_id, {
      include: [{ model: QuotationItem, as: 'items' }]
    });

    return success(res, {
      quotationId: newQuotation.quotation_id,
      previousVersionId: oldQuotation.quotation_id,
      ...result.toJSON()
    }, '报价单修改成功，已生成新版本', 201);
  } catch (err) {
    await t.rollback();
    console.error('修改报价单失败:', err);
    return error(res, '修改报价单失败', 500);
  }
};

/**
 * 作废报价单
 * PUT /api/quotations/:id/void
 */
exports.voidQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findByPk(id);

    if (!quotation) {
      return error(res, '报价单不存在', 404);
    }

    if (quotation.status === 'voided') {
      return error(res, '报价单已经是作废状态', 400);
    }

    await quotation.update({
      status: 'voided',
      updated_by: req.user.id
    });

    return success(res, {
      quotationId: quotation.quotation_id,
      status: 'voided'
    }, '报价单已作废');
  } catch (err) {
    console.error('作废报价单失败:', err);
    return error(res, '作废报价单失败', 500);
  }
};

/**
 * 根据线索ID获取最新报价单
 * GET /api/quotations/lead/:leadId/latest
 */
exports.getLatestQuotationByLead = async (req, res) => {
  try {
    const { leadId } = req.params;

    const quotation = await Quotation.findOne({
      where: {
        lead_id: leadId,
        status: { [Op.ne]: 'voided' }
      },
      include: [
        { model: QuotationItem, as: 'items' },
        { model: Customer, as: 'customer' },
        { model: User, as: 'owner', attributes: ['id', 'username', 'name'] }
      ],
      order: [['created_at', 'DESC']]
    });

    if (!quotation) {
      return success(res, null, '暂无报价单');
    }

    return success(res, quotation, '查询成功');
  } catch (err) {
    console.error('获取最新报价单失败:', err);
    return error(res, '获取最新报价单失败', 500);
  }
};

/**
 * 根据线索ID获取所有报价单历史
 * GET /api/quotations/lead/:leadId
 */
exports.getQuotationsByLead = async (req, res) => {
  try {
    const { leadId } = req.params;

    const quotations = await Quotation.findAll({
      where: { lead_id: leadId },
      include: [
        { model: Customer, as: 'customer' },
        { model: User, as: 'owner', attributes: ['id', 'username', 'name'] }
      ],
      order: [['created_at', 'DESC']]
    });

    return success(res, quotations, '查询成功');
  } catch (err) {
    console.error('获取报价单历史失败:', err);
    return error(res, '获取报价单历史失败', 500);
  }
};

/**
 * 添加报价单明细
 */
exports.addQuotationItem = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findByPk(id);

    if (!quotation) return error(res, '报价单不存在', 404);
    if (quotation.status !== 'draft') return error(res, '只有草稿状态可以添加产品', 400);

    const product_id = req.body.product_id || req.body.productId;
    const quantity = req.body.quantity || 1;
    let cost_price = req.body.cost_price || req.body.costPrice || 0;
    let sale_price = req.body.sale_price || req.body.salePrice || 0;
    let unit_price = req.body.unit_price || req.body.unitPrice || sale_price;
    let product_code = req.body.product_code || req.body.productCode;
    let product_name = req.body.product_name || req.body.productName;
    let specification = req.body.specification;

    // 获取产品信息
    if (!product_code || !product_name) {
      const product = await Product.findByPk(product_id);
      if (product) {
        product_code = product_code || product.product_code;
        product_name = product_name || product.product_name;
        specification = specification || product.specification;
        cost_price = cost_price || parseFloat(product.cost_price) || 0;
        sale_price = sale_price || parseFloat(product.sale_price) || 0;
        if (!unit_price) unit_price = sale_price;
      }
    }

    const cost_subtotal = quantity * cost_price;
    const sale_subtotal = quantity * sale_price;
    const subtotal = quantity * unit_price;

    const item = await QuotationItem.create({
      quotation_id: id,
      product_id,
      product_code,
      product_name,
      specification,
      quantity,
      cost_price,
      sale_price,
      unit_price,
      cost_subtotal,
      sale_subtotal,
      subtotal,
      notes: req.body.notes
    });

    // 更新报价单汇总
    await quotation.increment({
      total_quantity: quantity,
      total_cost: cost_subtotal,
      total_sale_price: sale_subtotal,
      total_amount: subtotal
    });

    // 更新优惠金额
    const newDiscount = parseFloat(quotation.total_sale_price) + sale_subtotal - parseFloat(quotation.total_amount) - subtotal;
    await quotation.update({ discount_amount: newDiscount > 0 ? newDiscount : 0 });

    return success(res, item, '产品添加成功');
  } catch (err) {
    console.error('添加报价单产品失败:', err);
    return error(res, '添加报价单产品失败', 500);
  }
};

/**
 * 删除报价单明细
 */
exports.deleteQuotationItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const item = await QuotationItem.findByPk(itemId);
    if (!item || item.quotation_id != id) return error(res, '产品明细不存在', 404);

    const quotation = await Quotation.findByPk(id);
    if (quotation.status !== 'draft') return error(res, '只有草稿状态可以删除产品', 400);

    await item.destroy();

    // 更新报价单汇总
    await quotation.decrement({
      total_quantity: item.quantity,
      total_cost: parseFloat(item.cost_subtotal),
      total_sale_price: parseFloat(item.sale_subtotal),
      total_amount: parseFloat(item.subtotal)
    });

    return success(res, null, '产品删除成功');
  } catch (err) {
    console.error('删除报价单产品失败:', err);
    return error(res, '删除报价单产品失败', 500);
  }
};

/**
 * 延长有效期
 */
exports.extendValidity = async (req, res) => {
  try {
    const { id } = req.params;
    const { valid_until } = req.body;
    const quotation = await Quotation.findByPk(id);
    if (!quotation) return error(res, '报价单不存在', 404);

    await quotation.update({ valid_until, updated_by: req.user.id });
    return success(res, quotation, '有效期延长成功');
  } catch (err) {
    console.error('延长有效期失败:', err);
    return error(res, '延长报价单有效期失败', 500);
  }
};

/**
 * 生成PDF
 * GET /api/quotations/:id/pdf
 */
exports.generatePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findByPk(id, {
      include: [
        { model: QuotationItem, as: 'items' },
        { model: Customer, as: 'customer' },
        { model: Lead, as: 'lead' },
        { model: User, as: 'owner', attributes: ['id', 'username', 'name'] }
      ]
    });

    if (!quotation) return error(res, '报价单不存在', 404);

    // 返回报价单数据，让前端生成PDF
    return success(res, {
      quotation: quotation.toJSON(),
      pdfData: {
        title: '产品报价单',
        quotationNo: quotation.quotation_no,
        date: quotation.quotation_date,
        validUntil: quotation.valid_until,
        customerInfo: {
          customerName: quotation.customer?.customerName,
          hotelName: quotation.hotel_name,
          region: [quotation.province, quotation.city, quotation.district].filter(Boolean).join('/'),
          roomCount: quotation.room_count
        },
        items: quotation.items.map(item => ({
          productCode: item.product_code,
          productName: item.product_name,
          specification: item.specification,
          quantity: item.quantity,
          salePrice: item.sale_price,
          unitPrice: item.unit_price,
          saleSubtotal: item.sale_subtotal,
          subtotal: item.subtotal
        })),
        summary: {
          totalQuantity: quotation.total_quantity,
          totalSalePrice: quotation.total_sale_price,
          totalAmount: quotation.total_amount,
          discountAmount: quotation.discount_amount
        },
        notes: quotation.notes,
        owner: quotation.owner?.name || quotation.owner?.username
      }
    }, 'PDF数据获取成功');
  } catch (err) {
    console.error('生成PDF失败:', err);
    return error(res, '生成PDF失败', 500);
  }
};

/**
 * 发送报价单
 */
exports.sendQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findByPk(id);

    if (!quotation) return error(res, '报价单不存在', 404);
    if (quotation.status === 'voided') return error(res, '已作废的报价单不能发送', 400);

    await quotation.update({
      status: 'sent',
      updated_by: req.user.id
    });

    return success(res, {
      quotationId: quotation.quotation_id,
      status: 'sent'
    }, '报价单已发送');
  } catch (err) {
    console.error('发送报价单失败:', err);
    return error(res, '发送失败', 500);
  }
};

/**
 * 转合同
 */
exports.convertToContract = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findByPk(id);
    if (!quotation) return error(res, '报价单不存在', 404);
    if (quotation.status !== 'sent' && quotation.status !== 'accepted') {
      return error(res, '只有已发送或已接受的报价单才能转合同', 400);
    }

    // TODO: 实现转合同逻辑
    return success(res, null, '转合同成功');
  } catch (err) {
    console.error('转合同失败:', err);
    return error(res, '报价单转合同失败', 500);
  }
};

/**
 * 提交报价单审批
 */
exports.submitQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findByPk(id);

    if (!quotation) return error(res, '报价单不存在', 404);
    if (quotation.status !== 'draft') return error(res, '只有草稿状态的报价单才能提交', 400);

    await quotation.update({
      status: 'pending',
      updated_by: req.user.id
    });

    return success(res, {
      quotationId: quotation.quotation_id,
      status: 'pending'
    }, '报价单已提交');
  } catch (err) {
    console.error('提交报价单失败:', err);
    return error(res, '提交失败', 500);
  }
};

/**
 * 审批报价单
 */
exports.approveQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, comment } = req.body;

    const quotation = await Quotation.findByPk(id);

    if (!quotation) return error(res, '报价单不存在', 404);
    if (quotation.status !== 'pending') return error(res, '只有待审批状态的报价单才能审批', 400);

    const newStatus = approved ? 'approved' : 'rejected';

    await quotation.update({
      status: newStatus,
      updated_by: req.user.id
    });

    return success(res, {
      quotationId: quotation.quotation_id,
      status: newStatus,
      approved
    }, approved ? '报价单审批通过' : '报价单已拒绝');
  } catch (err) {
    console.error('审批报价单失败:', err);
    return error(res, '审批失败', 500);
  }
};

/**
 * 删除报价单
 */
exports.deleteQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findByPk(id);

    if (!quotation) return error(res, '报价单不存在', 404);
    if (quotation.status !== 'draft' && quotation.status !== 'voided') {
      return error(res, '只有草稿或已作废状态的报价单才能删除', 400);
    }

    // 删除明细
    await QuotationItem.destroy({ where: { quotation_id: id } });
    // 删除主表
    await quotation.destroy();

    return success(res, null, '删除成功');
  } catch (err) {
    console.error('删除报价单失败:', err);
    return error(res, '删除失败', 500);
  }
};

/**
 * 导出报价单Excel
 * GET /api/quotations/:id/export-excel
 */
exports.exportQuotationExcel = async (req, res) => {
  try {
    const ExcelJS = require('exceljs');
    const { id } = req.params;

    // 获取报价单详情
    const quotation = await Quotation.findByPk(id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: Lead, as: 'lead' },
        { model: User, as: 'owner', attributes: ['id', 'name', 'phone'] }
      ]
    });

    if (!quotation) {
      return error(res, '报价单不存在', 404);
    }

    // 获取报价单明细
    const items = await QuotationItem.findAll({
      where: { quotation_id: id },
      include: [{ model: Product, as: 'product' }],
      order: [['item_id', 'ASC']]
    });

    // 创建工作簿
    const workbook = new ExcelJS.Workbook();
    workbook.creator = '艾居来CRM';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('报价单');

    // 设置列宽
    worksheet.columns = [
      { width: 6 },   // A - 序号
      { width: 20 },  // B - 产品名称
      { width: 15 },  // C - 规格型号
      { width: 10 },  // D - 品牌
      { width: 8 },   // E - 数量
      { width: 12 },  // F - 单价
      { width: 12 },  // G - 小计
      { width: 12 },  // H - 参考图片
      { width: 40 },  // I - 功能描述
    ];

    // 定义样式
    const titleStyle = {
      font: { bold: true, size: 18 },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };
    const headerStyle = {
      font: { bold: true, size: 11 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };
    const cellStyle = {
      alignment: { vertical: 'middle', wrapText: true },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };

    // 行1: 标题
    worksheet.mergeCells('A1:I1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = '智慧酒店配置清单';
    titleCell.style = titleStyle;
    worksheet.getRow(1).height = 30;

    // 行2: 项目信息标题
    worksheet.mergeCells('A2:I2');
    worksheet.getCell('A2').value = '项目信息';
    worksheet.getCell('A2').style = { font: { bold: true, size: 12 } };

    // 行3: 项目名称 & 报价单编号
    worksheet.getCell('A3').value = '项目名称：';
    worksheet.mergeCells('B3:F3');
    worksheet.getCell('B3').value = quotation.hotel_name || quotation.lead?.hotelName || '-';
    worksheet.getCell('G3').value = '报价单编号：';
    worksheet.getCell('H3').value = quotation.quotation_no;
    worksheet.mergeCells('H3:I3');

    // 行4: 项目类型 & 报价日期
    worksheet.getCell('A4').value = '房间数量：';
    worksheet.getCell('B4').value = quotation.room_count || quotation.lead?.roomCount || '-';
    worksheet.getCell('G4').value = '报价日期：';
    worksheet.getCell('H4').value = quotation.quotation_date || '-';
    worksheet.mergeCells('H4:I4');

    // 行5: 联系人 & 有效期
    worksheet.getCell('A5').value = '报价联系人：';
    worksheet.getCell('B5').value = quotation.owner?.name || '-';
    worksheet.getCell('C5').value = '电话：';
    worksheet.getCell('D5').value = quotation.owner?.phone || '-';
    worksheet.getCell('G5').value = '报价有效期：';
    worksheet.getCell('H5').value = quotation.valid_until || '-';
    worksheet.mergeCells('H5:I5');

    // 行6: 地区信息 & 合计
    worksheet.getCell('A6').value = '项目地址：';
    worksheet.mergeCells('B6:F6');
    const address = [quotation.province, quotation.city, quotation.district].filter(Boolean).join(' ') ||
      [quotation.lead?.province, quotation.lead?.city, quotation.lead?.district].filter(Boolean).join(' ') || '-';
    worksheet.getCell('B6').value = address;
    worksheet.getCell('G6').value = '合计：';
    worksheet.getCell('H6').value = `¥${quotation.total_amount || 0}`;
    worksheet.getCell('H6').style = { font: { bold: true, color: { argb: 'FFFF0000' } } };
    worksheet.mergeCells('H6:I6');

    // 行7: 方案说明
    worksheet.mergeCells('A7:I7');
    worksheet.getCell('A7').value = '智慧酒店方案配置清单';
    worksheet.getCell('A7').style = { font: { bold: true, size: 11 } };

    // 行8: 表头
    const headerRow = worksheet.getRow(8);
    headerRow.values = ['序号', '产品名称', '规格型号', '品牌', '数量', '单价', '小计', '参考图片', '功能描述'];
    headerRow.eachCell((cell) => {
      cell.style = headerStyle;
    });
    headerRow.height = 25;

    // 产品明细行
    let rowIndex = 9;
    items.forEach((item, index) => {
      const row = worksheet.getRow(rowIndex);
      row.values = [
        index + 1,
        item.product_name || item.product?.product_name || '-',
        item.specification || item.product?.specification || '-',
        item.product?.brand || '艾居来',
        item.quantity || 0,
        item.unit_price || 0,
        item.subtotal || (item.quantity * item.unit_price) || 0,
        '',  // 图片暂不处理
        item.product?.description || ''
      ];
      row.eachCell((cell) => {
        cell.style = cellStyle;
      });
      // 金额居右
      row.getCell(6).alignment = { horizontal: 'right', vertical: 'middle' };
      row.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };
      row.height = 25;
      rowIndex++;
    });

    // 合计行
    const totalRow = worksheet.getRow(rowIndex);
    worksheet.mergeCells(`A${rowIndex}:F${rowIndex}`);
    totalRow.getCell(1).value = '合计：';
    totalRow.getCell(1).style = { font: { bold: true }, alignment: { horizontal: 'right' } };
    totalRow.getCell(7).value = quotation.total_amount || 0;
    totalRow.getCell(7).style = { font: { bold: true, color: { argb: 'FFFF0000' } }, ...cellStyle };
    rowIndex++;

    // 空行
    rowIndex++;

    // 功能描述部分
    worksheet.mergeCells(`A${rowIndex}:I${rowIndex}`);
    worksheet.getCell(`A${rowIndex}`).value = '智慧酒店系统-功能描述';
    worksheet.getCell(`A${rowIndex}`).style = { font: { bold: true, size: 12 } };
    rowIndex++;

    // 功能描述列表
    const features = [
      ['安装即用', '安装即用，免调试。所有配置在工厂完成，设备按照房间号，现场按照图纸接线，上电即用，无需调试配置。'],
      ['一键修复', '因现场施工不规范，回路乱接，窗帘开关反向，可以通过APP或者后台一键修复。'],
      ['开门亮廊灯', '客人推开门后，廊灯自动亮起，方便客人插卡。当客人插卡后，廊灯只受开关或语音或手机控制。'],
      ['欢迎模式', '插卡进入欢迎模式，门显的入住亮起，房间受控插座通电，床头灯亮起，空调打开，窗帘打开。'],
      ['睡眠模式', '按下睡眠模式按键进入睡眠模式，灯光关闭，门牌上显示请勿打扰，窗帘关闭。'],
      ['故障自检测', '房间设备异常检测，当房间设备出现故障，第一时间将故障上报给酒店工程人员。'],
      ['能耗监控', '同电表配合，实现住房客人能耗统计形成报表，实现节约能耗。']
    ];

    features.forEach((feature, idx) => {
      const row = worksheet.getRow(rowIndex);
      row.getCell(1).value = idx + 1;
      row.getCell(2).value = feature[0];
      worksheet.mergeCells(`C${rowIndex}:I${rowIndex}`);
      row.getCell(3).value = feature[1];
      row.getCell(3).style = { alignment: { wrapText: true } };
      rowIndex++;
    });

    // 设置响应头
    const fileName = encodeURIComponent(`报价单_${quotation.quotation_no}_${quotation.hotel_name || '未命名'}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${fileName}`);

    // 输出到响应
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error('导出报价单Excel失败:', err);
    return error(res, '导出失败: ' + err.message, 500);
  }
};
