/**
 * 发货管理路由
 */
const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const { authenticate } = require('../middleware/auth');

// 所有发货接口都需要身份验证
router.use(authenticate);

// 发货单基本操作
router.post('/', shipmentController.createShipment);              // 9.1 创建发货单
router.get('/', shipmentController.getShipmentList);              // 9.2 查询发货单列表
router.get('/:id', shipmentController.getShipmentDetail);         // 9.3 查询发货单详情
router.put('/:id', shipmentController.updateShipment);            // 9.4 修改发货单

// 发货单操作
router.put('/:id/confirm', shipmentController.confirmShipment);   // 9.5 确认发货
router.put('/:id/logistics', shipmentController.updateLogistics); // 9.6 更新物流信息
router.put('/:id/sign', shipmentController.signShipment);         // 9.7 签收确认
router.put('/:id/cancel', shipmentController.cancelShipment);     // 9.8 取消发货

module.exports = router;
