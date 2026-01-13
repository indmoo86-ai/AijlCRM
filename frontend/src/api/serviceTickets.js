import request from '@/utils/request'

// 获取售后工单列表
export function getServiceTicketList(params) {
  return request({
    url: '/service-tickets',
    method: 'get',
    params
  })
}

// 获取售后工单详情
export function getServiceTicketDetail(id) {
  return request({
    url: `/service-tickets/${id}`,
    method: 'get'
  })
}

// 创建售后工单
export function createServiceTicket(data) {
  return request({
    url: '/service-tickets',
    method: 'post',
    data
  })
}

// 更新售后工单
export function updateServiceTicket(id, data) {
  return request({
    url: `/service-tickets/${id}`,
    method: 'put',
    data
  })
}

// 分配工单
export function assignServiceTicket(id, data) {
  return request({
    url: `/service-tickets/${id}/assign`,
    method: 'put',
    data
  })
}

// 解决工单
export function resolveServiceTicket(id, data) {
  return request({
    url: `/service-tickets/${id}/resolve`,
    method: 'put',
    data
  })
}

// 关闭工单
export function closeServiceTicket(id, data) {
  return request({
    url: `/service-tickets/${id}/close`,
    method: 'put',
    data
  })
}

// 添加工单日志
export function addServiceTicketLog(id, data) {
  return request({
    url: `/service-tickets/${id}/logs`,
    method: 'post',
    data
  })
}

// 客户评价
export function rateServiceTicket(id, data) {
  return request({
    url: `/service-tickets/${id}/rate`,
    method: 'put',
    data
  })
}
