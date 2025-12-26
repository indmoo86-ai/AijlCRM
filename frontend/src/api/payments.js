import request from '@/utils/request'

/**
 * 获取收款记录列表
 */
export function getPaymentList(params) {
  return request({
    url: '/payments',
    method: 'get',
    params
  })
}

/**
 * 获取收款记录详情
 */
export function getPaymentDetail(id) {
  return request({
    url: `/payments/${id}`,
    method: 'get'
  })
}

/**
 * 创建收款记录
 */
export function createPayment(data) {
  return request({
    url: '/payments',
    method: 'post',
    data
  })
}

/**
 * 更新收款记录
 */
export function updatePayment(id, data) {
  return request({
    url: `/payments/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除收款记录
 */
export function deletePayment(id) {
  return request({
    url: `/payments/${id}`,
    method: 'delete'
  })
}

/**
 * 确认收款
 */
export function confirmPayment(id) {
  return request({
    url: `/payments/${id}/confirm`,
    method: 'post'
  })
}

/**
 * 作废收款
 */
export function voidPayment(id, data) {
  return request({
    url: `/payments/${id}/void`,
    method: 'post',
    data
  })
}
