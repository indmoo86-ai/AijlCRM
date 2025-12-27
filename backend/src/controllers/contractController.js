/**
 * 合同管理 Controller
 */
const Contract = require('../models/Contract');
const ContractItem = require('../models/ContractItem');
const ContractAmendment = require('../models/ContractAmendment');
const Shipment = require('../models/Shipment');
const Payment = require('../models/Payment');
const { success, error } = require('../utils/response');
const { Op } = require('sequelize');

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
    const {
      contractTitle, customerId, customerContactId, sourceQuotationId,
      contractAmount, signedDate, deliveryDeadline,
      paymentTerms, deliveryTerms, warrantyTerms, items
    } = req.body;

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
        await ContractItem.create({
          contract_id: contract.contract_id,
          product_id: item.productId,
          product_code: item.productCode,
          product_name: item.productName,
          product_unit: item.productUnit,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          subtotal: item.quantity * item.unitPrice,
          item_note: item.itemNote
        });
      }
    }

    return success(res, {
      contractId: contract.contract_id,
      contractNo: contract.contract_no,
      contractTitle: contract.contract_title,
      customerId: contract.customer_id,
      contractAmount: contract.contract_amount,
      status: contract.status,
      createdAt: contract.created_at
    }, '合同创建成功');
  } catch (err) {
    console.error('创建合同失败:', err);
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
    const contract = await Contract.findByPk(id, {
      include: [
        { model: ContractItem, as: 'items' },
        { model: ContractAmendment, as: 'amendments' }
      ]
    });

    if (!contract) {
      return error(res, '合同不存在', 404);
    }

    return success(res, contract, '查询成功');
  } catch (err) {
    console.error('查询合同详情失败:', err);
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

    return success(res, {
      amendmentId: amendment.amendment_id,
      amendmentNo: amendment.amendment_no,
      contractId: amendment.contract_id,
      amendmentType: amendment.amendment_type,
      amountChange: amendment.amount_change,
      newContractAmount: amendment.new_contract_amount,
      status: amendment.status,
      createdAt: amendment.created_at
    }, '补充协议创建成功');
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
      attributes: ['payment_id', 'payment_no', 'payment_stage', 'paid_amount', 'payment_method',
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
