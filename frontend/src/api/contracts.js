import request from '@/utils/request'

/**
 * 获取合同列表
 */
export function getContractList(params) {
  return request({
    url: '/contracts',
    method: 'get',
    params
  })
}

/**
 * 获取合同详情
 */
export function getContractDetail(id) {
  return request({
    url: `/contracts/${id}`,
    method: 'get'
  })
}

/**
 * 创建合同
 */
export function createContract(data) {
  return request({
    url: '/contracts',
    method: 'post',
    data
  })
}

/**
 * 更新合同
 */
export function updateContract(id, data) {
  return request({
    url: `/contracts/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除合同
 */
export function deleteContract(id) {
  return request({
    url: `/contracts/${id}`,
    method: 'delete'
  })
}

/**
 * 签署合同
 */
export function signContract(id, data) {
  return request({
    url: `/contracts/${id}/sign`,
    method: 'post',
    data
  })
}

/**
 * 获取合同执行进度
 */
export function getContractProgress(id) {
  return request({
    url: `/contracts/${id}/progress`,
    method: 'get'
  })
}

/**
 * 获取合同明细列表
 */
export function getContractItems(contractId) {
  return request({
    url: `/contracts/${contractId}/items`,
    method: 'get'
  })
}

/**
 * 添加合同明细
 */
export function addContractItem(contractId, data) {
  return request({
    url: `/contracts/${contractId}/items`,
    method: 'post',
    data
  })
}

/**
 * 更新合同明细
 */
export function updateContractItem(contractId, itemId, data) {
  return request({
    url: `/contracts/${contractId}/items/${itemId}`,
    method: 'put',
    data
  })
}

/**
 * 删除合同明细
 */
export function deleteContractItem(contractId, itemId) {
  return request({
    url: `/contracts/${contractId}/items/${itemId}`,
    method: 'delete'
  })
}

/**
 * 获取报价单信息用于创建合同
 */
export function getQuotationInfoForContract(quotationId) {
  return request({
    url: `/contracts/quotation-info/${quotationId}`,
    method: 'get'
  })
}

/**
 * 从报价单创建合同
 */
export function createContractFromQuotation(data) {
  return request({
    url: '/contracts/from-quotation',
    method: 'post',
    data
  })
}

/**
 * 计算付款金额
 */
export function calculatePaymentAmounts(data) {
  return request({
    url: '/contracts/calculate-payment',
    method: 'post',
    data
  })
}

/**
 * 导出合同Word数据
 */
export function exportContractWord(id) {
  return request({
    url: `/contracts/${id}/export-word`,
    method: 'get'
  })
}

/**
 * 获取合同跟踪记录
 */
export function getContractTrackRecords(id) {
  return request({
    url: `/contracts/${id}/track-records`,
    method: 'get'
  })
}

/**
 * 添加合同跟踪记录
 */
export function addContractTrackRecord(id, data) {
  return request({
    url: `/contracts/${id}/track-records`,
    method: 'post',
    data
  })
}

/**
 * 确认合同 (draft -> pending)
 */
export function confirmContract(id, data) {
  return request({
    url: `/contracts/${id}/confirm`,
    method: 'put',
    data
  })
}

/**
 * 寄出合同 (pending -> sent)
 */
export function sendOutContract(id, data) {
  return request({
    url: `/contracts/${id}/send-out`,
    method: 'put',
    data
  })
}

/**
 * 收回合同 (sent -> active)
 */
export function receiveBackContract(id, data) {
  return request({
    url: `/contracts/${id}/receive-back`,
    method: 'put',
    data
  })
}

/**
 * 作废合同
 */
export function voidContract(id, data) {
  return request({
    url: `/contracts/${id}/void`,
    method: 'put',
    data
  })
}

/**
 * 恢复合同
 */
export function restoreContract(id) {
  return request({
    url: `/contracts/${id}/restore`,
    method: 'put'
  })
}
