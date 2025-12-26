const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { success, error } = require('../utils/response');

// 登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证输入
    if (!username || !password) {
      return error(res, '请输入用户名和密码', 400);
    }

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return error(res, '用户名或密码错误', 401);
    }

    // 检查用户状态
    if (user.status !== 1) {
      return error(res, '账号已被禁用', 403);
    }

    // 验证密码
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return error(res, '用户名或密码错误', 401);
    }

    // 更新最后登录时间
    await user.update({ lastLoginTime: new Date() });

    // 生成JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return success(res, {
      token,
      user: user.toJSON()
    }, '登录成功');

  } catch (err) {
    console.error('登录错误:', err);
    return error(res, '登录失败', 500);
  }
};

// 获取当前用户信息
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return error(res, '用户不存在', 404);
    }

    return success(res, user.toJSON(), '获取成功');

  } catch (err) {
    console.error('获取用户信息错误:', err);
    return error(res, '获取失败', 500);
  }
};

// 修改密码
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return error(res, '请输入旧密码和新密码', 400);
    }

    if (newPassword.length < 6) {
      return error(res, '新密码长度至少6位', 400);
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return error(res, '用户不存在', 404);
    }

    // 验证旧密码
    const isValid = await user.validatePassword(oldPassword);
    if (!isValid) {
      return error(res, '旧密码错误', 400);
    }

    // 更新密码
    await user.update({ password: newPassword });

    return success(res, null, '密码修改成功');

  } catch (err) {
    console.error('修改密码错误:', err);
    return error(res, '修改失败', 500);
  }
};

// 登出（前端清除token即可，这里只是示例）
exports.logout = async (req, res) => {
  return success(res, null, '登出成功');
};
