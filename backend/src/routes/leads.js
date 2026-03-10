const express = require('express');
const router = express.Router();
const multer = require('multer');
const leadController = require('../controllers/leadController');
const { authenticateToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permission');

// 配置multer用于文件上传（内存存储）
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 限制10MB
  },
  fileFilter: (req, file, cb) => {
    // 只允许Excel文件
    const allowedMimes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只支持上传Excel文件(.xls, .xlsx)'));
    }
  }
});

// 所有路由都需要认证
router.use(authenticateToken);

// 获取线索列表
router.get('/', checkPermission('lead:view'), leadController.getLeads);

// 创建线索
router.post('/', checkPermission('lead:create'), leadController.createLead);

// Excel导入线索
router.post('/import',
  checkPermission('lead:create'),
  upload.single('file'),
  leadController.importLeadsFromExcel
);

// 获取线索详情
router.get('/:id', checkPermission('lead:view'), leadController.getLeadDetail);

// 更新线索
router.put('/:id', checkPermission('lead:edit'), leadController.updateLead);

// 添加跟进记录
router.post('/:id/follow-up', checkPermission('lead:follow'), leadController.addFollowUp);

// 线索转客户
router.post('/:id/convert', checkPermission('lead:convert'), leadController.convertToCustomer);

// 分配线索
router.put('/:id/assign', checkPermission('lead:edit'), leadController.assignLead);

// 放弃线索
router.put('/:id/abandon', checkPermission('lead:edit'), leadController.abandonLead);

// 删除线索
router.delete('/:id', checkPermission('lead:delete'), leadController.deleteLead);

module.exports = router;
