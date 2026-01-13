<template>
  <div class="dashboard-container">
    <!-- 顶部快捷操作 -->
    <el-row :gutter="20" class="shortcuts-row">
      <el-col :span="24">
        <el-card shadow="never" class="shortcuts-card">
          <div class="shortcuts">
            <el-button type="primary" :icon="Plus" @click="goToCreateLead">新建线索</el-button>
            <el-button :icon="User" @click="goToLeads">线索管理</el-button>
            <el-button :icon="Document" @click="goToContracts">合同管理</el-button>
            <el-button :icon="List" @click="goToQuotations">报价管理</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 待跟踪线索警示 + 销售漏斗 -->
    <el-row :gutter="20" class="mt-20">
      <!-- 待跟踪线索 -->
      <el-col :span="12">
        <el-card shadow="never" class="followup-card">
          <template #header>
            <div class="card-header">
              <span>待跟踪线索</span>
              <el-button link type="primary" @click="goToLeads">查看全部</el-button>
            </div>
          </template>
          <div class="followup-stats">
            <div class="stat-item severe" @click="goToOverdueLeads('severe')">
              <div class="stat-value">{{ pendingFollowUp.severeOverdue }}</div>
              <div class="stat-label">严重逾期(&gt;7天)</div>
            </div>
            <div class="stat-item normal" @click="goToOverdueLeads('normal')">
              <div class="stat-value">{{ pendingFollowUp.normalOverdue }}</div>
              <div class="stat-label">待跟进</div>
            </div>
            <div class="stat-item total">
              <div class="stat-value">{{ pendingFollowUp.total }}</div>
              <div class="stat-label">总待处理</div>
            </div>
          </div>
          <!-- 待跟踪线索列表 -->
          <div v-if="pendingFollowUp.leads && pendingFollowUp.leads.length > 0" class="followup-list">
            <div
              v-for="lead in pendingFollowUp.leads.slice(0, 5)"
              :key="lead.id"
              class="followup-item"
              @click="goToLeadDetail(lead.id)"
            >
              <div class="lead-info">
                <span class="lead-name">{{ lead.customerName }}</span>
                <span class="hotel-name">{{ lead.hotelName }}</span>
              </div>
              <div class="overdue-days" :class="getOverdueClass(lead.nextFollowDate)">
                {{ getOverdueDays(lead.nextFollowDate) }}
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无待跟踪线索" :image-size="60" />
        </el-card>
      </el-col>

      <!-- 销售漏斗 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span>销售漏斗</span>
          </template>
          <div ref="funnelChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 近一个月趋势图 -->
    <el-row :gutter="20" class="mt-20">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header>
            <span>近30天业务趋势</span>
          </template>
          <div ref="trendChartRef" class="trend-chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, User, Document, List } from '@element-plus/icons-vue'
import { getSalesFunnel, getPendingFollowUpLeads, getMonthlyTrendChart } from '@/api/dashboard'
import * as echarts from 'echarts'
import dayjs from 'dayjs'

const router = useRouter()

// 图表引用
const funnelChartRef = ref(null)
const trendChartRef = ref(null)
let funnelChart = null
let trendChart = null

// 待跟踪线索数据
const pendingFollowUp = ref({
  total: 0,
  severeOverdue: 0,
  normalOverdue: 0,
  leads: []
})

// 销售漏斗数据
const funnelData = ref([])

// 趋势图数据
const trendData = ref({
  labels: [],
  leads: [],
  quotations: [],
  contracts: []
})

// 快捷操作
const goToCreateLead = () => {
  router.push('/leads?action=create')
}

const goToLeads = () => {
  router.push('/leads')
}

const goToContracts = () => {
  router.push('/contracts')
}

const goToQuotations = () => {
  router.push('/quotations')
}

const goToOverdueLeads = (type) => {
  router.push(`/leads?filter=${type}`)
}

const goToLeadDetail = (id) => {
  router.push(`/leads/${id}`)
}

// 计算逾期天数
const getOverdueDays = (nextFollowDate) => {
  if (!nextFollowDate) return '未设置'
  const days = dayjs().diff(dayjs(nextFollowDate), 'day')
  if (days > 0) {
    return `逾期${days}天`
  } else if (days === 0) {
    return '今天'
  } else {
    return `${-days}天后`
  }
}

const getOverdueClass = (nextFollowDate) => {
  if (!nextFollowDate) return ''
  const days = dayjs().diff(dayjs(nextFollowDate), 'day')
  if (days > 7) return 'severe'
  if (days > 0) return 'warning'
  return 'normal'
}

// 获取待跟踪线索数据
const fetchPendingFollowUp = async () => {
  try {
    const res = await getPendingFollowUpLeads()
    if (res.data) {
      pendingFollowUp.value = res.data
    }
  } catch (error) {
    console.error('获取待跟踪线索失败:', error)
  }
}

