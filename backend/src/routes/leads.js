const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { authenticateToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permission');

// 所有路由都需要认证
router.use(authenticateToken);

// 获取线索列表
router.get('/', checkPermission('lead:view'), leadController.getLeads);

// 创建线索
router.post('/', checkPermission('lead:create'), leadController.createLead);

// 获取线索详情
router.get('/:id', checkPermission('lead:view'), leadController.getLeadDetail);

// 更新线索
router.put('/:id', checkPermission('lead:edit'), leadController.updateLead);

// 添加跟进记录
router.post('/:id/follow-up', checkPermission('lead:follow'), leadController.addFollowUp);

// 线索转客户
router.post('/:id/convert', checkPermission('lead:convert'), leadController.convertToCustomer);

// 分配线索
router.put('/:id/assign', checkPermission('lead:edit'), leadController.assignLead);

// 放弃线索
router.put('/:id/abandon', checkPermission('lead:edit'), leadController.abandonLead);

// 删除线索
router.delete('/:id', checkPermission('lead:delete'), leadController.deleteLead);

module.exports = router;
