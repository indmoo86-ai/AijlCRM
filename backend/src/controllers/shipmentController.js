/**
 * 发货管理 Controller
 */
const Shipment = require('../models/Shipment');
const ShipmentItem = require('../models/ShipmentItem');
const Contract = require('../models/Contract');
const ContractItem = require('../models/ContractItem');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const User = require('../models/User');
const FollowUp = require('../models/FollowUp');
const { success, error } = require('../utils/response');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * 创建发货单
 * POST /api/shipments
 */
exports.createShipment = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    // 支持驼峰和下划线两种命名方式
    const shipmentTitle = req.body.shipmentTitle || req.body.shipment_title;
    const contractId = req.body.contractId || req.body.contract_id;
    const shippingAddress = req.body.shippingAddress || req.body.shipping_address;
    const contactPerson = req.body.contactPerson || req.body.contact_person;
    const contactPhone = req.body.contactPhone || req.body.contact_phone;
    const plannedShipDate = req.body.plannedShipDate || req.body.planned_ship_date;
    const actualShipDate = req.body.actualShipDate || req.body.actual_ship_date;
    const logisticsCompany = req.body.logisticsCompany || req.body.logistics_company;
    const trackingNo = req.body.trackingNo || req.body.tracking_no;
    const items = req.body.items;
    const notes = req.body.notes;

    // 获取合同信息
    const contract = await Contract.findByPk(contractId);
    if (!contract) {
      await t.rollback();
      return error(res, '合同不存在', 404);
    }

    // 生成发货单编号
    const shipment_no = 'SHIP-' + Date.now();

    // 计算发货金额和处理明细
    let shipmentAmount = 0;
    const processedItems = [];

    if (items && items.length > 0) {
      for (const item of items) {
        const thisShipmentQuantity = parseFloat(item.thisShipmentQuantity || item.this_shipment_quantity) || 0;
        if (thisShipmentQuantity <= 0) continue; // 跳过数量为0的项

        const unitPrice = parseFloat(item.unitPrice || item.unit_price) || 0;
        shipmentAmount += thisShipmentQuantity * unitPrice;

        let contractItemId = item.contractItemId || item.contract_item_id;
        const productId = item.productId || item.product_id;
        let productCode = item.productCode || item.product_code;
        let productName = item.productName || item.product_name;
        let productUnit = item.productUnit || item.product_unit;
        const contractQuantity = parseFloat(item.contractQuantity || item.contract_quantity) || 0;
        const alreadyShippedQuantity = parseFloat(item.alreadyShippedQuantity || item.already_shipped_quantity) || 0;

        // 从合同明细中查找contract_item_id
        let contractItem = null;
        if (contractItemId) {
          contractItem = await ContractItem.findByPk(contractItemId);
        } else if (productId && contractId) {
          contractItem = await ContractItem.findOne({
            where: { contract_id: contractId, product_id: productId }
          });
        }

        if (contractItem) {
          contractItemId = contractItem.item_id;
          productCode = productCode || contractItem.product_code;
          productName = productName || contractItem.product_name;
          productUnit = productUnit || contractItem.product_unit;
        }

        // 如果还缺product信息，从Product表获取
        if (!productCode || !productName || !productUnit) {
          const product = await Product.findByPk(productId);
          if (product) {
            productCode = productCode || product.product_code;
            productName = productName || product.product_name;
            productUnit = productUnit || product.unit;
          }
        }

        const finalContractQuantity = contractQuantity || (contractItem?.quantity) || thisShipmentQuantity;
        const remainingQuantity = finalContractQuantity - alreadyShippedQuantity - thisShipmentQuantity;

        processedItems.push({
          contractItemId,
          contractItem,
          productId,
          productCode,
          productName,
          productUnit,
          contractQuantity: finalContractQuantity,
          alreadyShippedQuantity,
          thisShipmentQuantity,
          remainingQuantity,
          unitPrice
        });
      }
    }

    if (processedItems.length === 0) {
      await t.rollback();
      return error(res, '请至少选择一个发货项目', 400);
    }

    // 创建发货单
    const shipment = await Shipment.create({
      shipment_no,
      shipment_title: shipmentTitle || `${contract.contract_title || contract.contract_no} - 发货`,
      contract_id: contractId,
      customer_id: contract.customer_id,
      shipping_address: shippingAddress,
      contact_person: contactPerson,
      contact_phone: contactPhone,
      planned_ship_date: plannedShipDate,
      actual_ship_date: actualShipDate || new Date(),
      logistics_company: logisticsCompany,
      tracking_no: trackingNo,
      shipment_amount: shipmentAmount || 0,
      status: 'shipped', // 直接设为已发货状态
      notes,
      owner_id: req.user.id,
      shipped_by: req.user.id,
      shipped_at: new Date(),
      created_by: req.user.id
    }, { transaction: t });

    // 创建发货单明细并更新合同明细的已发货数量
    for (const item of processedItems) {
      // 创建发货单明细
      await ShipmentItem.create({
        shipment_id: shipment.shipment_id,
        contract_item_id: item.contractItemId,
        product_id: item.productId,
        product_code: item.productCode,
        product_name: item.productName,
        product_unit: item.productUnit,
        contract_quantity: item.contractQuantity,
        already_shipped_quantity: item.alreadyShippedQuantity,
        this_shipment_quantity: item.thisShipmentQuantity,
        remaining_quantity: item.remainingQuantity,
        unit_price: item.unitPrice,
        subtotal: item.thisShipmentQuantity * item.unitPrice
      }, { transaction: t });

      // 更新合同明细的已发货数量
      if (item.contractItem) {
        const newShippedQuantity = (parseFloat(item.contractItem.shipped_quantity) || 0) + item.thisShipmentQuantity;
        await item.contractItem.update({
          shipped_quantity: newShippedQuantity
        }, { transaction: t });
      }
    }

    // 更新合同的发货金额
    const newShippedAmount = parseFloat(contract.shipped_amount || 0) + shipmentAmount;
    await contract.update({
      shipped_amount: newShippedAmount,
      updated_by: req.user.id
    }, { transaction: t });

    // 添加跟踪记录
    const itemsSummary = processedItems.map(i => `${i.productName}×${i.thisShipmentQuantity}`).join('、');
    await FollowUp.create({
      bizType: 4, // 合同
      bizId: contractId,
      followType: 'shipment',
      content: `发货：${itemsSummary}，金额 ¥${shipmentAmount.toFixed(2)}${trackingNo ? '，快递单号：' + trackingNo : ''}${logisticsCompany ? '，物流：' + logisticsCompany : ''}`,
      operatorId: req.user.id
    }, { transaction: t });

    await t.commit();

    const responseData = {
      shipmentId: shipment.shipment_id,
      ...shipment.toJSON()
    };
    return success(res, responseData, '发货成功', 201);
  } catch (err) {
    await t.rollback();
    console.error('创建发货单失败:', err);
    console.error('错误详情:', err.message);
    return error(res, '创建发货单失败: ' + err.message, 500);
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
      include: [
        { model: Contract, as: 'contract', attributes: ['contract_id', 'contract_no', 'contract_title'] },
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
    console.error('查询发货单列表失败:', err);
    return error(res, '查询发货单列表失败', 500);
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
      return error(res, '发货单不存在', 404);
    }

    return success(res, shipment, '查询成功');
  } catch (err) {
    console.error('查询发货单详情失败:', err);
    return error(res, '查询发货单详情失败', 500);
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
      return error(res, '发货单不存在', 404);
    }

    if (shipment.status !== 'draft') {
      return error(res, '只有草稿状态的发货单才能修改', 400);
    }

    await shipment.update({
      ...req.body,
      updated_by: req.user.id
    });

    return success(res, shipment, '发货单更新成功');
  } catch (err) {
    console.error('更新发货单失败:', err);
    return error(res, '更新发货单失败', 500);
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
      return error(res, '发货单不存在', 404);
    }

    if (shipment.status === 'shipped') {
      return error(res, '发货单已确认发货', 400);
    }

    await shipment.update({
      status: 'shipped',
      logistics_company: logisticsCompany,
      tracking_no: trackingNo,
      actual_ship_date: actualShipDate,
      estimated_delivery_date: estimatedDeliveryDate,
      shipped_by: req.user.id,
      shipped_at: new Date(),
      updated_by: req.user.id
    });

    // 更新合同的shipped_amount
    const contract = await Contract.findByPk(shipment.contract_id);
    if (contract) {
      const newShippedAmount = parseFloat(contract.shipped_amount || 0) + parseFloat(shipment.shipment_amount || 0);
      await contract.update({
        shipped_amount: newShippedAmount,
        updated_by: req.user.id
      });
    }

    return success(res, {
      shipmentId: shipment.shipment_id,
      status: shipment.status,
      actualShipDate: shipment.actual_ship_date,
      shippedAt: shipment.shipped_at
    }, '发货确认成功');
  } catch (err) {
    console.error('确认发货失败:', err);
    return error(res, '确认发货失败', 500);
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
      return error(res, '发货单不存在', 404);
    }

    await shipment.update({
      logistics_company: logisticsCompany,
      tracking_no: trackingNo,
      notes: updateReason ? `${shipment.notes || ''}\n物流信息更新：${updateReason}` : shipment.notes,
      updated_by: req.user.id
    });

    return success(res, shipment, '物流信息更新成功');
  } catch (err) {
    console.error('更新物流信息失败:', err);
    return error(res, '更新物流信息失败', 500);
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
      return error(res, '发货单不存在', 404);
    }

    if (shipment.status === 'delivered') {
      return error(res, '发货单已签收', 400);
    }

    await shipment.update({
      status: 'delivered',
      actual_delivery_date: actualDeliveryDate,
      notes: signNotes ? `${shipment.notes || ''}\n签收备注：${signNotes}` : shipment.notes,
      delivered_by: req.user.id,
      delivered_at: new Date(),
      updated_by: req.user.id
    });

    return success(res, {
      shipmentId: shipment.shipment_id,
      status: shipment.status,
      actualDeliveryDate: shipment.actual_delivery_date,
      deliveredAt: shipment.delivered_at
    }, '签收确认成功');
  } catch (err) {
    console.error('签收确认失败:', err);
    return error(res, '签收确认失败', 500);
  }
};

