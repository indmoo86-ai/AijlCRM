import request from '@/utils/request'

/**
 * 获取产品列表
 */
export function getProductList(params) {
  return request({
    url: '/products',
    method: 'get',
    params
  })
}

/**
 * 获取产品详情
 */
export function getProductDetail(id) {
  return request({
    url: `/products/${id}`,
    method: 'get'
  })
}

/**
 * 创建产品
 */
export function createProduct(data) {
  return request({
    url: '/products',
    method: 'post',
    data
  })
}

/**
 * 更新产品
 */
export function updateProduct(id, data) {
  return request({
    url: `/products/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除产品
 */
export function deleteProduct(id) {
  return request({
    url: `/products/${id}`,
    method: 'delete'
  })
}

/**
 * 批量更新产品状态
 */
export function batchUpdateProductStatus(ids, status) {
  return request({
    url: '/products/batch-status',
    method: 'post',
    data: { ids, status }
  })
}

/**
 * 获取产品分类列表
 */
export function getProductCategories() {
  return request({
    url: '/products/categories',
    method: 'get'
  })
}
