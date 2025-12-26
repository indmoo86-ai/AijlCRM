<template>
  <div class="quotation-detail-page">
    <el-card shadow="never" style="margin-bottom: 20px;">
      <template #header>
        <div class="card-header">
          <span>报价单详情</span>
          <div>
            <el-button @click="handleBack">返回</el-button>
            <el-button v-if="quotation.status === 'draft'" type="primary" @click="handleEdit">
              编辑
            </el-button>
            <el-button v-if="quotation.status === 'draft'" type="success" @click="handleSubmit">
              提交报价
            </el-button>
          </div>
        </div>
      </template>
      
      <el-descriptions :column="2" border v-if="quotation.quotation_id">
        <el-descriptions-item label="报价单号">
          {{ quotation.quotation_no }}
        </el-descriptions-item>
        
        <el-descriptions-item label="版本号">
          V{{ quotation.version }}
        </el-descriptions-item>
        
        <el-descriptions-item label="客户名称">
          {{ quotation.customer?.customerName || '-' }}
        </el-descriptions-item>
        
        <el-descriptions-item label="状态">
          <el-tag v-if="quotation.status === 'draft'" type="info">草稿</el-tag>
          <el-tag v-else-if="quotation.status === 'submitted'" type="primary">已提交</el-tag>
          <el-tag v-else-if="quotation.status === 'approved'" type="success">已批准</el-tag>
          <el-tag v-else-if="quotation.status === 'rejected'" type="danger">已拒绝</el-tag>
          <el-tag v-else-if="quotation.status === 'converted'" type="warning">已转合同</el-tag>
          <el-tag v-else>{{ quotation.status }}</el-tag>
        </el-descriptions-item>
        
        <el-descriptions-item label="报价日期">
          {{ quotation.quotation_date }}
        </el-descriptions-item>
        
        <el-descriptions-item label="有效期至">
          {{ quotation.valid_until }}
        </el-descriptions-item>
        
        <el-descriptions-item label="报价金额">
          <span style="color: #f56c6c; font-size: 18px; font-weight: bold;">
            ¥{{ formatAmount(quotation.total_amount) }}
          </span>
        </el-descriptions-item>
        
        <el-descriptions-item label="负责人">
          {{ quotation.owner?.username || '-' }}
        </el-descriptions-item>
        
        <el-descriptions-item label="创建时间">
          {{ formatDate(quotation.created_at) }}
        </el-descriptions-item>
        
        <el-descriptions-item label="更新时间">
          {{ formatDate(quotation.updated_at) }}
        </el-descriptions-item>
        
        <el-descriptions-item label="备注" :span="2">
          <div style="white-space: pre-wrap;">{{ quotation.notes || '-' }}</div>
        </el-descriptions-item>
      </el-descriptions>
      
      <el-empty v-else description="报价单信息加载中..." />
    </el-card>
    
    <!-- 产品清单 -->
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>产品清单</span>
          <el-button
            v-if="quotation.status === 'draft'"
            type="primary"
            :icon="Plus"
            size="small"
            @click="handleAddItem"
          >
            添加产品
          </el-button>
        </div>
      </template>
      
      <el-table :data="items" border stripe show-summary :summary-method="getSummaries">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="product_code" label="产品编码" width="150" />
        <el-table-column prop="product_name" label="产品名称" width="200" />
        <el-table-column prop="specifications" label="规格型号" width="150" />
        
        <el-table-column prop="quantity" label="数量" width="100" align="right">
          <template #default="{ row }">
            {{ row.quantity }} {{ row.unit }}
          </template>
        </el-table-column>
        
        <el-table-column prop="unit_price" label="单价" width="120" align="right">
          <template #default="{ row }">
            ¥{{ formatAmount(row.unit_price) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="discount_rate" label="折扣" width="100" align="right">
          <template #default="{ row }">
            {{ row.discount_rate || 0 }}%
          </template>
        </el-table-column>
        
        <el-table-column prop="subtotal" label="小计" width="120" align="right">
          <template #default="{ row }">
            ¥{{ formatAmount(calculateSubtotal(row)) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="notes" label="备注" min-width="150" />
        
        <el-table-column
          v-if="quotation.status === 'draft'"
          label="操作"
          width="150"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEditItem(row)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="handleDeleteItem(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-if="items.length === 0" description="暂无产品，请添加产品" />
    </el-card>

    <!-- 附件管理 -->
    <el-card shadow="never" style="margin-bottom: 20px;">
      <AttachmentManager
        business-type="quotation"
        :business-id="route.params.id"
      />
    </el-card>

    <!-- 添加/编辑产品对话框 -->
    <el-dialog
      v-model="itemDialogVisible"
      :title="itemDialogTitle"
      width="700px"
      @close="resetItemForm"
    >
      <el-form ref="itemFormRef" :model="itemForm" :rules="itemFormRules" label-width="100px">
        <el-form-item label="选择产品" prop="product_id">
          <el-select
            v-model="itemForm.product_id"
            placeholder="请选择产品"
            filterable
            style="width: 100%"
            @change="handleProductChange"
          >
            <el-option
              v-for="product in products"
              :key="product.product_id"
              :label="`${product.product_code} - ${product.product_name}`"
              :value="product.product_id"
            >
              <span>{{ product.product_code }} - {{ product.product_name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px;">
                ¥{{ formatAmount(product.sale_price) }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品编码" prop="product_code">
              <el-input v-model="itemForm.product_code" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品名称" prop="product_name">
              <el-input v-model="itemForm.product_name" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="规格型号" prop="specifications">
          <el-input v-model="itemForm.specifications" placeholder="请输入规格型号" />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="数量" prop="quantity">
              <el-input-number
                v-model="itemForm.quantity"
                :min="1"
                :precision="0"
                style="width: 100%"
                @change="calculateItemTotal"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="单价" prop="unit_price">
              <el-input-number
                v-model="itemForm.unit_price"
                :min="0"
                :precision="2"
                style="width: 100%"
                @change="calculateItemTotal"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="折扣率(%)" prop="discount_rate">
              <el-input-number
                v-model="itemForm.discount_rate"
                :min="0"
                :max="100"
                :precision="2"
                style="width: 100%"
                @change="calculateItemTotal"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="小计金额">
          <el-input
            :value="'¥' + formatAmount(itemSubtotal)"
            disabled
            style="width: 200px;"
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
        <el-button type="primary" :loading="itemSubmitLoading" @click="handleItemSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getQuotationDetail, getQuotationItems, addQuotationItem, updateQuotationItem, deleteQuotationItem, submitQuotation } from '@/api/quotations'
import { getProductList } from '@/api/products'
import AttachmentManager from '@/components/AttachmentManager.vue'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const quotation = ref({})
const items = ref([])
const products = ref([])

// 产品清单对话框
const itemDialogVisible = ref(false)
const itemDialogTitle = ref('添加产品')
const itemFormRef = ref(null)
const itemSubmitLoading = ref(false)

const itemForm = reactive({
  item_id: null,
  product_id: null,
  product_code: '',
  product_name: '',
  specifications: '',
  quantity: 1,
  unit: '台',
  unit_price: 0,
  discount_rate: 0,
  notes: ''
})

const itemFormRules = {
  product_id: [
    { required: true, message: '请选择产品', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: '请输入数量', trigger: 'blur' }
  ],
  unit_price: [
    { required: true, message: '请输入单价', trigger: 'blur' }
  ]
}

// 计算小计
const itemSubtotal = computed(() => {
  const { quantity, unit_price, discount_rate } = itemForm
  const amount = quantity * unit_price
  const discountAmount = amount * (1 - (discount_rate || 0) / 100)
  return discountAmount
})

// 计算行小计
const calculateSubtotal = (row) => {
  const amount = row.quantity * row.unit_price
  const discountAmount = amount * (1 - (row.discount_rate || 0) / 100)
  return discountAmount
}

// 合计方法
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

// 获取报价单详情
const fetchQuotationDetail = async () => {
  try {
    const id = route.params.id
    if (!id) {
      ElMessage.error('报价单ID不存在')
      handleBack()
      return
    }
    
    const res = await getQuotationDetail(id)
    quotation.value = res.data || {}
  } catch (error) {
    console.error('Failed to fetch quotation detail:', error)
    ElMessage.error('获取报价单详情失败')
  }
}

// 获取产品清单
const fetchQuotationItems = async () => {
  try {
    const id = route.params.id
    if (!id) return
    
    const res = await getQuotationItems(id)
    items.value = res.data || []
  } catch (error) {
    console.error('Failed to fetch quotation items:', error)
  }
}

// 获取产品列表
const fetchProducts = async () => {
  try {
    const res = await getProductList({ pageSize: 1000, status: 'active' })
    products.value = res.data.rows || []
  } catch (error) {
    console.error('Failed to fetch products:', error)
  }
}

// 产品选择变化
const handleProductChange = (productId) => {
  const product = products.value.find(p => p.product_id === productId)
  if (product) {
    itemForm.product_code = product.product_code
    itemForm.product_name = product.product_name
    itemForm.unit = product.unit || '台'
    itemForm.unit_price = parseFloat(product.sale_price) || 0
  }
}

// 计算产品小计
const calculateItemTotal = () => {
  // 触发计算，itemSubtotal 会自动更新
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
    specifications: row.specifications,
    quantity: row.quantity,
    unit: row.unit,
    unit_price: parseFloat(row.unit_price),
    discount_rate: row.discount_rate || 0,
    notes: row.notes
  })
  itemDialogVisible.value = true
}

// 删除产品
const handleDeleteItem = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除此产品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteQuotationItem(quotation.value.quotation_id, row.item_id)
    ElMessage.success('删除成功')
    fetchQuotationItems()
    fetchQuotationDetail() // 刷新总金额
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete item failed:', error)
    }
  }
}

// 提交产品表单
const handleItemSubmit = async () => {
  if (!itemFormRef.value) return
  
  await itemFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    itemSubmitLoading.value = true
    try {
      const submitData = { ...itemForm }
      
      if (itemForm.item_id) {
        await updateQuotationItem(quotation.value.quotation_id, itemForm.item_id, submitData)
        ElMessage.success('更新成功')
      } else {
        await addQuotationItem(quotation.value.quotation_id, submitData)
        ElMessage.success('添加成功')
      }
      
      itemDialogVisible.value = false
      fetchQuotationItems()
      fetchQuotationDetail() // 刷新总金额
    } catch (error) {
      console.error('Submit item failed:', error)
    } finally {
      itemSubmitLoading.value = false
    }
  })
}