/**
 * 取消发货
 * PUT /api/shipments/:id/cancel
 */
exports.cancelShipment = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { cancelReason } = req.body;

    const shipment = await Shipment.findByPk(id, {
      include: [{ model: ShipmentItem, as: 'items' }]
    });
    if (!shipment) {
      await t.rollback();
      return error(res, '发货单不存在', 404);
    }

    if (shipment.status === 'delivered') {
      await t.rollback();
      return error(res, '已签收的发货单不能取消', 400);
    }

    if (shipment.status === 'cancelled') {
      await t.rollback();
      return error(res, '发货单已取消', 400);
    }

    // 记录之前的状态，用于判断是否需要回退shipped_amount
    const wasShipped = shipment.status === 'shipped';

    await shipment.update({
      status: 'cancelled',
      cancel_reason: cancelReason,
      updated_by: req.user.id
    }, { transaction: t });

    // 如果之前已发货，回退合同的shipped_amount和合同明细的shipped_quantity
    if (wasShipped) {
      // 回退合同明细的已发货数量
      if (shipment.items && shipment.items.length > 0) {
        for (const shipmentItem of shipment.items) {
          if (shipmentItem.contract_item_id) {
            const contractItem = await ContractItem.findByPk(shipmentItem.contract_item_id);
            if (contractItem) {
              const newShippedQuantity = Math.max(0, (parseFloat(contractItem.shipped_quantity) || 0) - (parseFloat(shipmentItem.this_shipment_quantity) || 0));
              await contractItem.update({
                shipped_quantity: newShippedQuantity
              }, { transaction: t });
            }
          }
        }
      }

      // 回退合同的发货金额
      const contract = await Contract.findByPk(shipment.contract_id);
      if (contract) {
        const newShippedAmount = parseFloat(contract.shipped_amount || 0) - parseFloat(shipment.shipment_amount || 0);
        await contract.update({
          shipped_amount: Math.max(0, newShippedAmount),
          updated_by: req.user.id
        }, { transaction: t });
      }

      // 添加跟踪记录
      await FollowUp.create({
        bizType: 4,
        bizId: shipment.contract_id,
        followType: 'shipment',
        content: `取消发货：${shipment.shipment_no}${cancelReason ? '，原因：' + cancelReason : ''}`,
        operatorId: req.user.id
      }, { transaction: t });
    }

    await t.commit();
    return success(res, shipment, '发货单取消成功');
  } catch (err) {
    await t.rollback();
    console.error('取消发货失败:', err);
    return error(res, '取消发货失败', 500);
  }
};
