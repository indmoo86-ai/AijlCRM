/**
 * 发货管理 Controller
 */
const Shipment = require('../models/Shipment');
const ShipmentItem = require('../models/ShipmentItem');
const Contract = require('../models/Contract');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');

/**
 * 创建发货单
 * POST /api/shipments
 */
exports.createShipment = async (req, res) => {
  try {
    const {
      shipmentTitle,
      contractId,
      shippingAddress,
      contactPerson,
      contactPhone,
      plannedShipDate,
      items,
      notes
    } = req.body;

    // 获取合同信息
    const contract = await Contract.findByPk(contractId);
    if (!contract) {
      return errorResponse(res, '合同不存在', 404);
    }

    // 生成发货单编号
    const shipment_no = 'SHIP-' + Date.now();

    // 计算发货金额
    let shipmentAmount = 0;
    if (items && items.length > 0) {
      for (const item of items) {
        shipmentAmount += item.thisShipmentQuantity * (item.unitPrice || 0);
      }
    }

    const shipment = await Shipment.create({
      shipment_no,
      shipment_title: shipmentTitle,
      contract_id: contractId,
      customer_id: contract.customer_id,
      shipping_address: shippingAddress,
      contact_person: contactPerson,
      contact_phone: contactPhone,
      planned_ship_date: plannedShipDate,
      shipment_amount: shipmentAmount,
      status: 'draft',
      notes,
      owner_id: req.user.user_id,
      created_by: req.user.user_id
    });

    // 创建发货单明细
    if (items && items.length > 0) {
      for (const item of items) {
        await ShipmentItem.create({
          shipment_id: shipment.shipment_id,
          contract_item_id: item.contractItemId,
          product_id: item.productId,
          product_code: item.productCode,
          product_name: item.productName,
          product_unit: item.productUnit,
          contract_quantity: item.contractQuantity,
          already_shipped_quantity: item.alreadyShippedQuantity || 0,
          this_shipment_quantity: item.thisShipmentQuantity,
          remaining_quantity: item.remainingQuantity || 0,
          unit_price: item.unitPrice,
          subtotal: item.thisShipmentQuantity * item.unitPrice
        });
      }
    }

    return successResponse(res, {
      shipmentId: shipment.shipment_id,
      shipmentNo: shipment.shipment_no,
      shipmentTitle: shipment.shipment_title,
      contractId: shipment.contract_id,
      customerId: shipment.customer_id,
      shipmentAmount: shipment.shipment_amount,
      status: shipment.status,
      createdAt: shipment.created_at
    }, '发货单创建成功');
  } catch (error) {
    console.error('创建发货单失败:', error);
    return errorResponse(res, '创建发货单失败', 500);
  }
};

/**
 * 查询发货单列表
 * GET /api/shipments
 */
exports.getShipmentList = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, contractId, customerId, status, startDate, endDate } = req.query;
    const offset = (page - 1) * pageSize;

    const where = {};
    if (contractId) where.contract_id = contractId;
    if (customerId) where.customer_id = customerId;
    if (status) where.status = status;
    if (startDate && endDate) {
      where.actual_ship_date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const { count, rows } = await Shipment.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
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
    console.error('查询发货单列表失败:', error);
    return errorResponse(res, '查询发货单列表失败', 500);
  }
};

/**
 * 查询发货单详情
 * GET /api/shipments/:id
 */
exports.getShipmentDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const shipment = await Shipment.findByPk(id, {
      include: [
        { model: ShipmentItem, as: 'items' }
      ]
    });

    if (!shipment) {
      return errorResponse(res, '发货单不存在', 404);
    }

    return successResponse(res, shipment, '查询成功');
  } catch (error) {
    console.error('查询发货单详情失败:', error);
    return errorResponse(res, '查询发货单详情失败', 500);
  }
};

/**
 * 修改发货单
 * PUT /api/shipments/:id
 */
exports.updateShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const shipment = await Shipment.findByPk(id);

    if (!shipment) {
      return errorResponse(res, '发货单不存在', 404);
    }

    if (shipment.status !== 'draft') {
      return errorResponse(res, '只有草稿状态的发货单才能修改', 400);
    }

    await shipment.update({
      ...req.body,
      updated_by: req.user.user_id
    });

    return successResponse(res, shipment, '发货单更新成功');
  } catch (error) {
    console.error('更新发货单失败:', error);
    return errorResponse(res, '更新发货单失败', 500);
  }
};

/**
 * 确认发货
 * PUT /api/shipments/:id/confirm
 */
