/**
 * 客户管理路由
 */
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticate } = require('../middleware/auth');

// 所有客户接口都需要身份验证
router.use(authenticate);

// 客户导出（需放在/:id之前，避免路由冲突）
router.get('/export', customerController.exportCustomers);        // 3.8 导出客户数据

// 客户基本操作
router.get('/', customerController.getCustomerList);              // 3.1 获取客户列表
router.post('/', customerController.createCustomer);              // 3.2 创建客户
router.get('/:id', customerController.getCustomerDetail);         // 3.3 获取客户详情
router.put('/:id', customerController.updateCustomer);            // 3.4 修改客户信息

// 客户联系人管理
router.post('/:id/contacts', customerController.addCustomerContact);  // 3.5 添加客户联系人

// 客户阶段与负责人管理
router.put('/:id/stage', customerController.advanceCustomerStage);    // 3.6 推进客户阶段
router.put('/:id/owner', customerController.transferCustomerOwner);   // 3.7 转移客户负责人

// 客户回访记录
router.post('/:id/visit', customerController.addCustomerVisit);       // 添加回访记录
router.get('/:id/visits', customerController.getCustomerVisits);      // 获取回访记录列表

// 删除客户
router.delete('/:id', customerController.deleteCustomer);             // 删除客户

module.exports = router;
