<template>
  <el-drawer
    v-model="visible"
    title="合同详情"
    direction="rtl"
    size="75%"
    :destroy-on-close="true"
  >
    <div v-loading="loading" class="contract-detail">
      <!-- 合同状态进度 -->
      <div class="status-progress">
        <el-steps :active="statusStep" finish-status="success" simple>
          <el-step title="草稿" />
          <el-step title="待签署" />
          <el-step title="执行中" />
          <el-step title="已完成" />
        </el-steps>
      </div>

      <!-- 执行进度卡片 -->
      <div class="progress-cards">
        <el-row :gutter="16">
          <el-col :span="8">
            <div class="progress-card">
              <div class="progress-title">发货进度</div>
              <el-progress
                :percentage="progress.shippedPercent"
                :color="'#409eff'"
                :stroke-width="10"
              />
              <div class="progress-amount">
                ¥{{ formatMoney(progress.shippedAmount) }} / ¥{{ formatMoney(progress.contractAmount) }}
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="progress-card">
              <div class="progress-title">收款进度</div>
              <el-progress
                :percentage="progress.receivedPercent"
                :color="'#67c23a'"
                :stroke-width="10"
              />
              <div class="progress-amount">
                ¥{{ formatMoney(progress.receivedAmount) }} / ¥{{ formatMoney(progress.contractAmount) }}
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="progress-card">
              <div class="progress-title">开票进度</div>
              <el-progress
                :percentage="progress.invoicedPercent"
                :color="'#e6a23c'"
                :stroke-width="10"
              />
              <div class="progress-amount">
                ¥{{ formatMoney(progress.invoicedAmount) }} / ¥{{ formatMoney(progress.contractAmount) }}
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- Tab 页签 -->
      <el-tabs v-model="activeTab" class="detail-tabs">
        <!-- 基础信息 Tab -->
        <el-tab-pane label="基础信息" name="basic">
          <div class="info-section">
            <div class="section-title">合同信息</div>
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="合同编号">{{ contract.contract_no }}</el-descriptions-item>
              <el-descriptions-item label="合同状态">
                <el-tag :type="getStatusType(contract.status)">{{ getStatusLabel(contract.status) }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="合同标题" :span="2">{{ contract.contract_title }}</el-descriptions-item>
              <el-descriptions-item label="合同金额">
                <span class="amount-highlight">¥{{ formatMoney(contract.contract_amount) }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="金额大写">{{ contract.amount_in_words || '-' }}</el-descriptions-item>
              <el-descriptions-item label="签订日期">{{ contract.signed_date || '-' }}</el-descriptions-item>
              <el-descriptions-item label="签订地点">{{ contract.signing_location || '-' }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="info-section">
            <div class="section-title">甲方信息</div>
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="甲方名称">{{ contract.party_a_name || contract.customer?.customerName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="甲方代表">{{ contract.party_a_representative || '-' }}</el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ contract.party_a_phone || '-' }}</el-descriptions-item>
              <el-descriptions-item label="传真">{{ contract.party_a_fax || '-' }}</el-descriptions-item>
              <el-descriptions-item label="地址" :span="2">{{ contract.party_a_address || '-' }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="info-section">
            <div class="section-title">项目信息</div>
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="酒店名称">{{ contract.hotel_name || '-' }}</el-descriptions-item>
              <el-descriptions-item label="房间数量">{{ contract.room_count || '-' }}</el-descriptions-item>
              <el-descriptions-item label="项目地址" :span="2">{{ contract.project_address || '-' }}</el-descriptions-item>
              <el-descriptions-item label="交货方式">{{ contract.delivery_method || '-' }}</el-descriptions-item>
              <el-descriptions-item label="运费承担">{{ contract.freight_bearer === 'party_a' ? '甲方' : '乙方' }}</el-descriptions-item>
              <el-descriptions-item label="交货地点" :span="2">{{ contract.delivery_address || '-' }}</el-descriptions-item>
              <el-descriptions-item label="质保期限">{{ contract.warranty_period || 5 }}年</el-descriptions-item>
              <el-descriptions-item label="终身保修">{{ contract.lifetime_maintenance ? '是' : '否' }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="info-section">
            <div class="section-title">关联信息</div>
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="客户经理">{{ contract.owner?.name || '-' }}</el-descriptions-item>
              <el-descriptions-item label="来源报价单">{{ contract.sourceQuotation?.quotation_no || '-' }}</el-descriptions-item>
              <el-descriptions-item label="关联线索">{{ contract.lead?.leadNo || '-' }}</el-descriptions-item>
              <el-descriptions-item label="客户名称">{{ contract.customer?.customerName || '-' }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <div v-if="contract.items && contract.items.length > 0" class="info-section">
            <div class="section-title">产品明细</div>
            <el-table :data="contract.items" size="small" border max-height="300">
              <el-table-column prop="product_name" label="产品名称" min-width="150" show-overflow-tooltip />
              <el-table-column prop="product_code" label="产品编码" width="140" />
              <el-table-column prop="quantity" label="数量" width="80" align="center" />
              <el-table-column prop="product_unit" label="单位" width="60" align="center" />
              <el-table-column prop="unit_price" label="单价" width="100" align="right">
                <template #default="{ row }">¥{{ formatMoney(row.unit_price) }}</template>
              </el-table-column>
              <el-table-column prop="subtotal" label="小计" width="120" align="right">
                <template #default="{ row }">
                  <span class="amount-highlight">¥{{ formatMoney(row.subtotal) }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 收款 Tab -->
        <el-tab-pane label="收款" name="payments">
          <div class="tab-header">
            <span class="tab-title">收款计划与记录</span>
            <el-button type="primary" size="small" @click="handleAddPayment">添加收款</el-button>
          </div>

          <!-- 付款阶段进度 -->
          <div v-if="paymentStagesStatus && paymentStagesStatus.length > 0" class="payment-stages">
            <div class="section-title">付款阶段</div>
            <el-table :data="paymentStagesStatus" size="small" border>
              <el-table-column prop="name" label="阶段" width="100" />
              <el-table-column label="应付金额" width="120" align="right">
                <template #default="{ row }">¥{{ formatMoney(row.amount) }}</template>
              </el-table-column>
              <el-table-column label="已付金额" width="120" align="right">
                <template #default="{ row }">¥{{ formatMoney(row.paid_amount) }}</template>
              </el-table-column>
              <el-table-column prop="percentage" label="比例" width="80" align="center">
                <template #default="{ row }">{{ row.percentage }}%</template>
              </el-table-column>
              <el-table-column prop="condition" label="付款条件" min-width="200" show-overflow-tooltip />
              <el-table-column prop="status" label="状态" width="80">
                <template #default="{ row }">
                  <el-tag v-if="row.status === 'completed'" type="success" size="small">已完成</el-tag>
                  <el-tag v-else-if="row.status === 'partial'" type="warning" size="small">部分</el-tag>
                  <el-tag v-else type="info" size="small">待付</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 收款记录列表 -->
          <div class="payment-records">
            <div class="section-title">收款记录</div>
            <el-table v-if="payments && payments.length > 0" :data="payments" size="small" border>
              <el-table-column prop="payment_no" label="收款编号" width="160" />
              <el-table-column prop="payment_stage" label="收款阶段" width="120" />
              <el-table-column prop="payment_amount" label="金额" width="120" align="right">
                <template #default="{ row }">¥{{ formatMoney(row.payment_amount) }}</template>
              </el-table-column>
              <el-table-column prop="payment_date" label="收款日期" width="100" />
              <el-table-column prop="payment_method" label="方式" width="80" />
              <el-table-column prop="status" label="状态" width="80">
                <template #default="{ row }">
                  <el-tag v-if="row.status === 'confirmed'" type="success" size="small">已确认</el-tag>
                  <el-tag v-else-if="row.status === 'pending'" type="warning" size="small">待确认</el-tag>
                  <el-tag v-else type="info" size="small">{{ row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="payment_note" label="备注" min-width="150" show-overflow-tooltip />
            </el-table>
            <el-empty v-else description="暂无收款记录" />
          </div>
        </el-tab-pane>

        <!-- 发货 Tab -->
        <el-tab-pane label="发货" name="shipments">
          <div class="tab-header">
            <span class="tab-title">发货记录</span>
            <el-button type="primary" size="small" @click="handleAddShipment">添加发货</el-button>
          </div>

          <el-table v-if="shipments && shipments.length > 0" :data="shipments" size="small" border>
            <el-table-column prop="shipment_no" label="发货编号" width="160" />
            <el-table-column prop="shipment_amount" label="发货金额" width="120" align="right">
              <template #default="{ row }">¥{{ formatMoney(row.shipment_amount) }}</template>
            </el-table-column>
            <el-table-column prop="shipment_date" label="发货日期" width="100" />
            <el-table-column prop="logistics_company" label="物流公司" width="120" />
            <el-table-column prop="tracking_no" label="物流单号" width="150" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag v-if="row.status === 'delivered'" type="success" size="small">已送达</el-tag>
                <el-tag v-else-if="row.status === 'shipped'" type="primary" size="small">运输中</el-tag>
                <el-tag v-else-if="row.status === 'pending'" type="warning" size="small">待发货</el-tag>
                <el-tag v-else type="info" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="owner.name" label="负责人" width="80" />
          </el-table>
          <el-empty v-else description="暂无发货记录" />
        </el-tab-pane>

        <!-- 发票 Tab -->
        <el-tab-pane label="发票" name="invoices">
          <div class="tab-header">
            <span class="tab-title">开票记录</span>
            <el-button type="primary" size="small" @click="handleAddInvoice">申请开票</el-button>
          </div>

          <el-table v-if="invoices && invoices.length > 0" :data="invoices" size="small" border>
            <el-table-column prop="invoice_no" label="发票号码" width="160" />
            <el-table-column prop="invoice_amount" label="开票金额" width="120" align="right">
              <template #default="{ row }">¥{{ formatMoney(row.invoice_amount) }}</template>
            </el-table-column>
            <el-table-column prop="invoice_type" label="发票类型" width="100">
              <template #default="{ row }">
                {{ row.invoice_type === 'special' ? '专票' : '普票' }}
              </template>
            </el-table-column>
            <el-table-column prop="invoice_date" label="开票日期" width="100" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag v-if="row.status === 'issued'" type="success" size="small">已开</el-tag>
                <el-tag v-else-if="row.status === 'pending'" type="warning" size="small">待开</el-tag>
                <el-tag v-else-if="row.status === 'voided'" type="danger" size="small">作废</el-tag>
                <el-tag v-else type="info" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="发票抬头" min-width="150" show-overflow-tooltip />
            <el-table-column prop="owner.name" label="负责人" width="80" />
          </el-table>
          <el-empty v-else description="暂无开票记录" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getContractDetail } from '@/api/contracts'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  contractId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const activeTab = ref('basic')

// 合同数据
const contract = ref({})
const paymentStagesStatus = ref([])
const payments = ref([])
const shipments = ref([])
const invoices = ref([])
const progress = reactive({
  contractAmount: 0,
  shippedAmount: 0,
  shippedPercent: 0,
  receivedAmount: 0,
  receivedPercent: 0,
  invoicedAmount: 0,
  invoicedPercent: 0,
  pendingAmount: 0
})

// 计算状态步骤
const statusStep = computed(() => {
  const statusMap = {
    'draft': 0,
    'pending': 1,
    'active': 2,
    'completed': 3,
    'cancelled': 0
  }
  return statusMap[contract.value.status] || 0
})

// 监听contractId变化
watch(() => props.contractId, async (newId) => {
  if (newId && visible.value) {
    await fetchContractDetail(newId)
  }
}, { immediate: true })

watch(visible, async (val) => {
  if (val && props.contractId) {
    activeTab.value = 'basic'
    await fetchContractDetail(props.contractId)
  }
})

// 获取合同详情
const fetchContractDetail = async (id) => {
  loading.value = true
  try {
    const res = await getContractDetail(id)
    const data = res.data

    contract.value = data.contract || {}
    paymentStagesStatus.value = data.paymentStagesStatus || []
    payments.value = data.payments || []
    shipments.value = data.shipments || []
    invoices.value = data.invoices || []

    // 更新进度
    if (data.progress) {
      Object.assign(progress, data.progress)
    }
  } catch (error) {
    console.error('获取合同详情失败:', error)
    ElMessage.error('获取合同详情失败')
  } finally {
    loading.value = false
  }
}

// 格式化金额
const formatMoney = (value) => {
  const num = parseFloat(value) || 0
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 状态类型
const getStatusType = (status) => {
  const map = {
    'draft': 'info',
    'pending': 'warning',
    'active': 'primary',
    'completed': 'success',
    'cancelled': 'danger'
  }
  return map[status] || 'info'
}

// 状态标签
const getStatusLabel = (status) => {
  const map = {
    'draft': '草稿',
    'pending': '待签署',
    'active': '执行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return map[status] || status
}

// 添加收款
const handleAddPayment = () => {
  ElMessage.info('添加收款功能开发中')
}

// 添加发货
const handleAddShipment = () => {
  ElMessage.info('添加发货功能开发中')
}

// 添加发票
const handleAddInvoice = () => {
  ElMessage.info('申请开票功能开发中')
}
</script>

<style scoped>
.contract-detail {
  padding: 0 10px;
}

.status-progress {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.progress-cards {
  margin-bottom: 20px;
}

.progress-card {
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.progress-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
}

.progress-amount {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.detail-tabs {
  margin-top: 16px;
}

.info-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}

.amount-highlight {
  color: #e74c3c;
  font-weight: 600;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.tab-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.payment-stages {
  margin-bottom: 20px;
}

.payment-records {
  margin-top: 20px;
}
</style>
