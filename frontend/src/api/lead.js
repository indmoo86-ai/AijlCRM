import request from '@/utils/request'

// 获取线索列表
export function getLeadList(params) {
  return request({
    url: '/leads',
    method: 'get',
    params
  })
}

// 创建线索
export function createLead(data) {
  return request({
    url: '/leads',
    method: 'post',
    data
  })
}

// 获取线索详情
export function getLeadDetail(id) {
  return request({
    url: `/leads/${id}`,
    method: 'get'
  })
}

// 更新线索
export function updateLead(id, data) {
  return request({
    url: `/leads/${id}`,
    method: 'put',
    data
  })
}

// 添加跟进记录
export function addFollowUp(id, data) {
  return request({
    url: `/leads/${id}/follow-up`,
    method: 'post',
    data
  })
}

// 线索转客户
export function convertToCustomer(id, data) {
  return request({
    url: `/leads/${id}/convert`,
    method: 'post',
    data
  })
}

// 分配线索
export function assignLead(id, data) {
  return request({
    url: `/leads/${id}/assign`,
    method: 'put',
    data
  })
}

// 放弃线索
export function abandonLead(id, data) {
  return request({
    url: `/leads/${id}/abandon`,
    method: 'put',
    data
  })
}
