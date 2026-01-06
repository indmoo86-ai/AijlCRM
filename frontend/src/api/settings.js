import request from '@/utils/request'

// =====================================================
// 用户管理 API
// =====================================================

/**
 * 获取用户列表
 */
export function getUserList(params) {
  return request({
    url: '/settings/users',
    method: 'get',
    params
  })
}

/**
 * 获取用户详情
 */
export function getUserDetail(id) {
  return request({
    url: `/settings/users/${id}`,
    method: 'get'
  })
}

/**
 * 创建用户
 */
export function createUser(data) {
  return request({
    url: '/settings/users',
    method: 'post',
    data
  })
}

/**
 * 更新用户
 */
export function updateUser(id, data) {
  return request({
    url: `/settings/users/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除用户
 */
export function deleteUser(id) {
  return request({
    url: `/settings/users/${id}`,
    method: 'delete'
  })
}

/**
 * 重置用户密码
 */
export function resetUserPassword(id, data) {
  return request({
    url: `/settings/users/${id}/reset-password`,
    method: 'post',
    data
  })
}

/**
 * 更新用户状态
 */
export function updateUserStatus(id, data) {
  return request({
    url: `/settings/users/${id}/status`,
    method: 'put',
    data
  })
}

/**
 * 分配用户角色
 */
export function assignUserRoles(id, data) {
  return request({
    url: `/settings/users/${id}/roles`,
    method: 'put',
    data
  })
}

// =====================================================
// 角色管理 API
// =====================================================

/**
 * 获取角色列表
 */
export function getRoleList(params) {
  return request({
    url: '/settings/roles',
    method: 'get',
    params
  })
}

/**
 * 获取角色详情
 */
export function getRoleDetail(id) {
  return request({
    url: `/settings/roles/${id}`,
    method: 'get'
  })
}

/**
 * 创建角色
 */
export function createRole(data) {
  return request({
    url: '/settings/roles',
    method: 'post',
    data
  })
}

/**
 * 更新角色
 */
export function updateRole(id, data) {
  return request({
    url: `/settings/roles/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除角色
 */
export function deleteRole(id) {
  return request({
    url: `/settings/roles/${id}`,
    method: 'delete'
  })
}

/**
 * 配置角色权限
 */
export function assignRolePermissions(id, data) {
  return request({
    url: `/settings/roles/${id}/permissions`,
    method: 'put',
    data
  })
}

// =====================================================
// 权限管理 API
// =====================================================

/**
 * 获取权限树（用于角色权限配置）
 */
export function getPermissionTree() {
  return request({
    url: '/settings/permissions',
    method: 'get'
  })
}

/**
 * 获取权限列表（平铺）
 */
export function getPermissionList() {
  return request({
    url: '/settings/permissions/flat',
    method: 'get'
  })
}

// =====================================================
// 系统参数 API
// =====================================================

/**
 * 获取系统参数
 */
export function getSystemParams() {
  return request({
    url: '/settings/system-params',
    method: 'get'
  })
}

/**
 * 更新系统参数
 */
export function updateSystemParams(data) {
  return request({
    url: '/settings/system-params',
    method: 'put',
    data
  })
}

/**
 * 获取系统日志
 */
export function getSystemLogs(params) {
  return request({
    url: '/settings/logs',
    method: 'get',
    params
  })
}
