/**
 * 合同管理 Controller
 */
const Contract = require('../models/Contract');
const ContractItem = require('../models/ContractItem');
const ContractAmendment = require('../models/ContractAmendment');
const Shipment = require('../models/Shipment');
const Payment = require('../models/Payment');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Quotation = require('../models/Quotation');
const QuotationItem = require('../models/QuotationItem');
const User = require('../models/User');
const Lead = require('../models/Lead');
const FollowUp = require('../models/FollowUp');
const { success, error } = require('../utils/response');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * 数字金额转大写
 */
function numberToChineseAmount(num) {
  if (num === 0) return '零元整';

  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const units = ['', '拾', '佰', '仟'];
  const bigUnits = ['', '万', '亿'];

  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);

  let result = '';

  // 处理整数部分
  if (intPart > 0) {
    const intStr = String(intPart);
    const len = intStr.length;
    let zeroFlag = false;

    for (let i = 0; i < len; i++) {
      const digit = parseInt(intStr[i]);
      const pos = len - i - 1;
      const unitPos = pos % 4;
      const bigUnitPos = Math.floor(pos / 4);

      if (digit === 0) {
        zeroFlag = true;
      } else {
        if (zeroFlag) {
          result += '零';
          zeroFlag = false;
        }
        result += digits[digit] + units[unitPos];
      }

      if (unitPos === 0 && bigUnitPos > 0) {
        result += bigUnits[bigUnitPos];
      }
    }
    result += '元';
  }

  // 处理小数部分
  if (decPart > 0) {
    const jiao = Math.floor(decPart / 10);
    const fen = decPart % 10;
    if (jiao > 0) result += digits[jiao] + '角';
    if (fen > 0) result += digits[fen] + '分';
  } else {
    result += '整';
  }

  return result;
}

/**
 * 获取合同列表
 * GET /api/contracts
 */
exports.getContractList = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, customerId, status, ownerId, startDate, endDate } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (customerId) where.customer_id = customerId;
    if (status) where.status = status;
    if (ownerId) where.owner_id = ownerId;
    if (startDate && endDate) {
      where.signed_date = {
        [Op.between]: [startDate, endDate]
      };
    } else if (startDate) {
      where.signed_date = { [Op.gte]: startDate };
    } else if (endDate) {
      where.signed_date = { [Op.lte]: endDate };
    }

    const { count, rows } = await Contract.findAndCountAll({
      where,
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'customerName'] },
        { model: User, as: 'owner', attributes: ['id', 'username', 'name'] }
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
    console.error('查询合同列表失败:', err);
    return error(res, '查询合同列表失败', 500);
  }
};

/**
 * 创建合同
 * POST /api/contracts
 */
exports.createContract = async (req, res) => {
  try {
    // 支持多种命名方式
    const contractTitle = req.body.contractTitle || req.body.contract_title;
    const customerId = req.body.customerId || req.body.customer_id;
    const customerContactId = req.body.customerContactId || req.body.customer_contact_id;
    const sourceQuotationId = req.body.sourceQuotationId || req.body.source_quotation_id;
    const contractAmount = req.body.contractAmount || req.body.contract_amount || req.body.totalAmount;
    const signedDate = req.body.signedDate || req.body.signed_date;
    const deliveryDeadline = req.body.deliveryDeadline || req.body.delivery_deadline;
    const paymentTerms = req.body.paymentTerms || req.body.payment_terms;
    const deliveryTerms = req.body.deliveryTerms || req.body.delivery_terms;
    const warrantyTerms = req.body.warrantyTerms || req.body.warranty_terms;
    const items = req.body.items;

    // 生成合同编号
    const contract_no = 'CONT-' + Date.now();

    const contract = await Contract.create({
      contract_no,
      contract_title: contractTitle,
      customer_id: customerId,
      customer_contact_id: customerContactId,
      source_quotation_id: sourceQuotationId,
      contract_amount: contractAmount,
      signed_date: signedDate,
      delivery_deadline: deliveryDeadline,
      payment_terms: paymentTerms,
      delivery_terms: deliveryTerms,
      warranty_terms: warrantyTerms,
      status: 'draft',
      owner_id: req.user.id,
      created_by: req.user.id
    });

    // 创建合同明细
    if (items && items.length > 0) {
      for (const item of items) {
        const productId = item.productId || item.product_id;
        let productCode = item.productCode || item.product_code;
        let productName = item.productName || item.product_name;
        let productUnit = item.productUnit || item.product_unit;

        // 如果没有提供product_code、product_name或product_unit，从数据库获取
        if (!productCode || !productName || !productUnit) {
          const product = await Product.findByPk(productId);
          if (product) {
            productCode = productCode || product.product_code;
            productName = productName || product.product_name;
            productUnit = productUnit || product.unit;
          }
        }

        await ContractItem.create({
          contract_id: contract.contract_id,
          product_id: productId,
          product_code: productCode,
          product_name: productName,
          product_unit: productUnit,
          quantity: item.quantity,
          unit_price: item.unitPrice || item.unit_price,
          subtotal: item.quantity * (item.unitPrice || item.unit_price),
          item_note: item.itemNote || item.item_note
        });
      }
    }

    const responseData = {
      contractId: contract.contract_id,
      ...contract.toJSON()
    };
    return success(res, responseData, '合同创建成功', 201);
  } catch (err) {
    console.error('创建合同失败:', err);
    console.error('错误详情:', err.message);
    return error(res, '创建合同失败', 500);
  }
};

