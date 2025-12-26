/**
 * 用户管理控制器 - UserController
 */
const { User, UserRole, Role } = require('../models');
const { success, error, paginate } = require('../utils/response');
const { Op } = require('sequelize');

// 获取用户列表
exports.getUserList = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, is_active, keyword } = req.query;

    const where = {};
    if (is_active !== undefined) where.is_active = is_active;
    if (keyword) {
      where[Op.or] = [
        { real_name: { [Op.like]: `%${keyword}%` } },
        { mobile: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash'] },
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      order: [['created_at', 'DESC']]
    });

    return paginate(res, rows, page, pageSize, count);
  } catch (err) {
    console.error('查询用户列表错误:', err);
    return error(res, '查询失败', 500);
  }
};

// 创建用户
exports.createUser = async (req, res) => {
  try {
    const { user_code, real_name, mobile, email, password, role_ids } = req.body;

    const user = await User.create({
      user_code,
      real_name,
      mobile,
      email,
      password_hash: password, // 会被User模型的beforeCreate hook自动hash
      creator_id: req.user.id
    });

    // 分配角色
    if (role_ids && role_ids.length > 0) {
      const userRoles = role_ids.map(role_id => ({
        user_id: user.user_id,
        role_id,
        creator_id: req.user.id
      }));
      await UserRole.bulkCreate(userRoles);
    }

    return success(res, user, '用户创建成功', 201);
  } catch (err) {
    console.error('创建用户错误:', err);
    return error(res, '创建失败', 500);
  }
};

// 修改用户信息
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return error(res, '用户不存在', 404);
    }

    await user.update(req.body);
    return success(res, user, '更新成功');
  } catch (err) {
    console.error('更新用户错误:', err);
    return error(res, '更新失败', 500);
  }
};

// 启用/禁用用户
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, reason } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return error(res, '用户不存在', 404);
    }

    await user.update({ is_active });
    return success(res, user, '状态更新成功');
  } catch (err) {
    console.error('更新用户状态错误:', err);
    return error(res, '操作失败', 500);
  }
};

// 分配用户角色
exports.assignUserRoles = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_ids } = req.body;

    // 删除旧的角色分配
    await UserRole.destroy({ where: { user_id: id } });

    // 创建新的角色分配
    if (role_ids && role_ids.length > 0) {
      const userRoles = role_ids.map(role_id => ({
        user_id: id,
        role_id,
        creator_id: req.user.id
      }));
      await UserRole.bulkCreate(userRoles);
    }

    return success(res, null, '角色分配成功');
  } catch (err) {
    console.error('分配角色错误:', err);
    return error(res, '操作失败', 500);
  }
};
