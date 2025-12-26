const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { authenticateToken } = require('../middleware/auth');

// 所有路由都需要认证
router.use(authenticateToken);

// 获取线索列表
router.get('/', leadController.getLeads);

// 创建线索
router.post('/', leadController.createLead);

// 获取线索详情
router.get('/:id', leadController.getLeadDetail);

// 更新线索
router.put('/:id', leadController.updateLead);

// 添加跟进记录
router.post('/:id/follow-up', leadController.addFollowUp);

// 线索转客户
router.post('/:id/convert', leadController.convertToCustomer);

// 分配线索
router.put('/:id/assign', leadController.assignLead);

// 放弃线索
router.put('/:id/abandon', leadController.abandonLead);

module.exports = router;
