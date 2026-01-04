<template>
  <div class="dashboard">
    <h2 class="page-title">工作台</h2>

    <!-- 统计卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card-wrapper">
          <div class="stat-card">
            <div class="stat-icon" style="background: #ecf5ff; color: #409eff;">
              <el-icon :size="30"><Opportunity /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">线索总数</div>
              <div class="stat-value">{{ stats.leads || 0 }}</div>
              <div class="stat-change positive">+{{ stats.leadsChange || 0 }} 本月新增</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card-wrapper">
          <div class="stat-card">
            <div class="stat-icon" style="background: #f0f9ff; color: #67c23a;">
              <el-icon :size="30"><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">客户总数</div>
              <div class="stat-value">{{ stats.customers || 0 }}</div>
              <div class="stat-change positive">+{{ stats.customersChange || 0 }} 本月新增</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card-wrapper">
          <div class="stat-card">
            <div class="stat-icon" style="background: #fef0f0; color: #f56c6c;">
              <el-icon :size="30"><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">待办任务</div>
              <div class="stat-value">{{ stats.pendingTasks || 0 }}</div>
              <div class="stat-change negative">{{ stats.overdueTasks || 0 }} 已逾期</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card-wrapper">
          <div class="stat-card">
            <div class="stat-icon" style="background: #fdf6ec; color: #e6a23c;">
              <el-icon :size="30"><Money /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">本月合同金额</div>
              <div class="stat-value">{{ formatAmount(stats.monthlyContract) }}</div>
              <div class="stat-change positive">{{ stats.contractCount || 0 }} 个合同</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <!-- 销售漏斗 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>销售漏斗</span>
            </div>
          </template>
          <div ref="salesFunnelChart" style="height: 350px;"></div>
        </el-card>
      </el-col>

      <!-- 业绩趋势 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>业绩趋势</span>
              <el-radio-group v-model="trendPeriod" size="small" @change="loadMonthlyTrend">
                <el-radio-button label="6">近6月</el-radio-button>
                <el-radio-button label="12">近12月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="performanceTrendChart" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-bottom: 20px;">
      <!-- 任务完成情况 -->
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>任务完成情况</span>
            </div>
          </template>
          <div ref="taskStatusChart" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <!-- 客户类型分布 -->
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>客户类型分布</span>
            </div>
          </template>
          <div ref="customerTypeChart" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <!-- 产品销售排行 -->
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>产品销售TOP5</span>
            </div>
          </template>
          <div ref="productRankChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作和待办任务 -->
    <el-row :gutter="20">
      <!-- 快捷操作 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" :icon="Plus" @click="goToCreate('lead')">新建线索</el-button>
            <el-button type="success" :icon="Plus" @click="goToCreate('customer')">新建客户</el-button>
            <el-button type="warning" :icon="Document" @click="goToCreate('quotation')">创建报价</el-button>
            <el-button type="danger" :icon="Files" @click="goToCreate('contract')">创建合同</el-button>
            <el-button type="info" :icon="Plus" @click="goToCreate('task')">新建任务</el-button>
            <el-button :icon="Tickets" @click="goToCreate('service')">创建工单</el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 待办任务 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>我的待办</span>
              <el-link type="primary" @click="goToTasks">查看全部</el-link>
            </div>
          </template>
          <el-timeline v-if="todoTasks.length > 0">
            <el-timeline-item
              v-for="task in todoTasks"
              :key="task.task_id"
              :timestamp="formatDate(task.due_date)"
              placement="top"
              :type="getTaskTimelineType(task)"
            >
              <div class="timeline-content">
                <div class="task-title">{{ task.task_title }}</div>
                <el-tag :type="getTaskPriorityType(task.priority)" size="small">
                  {{ task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低' }}
                </el-tag>
              </div>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无待办任务" :image-size="100" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Document, Files, Tickets, Money } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import {
  getDashboardStats,
  getSalesFunnel,
  getTaskStats,
  getCustomerTypeStats,
  getProductSalesRank,
  getTodoTasks,
  getMonthlyTrend
} from '@/api/dashboard'

const router = useRouter()
const userStore = useUserStore()

// 统计数据
const stats = reactive({
  leads: 0,
  leadsChange: 0,
  customers: 0,
  customersChange: 0,
  pendingTasks: 0,
  overdueTasks: 0,
  monthlyContract: 0,
  contractCount: 0
})

// 图表实例
const salesFunnelChart = ref(null)
const performanceTrendChart = ref(null)
const taskStatusChart = ref(null)
const customerTypeChart = ref(null)
const productRankChart = ref(null)

let salesFunnelInstance = null
let performanceTrendInstance = null
let taskStatusInstance = null
let customerTypeInstance = null
let productRankInstance = null

// 趋势周期
const trendPeriod = ref('12')

// 待办任务
const todoTasks = ref([])

// 加载统计数据
const loadStats = async () => {
  try {
    const res = await getDashboardStats()
    if (res.success && res.data) {
      stats.leads = res.data.leads?.count || 0
      stats.leadsChange = res.data.leads?.monthlyChange || 0
      stats.customers = res.data.customers?.count || 0
      stats.customersChange = res.data.customers?.monthlyChange || 0
      stats.pendingTasks = res.data.tasks?.pending || 0
      stats.overdueTasks = res.data.tasks?.overdue || 0
      stats.monthlyContract = res.data.contracts?.monthlyAmount || 0
      stats.contractCount = res.data.contracts?.count || 0
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载销售漏斗数据
const loadSalesFunnel = async () => {
  try {
    const res = await getSalesFunnel()
    if (res.success && res.data) {
      initSalesFunnelChart(res.data)
    }
  } catch (error) {
    console.error('加载销售漏斗失败:', error)
    // 使用默认空数据
    initSalesFunnelChart([])
  }
}

// 初始化销售漏斗图表
const initSalesFunnelChart = (data) => {
  if (!salesFunnelChart.value) return

  if (!salesFunnelInstance) {
    salesFunnelInstance = echarts.init(salesFunnelChart.value)
  }

  const chartData = data.length > 0 ? data : [
    { value: 0, name: '线索' },
    { value: 0, name: '客户' },
    { value: 0, name: '报价' },
    { value: 0, name: '合同' },
    { value: 0, name: '成交' }
  ]

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}'
    },
    series: [{
      name: '销售漏斗',
      type: 'funnel',
      left: '10%',
      width: '80%',
      label: {
        position: 'inside',
        formatter: '{b}: {c}'
      },
      data: chartData
    }]
  }
  salesFunnelInstance.setOption(option)
}

// 加载月度趋势数据
const loadMonthlyTrend = async () => {
  try {
    const res = await getMonthlyTrend({ months: parseInt(trendPeriod.value) })
    if (res.success && res.data) {
      initPerformanceTrendChart(res.data)
    }
  } catch (error) {
    console.error('加载月度趋势失败:', error)
    initPerformanceTrendChart({ labels: [], contract: [], payment: [] })
  }
}

// 初始化业绩趋势图表
const initPerformanceTrendChart = (data) => {
  if (!performanceTrendChart.value) return

  if (!performanceTrendInstance) {
    performanceTrendInstance = echarts.init(performanceTrendChart.value)
  }

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['合同金额', '回款金额']
    },
    xAxis: {
      type: 'category',
      data: data.labels || []
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} 万'
      }
    },
    series: [
      {
        name: '合同金额',
        type: 'line',
        data: data.contract || [],
        smooth: true,
        itemStyle: { color: '#409eff' }
      },
      {
        name: '回款金额',
        type: 'line',
        data: data.payment || [],
        smooth: true,
        itemStyle: { color: '#67c23a' }
      }
    ]
  }
  performanceTrendInstance.setOption(option)
}

