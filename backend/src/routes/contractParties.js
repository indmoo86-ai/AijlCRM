/**
 * 合同主体管理路由
 */
const express = require('express');
const router = express.Router();
const contractPartyController = require('../controllers/contractPartyController');
const { authenticate } = require('../middleware/auth');

// 所有路由都需要认证
router.use(authenticate);

// 获取启用的合同主体列表（用于下拉选择，放在 :id 路由之前）
router.get('/active', contractPartyController.getActiveContractParties);

// 创建合同主体
router.post('/', contractPartyController.createContractParty);

// 获取合同主体列表
router.get('/', contractPartyController.getContractPartyList);

// 获取合同主体详情
router.get('/:id', contractPartyController.getContractPartyDetail);

// 更新合同主体
router.put('/:id', contractPartyController.updateContractParty);

// 更新合同主体状态
router.put('/:id/status', contractPartyController.updateContractPartyStatus);

// 删除合同主体
router.delete('/:id', contractPartyController.deleteContractParty);

module.exports = router;
