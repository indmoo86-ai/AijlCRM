const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

// 所有路由都需要认证
router.use(authenticate);

// 获取仪表板统计数据
router.get('/stats', dashboardController.getDashboardStats);

// 获取销售漏斗数据
router.get('/sales-funnel', dashboardController.getSalesFunnel);

// 获取业绩趋势数据
router.get('/performance-trend', dashboardController.getPerformanceTrend);

// 获取最近活动
router.get('/recent-activities', dashboardController.getRecentActivities);

// 获取任务统计（按状态分布）
router.get('/task-stats', dashboardController.getTaskStats);

// 获取客户类型分布
router.get('/customer-type-stats', dashboardController.getCustomerTypeStats);

// 获取产品销售排行
router.get('/product-sales-rank', dashboardController.getProductSalesRank);

// 获取待办任务列表
router.get('/todo-tasks', dashboardController.getTodoTasks);

// 获取月度业绩趋势
router.get('/monthly-trend', dashboardController.getMonthlyTrend);

module.exports = router;
