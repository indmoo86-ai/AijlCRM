<template>
  <div class="contract-detail">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-page-header @back="goBack" :title="'合同详情'">
        <template #content>
          <span class="page-title">{{ contract.contract_no }}</span>
        </template>
        <template #extra>
          <el-space>
            <el-button
              type="primary"
              v-if="contract.status === 'draft'"
              @click="handleSign"
              :icon="Edit"
            >
              签署合同
            </el-button>
            <el-button
              type="success"
              v-if="['active'].includes(contract.status)"
              @click="handleViewProgress"
              :icon="DataLine"
            >
              查看进度
            </el-button>
            <el-button @click="handleEdit" :icon="Edit">编辑</el-button>
          </el-space>
        </template>
      </el-page-header>
    </div>

    <!-- 合同基本信息 -->
    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">合同信息</span>
          <el-tag :type="getStatusType(contract.status)">
            {{ getStatusText(contract.status) }}
          </el-tag>
        </div>
      </template>

      <el-descriptions :column="3" border>
        <el-descriptions-item label="合同编号">
          {{ contract.contract_no }}
        </el-descriptions-item>
        <el-descriptions-item label="客户名称">
          {{ contract.customer_name }}
        </el-descriptions-item>
        <el-descriptions-item label="合同金额">
          <span class="amount">¥{{ formatAmount(contract.contract_amount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="签订日期">
          {{ formatDate(contract.contract_date) }}
        </el-descriptions-item>
        <el-descriptions-item label="生效日期">
          {{ formatDate(contract.effective_date) }}
        </el-descriptions-item>
        <el-descriptions-item label="到期日期">
          {{ formatDate(contract.expiry_date) }}
        </el-descriptions-item>
        <el-descriptions-item label="付款方式">
          {{ getPaymentTermText(contract.payment_terms) }}
        </el-descriptions-item>
        <el-descriptions-item label="交付方式">
          {{ getDeliveryTermText(contract.delivery_terms) }}
        </el-descriptions-item>
        <el-descriptions-item label="版本号">
          v{{ contract.version }}
        </el-descriptions-item>
        <el-descriptions-item label="负责人">
          {{ contract.owner_name }}
        </el-descriptions-item>
        <el-descriptions-item label="创建人">
          {{ contract.creator_name }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDateTime(contract.created_at) }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="3">
          {{ contract.notes || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 合同明细（产品清单） -->
    <el-card class="items-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">产品清单</span>
          <el-button
            v-if="contract.status === 'draft'"
            type="primary"
            size="small"
            @click="handleAddItem"
            :icon="Plus"
          >
            添加产品
          </el-button>
        </div>
      </template>

      <el-table
        :data="items"
        border
        style="width: 100%"
        :summary-method="getSummaries"
        show-summary
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="product_code" label="产品编码" width="120" />
        <el-table-column prop="product_name" label="产品名称" min-width="180" />
        <el-table-column prop="specification" label="规格型号" width="150" />
        <el-table-column prop="unit" label="单位" width="80" align="center" />
        <el-table-column prop="quantity" label="数量" width="100" align="right">
          <template #default="{ row }">
            {{ row.quantity }}
          </template>
        </el-table-column>
        <el-table-column prop="unit_price" label="单价" width="120" align="right">
          <template #default="{ row }">
            ¥{{ formatAmount(row.unit_price) }}
          </template>
        </el-table-column>
        <el-table-column prop="discount_rate" label="折扣率" width="100" align="right">
          <template #default="{ row }">
            {{ row.discount_rate }}%
          </template>
        </el-table-column>
        <el-table-column prop="subtotal" label="小计" width="140" align="right">
          <template #default="{ row }">
            <span class="amount">¥{{ formatAmount(calculateSubtotal(row)) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="notes" label="备注" min-width="150" />
        <el-table-column
          v-if="contract.status === 'draft'"
          label="操作"
          width="150"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleEditItem(row)"
              :icon="Edit"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              @click="handleDeleteItem(row)"
              :icon="Delete"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <el-empty
        v-if="items.length === 0"
        description="暂无产品明细"
        :image-size="100"
      />
    </el-card>

    <!-- 附件管理 -->
    <el-card class="attachments-card" shadow="never">
      <AttachmentManager
        business-type="contract"
        :business-id="route.params.id"
      />
    </el-card>

    <!-- 添加/编辑产品明细对话框 -->
    <el-dialog
      v-model="itemDialogVisible"
      :title="itemDialogTitle"
      width="600px"
      @close="resetItemForm"
    >
      <el-form
        :model="itemForm"
        :rules="itemRules"
        ref="itemFormRef"
        label-width="100px"
      >
        <el-form-item label="选择产品" prop="product_id">
          <el-select
            v-model="itemForm.product_id"
            placeholder="请选择产品"
            filterable
            @change="handleProductChange"
            style="width: 100%"
          >
            <el-option
              v-for="product in products"
              :key="product.product_id"
              :label="`${product.product_code} - ${product.product_name}`"
              :value="product.product_id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="产品编码" prop="product_code">
          <el-input v-model="itemForm.product_code" disabled />
        </el-form-item>

        <el-form-item label="产品名称" prop="product_name">
          <el-input v-model="itemForm.product_name" disabled />
        </el-form-item>

        <el-form-item label="规格型号" prop="specification">
          <el-input v-model="itemForm.specification" placeholder="请输入规格型号" />
        </el-form-item>

        <el-form-item label="单位" prop="unit">
          <el-input v-model="itemForm.unit" placeholder="请输入单位" />
        </el-form-item>

        <el-form-item label="数量" prop="quantity">
          <el-input-number
            v-model="itemForm.quantity"
            :min="1"
            :precision="0"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="单价" prop="unit_price">
          <el-input-number
            v-model="itemForm.unit_price"
            :min="0"
            :precision="2"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="折扣率" prop="discount_rate">
          <el-input-number
            v-model="itemForm.discount_rate"
            :min="0"
            :max="100"
            :precision="2"
            controls-position="right"
            style="width: 100%"
          />
          <span style="margin-left: 10px; color: #909399;">%</span>
        </el-form-item>

        <el-form-item label="小计">
          <el-input
            :model-value="'¥' + formatAmount(itemSubtotal)"
            disabled
          />
        </el-form-item>

        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="itemForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="itemDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitItemForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 签署合同对话框 -->
    <el-dialog
      v-model="signDialogVisible"
      title="签署合同"
      width="500px"
    >
      <el-form
        :model="signForm"
        :rules="signRules"
        ref="signFormRef"
        label-width="100px"
      >
        <el-form-item label="签订日期" prop="contract_date">
          <el-date-picker
            v-model="signForm.contract_date"
            type="date"
            placeholder="选择签订日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="生效日期" prop="effective_date">
          <el-date-picker
            v-model="signForm.effective_date"
            type="date"
            placeholder="选择生效日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="到期日期" prop="expiry_date">
          <el-date-picker
            v-model="signForm.expiry_date"
            type="date"
            placeholder="选择到期日期"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="signDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitSignForm">确定签署</el-button>
      </template>
    </el-dialog>

    <!-- 合同执行进度对话框 -->
    <el-dialog
      v-model="progressDialogVisible"
      title="合同执行进度"
      width="600px"
    >
      <div class="progress-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="合同金额">
            <span class="amount">¥{{ formatAmount(progress.contract_amount) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="完成比例">
            <el-progress
              :percentage="progress.completion_percentage"
              :color="getProgressColor(progress.completion_percentage)"
            />
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <div class="progress-item">
          <div class="progress-label">
            <span>已发货金额</span>
            <span class="amount">¥{{ formatAmount(progress.shipped_amount) }}</span>
          </div>
          <el-progress
            :percentage="calculatePercentage(progress.shipped_amount, progress.contract_amount)"
            :color="'#67C23A'"
          />
        </div>

        <div class="progress-item">
          <div class="progress-label">
            <span>已收款金额</span>
            <span class="amount">¥{{ formatAmount(progress.received_amount) }}</span>
          </div>
          <el-progress
            :percentage="calculatePercentage(progress.received_amount, progress.contract_amount)"
            :color="'#409EFF'"
          />
        </div>

        <div class="progress-item">
          <div class="progress-label">
            <span>已开票金额</span>
            <span class="amount">¥{{ formatAmount(progress.invoiced_amount) }}</span>
          </div>
          <el-progress
            :percentage="calculatePercentage(progress.invoiced_amount, progress.contract_amount)"
            :color="'#E6A23C'"
          />
        </div>
      </div>

      <template #footer>
        <el-button @click="progressDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Plus, DataLine } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import {
  getContractDetail,
  signContract,
  getContractProgress,
  getContractItems,
  addContractItem,
  updateContractItem,
  deleteContractItem
} from '@/api/contracts'
import { getProductList } from '@/api/products'
import AttachmentManager from '@/components/AttachmentManager.vue'

const route = useRoute()
const router = useRouter()

// 合同信息
const contract = ref({})
const items = ref([])
const products = ref([])

// 产品明细对话框
const itemDialogVisible = ref(false)
const itemDialogTitle = ref('添加产品')
const itemFormRef = ref(null)
const itemForm = reactive({
  item_id: null,
  product_id: null,
  product_code: '',
  product_name: '',
  specification: '',
  unit: '台',
  quantity: 1,
  unit_price: 0,
  discount_rate: 0,
  notes: ''
})

const itemRules = {
  product_id: [{ required: true, message: '请选择产品', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  unit_price: [{ required: true, message: '请输入单价', trigger: 'blur' }]
}

// 签署合同对话框
const signDialogVisible = ref(false)
const signFormRef = ref(null)
const signForm = reactive({
  contract_date: '',
  effective_date: '',
  expiry_date: ''
})

const signRules = {
  contract_date: [{ required: true, message: '请选择签订日期', trigger: 'change' }],
  effective_date: [{ required: true, message: '请选择生效日期', trigger: 'change' }],
  expiry_date: [{ required: true, message: '请选择到期日期', trigger: 'change' }]
}

// 执行进度对话框
const progressDialogVisible = ref(false)
const progress = ref({
  contract_amount: 0,
  shipped_amount: 0,
  received_amount: 0,
  invoiced_amount: 0,
  completion_percentage: 0
})

// 计算产品明细小计
const itemSubtotal = computed(() => {
  const { quantity, unit_price, discount_rate } = itemForm
  const amount = quantity * unit_price
  const discountAmount = amount * (1 - (discount_rate || 0) / 100)
  return discountAmount
})

// 加载合同详情
const loadContractDetail = async () => {
  try {
    const res = await getContractDetail(route.params.id)
    contract.value = res.data || {}
  } catch (error) {
    ElMessage.error('加载合同详情失败')
    console.error(error)
  }
}

// 加载合同明细
const loadContractItems = async () => {
  try {
    const res = await getContractItems(route.params.id)
    items.value = res.data || []
  } catch (error) {
    ElMessage.error('加载合同明细失败')
    console.error(error)
  }
}

// 加载产品列表
const loadProducts = async () => {
  try {
    const res = await getProductList({ status: 'active' })
    products.value = res.data?.list || []
  } catch (error) {
    console.error('加载产品列表失败', error)
  }
}

// 产品选择变化
const handleProductChange = (productId) => {
  const product = products.value.find(p => p.product_id === productId)
  if (product) {
    itemForm.product_code = product.product_code
    itemForm.product_name = product.product_name
    itemForm.specification = product.specification || ''
    itemForm.unit = product.unit || '台'
    itemForm.unit_price = parseFloat(product.sale_price) || 0
  }
}

// 添加产品
const handleAddItem = () => {
  itemDialogTitle.value = '添加产品'
  resetItemForm()
  itemDialogVisible.value = true
}

// 编辑产品
const handleEditItem = (row) => {
  itemDialogTitle.value = '编辑产品'
  Object.assign(itemForm, {
    item_id: row.item_id,
    product_id: row.product_id,
    product_code: row.product_code,
    product_name: row.product_name,
    specification: row.specification || '',
    unit: row.unit,
    quantity: row.quantity,
    unit_price: parseFloat(row.unit_price),
    discount_rate: parseFloat(row.discount_rate) || 0,
    notes: row.notes || ''
  })
  itemDialogVisible.value = true
}

// 删除产品
const handleDeleteItem = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个产品吗？', '提示', {
      type: 'warning'
    })
    await deleteContractItem(route.params.id, row.item_id)
    ElMessage.success('删除成功')
    await loadContractItems()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

// 提交产品表单
const submitItemForm = async () => {
  try {
    await itemFormRef.value.validate()

    const data = {
      product_id: itemForm.product_id,
      product_code: itemForm.product_code,
      product_name: itemForm.product_name,
      specification: itemForm.specification,
      unit: itemForm.unit,
      quantity: itemForm.quantity,
      unit_price: itemForm.unit_price,
      discount_rate: itemForm.discount_rate,
      notes: itemForm.notes
    }

    if (itemForm.item_id) {
      await updateContractItem(route.params.id, itemForm.item_id, data)
      ElMessage.success('更新成功')
    } else {
      await addContractItem(route.params.id, data)
      ElMessage.success('添加成功')
    }

    itemDialogVisible.value = false
    await loadContractItems()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败')
      console.error(error)
    }
  }
}

// 重置产品表单
const resetItemForm = () => {
  Object.assign(itemForm, {
    item_id: null,
    product_id: null,
    product_code: '',
    product_name: '',
    specification: '',
    unit: '台',
    quantity: 1,
    unit_price: 0,
    discount_rate: 0,
    notes: ''
  })
  itemFormRef.value?.clearValidate()
}

// 计算小计
const calculateSubtotal = (item) => {
  const amount = item.quantity * item.unit_price
  const discountAmount = amount * (1 - (item.discount_rate || 0) / 100)
  return discountAmount
}

// 表格合计行
const getSummaries = (param) => {
  const { columns } = param
  const sums = []

  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }

    if (column.property === 'quantity') {
      const total = items.value.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
      sums[index] = total
    } else if (column.property === 'subtotal') {
      const total = items.value.reduce((sum, item) => sum + calculateSubtotal(item), 0)
      sums[index] = '¥' + formatAmount(total)
    } else {
      sums[index] = ''
    }
  })

  return sums
}

// 签署合同
const handleSign = () => {
  // 检查是否有产品明细
  if (items.value.length === 0) {
    ElMessage.warning('请先添加产品明细')
    return
  }

  signForm.contract_date = dayjs().format('YYYY-MM-DD')
  signForm.effective_date = dayjs().format('YYYY-MM-DD')
  signForm.expiry_date = dayjs().add(1, 'year').format('YYYY-MM-DD')
  signDialogVisible.value = true
}

// 提交签署表单
const submitSignForm = async () => {
  try {
    await signFormRef.value.validate()

    await signContract(route.params.id, {
      contract_date: signForm.contract_date,
      effective_date: signForm.effective_date,
      expiry_date: signForm.expiry_date
    })

    ElMessage.success('签署成功')
    signDialogVisible.value = false
    await loadContractDetail()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('签署失败')
      console.error(error)
    }
  }
}

// 查看执行进度
const handleViewProgress = async () => {
  try {
    const res = await getContractProgress(route.params.id)
    progress.value = res.data || {
      contract_amount: 0,
      shipped_amount: 0,
      received_amount: 0,
      invoiced_amount: 0,
      completion_percentage: 0
    }
    progressDialogVisible.value = true
  } catch (error) {
    ElMessage.error('加载执行进度失败')
    console.error(error)
  }
}

// 计算百分比
const calculatePercentage = (current, total) => {
  if (!total || total === 0) return 0
  return Math.round((current / total) * 100)
}

// 获取进度颜色
const getProgressColor = (percentage) => {
  if (percentage >= 80) return '#67C23A'
  if (percentage >= 50) return '#E6A23C'
  return '#F56C6C'
}

// 编辑合同
const handleEdit = () => {
  router.push(`/contracts/edit/${route.params.id}`)
}

// 返回
const goBack = () => {
  router.back()
}

// 格式化金额
const formatAmount = (amount) => {
  if (!amount) return '0.00'
  return Number(amount).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 格式化日期
const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD') : '-'
}

// 格式化日期时间
const formatDateTime = (datetime) => {
  return datetime ? dayjs(datetime).format('YYYY-MM-DD HH:mm:ss') : '-'
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    draft: 'info',
    pending: 'warning',
    active: 'success',
    completed: '',
    cancelled: 'danger'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    draft: '草稿',
    pending: '待生效',
    active: '执行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return texts[status] || status
}

// 获取付款方式文本
const getPaymentTermText = (terms) => {
  const texts = {
    advance: '预付款',
    installment: '分期付款',
    delivery: '货到付款',
    monthly: '月结'
  }
  return texts[terms] || terms
}

// 获取交付方式文本
const getDeliveryTermText = (terms) => {
  const texts = {
    shipping: '物流配送',
    pickup: '客户自提',
    installation: '包安装'
  }
  return texts[terms] || terms
}

// 页面加载
onMounted(async () => {
  await loadContractDetail()
  await loadContractItems()
  await loadProducts()
})
</script>

<style scoped lang="scss">
.contract-detail {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;
    background: #fff;
    padding: 16px;
    border-radius: 4px;

    .page-title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .info-card,
  .items-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }
  }

  .amount {
    color: #f56c6c;
    font-weight: 600;
    font-size: 16px;
  }

  .progress-info {
    padding: 10px 0;

    .progress-item {
      margin-top: 20px;

      .progress-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        font-size: 14px;
        color: #606266;

        .amount {
          font-size: 14px;
        }
      }
    }
  }
}
</style>