// 加载任务统计数据
const loadTaskStats = async () => {
  try {
    const res = await getTaskStats()
    if (res.success && res.data) {
      initTaskStatusChart(res.data)
    }
  } catch (error) {
    console.error('加载任务统计失败:', error)
    initTaskStatusChart([])
  }
}

// 初始化任务状态图表
const initTaskStatusChart = (data) => {
  if (!taskStatusChart.value) return

  if (!taskStatusInstance) {
    taskStatusInstance = echarts.init(taskStatusChart.value)
  }

  const chartData = data.length > 0 ? data : [
    { value: 0, name: '待处理', itemStyle: { color: '#e6a23c' } },
    { value: 0, name: '进行中', itemStyle: { color: '#409eff' } },
    { value: 0, name: '已完成', itemStyle: { color: '#67c23a' } },
    { value: 0, name: '已取消', itemStyle: { color: '#909399' } }
  ]

  const option = {
    tooltip: {
      trigger: 'item'
    },
    series: [{
      name: '任务状态',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      label: {
        show: true,
        formatter: '{b}: {c}'
      },
      data: chartData
    }]
  }
  taskStatusInstance.setOption(option)
}

// 加载客户类型统计
const loadCustomerTypeStats = async () => {
  try {
    const res = await getCustomerTypeStats()
    if (res.success && res.data) {
      initCustomerTypeChart(res.data)
    }
  } catch (error) {
    console.error('加载客户类型统计失败:', error)
    initCustomerTypeChart([])
  }
}

