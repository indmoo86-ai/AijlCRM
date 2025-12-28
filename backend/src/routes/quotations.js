/**
 * 报价单管理路由
 */
const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');
const { authenticate } = require('../middleware/auth');

// 所有报价单接口都需要身份验证
router.use(authenticate);

// 报价单基本操作
router.post('/', quotationController.createQuotation);
router.get('/', quotationController.getQuotationList);
router.get('/:id', quotationController.getQuotationDetail);
router.put('/:id', quotationController.updateQuotation);

// 报价单产品明细
router.post('/:id/items', quotationController.addQuotationItem);
router.delete('/:id/items/:itemId', quotationController.deleteQuotationItem);

// 报价单操作
router.put('/:id/validity', quotationController.extendValidity);
router.post('/:id/pdf', quotationController.generatePDF);
router.post('/:id/convert-to-contract', quotationController.convertToContract);

// 报价单审批流程
router.put('/:id/submit', quotationController.submitQuotation);     // 提交审批
router.put('/:id/approve', quotationController.approveQuotation);   // 审批通过/拒绝
router.put('/:id/send', quotationController.sendQuotation);         // 发送给客户

module.exports = router;
