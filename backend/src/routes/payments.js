/**
 * 收款管理路由
 */
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

// 所有收款接口都需要身份验证
router.use(authenticate);

// 应收账款统计（需放在/:id之前）
router.get('/statistics', paymentController.getPaymentStatistics);  // 10.6 应收账款统计

// 收款记录基本操作
router.get('/', paymentController.getPaymentList);                  // 10.1 查询收款记录列表
router.post('/', paymentController.createPayment);                  // 10.2 创建收款记录
router.get('/:id', paymentController.getPaymentDetail);             // 10.3 查询收款详情

// 收款记录操作
router.put('/:id/confirm', paymentController.confirmPayment);       // 10.4 确认收款
router.put('/:id/void', paymentController.voidPayment);             // 10.5 作废收款

module.exports = router;
