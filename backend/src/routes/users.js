const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// 所有用户路由都需要认证
router.use(authenticateToken);

// 获取用户列表
router.get('/', userController.getUserList);

// 创建用户
router.post('/', userController.createUser);

// 更新用户信息
router.put('/:id', userController.updateUser);

// 更新用户状态（启用/禁用）
router.put('/:id/status', userController.updateUserStatus);

// 分配用户角色
router.put('/:id/roles', userController.assignUserRoles);

module.exports = router;