/**
 * 查询合同详情
 * GET /api/contracts/:id
 */
exports.getContractDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const Lead = require('../models/Lead');
    const Invoice = require('../models/Invoice');

    // 获取合同基本信息及关联
    const contract = await Contract.findByPk(id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: User, as: 'owner', attributes: ['id', 'name', 'phone'] },
        { model: ContractItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: ContractAmendment, as: 'amendments' },
        { model: Quotation, as: 'sourceQuotation', attributes: ['quotation_id', 'quotation_no'] },
        { model: Lead, as: 'lead', attributes: ['id', 'leadNo', 'customerName', 'hotelName'] }
      ]
    });

    if (!contract) {
      return error(res, '合同不存在', 404);
    }

    // 获取发货记录
    const shipments = await Shipment.findAll({
      where: { contract_id: id },
      include: [{ model: User, as: 'owner', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']]
    });

    // 获取收款记录
    const payments = await Payment.findAll({
      where: { contract_id: id },
      include: [{ model: User, as: 'owner', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']]
    });

    // 获取发票记录
    const invoices = await Invoice.findAll({
      where: { contract_id: id },
      include: [{ model: User, as: 'owner', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']]
    });

    // 计算进度统计
    const contractAmount = parseFloat(contract.contract_amount) || 0;
    const shippedAmount = shipments.reduce((sum, s) => sum + (parseFloat(s.shipment_amount) || 0), 0);
    const receivedAmount = payments.filter(p => p.status === 'confirmed').reduce((sum, p) => sum + (parseFloat(p.payment_amount) || 0), 0);
    const invoicedAmount = invoices.filter(i => i.status !== 'voided').reduce((sum, i) => sum + (parseFloat(i.invoice_amount) || 0), 0);

    // 解析付款条款
    let paymentTerms = null;
    try {
      paymentTerms = contract.payment_terms ? (typeof contract.payment_terms === 'string' ? JSON.parse(contract.payment_terms) : contract.payment_terms) : null;
    } catch (e) {
      console.warn('解析付款条款失败:', e);
    }

    // 计算各阶段付款状态
    let paymentStagesStatus = [];
    if (paymentTerms?.stages) {
      paymentStagesStatus = paymentTerms.stages.map((stage, index) => {
        // 查找对应阶段的收款记录
        const stagePayments = payments.filter(p => p.payment_stage === (index + 1) || p.notes?.includes(stage.name));
        const stagePaid = stagePayments.filter(p => p.status === 'confirmed').reduce((sum, p) => sum + (parseFloat(p.payment_amount) || 0), 0);
        return {
          ...stage,
          paid_amount: stagePaid,
          status: stagePaid >= stage.amount ? 'completed' : stagePaid > 0 ? 'partial' : 'pending'
        };
      });
    }

    const responseData = {
      // 基础信息
      contract: contract.toJSON(),
      // 付款条款（解析后）
      paymentTerms: paymentTerms,
      paymentStagesStatus: paymentStagesStatus,
      // 关联单据
      shipments: shipments,
      payments: payments,
      invoices: invoices,
      // 进度统计
      progress: {
        contractAmount: contractAmount,
        shippedAmount: shippedAmount,
        shippedPercent: contractAmount > 0 ? Math.round(shippedAmount / contractAmount * 100) : 0,
        receivedAmount: receivedAmount,
        receivedPercent: contractAmount > 0 ? Math.round(receivedAmount / contractAmount * 100) : 0,
        invoicedAmount: invoicedAmount,
        invoicedPercent: contractAmount > 0 ? Math.round(invoicedAmount / contractAmount * 100) : 0,
        pendingAmount: contractAmount - receivedAmount
      }
    };

    return success(res, responseData, '查询成功');
  } catch (err) {
    console.error('查询合同详情失败:', err);
    console.error('错误详情:', err.message);
    return error(res, '查询合同详情失败', 500);
  }
};

/**
 * 修改合同信息
 * PUT /api/contracts/:id
 */
exports.updateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findByPk(id);

    if (!contract) {
      return error(res, '合同不存在', 404);
    }

    if (contract.status !== 'draft') {
      return error(res, '只有草稿状态的合同才能修改', 400);
    }

    await contract.update({
      ...req.body,
      updated_by: req.user.id
    });

    return success(res, contract, '合同更新成功');
  } catch (err) {
    console.error('更新合同失败:', err);
    return error(res, '更新合同失败', 500);
  }
};

/**
 * 合同签订
 * PUT /api/contracts/:id/sign
 */
exports.signContract = async (req, res) => {
  try {
    const { id } = req.params;
    const { signedDate, contractFileUrl } = req.body;

    const contract = await Contract.findByPk(id);
    if (!contract) {
      return error(res, '合同不存在', 404);
    }

    if (contract.status === 'signed') {
      return error(res, '合同已签订', 400);
    }

    await contract.update({
      status: 'signed',
      signed_date: signedDate,
      contract_file_url: contractFileUrl,
      contract_file_uploaded_at: new Date(),
      signed_by: req.user.id,
      updated_by: req.user.id
    });

    return success(res, {
      contractId: contract.contract_id,
      status: contract.status,
      signedDate: contract.signed_date,
      signedAt: contract.updated_at
    }, '合同签订成功');
  } catch (err) {
    console.error('合同签订失败:', err);
    return error(res, '合同签订失败', 500);
  }
};

/**
 * 创建补充协议
 * POST /api/contracts/:id/amendments
 */
exports.createAmendment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      amendmentTitle, amendmentType, amendmentContent,
      amountChange, newContractAmount, signedDate
    } = req.body;

    const contract = await Contract.findByPk(id);
    if (!contract) {
      return error(res, '合同不存在', 404);
    }

    // 生成补充协议编号
    const amendment_no = 'AMEND-' + Date.now();

    const amendment = await ContractAmendment.create({
      amendment_no,
      contract_id: id,
      amendment_type: amendmentType,
      amendment_title: amendmentTitle,
      amendment_content: amendmentContent,
      amount_change: amountChange,
      new_contract_amount: newContractAmount,
      signed_date: signedDate,
      status: 'draft',
      created_by: req.user.id
    });

    const responseData = {
      amendmentId: amendment.amendment_id,
      ...amendment.toJSON()
    };
    return success(res, responseData, '补充协议创建成功', 201);
  } catch (err) {
    console.error('创建补充协议失败:', err);
    return error(res, '创建补充协议失败', 500);
  }
};

