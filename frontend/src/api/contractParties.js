/**
 * 合同主体管理 API
 */
import request from '@/utils/request'

/**
 * 获取合同主体列表
 */
export function getContractPartyList(params) {
  return request({
    url: '/contract-parties',
    method: 'get',
    params
  })
}

/**
 * 获取启用的合同主体列表（用于下拉选择）
 */
export function getActiveContractParties() {
  return request({
    url: '/contract-parties/active',
    method: 'get'
  })
}

/**
 * 获取合同主体详情
 */
export function getContractPartyDetail(id) {
  return request({
    url: `/contract-parties/${id}`,
    method: 'get'
  })
}

/**
 * 创建合同主体
 */
export function createContractParty(data) {
  return request({
    url: '/contract-parties',
    method: 'post',
    data
  })
}

/**
 * 更新合同主体
 */
export function updateContractParty(id, data) {
  return request({
    url: `/contract-parties/${id}`,
    method: 'put',
    data
  })
}

/**
 * 更新合同主体状态
 */
export function updateContractPartyStatus(id, status) {
  return request({
    url: `/contract-parties/${id}/status`,
    method: 'put',
    data: { status }
  })
}

/**
 * 删除合同主体
 */
export function deleteContractParty(id) {
  return request({
    url: `/contract-parties/${id}`,
    method: 'delete'
  })
}
