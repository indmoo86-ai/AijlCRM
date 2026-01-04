<template>
  <div class="quotations-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>报价管理</span>
          <el-button type="primary" :icon="Plus" @click="goToLeadsPage">
            新建报价单
          </el-button>
          <span class="header-tip">（请从线索页面创建报价单）</span>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="报价单号">
          <el-input
            v-model="searchForm.keyword"
            placeholder="报价单号/酒店名称"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择"
            clearable
            @clear="handleSearch"
          >
            <el-option label="草稿" value="draft" />
            <el-option label="已发送" value="sent" />
            <el-option label="已接受" value="accepted" />
            <el-option label="已作废" value="voided" />
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
        <el-table-column prop="quotation_no" label="报价单号" width="140" />

        <el-table-column prop="hotel_name" label="酒店名称" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.hotel_name || row.customer?.customerName || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="lead" label="关联线索" width="130">
          <template #default="{ row }">
            <span v-if="row.lead" class="lead-link" @click="goToLead(row.lead.id)">
              {{ row.lead.leadNo }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column prop="room_count" label="房间数" width="70" align="center">
          <template #default="{ row }">
            {{ row.room_count || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="quotation_date" label="报价日期" width="100" />
        <el-table-column prop="valid_until" label="有效期至" width="100" />

        <el-table-column prop="total_quantity" label="数量" width="60" align="center" />

        <el-table-column prop="total_sale_price" label="名义总价" width="100" align="right">
          <template #default="{ row }">
            ¥{{ formatAmount(row.total_sale_price) }}
          </template>
        </el-table-column>

        <el-table-column prop="total_amount" label="实际总价" width="100" align="right">
          <template #default="{ row }">
            <span class="price-actual">¥{{ formatAmount(row.total_amount) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="version" label="版本" width="60" align="center">
          <template #default="{ row }">
            V{{ row.version || 1 }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'draft'" type="info">草稿</el-tag>
            <el-tag v-else-if="row.status === 'sent'" type="primary">已发送</el-tag>
            <el-tag v-else-if="row.status === 'accepted'" type="success">已接受</el-tag>
            <el-tag v-else-if="row.status === 'voided'" type="danger">已作废</el-tag>
            <el-tag v-else>{{ row.status }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" size="small" @click="handleView(row)">
                查看
              </el-button>
              <el-button link type="primary" size="small" @click="handleExportPDF(row)">
                PDF
              </el-button>
              <el-button
                v-if="row.status === 'draft'"
                link
                type="primary"
                size="small"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                v-if="row.status !== 'voided'"
                link
                type="warning"
                size="small"
                @click="handleRevise(row)"
              >
                修改
              </el-button>
              <el-button
                v-if="row.status !== 'voided'"
                link
                type="danger"
                size="small"
                @click="handleVoid(row)"
              >
                作废
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

    <!-- 新建/编辑报价单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="95%"
      style="max-width: 1400px"
      :close-on-click-modal="false"
      @close="resetForm"
    >
      <!-- 客户/酒店信息 -->
      <div class="lead-info-bar">
        <span class="info-item"><label>客户：</label>{{ form.customerName || leadInfo.customerName || '-' }}</span>
        <span class="info-item"><label>酒店：</label>{{ form.hotel_name || '-' }}</span>
        <span class="info-item"><label>地区：</label>{{ [form.province, form.city, form.district].filter(Boolean).join('/') || '-' }}</span>
        <span class="info-item"><label>房间数：</label><strong>{{ form.room_count || 0 }}</strong> 间</span>
        <span class="info-item">
          <label>报价日期：</label>
          <el-date-picker
            v-model="form.quotation_date"
            type="date"
            placeholder="选择"
            size="small"
            style="width: 130px"
            value-format="YYYY-MM-DD"
          />
        </span>
        <span class="info-item">
          <label>有效期至：</label>
          <el-date-picker
            v-model="form.valid_until"
            type="date"
            placeholder="选择"
            size="small"
            style="width: 130px"
            value-format="YYYY-MM-DD"
          />
        </span>
      </div>

      <!-- 产品选择区域 -->
      <el-card class="products-card" shadow="never">
        <template #header>
          <div class="products-header">
            <span class="info-title">添加产品</span>
          </div>
        </template>

        <div class="product-search">
          <el-form :inline="true" :model="productSearch">
            <el-form-item label="分类">
              <el-select v-model="productSearch.category_id" placeholder="全部" clearable style="width: 120px" @change="fetchProducts">
                <el-option
                  v-for="cat in categories"
                  :key="cat.category_id"
                  :label="cat.category_name"
                  :value="cat.category_id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="品牌">
              <el-select v-model="productSearch.brand" placeholder="全部" clearable style="width: 120px" @change="fetchProducts">
                <el-option
                  v-for="brand in brandList"
                  :key="brand"
                  :label="brand"
                  :value="brand"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="价格">
              <el-input-number
                v-model="productSearch.minPrice"
                :min="0"
                :controls="false"
                placeholder="最低"
                size="small"
                style="width: 80px"
              />
              <span style="margin: 0 5px;">-</span>
              <el-input-number
                v-model="productSearch.maxPrice"
                :min="0"
                :controls="false"
                placeholder="最高"
                size="small"
                style="width: 80px"
              />
            </el-form-item>
            <el-form-item label="关键词">
              <el-input
                v-model="productSearch.keyword"
                placeholder="名称/编码"
                clearable
                style="width: 150px"
                @keyup.enter="fetchProducts"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="small" @click="fetchProducts">搜索</el-button>
            </el-form-item>
          </el-form>

          <div class="product-list">
            <el-table :data="productList" size="small" max-height="200" border>
              <el-table-column prop="product_code" label="编码" width="120" />
              <el-table-column prop="product_name" label="产品名称" min-width="150" />
              <el-table-column prop="brand" label="品牌" width="100" />
              <el-table-column prop="cost_price" label="成本价" width="90" align="right">
                <template #default="{ row }">
                  ¥{{ formatAmount(row.cost_price) }}
                </template>
              </el-table-column>
              <el-table-column prop="sale_price" label="销售价" width="90" align="right">
                <template #default="{ row }">
                  ¥{{ formatAmount(row.sale_price) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="70" align="center">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click="handleAddProduct(row)">
                    添加
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-card>

      <!-- 已选产品明细 -->
      <el-card class="items-card" shadow="never">
        <template #header>
          <div class="items-header">
            <span class="info-title">报价明细</span>
            <span class="items-count">共 {{ form.items.length }} 项产品</span>
          </div>
        </template>

        <el-table :data="form.items" border size="small">
          <el-table-column type="index" label="#" width="45" align="center" />
          <el-table-column prop="product_code" label="编码" width="120" />
          <el-table-column prop="product_name" label="产品名称" min-width="150" />
          <el-table-column prop="brand" label="品牌" width="90" />
          <el-table-column label="数量" width="110" align="center">
            <template #default="{ row, $index }">
              <el-input-number
                v-model="row.quantity"
                :min="1"
                :max="99999"
                size="small"
                style="width: 90px"
                @change="recalculateItem($index)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="sale_price" label="销售价" width="90" align="right">
            <template #default="{ row }">
              ¥{{ formatAmount(row.sale_price) }}
            </template>
          </el-table-column>
          <el-table-column label="优惠价" width="110" align="center">
            <template #default="{ row, $index }">
              <el-input-number
                v-model="row.unit_price"
                :min="0"
                :precision="2"
                :controls="false"
                size="small"
                style="width: 90px"
                @change="recalculateItem($index)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="subtotal" label="小计" width="100" align="right">
            <template #default="{ row }">
              <span class="price-actual">¥{{ formatAmount(row.subtotal) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="60" align="center">
            <template #default="{ $index }">
              <el-button link type="danger" size="small" @click="handleRemoveItem($index)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 汇总信息 -->
        <div class="summary-section">
          <div class="summary-row">
            <span class="summary-item">产品总数：<strong>{{ summary.totalQuantity }}</strong> 件</span>
            <span class="summary-item">成本总计：<strong>¥{{ formatAmount(summary.totalCost) }}</strong></span>
            <span class="summary-item">名义总价：<strong>¥{{ formatAmount(summary.totalSalePrice) }}</strong></span>
            <span class="summary-item">
              折扣率：
              <el-tag :type="discountRatioType" size="small">{{ discountRatioText }}</el-tag>
            </span>
            <span class="summary-item summary-total">
              实际总价：
              <el-input-number
                v-model="form.final_amount"
                :min="0"
                :precision="2"
                :controls="false"
                size="small"
                style="width: 120px"
                @change="handleFinalAmountChange"
              />
              <el-tooltip content="修改总价后，各产品价格将按比例自动调整" placement="top">
                <el-icon style="margin-left: 5px; color: #909399; cursor: help;"><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
          </div>
        </div>
      </el-card>

      <!-- 备注 -->
      <el-card class="notes-card" shadow="never">
        <template #header>
          <span class="info-title">备注信息</span>
        </template>
        <el-input
          v-model="form.notes"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
        />
      </el-card>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleFormSubmit">
          {{ form.quotation_id ? '保存' : '创建报价单' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看报价单对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="报价单详情"
      width="90%"
      style="max-width: 1200px"
    >
      <QuotationDetail v-if="viewDialogVisible" :quotation="currentQuotation" @export-pdf="handleExportPDF" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, QuestionFilled } from '@element-plus/icons-vue'
import {
  getQuotationList,
  getQuotationDetail,
  createQuotation,
  updateQuotation,
  voidQuotation,
  reviseQuotation,
  getQuotationPDF
} from '@/api/quotations'
import { getCustomerList } from '@/api/customers'
import { getProductList, getProductCategories } from '@/api/products'
import dayjs from 'dayjs'
import QuotationDetail from './components/QuotationDetail.vue'

const route = useRoute()

// 来源线索信息
const leadInfo = reactive({
  leadId: null,
  customerId: null,
  customerName: '',
  hotelName: '',
  province: '',
  city: '',
  district: '',
  roomCount: null
})

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const dialogTitle = ref('新建报价单')
const tableData = ref([])
const customers = ref([])
const categories = ref([])
const productList = ref([])
const currentQuotation = ref(null)

const searchForm = reactive({
  keyword: '',
  status: ''
})

const productSearch = reactive({
  category_id: null,
  brand: '',
  minPrice: null,
  maxPrice: null,
  keyword: ''
})

const brandList = ref([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  quotation_id: null,
  customer_id: null,
  customerName: '',
  lead_id: null,
  hotel_name: '',
  province: '',
  city: '',
  district: '',
  room_count: null,
  quotation_date: '',
  valid_until: '',
  notes: '',
  items: [],
  final_amount: 0  // 可编辑的实际总价
})

// 计算汇总信息
const summary = computed(() => {
  let totalQuantity = 0
  let totalCost = 0
  let totalSalePrice = 0
  let totalAmount = 0

  form.items.forEach(item => {
    totalQuantity += item.quantity || 0
    totalCost += item.cost_subtotal || 0
    totalSalePrice += item.sale_subtotal || 0
    totalAmount += item.subtotal || 0
  })

  return {
    totalQuantity,
    totalCost,
    totalSalePrice,
    totalAmount,
    discountAmount: totalSalePrice - totalAmount
  }
})

// 折扣率显示文本
const discountRatioText = computed(() => {
  if (summary.value.totalSalePrice <= 0) return '0%'
  const ratio = (form.final_amount / summary.value.totalSalePrice) * 100
  if (ratio === 100) return '原价'
  if (ratio > 100) return `+${(ratio - 100).toFixed(1)}%`
  return `${(100 - ratio).toFixed(1)}% OFF`
})

// 折扣率标签类型
const discountRatioType = computed(() => {
  if (summary.value.totalSalePrice <= 0) return 'info'
  const ratio = form.final_amount / summary.value.totalSalePrice
  if (ratio === 1) return 'info'
  if (ratio > 1) return 'warning'  // 加价
  if (ratio >= 0.9) return 'success'  // 9折以上
  if (ratio >= 0.7) return 'primary'  // 7-9折
  return 'danger'  // 低于7折
})

// 获取客户列表
const fetchCustomers = async () => {
  try {
    const res = await getCustomerList({ pageSize: 1000 })
    customers.value = res.data.list || res.data.rows || []
  } catch (error) {
    console.error('Failed to fetch customers:', error)
  }
}

// 获取产品分类
const fetchCategories = async () => {
  try {
    const res = await getProductCategories()
    categories.value = res.data || []
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

// 获取产品列表
const fetchProducts = async () => {
  try {
    const params = {
      pageSize: 100,
      status: 'active'
    }
    if (productSearch.category_id) params.category_id = productSearch.category_id
    if (productSearch.keyword) params.keyword = productSearch.keyword
    if (productSearch.brand) params.brand = productSearch.brand
    if (productSearch.minPrice) params.minPrice = productSearch.minPrice
    if (productSearch.maxPrice) params.maxPrice = productSearch.maxPrice

    const res = await getProductList(params)
    let products = res.data.list || res.data.rows || []

    // 前端价格过滤（如果后端不支持）
    if (productSearch.minPrice || productSearch.maxPrice) {
      products = products.filter(p => {
        const price = parseFloat(p.sale_price) || 0
        if (productSearch.minPrice && price < productSearch.minPrice) return false
        if (productSearch.maxPrice && price > productSearch.maxPrice) return false
        return true
      })
    }

    // 前端品牌过滤（如果后端不支持）
    if (productSearch.brand) {
      products = products.filter(p => p.brand === productSearch.brand)
    }

    productList.value = products

    // 提取品牌列表（首次加载时）
    if (brandList.value.length === 0) {
      const allProducts = res.data.list || res.data.rows || []
      const brands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))]
      brandList.value = brands.sort()
    }
  } catch (error) {
    console.error('Failed to fetch products:', error)
  }
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
    const res = await getQuotationList(params)
    tableData.value = res.data.list || res.data.rows || []
    pagination.total = res.data.pagination?.total || res.data.total || 0
  } catch (error) {
    console.error('Failed to fetch quotations:', error)
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
  searchForm.keyword = ''
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

// 跳转到线索页面创建报价单
const goToLeadsPage = () => {
  ElMessage.info('请从线索页面选择线索后创建报价单')
  router.push('/leads')
}

// 跳转到线索详情
const goToLead = (leadId) => {
  router.push({ path: '/leads', query: { viewId: leadId } })
}

// 新建（仅用于从线索页面跳转过来时）
const handleCreate = () => {
  dialogTitle.value = '新建报价单'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (row) => {
  dialogTitle.value = '编辑报价单'
  try {
    const res = await getQuotationDetail(row.quotation_id)
    const data = res.data

    Object.assign(form, {
      quotation_id: data.quotation_id,
      customer_id: data.customer_id,
      lead_id: data.lead_id,
      hotel_name: data.hotel_name,
      province: data.province,
      city: data.city,
      district: data.district,
      room_count: data.room_count,
      quotation_date: data.quotation_date,
      valid_until: data.valid_until,
      notes: data.notes,
      items: (data.items || []).map(item => ({
        product_id: item.product_id,
        product_code: item.product_code,
        product_name: item.product_name,
        specification: item.specification,
        quantity: item.quantity,
        cost_price: parseFloat(item.cost_price) || 0,
        sale_price: parseFloat(item.sale_price) || 0,
        unit_price: parseFloat(item.unit_price) || 0,
        cost_subtotal: parseFloat(item.cost_subtotal) || 0,
        sale_subtotal: parseFloat(item.sale_subtotal) || 0,
        subtotal: parseFloat(item.subtotal) || 0
      }))
    })

    dialogVisible.value = true
  } catch (error) {
    console.error('Failed to get quotation detail:', error)
    ElMessage.error('获取报价单详情失败')
  }
}

// 查看
const handleView = async (row) => {
  try {
    const res = await getQuotationDetail(row.quotation_id)
    currentQuotation.value = res.data
    viewDialogVisible.value = true
  } catch (error) {
    console.error('Failed to get quotation detail:', error)
    ElMessage.error('获取报价单详情失败')
  }
}

// 修改（生成新版本）
const handleRevise = async (row) => {
  try {
    await ElMessageBox.confirm(
      '修改将作废当前报价单并生成新版本，确定要继续吗？',
      '提示',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )

    const res = await getQuotationDetail(row.quotation_id)
    const data = res.data

    dialogTitle.value = `修改报价单 (V${(data.version || 1) + 1})`

    Object.assign(form, {
      quotation_id: null, // 新建
      _revise_from: data.quotation_id, // 标记来源
      customer_id: data.customer_id,
      lead_id: data.lead_id,
      hotel_name: data.hotel_name,
      province: data.province,
      city: data.city,
      district: data.district,
      room_count: data.room_count,
      quotation_date: dayjs().format('YYYY-MM-DD'),
      valid_until: data.valid_until,
      notes: data.notes,
      items: (data.items || []).map(item => ({
        product_id: item.product_id,
        product_code: item.product_code,
        product_name: item.product_name,
        specification: item.specification,
        quantity: item.quantity,
        cost_price: parseFloat(item.cost_price) || 0,
        sale_price: parseFloat(item.sale_price) || 0,
        unit_price: parseFloat(item.unit_price) || 0,
        cost_subtotal: parseFloat(item.cost_subtotal) || 0,
        sale_subtotal: parseFloat(item.sale_subtotal) || 0,
        subtotal: parseFloat(item.subtotal) || 0
      }))
    })

    dialogVisible.value = true
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to revise quotation:', error)
    }
  }
}

// 作废
const handleVoid = async (row) => {
  try {
    await ElMessageBox.confirm('确定要作废此报价单吗？作废后不可恢复。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await voidQuotation(row.quotation_id)
    ElMessage.success('报价单已作废')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Void failed:', error)
    }
  }
}

// 导出PDF
const handleExportPDF = async (row) => {
  try {
    const quotationId = row.quotation_id || row.quotationId
    const res = await getQuotationPDF(quotationId)
    const pdfData = res.data.pdfData

    // 使用浏览器打印功能生成PDF
    generatePDF(pdfData)

    ElMessage.success('PDF已生成')
  } catch (error) {
    console.error('Export PDF failed:', error)
    ElMessage.error('导出PDF失败')
  }
}

// 生成PDF
const generatePDF = (pdfData) => {
  const printWindow = window.open('', '_blank')
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${pdfData.title} - ${pdfData.quotationNo}</title>
      <style>
        body { font-family: "Microsoft YaHei", sans-serif; padding: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { color: #666; margin: 10px 0; }
        .info-section { margin-bottom: 20px; }
        .info-section h3 { border-bottom: 1px solid #ddd; padding-bottom: 10px; }
        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .info-item { display: flex; }
        .info-label { color: #666; width: 100px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #f5f5f5; }
        .text-right { text-align: right; }
        .summary { margin-top: 20px; text-align: right; }
        .summary-item { margin: 5px 0; }
        .total { font-size: 18px; font-weight: bold; color: #e74c3c; }
        .footer { margin-top: 40px; text-align: right; color: #666; }
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${pdfData.title}</h1>
        <p>报价单号：${pdfData.quotationNo}</p>
        <p>报价日期：${pdfData.date} | 有效期至：${pdfData.validUntil}</p>
      </div>

      <div class="info-section">
        <h3>客户信息</h3>
        <div class="info-grid">
          <div class="info-item"><span class="info-label">客户名称：</span><span>${pdfData.customerInfo.customerName || '-'}</span></div>
          <div class="info-item"><span class="info-label">酒店名称：</span><span>${pdfData.customerInfo.hotelName || '-'}</span></div>
          <div class="info-item"><span class="info-label">所在地区：</span><span>${pdfData.customerInfo.region || '-'}</span></div>
          <div class="info-item"><span class="info-label">房间数量：</span><span>${pdfData.customerInfo.roomCount || '-'}</span></div>
        </div>
      </div>

      <div class="info-section">
        <h3>产品明细</h3>
        <table>
          <thead>
            <tr>
              <th>序号</th>
              <th>产品编码</th>
              <th>产品名称</th>
              <th>规格</th>
              <th class="text-right">数量</th>
              <th class="text-right">单价</th>
              <th class="text-right">小计</th>
            </tr>
          </thead>
          <tbody>
            ${pdfData.items.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.productCode}</td>
                <td>${item.productName}</td>
                <td>${item.specification || '-'}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">¥${parseFloat(item.unitPrice || 0).toFixed(2)}</td>
                <td class="text-right">¥${parseFloat(item.subtotal || 0).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="summary">
        <div class="summary-item">产品总数：${pdfData.summary.totalQuantity} 件</div>
        <div class="summary-item">名义总价：¥${parseFloat(pdfData.summary.totalSalePrice || 0).toFixed(2)}</div>
        <div class="summary-item">优惠金额：-¥${parseFloat(pdfData.summary.discountAmount || 0).toFixed(2)}</div>
        <div class="summary-item total">实际总价：¥${parseFloat(pdfData.summary.totalAmount || 0).toFixed(2)}</div>
      </div>

      ${pdfData.notes ? `<div class="info-section"><h3>备注</h3><p>${pdfData.notes}</p></div>` : ''}

      <div class="footer">
        <p>销售负责人：${pdfData.owner || '-'}</p>
        <p>打印时间：${new Date().toLocaleString()}</p>
      </div>

      <script>window.onload = function() { window.print(); }<\/script>
    </body>
    </html>
  `
  printWindow.document.write(html)
  printWindow.document.close()
}

// 客户选择变更
const handleCustomerChange = (customerId) => {
  const customer = customers.value.find(c => c.id === customerId)
  if (customer) {
    form.hotel_name = form.hotel_name || customer.customerName
  }
}

// 添加产品到报价单
const handleAddProduct = (product) => {
  // 检查是否已存在
  const existing = form.items.find(item => item.product_id === product.product_id)
  if (existing) {
    existing.quantity += (form.room_count || 1)
    recalculateItem(form.items.indexOf(existing))
    ElMessage.success('产品数量已增加')
    return
  }

  const costPrice = parseFloat(product.cost_price) || 0
  const salePrice = parseFloat(product.sale_price) || 0
  const defaultQuantity = form.room_count || 1  // 默认数量等于房间数

  form.items.push({
    product_id: product.product_id,
    product_code: product.product_code,
    product_name: product.product_name,
    brand: product.brand || '',
    quantity: defaultQuantity,
    cost_price: costPrice,
    sale_price: salePrice,
    unit_price: salePrice, // 默认使用销售价
    cost_subtotal: costPrice * defaultQuantity,
    sale_subtotal: salePrice * defaultQuantity,
    subtotal: salePrice * defaultQuantity
  })

  // 更新实际总价
  updateFinalAmount()
  ElMessage.success('产品已添加')
}

// 删除产品
const handleRemoveItem = (index) => {
  form.items.splice(index, 1)
  updateFinalAmount()
}

// 重新计算明细
const recalculateItem = (index) => {
  const item = form.items[index]
  if (!item) return

  item.cost_subtotal = item.quantity * item.cost_price
  item.sale_subtotal = item.quantity * item.sale_price
  item.subtotal = item.quantity * item.unit_price
  updateFinalAmount()
}

// 更新实际总价（根据明细计算）
const updateFinalAmount = () => {
  let total = 0
  form.items.forEach(item => {
    total += item.subtotal || 0
  })
  form.final_amount = total
}

// 手动修改实际总价时的处理 - 按比例调整每个产品的价格
const handleFinalAmountChange = () => {
  if (form.items.length === 0) return

  // 计算当前名义总价（基于销售价）
  const currentSaleTotal = form.items.reduce((sum, item) => {
    return sum + (item.quantity * item.sale_price)
  }, 0)

  if (currentSaleTotal <= 0) return

  // 计算折扣/加成比例
  const ratio = form.final_amount / currentSaleTotal

  // 按比例调整每个产品的优惠价和小计
  form.items.forEach(item => {
    // 新的优惠价 = 销售价 * 比例，保留2位小数
    item.unit_price = Math.round(item.sale_price * ratio * 100) / 100
    // 重新计算小计
    item.subtotal = Math.round(item.quantity * item.unit_price * 100) / 100
    item.sale_subtotal = item.quantity * item.sale_price
    item.cost_subtotal = item.quantity * item.cost_price
  })

  // 由于四舍五入可能产生误差，需要调整最后一项使总价精确
  const adjustedTotal = form.items.reduce((sum, item) => sum + item.subtotal, 0)
  const diff = form.final_amount - adjustedTotal
  if (Math.abs(diff) > 0.001 && form.items.length > 0) {
    // 将误差加到最后一项
    const lastItem = form.items[form.items.length - 1]
    lastItem.subtotal = Math.round((lastItem.subtotal + diff) * 100) / 100
    // 反推优惠价
    if (lastItem.quantity > 0) {
      lastItem.unit_price = Math.round(lastItem.subtotal / lastItem.quantity * 100) / 100
    }
  }
}

// 提交表单
const handleFormSubmit = async () => {
  if (!form.customer_id) {
    ElMessage.warning('请选择客户')
    return
  }
  if (!form.quotation_date) {
    ElMessage.warning('请选择报价日期')
    return
  }
  if (!form.valid_until) {
    ElMessage.warning('请选择有效期')
    return
  }
  if (form.items.length === 0) {
    ElMessage.warning('请至少添加一个产品')
    return
  }

  submitLoading.value = true
  try {
    const submitData = {
      customer_id: form.customer_id,
      lead_id: form.lead_id || leadInfo.leadId,
      hotel_name: form.hotel_name,
      province: form.province,
      city: form.city,
      district: form.district,
      room_count: form.room_count,
      quotation_date: form.quotation_date,
      valid_until: form.valid_until,
      notes: form.notes,
      total_amount: form.final_amount,  // 使用可编辑的实际总价
      items: form.items.map(item => ({
        product_id: item.product_id,
        product_code: item.product_code,
        product_name: item.product_name,
        brand: item.brand,
        quantity: item.quantity,
        cost_price: item.cost_price,
        sale_price: item.sale_price,
        unit_price: item.unit_price
      }))
    }

    if (form._revise_from) {
      // 修改报价单（生成新版本）
      await reviseQuotation(form._revise_from, submitData)
      ElMessage.success('报价单已修改，已生成新版本')
    } else if (form.quotation_id) {
      // 更新草稿
      await updateQuotation(form.quotation_id, submitData)
      ElMessage.success('报价单更新成功')
    } else {
      // 创建新报价单
      await createQuotation(submitData)
      ElMessage.success('报价单创建成功')
    }

    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('Submit failed:', error)
    ElMessage.error('操作失败')
  } finally {
    submitLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  form.quotation_id = null
  form._revise_from = null
  form.customer_id = leadInfo.customerId || null
  form.customerName = leadInfo.customerName || ''
  form.lead_id = leadInfo.leadId || null
  form.hotel_name = leadInfo.hotelName || ''
  form.province = leadInfo.province || ''
  form.city = leadInfo.city || ''
  form.district = leadInfo.district || ''
  form.room_count = leadInfo.roomCount || null
  form.quotation_date = dayjs().format('YYYY-MM-DD')
  form.valid_until = dayjs().add(30, 'day').format('YYYY-MM-DD')
  form.notes = ''
  form.items = []
  form.final_amount = 0
}

// 格式化日期
const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
}

// 格式化金额
const formatAmount = (amount) => {
  const num = parseFloat(amount) || 0
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 检查路由参数
const checkRouteParams = () => {
  const query = route.query
  if (query.action === 'create' && query.customerId) {
    Object.assign(leadInfo, {
      leadId: query.leadId ? parseInt(query.leadId) : null,
      customerId: query.customerId ? parseInt(query.customerId) : null,
      customerName: query.customerName || '',
      hotelName: query.hotelName || '',
      province: query.province || '',
      city: query.city || '',
      district: query.district || '',
      roomCount: query.roomCount ? parseInt(query.roomCount) : null
    })

    dialogTitle.value = '新建报价单'
    resetForm()
    dialogVisible.value = true
  }
}

// 组件挂载
onMounted(async () => {
  await Promise.all([
    fetchCustomers(),
    fetchCategories(),
    fetchProducts()
  ])
  fetchData()
  checkRouteParams()
})
</script>

<style scoped>
.quotations-page {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
}

.header-tip {
  font-size: 12px;
  color: #909399;
}

.lead-link {
  color: #409eff;
  cursor: pointer;
}

.lead-link:hover {
  text-decoration: underline;
}

.search-form {
  margin-bottom: 20px;
}

.table-actions {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.price-actual {
  color: #e74c3c;
  font-weight: 500;
}

/* 对话框样式 */
.info-card,
.products-card,
.items-card,
.notes-card {
  margin-bottom: 15px;
}

.info-card :deep(.el-card__header),
.products-card :deep(.el-card__header),
.items-card :deep(.el-card__header),
.notes-card :deep(.el-card__header) {
  padding: 10px 15px;
  background-color: #f5f7fa;
}

.info-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.products-header,
.items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.items-count {
  font-size: 12px;
  color: #909399;
}

.product-search {
  padding: 0;
}

.product-list {
  margin-top: 15px;
}

.summary-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #fafafa;
  border-radius: 4px;
}

.discount-amount {
  color: #67c23a;
}

.total-amount {
  font-size: 18px;
  font-weight: bold;
  color: #e74c3c;
}

/* 线索信息栏 */
.lead-info-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 12px 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 15px;
  align-items: center;
}

.lead-info-bar .info-item {
  font-size: 13px;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 4px;
}

.lead-info-bar .info-item label {
  color: #909399;
}

.lead-info-bar .info-item strong {
  color: #303133;
  font-size: 15px;
}

/* 汇总行 */
.summary-row {
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
  align-items: center;
}

.summary-item {
  font-size: 13px;
  color: #606266;
}

.summary-item strong {
  color: #303133;
}

.summary-total {
  margin-left: auto;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