/**
 * 查询补充协议列表
 * GET /api/contracts/:id/amendments
 */
exports.getAmendmentList = async (req, res) => {
  try {
    const { id } = req.params;

    const amendments = await ContractAmendment.findAll({
      where: { contract_id: id },
      order: [['created_at', 'DESC']]
    });

    return success(res, amendments, '查询成功');
  } catch (err) {
    console.error('查询补充协议列表失败:', err);
    return error(res, '查询补充协议列表失败', 500);
  }
};

/**
 * 上传合同文件
 * POST /api/contracts/:id/files
 */
exports.uploadContractFile = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findByPk(id);

    if (!contract) {
      return error(res, '合同不存在', 404);
    }

    // TODO: 实现文件上传逻辑
    const fileUrl = `/uploads/contracts/${contract.contract_no}.pdf`;
    const fileVersion = (contract.contract_file_version || 0) + 1;

    await contract.update({
      contract_file_url: fileUrl,
      contract_file_uploaded_at: new Date(),
      contract_file_version: fileVersion,
      updated_by: req.user.id
    });

    return success(res, {
      fileUrl: fileUrl,
      fileVersion: fileVersion,
      uploadedAt: new Date()
    }, '文件上传成功');
  } catch (err) {
    console.error('上传合同文件失败:', err);
    return error(res, '上传合同文件失败', 500);
  }
};

