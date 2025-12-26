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
