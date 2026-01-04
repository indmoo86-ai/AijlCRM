<template>
  <el-dialog
    v-model="visible"
    title="从报价单创建合同"
    width="900px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <div v-loading="loading" class="contract-wizard">
      <!-- 步骤条 -->
      <el-steps :active="currentStep" simple finish-status="success" class="wizard-steps">
        <el-step title="基础信息" />
        <el-step title="付款条款" />
        <el-step title="交付质保" />
        <el-step title="确认提交" />
      </el-steps>

      <!-- 步骤内容 -->
      <div class="step-content">
        <!-- 步骤1: 基础信息 -->
        <div v-show="currentStep === 0" class="step-panel">
          <el-form ref="basicFormRef" :model="formData" :rules="basicRules" label-width="100px">
            <el-divider content-position="left">合同信息</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="合同标题" prop="contract_title">
                  <el-input v-model="formData.contract_title" placeholder="请输入合同标题" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="合同金额">
                  <el-input :value="formatMoney(quotationInfo.total_amount)" disabled>
                    <template #suffix>元</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="签署日期" prop="signed_date">
                  <el-date-picker
                    v-model="formData.signed_date"
                    type="date"
                    placeholder="选择签署日期"
                    style="width: 100%"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="签署地点" prop="signing_location">
                  <el-input v-model="formData.signing_location" placeholder="请输入签署地点" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider content-position="left">甲方信息（客户）</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="甲方名称" prop="party_a_name">
                  <el-input v-model="formData.party_a_name" placeholder="请输入甲方名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="甲方代表" prop="party_a_representative">
                  <el-input v-model="formData.party_a_representative" placeholder="请输入甲方代表姓名" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="甲方地址" prop="party_a_address">
                  <el-input v-model="formData.party_a_address" placeholder="请输入甲方地址" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="联系电话" prop="party_a_phone">
                  <el-input v-model="formData.party_a_phone" placeholder="请输入联系电话" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="传真" prop="party_a_fax">
                  <el-input v-model="formData.party_a_fax" placeholder="请输入传真号码" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider content-position="left">项目信息</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="酒店名称" prop="hotel_name">
                  <el-input v-model="formData.hotel_name" placeholder="请输入酒店名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="房间数量" prop="room_count">
                  <el-input-number
                    v-model="formData.room_count"
                    :min="1"
                    controls-position="right"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="项目地址" prop="project_address">
                  <el-input v-model="formData.project_address" placeholder="请输入项目地址" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <!-- 步骤2: 付款条款 -->
        <div v-show="currentStep === 1" class="step-panel">
          <el-form ref="paymentFormRef" :model="formData" label-width="100px">
            <el-divider content-position="left">付款方式</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="付款方式">
                  <el-input v-model="formData.payment_method" placeholder="银行电汇" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="合同总金额">
                  <span class="total-amount">¥{{ formatMoney(quotationInfo.total_amount) }}</span>
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider content-position="left">付款阶段（共3期）</el-divider>
            <div v-for="(stage, index) in formData.payment_stages" :key="index" class="payment-stage">
              <div class="stage-header">
                <span class="stage-number">第{{ index + 1 }}期 - {{ stage.name }}</span>
                <el-tag :type="index === 0 ? 'danger' : index === 1 ? 'warning' : 'success'" size="small">
                  {{ stage.percentage }}%
                </el-tag>
              </div>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="比例">
                    <el-input-number
                      v-model="stage.percentage"
                      :min="0"
                      :max="100"
                      :step="5"
                      controls-position="right"
                      style="width: 100%"
                      @change="handlePercentageChange"
                    >
                      <template #suffix>%</template>
                    </el-input-number>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="金额">
                    <el-input :value="formatMoney(stage.amount)" disabled>
                      <template #suffix>元</template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="付款条件">
                    <el-input v-model="stage.condition" placeholder="付款条件" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- 比例验证提示 -->
            <div v-if="totalPercentage !== 100" class="percentage-warning">
              <el-alert
                :title="`当前付款比例合计：${totalPercentage}%，应为100%`"
                type="warning"
                :closable="false"
                show-icon
              />
            </div>

            <el-divider content-position="left">收款账户信息</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="户名">
                  <el-input v-model="formData.bank_account_name" placeholder="请输入户名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="开户行">
                  <el-input v-model="formData.bank_name" placeholder="请输入开户行" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="账号">
                  <el-input v-model="formData.bank_account_no" placeholder="请输入银行账号" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <!-- 步骤3: 交付质保 -->
        <div v-show="currentStep === 2" class="step-panel">
          <el-form ref="deliveryFormRef" :model="formData" label-width="100px">
            <el-divider content-position="left">交付信息</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="交货方式">
                  <el-select v-model="formData.delivery_method" placeholder="请选择" style="width: 100%">
                    <el-option label="送货上门" value="送货上门" />
                    <el-option label="客户自提" value="客户自提" />
                    <el-option label="物流配送" value="物流配送" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="运费承担">
                  <el-select v-model="formData.freight_bearer" placeholder="请选择" style="width: 100%">
                    <el-option label="甲方承担" value="party_a" />
                    <el-option label="乙方承担" value="party_b" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="交货地点">
                  <el-input v-model="formData.delivery_address" placeholder="请输入交货地点" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="交付期限">
                  <el-date-picker
                    v-model="formData.delivery_deadline"
                    type="date"
                    placeholder="选择交付期限"
                    style="width: 100%"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider content-position="left">质保信息</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="质保期限">
                  <el-input-number
                    v-model="formData.warranty_period"
                    :min="1"
                    :max="10"
                    controls-position="right"
                    style="width: 100%"
                  >
                    <template #suffix>年</template>
                  </el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="终身保修">
                  <el-switch v-model="formData.lifetime_maintenance" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <!-- 步骤4: 确认提交 -->
        <div v-show="currentStep === 3" class="step-panel">
          <div class="confirm-section">
            <el-descriptions title="合同基本信息" :column="2" border size="small">
              <el-descriptions-item label="合同标题">{{ formData.contract_title }}</el-descriptions-item>
              <el-descriptions-item label="合同金额">
                <span class="price-highlight">¥{{ formatMoney(quotationInfo.total_amount) }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="签署日期">{{ formData.signed_date || '-' }}</el-descriptions-item>
              <el-descriptions-item label="签署地点">{{ formData.signing_location || '-' }}</el-descriptions-item>
            </el-descriptions>

            <el-descriptions title="甲方信息" :column="2" border size="small" style="margin-top: 16px">
              <el-descriptions-item label="甲方名称">{{ formData.party_a_name || '-' }}</el-descriptions-item>
              <el-descriptions-item label="甲方代表">{{ formData.party_a_representative || '-' }}</el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ formData.party_a_phone || '-' }}</el-descriptions-item>
              <el-descriptions-item label="传真">{{ formData.party_a_fax || '-' }}</el-descriptions-item>
              <el-descriptions-item label="地址" :span="2">{{ formData.party_a_address || '-' }}</el-descriptions-item>
            </el-descriptions>

            <el-descriptions title="付款条款" :column="1" border size="small" style="margin-top: 16px">
              <el-descriptions-item v-for="(stage, index) in formData.payment_stages" :key="index" :label="`第${index + 1}期 - ${stage.name}`">
                <span class="payment-info">
                  {{ stage.percentage }}% = ¥{{ formatMoney(stage.amount) }}
                  <span class="payment-condition">（{{ stage.condition }}）</span>
                </span>
              </el-descriptions-item>
            </el-descriptions>

            <el-descriptions title="交付与质保" :column="2" border size="small" style="margin-top: 16px">
              <el-descriptions-item label="交货方式">{{ formData.delivery_method || '-' }}</el-descriptions-item>
              <el-descriptions-item label="运费承担">{{ formData.freight_bearer === 'party_a' ? '甲方' : '乙方' }}</el-descriptions-item>
              <el-descriptions-item label="交货地点" :span="2">{{ formData.delivery_address || '-' }}</el-descriptions-item>
              <el-descriptions-item label="质保期限">{{ formData.warranty_period }}年</el-descriptions-item>
              <el-descriptions-item label="终身保修">{{ formData.lifetime_maintenance ? '是' : '否' }}</el-descriptions-item>
            </el-descriptions>

            <div class="product-list">
              <div class="product-list-title">合同产品明细</div>
              <el-table :data="quotationInfo.items" size="small" border max-height="200">
                <el-table-column prop="product_name" label="产品名称" min-width="150" show-overflow-tooltip />
                <el-table-column prop="quantity" label="数量" width="80" align="center" />
                <el-table-column prop="unit_price" label="单价" width="100" align="right">
                  <template #default="{ row }">¥{{ formatMoney(row.unit_price) }}</template>
                </el-table-column>
                <el-table-column prop="subtotal" label="小计" width="120" align="right">
                  <template #default="{ row }">
                    <span class="price-highlight">¥{{ formatMoney(row.subtotal) }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button v-if="currentStep > 0" @click="handlePrev">上一步</el-button>
        <el-button v-if="currentStep < 3" type="primary" @click="handleNext">下一步</el-button>
        <el-button v-if="currentStep === 3" type="success" :loading="submitting" @click="handleSubmit">
          创建合同
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getQuotationInfoForContract, createContractFromQuotation } from '@/api/contracts'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  quotationId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const submitting = ref(false)
const currentStep = ref(0)

