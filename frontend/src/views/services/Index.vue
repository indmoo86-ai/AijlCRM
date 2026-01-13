<template>
  <div class="services-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>售后管理</span>
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

        <el-form-item label="工单状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择"
            clearable
            @clear="handleSearch"
          >
            <el-option label="待处理" value="pending" />
            <el-option label="已解决" value="resolved" />
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
        <el-table-column prop="ticket_no" label="工单编号" width="160" />
        <el-table-column prop="ticket_title" label="工单标题" min-width="180" show-overflow-tooltip />

        <el-table-column prop="ticket_type" label="类型" width="90">
          <template #default="{ row }">
            {{ getTicketTypeLabel(row.ticket_type) }}
          </template>
        </el-table-column>

        <el-table-column prop="customer" label="客户名称" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.customer?.customerName || row.customer?.customer_name || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="product" label="产品" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.product?.product_name || row.product_name || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="total_cost" label="预估费用" width="100">
          <template #default="{ row }">
            <span v-if="row.total_cost > 0">¥{{ Number(row.total_cost).toFixed(2) }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'pending'" type="warning">待处理</el-tag>
            <el-tag v-else-if="row.status === 'resolved'" type="success">已解决</el-tag>
            <el-tag v-else>{{ row.status }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="created_at" label="创建时间" width="160">
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
              <el-button
                v-if="row.status === 'pending'"
                link
                type="success"
                size="small"
                @click="handleResolve(row)"
              >
                解决
              </el-button>
              <el-button
                v-if="row.status === 'pending'"
                link
                type="primary"
                size="small"
                @click="handleAddLog(row)"
              >
                跟踪
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
    
    <!-- 工单详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="工单详情"
      width="800px"
    >
      <template v-if="currentTicket">
        <el-tabs v-model="detailActiveTab">
          <!-- 基本信息 Tab -->
          <el-tab-pane label="基本信息" name="info">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="工单编号">{{ currentTicket.ticket_no }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag v-if="currentTicket.status === 'pending'" type="warning">待处理</el-tag>
                <el-tag v-else-if="currentTicket.status === 'resolved'" type="success">已解决</el-tag>
                <el-tag v-else>{{ currentTicket.status }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="工单标题" :span="2">{{ currentTicket.ticket_title }}</el-descriptions-item>
              <el-descriptions-item label="售后类型">{{ getTicketTypeLabel(currentTicket.ticket_type) }}</el-descriptions-item>
              <el-descriptions-item label="预估费用">¥{{ Number(currentTicket.total_cost || 0).toFixed(2) }}</el-descriptions-item>
              <el-descriptions-item label="客户名称">
                {{ currentTicket.customer?.customerName || currentTicket.customer?.customer_name || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="关联合同">
                {{ currentTicket.contract?.contract_no || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="产品" :span="2">
                {{ currentTicket.product?.product_name || currentTicket.product_name || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ formatDate(currentTicket.created_at) }}</el-descriptions-item>
              <el-descriptions-item label="解决时间">{{ currentTicket.resolved_at ? formatDate(currentTicket.resolved_at) : '-' }}</el-descriptions-item>
              <el-descriptions-item label="问题描述" :span="2">
                {{ currentTicket.problem_description || '-' }}
              </el-descriptions-item>
              <el-descriptions-item v-if="currentTicket.solution" label="解决方案" :span="2">
                {{ currentTicket.solution }}
              </el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>

          <!-- 跟踪记录 Tab -->
          <el-tab-pane name="logs">
            <template #label>
              <span>跟踪记录</span>
              <el-badge
                v-if="currentTicket.logs && currentTicket.logs.length > 0"
                :value="currentTicket.logs.length"
                :max="99"
                class="tab-badge"
              />
            </template>
            <div v-if="currentTicket.logs && currentTicket.logs.length > 0" class="logs-container">
              <el-timeline>
                <el-timeline-item
                  v-for="log in currentTicket.logs"
                  :key="log.log_id"
                  :timestamp="formatDate(log.created_at)"
                  placement="top"
                >
                  <el-card shadow="never">
                    <div class="log-header">
                      <span class="log-operator">{{ log.operator?.name || log.operator?.username || '系统' }}</span>
                      <el-tag size="small" type="info">{{ getLogTypeLabel(log.log_type) }}</el-tag>
                    </div>
                    <p class="log-content">{{ log.log_content }}</p>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </div>
            <el-empty v-else description="暂无跟踪记录" />
          </el-tab-pane>
        </el-tabs>
      </template>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 解决工单对话框 -->
    <el-dialog
      v-model="resolveVisible"
      title="解决工单"
      width="500px"
    >
      <el-form
        ref="resolveFormRef"
        :model="resolveForm"
        :rules="resolveFormRules"
        label-width="80px"
      >
        <el-form-item label="实际费用">
          <el-input-number
            v-model="resolveForm.actual_cost"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="解决方案" prop="actual_solution">
          <el-input
            v-model="resolveForm.actual_solution"
            type="textarea"
            :rows="4"
            placeholder="请输入解决方案"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="resolveVisible = false">取消</el-button>
        <el-button type="primary" :loading="resolveLoading" @click="submitResolve">
          确认解决
        </el-button>
      </template>
    </el-dialog>

    <!-- 添加跟踪记录对话框 -->
    <el-dialog
      v-model="logVisible"
      title="添加跟踪记录"
      width="500px"
    >
      <el-form
        ref="logFormRef"
        :model="logForm"
        :rules="logFormRules"
        label-width="80px"
      >
        <el-form-item label="记录内容" prop="log_content">
          <el-input
            v-model="logForm.log_content"
            type="textarea"
            :rows="4"
            placeholder="请输入跟踪记录内容"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="logVisible = false">取消</el-button>
        <el-button type="primary" :loading="logLoading" @click="submitLog">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getServiceTicketList, resolveServiceTicket, addServiceTicketLog, getServiceTicketDetail } from '@/api/serviceTickets'
import dayjs from 'dayjs'

const loading = ref(false)
const tableData = ref([])

// 详情对话框
const detailVisible = ref(false)
const currentTicket = ref(null)
const detailActiveTab = ref('info')

// 解决工单对话框
const resolveVisible = ref(false)
const resolveLoading = ref(false)
const resolveFormRef = ref(null)
const resolvingTicketId = ref(null)

// 跟踪记录对话框
const logVisible = ref(false)
const logLoading = ref(false)
const logFormRef = ref(null)
const loggingTicketId = ref(null)

const searchForm = reactive({
  ticketNo: '',
  customerName: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const resolveForm = reactive({
  actual_cost: 0,
  actual_solution: ''
})

const logForm = reactive({
  log_content: ''
})

const resolveFormRules = {
  actual_solution: [
    { required: true, message: '请输入解决方案', trigger: 'blur' }
  ]
}

const logFormRules = {
  log_content: [
    { required: true, message: '请输入记录内容', trigger: 'blur' }
  ]
}

// 工单类型标签
const getTicketTypeLabel = (type) => {
  const typeMap = {
    repair: '维修',
    installation: '安装',
    consultation: '咨询',
    parts_replacement: '配件更换',
    return: '退货',
    malfunction: '故障报修',
    complaint: '投诉',
    maintenance: '维护保养',
    other: '其他'
  }
  return typeMap[type] || type
}

// 跟踪记录类型标签
const getLogTypeLabel = (type) => {
  const typeMap = {
    comment: '跟踪记录',
    status_change: '状态变更',
    assign: '工单分配',
    rating: '客户评价',
    other: '其他'
  }
  return typeMap[type] || '跟踪记录'
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
    tableData.value = res.data.list || res.data.rows || []
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

// 查看详情
const handleView = async (row) => {
  try {
    detailActiveTab.value = 'info' // 重置到基本信息tab
    const res = await getServiceTicketDetail(row.ticket_id)
    currentTicket.value = res.data
    detailVisible.value = true
  } catch (error) {
    console.error('Failed to fetch ticket detail:', error)
    // 如果获取详情失败，使用列表数据
    currentTicket.value = row
    detailVisible.value = true
  }
}

// 解决工单 - 打开解决对话框
const handleResolve = (row) => {
  resolvingTicketId.value = row.ticket_id
  resolveForm.actual_cost = row.total_cost || 0
  resolveForm.actual_solution = ''
  resolveVisible.value = true
}

// 提交解决
const submitResolve = async () => {
  if (!resolveFormRef.value) return

  await resolveFormRef.value.validate(async (valid) => {
    if (!valid) return

    resolveLoading.value = true
    try {
      await resolveServiceTicket(resolvingTicketId.value, {
        total_cost: resolveForm.actual_cost,
        actual_solution: resolveForm.actual_solution
      })
      ElMessage.success('工单已解决')
      resolveVisible.value = false
      fetchData()
    } catch (error) {
      console.error('Resolve failed:', error)
      ElMessage.error('操作失败')
    } finally {
      resolveLoading.value = false
    }
  })
}

// 添加跟踪记录 - 打开对话框
const handleAddLog = (row) => {
  loggingTicketId.value = row.ticket_id
  logForm.log_content = ''
  logVisible.value = true
}

// 提交跟踪记录
const submitLog = async () => {
  if (!logFormRef.value) return

  await logFormRef.value.validate(async (valid) => {
    if (!valid) return

    logLoading.value = true
    try {
      await addServiceTicketLog(loggingTicketId.value, {
        log_content: logForm.log_content
      })
      ElMessage.success('跟踪记录添加成功')
      logVisible.value = false
      fetchData()
    } catch (error) {
      console.error('Add log failed:', error)
      ElMessage.error('操作失败')
    } finally {
      logLoading.value = false
    }
  })
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

/* Tab badge 样式 */
.tab-badge {
  margin-left: 6px;
}

/* 跟踪记录样式 */
.logs-container {
  padding: 10px 0;
  max-height: 400px;
  overflow-y: auto;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.log-operator {
  font-weight: 600;
  color: #303133;
}

.log-content {
  margin: 0;
  color: #606266;
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>