/**
 * 查询合同文件列表
 * GET /api/contracts/:id/files
 */
exports.getContractFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findByPk(id);

    if (!contract) {
      return error(res, '合同不存在', 404);
    }

    // TODO: 实现文件列表查询逻辑
    const files = [];
    if (contract.contract_file_url) {
      files.push({
        fileId: 1,
        fileUrl: contract.contract_file_url,
        fileType: 'contract',
        fileVersion: contract.contract_file_version,
        uploadedAt: contract.contract_file_uploaded_at
      });
    }

    return success(res, files, '查询成功');
  } catch (err) {
    console.error('查询合同文件列表失败:', err);
    return error(res, '查询合同文件列表失败', 500);
  }
};

/**
 * 删除合同文件
 * DELETE /api/contracts/:id/files/:fileId
 */
exports.deleteContractFile = async (req, res) => {
  try {
    const { id, fileId } = req.params;

    // TODO: 实现文件删除逻辑

    return success(res, null, '文件删除成功');
  } catch (err) {
    console.error('删除合同文件失败:', err);
    return error(res, '删除合同文件失败', 500);
  }
};

/**
 * 查询合同执行进度
 * GET /api/contracts/:id/progress
 */
exports.getContractProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findByPk(id);

    if (!contract) {
      return error(res, '合同不存在', 404);
    }

    const shippedProgress = contract.contract_amount > 0
      ? (contract.shipped_amount / contract.contract_amount * 100).toFixed(1)
      : 0;
    const receivedProgress = contract.contract_amount > 0
      ? (contract.received_amount / contract.contract_amount * 100).toFixed(1)
      : 0;
    const invoicedProgress = contract.contract_amount > 0
      ? (contract.invoiced_amount / contract.contract_amount * 100).toFixed(1)
      : 0;

    // 关联查询发货单
    const shipments = await Shipment.findAll({
      where: { contract_id: id },
      attributes: ['shipment_id', 'shipment_no', 'shipment_title', 'status', 'shipment_amount',
                   'actual_ship_date', 'delivered_at', 'logistics_company', 'tracking_no'],
      order: [['created_at', 'DESC']]
    });

    // 关联查询收款记录
    const payments = await Payment.findAll({
      where: { contract_id: id },
      attributes: ['payment_id', 'payment_no', 'payment_stage', 'payment_amount', 'payment_method',
                   'status', 'payment_date', 'confirm_date'],
      order: [['payment_date', 'DESC']]
    });

    return success(res, {
      contractId: contract.contract_id,
      contractAmount: contract.contract_amount,
      shippedAmount: contract.shipped_amount,
      shippedProgress: parseFloat(shippedProgress),
      receivedAmount: contract.received_amount,
      receivedProgress: parseFloat(receivedProgress),
      invoicedAmount: contract.invoiced_amount,
      invoicedProgress: parseFloat(invoicedProgress),
      executionProgress: contract.execution_progress,
      shipments: shipments.map(s => s.toJSON()),
      payments: payments.map(p => p.toJSON())
    }, '查询成功');
  } catch (err) {
    console.error('查询合同执行进度失败:', err);
    return error(res, '查询合同执行进度失败', 500);
  }
};

/**
 * 激活合同
 * PUT /api/contracts/:id/activate
 */