const basicFormRef = ref(null)
const paymentFormRef = ref(null)
const deliveryFormRef = ref(null)

// 从API获取的报价单信息
const quotationInfo = reactive({
  quotation_id: null,
  quotation_no: '',
  total_amount: 0,
  items: [],
  customer: {},
  lead: {}
})

// 表单数据
const formData = reactive({
  // 基础信息
  contract_title: '',
  signed_date: '',
  signing_location: '',
  // 甲方信息
  party_a_name: '',
  party_a_address: '',
  party_a_representative: '',
  party_a_phone: '',
  party_a_fax: '',
  // 项目信息
  hotel_name: '',
  room_count: null,
  project_address: '',
  // 付款条款
  payment_method: '银行电汇',
  payment_stages: [
    { stage: 1, name: '预付款', percentage: 30, amount: 0, condition: '合同签订三个工作日内' },
    { stage: 2, name: '发货款', percentage: 60, amount: 0, condition: '乙方发货前一个工作日内' },
    { stage: 3, name: '验收款', percentage: 10, amount: 0, condition: '项目验收合格后七个工作日内' }
  ],
  bank_account_name: '温州艾居来智能科技有限公司',
  bank_name: '宁波银行股份有限公司温州经济技术开发区支行',
  bank_account_no: '86041110000759370',
  // 交付信息
  delivery_method: '送货上门',
  delivery_address: '',
  freight_bearer: 'party_a',
  delivery_deadline: '',
  // 质保信息
  warranty_period: 5,
  lifetime_maintenance: true
})

