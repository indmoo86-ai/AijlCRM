<template>
  <div class="payments-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>收款管理</span>
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            新建收款记录
          </el-button>
        </div>
      </template>
      
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="收款编号">
          <el-input
            v-model="searchForm.paymentNo"
            placeholder="请输入收款编号"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="合同编号">
          <el-input
            v-model="searchForm.contractNo"
            placeholder="请输入合同编号"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="收款状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择"
            clearable
            @clear="handleSearch"
          >
            <el-option label="待确认" value="pending" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="已作废" value="void" />
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
        show-summary
        :summary-method="getSummaries"
      >
        <el-table-column prop="payment_no" label="收款编号" width="150" />
        
        <el-table-column prop="contract" label="合同编号" width="150">
          <template #default="{ row }">
            {{ row.contract?.contract_no || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="customer" label="客户名称" width="180">
          <template #default="{ row }">
            {{ row.customer?.customerName || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="payment_stage" label="收款阶段" width="120" />
        
        <el-table-column prop="payment_amount" label="收款金额" width="130" align="right">
          <template #default="{ row }">
            ¥{{ formatAmount(row.payment_amount) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="payment_date" label="收款日期" width="120" />
        
        <el-table-column prop="payment_method" label="收款方式" width="120">
          <template #default="{ row }">
            <span v-if="row.payment_method === 'bank_transfer'">银行转账</span>
            <span v-else-if="row.payment_method === 'cash'">现金</span>
            <span v-else-if="row.payment_method === 'check'">支票</span>
            <span v-else-if="row.payment_method === 'online'">在线支付</span>
            <span v-else>{{ row.payment_method }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="transaction_no" label="交易单号" width="150" />
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'pending'" type="warning">待确认</el-tag>
            <el-tag v-else-if="row.status === 'confirmed'" type="success">已确认</el-tag>
            <el-tag v-else-if="row.status === 'void'" type="danger">已作废</el-tag>
            <el-tag v-else>{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="created_at" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="240" fixed="right">
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
                @click="handleConfirm(row)"
              >
                确认收款
              </el-button>
              <el-button
                v-if="row.status === 'confirmed'"
                link
                type="danger"
                size="small"
                @click="handleVoid(row)"
              >
                作废
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
    
    <!-- 新建收款记录对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="新建收款记录"
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
        <el-form-item label="关联合同" prop="contract_id">
          <el-select
            v-model="form.contract_id"
            placeholder="请选择合同"
            filterable
            style="width: 100%"
            @change="handleContractChange"
          >
            <el-option
              v-for="contract in contracts"
              :key="contract.contract_id"
              :label="`${contract.contract_no} - ${contract.contract_title}`"
              :value="contract.contract_id"
            />
          </el-select>
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="收款阶段" prop="payment_stage">
              <el-select v-model="form.payment_stage" placeholder="请选择" style="width: 100%">
                <el-option label="首付款" value="首付款" />
                <el-option label="进度款" value="进度款" />
                <el-option label="尾款" value="尾款" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="收款金额" prop="payment_amount">
              <el-input-number
                v-model="form.payment_amount"
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
            <el-form-item label="收款日期" prop="payment_date">
              <el-date-picker
                v-model="form.payment_date"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="收款方式" prop="payment_method">
              <el-select v-model="form.payment_method" placeholder="请选择" style="width: 100%">
                <el-option label="银行转账" value="bank_transfer" />
                <el-option label="现金" value="cash" />
                <el-option label="支票" value="check" />
                <el-option label="在线支付" value="online" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="收款账户" prop="bank_account">
          <el-input v-model="form.bank_account" placeholder="请输入收款银行账户" />
        </el-form-item>
        
        <el-form-item label="交易单号" prop="transaction_no">
          <el-input v-model="form.transaction_no" placeholder="请输入银行流水号或交易单号" />
        </el-form-item>
        
        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="3"
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
import { getPaymentList, createPayment, deletePayment, confirmPayment, voidPayment } from '@/api/payments'
import { getContractList } from '@/api/contracts'
import dayjs from 'dayjs'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)
const tableData = ref([])
const contracts = ref([])

const searchForm = reactive({
  paymentNo: '',
  contractNo: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  contract_id: null,
  customer_id: null,
  payment_stage: '',
  payment_amount: 0,
  payment_date: '',
  payment_method: '',
  bank_account: '',
  transaction_no: '',
  notes: ''
})

const formRules = {
  contract_id: [
    { required: true, message: '请选择关联合同', trigger: 'change' }
  ],
  payment_stage: [
    { required: true, message: '请选择收款阶段', trigger: 'change' }
  ],
  payment_amount: [
    { required: true, message: '请输入收款金额', trigger: 'blur' }
  ],
  payment_date: [
    { required: true, message: '请选择收款日期', trigger: 'change' }
  ],
  payment_method: [
    { required: true, message: '请选择收款方式', trigger: 'change' }
  ]
}

// 获取合同列表
const fetchContracts = async () => {
  try {
    const res = await getContractList({ pageSize: 1000, status: 'active' })
    contracts.value = res.data.list || res.data.rows || []
  } catch (error) {
    console.error('Failed to fetch contracts:', error)
  }
}

// 合同变更时自动填充客户信息
const handleContractChange = (contractId) => {
  const contract = contracts.value.find(c => c.contract_id === contractId)
  if (contract) {
    form.customer_id = contract.customer_id
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
    const res = await getPaymentList(params)
    tableData.value = res.data.list || res.data.rows || []
    pagination.total = res.data.total || 0
  } catch (error) {
    console.error('Failed to fetch payments:', error)
  } finally {
    loading.value = false
  }
}

// 合计行
const getSummaries = (param) => {
  const { columns, data } = param
  const sums = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    if (column.property === 'payment_amount') {
      const values = data.map(item => Number(item[column.property]))
      const sum = values.reduce((prev, curr) => {
        const value = Number(curr)
        if (!isNaN(value)) {
          return prev + curr
        } else {
          return prev
        }
      }, 0)
      sums[index] = '¥' + formatAmount(sum)
    } else {
      sums[index] = ''
    }
  })
  return sums
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.paymentNo = ''
  searchForm.contractNo = ''
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

// 确认收款
const handleConfirm = async (row) => {
  try {
    await ElMessageBox.confirm('确定要确认此收款记录吗？确认后将更新合同收款金额。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await confirmPayment(row.payment_id)
    ElMessage.success('确认成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Confirm failed:', error)
    }
  }
}

// 作废
const handleVoid = async (row) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入作废原因', '作废收款记录', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputValidator: (value) => {
        if (!value) {
          return '请输入作废原因'
        }
        return true
      }
    })
    
    await voidPayment(row.payment_id, { void_reason: reason })
    ElMessage.success('作废成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Void failed:', error)
    }
  }
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除此收款记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deletePayment(row.payment_id)
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
      await createPayment(form)
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
  form.contract_id = null
  form.customer_id = null
  form.payment_stage = ''
  form.payment_amount = 0
  form.payment_date = ''
  form.payment_method = ''
  form.bank_account = ''
  form.transaction_no = ''
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
  fetchContracts()
  fetchData()
})
</script>

<style scoped>
.payments-page {
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
