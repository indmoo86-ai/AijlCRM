<template>
  <div class="products-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>产品管理</span>
          <div class="header-actions">
            <el-button
              v-if="selectedIds.length > 0"
              type="success"
              :icon="Top"
              @click="handleBatchStatus('active')"
            >
              批量上架 ({{ selectedIds.length }})
            </el-button>
            <el-button
              v-if="selectedIds.length > 0"
              type="warning"
              :icon="Bottom"
              @click="handleBatchStatus('inactive')"
            >
              批量下架 ({{ selectedIds.length }})
            </el-button>
            <el-button type="primary" :icon="Plus" @click="handleCreate">
              新建产品
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="产品名称">
          <el-input
            v-model="searchForm.productName"
            placeholder="请输入产品名称"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="产品编码">
          <el-input
            v-model="searchForm.productCode"
            placeholder="请输入产品编码"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="品牌">
          <el-input
            v-model="searchForm.brand"
            placeholder="请输入品牌"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择"
            clearable
            @clear="handleSearch"
          >
            <el-option label="在售" value="active" />
            <el-option label="停售" value="inactive" />
            <el-option label="草稿" value="draft" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
      
      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column label="主图" width="80">
          <template #default="{ row }">
            <el-image
              v-if="row.main_image"
              :src="row.main_image"
              :preview-src-list="[row.main_image]"
              fit="cover"
              style="width: 50px; height: 50px; border-radius: 4px;"
            />
            <span v-else class="no-image">暂无</span>
          </template>
        </el-table-column>
        <el-table-column prop="product_code" label="产品编码" min-width="140" />
        <el-table-column prop="product_name" label="产品名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="brand" label="品牌" min-width="100" />

        <el-table-column prop="category" label="产品分类" min-width="100">
          <template #default="{ row }">
            {{ row.category?.category_name || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="supplier" label="供应商" min-width="130" show-overflow-tooltip />

        <el-table-column prop="cost_price" label="成本价" width="100" align="right">
          <template #default="{ row }">
            ¥{{ formatAmount(row.cost_price) }}
          </template>
        </el-table-column>

        <el-table-column prop="sale_price" label="销售价" width="100" align="right">
          <template #default="{ row }">
            ¥{{ formatAmount(row.sale_price) }}
          </template>
        </el-table-column>

        <el-table-column prop="unit" label="单位" width="60" />

        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'active'" type="success">在售</el-tag>
            <el-tag v-else-if="row.status === 'inactive'" type="danger">停售</el-tag>
            <el-tag v-else type="info">草稿</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="created_at" label="创建时间" width="150">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" size="small" @click="handleView(row)">
                查看
              </el-button>
              <el-button link type="primary" size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end;"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>
    
    <!-- 新建/编辑产品对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="90%"
      style="max-width: 1200px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="110px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品编码" prop="product_code">
              <el-input
                v-model="form.product_code"
                placeholder="请输入产品编码"
                :disabled="!!form.product_id"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品名称" prop="product_name">
              <el-input v-model="form.product_name" placeholder="请输入产品名称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="品牌" prop="brand">
              <el-input v-model="form.brand" placeholder="请输入品牌" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品分类" prop="category_id">
              <el-select
                v-model="form.category_id"
                placeholder="请选择分类"
                style="width: 100%"
              >
                <el-option
                  v-for="cat in categories"
                  :key="cat.category_id"
                  :label="cat.category_name"
                  :value="cat.category_id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="供应商" prop="supplier">
              <el-input v-model="form.supplier" placeholder="请输入供应商名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-select v-model="form.unit" placeholder="请选择单位" style="width: 100%">
                <el-option label="台" value="台" />
                <el-option label="套" value="套" />
                <el-option label="个" value="个" />
                <el-option label="件" value="件" />
                <el-option label="批" value="批" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="成本价" prop="cost_price">
              <el-input-number
                v-model="form.cost_price"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="0.00"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="销售价" prop="sale_price">
              <el-input-number
                v-model="form.sale_price"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="0.00"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="在售" value="active" />
                <el-option label="停售" value="inactive" />
                <el-option label="草稿" value="draft" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- 产品主图 -->
        <el-form-item label="产品主图">
          <el-upload
            class="main-image-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleMainImageSuccess"
            :before-upload="beforeImageUpload"
            accept="image/*"
          >
            <el-image
              v-if="form.main_image"
              :src="form.main_image"
              fit="cover"
              class="main-image-preview"
            />
            <el-icon v-else class="main-image-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <el-button
            v-if="form.main_image"
            type="danger"
            size="small"
            link
            style="margin-left: 10px;"
            @click="form.main_image = ''"
          >
            删除主图
          </el-button>
        </el-form-item>

        <!-- 产品说明图 -->
        <el-form-item label="产品说明图">
          <el-upload
            class="product-images-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            list-type="picture-card"
            :file-list="productImageList"
            :on-success="handleProductImageSuccess"
            :on-remove="handleProductImageRemove"
            :before-upload="beforeImageUpload"
            accept="image/*"
            :limit="10"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">最多上传10张图片，支持jpg、png格式</div>
        </el-form-item>

        <el-form-item label="产品描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入产品描述"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Top, Bottom } from '@element-plus/icons-vue'
import { getProductList, createProduct, updateProduct, deleteProduct, getProductCategories, batchUpdateProductStatus } from '@/api/products'
import dayjs from 'dayjs'

// 上传配置
const uploadUrl = import.meta.env.VITE_API_URL + '/attachments/upload'
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
}))
const productImageList = ref([])
const selectedIds = ref([])

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新建产品')
const formRef = ref(null)
const tableData = ref([])
const categories = ref([])

