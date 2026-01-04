<template>
  <div class="invoices-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>发票管理</span>
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            新建发票
          </el-button>
        </div>
      </template>
      
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="发票号码">
          <el-input
            v-model="searchForm.invoiceNo"
            placeholder="请输入发票号码"
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
        
        <el-form-item label="发票状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择"
            clearable
            @clear="handleSearch"
          >
            <el-option label="待开票" value="pending" />
            <el-option label="已开票" value="issued" />
            <el-option label="已邮寄" value="mailed" />
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
        <el-table-column prop="invoice_no" label="发票号码" width="140" />

        <el-table-column prop="contract" label="合同编号" width="130">
          <template #default="{ row }">
            {{ row.contract?.contract_no || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="customer" label="客户名称" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.customer?.customerName || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="invoice_type" label="发票类型" width="100">
          <template #default="{ row }">
            <span v-if="row.invoice_type === 'vat_normal'">普票</span>
            <span v-else-if="row.invoice_type === 'vat_special'">专票</span>
            <span v-else>{{ row.invoice_type }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="invoice_amount" label="开票金额" width="110" align="right">
          <template #default="{ row }">
            ¥{{ formatAmount(row.invoice_amount) }}
          </template>
        </el-table-column>

        <el-table-column prop="invoice_date" label="开票日期" width="100" />

        <el-table-column prop="invoice_title" label="发票抬头" min-width="160" show-overflow-tooltip />

        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'pending'" type="warning">待开票</el-tag>
            <el-tag v-else-if="row.status === 'issued'" type="success">已开票</el-tag>
            <el-tag v-else-if="row.status === 'mailed'" type="primary">已邮寄</el-tag>
            <el-tag v-else-if="row.status === 'void'" type="danger">已作废</el-tag>
            <el-tag v-else>{{ row.status }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="created_at" label="创建时间" width="150">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
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
                开票
              </el-button>
              <el-button
                v-if="row.status === 'issued'"
                link
                type="primary"
                size="small"
                @click="handleMail(row)"
              >
                邮寄
              </el-button>
              <el-button
                v-if="row.status === 'issued'"
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
    
    <!-- 新建发票对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="新建发票"
      width="90%"
      style="max-width: 1200px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
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
          </el-col>
          <el-col :span="12">
            <el-form-item label="发票类型" prop="invoice_type">
              <el-select v-model="form.invoice_type" placeholder="请选择" style="width: 100%">
                <el-option label="增值税普通发票" value="vat_normal" />
                <el-option label="增值税专用发票" value="vat_special" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开票金额" prop="invoice_amount">
              <el-input-number
                v-model="form.invoice_amount"
                :min="0"
                :precision="2"
                style="width: 100%"
                placeholder="0.00"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开票日期" prop="invoice_date">
              <el-date-picker
                v-model="form.invoice_date"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="发票抬头" prop="invoice_title">
          <el-input v-model="form.invoice_title" placeholder="请输入发票抬头（公司名称）" />
        </el-form-item>
        
        <el-form-item label="纳税人识别号" prop="tax_number">
          <el-input v-model="form.tax_number" placeholder="请输入纳税人识别号" />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="公司地址" prop="company_address">
              <el-input v-model="form.company_address" placeholder="请输入公司地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公司电话" prop="company_phone">
              <el-input v-model="form.company_phone" placeholder="请输入公司电话" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开户银行" prop="bank_name">
              <el-input v-model="form.bank_name" placeholder="请输入开户银行" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="银行账号" prop="bank_account">
              <el-input v-model="form.bank_account" placeholder="请输入银行账号" />
            </el-form-item>
          </el-col>
        </el-row>
        
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
import { getInvoiceList, createInvoice, deleteInvoice, confirmInvoice } from '@/api/invoices'
import { getContractList } from '@/api/contracts'
import dayjs from 'dayjs'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)
const tableData = ref([])
const contracts = ref([])

const searchForm = reactive({
  invoiceNo: '',
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
  invoice_type: '',
  invoice_amount: 0,
  invoice_date: '',
  invoice_title: '',
  tax_number: '',
  company_address: '',
  company_phone: '',
  bank_name: '',
  bank_account: '',
  notes: ''
})

const formRules = {
  contract_id: [
    { required: true, message: '请选择关联合同', trigger: 'change' }
  ],
  invoice_type: [
    { required: true, message: '请选择发票类型', trigger: 'change' }
  ],
  invoice_amount: [
    { required: true, message: '请输入开票金额', trigger: 'blur' }
  ],
  invoice_date: [
    { required: true, message: '请选择开票日期', trigger: 'change' }
  ],
  invoice_title: [
    { required: true, message: '请输入发票抬头', trigger: 'blur' }
  ],
  tax_number: [
    { required: true, message: '请输入纳税人识别号', trigger: 'blur' }
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
    // 自动填充客户信息到发票抬头
    if (contract.customer) {
      form.invoice_title = contract.customer.customerName
    }
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
    const res = await getInvoiceList(params)
    tableData.value = res.data.list || res.data.rows || []
    pagination.total = res.data.total || 0
  } catch (error) {
    console.error('Failed to fetch invoices:', error)
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
    if (column.property === 'invoice_amount') {
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
  searchForm.invoiceNo = ''
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

// 确认开票
const handleConfirm = async (row) => {
  try {
    await ElMessageBox.confirm('确定要确认开票吗？确认后将更新合同已开票金额。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await confirmInvoice(row.invoice_id)
    ElMessage.success('确认开票成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Confirm failed:', error)
    }
  }
}

// 确认邮寄
const handleMail = async (row) => {
  try {
    await ElMessageBox.confirm('确定发票已邮寄给客户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    ElMessage.success('确认邮寄成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Mail failed:', error)
    }
  }
}

// 作废
const handleVoid = async (row) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入作废原因', '作废发票', {
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
    await ElMessageBox.confirm('确定要删除此发票记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteInvoice(row.invoice_id)
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
      await createInvoice(form)
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
  form.invoice_type = ''
  form.invoice_amount = 0
  form.invoice_date = ''
  form.invoice_title = ''
  form.tax_number = ''
  form.company_address = ''
  form.company_phone = ''
  form.bank_name = ''
  form.bank_account = ''
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
.invoices-page {
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
