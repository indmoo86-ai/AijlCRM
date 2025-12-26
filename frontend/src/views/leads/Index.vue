<template>
  <div class="leads-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>线索管理</span>
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            新建线索
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
        
        <el-form-item label="意向程度">
          <el-select
            v-model="searchForm.intentionLevel"
            placeholder="请选择"
            clearable
            @clear="handleSearch"
          >
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
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
        <el-table-column prop="leadNo" label="线索编号" width="150" />
        <el-table-column prop="customerName" label="客户名称" width="180" />
        <el-table-column prop="hotelName" label="酒店名称" width="180" />
        <el-table-column prop="city" label="城市" width="120" />
        <el-table-column prop="roomCount" label="房间数" width="100" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        
        <el-table-column prop="intentionLevel" label="意向程度" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.intentionLevel === 'high'" type="danger">高</el-tag>
            <el-tag v-else-if="row.intentionLevel === 'medium'" type="warning">中</el-tag>
            <el-tag v-else type="info">低</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="channelSource" label="来源渠道" width="120" />
        
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" size="small" @click="handleView(row)">
                查看
              </el-button>
              <el-button link type="primary" size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button link type="success" size="small" @click="handleConvert(row)">
                转客户
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
    
    <!-- 新建/编辑线索对话框 -->
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
        <el-form-item label="客户名称" prop="customerName">
          <el-input v-model="form.customerName" placeholder="请输入客户名称" />
        </el-form-item>
        
        <el-form-item label="酒店名称" prop="hotelName">
          <el-input v-model="form.hotelName" placeholder="请输入酒店名称" />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="省份" prop="province">
              <el-input v-model="form.province" placeholder="请输入省份" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="城市" prop="city">
              <el-input v-model="form.city" placeholder="请输入城市" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="房间数量" prop="roomCount">
              <el-input-number
                v-model="form.roomCount"
                :min="1"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="来源渠道" prop="channelSource">
              <el-select v-model="form.channelSource" placeholder="请选择" style="width: 100%">
                <el-option label="官网咨询" value="website" />
                <el-option label="微信公众号" value="wechat" />
                <el-option label="电话咨询" value="phone" />
                <el-option label="展会" value="exhibition" />
                <el-option label="客户转介绍" value="referral" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="意向程度" prop="intentionLevel">
              <el-select v-model="form.intentionLevel" placeholder="请选择" style="width: 100%">
                <el-option label="高" value="high" />
                <el-option label="中" value="medium" />
                <el-option label="低" value="low" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="预估金额" prop="estimatedAmount">
          <el-input-number
            v-model="form.estimatedAmount"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="需求描述" prop="requirement">
          <el-input
            v-model="form.requirement"
            type="textarea"
            :rows="3"
            placeholder="请输入需求描述"
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { getLeadList, createLead, updateLead, convertToCustomer } from '@/api/leads'
import dayjs from 'dayjs'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新建线索')
const formRef = ref(null)
const tableData = ref([])

const searchForm = reactive({
  customerName: '',
  intentionLevel: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  id: null,
  customerName: '',
  hotelName: '',
  province: '',
  city: '',
  roomCount: null,
  phone: '',
  channelSource: '',
  intentionLevel: '',
  estimatedAmount: null,
  requirement: ''
})

const formRules = {
  customerName: [
    { required: true, message: '请输入客户名称', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  channelSource: [
    { required: true, message: '请选择来源渠道', trigger: 'change' }
  ],
  intentionLevel: [
    { required: true, message: '请选择意向程度', trigger: 'change' }
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
    const res = await getLeadList(params)
    tableData.value = res.data.rows || []
    pagination.total = res.data.total || 0
  } catch (error) {
    console.error('Failed to fetch leads:', error)
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
  searchForm.intentionLevel = ''
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
  dialogTitle.value = '新建线索'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑线索'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 查看
const handleView = (row) => {
  ElMessage.info('查看详情功能开发中')
}

// 转客户
const handleConvert = async (row) => {
  try {
    await ElMessageBox.confirm('确定要将此线索转为客户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await convertToCustomer(row.id, {
      customerType: 'single_hotel',
      customerLevel: 'B'
    })
    
    ElMessage.success('转客户成功')
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
    await ElMessageBox.confirm('确定要删除此线索吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
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
      if (form.id) {
        await updateLead(form.id, form)
        ElMessage.success('更新成功')
      } else {
        await createLead(form)
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
  form.hotelName = ''
  form.province = ''
  form.city = ''
  form.roomCount = null
  form.phone = ''
  form.channelSource = ''
  form.intentionLevel = ''
  form.estimatedAmount = null
  form.requirement = ''
}

// 格式化日期
const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
}

// 组件挂载时获取数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.leads-page {
  padding: 0;
}

.search-form {
  margin-bottom: 20px;
}

.table-actions {
  display: flex;
  gap: 5px;
}
</style>
