import request from '@/utils/request'

/**
 * 获取工作台统计数据
 */
export function getDashboardStats() {
  return request({
    url: '/dashboard/stats',
    method: 'get'
  })
}

/**
 * 获取销售漏斗数据
 */
export function getSalesFunnel() {
  return request({
    url: '/dashboard/sales-funnel',
    method: 'get'
  })
}

/**
 * 获取业绩趋势数据
 */
export function getPerformanceTrend(params) {
  return request({
    url: '/dashboard/performance-trend',
    method: 'get',
    params
  })
}

/**
 * 获取最近动态
 */
export function getRecentActivities(params) {
  return request({
    url: '/dashboard/recent-activities',
    method: 'get',
    params
  })
}

/**
 * 获取任务统计（按状态分布）
 */
export function getTaskStats() {
  return request({
    url: '/dashboard/task-stats',
    method: 'get'
  })
}

/**
 * 获取客户类型分布
 */
export function getCustomerTypeStats() {
  return request({
    url: '/dashboard/customer-type-stats',
    method: 'get'
  })
}

/**
 * 获取产品销售排行
 */
export function getProductSalesRank(params) {
  return request({
    url: '/dashboard/product-sales-rank',
    method: 'get',
    params
  })
}

/**
 * 获取待办任务列表
 */
export function getTodoTasks(params) {
  return request({
    url: '/dashboard/todo-tasks',
    method: 'get',
    params
  })
}

/**
 * 获取月度业绩趋势
 */
export function getMonthlyTrend(params) {
  return request({
    url: '/dashboard/monthly-trend',
    method: 'get',
    params
  })
}
