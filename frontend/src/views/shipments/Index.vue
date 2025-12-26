<template>
  <div class="shipments-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>发货管理</span>
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            新建发货单
          </el-button>
        </div>
      </template>
      
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="发货单号">
          <el-input
            v-model="searchForm.shipmentNo"
            placeholder="请输入发货单号"
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
        
        <el-form-item label="发货状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择"
            clearable
            @clear="handleSearch"
          >
            <el-option label="草稿" value="draft" />
            <el-option label="待发货" value="pending" />
            <el-option label="已发货" value="shipped" />
            <el-option label="运输中" value="in_transit" />
            <el-option label="已送达" value="delivered" />
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
        <el-table-column prop="shipment_no" label="发货单号" width="150" />
        <el-table-column prop="shipment_title" label="发货单标题" width="200" />
        
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
        
        <el-table-column prop="shipment_amount" label="发货金额" width="120" align="right">
          <template #default="{ row }">
            ¥{{ formatAmount(row.shipment_amount) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'draft'" type="info">草稿</el-tag>
            <el-tag v-else-if="row.status === 'pending'" type="warning">待发货</el-tag>
            <el-tag v-else-if="row.status === 'shipped'" type="primary">已发货</el-tag>
            <el-tag v-else-if="row.status === 'in_transit'" type="">运输中</el-tag>
            <el-tag v-else-if="row.status === 'delivered'" type="success">已送达</el-tag>
            <el-tag v-else>{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="logistics_company" label="物流公司" width="120" />
        <el-table-column prop="tracking_no" label="运单号" width="150" />
        
        <el-table-column prop="planned_ship_date" label="计划发货日期" width="120" />
        <el-table-column prop="actual_ship_date" label="实际发货日期" width="120" />
        
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
                v-if="row.status === 'pending'"
                link
                type="success"
                size="small"
                @click="handleConfirm(row)"
              >
                确认发货
              </el-button>
              <el-button
                v-if="row.status === 'shipped' || row.status === 'in_transit'"
                link
                type="warning"
                size="small"
                @click="handleComplete(row)"
              >
                确认送达
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
    
    <!-- 新建/编辑发货单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="发货单标题" prop="shipment_title">
          <el-input v-model="form.shipment_title" placeholder="请输入发货单标题" />
        </el-form-item>
        
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
            <el-form-item label="发货金额" prop="shipment_amount">
              <el-input-number
                v-model="form.shipment_amount"
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
            <el-form-item label="物流公司" prop="logistics_company">
              <el-input v-model="form.logistics_company" placeholder="请输入物流公司" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运单号" prop="tracking_no">
              <el-input v-model="form.tracking_no" placeholder="请输入运单号" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="收货联系人" prop="contact_person">
              <el-input v-model="form.contact_person" placeholder="请输入收货联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contact_phone">
              <el-input v-model="form.contact_phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="收货地址" prop="shipping_address">
          <el-input
            v-model="form.shipping_address"
            type="textarea"
            :rows="2"
            placeholder="请输入收货地址"
          />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划发货日期" prop="planned_ship_date">
              <el-date-picker
                v-model="form.planned_ship_date"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计送达日期" prop="estimated_arrival_date">
              <el-date-picker
                v-model="form.estimated_arrival_date"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
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
import { getShipmentList, createShipment, updateShipment, deleteShipment, confirmShipment, completeShipment } from '@/api/shipments'
import { getContractList } from '@/api/contracts'
import dayjs from 'dayjs'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新建发货单')
const formRef = ref(null)
const tableData = ref([])
const contracts = ref([])

const searchForm = reactive({
  shipmentNo: '',
  contractNo: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  shipment_id: null,
  shipment_title: '',
  contract_id: null,
  customer_id: null,
  shipment_amount: 0,
  logistics_company: '',
  tracking_no: '',
  contact_person: '',
  contact_phone: '',
  shipping_address: '',
  planned_ship_date: '',
  estimated_arrival_date: '',
  notes: ''
})

const formRules = {
  shipment_title: [
    { required: true, message: '请输入发货单标题', trigger: 'blur' }
  ],
  contract_id: [
    { required: true, message: '请选择关联合同', trigger: 'change' }
  ],
  shipment_amount: [
    { required: true, message: '请输入发货金额', trigger: 'blur' }
  ]
}

// 获取合同列表
const fetchContracts = async () => {
  try {
    const res = await getContractList({ pageSize: 1000, status: 'active' })
    contracts.value = res.data.rows || []
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
    const res = await getShipmentList(params)
    tableData.value = res.data.rows || []
    pagination.total = res.data.total || 0
  } catch (error) {
    console.error('Failed to fetch shipments:', error)
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
  searchForm.shipmentNo = ''
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
  dialogTitle.value = '新建发货单'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑发货单'
  Object.assign(form, {
    shipment_id: row.shipment_id,
    shipment_title: row.shipment_title,
    contract_id: row.contract_id,
    customer_id: row.customer_id,
    shipment_amount: parseFloat(row.shipment_amount) || 0,
    logistics_company: row.logistics_company,
    tracking_no: row.tracking_no,
    contact_person: row.contact_person,
    contact_phone: row.contact_phone,
    shipping_address: row.shipping_address,
    planned_ship_date: row.planned_ship_date,
    estimated_arrival_date: row.estimated_arrival_date,
    notes: row.notes
  })
  dialogVisible.value = true
}

// 查看
const handleView = (row) => {
  ElMessage.info('查看详情功能开发中')
}

// 确认发货
const handleConfirm = async (row) => {
  try {
    await ElMessageBox.confirm('确定要确认发货吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await confirmShipment(row.shipment_id, {
      actual_ship_date: dayjs().format('YYYY-MM-DD')
    })
    ElMessage.success('发货确认成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Confirm failed:', error)
    }
  }
}

// 确认送达
const handleComplete = async (row) => {
  try {
    await ElMessageBox.confirm('确定货物已送达吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await completeShipment(row.shipment_id)
    ElMessage.success('送达确认成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Complete failed:', error)
    }
  }
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除此发货单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteShipment(row.shipment_id)
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
      
      if (form.shipment_id) {
        await updateShipment(form.shipment_id, submitData)
        ElMessage.success('更新成功')
      } else {
        await createShipment(submitData)
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
  form.shipment_id = null
  form.shipment_title = ''
  form.contract_id = null
  form.customer_id = null
  form.shipment_amount = 0
  form.logistics_company = ''
  form.tracking_no = ''
  form.contact_person = ''
  form.contact_phone = ''
  form.shipping_address = ''
  form.planned_ship_date = ''
  form.estimated_arrival_date = ''
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
.shipments-page {
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
