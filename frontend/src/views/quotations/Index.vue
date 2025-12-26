<template>
  <div class="quotations-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>报价管理</span>
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            新建报价单
          </el-button>
        </div>
      </template>
      
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="报价单号">
          <el-input
            v-model="searchForm.quotationNo"
            placeholder="请输入报价单号"
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
        
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择"
            clearable
            @clear="handleSearch"
          >
            <el-option label="草稿" value="draft" />
            <el-option label="已提交" value="submitted" />
            <el-option label="已批准" value="approved" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="已转合同" value="converted" />
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
        <el-table-column prop="quotation_no" label="报价单号" width="150" />
        
        <el-table-column prop="customer" label="客户名称" width="200">
          <template #default="{ row }">
            {{ row.customer?.customerName || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="quotation_date" label="报价日期" width="120" />
        <el-table-column prop="valid_until" label="有效期至" width="120" />
        
        <el-table-column prop="total_amount" label="报价金额" width="130" align="right">
          <template #default="{ row }">
            ¥{{ formatAmount(row.total_amount) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="version" label="版本" width="80" align="center" />
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'draft'" type="info">草稿</el-tag>
            <el-tag v-else-if="row.status === 'submitted'" type="primary">已提交</el-tag>
            <el-tag v-else-if="row.status === 'approved'" type="success">已批准</el-tag>
            <el-tag v-else-if="row.status === 'rejected'" type="danger">已拒绝</el-tag>
            <el-tag v-else-if="row.status === 'converted'" type="warning">已转合同</el-tag>
            <el-tag v-else>{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="owner" label="负责人" width="100">
          <template #default="{ row }">
            {{ row.owner?.username || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="created_at" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="280" fixed="right">
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
                v-if="row.status === 'draft'"
                link
                type="success"
                size="small"
                @click="handleSubmit(row)"
              >
                提交
              </el-button>
              <el-button
                v-if="row.status === 'approved'"
                link
                type="warning"
                size="small"
                @click="handleConvert(row)"
              >
                转合同
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
    
    <!-- 新建/编辑报价单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="110px"
      >
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
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="报价日期" prop="quotation_date">
              <el-date-picker
                v-model="form.quotation_date"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="有效期至" prop="valid_until">
              <el-date-picker
                v-model="form.valid_until"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="报价金额" prop="total_amount">
          <el-input-number
            v-model="form.total_amount"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="0.00"
          />
        </el-form-item>
        
        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="4"
            placeholder="请输入备注信息"
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { getQuotationList, createQuotation, updateQuotation, deleteQuotation, submitQuotation, convertToContract } from '@/api/quotations'
import { getCustomerList } from '@/api/customers'
import dayjs from 'dayjs'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新建报价单')
const formRef = ref(null)
const tableData = ref([])
const customers = ref([])

const searchForm = reactive({
  quotationNo: '',
  customerName: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  quotation_id: null,
  customer_id: null,
  quotation_date: '',
  valid_until: '',
  total_amount: 0,
  notes: ''
})

const formRules = {
  customer_id: [
    { required: true, message: '请选择客户', trigger: 'change' }
  ],
  quotation_date: [
    { required: true, message: '请选择报价日期', trigger: 'change' }
  ],
  valid_until: [
    { required: true, message: '请选择有效期', trigger: 'change' }
  ],
  total_amount: [
    { required: true, message: '请输入报价金额', trigger: 'blur' }
  ]
}

// 获取客户列表
const fetchCustomers = async () => {
  try {
    const res = await getCustomerList({ pageSize: 1000 })
    customers.value = res.data.rows || []
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
    const res = await getQuotationList(params)
    tableData.value = res.data.rows || []
    pagination.total = res.data.total || 0
  } catch (error) {
    console.error('Failed to fetch quotations:', error)
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
  searchForm.quotationNo = ''
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
  dialogTitle.value = '新建报价单'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑报价单'
  Object.assign(form, {
    quotation_id: row.quotation_id,
    customer_id: row.customer_id,
    quotation_date: row.quotation_date,
    valid_until: row.valid_until,
    total_amount: parseFloat(row.total_amount) || 0,
    notes: row.notes
  })
  dialogVisible.value = true
}

// 查看
const handleView = (row) => {
  ElMessage.info('查看详情功能开发中')
}

// 提交报价单
const handleSubmit = async (row) => {
  try {
    await ElMessageBox.confirm('确定要提交此报价单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await submitQuotation(row.quotation_id)
    ElMessage.success('提交成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Submit failed:', error)
    }
  }
}

// 转合同
const handleConvert = async (row) => {
  try {
    await ElMessageBox.confirm('确定要将此报价单转为合同吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await convertToContract(row.quotation_id, {})
    ElMessage.success('转合同成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Convert failed:', error)
    }
  }
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除此报价单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteQuotation(row.quotation_id)
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
      
      if (form.quotation_id) {
        await updateQuotation(form.quotation_id, submitData)
        ElMessage.success('更新成功')
      } else {
        await createQuotation(submitData)
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
  form.quotation_id = null
  form.customer_id = null
  form.quotation_date = ''
  form.valid_until = ''
  form.total_amount = 0
  form.notes = ''
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
.quotations-page {
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
