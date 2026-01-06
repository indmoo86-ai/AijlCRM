/**
 * 用户管理控制器 - UserController
 */
const { User, UserRole, Role, Permission, RolePermission } = require('../models');
const { success, error, paginate } = require('../utils/response');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// 获取用户列表
exports.getUserList = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, status, keyword, role_id } = req.query;

    const where = {};
    if (status !== undefined && status !== '') {
      where.status = parseInt(status);
    }
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } },
        { username: { [Op.like]: `%${keyword}%` } }
      ];
    }

    // 如果指定了角色筛选
    let userIds = null;
    if (role_id) {
      const userRoles = await UserRole.findAll({
        where: { role_id: parseInt(role_id) },
        attributes: ['user_id']
      });
      userIds = userRoles.map(ur => ur.user_id);
      where.id = { [Op.in]: userIds };
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          attributes: ['role_id', 'role_code', 'role_name']
        }
      ],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      order: [['created_at', 'DESC']],
      distinct: true
    });

    // 格式化返回数据
    const list = rows.map(user => {
      const userData = user.toJSON();
      return {
        ...userData,
        user_id: userData.id,
        full_name: userData.name,
        roleList: userData.roles || [],
        role: userData.roles && userData.roles.length > 0 ? userData.roles[0].role_code : null
      };
    });

    return paginate(res, list, page, pageSize, count);
  } catch (err) {
    console.error('查询用户列表错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '查询失败', 500);
  }
};

// 获取用户详情
exports.getUserDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] },
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    if (!user) {
      return error(res, '用户不存在', 404);
    }

    const userData = user.toJSON();
    userData.user_id = userData.id;
    userData.full_name = userData.name;

    return success(res, userData, '获取成功');
  } catch (err) {
    console.error('获取用户详情错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '获取失败', 500);
  }
};

// 创建用户
exports.createUser = async (req, res) => {
  try {
    // 参数命名兼容性处理（支持驼峰和下划线）
    const username = req.body.username;
    const name = req.body.full_name || req.body.name || req.body.fullName;
    const phone = req.body.phone;
    const email = req.body.email;
    const password = req.body.password;
    const department = req.body.department;
    const status = req.body.status !== undefined ? (req.body.status === 'active' ? 1 : parseInt(req.body.status)) : 1;
    const role_ids = req.body.role_ids || req.body.roleIds || [];
    const role = req.body.role; // 单个角色（兼容旧版本）

    // 验证用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return error(res, '用户名已存在', 400);
    }

    // 验证密码
    if (!password || password.length < 6) {
      return error(res, '密码长度至少6位', 400);
    }

    const user = await User.create({
      username,
      name,
      phone,
      email,
      password,
      department,
      status,
      role: 1 // 默认角色值
    });

    // 分配角色
    let roleIdsToAssign = [];
    if (role_ids && role_ids.length > 0) {
      roleIdsToAssign = role_ids;
    } else if (role) {
      // 如果只提供了单个角色code，查找对应的role_id
      const roleRecord = await Role.findOne({ where: { role_code: role } });
      if (roleRecord) {
        roleIdsToAssign = [roleRecord.role_id];
      }
    }

    if (roleIdsToAssign.length > 0) {
      const userRoles = roleIdsToAssign.map(role_id => ({
        user_id: user.id,
        role_id,
        creator_id: req.user.id
      }));
      await UserRole.bulkCreate(userRoles);
    }

    // 响应格式标准化（包含主键ID + 完整数据）
    const responseData = {
      userId: user.id,
      user_id: user.id,
      ...user.toJSON()
    };
    delete responseData.password;

    return success(res, responseData, '用户创建成功', 201);
  } catch (err) {
    console.error('创建用户错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '创建失败: ' + err.message, 500);
  }
};

