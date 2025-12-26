/**
 * 待办任务管理路由
 */
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');

// 所有任务接口都需要身份验证
router.use(authenticate);

// 任务统计和查询（需放在/:id之前，避免路由冲突）
router.get('/overdue', taskController.getOverdueTasks);           // 8.6 查询逾期任务
router.get('/statistics', taskController.getTaskStatistics);      // 8.7 任务统计分析

// 任务基本操作
router.get('/', taskController.getTaskList);                      // 8.1 查询任务列表
router.get('/:id', taskController.getTaskDetail);                 // 8.2 查询任务详情

// 任务操作
router.put('/:id/assign', taskController.assignTask);             // 8.3 分配任务
router.put('/:id/complete', taskController.completeTask);         // 8.4 完成任务
router.put('/:id/defer', taskController.deferTask);               // 8.5 延期任务

module.exports = router;
