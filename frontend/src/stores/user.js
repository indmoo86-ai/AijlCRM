import { defineStore } from 'pinia'
import { login as loginApi, getUserInfo } from '@/api/auth'
import request from '@/utils/request'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    permissions: JSON.parse(localStorage.getItem('permissions') || '[]'),
    isAdmin: localStorage.getItem('isAdmin') === 'true'
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    userName: (state) => state.user?.name || '',
    userRole: (state) => state.user?.role || 0,

    /**
     * 检查用户是否拥有指定权限
     * @param {string|string[]} permission 权限码或权限码数组
     * @returns {boolean}
     */
    hasPermission: (state) => (permission) => {
      // 管理员拥有所有权限
      if (state.isAdmin) {
        return true
      }

      if (!permission) {
        return true
      }

      if (typeof permission === 'string') {
        return state.permissions.includes(permission)
      }

      if (Array.isArray(permission)) {
        return permission.some(p => state.permissions.includes(p))
      }

      return false
    },

    /**
     * 检查用户是否拥有所有指定权限
     * @param {string[]} permissions 权限码数组
     * @returns {boolean}
     */
    hasAllPermissions: (state) => (permissions) => {
      // 管理员拥有所有权限
      if (state.isAdmin) {
        return true
      }

      if (!permissions || permissions.length === 0) {
        return true
      }

      return permissions.every(p => state.permissions.includes(p))
    }
  },

  actions: {
    // 用户登录
    async login(loginForm) {
      try {
        const res = await loginApi(loginForm)
        const { token, user } = res.data

        this.token = token
        this.user = user

        // 保存到 localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))

        // 登录后加载用户权限
        await this.fetchUserPermissions()

        return res
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 退出登录
    logout() {
      this.token = ''
      this.user = null
      this.permissions = []
      this.isAdmin = false

      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('permissions')
      localStorage.removeItem('isAdmin')
    },

    // 获取用户信息
    async fetchUserInfo() {
      try {
        const res = await getUserInfo()
        this.user = res.data
        localStorage.setItem('user', JSON.stringify(res.data))
        return res
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 获取用户权限列表
    async fetchUserPermissions() {
      try {
        const res = await request({
          url: '/auth/permissions',
          method: 'get'
        })

        const { isAdmin, permissions } = res.data || {}

        this.isAdmin = isAdmin || false
        this.permissions = permissions || []

        // 保存到 localStorage
        localStorage.setItem('isAdmin', this.isAdmin.toString())
        localStorage.setItem('permissions', JSON.stringify(this.permissions))

        return res
      } catch (error) {
        console.error('获取用户权限失败:', error)
        // 权限获取失败时，设置默认值
        this.isAdmin = false
        this.permissions = []
        return Promise.reject(error)
      }
    },

    // 清除权限缓存
    clearPermissionCache() {
      this.permissions = []
      this.isAdmin = false
      localStorage.removeItem('permissions')
      localStorage.removeItem('isAdmin')
    }
  }
})
