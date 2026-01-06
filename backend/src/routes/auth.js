const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// 登录
router.post('/login', authController.login);

// 获取当前用户信息（需要认证）
router.get('/profile', authenticateToken, authController.getProfile);

// 获取当前用户权限列表（需要认证）
router.get('/permissions', authenticateToken, userController.getUserPermissions);

// 修改密码（需要认证）
router.put('/password', authenticateToken, authController.changePassword);

// 登出（需要认证）
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