// 重置产品表单
const resetItemForm = () => {
  if (itemFormRef.value) {
    itemFormRef.value.resetFields()
  }
  itemForm.item_id = null
  itemForm.product_id = null
  itemForm.product_code = ''
  itemForm.product_name = ''
  itemForm.specifications = ''
  itemForm.quantity = 1
  itemForm.unit = '台'
  itemForm.unit_price = 0
  itemForm.discount_rate = 0
  itemForm.notes = ''
}

// 返回列表
const handleBack = () => {
  router.push('/quotations')
}

// 编辑报价单
const handleEdit = () => {
  ElMessage.info('编辑基本信息功能开发中')
}

// 提交报价单
const handleSubmit = async () => {
  if (items.value.length === 0) {
    ElMessage.warning('请先添加产品清单')
    return
  }
  
  try {
    await ElMessageBox.confirm('确定要提交此报价单吗？提交后将无法修改。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await submitQuotation(quotation.value.quotation_id)
    ElMessage.success('提交成功')
    fetchQuotationDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Submit failed:', error)
    }
  }
}

// 格式化日期
const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-'
}

// 格式化金额
const formatAmount = (amount) => {
  return amount ? parseFloat(amount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
}

onMounted(() => {
  fetchQuotationDetail()
  fetchQuotationItems()
  fetchProducts()
})
</script>

<style scoped>
.quotation-detail-page {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
