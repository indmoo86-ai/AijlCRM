import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        meta: { title: '工作台', icon: 'DataAnalysis' }
      },
      {
        path: 'leads',
        name: 'Leads',
        component: () => import('@/views/leads/Index.vue'),
        meta: { title: '线索管理', icon: 'Opportunity' }
      },
      {
        path: 'leads/:id',
        name: 'LeadDetail',
        component: () => import('@/views/leads/Detail.vue'),
        meta: { title: '线索详情', hidden: true }
      },
      {
        path: 'customers',
        name: 'Customers',
        component: () => import('@/views/customers/Index.vue'),
        meta: { title: '客户管理', icon: 'User' }
      },
      {
        path: 'customers/:id',
        name: 'CustomerDetail',
        component: () => import('@/views/customers/Detail.vue'),
        meta: { title: '客户详情', hidden: true }
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/views/products/Index.vue'),
        meta: { title: '产品管理', icon: 'Box' }
      },
      {
        path: 'products/:id',
        name: 'ProductDetail',
        component: () => import('@/views/products/Detail.vue'),
        meta: { title: '产品详情', hidden: true }
      },
      {
        path: 'contract-parties',
        name: 'ContractParties',
        component: () => import('@/views/contract-parties/Index.vue'),
        meta: { title: '合同主体管理', icon: 'OfficeBuilding' }
      },
      {
        path: 'quotations',
        name: 'Quotations',
        component: () => import('@/views/quotations/Index.vue'),
        meta: { title: '报价管理', icon: 'Document' }
      },
      {
        path: 'quotations/:id',
        name: 'QuotationDetail',
        component: () => import('@/views/quotations/Detail.vue'),
        meta: { title: '报价详情', hidden: true }
      },
      {
        path: 'contracts',
        name: 'Contracts',
        component: () => import('@/views/contracts/Index.vue'),
        meta: { title: '合同管理', icon: 'Files' }
      },
      {
        path: 'contracts/:id',
        name: 'ContractDetail',
        component: () => import('@/views/contracts/Detail.vue'),
        meta: { title: '合同详情', hidden: true }
      },
      {
        path: 'shipments',
        name: 'Shipments',
        component: () => import('@/views/shipments/Index.vue'),
        meta: { title: '发货管理', icon: 'Van' }
      },
      {
        path: 'payments',
        name: 'Payments',
        component: () => import('@/views/payments/Index.vue'),
        meta: { title: '收款管理', icon: 'Money' }
      },
      {
        path: 'invoices',
        name: 'Invoices',
        component: () => import('@/views/invoices/Index.vue'),
        meta: { title: '发票管理', icon: 'Ticket' }
      },
      {
        path: 'service-tickets',
        name: 'ServiceTickets',
        component: () => import('@/views/services/Index.vue'),
        meta: { title: '售后管理', icon: 'Service' }
      },
      {
        path: 'tasks',
        name: 'Tasks',
        component: () => import('@/views/tasks/Index.vue'),
        meta: { title: '任务中心', icon: 'List' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/Index.vue'),
        meta: { title: '个人中心', icon: 'User', hidden: true }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/Index.vue'),
        meta: { title: '系统设置', icon: 'Setting' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 如果已登录且访问登录页，重定向到工作台
  if (to.path === '/login' && userStore.isLoggedIn) {
    next('/dashboard')
    return
  }

  // 如果未登录且访问需要认证的页面，重定向到登录页
  if (to.meta.requiresAuth !== false && !userStore.isLoggedIn) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
    return
  }

  next()
})

export default router
