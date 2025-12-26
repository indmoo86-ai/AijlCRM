/**
 * 售后服务管理路由
 */
const express = require('express');
const router = express.Router();
const serviceTicketController = require('../controllers/serviceTicketController');
const { authenticate } = require('../middleware/auth');

// 所有工单接口都需要身份验证
router.use(authenticate);

// 工单基本操作
router.get('/', serviceTicketController.getTicketList);              // 查询工单列表
router.post('/', serviceTicketController.createTicket);              // 创建工单
router.get('/:id', serviceTicketController.getTicketDetail);         // 查询工单详情
router.put('/:id', serviceTicketController.updateTicket);            // 修改工单

// 工单操作
router.put('/:id/assign', serviceTicketController.assignTicket);     // 分配工单
router.put('/:id/resolve', serviceTicketController.resolveTicket);   // 解决工单
router.put('/:id/close', serviceTicketController.closeTicket);       // 关闭工单
router.post('/:id/logs', serviceTicketController.addTicketLog);      // 添加操作日志
router.put('/:id/rate', serviceTicketController.rateTicket);         // 客户评价

module.exports = router;
