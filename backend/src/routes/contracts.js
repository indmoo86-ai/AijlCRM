/**
 * 合同管理路由
 */
const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const { authenticate } = require('../middleware/auth');

// 所有合同接口都需要身份验证
router.use(authenticate);

// 从报价单创建合同
router.get('/quotation-info/:quotationId', contractController.getQuotationInfoForContract);  // 获取报价单信息用于创建合同
router.post('/from-quotation', contractController.createContractFromQuotation);              // 从报价单创建合同
router.post('/calculate-payment', contractController.calculatePaymentAmounts);               // 计算付款金额

// 合同基本操作
router.get('/', contractController.getContractList);           // 7.1 获取合同列表
router.post('/', contractController.createContract);           // 7.2 创建合同
router.get('/:id', contractController.getContractDetail);      // 7.3 查询合同详情
router.put('/:id', contractController.updateContract);         // 7.4 修改合同信息

// 合同签订
router.put('/:id/sign', contractController.signContract);      // 7.5 合同签订

// 补充协议管理
router.post('/:id/amendments', contractController.createAmendment);      // 7.6 创建补充协议
router.get('/:id/amendments', contractController.getAmendmentList);      // 7.7 查询补充协议列表

// 合同文件管理
router.post('/:id/files', contractController.uploadContractFile);        // 7.8 上传合同文件
router.get('/:id/files', contractController.getContractFiles);           // 7.9 查询合同文件列表
router.delete('/:id/files/:fileId', contractController.deleteContractFile); // 7.10 删除合同文件

// 合同执行进度
router.get('/:id/progress', contractController.getContractProgress);     // 7.11 查询合同执行进度

// 导出合同Word
router.get('/:id/export-word', contractController.exportContractWord);   // 导出合同Word文档

// 合同状态操作
router.put('/:id/activate', contractController.activateContract);        // 7.12 激活合同
router.put('/:id/terminate', contractController.terminateContract);      // 7.13 终止合同

module.exports = router;
