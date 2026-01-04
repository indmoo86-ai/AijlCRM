/**
 * 产品管理路由
 * 包含产品分类和产品SKU的路由
 */
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');

// 所有产品相关接口都需要身份验证
router.use(authenticate);

// ==================== 产品分类路由 ====================
router.post('/categories', productController.createCategory);
router.get('/categories', productController.getCategoryList);
router.put('/categories/:id', productController.updateCategory);

// ==================== 产品SKU路由 ====================
router.post('/', productController.createProduct);
router.get('/', productController.getProductList);
router.post('/batch-status', productController.batchUpdateStatus); // 批量更新状态（放在/:id前面）
router.get('/:id', productController.getProductDetail);
router.put('/:id', productController.updateProduct);
router.put('/:id/status', productController.updateProductStatus);
router.delete('/:id', productController.deleteProduct);

// 导入导出
router.post('/import', productController.importProducts);
router.get('/export', productController.exportProducts);

module.exports = router;
