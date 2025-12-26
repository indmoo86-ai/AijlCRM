<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon leads">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.leads }}</div>
              <div class="stat-label">线索总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon customers">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.customers }}</div>
              <div class="stat-label">客户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon opportunities">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.opportunities }}</div>
              <div class="stat-label">商机总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon contracts">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.contracts }}</div>
              <div class="stat-label">合同总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span>销售漏斗</span>
          </template>
          <div class="chart-placeholder">
            <el-empty description="数据统计功能开发中" />
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span>渠道分析</span>
          </template>
          <div class="chart-placeholder">
            <el-empty description="数据统计功能开发中" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header>
            <span>待办事项</span>
          </template>
          <el-table :data="todoList" stripe>
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="title" label="待办内容" />
            <el-table-column prop="deadline" label="截止时间" width="180" />
            <el-table-column label="操作" width="120">
              <template #default>
                <el-button link type="primary" size="small">处理</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const stats = ref({
  leads: 0,
  customers: 0,
  opportunities: 0,
  contracts: 0
})

const todoList = ref([])

onMounted(() => {
  // TODO: 加载统计数据
  stats.value = {
    leads: 128,
    customers: 56,
    opportunities: 32,
    contracts: 18
  }
})
</script>

<style scoped lang="scss">
.dashboard-container {
  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: 20px;

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        color: #fff;

        &.leads {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        &.customers {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        &.opportunities {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        &.contracts {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #303133;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-top: 5px;
        }
      }
    }
  }

  .chart-placeholder {
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
