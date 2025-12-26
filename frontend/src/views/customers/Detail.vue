<template>
  <div class="customer-detail-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>客户详情</span>
          <div>
            <el-button @click="handleBack">返回</el-button>
            <el-button type="primary" @click="handleEdit">编辑</el-button>
          </div>
        </div>
      </template>
      
      <el-descriptions :column="2" border v-if="customer.id">
        <el-descriptions-item label="客户编号">
          {{ customer.customerNo }}
        </el-descriptions-item>
        
        <el-descriptions-item label="客户名称">
          {{ customer.customerName }}
        </el-descriptions-item>
        
        <el-descriptions-item label="客户类型">
          <el-tag v-if="customer.customerType === 3" type="danger">VIP客户</el-tag>
          <el-tag v-else-if="customer.customerType === 2" type="success">正式客户</el-tag>
          <el-tag v-else type="info">潜在客户</el-tag>
        </el-descriptions-item>
        
        <el-descriptions-item label="所属行业">
          {{ customer.industry || '-' }}
        </el-descriptions-item>
        
        <el-descriptions-item label="所在地区" :span="2">
          {{ formatAddress(customer) }}
        </el-descriptions-item>
        
        <el-descriptions-item label="详细地址" :span="2">
          {{ customer.address || '-' }}
        </el-descriptions-item>
        
        <el-descriptions-item label="房间数量">
          {{ customer.roomCount || '-' }}
        </el-descriptions-item>
        
        <el-descriptions-item label="累计金额">
          ¥{{ formatAmount(customer.totalAmount) }}
        </el-descriptions-item>
        
        <el-descriptions-item label="合同数量">
          {{ customer.contractCount || 0 }}
        </el-descriptions-item>
        
        <el-descriptions-item label="转介绍次数">
          {{ customer.referralCount || 0 }}
        </el-descriptions-item>
        
        <el-descriptions-item label="客户标签" :span="2">
          <el-tag
            v-for="tag in customer.tags"
            :key="tag"
            style="margin-right: 5px"
          >
            {{ tag }}
          </el-tag>
          <span v-if="!customer.tags || customer.tags.length === 0">-</span>
        </el-descriptions-item>
        
        <el-descriptions-item label="最后联系时间" :span="2">
          {{ formatDate(customer.lastContactTime) }}
        </el-descriptions-item>
        
        <el-descriptions-item label="创建时间">
          {{ formatDate(customer.createdAt) }}
        </el-descriptions-item>
        
        <el-descriptions-item label="更新时间">
          {{ formatDate(customer.updatedAt) }}
        </el-descriptions-item>
        
        <el-descriptions-item label="备注" :span="2">
          {{ customer.remark || '-' }}
        </el-descriptions-item>
      </el-descriptions>
      
      <el-empty v-else description="客户信息加载中..." />
    </el-card>

    <!-- 附件管理 -->
    <el-card shadow="never" style="margin-top: 20px;">
      <AttachmentManager
        business-type="customer"
        :business-id="route.params.id"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCustomerDetail } from '@/api/customers'
import AttachmentManager from '@/components/AttachmentManager.vue'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const customer = ref({})

// 获取客户详情
const fetchCustomerDetail = async () => {
  try {
    const id = route.params.id
    if (!id) {
      ElMessage.error('客户ID不存在')
      handleBack()
      return
    }
    
    const res = await getCustomerDetail(id)
    customer.value = res.data || {}
  } catch (error) {
    console.error('Failed to fetch customer detail:', error)
    ElMessage.error('获取客户详情失败')
  }
}

// 返回列表
const handleBack = () => {
  router.push('/customers')
}

// 编辑客户
const handleEdit = () => {
  ElMessage.info('编辑功能开发中')
}

// 格式化地址
const formatAddress = (customer) => {
  const parts = [customer.province, customer.city, customer.district].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : '-'
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
  fetchCustomerDetail()
})
</script>

<style scoped>
.customer-detail-page {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
