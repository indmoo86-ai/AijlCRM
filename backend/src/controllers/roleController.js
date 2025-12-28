/**
 * 角色权限管理控制器 - RoleController
 */
const { Role, Permission, RolePermission } = require('../models');
const { success, error } = require('../utils/response');

// 查询角色列表
exports.getRoleList = async (req, res) => {
  try {
    const roles = await Role.findAll({
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
    });

    return success(res, roles, '查询成功');
  } catch (err) {
    console.error('查询角色列表错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '查询失败', 500);
  }
};

// 配置角色权限
exports.assignRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permission_ids } = req.body;

    // 删除旧的权限分配
    await RolePermission.destroy({ where: { role_id: id } });

    // 创建新的权限分配
    if (permission_ids && permission_ids.length > 0) {
      const rolePermissions = permission_ids.map(permission_id => ({
        role_id: id,
        permission_id,
        creator_id: req.user.id
      }));
      await RolePermission.bulkCreate(rolePermissions);
    }

    return success(res, null, '权限配置成功');
  } catch (err) {
    console.error('配置权限错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '操作失败', 500);
  }
};

// 查询操作日志（占位）
exports.getAuditLogs = async (req, res) => {
  try {
    return success(res, { message: '日志查询功能待实现' });
  } catch (err) {
    console.error('查询日志错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '查询失败', 500);
  }
};
