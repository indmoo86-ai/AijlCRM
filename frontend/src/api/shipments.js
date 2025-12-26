import request from '@/utils/request'

/**
 * 获取发货单列表
 */
export function getShipmentList(params) {
  return request({
    url: '/shipments',
    method: 'get',
    params
  })
}

/**
 * 获取发货单详情
 */
export function getShipmentDetail(id) {
  return request({
    url: `/shipments/${id}`,
    method: 'get'
  })
}

/**
 * 创建发货单
 */
export function createShipment(data) {
  return request({
    url: '/shipments',
    method: 'post',
    data
  })
}

/**
 * 更新发货单
 */
export function updateShipment(id, data) {
  return request({
    url: `/shipments/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除发货单
 */
export function deleteShipment(id) {
  return request({
    url: `/shipments/${id}`,
    method: 'delete'
  })
}

/**
 * 确认发货
 */
export function confirmShipment(id, data) {
  return request({
    url: `/shipments/${id}/confirm`,
    method: 'post',
    data
  })
}

/**
 * 完成发货
 */
export function completeShipment(id) {
  return request({
    url: `/shipments/${id}/complete`,
    method: 'post'
  })
}
