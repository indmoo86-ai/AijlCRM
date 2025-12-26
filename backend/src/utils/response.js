// 统一响应格式工具

/**
 * 成功响应
 */
const success = (res, data = null, message = '操作成功', code = 200) => {
  return res.status(code).json({
    success: true,
    code,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * 失败响应
 */
const error = (res, message = '操作失败', code = 400, errors = null) => {
  return res.status(code).json({
    success: false,
    code,
    message,
    errors,
    timestamp: new Date().toISOString()
  });
};

/**
 * 分页响应
 */
const paginate = (res, data, page, pageSize, total, message = '查询成功') => {
  return res.status(200).json({
    success: true,
    code: 200,
    message,
    data: {
      list: data,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    },
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  success,
  error,
  paginate
};
