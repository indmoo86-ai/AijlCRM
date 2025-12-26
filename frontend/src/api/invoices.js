import request from '@/utils/request'

export function getInvoiceList(params) {
  return request({
    url: '/invoices',
    method: 'get',
    params
  })
}

export function getInvoiceDetail(id) {
  return request({
    url: `/invoices/${id}`,
    method: 'get'
  })
}

export function createInvoice(data) {
  return request({
    url: '/invoices',
    method: 'post',
    data
  })
}

export function updateInvoice(id, data) {
  return request({
    url: `/invoices/${id}`,
    method: 'put',
    data
  })
}

export function deleteInvoice(id) {
  return request({
    url: `/invoices/${id}`,
    method: 'delete'
  })
}

export function confirmInvoice(id) {
  return request({
    url: `/invoices/${id}/confirm`,
    method: 'post'
  })
}
