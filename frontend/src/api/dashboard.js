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
