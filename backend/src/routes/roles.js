const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticateToken } = require('../middleware/auth');

// 所有角色路由都需要认证
router.use(authenticateToken);

// 获取角色列表
router.get('/', roleController.getRoleList);

// 获取角色详情
router.get('/:id', roleController.getRoleDetail);

// 创建角色
router.post('/', roleController.createRole);

// 更新角色
router.put('/:id', roleController.updateRole);

// 删除角色
router.delete('/:id', roleController.deleteRole);

// 配置角色权限
router.put('/:id/permissions', roleController.assignRolePermissions);

// 获取审计日志
router.get('/audit-logs', roleController.getAuditLogs);

module.exports = router;