// 更新用户信息
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return error(res, '用户不存在', 404);
    }

    // 参数处理
    const updateData = {};
    if (req.body.full_name !== undefined || req.body.name !== undefined) {
      updateData.name = req.body.full_name || req.body.name;
    }
    if (req.body.phone !== undefined) updateData.phone = req.body.phone;
    if (req.body.email !== undefined) updateData.email = req.body.email;
    if (req.body.department !== undefined) updateData.department = req.body.department;
    if (req.body.avatar !== undefined) updateData.avatar = req.body.avatar;
    if (req.body.status !== undefined) {
      updateData.status = req.body.status === 'active' ? 1 : (req.body.status === 'inactive' ? 0 : parseInt(req.body.status));
    }

    await user.update(updateData);

    // 更新角色
    const role_ids = req.body.role_ids || req.body.roleIds;
    const role = req.body.role;

    if (role_ids !== undefined || role !== undefined) {
      // 删除旧的角色分配
      await UserRole.destroy({ where: { user_id: id } });

      let roleIdsToAssign = [];
      if (role_ids && role_ids.length > 0) {
        roleIdsToAssign = role_ids;
      } else if (role) {
        const roleRecord = await Role.findOne({ where: { role_code: role } });
        if (roleRecord) {
          roleIdsToAssign = [roleRecord.role_id];
        }
      }

      if (roleIdsToAssign.length > 0) {
        const userRoles = roleIdsToAssign.map(role_id => ({
          user_id: parseInt(id),
          role_id,
          creator_id: req.user.id
        }));
        await UserRole.bulkCreate(userRoles);
      }
    }

    // 重新查询用户（包含角色）
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] }
        }
      ]
    });

    return success(res, updatedUser, '更新成功');
  } catch (err) {
    console.error('更新用户错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '更新失败', 500);
  }
};

// 删除用户
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // 不能删除自己
    if (parseInt(id) === req.user.id) {
      return error(res, '不能删除当前登录用户', 400);
    }

    const user = await User.findByPk(id);
    if (!user) {
      return error(res, '用户不存在', 404);
    }

    // 删除用户角色关联
    await UserRole.destroy({ where: { user_id: id } });

    // 删除用户
    await user.destroy();

    return success(res, null, '删除成功');
  } catch (err) {
    console.error('删除用户错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '删除失败', 500);
  }
};

// 重置密码
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password, newPassword } = req.body;
    const password = new_password || newPassword;

    if (!password || password.length < 6) {
      return error(res, '密码长度至少6位', 400);
    }

    const user = await User.findByPk(id);
    if (!user) {
      return error(res, '用户不存在', 404);
    }

    // 更新密码（User模型的beforeUpdate会自动加密）
    await user.update({ password });

    return success(res, null, '密码重置成功');
  } catch (err) {
    console.error('重置密码错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '重置失败', 500);
  }
};

// 启用/禁用用户
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, is_active } = req.body;

    // 不能禁用自己
    if (parseInt(id) === req.user.id) {
      return error(res, '不能禁用当前登录用户', 400);
    }

    const user = await User.findByPk(id);
    if (!user) {
      return error(res, '用户不存在', 404);
    }

    let newStatus;
    if (status !== undefined) {
      newStatus = status === 'active' ? 1 : (status === 'inactive' ? 0 : parseInt(status));
    } else if (is_active !== undefined) {
      newStatus = is_active ? 1 : 0;
    } else {
      return error(res, '请提供状态参数', 400);
    }

    await user.update({ status: newStatus });
    return success(res, user, '状态更新成功');
  } catch (err) {
    console.error('更新用户状态错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '操作失败', 500);
  }
};

// 分配用户角色
exports.assignUserRoles = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_ids, roleIds } = req.body;
    const roleIdsToAssign = role_ids || roleIds || [];

    const user = await User.findByPk(id);
    if (!user) {
      return error(res, '用户不存在', 404);
    }

    // 删除旧的角色分配
    await UserRole.destroy({ where: { user_id: id } });

    // 创建新的角色分配
    if (roleIdsToAssign.length > 0) {
      const userRoles = roleIdsToAssign.map(role_id => ({
        user_id: parseInt(id),
        role_id,
        creator_id: req.user.id
      }));
      await UserRole.bulkCreate(userRoles);
    }

    // 查询更新后的用户信息
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] }
        }
      ]
    });

    return success(res, updatedUser, '角色分配成功');
  } catch (err) {
    console.error('分配角色错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '操作失败', 500);
  }
};

// 获取用户权限列表
exports.getUserPermissions = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          as: 'roles',
          include: [
            {
              model: Permission,
              as: 'permissions',
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    if (!user) {
      return error(res, '用户不存在', 404);
    }

    // 检查是否是管理员（role=6）
    if (user.role === 6) {
      // 管理员拥有所有权限
      const allPermissions = await Permission.findAll();
      return success(res, {
        isAdmin: true,
        permissions: allPermissions.map(p => p.permission_code)
      }, '获取成功');
    }

    // 提取所有权限码
    const permissionSet = new Set();
    user.roles.forEach(role => {
      role.permissions.forEach(permission => {
        permissionSet.add(permission.permission_code);
      });
    });

    return success(res, {
      isAdmin: false,
      permissions: Array.from(permissionSet)
    }, '获取成功');
  } catch (err) {
    console.error('获取用户权限错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '获取失败', 500);
  }
};
