import request from '@/utils/request'

/**
 * 获取报价单列表
 */
export function getQuotationList(params) {
  return request({
    url: '/quotations',
    method: 'get',
    params
  })
}

/**
 * 获取报价单详情
 */
export function getQuotationDetail(id) {
  return request({
    url: `/quotations/${id}`,
    method: 'get'
  })
}

/**
 * 创建报价单
 */
export function createQuotation(data) {
  return request({
    url: '/quotations',
    method: 'post',
    data
  })
}

/**
 * 更新报价单
 */
export function updateQuotation(id, data) {
  return request({
    url: `/quotations/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除报价单
 */
export function deleteQuotation(id) {
  return request({
    url: `/quotations/${id}`,
    method: 'delete'
  })
}

/**
 * 提交报价单
 */
export function submitQuotation(id) {
  return request({
    url: `/quotations/${id}/submit`,
    method: 'post'
  })
}

/**
 * 转合同
 */
export function convertToContract(id, data) {
  return request({
    url: `/quotations/${id}/convert-to-contract`,
    method: 'post',
    data
  })
}

/**
 * 获取报价单明细列表
 */
export function getQuotationItems(quotationId) {
  return request({
    url: `/quotations/${quotationId}/items`,
    method: 'get'
  })
}

/**
 * 添加报价单明细
 */
export function addQuotationItem(quotationId, data) {
  return request({
    url: `/quotations/${quotationId}/items`,
    method: 'post',
    data
  })
}

/**
 * 更新报价单明细
 */
export function updateQuotationItem(quotationId, itemId, data) {
  return request({
    url: `/quotations/${quotationId}/items/${itemId}`,
    method: 'put',
    data
  })
}

/**
 * 删除报价单明细
 */
export function deleteQuotationItem(quotationId, itemId) {
  return request({
    url: `/quotations/${quotationId}/items/${itemId}`,
    method: 'delete'
  })
}

/**
 * 根据线索ID获取最新报价单
 */
export function getLatestQuotationByLead(leadId) {
  return request({
    url: `/quotations/lead/${leadId}/latest`,
    method: 'get'
  })
}

/**
 * 根据线索ID获取所有报价单历史
 */
export function getQuotationsByLead(leadId) {
  return request({
    url: `/quotations/lead/${leadId}`,
    method: 'get'
  })
}

/**
 * 作废报价单
 */
export function voidQuotation(id) {
  return request({
    url: `/quotations/${id}/void`,
    method: 'put'
  })
}

/**
 * 修改报价单（生成新版本）
 */
export function reviseQuotation(id, data) {
  return request({
    url: `/quotations/${id}/revise`,
    method: 'post',
    data
  })
}

/**
 * 获取报价单PDF数据
 */
export function getQuotationPDF(id) {
  return request({
    url: `/quotations/${id}/pdf`,
    method: 'get'
  })
}

/**
 * 发送报价单
 */
export function sendQuotation(id) {
  return request({
    url: `/quotations/${id}/send`,
    method: 'put'
  })
}

/**
 * 导出报价单Excel
 */
export function exportQuotationExcel(id) {
  return request({
    url: `/quotations/${id}/export-excel`,
    method: 'get',
    responseType: 'blob'
  })
}
