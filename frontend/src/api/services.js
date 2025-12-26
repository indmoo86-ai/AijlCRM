import request from '@/utils/request'

export function getServiceTicketList(params) {
  return request({
    url: '/service-tickets',
    method: 'get',
    params
  })
}

export function getServiceTicketDetail(id) {
  return request({
    url: `/service-tickets/${id}`,
    method: 'get'
  })
}

export function createServiceTicket(data) {
  return request({
    url: '/service-tickets',
    method: 'post',
    data
  })
}

export function updateServiceTicket(id, data) {
  return request({
    url: `/service-tickets/${id}`,
    method: 'put',
    data
  })
}

export function deleteServiceTicket(id) {
  return request({
    url: `/service-tickets/${id}`,
    method: 'delete'
  })
}

export function assignServiceTicket(id, data) {
  return request({
    url: `/service-tickets/${id}/assign`,
    method: 'post',
    data
  })
}

export function closeServiceTicket(id, data) {
  return request({
    url: `/service-tickets/${id}/close`,
    method: 'post',
    data
  })
}
