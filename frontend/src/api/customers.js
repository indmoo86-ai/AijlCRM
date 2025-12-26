import request from '@/utils/request'

/**
 * 获取客户列表
 */
export function getCustomerList(params) {
  return request({
    url: '/customers',
    method: 'get',
    params
  })
}

/**
 * 获取客户详情
 */
export function getCustomerDetail(id) {
  return request({
    url: `/customers/${id}`,
    method: 'get'
  })
}

/**
 * 创建客户
 */
export function createCustomer(data) {
  return request({
    url: '/customers',
    method: 'post',
    data
  })
}

/**
 * 更新客户
 */
export function updateCustomer(id, data) {
  return request({
    url: `/customers/${id}`,
    method: 'put',
    data
  })
}

/**
 * 添加客户联系人
 */
export function addCustomerContact(id, data) {
  return request({
    url: `/customers/${id}/contacts`,
    method: 'post',
    data
  })
}

/**
 * 推进客户阶段
 */
export function advanceCustomerStage(id, data) {
  return request({
    url: `/customers/${id}/stage`,
    method: 'put',
    data
  })
}
