<template>
  <div class="product-detail-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>产品详情</span>
          <div>
            <el-button @click="handleBack">返回</el-button>
            <el-button type="primary" @click="handleEdit">编辑</el-button>
          </div>
        </div>
      </template>
      
      <el-descriptions :column="2" border v-if="product.product_id">
        <el-descriptions-item label="产品编码">
          {{ product.product_code }}
        </el-descriptions-item>
        
        <el-descriptions-item label="产品名称">
          {{ product.product_name }}
        </el-descriptions-item>
        
        <el-descriptions-item label="品牌">
          {{ product.brand || '-' }}
        </el-descriptions-item>
        
        <el-descriptions-item label="产品分类">
          {{ product.category?.category_name || '-' }}
        </el-descriptions-item>
        
        <el-descriptions-item label="供应商">
          {{ product.supplier || '-' }}
        </el-descriptions-item>
        
        <el-descriptions-item label="单位">
          {{ product.unit }}
        </el-descriptions-item>
        
        <el-descriptions-item label="成本价">
          ¥{{ formatAmount(product.cost_price) }}
        </el-descriptions-item>
        
        <el-descriptions-item label="销售价">
          ¥{{ formatAmount(product.sale_price) }}
        </el-descriptions-item>
        
        <el-descriptions-item label="状态">
          <el-tag v-if="product.status === 'active'" type="success">在售</el-tag>
          <el-tag v-else-if="product.status === 'inactive'" type="danger">停售</el-tag>
          <el-tag v-else type="info">草稿</el-tag>
        </el-descriptions-item>
        
        <el-descriptions-item label="创建时间">
          {{ formatDate(product.created_at) }}
        </el-descriptions-item>
        
        <el-descriptions-item label="更新时间">
          {{ formatDate(product.updated_at) }}
        </el-descriptions-item>
        
        <el-descriptions-item label="产品描述" :span="2">
          <div style="white-space: pre-wrap;">{{ product.description || '-' }}</div>
        </el-descriptions-item>
      </el-descriptions>
      
      <el-empty v-else description="产品信息加载中..." />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getProductDetail } from '@/api/products'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const product = ref({})

// 获取产品详情
const fetchProductDetail = async () => {
  try {
    const id = route.params.id
    if (!id) {
      ElMessage.error('产品ID不存在')
      handleBack()
      return
    }
    
    const res = await getProductDetail(id)
    product.value = res.data || {}
  } catch (error) {
    console.error('Failed to fetch product detail:', error)
    ElMessage.error('获取产品详情失败')
  }
}

// 返回列表
const handleBack = () => {
  router.push('/products')
}

// 编辑产品
const handleEdit = () => {
  ElMessage.info('编辑功能开发中')
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
  fetchProductDetail()
})
</script>

<style scoped>
.product-detail-page {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
