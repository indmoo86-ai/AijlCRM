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

module.exports = router;
