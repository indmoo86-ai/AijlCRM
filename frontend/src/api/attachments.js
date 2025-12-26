import request from '@/utils/request'

/**
 * 获取附件列表
 */
export function getAttachmentList(params) {
  return request({
    url: '/attachments',
    method: 'get',
    params
  })
}

/**
 * 上传附件
 */
export function uploadAttachment(data) {
  return request({
    url: '/attachments',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 删除附件
 */
export function deleteAttachment(id) {
  return request({
    url: `/attachments/${id}`,
    method: 'delete'
  })
}

/**
 * 下载附件
 */
export function downloadAttachment(id) {
  return request({
    url: `/attachments/${id}/download`,
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 获取指定业务对象的附件列表
 */
export function getBusinessAttachments(businessType, businessId) {
  return request({
    url: `/attachments/${businessType}/${businessId}`,
    method: 'get'
  })
}
