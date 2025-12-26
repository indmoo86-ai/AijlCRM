<template>
  <div class="attachment-manager">
    <div class="attachment-header">
      <span class="header-title">附件管理</span>
      <el-upload
        :action="uploadUrl"
        :headers="uploadHeaders"
        :before-upload="beforeUpload"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :show-file-list="false"
        :data="uploadData"
        multiple
      >
        <el-button type="primary" size="small" :icon="Upload">
          上传附件
        </el-button>
      </el-upload>
    </div>

    <el-divider />

    <div class="attachment-list" v-loading="loading">
      <el-empty v-if="attachments.length === 0" description="暂无附件" :image-size="80" />

      <div v-else class="attachment-items">
        <div
          v-for="item in attachments"
          :key="item.attachment_id"
          class="attachment-item"
        >
          <div class="attachment-icon">
            <el-icon :size="32" :color="getFileColor(item.file_type)">
              <component :is="getFileIcon(item.file_type)" />
            </el-icon>
          </div>

          <div class="attachment-info">
            <div class="file-name" :title="item.original_name">
              {{ item.original_name }}
            </div>
            <div class="file-meta">
              <span class="file-size">{{ formatFileSize(item.file_size) }}</span>
              <span class="file-time">{{ formatDateTime(item.created_at) }}</span>
              <span class="file-uploader">{{ item.uploader_name }}</span>
            </div>
          </div>

          <div class="attachment-actions">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleDownload(item)"
              :icon="Download"
            >
              下载
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              @click="handleDelete(item)"
              :icon="Delete"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Upload,
  Download,
  Delete,
  Document,
  Picture,
  VideoCamera,
  Headset,
  FolderOpened
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import {
  getBusinessAttachments,
  uploadAttachment,
  deleteAttachment,
  downloadAttachment
} from '@/api/attachments'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  businessType: {
    type: String,
    required: true,
    validator: (value) => {
      return ['lead', 'customer', 'quotation', 'contract', 'shipment', 'payment', 'invoice', 'service'].includes(value)
    }
  },
  businessId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['uploaded', 'deleted'])

const userStore = useUserStore()
const loading = ref(false)
const attachments = ref([])

// 上传配置
const uploadUrl = computed(() => {
  return `${import.meta.env.VITE_APP_BASE_API || '/api'}/attachments`
})

const uploadHeaders = computed(() => {
  return {
    Authorization: `Bearer ${userStore.token}`
  }
})

const uploadData = computed(() => {
  return {
    business_type: props.businessType,
    business_id: props.businessId
  }
})

// 加载附件列表
const loadAttachments = async () => {
  try {
    loading.value = true
    const res = await getBusinessAttachments(props.businessType, props.businessId)
    attachments.value = res.data || []
  } catch (error) {
    ElMessage.error('加载附件列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 上传前校验
const beforeUpload = (file) => {
  const maxSize = 50 * 1024 * 1024 // 50MB

  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过 50MB')
    return false
  }

  return true
}

// 上传成功
const handleUploadSuccess = (response, file) => {
  ElMessage.success('上传成功')
  loadAttachments()
  emit('uploaded', response.data)
}

// 上传失败
const handleUploadError = (error) => {
  ElMessage.error('上传失败')
  console.error(error)
}

// 下载附件
const handleDownload = async (item) => {
  try {
    const res = await downloadAttachment(item.attachment_id)

    // 创建下载链接
    const blob = new Blob([res])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = item.original_name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('下载成功')
  } catch (error) {
    ElMessage.error('下载失败')
    console.error(error)
  }
}

// 删除附件
const handleDelete = async (item) => {
  try {
    await ElMessageBox.confirm('确定要删除这个附件吗？', '提示', {
      type: 'warning'
    })

    await deleteAttachment(item.attachment_id)
    ElMessage.success('删除成功')
    loadAttachments()
    emit('deleted', item.attachment_id)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

// 获取文件图标
const getFileIcon = (fileType) => {
  if (!fileType) return Document

  const type = fileType.toLowerCase()

  if (type.includes('image') || /\.(jpg|jpeg|png|gif|bmp|svg)$/.test(type)) {
    return Picture
  } else if (type.includes('video') || /\.(mp4|avi|mov|wmv|flv)$/.test(type)) {
    return VideoCamera
  } else if (type.includes('audio') || /\.(mp3|wav|wma|ogg)$/.test(type)) {
    return Headset
  } else if (type.includes('zip') || type.includes('rar') || type.includes('7z')) {
    return FolderOpened
  } else {
    return Document
  }
}

// 获取文件颜色
const getFileColor = (fileType) => {
  if (!fileType) return '#909399'

  const type = fileType.toLowerCase()

  if (type.includes('image') || /\.(jpg|jpeg|png|gif|bmp|svg)$/.test(type)) {
    return '#67C23A'
  } else if (type.includes('video') || /\.(mp4|avi|mov|wmv|flv)$/.test(type)) {
    return '#E6A23C'
  } else if (type.includes('audio') || /\.(mp3|wav|wma|ogg)$/.test(type)) {
    return '#409EFF'
  } else if (type.includes('pdf')) {
    return '#F56C6C'
  } else {
    return '#909399'
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

// 格式化日期时间
const formatDateTime = (datetime) => {
  return datetime ? dayjs(datetime).format('YYYY-MM-DD HH:mm') : '-'
}

// 暴露刷新方法给父组件
defineExpose({
  refresh: loadAttachments
})

// 页面加载
onMounted(() => {
  loadAttachments()
})
</script>

<style scoped lang="scss">
.attachment-manager {
  .attachment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .header-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .attachment-list {
    min-height: 100px;

    .attachment-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .attachment-item {
      display: flex;
      align-items: center;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        background: #e9ecf0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .attachment-icon {
        flex-shrink: 0;
        margin-right: 12px;
      }

      .attachment-info {
        flex: 1;
        min-width: 0;

        .file-name {
          font-size: 14px;
          color: #303133;
          font-weight: 500;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-meta {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #909399;

          span {
            display: flex;
            align-items: center;
          }
        }
      }

      .attachment-actions {
        flex-shrink: 0;
        display: flex;
        gap: 8px;
      }
    }
  }
}
</style>