const basicRules = {
  contract_title: [
    { required: true, message: '请输入合同标题', trigger: 'blur' }
  ],
  party_a_name: [
    { required: true, message: '请输入甲方名称', trigger: 'blur' }
  ]
}

// 付款比例总计
const totalPercentage = computed(() => {
  return formData.payment_stages.reduce((sum, stage) => sum + (stage.percentage || 0), 0)
})

// 监听quotationId变化，获取报价单信息
watch(() => props.quotationId, async (newId) => {
  if (newId && visible.value) {
    await fetchQuotationInfo(newId)
  }
}, { immediate: true })

watch(visible, async (val) => {
  if (val && props.quotationId) {
    currentStep.value = 0
    await fetchQuotationInfo(props.quotationId)
  }
})

// 获取报价单信息
const fetchQuotationInfo = async (quotationId) => {
  loading.value = true
  try {
    const res = await getQuotationInfoForContract(quotationId)
    const data = res.data

    // 后端返回的数据结构：{ quotation, customer, project, items, amount, default_payment_terms, ... }
    const quotation = data.quotation || {}
    const customer = data.customer || {}
    const project = data.project || {}
    const items = data.items || []
    const amount = data.amount || {}
    const defaultPaymentTerms = data.default_payment_terms || {}

    // 填充报价单信息
    Object.assign(quotationInfo, {
      quotation_id: quotation.quotation_id,
      quotation_no: quotation.quotation_no,
      total_amount: quotation.total_amount || amount.total_amount,
      items: items,
      customer: customer,
      project: project
    })

    // 自动填充表单数据
    formData.contract_title = `${project.hotel_name || ''}客房智能化系统购销合同`
    formData.party_a_name = customer.customer_name || ''
    formData.party_a_address = customer.address || ''
    formData.party_a_phone = customer.phone || ''
    formData.hotel_name = project.hotel_name || ''
    formData.room_count = project.room_count || null
    formData.project_address = project.address || ''

    // 如果有默认付款条款，使用默认值
    if (defaultPaymentTerms.stages) {
      formData.payment_stages = defaultPaymentTerms.stages.map(s => ({
        stage: s.stage,
        name: s.name,
        percentage: s.percentage,
        amount: s.amount,
        condition: s.condition
      }))
      // 使用默认银行账户信息
      if (defaultPaymentTerms.bank_account) {
        formData.bank_account_name = defaultPaymentTerms.bank_account.name || formData.bank_account_name
        formData.bank_name = defaultPaymentTerms.bank_account.bank || formData.bank_name
        formData.bank_account_no = defaultPaymentTerms.bank_account.account || formData.bank_account_no
      }
      if (defaultPaymentTerms.payment_method) {
        formData.payment_method = defaultPaymentTerms.payment_method
      }
    }

    // 计算付款金额
    calculatePaymentAmounts()
  } catch (error) {
    console.error('获取报价单信息失败:', error)
    ElMessage.error('获取报价单信息失败')
  } finally {
    loading.value = false
  }
}