exports.activateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const { activateDate, activateNote } = req.body;

    const contract = await Contract.findByPk(id);

    if (!contract) {
      return error(res, '合同不存在', 404);
    }

    if (contract.status !== 'signed') {
      return error(res, '只有已签订的合同才能激活', 400);
    }

    await contract.update({
      status: 'active',
      activate_date: activateDate || new Date(),
      activate_note: activateNote,
      activated_by: req.user.id,
      activated_at: new Date(),
      updated_by: req.user.id
    });

    return success(res, {
      contractId: contract.contract_id,
      status: contract.status,
      activateDate: contract.activate_date,
      activatedAt: contract.activated_at
    }, '合同已激活');
  } catch (err) {
    console.error('激活合同失败:', err);
    return error(res, '激活合同失败', 500);
  }
};

/**
 * 终止合同
 * PUT /api/contracts/:id/terminate
 */
exports.terminateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const { terminateReason, terminateDate } = req.body;

    const contract = await Contract.findByPk(id);

    if (!contract) {
      return error(res, '合同不存在', 404);
    }

    if (contract.status === 'terminated' || contract.status === 'completed') {
      return error(res, '合同已终止或已完成，无法再次操作', 400);
    }

    await contract.update({
      status: 'terminated',
      terminate_date: terminateDate || new Date(),
      terminate_reason: terminateReason,
      terminated_by: req.user.id,
      terminated_at: new Date(),
      updated_by: req.user.id
    });

    return success(res, {
      contractId: contract.contract_id,
      status: contract.status,
      terminateDate: contract.terminate_date,
      terminateReason: contract.terminate_reason
    }, '合同已终止');
  } catch (err) {
    console.error('终止合同失败:', err);
    return error(res, '终止合同失败', 500);
  }
};

/**
 * 获取报价单信息用于创建合同
 * GET /api/contracts/quotation-info/:quotationId
 */
exports.getQuotationInfoForContract = async (req, res) => {
  try {
    const { quotationId } = req.params;

    // 获取报价单及关联信息
    const quotation = await Quotation.findByPk(quotationId, {
      include: [
        { model: Customer, as: 'customer' },
        { model: User, as: 'owner', attributes: ['id', 'name', 'phone'] }
      ]
    });

    if (!quotation) {
      return error(res, '报价单不存在', 404);
    }

    // 获取报价单明细
    const items = await QuotationItem.findAll({
      where: { quotation_id: quotationId },
      include: [{ model: Product, as: 'product' }],
      order: [['item_id', 'ASC']]
    });

    // 组装返回数据
    const customer = quotation.customer;
    const owner = quotation.owner;

    // 构建地址
    const projectAddress = [
      quotation.province,
      quotation.city,
      quotation.district
    ].filter(Boolean).join('');

    const customerAddress = customer ? [
      customer.province,
      customer.city,
      customer.district,
      customer.address
    ].filter(Boolean).join('') : '';

    const data = {
      // 报价单信息
      quotation: {
        quotation_id: quotation.quotation_id,
        quotation_no: quotation.quotation_no,
        hotel_name: quotation.hotel_name,
        room_count: quotation.room_count,
        total_amount: quotation.total_amount,
        total_sale_price: quotation.total_sale_price,
        discount_amount: quotation.discount_amount,
        notes: quotation.notes
      },
      // 客户信息（甲方）
      customer: customer ? {
        customer_id: customer.id,
        customer_name: customer.customerName,
        address: customerAddress,
        phone: customer.phone,
        wechat: customer.wechat
      } : null,
      // 项目信息
      project: {
        hotel_name: quotation.hotel_name,
        room_count: quotation.room_count,
        address: projectAddress
      },
      // 负责人（乙方代表）
      owner: owner ? {
        id: owner.id,
        name: owner.name,
        phone: owner.phone
      } : null,
      // 产品明细
      items: items.map(item => ({
        product_id: item.product_id,
        product_code: item.product_code,
        product_name: item.product_name,
        specification: item.specification || item.product?.specification,
        brand: item.product?.brand,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        cost_price: item.cost_price,
        sale_price: item.sale_price
      })),
      // 金额信息
      amount: {
        total_amount: quotation.total_amount,
        amount_in_words: numberToChineseAmount(parseFloat(quotation.total_amount) || 0)
      },
      // 默认付款条款（3期）
      default_payment_terms: {
        stages: [
          {
            stage: 1,
            name: '预付款',
            percentage: 30,
            amount: Math.round(parseFloat(quotation.total_amount) * 0.3 * 100) / 100,
            condition: '合同签订三个工作日内'
          },
          {
            stage: 2,
            name: '发货款',
            percentage: 60,
            amount: Math.round(parseFloat(quotation.total_amount) * 0.6 * 100) / 100,
            condition: '乙方发货前一个工作日内'
          },
          {
            stage: 3,
            name: '验收款',
            percentage: 10,
            amount: Math.round(parseFloat(quotation.total_amount) * 0.1 * 100) / 100,
            condition: '项目验收合格后七个工作日内'
          }
        ],
        payment_method: '银行电汇',
        bank_account: {
          name: '温州艾居来智能科技有限公司',
          bank: '宁波银行股份有限公司温州经济技术开发区支行',
          account: '86041110000759370'
        }
      },
      // 默认质保条款
      default_warranty: {
        warranty_period: 5,
        lifetime_maintenance: true
      }
    };

    return success(res, data, '获取成功');
  } catch (err) {
    console.error('获取报价单信息失败:', err);
    console.error('错误详情:', err.message);
    return error(res, '获取报价单信息失败: ' + err.message, 500);
  }
};

