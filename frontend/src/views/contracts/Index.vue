<template>
  <div class="contracts-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>合同管理</span>
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            新建合同
          </el-button>
        </div>
      </template>
      
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="合同编号">
          <el-input
            v-model="searchForm.contractNo"
            placeholder="请输入合同编号"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="客户名称">
          <el-input
            v-model="searchForm.customerName"
            placeholder="请输入客户名称"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="合同状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择"
            clearable
            @clear="handleSearch"
          >
            <el-option label="草稿" value="draft" />
            <el-option label="待签署" value="pending" />
            <el-option label="执行中" value="active" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
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
      >
        <el-table-column prop="contract_no" label="合同编号" width="150" />
        <el-table-column prop="contract_title" label="合同标题" width="200" />
        
        <el-table-column prop="customer" label="客户名称" width="180">
          <template #default="{ row }">
            {{ row.customer?.customerName || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="contract_amount" label="合同金额" width="130" align="right">
          <template #default="{ row }">
            ¥{{ formatAmount(row.contract_amount) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'draft'" type="info">草稿</el-tag>
            <el-tag v-else-if="row.status === 'pending'" type="warning">待签署</el-tag>
            <el-tag v-else-if="row.status === 'active'" type="primary">执行中</el-tag>
            <el-tag v-else-if="row.status === 'completed'" type="success">已完成</el-tag>
            <el-tag v-else-if="row.status === 'cancelled'" type="danger">已取消</el-tag>
            <el-tag v-else>{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="signed_date" label="签订日期" width="120" />
        <el-table-column prop="delivery_deadline" label="交付期限" width="120" />
        
        <el-table-column prop="shipped_amount" label="已发货金额" width="120" align="right">
          <template #default="{ row }">
            ¥{{ formatAmount(row.shipped_amount) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="received_amount" label="已收款金额" width="120" align="right">
          <template #default="{ row }">
            ¥{{ formatAmount(row.received_amount) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="created_at" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" size="small" @click="handleView(row)">
                查看
              </el-button>
              <el-button
                v-if="row.status === 'draft'"
                link
                type="primary"
                size="small"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                v-if="row.status === 'pending'"
                link
                type="success"
                size="small"
                @click="handleSign(row)"
              >
                签署
              </el-button>
              <el-button link type="info" size="small" @click="handleProgress(row)">
                进度
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
    
    <!-- 新建/编辑合同对话框 -->
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
        <el-form-item label="合同标题" prop="contract_title">
          <el-input v-model="form.contract_title" placeholder="请输入合同标题" />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户" prop="customer_id">
              <el-select
                v-model="form.customer_id"
                placeholder="请选择客户"
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="customer in customers"
                  :key="customer.id"
                  :label="customer.customerName"
                  :value="customer.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合同金额" prop="contract_amount">
              <el-input-number
                v-model="form.contract_amount"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="0.00"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="签订日期" prop="signed_date">
              <el-date-picker
                v-model="form.signed_date"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="交付期限" prop="delivery_deadline">
              <el-date-picker
                v-model="form.delivery_deadline"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="交付条款" prop="delivery_terms">
          <el-input
            v-model="form.delivery_terms"
            type="textarea"
            :rows="3"
            placeholder="请输入交付条款"
          />
        </el-form-item>
        
        <el-form-item label="补充条款" prop="additional_terms">
          <el-input
            v-model="form.additional_terms"
            type="textarea"
            :rows="3"
            placeholder="请输入补充条款"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleFormSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 合同进度对话框 -->
    <el-dialog
      v-model="progressDialogVisible"
      title="合同执行进度"
      width="90%"
      style="max-width: 800px"
    >
      <el-descriptions :column="2" border v-if="currentContract.contract_id">
        <el-descriptions-item label="合同编号" :span="2">
          {{ currentContract.contract_no }}
        </el-descriptions-item>
        
        <el-descriptions-item label="合同金额">
          ¥{{ formatAmount(currentContract.contract_amount) }}
        </el-descriptions-item>
        
        <el-descriptions-item label="已发货金额">
          ¥{{ formatAmount(currentContract.shipped_amount) }}
        </el-descriptions-item>
        
        <el-descriptions-item label="已收款金额">
          ¥{{ formatAmount(currentContract.received_amount) }}
        </el-descriptions-item>
        
        <el-descriptions-item label="已开票金额">
          ¥{{ formatAmount(currentContract.invoiced_amount) }}
        </el-descriptions-item>
        
        <el-descriptions-item label="发货进度" :span="2">
          <el-progress
            :percentage="getShippingProgress(currentContract)"
            :color="getProgressColor(getShippingProgress(currentContract))"
          />
        </el-descriptions-item>
        
        <el-descriptions-item label="收款进度" :span="2">
          <el-progress
            :percentage="getPaymentProgress(currentContract)"
            :color="getProgressColor(getPaymentProgress(currentContract))"
          />
        </el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <el-button @click="progressDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { getContractList, createContract, updateContract, deleteContract, signContract, getContractProgress } from '@/api/contracts'
import { getCustomerList } from '@/api/customers'
import dayjs from 'dayjs'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const progressDialogVisible = ref(false)
const dialogTitle = ref('新建合同')
const formRef = ref(null)
const tableData = ref([])
const customers = ref([])
const currentContract = ref({})

const searchForm = reactive({
  contractNo: '',
  customerName: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  contract_id: null,
  contract_title: '',
  customer_id: null,
  contract_amount: 0,
  signed_date: '',
  delivery_deadline: '',
  delivery_terms: '',
  additional_terms: ''
})

const formRules = {
  contract_title: [
    { required: true, message: '请输入合同标题', trigger: 'blur' }
  ],
  customer_id: [
    { required: true, message: '请选择客户', trigger: 'change' }
  ],
  contract_amount: [
    { required: true, message: '请输入合同金额', trigger: 'blur' }
  ]
}

// 获取客户列表
const fetchCustomers = async () => {
  try {
    const res = await getCustomerList({ pageSize: 1000 })
    customers.value = res.data.list || res.data.rows || []
  } catch (error) {
    console.error('Failed to fetch customers:', error)
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
    const res = await getContractList(params)
    tableData.value = res.data.list || res.data.rows || []
    pagination.total = res.data.pagination?.total || res.data.total || 0
  } catch (error) {
    console.error('Failed to fetch contracts:', error)
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
  searchForm.contractNo = ''
  searchForm.customerName = ''
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
  dialogTitle.value = '新建合同'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑合同'
  Object.assign(form, {
    contract_id: row.contract_id,
    contract_title: row.contract_title,
    customer_id: row.customer_id,
    contract_amount: parseFloat(row.contract_amount) || 0,
    signed_date: row.signed_date,
    delivery_deadline: row.delivery_deadline,
    delivery_terms: row.delivery_terms,
    additional_terms: row.additional_terms
  })
  dialogVisible.value = true
}

// 查看
const handleView = (row) => {
  ElMessage.info('查看详情功能开发中')
}

// 签署合同
const handleSign = async (row) => {
  try {
    await ElMessageBox.confirm('确定要签署此合同吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await signContract(row.contract_id, {
      signed_date: dayjs().format('YYYY-MM-DD')
    })
    ElMessage.success('签署成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Sign failed:', error)
    }
  }
}

// 查看进度
const handleProgress = async (row) => {
  try {
    const res = await getContractProgress(row.contract_id)
    currentContract.value = res.data || row
    progressDialogVisible.value = true
  } catch (error) {
    console.error('Failed to fetch progress:', error)
    // 如果获取进度失败，使用当前行数据
    currentContract.value = row
    progressDialogVisible.value = true
  }
}

// 计算发货进度
const getShippingProgress = (contract) => {
  if (!contract.contract_amount || contract.contract_amount === 0) return 0
  const shipped = parseFloat(contract.shipped_amount || 0)
  const total = parseFloat(contract.contract_amount)
  return Math.min(Math.round((shipped / total) * 100), 100)
}

// 计算收款进度
const getPaymentProgress = (contract) => {
  if (!contract.contract_amount || contract.contract_amount === 0) return 0
  const received = parseFloat(contract.received_amount || 0)
  const total = parseFloat(contract.contract_amount)
  return Math.min(Math.round((received / total) * 100), 100)
}

// 获取进度条颜色
const getProgressColor = (percentage) => {
  if (percentage >= 100) return '#67c23a'
  if (percentage >= 80) return '#409eff'
  if (percentage >= 50) return '#e6a23c'
  return '#f56c6c'
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除此合同吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteContract(row.contract_id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete failed:', error)
    }
  }
}

// 提交表单
const handleFormSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitLoading.value = true
    try {
      const submitData = { ...form }
      
      if (form.contract_id) {
        await updateContract(form.contract_id, submitData)
        ElMessage.success('更新成功')
      } else {
        await createContract(submitData)
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
  form.contract_id = null
  form.contract_title = ''
  form.customer_id = null
  form.contract_amount = 0
  form.signed_date = ''
  form.delivery_deadline = ''
  form.delivery_terms = ''
  form.additional_terms = ''
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
  fetchCustomers()
  fetchData()
})
</script>

<style scoped>
.contracts-page {
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
