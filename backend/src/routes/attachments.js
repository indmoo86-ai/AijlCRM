const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const attachmentController = require('../controllers/attachmentController');
const { authenticate } = require('../middleware/auth');

// 配置 multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/temp'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// 所有路由都需要认证
router.use(authenticate);

// 获取附件列表
router.get('/', attachmentController.getAttachments);

// 获取指定业务对象的附件
router.get('/:businessType/:businessId', attachmentController.getBusinessAttachments);

// 上传附件
router.post('/', upload.single('file'), attachmentController.uploadAttachment);

// 下载附件
router.get('/:id/download', attachmentController.downloadAttachment);

// 删除附件
router.delete('/:id', attachmentController.deleteAttachment);

module.exports = router;
