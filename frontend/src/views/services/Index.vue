<template>
  <div class="services-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>售后管理</span>
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            新建工单
          </el-button>
        </div>
      </template>
      
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="工单号">
          <el-input
            v-model="searchForm.ticketNo"
            placeholder="请输入工单号"
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
        
        <el-form-item label="优先级">
          <el-select
            v-model="searchForm.priority"
            placeholder="请选择"
            clearable
            @clear="handleSearch"
          >
            <el-option label="紧急" value="urgent" />
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="工单状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择"
            clearable
            @clear="handleSearch"
          >
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="in_progress" />
            <el-option label="待客户确认" value="waiting_customer" />
            <el-option label="已解决" value="resolved" />
            <el-option label="已关闭" value="closed" />
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
        <el-table-column prop="ticket_no" label="工单编号" width="150" />
        <el-table-column prop="ticket_title" label="工单标题" width="200" />
        
        <el-table-column prop="ticket_type" label="工单类型" width="120">
          <template #default="{ row }">
            <span v-if="row.ticket_type === 'malfunction'">故障报修</span>
            <span v-else-if="row.ticket_type === 'consultation'">咨询</span>
            <span v-else-if="row.ticket_type === 'complaint'">投诉</span>
            <span v-else-if="row.ticket_type === 'maintenance'">维护保养</span>
            <span v-else>{{ row.ticket_type }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="customer" label="客户名称" width="180">
          <template #default="{ row }">
            {{ row.customer?.customerName || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="product_name" label="产品名称" width="150" />
        
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.priority === 'urgent'" type="danger">紧急</el-tag>
            <el-tag v-else-if="row.priority === 'high'" type="warning">高</el-tag>
            <el-tag v-else-if="row.priority === 'medium'" type="primary">中</el-tag>
            <el-tag v-else type="info">低</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'pending'" type="warning">待处理</el-tag>
            <el-tag v-else-if="row.status === 'in_progress'" type="primary">处理中</el-tag>
            <el-tag v-else-if="row.status === 'waiting_customer'" type="">待客户确认</el-tag>
            <el-tag v-else-if="row.status === 'resolved'" type="success">已解决</el-tag>
            <el-tag v-else-if="row.status === 'closed'" type="info">已关闭</el-tag>
            <el-tag v-else>{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="assigned_to" label="处理人" width="100">
          <template #default="{ row }">
            {{ row.assignee?.username || '-' }}
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
                v-if="row.status === 'pending'"
                link
                type="success"
                size="small"
                @click="handleAssign(row)"
              >
                接单
              </el-button>
              <el-button
                v-if="row.status === 'in_progress'"
                link
                type="warning"
                size="small"
                @click="handleResolve(row)"
              >
                解决
              </el-button>
              <el-button
                v-if="row.status === 'resolved'"
                link
                type="primary"
                size="small"
                @click="handleClose(row)"
              >
                关闭
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
    
    <!-- 新建工单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="新建售后工单"
      width="900px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="工单标题" prop="ticket_title">
          <el-input v-model="form.ticket_title" placeholder="请输入工单标题" />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工单类型" prop="ticket_type">
              <el-select v-model="form.ticket_type" placeholder="请选择" style="width: 100%">
                <el-option label="故障报修" value="malfunction" />
                <el-option label="咨询" value="consultation" />
                <el-option label="投诉" value="complaint" />
                <el-option label="维护保养" value="maintenance" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="form.priority" placeholder="请选择" style="width: 100%">
                <el-option label="紧急" value="urgent" />
                <el-option label="高" value="high" />
                <el-option label="中" value="medium" />
                <el-option label="低" value="low" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
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
            <el-form-item label="关联合同" prop="contract_id">
              <el-select
                v-model="form.contract_id"
                placeholder="请选择合同（可选）"
                filterable
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="contract in contracts"
                  :key="contract.contract_id"
                  :label="contract.contract_no"
                  :value="contract.contract_id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品" prop="product_id">
              <el-select
                v-model="form.product_id"
                placeholder="请选择产品（可选）"
                filterable
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="product in products"
                  :key="product.product_id"
                  :label="`${product.product_code} - ${product.product_name}`"
                  :value="product.product_id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人电话" prop="contact_phone">
              <el-input v-model="form.contact_phone" placeholder="请输入联系人电话" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="问题描述" prop="problem_description">
          <el-input
            v-model="form.problem_description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述遇到的问题"
          />
        </el-form-item>
        
        <el-form-item label="期望解决方案" prop="expected_solution">
          <el-input
            v-model="form.expected_solution"
            type="textarea"
            :rows="2"
            placeholder="请输入客户期望的解决方案"
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
import { getServiceTicketList, createServiceTicket, deleteServiceTicket, assignServiceTicket, closeServiceTicket } from '@/api/services'
import { getCustomerList } from '@/api/customers'
import { getContractList } from '@/api/contracts'
import { getProductList } from '@/api/products'
import dayjs from 'dayjs'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)
const tableData = ref([])
const customers = ref([])
const contracts = ref([])
const products = ref([])

const searchForm = reactive({
  ticketNo: '',
  customerName: '',
  priority: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  ticket_title: '',
  ticket_type: '',
  priority: 'medium',
  customer_id: null,
  contract_id: null,
  product_id: null,
  contact_phone: '',
  problem_description: '',
  expected_solution: ''
})

const formRules = {
  ticket_title: [
    { required: true, message: '请输入工单标题', trigger: 'blur' }
  ],
  ticket_type: [
    { required: true, message: '请选择工单类型', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  customer_id: [
    { required: true, message: '请选择客户', trigger: 'change' }
  ],
  problem_description: [
    { required: true, message: '请输入问题描述', trigger: 'blur' }
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

// 获取合同列表
const fetchContracts = async () => {
  try {
    const res = await getContractList({ pageSize: 1000 })
    contracts.value = res.data.rows || []
  } catch (error) {
    console.error('Failed to fetch contracts:', error)
  }
}

// 获取产品列表
const fetchProducts = async () => {
  try {
    const res = await getProductList({ pageSize: 1000 })
    products.value = res.data.rows || []
  } catch (error) {
    console.error('Failed to fetch products:', error)
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
    const res = await getServiceTicketList(params)
    tableData.value = res.data.rows || []
    pagination.total = res.data.total || 0
  } catch (error) {
    console.error('Failed to fetch service tickets:', error)
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
  searchForm.ticketNo = ''
  searchForm.customerName = ''
  searchForm.priority = ''
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
  resetForm()
  dialogVisible.value = true
}

// 查看
const handleView = (row) => {
  ElMessage.info('查看详情功能开发中')
}

// 接单（分配给自己）
const handleAssign = async (row) => {
  try {
    await ElMessageBox.confirm('确定要接单处理此工单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await assignServiceTicket(row.ticket_id, {
      // assigned_to 会由后端根据当前登录用户自动填充
    })
    ElMessage.success('接单成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Assign failed:', error)
    }
  }
}

// 解决工单
const handleResolve = async (row) => {
  try {
    const { value: solution } = await ElMessageBox.prompt('请输入解决方案', '解决工单', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputValidator: (value) => {
        if (!value) {
          return '请输入解决方案'
        }
        return true
      }
    })
    
    ElMessage.success('工单已标记为已解决')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Resolve failed:', error)
    }
  }
}

// 关闭工单
const handleClose = async (row) => {
  try {
    await ElMessageBox.confirm('确定要关闭此工单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await closeServiceTicket(row.ticket_id, {})
    ElMessage.success('关闭成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Close failed:', error)
    }
  }
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除此工单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteServiceTicket(row.ticket_id)
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
      await createServiceTicket(form)
      ElMessage.success('创建成功')
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
  form.ticket_title = ''
  form.ticket_type = ''
  form.priority = 'medium'
  form.customer_id = null
  form.contract_id = null
  form.product_id = null
  form.contact_phone = ''
  form.problem_description = ''
  form.expected_solution = ''
}

// 格式化日期
const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
}

// 组件挂载时获取数据
onMounted(() => {
  fetchCustomers()
  fetchContracts()
  fetchProducts()
  fetchData()
})
</script>

<style scoped>
.services-page {
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