// 比例变化时重新计算金额
const handlePercentageChange = () => {
  calculatePaymentAmounts()
}

// 计算各阶段付款金额
const calculatePaymentAmounts = () => {
  const total = parseFloat(quotationInfo.total_amount) || 0
  formData.payment_stages.forEach(stage => {
    stage.amount = Math.round(total * (stage.percentage / 100) * 100) / 100
  })
}

// 格式化金额
const formatMoney = (value) => {
  const num = parseFloat(value) || 0
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 上一步
const handlePrev = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 下一步
const handleNext = async () => {
  // 验证当前步骤
  if (currentStep.value === 0) {
    if (!basicFormRef.value) return
    try {
      await basicFormRef.value.validate()
    } catch {
      return
    }
  } else if (currentStep.value === 1) {
    if (totalPercentage.value !== 100) {
      ElMessage.warning('付款比例合计必须为100%')
      return
    }
  }

  if (currentStep.value < 3) {
    currentStep.value++
  }
}

// 提交创建合同
const handleSubmit = async () => {
  if (totalPercentage.value !== 100) {
    ElMessage.warning('付款比例合计必须为100%')
    return
  }

  submitting.value = true
  try {
    const submitData = {
      quotation_id: quotationInfo.quotation_id,
      contract_title: formData.contract_title,
      signed_date: formData.signed_date,
      signing_location: formData.signing_location,
      party_a_name: formData.party_a_name,
      party_a_address: formData.party_a_address,
      party_a_representative: formData.party_a_representative,
      party_a_phone: formData.party_a_phone,
      party_a_fax: formData.party_a_fax,
      hotel_name: formData.hotel_name,
      room_count: formData.room_count,
      project_address: formData.project_address,
      delivery_method: formData.delivery_method,
      delivery_address: formData.delivery_address,
      freight_bearer: formData.freight_bearer,
      delivery_deadline: formData.delivery_deadline,
      warranty_period: formData.warranty_period,
      lifetime_maintenance: formData.lifetime_maintenance,
      payment_terms: {
        stages: formData.payment_stages,
        payment_method: formData.payment_method,
        bank_account: {
          name: formData.bank_account_name,
          bank: formData.bank_name,
          account: formData.bank_account_no
        }
      }
    }

    const res = await createContractFromQuotation(submitData)
    ElMessage.success('合同创建成功')
    emit('success', res.data)
    handleClose()
  } catch (error) {
    console.error('创建合同失败:', error)
    ElMessage.error(error.response?.data?.message || '创建合同失败')
  } finally {
    submitting.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  currentStep.value = 0
  visible.value = false
}
</script>

<style scoped>
.contract-wizard {
  min-height: 500px;
}

.wizard-steps {
  margin-bottom: 24px;
}

.step-content {
  padding: 0 20px;
}

.step-panel {
  min-height: 400px;
}

.total-amount {
  font-size: 18px;
  font-weight: bold;
  color: #e74c3c;
}

.payment-stage {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.stage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.stage-number {
  font-weight: 600;
  color: #303133;
}

.percentage-warning {
  margin-top: 16px;
}

.confirm-section {
  padding: 0 10px;
}

.price-highlight {
  color: #e74c3c;
  font-weight: 600;
}

.payment-info {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.payment-condition {
  color: #909399;
  font-size: 12px;
}

.product-list {
  margin-top: 20px;
}

.product-list-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
