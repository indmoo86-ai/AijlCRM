/**
 * 权限指令 v-permission
 * 用于控制页面元素的显示/隐藏
 *
 * 使用方式：
 * v-permission="'lead:create'"  - 单个权限
 * v-permission="['lead:create', 'lead:edit']"  - 多个权限（任一满足）
 * v-permission.all="['lead:create', 'lead:edit']"  - 多个权限（全部满足）
 */

import { useUserStore } from '@/stores/user'

/**
 * 检查用户是否拥有指定权限
 * @param {string|string[]} permissions 权限码或权限码数组
 * @param {boolean} requireAll 是否需要全部权限
 * @returns {boolean}
 */
function hasPermission(permissions, requireAll = false) {
  const userStore = useUserStore()

  // 管理员拥有所有权限
  if (userStore.isAdmin) {
    return true
  }

  if (!permissions) {
    return true
  }

  const userPermissions = userStore.permissions || []

  if (typeof permissions === 'string') {
    return userPermissions.includes(permissions)
  }

  if (Array.isArray(permissions)) {
    if (requireAll) {
      // 需要全部权限
      return permissions.every(p => userPermissions.includes(p))
    } else {
      // 任一权限满足即可
      return permissions.some(p => userPermissions.includes(p))
    }
  }

  return false
}

/**
 * 权限指令
 */
const permissionDirective = {
  mounted(el, binding) {
    const { value, modifiers } = binding
    const requireAll = modifiers.all === true

    if (!hasPermission(value, requireAll)) {
      // 没有权限，移除元素
      el.parentNode && el.parentNode.removeChild(el)
    }
  },

  updated(el, binding) {
    const { value, modifiers } = binding
    const requireAll = modifiers.all === true

    if (!hasPermission(value, requireAll)) {
      el.style.display = 'none'
    } else {
      el.style.display = ''
    }
  }
}

/**
 * 注册权限指令
 * @param {App} app Vue应用实例
 */
export function setupPermissionDirective(app) {
  app.directive('permission', permissionDirective)
}

/**
 * 权限检查函数（用于在JS中检查权限）
 */
export { hasPermission }

export default permissionDirective
