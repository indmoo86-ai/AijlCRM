<template>
  <div class="tasks-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>任务中心</span>
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            新建任务
          </el-button>
        </div>
      </template>
      
      <!-- 任务统计卡片 -->
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-number pending">{{ stats.pending || 0 }}</div>
              <div class="stat-label">待处理</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-number in-progress">{{ stats.in_progress || 0 }}</div>
              <div class="stat-label">进行中</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-number overdue">{{ stats.overdue || 0 }}</div>
              <div class="stat-label">已逾期</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-number completed">{{ stats.completed || 0 }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="任务标题">
          <el-input
            v-model="searchForm.taskTitle"
            placeholder="请输入任务标题"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="任务类型">
          <el-select
            v-model="searchForm.taskType"
            placeholder="请选择"
            clearable
            @clear="handleSearch"
          >
            <el-option label="跟进线索" value="follow_lead" />
            <el-option label="拜访客户" value="visit_customer" />
            <el-option label="准备报价" value="prepare_quotation" />
            <el-option label="准备合同" value="prepare_contract" />
            <el-option label="安排发货" value="arrange_shipment" />
            <el-option label="收款提醒" value="payment_reminder" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="优先级">
          <el-select
            v-model="searchForm.priority"
            placeholder="请选择"
            clearable
            @clear="handleSearch"
          >
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="任务状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择"
            clearable
            @clear="handleSearch"
          >
            <el-option label="待处理" value="pending" />
            <el-option label="进行中" value="in_progress" />
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
        <el-table-column prop="task_title" label="任务标题" width="200" />
        
        <el-table-column prop="task_type" label="任务类型" width="120">
          <template #default="{ row }">
            <span v-if="row.task_type === 'follow_lead'">跟进线索</span>
            <span v-else-if="row.task_type === 'visit_customer'">拜访客户</span>
            <span v-else-if="row.task_type === 'prepare_quotation'">准备报价</span>
            <span v-else-if="row.task_type === 'prepare_contract'">准备合同</span>
            <span v-else-if="row.task_type === 'arrange_shipment'">安排发货</span>
            <span v-else-if="row.task_type === 'payment_reminder'">收款提醒</span>
            <span v-else>{{ row.task_type }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="source_type" label="关联对象" width="150">
          <template #default="{ row }">
            <span v-if="row.source_type === 'lead'">线索</span>
            <span v-else-if="row.source_type === 'customer'">客户</span>
            <span v-else-if="row.source_type === 'quotation'">报价单</span>
            <span v-else-if="row.source_type === 'contract'">合同</span>
            <span v-else-if="row.source_type">{{ row.source_type }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.priority === 'high'" type="danger">高</el-tag>
            <el-tag v-else-if="row.priority === 'medium'" type="warning">中</el-tag>
            <el-tag v-else type="info">低</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'pending'" type="warning">待处理</el-tag>
            <el-tag v-else-if="row.status === 'in_progress'" type="primary">进行中</el-tag>
            <el-tag v-else-if="row.status === 'completed'" type="success">已完成</el-tag>
            <el-tag v-else-if="row.status === 'cancelled'" type="info">已取消</el-tag>
            <el-tag v-else>{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="due_date" label="截止日期" width="120">
          <template #default="{ row }">
            <span :class="{ 'overdue-text': isOverdue(row.due_date, row.status) }">
              {{ row.due_date || '-' }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column prop="assignee" label="负责人" width="100">
          <template #default="{ row }">
            {{ row.assignee?.username || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="assigner" label="创建人" width="100">
          <template #default="{ row }">
            {{ row.assigner?.username || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="created_at" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="220" fixed="right">
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
                @click="handleStart(row)"
              >
                开始
              </el-button>
              <el-button
                v-if="row.status === 'in_progress'"
                link
                type="warning"
                size="small"
                @click="handleComplete(row)"
              >
                完成
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
    
    <!-- 新建任务对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="新建任务"
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
        <el-form-item label="任务标题" prop="task_title">
          <el-input v-model="form.task_title" placeholder="请输入任务标题" />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="任务类型" prop="task_type">
              <el-select v-model="form.task_type" placeholder="请选择" style="width: 100%">
                <el-option label="跟进线索" value="follow_lead" />
                <el-option label="拜访客户" value="visit_customer" />
                <el-option label="准备报价" value="prepare_quotation" />
                <el-option label="准备合同" value="prepare_contract" />
                <el-option label="安排发货" value="arrange_shipment" />
                <el-option label="收款提醒" value="payment_reminder" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="form.priority" placeholder="请选择" style="width: 100%">
                <el-option label="高" value="high" />
                <el-option label="中" value="medium" />
                <el-option label="低" value="low" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="截止日期" prop="due_date">
              <el-date-picker
                v-model="form.due_date"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="截止时间" prop="due_time">
              <el-time-picker
                v-model="form.due_time"
                placeholder="选择时间"
                style="width: 100%"
                value-format="HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="任务描述" prop="task_description">
          <el-input
            v-model="form.task_description"
            type="textarea"
            :rows="4"
            placeholder="请输入任务描述"
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
import { getTaskList, createTask, deleteTask, completeTask } from '@/api/tasks'
import dayjs from 'dayjs'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)
const tableData = ref([])
const stats = reactive({
  pending: 0,
  in_progress: 0,
  overdue: 0,
  completed: 0
})

const searchForm = reactive({
  taskTitle: '',
  taskType: '',
  priority: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  task_title: '',
  task_type: '',
  priority: 'medium',
  due_date: '',
  due_time: '',
  task_description: ''
})

const formRules = {
  task_title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' }
  ],
  task_type: [
    { required: true, message: '请选择任务类型', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ]
}

// 判断是否逾期
const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'completed' || status === 'cancelled') return false
  return dayjs(dueDate).isBefore(dayjs(), 'day')
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
    const res = await getTaskList(params)
    tableData.value = res.data.list || res.data.rows || []
    pagination.total = res.data.total || res.data.pagination?.total || 0
    
    // 更新统计数据
    if (res.data.stats) {
      Object.assign(stats, res.data.stats)
    }
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
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
  searchForm.taskTitle = ''
  searchForm.taskType = ''
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

// 开始任务
const handleStart = async (row) => {
  try {
    await ElMessageBox.confirm('确定要开始此任务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    ElMessage.success('任务已开始')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Start failed:', error)
    }
  }
}

// 完成任务
const handleComplete = async (row) => {
  try {
    const { value: result } = await ElMessageBox.prompt('请输入完成情况说明', '完成任务', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputValidator: (value) => {
        if (!value) {
          return '请输入完成情况说明'
        }
        return true
      }
    })
    
    await completeTask(row.task_id, { completion_note: result })
    ElMessage.success('任务已完成')
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
    await ElMessageBox.confirm('确定要删除此任务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteTask(row.task_id)
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
      await createTask(form)
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
  form.task_title = ''
  form.task_type = ''
  form.priority = 'medium'
  form.due_date = ''
  form.due_time = ''
  form.task_description = ''
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
.tasks-page {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-card {
  text-align: center;
  cursor: pointer;
}

.stat-content {
  padding: 10px 0;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-number.pending {
  color: #e6a23c;
}

.stat-number.in-progress {
  color: #409eff;
}

.stat-number.overdue {
  color: #f56c6c;
}

.stat-number.completed {
  color: #67c23a;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.search-form {
  margin-bottom: 20px;
}

.table-actions {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.overdue-text {
  color: #f56c6c;
  font-weight: bold;
}
</style>