exports.confirmShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { logisticsCompany, trackingNo, actualShipDate, estimatedDeliveryDate } = req.body;

    const shipment = await Shipment.findByPk(id);
    if (!shipment) {
      return errorResponse(res, '发货单不存在', 404);
    }

    if (shipment.status === 'shipped') {
      return errorResponse(res, '发货单已确认发货', 400);
    }

    await shipment.update({
      status: 'shipped',
      logistics_company: logisticsCompany,
      tracking_no: trackingNo,
      actual_ship_date: actualShipDate,
      estimated_delivery_date: estimatedDeliveryDate,
      shipped_by: req.user.user_id,
      shipped_at: new Date(),
      updated_by: req.user.user_id
    });

    // 更新合同的shipped_amount
    const contract = await Contract.findByPk(shipment.contract_id);
    if (contract) {
      const newShippedAmount = parseFloat(contract.shipped_amount || 0) + parseFloat(shipment.shipment_amount || 0);
      await contract.update({
        shipped_amount: newShippedAmount,
        updated_by: req.user.user_id
      });
    }

    return successResponse(res, {
      shipmentId: shipment.shipment_id,
      status: shipment.status,
      actualShipDate: shipment.actual_ship_date,
      shippedAt: shipment.shipped_at
    }, '发货确认成功');
  } catch (error) {
    console.error('确认发货失败:', error);
    return errorResponse(res, '确认发货失败', 500);
  }
};

/**
 * 更新物流信息
 * PUT /api/shipments/:id/logistics
 */
exports.updateLogistics = async (req, res) => {
  try {
    const { id } = req.params;
    const { logisticsCompany, trackingNo, updateReason } = req.body;

    const shipment = await Shipment.findByPk(id);
    if (!shipment) {
      return errorResponse(res, '发货单不存在', 404);
    }

    await shipment.update({
      logistics_company: logisticsCompany,
      tracking_no: trackingNo,
      notes: updateReason ? `${shipment.notes || ''}\n物流信息更新：${updateReason}` : shipment.notes,
      updated_by: req.user.user_id
    });

    return successResponse(res, shipment, '物流信息更新成功');
  } catch (error) {
    console.error('更新物流信息失败:', error);
    return errorResponse(res, '更新物流信息失败', 500);
  }
};

/**
 * 签收确认
 * PUT /api/shipments/:id/sign
 */
exports.signShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { actualDeliveryDate, signNotes } = req.body;

    const shipment = await Shipment.findByPk(id);
    if (!shipment) {
      return errorResponse(res, '发货单不存在', 404);
    }

    if (shipment.status === 'delivered') {
      return errorResponse(res, '发货单已签收', 400);
    }

    await shipment.update({
      status: 'delivered',
      actual_delivery_date: actualDeliveryDate,
      notes: signNotes ? `${shipment.notes || ''}\n签收备注：${signNotes}` : shipment.notes,
      delivered_by: req.user.user_id,
      delivered_at: new Date(),
      updated_by: req.user.user_id
    });

    return successResponse(res, {
      shipmentId: shipment.shipment_id,
      status: shipment.status,
      actualDeliveryDate: shipment.actual_delivery_date,
      deliveredAt: shipment.delivered_at
    }, '签收确认成功');
  } catch (error) {
    console.error('签收确认失败:', error);
    return errorResponse(res, '签收确认失败', 500);
  }
};

/**
 * 取消发货
 * PUT /api/shipments/:id/cancel
 */
exports.cancelShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;

    const shipment = await Shipment.findByPk(id);
    if (!shipment) {
      return errorResponse(res, '发货单不存在', 404);
    }

    if (shipment.status === 'delivered') {
      return errorResponse(res, '已签收的发货单不能取消', 400);
    }

    if (shipment.status === 'cancelled') {
      return errorResponse(res, '发货单已取消', 400);
    }

    // 记录之前的状态，用于判断是否需要回退shipped_amount
    const wasShipped = shipment.status === 'shipped' || shipment.status === 'delivered';

    await shipment.update({
      status: 'cancelled',
      cancel_reason: cancelReason,
      updated_by: req.user.user_id
    });

    // 如果之前已确认发货，回退合同的shipped_amount
    if (wasShipped) {
      const contract = await Contract.findByPk(shipment.contract_id);
      if (contract) {
        const newShippedAmount = parseFloat(contract.shipped_amount || 0) - parseFloat(shipment.shipment_amount || 0);
        await contract.update({
          shipped_amount: Math.max(0, newShippedAmount), // 确保不会小于0
          updated_by: req.user.user_id
        });
      }
    }

    return successResponse(res, shipment, '发货单取消成功');
  } catch (error) {
    console.error('取消发货失败:', error);
    return errorResponse(res, '取消发货失败', 500);
  }
};
