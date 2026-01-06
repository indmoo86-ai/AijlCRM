const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const roleController = require('../controllers/roleController');
const permissionController = require('../controllers/permissionController');
const { authenticateToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permission');

// 所有设置路由都需要认证
router.use(authenticateToken);

// =====================================================
// 用户管理路由
// =====================================================

// 获取用户列表
router.get('/users', checkPermission('system:user:view'), userController.getUserList);

// 获取单个用户详情
router.get('/users/:id', checkPermission('system:user:view'), userController.getUserDetail);

// 创建用户
router.post('/users', checkPermission('system:user:create'), userController.createUser);

// 更新用户
router.put('/users/:id', checkPermission('system:user:edit'), userController.updateUser);

// 删除用户
router.delete('/users/:id', checkPermission('system:user:delete'), userController.deleteUser);

// 重置用户密码
router.post('/users/:id/reset-password', checkPermission('system:user:edit'), userController.resetPassword);

// 更新用户状态（启用/禁用）
router.put('/users/:id/status', checkPermission('system:user:edit'), userController.updateUserStatus);

// 分配用户角色
router.put('/users/:id/roles', checkPermission('system:user:edit'), userController.assignUserRoles);

// =====================================================
// 角色管理路由
// =====================================================

// 获取角色列表
router.get('/roles', checkPermission('system:role:view'), roleController.getRoleList);

// 获取单个角色详情（包含权限）
router.get('/roles/:id', checkPermission('system:role:view'), roleController.getRoleDetail);

// 创建角色
router.post('/roles', checkPermission('system:role:create'), roleController.createRole);

// 更新角色
router.put('/roles/:id', checkPermission('system:role:edit'), roleController.updateRole);

// 删除角色
router.delete('/roles/:id', checkPermission('system:role:delete'), roleController.deleteRole);

// 配置角色权限
router.put('/roles/:id/permissions', checkPermission('system:role:edit'), roleController.assignRolePermissions);

// =====================================================
// 权限管理路由
// =====================================================

// 获取所有权限列表（树形结构）
router.get('/permissions', checkPermission('system:role:view'), permissionController.getPermissionTree);

// 获取权限列表（平铺）
router.get('/permissions/flat', checkPermission('system:role:view'), permissionController.getPermissionList);

// =====================================================
// 系统参数路由（暂时占位）
// =====================================================

// 获取系统参数
router.get('/system-params', (req, res) => {
  res.json({
    success: true,
    data: {
      system_name: '艾居来CRM',
      company_name: '艾居来智能科技有限公司',
      contact_phone: '',
      contact_email: '',
      quotation_validity_days: 30,
      contract_default_months: 12,
      task_reminder_days: 3,
      email_notification_enabled: false,
      sms_notification_enabled: false,
      auto_backup_enabled: false
    }
  });
});

// 更新系统参数
router.put('/system-params', (req, res) => {
  res.json({
    success: true,
    message: '保存成功'
  });
});

module.exports = router;
