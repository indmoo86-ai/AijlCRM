import { defineStore } from 'pinia'
import { login as loginApi, getUserInfo } from '@/api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    permissions: []
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    userName: (state) => state.user?.name || '',
    userRole: (state) => state.user?.role || 0
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
      
      localStorage.removeItem('token')
      localStorage.removeItem('user')
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
    }
  }
})
