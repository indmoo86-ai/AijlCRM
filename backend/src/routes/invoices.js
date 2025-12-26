/**
 * 发票管理路由
 */
const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authenticate } = require('../middleware/auth');

// 所有发票接口都需要身份验证
router.use(authenticate);

// 发票统计（需放在/:id之前）
router.get('/statistics', invoiceController.getInvoiceStatistics);  // 11.7 发票统计分析

// 发票记录基本操作
router.get('/', invoiceController.getInvoiceList);                  // 11.1 查询发票列表
router.post('/', invoiceController.createInvoice);                  // 11.2 创建发票记录
router.get('/:id', invoiceController.getInvoiceDetail);             // 11.3 查询发票详情
router.put('/:id', invoiceController.updateInvoice);                // 11.4 修改发票信息

// 发票操作
router.put('/:id/confirm', invoiceController.confirmInvoice);       // 11.5 确认开票
router.put('/:id/void', invoiceController.voidInvoice);             // 11.6 作废发票

module.exports = router;
