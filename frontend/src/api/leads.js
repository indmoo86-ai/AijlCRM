import request from '@/utils/request'

/**
 * 获取线索列表
 */
export function getLeadList(params) {
  return request({
    url: '/leads',
    method: 'get',
    params
  })
}

/**
 * 获取线索详情
 */
export function getLeadDetail(id) {
  return request({
    url: `/leads/${id}`,
    method: 'get'
  })
}

/**
 * 创建线索
 */
export function createLead(data) {
  return request({
    url: '/leads',
    method: 'post',
    data
  })
}

/**
 * 更新线索
 */
export function updateLead(id, data) {
  return request({
    url: `/leads/${id}`,
    method: 'put',
    data
  })
}

/**
 * 添加跟进记录
 */
export function addFollowUp(id, data) {
  return request({
    url: `/leads/${id}/follow-up`,
    method: 'post',
    data
  })
}

/**
 * 线索转客户
 */
export function convertToCustomer(id, data) {
  return request({
    url: `/leads/${id}/convert`,
    method: 'post',
    data
  })
}

/**
 * 获取线索统计
 */
export function getLeadStatistics() {
  return request({
    url: '/leads/statistics',
    method: 'get'
  })
}

/**
 * 删除线索
 */
export function deleteLead(id) {
  return request({
    url: `/leads/${id}`,
    method: 'delete'
  })
}
