<template>
  <el-drawer
    v-model="visible"
    title="合同详情"
    direction="rtl"
    size="75%"
    :destroy-on-close="true"
  >
    <div v-loading="loading" class="contract-detail">
      <el-tabs v-model="activeTab" class="detail-tabs">
        <!-- 基础信息 Tab -->
        <el-tab-pane label="基础信息" name="basic">
          <!-- 操作按钮区域 -->
          <div class="action-bar">
            <el-button
              v-if="contract.status === 'draft'"
              type="primary"
              @click="handleEdit"
            >
              编辑
            </el-button>
            <el-button
              v-if="contract.status === 'draft'"
              type="success"
              @click="handleConfirm"
            >
              确认合同
            </el-button>
            <el-button
              v-if="contract.status === 'pending'"
              type="primary"
              @click="handleSendOut"
            >
              寄出合同
            </el-button>
            <el-button
              v-if="contract.status === 'sent'"
              type="success"
              @click="handleReceiveBack"
            >
              收回合同
            </el-button>
            <el-button
              v-if="contract.status !== 'voided' && contract.status !== 'completed'"
              type="danger"
              @click="handleVoid"
            >
              作废
            </el-button>
            <el-button
              v-if="contract.status === 'voided'"
              type="warning"
              @click="handleRestore"
            >
              恢复合同
            </el-button>
          </div>

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
              <el-descriptions-item label="线索渠道">{{ getChannelLabel(contract.lead?.channelSource) }}</el-descriptions-item>
              <el-descriptions-item label="线索创建人">{{ contract.lead?.createdByUser?.name || contract.lead?.createdByUser?.username || '-' }}</el-descriptions-item>
              <el-descriptions-item label="线索创建时间" :span="2">{{ formatDateTime(contract.lead?.created_at) }}</el-descriptions-item>
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
              <el-table-column label="未付金额" width="120" align="right">
                <template #default="{ row }">
                  <span :class="{ 'amount-highlight': (row.amount - (row.paid_amount || 0)) > 0 }">
                    ¥{{ formatMoney(row.amount - (row.paid_amount || 0)) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="percentage" label="比例" width="70" align="center">
                <template #default="{ row }">{{ row.percentage }}%</template>
              </el-table-column>
              <el-table-column prop="condition" label="付款条件" min-width="150" show-overflow-tooltip />
              <el-table-column prop="status" label="状态" width="80">
                <template #default="{ row }">
                  <el-tag v-if="row.status === 'completed'" type="success" size="small">已完成</el-tag>
                  <el-tag v-else-if="row.status === 'partial'" type="warning" size="small">部分</el-tag>
                  <el-tag v-else type="info" size="small">待付</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80" align="center">
                <template #default="{ row, $index }">
                  <el-button
                    v-if="row.status !== 'completed'"
                    link
                    type="primary"
                    size="small"
                    @click="handleStagePayment(row, $index)"
                  >
                    付款
                  </el-button>
                  <span v-else class="text-success">-</span>
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

        <!-- 跟踪记录 Tab -->
        <el-tab-pane label="跟踪记录" name="tracking">
          <div class="tab-header">
            <span class="tab-title">合同跟踪记录</span>
            <el-button type="primary" size="small" @click="handleAddTrackRecord">添加记录</el-button>
          </div>

          <el-timeline v-if="trackRecords && trackRecords.length > 0">
            <el-timeline-item
              v-for="record in trackRecords"
              :key="record.id"
              :timestamp="formatDateTime(record.created_at)"
              placement="top"
              :type="getTrackTypeColor(record.followType)"
            >
              <div class="track-record-item">
                <div class="record-header">
                  <el-tag size="small" :type="getTrackTypeColor(record.followType)">
                    {{ getTrackTypeLabel(record.followType) }}
                  </el-tag>
                  <span class="record-operator">{{ record.operator?.name || record.operator?.username || '-' }}</span>
                </div>
                <div class="record-content">{{ record.content }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无跟踪记录" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 添加跟踪记录对话框 -->
    <el-dialog
      v-model="trackDialogVisible"
      title="添加跟踪记录"
      width="500px"
      append-to-body
    >
      <el-form :model="trackForm" :rules="trackFormRules" ref="trackFormRef" label-width="80px">
        <el-form-item label="操作类型" prop="followType">
          <el-select v-model="trackForm.followType" placeholder="请选择操作类型" style="width: 100%">
            <el-option label="合同创建" value="created" />
            <el-option label="合同寄出" value="sent_out" />
            <el-option label="合同收回" value="received_back" />
            <el-option label="付款记录" value="payment" />
            <el-option label="发票记录" value="invoice" />
            <el-option label="发货记录" value="shipment" />
            <el-option label="状态变更" value="status_change" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="记录内容" prop="content">
          <el-input
            v-model="trackForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入跟踪记录内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="trackDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitTrackRecord" :loading="trackSubmitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 确认/收回/作废对话框 -->
    <el-dialog
      v-model="statusDialogVisible"
      :title="statusDialogTitle"
      width="450px"
      append-to-body
    >
      <el-form :model="statusForm" label-width="80px">
        <el-form-item label="备注">
          <el-input
            v-model="statusForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitStatusChange" :loading="statusSubmitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 寄出对话框 -->
    <el-dialog
      v-model="sendOutDialogVisible"
      title="寄出合同"
      width="450px"
      append-to-body
    >
      <el-form :model="sendOutForm" label-width="80px">
        <el-form-item label="快递单号">
          <el-input v-model="sendOutForm.trackingNo" placeholder="请输入快递单号" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="sendOutForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sendOutDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitSendOut" :loading="statusSubmitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 阶段付款对话框 -->
    <el-dialog
      v-model="paymentDialogVisible"
      :title="paymentDialogTitle"
      width="550px"
      append-to-body
    >
      <el-form :model="paymentForm" :rules="paymentFormRules" ref="paymentFormRef" label-width="100px">
        <el-form-item label="付款阶段">
          <el-input :value="paymentForm.stageName" disabled style="width: 150px" />
          <span class="form-info">应付: ¥{{ formatMoney(paymentForm.stageAmount) }} | 已付: ¥{{ formatMoney(paymentForm.paidAmount) }}</span>
        </el-form-item>
        <el-form-item label="本次付款" prop="paymentAmount">
          <el-input-number
            v-model="paymentForm.paymentAmount"
            :min="0.01"
            :max="paymentForm.remainingAmount"
            :precision="2"
            :step="100"
            style="width: 200px"
          />
          <span class="form-tip">（未付: ¥{{ formatMoney(paymentForm.remainingAmount) }}）</span>
        </el-form-item>
        <el-form-item label="支付方式" prop="paymentMethod">
          <el-select v-model="paymentForm.paymentMethod" placeholder="请选择支付方式" style="width: 200px">
            <el-option label="银行电汇" value="银行电汇" />
            <el-option label="银行转账" value="银行转账" />
            <el-option label="支票" value="支票" />
            <el-option label="现金" value="现金" />
            <el-option label="微信" value="微信" />
            <el-option label="支付宝" value="支付宝" />
          </el-select>
        </el-form-item>
        <el-form-item label="收款账户" prop="bankAccount">
          <el-input v-model="paymentForm.bankAccount" placeholder="请输入收款银行账户" />
        </el-form-item>
        <el-form-item label="流水号">
          <el-input v-model="paymentForm.transactionNo" placeholder="请输入银行流水号/交易单号" />
        </el-form-item>
        <el-form-item label="收款日期" prop="paymentDate">
          <el-date-picker
            v-model="paymentForm.paymentDate"
            type="date"
            placeholder="选择收款日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="paymentForm.notes"
            type="textarea"
            :rows="2"
            placeholder="请输入备注（可选）"
          />
        </el-form-item>
        <el-form-item label="付款凭证">
          <el-upload
            v-model:file-list="paymentForm.attachments"
            action="#"
            :auto-upload="false"
            :limit="5"
            accept=".jpg,.jpeg,.png,.pdf"
          >
            <el-button size="small" type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持jpg/png/pdf格式，最多5个文件</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="paymentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitStagePayment" :loading="paymentSubmitting">确认付款</el-button>
      </template>
    </el-dialog>
  </el-drawer>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getContractDetail,
  addContractTrackRecord,
  confirmContract,
  sendOutContract,
  receiveBackContract,
  voidContract,
  restoreContract
} from '@/api/contracts'
import { createPayment } from '@/api/payments'

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

const emit = defineEmits(['update:modelValue', 'refresh', 'edit'])

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
const trackRecords = ref([])

// 跟踪记录表单
const trackDialogVisible = ref(false)
const trackSubmitting = ref(false)
const trackFormRef = ref(null)
const trackForm = reactive({
  followType: '',
  content: ''
})
const trackFormRules = {
  followType: [{ required: true, message: '请选择操作类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入记录内容', trigger: 'blur' }]
}

// 状态操作表单
const statusDialogVisible = ref(false)
const statusDialogTitle = ref('')
const statusSubmitting = ref(false)
const currentStatusAction = ref('')
const statusForm = reactive({
  notes: ''
})

// 寄出表单
const sendOutDialogVisible = ref(false)
const sendOutForm = reactive({
  trackingNo: '',
  notes: ''
})

// 阶段付款表单
const paymentDialogVisible = ref(false)
const paymentDialogTitle = ref('')
const paymentSubmitting = ref(false)
const paymentFormRef = ref(null)
const paymentForm = reactive({
  stageIndex: 0,
  stageName: '',
  stageAmount: 0,
  paidAmount: 0,
  remainingAmount: 0,
  paymentAmount: 0,
  paymentMethod: '银行电汇',
  bankAccount: '',
  transactionNo: '',
  paymentDate: '',
  notes: '',
  attachments: []
})
const paymentFormRules = {
  paymentAmount: [{ required: true, message: '请输入付款金额', trigger: 'blur' }],
  paymentMethod: [{ required: true, message: '请选择支付方式', trigger: 'change' }],
  paymentDate: [{ required: true, message: '请选择收款日期', trigger: 'change' }]
}

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
    trackRecords.value = data.trackRecords || []

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

// 格式化日期时间
const formatDateTime = (datetime) => {
  if (!datetime) return '-'
  const date = new Date(datetime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取渠道标签
const getChannelLabel = (channel) => {
  if (!channel) return '-'
  const channelMap = {
    'website': '官网',
    'referral': '转介绍',
    'exhibition': '展会',
    'cold_call': '陌拜电话',
    'social_media': '社交媒体',
    'advertisement': '广告',
    'partner': '合作伙伴',
    '老客户复购': '老客户复购',
    'other': '其他'
  }
  return channelMap[channel] || channel
}

// 状态类型
const getStatusType = (status) => {
  const map = {
    'draft': 'info',
    'pending': 'warning',
    'sent': 'primary',
    'active': 'success',
    'completed': 'success',
    'voided': 'danger',
    'cancelled': 'danger'
  }
  return map[status] || 'info'
}

// 状态标签
const getStatusLabel = (status) => {
  const map = {
    'draft': '草稿',
    'pending': '已确认',
    'sent': '已寄出',
    'active': '已收回',
    'completed': '已完成',
    'voided': '已作废',
    'cancelled': '已取消'
  }
  return map[status] || status
}

// 添加收款
const handleAddPayment = () => {
  // 如果有付款阶段，提示点击阶段付款
  if (paymentStagesStatus.value && paymentStagesStatus.value.length > 0) {
    ElMessage.info('请点击付款阶段的"付款"按钮进行收款')
  } else {
    ElMessage.info('暂无付款阶段信息')
  }
}

// 阶段付款
const handleStagePayment = (stage, index) => {
  const remaining = (stage.amount || 0) - (stage.paid_amount || 0)
  if (remaining <= 0) {
    ElMessage.warning('该阶段已付款完成')
    return
  }

  // 获取合同约定的付款方式和收款账户
  const paymentTerms = contract.value.payment_terms || {}
  const defaultMethod = paymentTerms.payment_method || '银行电汇'

  // 优先从payment_terms获取，其次从合同乙方信息获取
  const bankInfo = paymentTerms.bank_account || {}
  let defaultBankAccount = ''
  if (bankInfo.bank && bankInfo.account) {
    defaultBankAccount = `${bankInfo.bank} ${bankInfo.account}`
  } else if (contract.value.party_b_bank_name && contract.value.party_b_bank_account) {
    defaultBankAccount = `${contract.value.party_b_bank_name} ${contract.value.party_b_bank_account}`
  }

  // 设置表单数据
  paymentForm.stageIndex = index + 1
  paymentForm.stageName = stage.name || `第${index + 1}期`
  paymentForm.stageAmount = stage.amount || 0
  paymentForm.paidAmount = stage.paid_amount || 0
  paymentForm.remainingAmount = remaining
  paymentForm.paymentAmount = remaining // 默认全额
  paymentForm.paymentMethod = defaultMethod
  paymentForm.bankAccount = defaultBankAccount
  paymentForm.transactionNo = ''
  paymentForm.paymentDate = new Date().toISOString().split('T')[0]
  paymentForm.notes = ''
  paymentForm.attachments = []

  paymentDialogTitle.value = `付款 - ${paymentForm.stageName}`
  paymentDialogVisible.value = true
}

// 提交阶段付款
const submitStagePayment = async () => {
  if (!paymentFormRef.value) return

  try {
    await paymentFormRef.value.validate()
    paymentSubmitting.value = true

    // 调用创建收款记录API
    await createPayment({
      contract_id: props.contractId,
      customer_id: contract.value.customer_id,
      payment_stage: paymentForm.stageName,
      payment_amount: paymentForm.paymentAmount,
      payment_method: paymentForm.paymentMethod,
      bank_account: paymentForm.bankAccount,
      transaction_no: paymentForm.transactionNo,
      payment_date: paymentForm.paymentDate,
      payment_note: paymentForm.notes,
      status: 'confirmed' // 直接确认
    })

    ElMessage.success('付款成功')
    paymentDialogVisible.value = false

    // 重新加载合同详情以更新付款阶段状态
    await fetchContractDetail(props.contractId)
    emit('refresh')
  } catch (error) {
    console.error('付款失败:', error)
    ElMessage.error(error.response?.data?.message || '付款失败')
  } finally {
    paymentSubmitting.value = false
  }
}

// 添加发货
const handleAddShipment = () => {
  ElMessage.info('添加发货功能开发中')
}

// 添加发票
const handleAddInvoice = () => {
  ElMessage.info('申请开票功能开发中')
}

// 跟踪记录类型标签
const getTrackTypeLabel = (type) => {
  const map = {
    'created': '合同创建',
    'sent_out': '合同寄出',
    'received_back': '合同收回',
    'payment': '付款记录',
    'invoice': '发票记录',
    'shipment': '发货记录',
    'status_change': '状态变更',
    'other': '其他'
  }
  return map[type] || type
}

// 跟踪记录类型颜色
const getTrackTypeColor = (type) => {
  const map = {
    'created': 'success',
    'sent_out': 'primary',
    'received_back': 'success',
    'payment': 'warning',
    'invoice': 'info',
    'shipment': 'primary',
    'status_change': 'danger',
    'other': 'info'
  }
  return map[type] || 'info'
}

// 添加跟踪记录
const handleAddTrackRecord = () => {
  trackForm.followType = ''
  trackForm.content = ''
  trackDialogVisible.value = true
}

// 提交跟踪记录
const submitTrackRecord = async () => {
  if (!trackFormRef.value) return

  try {
    await trackFormRef.value.validate()
    trackSubmitting.value = true

    await addContractTrackRecord(props.contractId, {
      followType: trackForm.followType,
      content: trackForm.content
    })

    ElMessage.success('添加成功')
    trackDialogVisible.value = false

    // 重新加载合同详情
    await fetchContractDetail(props.contractId)
  } catch (error) {
    if (error !== false) {
      console.error('添加跟踪记录失败:', error)
      ElMessage.error('添加失败')
    }
  } finally {
    trackSubmitting.value = false
  }
}

// 编辑合同
const handleEdit = () => {
  visible.value = false
  emit('edit', contract.value)
}

// 确认合同
const handleConfirm = () => {
  currentStatusAction.value = 'confirm'
  statusDialogTitle.value = '确认合同'
  statusForm.notes = ''
  statusDialogVisible.value = true
}

// 寄出合同
const handleSendOut = () => {
  sendOutForm.trackingNo = ''
  sendOutForm.notes = ''
  sendOutDialogVisible.value = true
}

// 收回合同
const handleReceiveBack = () => {
  currentStatusAction.value = 'receiveBack'
  statusDialogTitle.value = '收回合同'
  statusForm.notes = ''
  statusDialogVisible.value = true
}

// 作废合同
const handleVoid = () => {
  currentStatusAction.value = 'void'
  statusDialogTitle.value = '作废合同'
  statusForm.notes = ''
  statusDialogVisible.value = true
}

// 恢复合同
const handleRestore = async () => {
  try {
    await ElMessageBox.confirm('确定要恢复该合同吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await restoreContract(props.contractId)
    ElMessage.success('恢复成功')
    await fetchContractDetail(props.contractId)
    emit('refresh')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('恢复合同失败:', error)
      ElMessage.error('恢复失败')
    }
  }
}

// 提交状态变更
const submitStatusChange = async () => {
  statusSubmitting.value = true
  try {
    const data = { notes: statusForm.notes }

    if (currentStatusAction.value === 'confirm') {
      await confirmContract(props.contractId, data)
      ElMessage.success('确认成功')
    } else if (currentStatusAction.value === 'receiveBack') {
      await receiveBackContract(props.contractId, data)
      ElMessage.success('收回成功')
    } else if (currentStatusAction.value === 'void') {
      await voidContract(props.contractId, data)
      ElMessage.success('作废成功')
    }

    statusDialogVisible.value = false
    await fetchContractDetail(props.contractId)
    emit('refresh')
  } catch (error) {
    console.error('状态变更失败:', error)
    ElMessage.error('操作失败')
  } finally {
    statusSubmitting.value = false
  }
}

// 提交寄出
const submitSendOut = async () => {
  statusSubmitting.value = true
  try {
    await sendOutContract(props.contractId, {
      trackingNo: sendOutForm.trackingNo,
      notes: sendOutForm.notes
    })
    ElMessage.success('寄出成功')
    sendOutDialogVisible.value = false
    await fetchContractDetail(props.contractId)
    emit('refresh')
  } catch (error) {
    console.error('寄出合同失败:', error)
    ElMessage.error('操作失败')
  } finally {
    statusSubmitting.value = false
  }
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

.track-record-item {
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
}

.record-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.record-operator {
  font-size: 12px;
  color: #909399;
}

.record-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  white-space: pre-wrap;
}

.action-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.form-tip {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.form-info {
  margin-left: 15px;
  color: #606266;
  font-size: 13px;
}

.text-success {
  color: #67c23a;
}
</style>
