const { Attachment } = require('../models');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

/**
 * 获取附件列表
 */
exports.getAttachments = async (req, res) => {
  try {
    const { business_type, business_id, page = 1, limit = 20 } = req.query;

    const where = {};
    if (business_type) where.business_type = business_type;
    if (business_id) where.business_id = business_id;

    const offset = (page - 1) * limit;

    const { count, rows } = await Attachment.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('获取附件列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取附件列表失败',
      error: error.message
    });
  }
};

/**
 * 获取指定业务对象的附件列表
 */
exports.getBusinessAttachments = async (req, res) => {
  try {
    const { businessType, businessId } = req.params;

    const attachments = await Attachment.findAll({
      where: {
        business_type: businessType,
        business_id: businessId
      },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: attachments
    });
  } catch (error) {
    console.error('获取业务附件失败:', error);
    res.status(500).json({
      success: false,
      message: '获取附件失败',
      error: error.message
    });
  }
};

/**
 * 上传附件
 */
exports.uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的文件'
      });
    }

    // 参数命名兼容性处理
    const business_type = req.body.business_type || req.body.businessType;
    const business_id = req.body.business_id || req.body.businessId;

    if (!business_type || !business_id) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：business_type 或 business_id'
      });
    }

    const file = req.file;
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;

    // 按日期分目录存储
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateDir = `${year}/${month}/${day}`;

    const uploadDir = path.join(__dirname, '../../uploads', dateDir);
    const filePath = path.join(uploadDir, fileName);
    const relativePath = `${dateDir}/${fileName}`;

    // 确保目录存在
    await fs.mkdir(uploadDir, { recursive: true });

    // 移动文件
    await fs.rename(file.path, filePath);

    // 创建附件记录
    const attachment = await Attachment.create({
      business_type,
      business_id,
      original_name: file.originalname,
      file_name: fileName,
      file_path: relativePath,
      file_size: file.size,
      file_type: file.mimetype,
      file_extension: fileExtension,
      uploader_id: req.user?.user_id || 1,
      uploader_name: req.user?.username || 'admin'
    });

    // 响应格式标准化（包含主键ID + 完整数据）
    const responseData = {
      attachmentId: attachment.attachment_id,
      ...attachment.toJSON()
    };

    res.status(201).json({
      success: true,
      message: '文件上传成功',
      data: responseData
    });
  } catch (error) {
    console.error('上传附件失败:', error);
    console.error('错误详情:', error.message);
    res.status(500).json({
      success: false,
      message: '上传附件失败',
      error: error.message
    });
  }
};

/**
 * 下载附件
 */
exports.downloadAttachment = async (req, res) => {
  try {
    const { id } = req.params;

    const attachment = await Attachment.findByPk(id);
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: '附件不存在'
      });
    }

    const filePath = path.join(__dirname, '../../uploads', attachment.file_path);

    // 检查文件是否存在
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }

    // 更新下载次数
    await attachment.increment('download_count');

    // 设置响应头
    res.setHeader('Content-Type', attachment.file_type);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(attachment.original_name)}"`);

    // 发送文件
    res.sendFile(filePath);
  } catch (error) {
    console.error('下载附件失败:', error);
    res.status(500).json({
      success: false,
      message: '下载附件失败',
      error: error.message
    });
  }
};

/**
 * 删除附件
 */
exports.deleteAttachment = async (req, res) => {
  try {
    const { id } = req.params;

    const attachment = await Attachment.findByPk(id);
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: '附件不存在'
      });
    }

    const filePath = path.join(__dirname, '../../uploads', attachment.file_path);

    // 软删除数据库记录
    await attachment.destroy();

    // 删除物理文件（可选，也可以保留用于数据恢复）
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('删除物理文件失败:', error.message);
    }

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除附件失败:', error);
    res.status(500).json({
      success: false,
      message: '删除附件失败',
      error: error.message
    });
  }
};
