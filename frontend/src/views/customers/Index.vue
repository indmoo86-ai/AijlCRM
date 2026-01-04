<template>
  <div class="customers-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>客户管理</span>
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            新建客户
          </el-button>
        </div>
      </template>
      
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="客户名称">
          <el-input
            v-model="searchForm.customerName"
            placeholder="请输入客户名称"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="客户类型">
          <el-select
            v-model="searchForm.customerType"
            placeholder="请选择"
            clearable
            @clear="handleSearch"
          >
            <el-option label="潜在客户" :value="1" />
            <el-option label="正式客户" :value="2" />
            <el-option label="VIP客户" :value="3" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="行业">
          <el-input
            v-model="searchForm.industry"
            placeholder="请输入行业"
            clearable
            @clear="handleSearch"
          />
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
      >
        <el-table-column prop="customerNo" label="客户编号" width="140" />
        <el-table-column prop="customerName" label="客户名称" min-width="160" show-overflow-tooltip />

        <el-table-column prop="customerType" label="客户类型" width="85">
          <template #default="{ row }">
            <el-tag v-if="row.customerType === 3" type="danger">VIP</el-tag>
            <el-tag v-else-if="row.customerType === 2" type="success">正式</el-tag>
            <el-tag v-else type="info">潜在</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="industry" label="所属行业" min-width="100" />
        <el-table-column prop="city" label="所在城市" min-width="100" />
        <el-table-column prop="roomCount" label="房间数" width="80" />

        <el-table-column prop="totalAmount" label="累计金额" width="110" align="right">
          <template #default="{ row }">
            ¥{{ formatAmount(row.totalAmount) }}
          </template>
        </el-table-column>

        <el-table-column prop="contractCount" label="合同数" width="75" />

        <el-table-column prop="lastContactTime" label="最后联系" width="150">
          <template #default="{ row }">
            {{ formatDate(row.lastContactTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="创建时间" width="150">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" size="small" @click="handleView(row)">
                查看
              </el-button>
              <el-button link type="primary" size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button link type="success" size="small" @click="handleAdvanceStage(row)">
                推进
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
    
    <!-- 新建/编辑客户对话框 -->
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
            <el-form-item label="客户名称" prop="customerName">
              <el-input v-model="form.customerName" placeholder="请输入客户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户类型" prop="customerType">
              <el-select v-model="form.customerType" placeholder="请选择" style="width: 100%">
                <el-option label="潜在客户" :value="1" />
                <el-option label="正式客户" :value="2" />
                <el-option label="VIP客户" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属行业" prop="industry">
              <el-select v-model="form.industry" placeholder="请选择" style="width: 100%">
                <el-option label="酒店" value="hotel" />
                <el-option label="民宿" value="homestay" />
                <el-option label="公寓" value="apartment" />
                <el-option label="度假村" value="resort" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房间数量" prop="roomCount">
              <el-input-number
                v-model="form.roomCount"
                :min="1"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="省份" prop="province">
              <el-input v-model="form.province" placeholder="请输入省份" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="城市" prop="city">
              <el-input v-model="form.city" placeholder="请输入城市" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="区县" prop="district">
              <el-input v-model="form.district" placeholder="请输入区县" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入详细地址" />
        </el-form-item>
        
        <el-form-item label="客户标签" prop="tags">
          <el-select
            v-model="form.tags"
            multiple
            filterable
            allow-create
            placeholder="请选择或输入标签"
            style="width: 100%"
          >
            <el-option label="重点客户" value="重点客户" />
            <el-option label="价格敏感" value="价格敏感" />
            <el-option label="快速决策" value="快速决策" />
            <el-option label="需要培育" value="需要培育" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
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
    
    <!-- 推进阶段对话框 -->
    <el-dialog
      v-model="stageDialogVisible"
      title="推进客户阶段"
      width="500px"
    >
      <el-form label-width="100px">
        <el-form-item label="当前阶段">
          <el-tag v-if="currentCustomer.customerType === 3" type="danger">VIP客户</el-tag>
          <el-tag v-else-if="currentCustomer.customerType === 2" type="success">正式客户</el-tag>
          <el-tag v-else type="info">潜在客户</el-tag>
        </el-form-item>
        
        <el-form-item label="目标阶段">
          <el-select v-model="targetStage" placeholder="请选择目标阶段" style="width: 100%">
            <el-option
              v-if="currentCustomer.customerType === 1"
              label="推进到正式客户"
              :value="2"
            />
            <el-option
              v-if="currentCustomer.customerType === 2"
              label="推进到VIP客户"
              :value="3"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="推进说明">
          <el-input
            v-model="stageRemark"
            type="textarea"
            :rows="3"
            placeholder="请输入推进原因或说明"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="stageDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="stageLoading" @click="handleConfirmStage">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { getCustomerList, createCustomer, updateCustomer, advanceCustomerStage, deleteCustomer } from '@/api/customers'
import dayjs from 'dayjs'

const loading = ref(false)
const submitLoading = ref(false)
const stageLoading = ref(false)
const dialogVisible = ref(false)
const stageDialogVisible = ref(false)
const dialogTitle = ref('新建客户')
const formRef = ref(null)
const tableData = ref([])
const currentCustomer = ref({})
const targetStage = ref(null)
const stageRemark = ref('')

const searchForm = reactive({
  customerName: '',
  customerType: null,
  industry: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  id: null,
  customerName: '',
  customerType: 1,
  industry: '',
  province: '',
  city: '',
  district: '',
  address: '',
  roomCount: null,
  tags: [],
  remark: ''
})

const formRules = {
  customerName: [
    { required: true, message: '请输入客户名称', trigger: 'blur' }
  ],
  customerType: [
    { required: true, message: '请选择客户类型', trigger: 'change' }
  ],
  industry: [
    { required: true, message: '请选择所属行业', trigger: 'change' }
  ]
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
    const res = await getCustomerList(params)
    tableData.value = res.data.list || res.data.rows || []
    pagination.total = res.data.pagination?.total || res.data.total || 0
  } catch (error) {
    console.error('Failed to fetch customers:', error)
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
  searchForm.customerName = ''
  searchForm.customerType = null
  searchForm.industry = ''
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
  dialogTitle.value = '新建客户'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑客户'
  Object.assign(form, {
    id: row.id,
    customerName: row.customerName,
    customerType: row.customerType,
    industry: row.industry,
    province: row.province,
    city: row.city,
    district: row.district,
    address: row.address,
    roomCount: row.roomCount,
    tags: row.tags || [],
    remark: row.remark
  })
  dialogVisible.value = true
}

// 查看
const handleView = (row) => {
  ElMessage.info('查看详情功能开发中')
}

// 推进阶段
const handleAdvanceStage = (row) => {
  if (row.customerType >= 3) {
    ElMessage.warning('该客户已是最高级别')
    return
  }
  
  currentCustomer.value = row
  targetStage.value = row.customerType + 1
  stageRemark.value = ''
  stageDialogVisible.value = true
}

// 确认推进阶段
const handleConfirmStage = async () => {
  if (!targetStage.value) {
    ElMessage.warning('请选择目标阶段')
    return
  }
  
  stageLoading.value = true
  try {
    await advanceCustomerStage(currentCustomer.value.id, {
      newStage: targetStage.value,
      remark: stageRemark.value
    })
    
    ElMessage.success('阶段推进成功')
    stageDialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('Advance stage failed:', error)
  } finally {
    stageLoading.value = false
  }
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除此客户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteCustomer(row.customer_id)
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
      const submitData = { ...form }
      
      if (form.id) {
        await updateCustomer(form.id, submitData)
        ElMessage.success('更新成功')
      } else {
        await createCustomer(submitData)
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
  form.id = null
  form.customerName = ''
  form.customerType = 1
  form.industry = ''
  form.province = ''
  form.city = ''
  form.district = ''
  form.address = ''
  form.roomCount = null
  form.tags = []
  form.remark = ''
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
  fetchData()
})
</script>

<style scoped>
.customers-page {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.table-actions {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}
</style>