// 初始化客户类型图表
const initCustomerTypeChart = (data) => {
  if (!customerTypeChart.value) return

  if (!customerTypeInstance) {
    customerTypeInstance = echarts.init(customerTypeChart.value)
  }

  const chartData = data.length > 0 ? data : [
    { value: 0, name: '潜在客户', itemStyle: { color: '#909399' } },
    { value: 0, name: '正式客户', itemStyle: { color: '#409eff' } },
    { value: 0, name: 'VIP客户', itemStyle: { color: '#f56c6c' } }
  ]

  const option = {
    tooltip: {
      trigger: 'item'
    },
    series: [{
      name: '客户类型',
      type: 'pie',
      radius: '60%',
      data: chartData,
      label: {
        formatter: '{b}: {d}%'
      }
    }]
  }
  customerTypeInstance.setOption(option)
}

// 加载产品销售排行
const loadProductSalesRank = async () => {
  try {
    const res = await getProductSalesRank({ limit: 5 })
    if (res.success && res.data) {
      initProductRankChart(res.data)
    }
  } catch (error) {
    console.error('加载产品排行失败:', error)
    initProductRankChart([])
  }
}

// 初始化产品排行图表
const initProductRankChart = (data) => {
  if (!productRankChart.value) return

  if (!productRankInstance) {
    productRankInstance = echarts.init(productRankChart.value)
  }

  // 反转数据以便从下到上显示排名
  const reversedData = [...data].reverse()
  const names = reversedData.map(item => item.name)
  const values = reversedData.map(item => item.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: names.length > 0 ? names : ['暂无数据']
    },
    series: [{
      name: '销售量',
      type: 'bar',
      data: values.length > 0 ? values : [0],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#83bff6' },
          { offset: 1, color: '#188df0' }
        ])
      }
    }]
  }
  productRankInstance.setOption(option)
}

// 加载待办任务
const loadTodoTasks = async () => {
  try {
    const res = await getTodoTasks({ limit: 5 })
    if (res.success && res.data) {
      todoTasks.value = res.data
    }
  } catch (error) {
    console.error('加载待办任务失败:', error)
    todoTasks.value = []
  }
}

// 格式化金额
const formatAmount = (amount) => {
  if (!amount) return '¥0'
  return '¥' + (amount / 10000).toFixed(1) + 'w'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD')
}

// 获取任务时间轴类型
const getTaskTimelineType = (task) => {
  if (dayjs(task.due_date).isBefore(dayjs(), 'day')) {
    return 'danger'
  }
  if (task.priority === 'high') {
    return 'warning'
  }
  return 'primary'
}

// 获取任务优先级类型
const getTaskPriorityType = (priority) => {
  const typeMap = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return typeMap[priority] || 'info'
}

// 跳转到创建页面
const goToCreate = (type) => {
  const routes = {
    lead: '/leads',
    customer: '/customers',
    quotation: '/quotations',
    contract: '/contracts',
    task: '/tasks',
    service: '/services'
  }
  router.push(routes[type] || '/')
}

// 跳转到任务列表
const goToTasks = () => {
  router.push('/tasks')
}

// 窗口调整时重新渲染图表
const handleResize = () => {
  salesFunnelInstance?.resize()
  performanceTrendInstance?.resize()
  taskStatusInstance?.resize()
  customerTypeInstance?.resize()
  productRankInstance?.resize()
}

onMounted(async () => {
  // 加载所有数据
  await Promise.all([
    loadStats(),
    loadTodoTasks()
  ])

  await nextTick()

  // 加载图表数据
  await Promise.all([
    loadSalesFunnel(),
    loadMonthlyTrend(),
    loadTaskStats(),
    loadCustomerTypeStats(),
    loadProductSalesRank()
  ])

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 销毁图表实例
  salesFunnelInstance?.dispose()
  performanceTrendInstance?.dispose()
  taskStatusInstance?.dispose()
  customerTypeInstance?.dispose()
  productRankInstance?.dispose()

  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.page-title {
  margin: 0 0 20px 0;
  font-size: 24px;
  color: #303133;
}

.stat-card-wrapper {
  cursor: pointer;
  transition: transform 0.3s;
}

.stat-card-wrapper:hover {
  transform: translateY(-5px);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-change {
  font-size: 12px;
}

.stat-change.positive {
  color: #67c23a;
}

.stat-change.negative {
  color: #f56c6c;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.timeline-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-title {
  flex: 1;
  margin-right: 10px;
}

:deep(.el-timeline-item__timestamp) {
  color: #909399;
  font-size: 12px;
}
</style>