const searchForm = reactive({
  productName: '',
  productCode: '',
  brand: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  product_id: null,
  product_code: '',
  product_name: '',
  brand: '',
  category_id: null,
  supplier: '',
  cost_price: 0,
  sale_price: 0,
  unit: '台',
  main_image: '',
  product_images: [],
  description: '',
  status: 'active'
})

const formRules = {
  product_code: [
    { required: true, message: '请输入产品编码', trigger: 'blur' }
  ],
  product_name: [
    { required: true, message: '请输入产品名称', trigger: 'blur' }
  ],
  category_id: [
    { required: true, message: '请选择产品分类', trigger: 'change' }
  ],
  sale_price: [
    { required: true, message: '请输入销售价', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 获取产品分类
const fetchCategories = async () => {
  try {
    const res = await getProductCategories()
    categories.value = res.data || []
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    const res = await getProductList(params)
    tableData.value = res.data.list || res.data.rows || []
    pagination.total = res.data.pagination?.total || res.data.total || 0
  } catch (error) {
    console.error('Failed to fetch products:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.productName = ''
  searchForm.productCode = ''
  searchForm.brand = ''
  searchForm.status = ''
  handleSearch()
}

// 分页
const handlePageChange = (page) => {
  pagination.page = page
  fetchData()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.page = 1
  fetchData()
}

// 新建
const handleCreate = () => {
  dialogTitle.value = '新建产品'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑产品'
  // 解析产品说明图
  let images = []
  if (row.product_images) {
    try {
      images = typeof row.product_images === 'string' ? JSON.parse(row.product_images) : row.product_images
    } catch (e) {
      images = []
    }
  }
  productImageList.value = images.map((url, idx) => ({
    name: `image_${idx}`,
    url: url
  }))

  Object.assign(form, {
    product_id: row.product_id,
    product_code: row.product_code,
    product_name: row.product_name,
    brand: row.brand,
    category_id: row.category_id,
    supplier: row.supplier,
    cost_price: parseFloat(row.cost_price) || 0,
    sale_price: parseFloat(row.sale_price) || 0,
    unit: row.unit,
    main_image: row.main_image || '',
    product_images: images,
    description: row.description,
    status: row.status
  })
  dialogVisible.value = true
}

// 查看
const handleView = (row) => {
  ElMessage.info('查看详情功能开发中')
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除此产品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteProduct(row.product_id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete failed:', error)
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      const submitData = {
        ...form,
        // 将产品说明图数组转为JSON字符串存储
        product_images: form.product_images.length > 0 ? JSON.stringify(form.product_images) : null
      }

      if (form.product_id) {
        await updateProduct(form.product_id, submitData)
        ElMessage.success('更新成功')
      } else {
        await createProduct(submitData)
        ElMessage.success('创建成功')
      }

      dialogVisible.value = false
      fetchData()
    } catch (error) {
      console.error('Submit failed:', error)
    } finally {
      submitLoading.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.product_id = null
  form.product_code = ''
  form.product_name = ''
  form.brand = ''
  form.category_id = null
  form.supplier = ''
  form.cost_price = 0
  form.sale_price = 0
  form.unit = '台'
  form.main_image = ''
  form.product_images = []
  form.description = ''
  form.status = 'active'
  productImageList.value = []
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.product_id)
}

// 批量更新状态
const handleBatchStatus = async (status) => {
  const statusText = status === 'active' ? '上架' : '下架'
  try {
    await ElMessageBox.confirm(
      `确定要${statusText}选中的 ${selectedIds.value.length} 个产品吗？`,
      '批量操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await batchUpdateProductStatus(selectedIds.value, status)
    ElMessage.success(`成功${statusText} ${selectedIds.value.length} 个产品`)
    selectedIds.value = []
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Batch update failed:', error)
    }
  }
}

// 主图上传成功
const handleMainImageSuccess = (response) => {
  if (response.success && response.data) {
    form.main_image = response.data.url
    ElMessage.success('主图上传成功')
  } else {
    ElMessage.error('上传失败')
  }
}

// 产品说明图上传成功
const handleProductImageSuccess = (response, file, fileList) => {
  if (response.success && response.data) {
    form.product_images.push(response.data.url)
  }
}

// 产品说明图删除
const handleProductImageRemove = (file) => {
  const url = file.url || file.response?.data?.url
  form.product_images = form.product_images.filter(u => u !== url)
}

// 图片上传前验证
const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB!')
    return false
  }
  return true
}

// 格式化日期
const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
}

// 格式化金额
const formatAmount = (amount) => {
  return amount ? parseFloat(amount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
}

// 组件挂载时获取数据
onMounted(() => {
  fetchCategories()
  fetchData()
})
</script>

<style scoped>
.products-page {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-form {
  margin-bottom: 20px;
}

.table-actions {
  display: flex;
  gap: 5px;
}

.no-image {
  font-size: 12px;
  color: #909399;
}

/* 主图上传 */
.main-image-uploader {
  display: inline-block;
}

.main-image-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image-uploader :deep(.el-upload:hover) {
  border-color: #409eff;
}

.main-image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.main-image-preview {
  width: 100px;
  height: 100px;
}

/* 产品说明图 */
.product-images-uploader :deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 80px;
  height: 80px;
}

.product-images-uploader :deep(.el-upload--picture-card) {
  width: 80px;
  height: 80px;
  line-height: 80px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>
