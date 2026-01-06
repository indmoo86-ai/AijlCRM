/**
 * 角色权限管理控制器 - RoleController
 */
const { Role, Permission, RolePermission, UserRole, User } = require('../models');
const { success, error } = require('../utils/response');
const { Op, sequelize } = require('sequelize');

// 查询角色列表
exports.getRoleList = async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] },
          attributes: ['permission_id', 'permission_code', 'permission_name']
        }
      ],
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
    });

    // 统计每个角色的用户数
    const roleIds = roles.map(r => r.role_id);
    const userCounts = await UserRole.findAll({
      where: { role_id: { [Op.in]: roleIds } },
      attributes: ['role_id', [require('sequelize').fn('COUNT', require('sequelize').col('user_id')), 'count']],
      group: ['role_id'],
      raw: true
    });

    const countMap = {};
    userCounts.forEach(item => {
      countMap[item.role_id] = parseInt(item.count);
    });

    const list = roles.map(role => {
      const roleData = role.toJSON();
      return {
        ...roleData,
        user_count: countMap[role.role_id] || 0,
        permission_ids: roleData.permissions ? roleData.permissions.map(p => p.permission_id) : []
      };
    });

    return success(res, { list }, '查询成功');
  } catch (err) {
    console.error('查询角色列表错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '查询失败', 500);
  }
};

// 获取单个角色详情
exports.getRoleDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ]
    });

    if (!role) {
      return error(res, '角色不存在', 404);
    }

    // 统计用户数
    const userCount = await UserRole.count({ where: { role_id: id } });

    const roleData = role.toJSON();
    roleData.user_count = userCount;
    roleData.permission_ids = roleData.permissions ? roleData.permissions.map(p => p.permission_id) : [];

    return success(res, roleData, '获取成功');
  } catch (err) {
    console.error('获取角色详情错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '获取失败', 500);
  }
};

// 创建角色
exports.createRole = async (req, res) => {
  try {
    const { role_code, role_name, description, sort_order, permission_ids, permissions } = req.body;

    // 验证必填字段
    if (!role_code || !role_name) {
      return error(res, '角色代码和名称不能为空', 400);
    }

    // 检查角色代码是否已存在
    const existingRole = await Role.findOne({ where: { role_code } });
    if (existingRole) {
      return error(res, '角色代码已存在', 400);
    }

    // 创建角色
    const role = await Role.create({
      role_code,
      role_name,
      description,
      sort_order: sort_order || 0,
      is_system: 0  // 新建的角色不是系统内置
    });

    // 分配权限
    const permissionIdsToAssign = permission_ids || permissions || [];
    if (permissionIdsToAssign.length > 0) {
      const rolePermissions = permissionIdsToAssign.map(permission_id => ({
        role_id: role.role_id,
        permission_id,
        creator_id: req.user.id
      }));
      await RolePermission.bulkCreate(rolePermissions);
    }

    // 响应格式标准化
    const responseData = {
      roleId: role.role_id,
      role_id: role.role_id,
      ...role.toJSON()
    };

    return success(res, responseData, '角色创建成功', 201);
  } catch (err) {
    console.error('创建角色错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '创建失败: ' + err.message, 500);
  }
};

// 更新角色
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_name, description, sort_order, permission_ids, permissions } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      return error(res, '角色不存在', 404);
    }

    // 更新角色基本信息
    const updateData = {};
    if (role_name !== undefined) updateData.role_name = role_name;
    if (description !== undefined) updateData.description = description;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    await role.update(updateData);

    // 更新权限
    const permissionIdsToAssign = permission_ids || permissions;
    if (permissionIdsToAssign !== undefined) {
      // 删除旧的权限分配
      await RolePermission.destroy({ where: { role_id: id } });

      // 创建新的权限分配
      if (permissionIdsToAssign.length > 0) {
        const rolePermissions = permissionIdsToAssign.map(permission_id => ({
          role_id: parseInt(id),
          permission_id,
          creator_id: req.user.id
        }));
        await RolePermission.bulkCreate(rolePermissions);
      }
    }

    // 重新查询角色（包含权限）
    const updatedRole = await Role.findByPk(id, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ]
    });

    return success(res, updatedRole, '更新成功');
  } catch (err) {
    console.error('更新角色错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '更新失败', 500);
  }
};

// 删除角色
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);
    if (!role) {
      return error(res, '角色不存在', 404);
    }

    // 检查是否是系统内置角色
    if (role.is_system === 1) {
      return error(res, '系统内置角色不能删除', 400);
    }

    // 检查是否有用户使用该角色
    const userCount = await UserRole.count({ where: { role_id: id } });
    if (userCount > 0) {
      return error(res, `该角色下还有${userCount}个用户，无法删除`, 400);
    }

    // 删除角色权限关联
    await RolePermission.destroy({ where: { role_id: id } });

    // 删除角色
    await role.destroy();

    return success(res, null, '删除成功');
  } catch (err) {
    console.error('删除角色错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '删除失败', 500);
  }
};

// 配置角色权限
exports.assignRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permission_ids, permissions } = req.body;
    const permissionIdsToAssign = permission_ids || permissions || [];

    const role = await Role.findByPk(id);
    if (!role) {
      return error(res, '角色不存在', 404);
    }

    // 删除旧的权限分配
    await RolePermission.destroy({ where: { role_id: id } });

    // 创建新的权限分配
    if (permissionIdsToAssign.length > 0) {
      const rolePermissions = permissionIdsToAssign.map(permission_id => ({
        role_id: parseInt(id),
        permission_id,
        creator_id: req.user.id
      }));
      await RolePermission.bulkCreate(rolePermissions);
    }

    // 返回更新后的角色（包含权限）
    const updatedRole = await Role.findByPk(id, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ]
    });

    return success(res, updatedRole, '权限配置成功');
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