/**
 * 从报价单创建合同
 * POST /api/contracts/from-quotation
 */
exports.createContractFromQuotation = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      // 报价单ID
      quotation_id,
      // 基础信息
      contract_title,
      signed_date,
      signing_location,
      // 甲方信息
      party_a_name,
      party_a_address,
      party_a_representative,
      party_a_phone,
      party_a_fax,
      // 项目信息
      hotel_name,
      room_count,
      project_address,
      // 交付信息
      delivery_method,
      delivery_address,
      delivery_deadline,
      freight_bearer,
      // 付款条款
      payment_terms,
      // 质保信息
      warranty_period,
      lifetime_maintenance,
      // 其他条款
      additional_terms,
      // 是否更新客户信息
      update_customer
    } = req.body;

    // 获取报价单
    const quotation = await Quotation.findByPk(quotation_id, {
      include: [{ model: Customer, as: 'customer' }]
    });

    if (!quotation) {
      await t.rollback();
      return error(res, '报价单不存在', 404);
    }

    // 生成合同编号
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const prefix = `YZ${year}${month}${day}`;

    const lastContract = await Contract.findOne({
      where: {
        contract_no: {
          [Op.like]: `${prefix}%`
        }
      },
      order: [['contract_no', 'DESC']]
    });

    let sequence = 1;
    if (lastContract) {
      const lastSeq = parseInt(lastContract.contract_no.slice(-3));
      sequence = lastSeq + 1;
    }
    const contract_no = `${prefix}${String(sequence).padStart(3, '0')}`;

    // 计算金额大写
    const contractAmount = parseFloat(quotation.total_amount) || 0;
    const amountInWords = numberToChineseAmount(contractAmount);

    // 创建合同
    const contract = await Contract.create({
      contract_no,
      contract_title: contract_title || '客房智能化系统购销合同',
      customer_id: quotation.customer_id,
      status: 'draft',
      contract_amount: contractAmount,
      amount_in_words: amountInWords,
      // 签署信息
      signed_date,
      signing_location,
      // 甲方信息
      party_a_name,
      party_a_address,
      party_a_representative,
      party_a_phone,
      party_a_fax,
      // 项目信息
      hotel_name: hotel_name || quotation.hotel_name,
      room_count: room_count || quotation.room_count,
      project_address,
      // 交付信息
      delivery_method: delivery_method || '按乙方安排的物流公司交付',
      delivery_address,
      delivery_deadline,
      freight_bearer: freight_bearer || 'party_a',
      // 付款条款
      payment_terms: payment_terms ? JSON.stringify(payment_terms) : null,
      // 质保信息
      warranty_period: warranty_period || 5,
      lifetime_maintenance: lifetime_maintenance !== false,
      // 其他条款
      additional_terms,
      // 关联
      source_quotation_id: quotation_id,
      owner_id: quotation.owner_id,
      created_by: req.user.id
    }, { transaction: t });

    // 获取报价单明细并创建合同明细
    const quotationItems = await QuotationItem.findAll({
      where: { quotation_id },
      include: [{ model: Product, as: 'product' }]
    });

    for (const item of quotationItems) {
      await ContractItem.create({
        contract_id: contract.contract_id,
        product_id: item.product_id,
        product_code: item.product_code,
        product_name: item.product_name,
        product_unit: item.product?.unit || item.unit || '套',
        specification: item.specification || item.product?.specification,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        cost_price: item.cost_price,
        notes: item.notes
      }, { transaction: t });
    }

    // 更新报价单状态
    await quotation.update({
      status: 'accepted',
      updated_by: req.user.id
    }, { transaction: t });

    // 如果需要更新客户信息
    if (update_customer && quotation.customer) {
      const customerUpdate = {};
      if (party_a_address && !quotation.customer.address) {
        customerUpdate.address = party_a_address;
      }
      if (party_a_phone && !quotation.customer.phone) {
        customerUpdate.phone = party_a_phone;
      }
      if (party_a_representative) {
        // 可以存储到备注或其他字段
      }
      if (Object.keys(customerUpdate).length > 0) {
        await Customer.update(customerUpdate, {
          where: { id: quotation.customer_id },
          transaction: t
        });
      }
    }

    // 自动生成收款计划（根据付款条款）
    if (payment_terms?.stages && payment_terms.stages.length > 0) {
      for (const stage of payment_terms.stages) {
        await Payment.create({
          contract_id: contract.contract_id,
          customer_id: quotation.customer_id,
          payment_no: `PAY-${contract.contract_no}-${stage.stage}`,
          payment_amount: stage.amount,
          payment_stage: `第${stage.stage}期-${stage.name}`,
          payment_date: new Date(), // 计划日期
          payment_method: payment_terms.payment_method || '银行电汇',
          expected_amount: stage.amount,
          stage_balance_amount: stage.amount,
          status: 'pending', // 待收款
          payment_note: `${stage.condition}`,
          owner_id: quotation.owner_id,
          created_by: req.user.id
        }, { transaction: t });
      }
    }

    // 更新合同的线索ID（从报价单获取）
    if (quotation.lead_id) {
      await contract.update({ lead_id: quotation.lead_id }, { transaction: t });
    }

    await t.commit();

    // 如果关联了线索，清空下次跟踪时间（合同已签订，无需继续跟踪）
    const leadId = quotation.lead_id;
    if (leadId) {
      try {
        // 添加跟踪记录
        await FollowUp.create({
          bizType: 1,  // 线索
          bizId: leadId,
          followType: 'contract',
          content: `创建了合同 ${contract.contract_no}，合同金额：¥${contractAmount.toFixed(2)}，线索跟踪已完成`,
          operatorId: req.user.id
        });

        // 清空线索的下次跟踪时间，表示无需继续跟踪
        await Lead.update({
          nextFollowDate: null,
          lastFollowTime: new Date(),
          status: 'converted'  // 更新状态为已转化
        }, {
          where: { id: leadId }
        });
      } catch (followUpErr) {
        console.error('更新线索跟踪状态失败:', followUpErr);
        // 不影响主流程
      }
    }

    return success(res, {
      contractId: contract.contract_id,
      contract_id: contract.contract_id,
      contractNo: contract.contract_no,
      contract_no: contract.contract_no,
      status: contract.status
    }, '合同创建成功', 201);

  } catch (err) {
    await t.rollback();
    console.error('创建合同失败:', err);
    console.error('错误详情:', err.message);
    return error(res, '创建合同失败: ' + err.message, 500);
  }
};