// 获取销售漏斗数据并渲染图表
const fetchSalesFunnel = async () => {
  try {
    const res = await getSalesFunnel()
    if (res.data) {
      funnelData.value = res.data
      renderFunnelChart()
    }
  } catch (error) {
    console.error('获取销售漏斗数据失败:', error)
  }
}

// 获取趋势图数据
const fetchTrendChart = async () => {
  try {
    const res = await getMonthlyTrendChart()
    if (res.data) {
      trendData.value = res.data
      renderTrendChart()
    }
  } catch (error) {
    console.error('获取趋势图数据失败:', error)
  }
}

// 渲染销售漏斗图
const renderFunnelChart = () => {
  if (!funnelChartRef.value) return

  if (funnelChart) {
    funnelChart.dispose()
  }

  funnelChart = echarts.init(funnelChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}'
    },
    series: [
      {
        type: 'funnel',
        left: '10%',
        top: 20,
        bottom: 20,
        width: '80%',
        min: 0,
        max: Math.max(...funnelData.value.map(d => d.value), 100),
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
          formatter: '{b}: {c}'
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid'
          }
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          label: {
            fontSize: 14
          }
        },
        data: funnelData.value.map((item, index) => ({
          ...item,
          itemStyle: {
            color: ['#667eea', '#764ba2', '#f093fb', '#43e97b', '#38f9d7'][index] || '#409eff'
          }
        }))
      }
    ]
  }

  funnelChart.setOption(option)
}

// 渲染趋势图
const renderTrendChart = () => {
  if (!trendChartRef.value) return

  if (trendChart) {
    trendChart.dispose()
  }

  trendChart = echarts.init(trendChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['线索', '报价', '合同'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendData.value.labels,
      axisLabel: {
        interval: 4, // 每隔几个显示一个标签
        rotate: 0
      }
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [
      {
        name: '线索',
        type: 'line',
        smooth: true,
        data: trendData.value.leads,
        itemStyle: { color: '#667eea' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
              { offset: 1, color: 'rgba(102, 126, 234, 0)' }
            ]
          }
        }
      },
      {
        name: '报价',
        type: 'line',
        smooth: true,
        data: trendData.value.quotations,
        itemStyle: { color: '#f093fb' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(240, 147, 251, 0.3)' },
              { offset: 1, color: 'rgba(240, 147, 251, 0)' }
            ]
          }
        }
      },
      {
        name: '合同',
        type: 'line',
        smooth: true,
        data: trendData.value.contracts,
        itemStyle: { color: '#43e97b' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(67, 233, 123, 0.3)' },
              { offset: 1, color: 'rgba(67, 233, 123, 0)' }
            ]
          }
        }
      }
    ]
  }

  trendChart.setOption(option)
}

// 窗口大小变化时重绘图表
const handleResize = () => {
  funnelChart?.resize()
  trendChart?.resize()
}

onMounted(async () => {
  // 加载数据
  await Promise.all([
    fetchPendingFollowUp(),
    fetchSalesFunnel(),
    fetchTrendChart()
  ])

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  funnelChart?.dispose()
  trendChart?.dispose()
})
</script>

<style scoped lang="scss">
.dashboard-container {
  padding: 0;
}

.shortcuts-card {
  :deep(.el-card__body) {
    padding: 15px 20px;
  }
}

.shortcuts {
  display: flex;
  gap: 15px;
}

.mt-20 {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 待跟踪线索样式 */
.followup-card {
  :deep(.el-card__body) {
    padding-top: 10px;
  }
}

.followup-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;

  .stat-item {
    flex: 1;
    text-align: center;
    padding: 15px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
    }

    &.severe {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
      color: #fff;
    }

    &.normal {
      background: linear-gradient(135deg, #ffa502 0%, #ff7f50 100%);
      color: #fff;
    }

    &.total {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }

    .stat-value {
      font-size: 32px;
      font-weight: bold;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 13px;
      margin-top: 5px;
      opacity: 0.9;
    }
  }
}

.followup-list {
  border-top: 1px solid #ebeef5;
  padding-top: 15px;

  .followup-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    margin-bottom: 8px;
    background: #f8f9fa;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #e9ecef;
    }

    &:last-child {
      margin-bottom: 0;
    }

    .lead-info {
      display: flex;
      flex-direction: column;
      gap: 3px;

      .lead-name {
        font-weight: 500;
        color: #303133;
      }

      .hotel-name {
        font-size: 12px;
        color: #909399;
      }
    }

    .overdue-days {
      font-size: 12px;
      padding: 3px 8px;
      border-radius: 4px;

      &.severe {
        background: #fef0f0;
        color: #f56c6c;
      }

      &.warning {
        background: #fdf6ec;
        color: #e6a23c;
      }

      &.normal {
        background: #f0f9eb;
        color: #67c23a;
      }
    }
  }
}

/* 图表容器 */
.chart-container {
  height: 280px;
}

.trend-chart-container {
  height: 320px;
}
</style>
