<template>
  <div class="quotation-detail" v-if="quotation">
    <!-- 基本信息 -->
    <el-descriptions title="报价单信息" :column="3" border>
      <el-descriptions-item label="报价单号">{{ quotation.quotation_no }}</el-descriptions-item>
      <el-descriptions-item label="版本">V{{ quotation.version || 1 }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag v-if="quotation.status === 'draft'" type="info">草稿</el-tag>
        <el-tag v-else-if="quotation.status === 'sent'" type="primary">已发送</el-tag>
        <el-tag v-else-if="quotation.status === 'accepted'" type="success">已接受</el-tag>
        <el-tag v-else-if="quotation.status === 'voided'" type="danger">已作废</el-tag>
        <el-tag v-else>{{ quotation.status }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="报价日期">{{ quotation.quotation_date }}</el-descriptions-item>
      <el-descriptions-item label="有效期至">{{ quotation.valid_until }}</el-descriptions-item>
      <el-descriptions-item label="负责人">{{ quotation.owner?.name || quotation.owner?.username || '-' }}</el-descriptions-item>
    </el-descriptions>

    <!-- 客户信息 -->
    <el-descriptions title="客户信息" :column="2" border style="margin-top: 20px">
      <el-descriptions-item label="客户名称">{{ quotation.customer?.customerName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="酒店名称">{{ quotation.hotel_name || '-' }}</el-descriptions-item>
      <el-descriptions-item label="所在地区">
        {{ [quotation.province, quotation.city, quotation.district].filter(Boolean).join('/') || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="房间数量">{{ quotation.room_count || '-' }}</el-descriptions-item>
    </el-descriptions>

    <!-- 产品明细 -->
    <div class="items-section">
      <h4>产品明细</h4>
      <el-table :data="quotation.items || []" border size="small">
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="product_code" label="产品编码" width="130" />
        <el-table-column prop="product_name" label="产品名称" min-width="150" />
        <el-table-column prop="specification" label="规格" width="120" />
        <el-table-column prop="quantity" label="数量" width="80" align="center" />
        <el-table-column prop="sale_price" label="销售价" width="100" align="right">
          <template #default="{ row }">
            ¥{{ formatAmount(row.sale_price) }}
          </template>
        </el-table-column>
        <el-table-column prop="unit_price" label="实际单价" width="100" align="right">
          <template #default="{ row }">
            ¥{{ formatAmount(row.unit_price) }}
          </template>
        </el-table-column>
        <el-table-column prop="sale_subtotal" label="名义小计" width="110" align="right">
          <template #default="{ row }">
            ¥{{ formatAmount(row.sale_subtotal) }}
          </template>
        </el-table-column>
        <el-table-column prop="subtotal" label="实际小计" width="110" align="right">
          <template #default="{ row }">
            <span class="price-actual">¥{{ formatAmount(row.subtotal) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 汇总信息 -->
    <div class="summary-section">
      <el-descriptions :column="5" border>
        <el-descriptions-item label="产品总数">
          {{ quotation.total_quantity || 0 }} 件
        </el-descriptions-item>
        <el-descriptions-item label="成本总计">
          ¥{{ formatAmount(quotation.total_cost) }}
        </el-descriptions-item>
        <el-descriptions-item label="名义总价">
          ¥{{ formatAmount(quotation.total_sale_price) }}
        </el-descriptions-item>
        <el-descriptions-item label="优惠金额">
          <span class="discount-amount">-¥{{ formatAmount(quotation.discount_amount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="实际总价">
          <span class="total-amount">¥{{ formatAmount(quotation.total_amount) }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 备注 -->
    <div v-if="quotation.notes" class="notes-section">
      <h4>备注</h4>
      <p>{{ quotation.notes }}</p>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button type="primary" @click="$emit('export-pdf', quotation)">
        导出PDF
      </el-button>
      <el-button
        v-if="quotation.status !== 'voided'"
        type="danger"
        @click="handleVoid"
      >
        作废报价单
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox } from 'element-plus'

const props = defineProps({
  quotation: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['export-pdf', 'void'])

const handleVoid = async () => {
  try {
    await ElMessageBox.confirm('确定要作废此报价单吗？作废后不可恢复。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    emit('void', props.quotation)
  } catch {
    // 用户取消
  }
}

const formatAmount = (amount) => {
  const num = parseFloat(amount) || 0
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<style scoped>
.quotation-detail {
  padding: 0;
}

.items-section {
  margin-top: 20px;
}

.items-section h4 {
  margin-bottom: 10px;
  font-size: 14px;
  color: #303133;
}

.summary-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #fafafa;
  border-radius: 4px;
}

.notes-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.notes-section h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #303133;
}

.notes-section p {
  margin: 0;
  color: #606266;
}

.price-actual {
  color: #e74c3c;
  font-weight: 500;
}

.discount-amount {
  color: #67c23a;
}

.total-amount {
  font-size: 18px;
  font-weight: bold;
  color: #e74c3c;
}

.action-buttons {
  margin-top: 20px;
  text-align: right;
}
</style>
