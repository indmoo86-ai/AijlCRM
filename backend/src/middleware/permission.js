/**
 * 权限检查中间件
 */
const { User, Role, Permission, UserRole, RolePermission } = require('../models');

// 权限缓存（简单的内存缓存，生产环境可用Redis）
const permissionCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

/**
 * 检查用户是否拥有指定权限
 * @param {string} requiredPermission 需要的权限码
 */
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未登录'
        });
      }

      // 获取用户信息
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 管理员（role=6）拥有所有权限
      if (user.role === 6) {
        return next();
      }

      // 从缓存获取权限
      const cacheKey = `user_permissions_${userId}`;
      let userPermissions = permissionCache.get(cacheKey);

      if (!userPermissions || Date.now() > userPermissions.expiry) {
        // 查询用户的所有权限
        const permissions = await getUserPermissions(userId);
        userPermissions = {
          data: permissions,
          expiry: Date.now() + CACHE_TTL
        };
        permissionCache.set(cacheKey, userPermissions);
      }

      // 检查是否有所需权限
      if (userPermissions.data.includes(requiredPermission)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: '权限不足',
        required: requiredPermission
      });
    } catch (err) {
      console.error('权限检查错误:', err);
      return res.status(500).json({
        success: false,
        message: '权限检查失败'
      });
    }
  };
};

/**
 * 检查用户是否拥有多个权限中的任意一个
 * @param {string[]} permissions 权限码数组
 */
const checkAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未登录'
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 管理员拥有所有权限
      if (user.role === 6) {
        return next();
      }

      // 获取用户权限
      const cacheKey = `user_permissions_${userId}`;
      let userPermissions = permissionCache.get(cacheKey);

      if (!userPermissions || Date.now() > userPermissions.expiry) {
        const perms = await getUserPermissions(userId);
        userPermissions = {
          data: perms,
          expiry: Date.now() + CACHE_TTL
        };
        permissionCache.set(cacheKey, userPermissions);
      }

      // 检查是否有任意一个所需权限
      const hasPermission = permissions.some(p => userPermissions.data.includes(p));
      if (hasPermission) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: '权限不足',
        required: permissions
      });
    } catch (err) {
      console.error('权限检查错误:', err);
      return res.status(500).json({
        success: false,
        message: '权限检查失败'
      });
    }
  };
};

/**
 * 检查用户是否拥有所有指定权限
 * @param {string[]} permissions 权限码数组
 */
const checkAllPermissions = (permissions) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未登录'
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 管理员拥有所有权限
      if (user.role === 6) {
        return next();
      }

      // 获取用户权限
      const cacheKey = `user_permissions_${userId}`;
      let userPermissions = permissionCache.get(cacheKey);

      if (!userPermissions || Date.now() > userPermissions.expiry) {
        const perms = await getUserPermissions(userId);
        userPermissions = {
          data: perms,
          expiry: Date.now() + CACHE_TTL
        };
        permissionCache.set(cacheKey, userPermissions);
      }

      // 检查是否拥有所有所需权限
      const hasAllPermissions = permissions.every(p => userPermissions.data.includes(p));
      if (hasAllPermissions) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: '权限不足',
        required: permissions
      });
    } catch (err) {
      console.error('权限检查错误:', err);
      return res.status(500).json({
        success: false,
        message: '权限检查失败'
      });
    }
  };
};

/**
 * 获取用户的所有权限码
 * @param {number} userId 用户ID
 * @returns {Promise<string[]>} 权限码数组
 */
async function getUserPermissions(userId) {
  // 查询用户的所有角色
  const userRoles = await UserRole.findAll({
    where: { user_id: userId },
    attributes: ['role_id']
  });

  if (userRoles.length === 0) {
    return [];
  }

  const roleIds = userRoles.map(ur => ur.role_id);

  // 查询角色的所有权限
  const rolePermissions = await RolePermission.findAll({
    where: { role_id: roleIds },
    include: [
      {
        model: Permission,
        as: 'permission',
        attributes: ['permission_code']
      }
    ]
  });

  // 提取权限码（去重）
  const permissionSet = new Set();
  rolePermissions.forEach(rp => {
    if (rp.permission && rp.permission.permission_code) {
      permissionSet.add(rp.permission.permission_code);
    }
  });

  return Array.from(permissionSet);
}

/**
 * 清除用户权限缓存
 * @param {number} userId 用户ID，不传则清除所有缓存
 */
function clearPermissionCache(userId) {
  if (userId) {
    permissionCache.delete(`user_permissions_${userId}`);
  } else {
    permissionCache.clear();
  }
}

module.exports = {
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  getUserPermissions,
  clearPermissionCache
};
