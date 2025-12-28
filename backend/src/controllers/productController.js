/**
 * 产品管理控制器 - ProductController
 * 包含产品SKU管理和产品分类管理
 */
const { Product, ProductCategory } = require('../models');
const { success, error, paginate } = require('../utils/response');
const { Op } = require('sequelize');

// ==================== 产品分类管理 ====================

// 创建产品分类
exports.createCategory = async (req, res) => {
  try {
    // 支持驼峰和下划线两种命名方式
    const categoryName = req.body.categoryName || req.body.category_name;
    const categoryCode = req.body.categoryCode || req.body.category_code;
    const sortOrder = req.body.sortOrder || req.body.sort_order;
    const description = req.body.description;

    const category = await ProductCategory.create({
      category_name: categoryName,
      category_code: categoryCode,
      sort_order: sortOrder,
      description,
      creator_id: req.user.id
    });

    // 返回标准化的响应格式，包含categoryId字段
    const responseData = {
      categoryId: category.category_id,
      ...category.toJSON()
    };

    return success(res, responseData, '产品分类创建成功', 201);
  } catch (err) {
    console.error('创建产品分类错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '创建失败', 500);
  }
};

// 查询产品分类列表
exports.getCategoryList = async (req, res) => {
  try {
    const { is_active } = req.query;

    const where = {};
    if (is_active !== undefined) where.is_active = is_active;

    const categories = await ProductCategory.findAll({
      where,
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
    });

    return success(res, categories, '查询成功');
  } catch (err) {
    console.error('查询产品分类错误:', err);
    return error(res, '查询失败', 500);
  }
};

// 修改产品分类
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const category = await ProductCategory.findByPk(id);
    if (!category) {
      return error(res, '产品分类不存在', 404);
    }

    await category.update(updates);
    return success(res, category, '更新成功');
  } catch (err) {
    console.error('更新产品分类错误:', err);
    return error(res, '更新失败', 500);
  }
};

// 启用/停用产品分类
exports.updateCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const category = await ProductCategory.findByPk(id);
    if (!category) {
      return error(res, '产品分类不存在', 404);
    }

    await category.update({ is_active });
    return success(res, category, '状态更新成功');
  } catch (err) {
    console.error('更新分类状态错误:', err);
    return error(res, '操作失败', 500);
  }
};

// ==================== 产品SKU管理 ====================

// 创建产品
exports.createProduct = async (req, res) => {
  try {
    // 支持驼峰和下划线两种命名方式
    const productCode = req.body.productCode || req.body.product_code;
    const productName = req.body.productName || req.body.product_name;
    const categoryId = req.body.categoryId || req.body.category_id;
    const unitPrice = req.body.unitPrice || req.body.unit_price;
    const unit = req.body.unit;
    const brand = req.body.brand;
    const specifications = req.body.specifications;
    const description = req.body.description;
    const status = req.body.status || 'active';

    const productData = {
      product_code: productCode,
      product_name: productName,
      category_id: categoryId,
      unit_price: unitPrice,
      unit,
      brand,
      specifications,
      description,
      status,
      created_by: req.user.id
    };

    const product = await Product.create(productData);

    // 返回标准化的响应格式，包含productId字段
    const responseData = {
      productId: product.product_id,
      ...product.toJSON()
    };

    return success(res, responseData, '产品创建成功', 201);
  } catch (err) {
    console.error('创建产品错误:', err);
    console.error('错误详情:', err.message);
    return error(res, '创建失败', 500);
  }
};

// 查询产品列表（分页）
exports.getProductList = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, category_id, brand, status, keyword } = req.query;

    const where = {};
    if (category_id) where.category_id = category_id;
    if (brand) where.brand = brand;
    if (status) where.status = status;
    if (keyword) {
      where[Op.or] = [
        { product_name: { [Op.like]: `%${keyword}%` } },
        { product_code: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{
        model: ProductCategory,
        as: 'category',
        attributes: ['category_id', 'category_name']
      }],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      order: [['created_at', 'DESC']]
    });

    return paginate(res, rows, page, pageSize, count);
  } catch (err) {
    console.error('查询产品列表错误:', err);
    return error(res, '查询失败', 500);
  }
};

// 查询产品详情
exports.getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [{
        model: ProductCategory,
        as: 'category',
        attributes: ['category_id', 'category_name', 'category_code']
      }]
    });

    if (!product) {
      return error(res, '产品不存在', 404);
    }

    return success(res, product, '查询成功');
  } catch (err) {
    console.error('查询产品详情错误:', err);
    return error(res, '查询失败', 500);
  }
};

// 修改产品信息
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {
      ...req.body,
      updated_by: req.user.id
    };

    const product = await Product.findByPk(id);
    if (!product) {
      return error(res, '产品不存在', 404);
    }

    await product.update(updates);
    return success(res, product, '更新成功');
  } catch (err) {
    console.error('更新产品错误:', err);
    return error(res, '更新失败', 500);
  }
};

// 修改产品状态（上架/下架）
exports.updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return error(res, '产品不存在', 404);
    }

    await product.update({
      status,
      updated_by: req.user.id
    });

    return success(res, product, '状态更新成功');
  } catch (err) {
    console.error('更新产品状态错误:', err);
    return error(res, '操作失败', 500);
  }
};

// 批量导入产品（占位）
exports.importProducts = async (req, res) => {
  try {
    // TODO: 实现Excel文件解析和批量导入
    return success(res, { message: '批量导入功能待实现' });
  } catch (err) {
    console.error('批量导入错误:', err);
    return error(res, '导入失败', 500);
  }
};

// 导出产品数据（占位）
exports.exportProducts = async (req, res) => {
  try {
    // TODO: 实现导出Excel功能
    return success(res, { message: '导出功能待实现' });
  } catch (err) {
    console.error('导出错误:', err);
    return error(res, '导出失败', 500);
  }
};