/**
 * 更新付款条款中的金额（根据比例自动计算）
 * POST /api/contracts/calculate-payment
 */
exports.calculatePaymentAmounts = async (req, res) => {
  try {
    const { total_amount, stages } = req.body;

    if (!total_amount || !stages || !Array.isArray(stages)) {
      return error(res, '参数错误', 400);
    }

    const amount = parseFloat(total_amount);
    const calculatedStages = stages.map(stage => ({
      ...stage,
      amount: Math.round(amount * (stage.percentage / 100) * 100) / 100
    }));

    // 验证比例总和
    const totalPercentage = calculatedStages.reduce((sum, s) => sum + s.percentage, 0);
    if (totalPercentage !== 100) {
      return error(res, `付款比例总和必须为100%，当前为${totalPercentage}%`, 400);
    }

    return success(res, {
      stages: calculatedStages,
      total_amount: amount,
      amount_in_words: numberToChineseAmount(amount)
    }, '计算成功');

  } catch (err) {
    console.error('计算付款金额失败:', err);
    return error(res, '计算失败', 500);
  }
};

/**
 * 导出合同Word文档
 * GET /api/contracts/:id/export-word
 */
exports.exportContractWord = async (req, res) => {
  try {
    const { id } = req.params;

    // 获取合同详情
    const contract = await Contract.findByPk(id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: User, as: 'owner', attributes: ['id', 'name', 'phone'] },
        { model: ContractItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ]
    });

    if (!contract) {
      return error(res, '合同不存在', 404);
    }

    // 解析付款条款
    let paymentTerms = null;
    try {
      paymentTerms = contract.payment_terms ?
        (typeof contract.payment_terms === 'string' ? JSON.parse(contract.payment_terms) : contract.payment_terms)
        : null;
    } catch (e) {
      console.warn('解析付款条款失败:', e);
    }

    // 构建合同数据用于Word生成
    const contractData = {
      // 基础信息
      contract_no: contract.contract_no,
      contract_title: contract.contract_title || '客房智能化系统购销合同',
      signed_date: contract.signed_date || '',
      signing_location: contract.signing_location || '',
      contract_amount: parseFloat(contract.contract_amount) || 0,
      amount_in_words: contract.amount_in_words || numberToChineseAmount(parseFloat(contract.contract_amount) || 0),

      // 甲方信息
      party_a_name: contract.party_a_name || contract.customer?.customerName || '',
      party_a_address: contract.party_a_address || '',
      party_a_representative: contract.party_a_representative || '',
      party_a_phone: contract.party_a_phone || '',
      party_a_fax: contract.party_a_fax || '',

      // 乙方信息（公司固定信息）
      party_b_name: '温州艾居来智能科技有限公司',
      party_b_address: '浙江省温州市龙湾区永中街道永中西路1158号金属大厦2幢501室',
      party_b_representative: contract.owner?.name || '',
      party_b_phone: contract.owner?.phone || '0577-86997550',
      party_b_fax: '0577-86997550',

      // 项目信息
      hotel_name: contract.hotel_name || '',
      room_count: contract.room_count || 0,
      project_address: contract.project_address || '',

      // 交付信息
      delivery_method: contract.delivery_method || '按乙方安排的物流公司交付',
      delivery_address: contract.delivery_address || contract.project_address || '',
      delivery_deadline: contract.delivery_deadline || '',
      freight_bearer: contract.freight_bearer === 'party_b' ? '乙方' : '甲方',

      // 质保信息
      warranty_period: contract.warranty_period || 5,
      lifetime_maintenance: contract.lifetime_maintenance !== false,

      // 付款条款
      payment_terms: paymentTerms,

      // 银行信息
      bank_info: paymentTerms?.bank_account || {
        name: '温州艾居来智能科技有限公司',
        bank: '宁波银行股份有限公司温州经济技术开发区支行',
        account: '86041110000759370'
      },

      // 产品明细
      items: (contract.items || []).map((item, index) => ({
        index: index + 1,
        product_code: item.product_code || '',
        product_name: item.product_name || '',
        specification: item.specification || item.product?.specification || '',
        quantity: item.quantity || 0,
        unit: item.product_unit || '套',
        unit_price: parseFloat(item.unit_price) || 0,
        subtotal: parseFloat(item.subtotal) || 0
      })),

      // 其他条款
      additional_terms: contract.additional_terms || ''
    };

    // 返回合同数据（前端生成Word）
    return success(res, contractData, '获取成功');

  } catch (err) {
    console.error('导出合同失败:', err);
    console.error('错误详情:', err.message);
    return error(res, '导出合同失败: ' + err.message, 500);
  }
};
