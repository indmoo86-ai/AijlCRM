<template>
  <div class="customers-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>客户管理</span>
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            新建客户
          </el-button>
        </div>
      </template>
      
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="客户名称">
          <el-input
            v-model="searchForm.customerName"
            placeholder="请输入客户名称"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="客户类型">
          <el-select
            v-model="searchForm.customerType"
            placeholder="请选择"
            clearable
            @clear="handleSearch"
          >
            <el-option label="潜在客户" :value="1" />
            <el-option label="正式客户" :value="2" />
            <el-option label="VIP客户" :value="3" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="行业">
          <el-input
            v-model="searchForm.industry"
            placeholder="请输入行业"
            clearable
            @clear="handleSearch"
          />
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
        <el-table-column prop="customerNo" label="客户编号" width="140" />
        <el-table-column prop="customerName" label="客户名称" min-width="160" show-overflow-tooltip />

        <el-table-column prop="customerType" label="客户类型" width="85">
          <template #default="{ row }">
            <el-tag v-if="row.customerType === 3" type="danger">VIP</el-tag>
            <el-tag v-else-if="row.customerType === 2" type="success">正式</el-tag>
            <el-tag v-else type="info">潜在</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="industry" label="所属行业" min-width="100" />
        <el-table-column prop="city" label="所在城市" min-width="100" />
        <el-table-column prop="roomCount" label="房间数" width="80" />

        <el-table-column prop="totalAmount" label="累计金额" width="110" align="right">
          <template #default="{ row }">
            ¥{{ formatAmount(row.totalAmount) }}
          </template>
        </el-table-column>

        <el-table-column prop="contractCount" label="合同数" width="75" />

        <el-table-column prop="lastContactTime" label="最后联系" width="150">
          <template #default="{ row }">
            {{ formatDate(row.lastContactTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="创建时间" width="150">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" size="small" @click="handleView(row)">
                查看
              </el-button>
              <el-button link type="primary" size="small" @click="handleEdit(row)">
                编辑
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
    
    <!-- 新建/编辑客户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="90%"
      style="max-width: 1200px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="110px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户名称" prop="customerName">
              <el-input v-model="form.customerName" placeholder="请输入客户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户类型" prop="customerType">
              <el-select v-model="form.customerType" placeholder="请选择" style="width: 100%">
                <el-option label="潜在客户" :value="1" />
                <el-option label="正式客户" :value="2" />
                <el-option label="VIP客户" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属行业" prop="industry">
              <el-select v-model="form.industry" placeholder="请选择" style="width: 100%">
                <el-option label="酒店" value="hotel" />
                <el-option label="民宿" value="homestay" />
                <el-option label="公寓" value="apartment" />
                <el-option label="度假村" value="resort" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房间数量" prop="roomCount">
              <el-input-number
                v-model="form.roomCount"
                :min="1"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="省份" prop="province">
              <el-input v-model="form.province" placeholder="请输入省份" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="城市" prop="city">
              <el-input v-model="form.city" placeholder="请输入城市" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="区县" prop="district">
              <el-input v-model="form.district" placeholder="请输入区县" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入详细地址" />
        </el-form-item>
        
        <el-form-item label="客户标签" prop="tags">
          <el-select
            v-model="form.tags"
            multiple
            filterable
            allow-create
            placeholder="请选择或输入标签"
            style="width: 100%"
          >
            <el-option label="重点客户" value="重点客户" />
            <el-option label="价格敏感" value="价格敏感" />
            <el-option label="快速决策" value="快速决策" />
            <el-option label="需要培育" value="需要培育" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 客户详情抽屉 -->
    <el-drawer
      v-model="detailDrawerVisible"
      title="客户详情"
      size="60%"
      :close-on-click-modal="true"
    >
      <template #header>
        <div class="drawer-header">
          <span class="drawer-title">客户详情</span>
          <div class="drawer-actions">
            <el-button type="primary" :icon="Document" @click="handleCreateLeadFromCustomer">
              新增线索
            </el-button>
            <el-button type="success" :icon="ChatLineSquare" @click="handleAddVisit">
              添加回访
            </el-button>
          </div>
        </div>
      </template>
      <div v-loading="detailLoading" class="detail-drawer">
        <template v-if="detailData.customer">
          <!-- 基本信息 -->
          <div class="detail-section">
            <div class="section-title">基本信息</div>
            <el-descriptions :column="3" border size="small">
              <el-descriptions-item label="客户编号">{{ detailData.customer.customerNo || '-' }}</el-descriptions-item>
              <el-descriptions-item label="客户名称">{{ detailData.customer.customerName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="客户类型">
                <el-tag v-if="detailData.customer.customerType === 3" type="danger">VIP</el-tag>
                <el-tag v-else-if="detailData.customer.customerType === 2" type="success">正式</el-tag>
                <el-tag v-else type="info">潜在</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="所属行业">{{ getIndustryLabel(detailData.customer.industry) }}</el-descriptions-item>
              <el-descriptions-item label="房间数量">{{ detailData.customer.roomCount || '-' }} 间</el-descriptions-item>
              <el-descriptions-item label="累计金额">
                <span class="price-highlight">¥{{ formatAmount(detailData.customer.totalAmount) }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="所在地区" :span="2">
                {{ [detailData.customer.province, detailData.customer.city, detailData.customer.district].filter(Boolean).join(' / ') || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="合同数">{{ detailData.customer.contractCount || 0 }} 份</el-descriptions-item>
              <el-descriptions-item label="详细地址" :span="3">{{ detailData.customer.address || '-' }}</el-descriptions-item>
              <el-descriptions-item label="客户标签" :span="3">
                <template v-if="detailData.customer.tags && detailData.customer.tags.length">
                  <el-tag v-for="tag in detailData.customer.tags" :key="tag" size="small" style="margin-right: 5px;">{{ tag }}</el-tag>
                </template>
                <span v-else>-</span>
              </el-descriptions-item>
              <el-descriptions-item label="来源渠道">{{ detailData.customer.channelSource || '-' }}</el-descriptions-item>
              <el-descriptions-item label="创建人">{{ detailData.customer.creator?.name || '-' }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ formatDate(detailData.customer.created_at || detailData.customer.createdAt) }}</el-descriptions-item>
              <el-descriptions-item label="最后联系">{{ formatDate(detailData.customer.lastContactTime) }}</el-descriptions-item>
              <el-descriptions-item label="销售负责人">{{ detailData.customer.salesOwner?.name || '-' }}</el-descriptions-item>
              <el-descriptions-item label="备注" :span="2">{{ detailData.customer.remark || '-' }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 上次沟通 -->
          <div class="detail-section">
            <div class="section-title">上次沟通</div>
            <div v-if="detailData.lastCommunicationTime" class="last-communication">
              <div class="comm-time">
                <el-icon><Clock /></el-icon>
                {{ formatDate(detailData.lastCommunicationTime) }}
                <el-tag v-if="detailData.lastCommunicationType === 'visit'" type="success" size="small" style="margin-left: 8px;">客户回访</el-tag>
                <el-tag v-else-if="detailData.lastCommunicationType === 'lead'" type="primary" size="small" style="margin-left: 8px;">线索跟进</el-tag>
                <span v-if="detailData.lastCommunicationOperator" class="comm-operator">{{ detailData.lastCommunicationOperator }}</span>
              </div>
              <div class="comm-content">{{ detailData.lastCommunicationContent || '无内容' }}</div>
            </div>
            <el-empty v-else description="暂无沟通记录" :image-size="60" />
          </div>

          <!-- 关联报价单 -->
          <div class="detail-section">
            <div class="section-title">关联报价单</div>
            <template v-if="detailData.quotations && detailData.quotations.length">
              <el-table :data="detailData.quotations" size="small" border max-height="200">
                <el-table-column prop="quotation_no" label="报价单号" width="140" />
                <el-table-column prop="hotel_name" label="酒店名称" min-width="120" show-overflow-tooltip />
                <el-table-column prop="total_amount" label="金额" width="100" align="right">
                  <template #default="{ row }">
                    <span class="price-actual">¥{{ formatAmount(row.total_amount) }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="80">
                  <template #default="{ row }">
                    <el-tag v-if="row.status === 'draft'" type="info" size="small">草稿</el-tag>
                    <el-tag v-else-if="row.status === 'sent'" type="primary" size="small">已发送</el-tag>
                    <el-tag v-else-if="row.status === 'accepted'" type="success" size="small">已接受</el-tag>
                    <el-tag v-else-if="row.status === 'voided'" type="danger" size="small">已作废</el-tag>
                    <el-tag v-else size="small">{{ row.status }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="quotation_date" label="报价日期" width="100" />
              </el-table>
            </template>
            <el-empty v-else description="暂无关联报价单" :image-size="60" />
          </div>

          <!-- 关联合同 -->
          <div class="detail-section">
            <div class="section-title">关联合同</div>
            <template v-if="detailData.contracts && detailData.contracts.length">
              <el-table :data="detailData.contracts" size="small" border max-height="200">
                <el-table-column prop="contract_no" label="合同编号" width="140" />
                <el-table-column prop="contract_title" label="合同标题" min-width="140" show-overflow-tooltip />
                <el-table-column prop="contract_amount" label="合同金额" width="110" align="right">
                  <template #default="{ row }">
                    <span class="price-highlight">¥{{ formatAmount(row.contract_amount) }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="80">
                  <template #default="{ row }">
                    <el-tag v-if="row.status === 'draft'" type="info" size="small">草稿</el-tag>
                    <el-tag v-else-if="row.status === 'signed'" type="success" size="small">已签订</el-tag>
                    <el-tag v-else-if="row.status === 'executing'" type="primary" size="small">执行中</el-tag>
                    <el-tag v-else-if="row.status === 'completed'" type="success" size="small">已完成</el-tag>
                    <el-tag v-else-if="row.status === 'voided'" type="danger" size="small">已作废</el-tag>
                    <el-tag v-else size="small">{{ row.status }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="sign_date" label="签订日期" width="100" />
              </el-table>
            </template>
            <el-empty v-else description="暂无关联合同" :image-size="60" />
          </div>
        </template>
        <el-empty v-else-if="!detailLoading" description="无法加载数据" />
      </div>
    </el-drawer>

    <!-- 新增线索弹窗 -->
    <el-dialog
      v-model="leadDialogVisible"
      title="新增线索（老客户复购）"
      width="800px"
      @close="() => { leadFormRef?.resetFields() }"
    >
      <el-form
        ref="leadFormRef"
        :model="leadForm"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="酒店名称" prop="hotelName" :rules="[{ required: true, message: '请输入酒店名称' }]">
              <el-input v-model="leadForm.hotelName" placeholder="请输入酒店名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房间数" prop="roomCount">
              <el-input-number v-model="leadForm.roomCount" :min="1" style="width: 100%" placeholder="请输入房间数" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系人" prop="contactPerson" :rules="[{ required: true, message: '请输入联系人' }]">
              <el-input v-model="leadForm.contactPerson" placeholder="请输入联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contactPhone" :rules="[{ required: true, message: '请输入联系电话' }]">
              <el-input v-model="leadForm.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="微信号" prop="wechat">
              <el-input v-model="leadForm.wechat" placeholder="请输入微信号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="来源渠道">
              <el-tag type="warning" size="large">{{ leadForm.channelSource }}</el-tag>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="省份" prop="province">
              <el-input v-model="leadForm.province" placeholder="请输入省份" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="城市" prop="city">
              <el-input v-model="leadForm.city" placeholder="请输入城市" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="区县" prop="district">
              <el-input v-model="leadForm.district" placeholder="请输入区县" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="leadForm.address" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="需求说明" prop="description">
          <el-input
            v-model="leadForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入需求说明，例如：复购原因、意向产品、预算等"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="leadDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="leadSubmitLoading" @click="handleSubmitLead">
          创建线索
        </el-button>
      </template>
    </el-dialog>

    <!-- 回访记录弹窗 -->
    <el-dialog
      v-model="visitDialogVisible"
      title="添加回访记录"
      width="700px"
    >
      <el-form
        ref="visitFormRef"
        :model="visitForm"
        label-width="100px"
      >
        <el-form-item label="回访方式" prop="followType">
          <el-radio-group v-model="visitForm.followType">
            <el-radio value="visit">上门拜访</el-radio>
            <el-radio value="phone">电话回访</el-radio>
            <el-radio value="wechat">微信沟通</el-radio>
            <el-radio value="other">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="回访内容" prop="content" :rules="[{ required: true, message: '请输入回访内容' }]">
          <el-input
            v-model="visitForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入回访内容，记录沟通要点..."
          />
        </el-form-item>
        <el-form-item label="下次计划" prop="nextPlan">
          <el-input
            v-model="visitForm.nextPlan"
            type="textarea"
            :rows="2"
            placeholder="下一步跟进计划（可选）"
          />
        </el-form-item>
        <el-form-item label="下次跟进" prop="nextFollowDate">
          <el-date-picker
            v-model="visitForm.nextFollowDate"
            type="date"
            placeholder="选择下次跟进日期（可选）"
            value-format="YYYY-MM-DD"
            style="width: 200px"
          />
        </el-form-item>
      </el-form>

      <!-- 历史回访记录 -->
      <div v-if="visitList.length > 0" class="visit-history">
        <div class="section-title" style="margin-top: 20px;">历史回访记录</div>
        <el-timeline>
          <el-timeline-item
            v-for="visit in visitList.slice(0, 5)"
            :key="visit.id"
            :timestamp="formatDate(visit.created_at)"
            placement="top"
          >
            <div class="visit-item">
              <el-tag size="small" style="margin-right: 8px;">
                {{ visit.followType === 'visit' ? '上门拜访' : visit.followType === 'phone' ? '电话回访' : visit.followType === 'wechat' ? '微信沟通' : '其他' }}
              </el-tag>
              <span class="visit-operator">{{ visit.operator?.name || '未知' }}</span>
            </div>
            <div class="visit-content">{{ visit.content }}</div>
          </el-timeline-item>
        </el-timeline>
      </div>

      <template #footer>
        <el-button @click="visitDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="visitSubmitLoading" @click="handleSubmitVisit">
          保存记录
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Clock, Document, ChatLineSquare } from '@element-plus/icons-vue'
import { getCustomerList, createCustomer, updateCustomer, getCustomerDetail, addCustomerVisit, getCustomerVisits } from '@/api/customers'
import { createLead } from '@/api/leads'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

const router = useRouter()
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新建客户')
const formRef = ref(null)
const tableData = ref([])

// 新增线索弹窗
const leadDialogVisible = ref(false)
const leadSubmitLoading = ref(false)
const leadFormRef = ref(null)
const leadForm = reactive({
  customerName: '',
  hotelName: '',
  contactPerson: '',
  contactPhone: '',
  wechat: '',
  province: '',
  city: '',
  district: '',
  address: '',
  roomCount: null,
  channelSource: '老客户复购',
  customerId: null,
  description: ''
})

// 回访弹窗
const visitDialogVisible = ref(false)
const visitSubmitLoading = ref(false)
const visitFormRef = ref(null)
const visitForm = reactive({
  content: '',
  followType: 'visit',
  nextPlan: '',
  nextFollowDate: null
})

// 回访记录列表
const visitList = ref([])

// 详情抽屉相关
const detailDrawerVisible = ref(false)
const detailLoading = ref(false)
const detailData = reactive({
  customer: null,
  leads: [],
  quotations: [],
  contracts: [],
  lastCommunicationTime: null,
  lastCommunicationContent: null,
  lastCommunicationOperator: null,
  lastCommunicationType: null
})

const searchForm = reactive({
  customerName: '',
  customerType: null,
  industry: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  id: null,
  customerName: '',
  customerType: 1,
  industry: '',
  province: '',
  city: '',
  district: '',
  address: '',
  roomCount: null,
  tags: [],
  remark: ''
})

const formRules = {
  customerName: [
    { required: true, message: '请输入客户名称', trigger: 'blur' }
  ],
  customerType: [
    { required: true, message: '请选择客户类型', trigger: 'change' }
  ],
  industry: [
    { required: true, message: '请选择所属行业', trigger: 'change' }
  ]
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
    const res = await getCustomerList(params)
    tableData.value = res.data.list || res.data.rows || []
    pagination.total = res.data.pagination?.total || res.data.total || 0
  } catch (error) {
    console.error('Failed to fetch customers:', error)
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
  searchForm.customerName = ''
  searchForm.customerType = null
  searchForm.industry = ''
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

// 新建
const handleCreate = () => {
  dialogTitle.value = '新建客户'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑客户'
  Object.assign(form, {
    id: row.id,
    customerName: row.customerName,
    customerType: row.customerType,
    industry: row.industry,
    province: row.province,
    city: row.city,
    district: row.district,
    address: row.address,
    roomCount: row.roomCount,
    tags: row.tags || [],
    remark: row.remark
  })
  dialogVisible.value = true
}

// 查看详情
const handleView = async (row) => {
  detailLoading.value = true
  detailDrawerVisible.value = true

  // 重置详情数据
  detailData.customer = null
  detailData.leads = []
  detailData.quotations = []
  detailData.contracts = []
  detailData.lastCommunicationTime = null
  detailData.lastCommunicationContent = null
  detailData.lastCommunicationOperator = null
  detailData.lastCommunicationType = null

  try {
    const customerId = row.id || row.customer_id
    const res = await getCustomerDetail(customerId)
    detailData.customer = res.data.customer
    detailData.leads = res.data.leads || []
    detailData.quotations = res.data.quotations || []
    detailData.contracts = res.data.contracts || []
    detailData.lastCommunicationTime = res.data.lastCommunicationTime
    detailData.lastCommunicationContent = res.data.lastCommunicationContent
    detailData.lastCommunicationOperator = res.data.lastCommunicationOperator
    detailData.lastCommunicationType = res.data.lastCommunicationType
  } catch (error) {
    console.error('Failed to fetch customer detail:', error)
    ElMessage.error('获取客户详情失败')
  } finally {
    detailLoading.value = false
  }
}

// 获取行业标签
const getIndustryLabel = (industry) => {
  const map = {
    hotel: '酒店',
    homestay: '民宿',
    apartment: '公寓',
    resort: '度假村',
    other: '其他'
  }
  return map[industry] || industry || '-'
}

// 打开新增线索弹窗（从客户创建）
const handleCreateLeadFromCustomer = () => {
  if (!detailData.customer) return

  const customer = detailData.customer
  // 获取主要联系人信息
  const primaryContact = customer.contacts?.find(c => c.is_primary === 1) || customer.contacts?.[0]

  // 预填客户信息
  leadForm.customerName = customer.customerName || ''
  leadForm.hotelName = customer.customerName || '' // 酒店名称默认与客户名称相同
  leadForm.contactPerson = primaryContact?.contact_name || ''
  leadForm.contactPhone = primaryContact?.mobile || customer.phone || ''
  leadForm.wechat = primaryContact?.wechat || customer.wechat || ''
  leadForm.province = customer.province || ''
  leadForm.city = customer.city || ''
  leadForm.district = customer.district || ''
  leadForm.address = customer.address || ''
  leadForm.roomCount = customer.roomCount || null
  leadForm.channelSource = '老客户复购'
  leadForm.customerId = customer.id
  leadForm.description = ''

  leadDialogVisible.value = true
}

// 提交新增线索
const handleSubmitLead = async () => {
  if (!leadFormRef.value) return

  await leadFormRef.value.validate(async (valid) => {
    if (!valid) return

    leadSubmitLoading.value = true
    try {
      const submitData = {
        customerName: leadForm.customerName,
        hotelName: leadForm.hotelName || leadForm.customerName,
        contactPerson: leadForm.contactPerson,
        phone: leadForm.contactPhone, // 后端用phone字段
        wechat: leadForm.wechat,
        province: leadForm.province,
        city: leadForm.city,
        district: leadForm.district,
        address: leadForm.address,
        roomCount: leadForm.roomCount,
        channelSource: leadForm.channelSource,
        customerId: leadForm.customerId,
        firstDemand: leadForm.description // 后端用firstDemand字段
      }

      await createLead(submitData)
      ElMessage.success('线索创建成功')
      leadDialogVisible.value = false

      // 刷新详情数据
      if (detailData.customer?.id) {
        handleView({ id: detailData.customer.id })
      }
    } catch (error) {
      console.error('Create lead failed:', error)
      ElMessage.error('线索创建失败')
    } finally {
      leadSubmitLoading.value = false
    }
  })
}

// 打开回访记录弹窗
const handleAddVisit = async () => {
  if (!detailData.customer) return

  // 重置表单
  visitForm.content = ''
  visitForm.followType = 'visit'
  visitForm.nextPlan = ''
  visitForm.nextFollowDate = null

  // 加载历史回访记录
  try {
    const res = await getCustomerVisits(detailData.customer.id)
    visitList.value = res.data.list || []
  } catch (error) {
    console.error('Failed to load visit records:', error)
    visitList.value = []
  }

  visitDialogVisible.value = true
}

// 提交回访记录
const handleSubmitVisit = async () => {
  if (!visitForm.content) {
    ElMessage.warning('请填写回访内容')
    return
  }

  visitSubmitLoading.value = true
  try {
    await addCustomerVisit(detailData.customer.id, {
      content: visitForm.content,
      followType: visitForm.followType,
      nextPlan: visitForm.nextPlan,
      nextFollowDate: visitForm.nextFollowDate
    })

    ElMessage.success('回访记录添加成功')
    visitDialogVisible.value = false

    // 刷新详情数据（更新最后沟通时间）
    if (detailData.customer?.id) {
      handleView({ id: detailData.customer.id })
    }
    // 刷新列表
    fetchData()
  } catch (error) {
    console.error('Add visit failed:', error)
    ElMessage.error('添加回访记录失败')
  } finally {
    visitSubmitLoading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitLoading.value = true
    try {
      const submitData = { ...form }
      
      if (form.id) {
        await updateCustomer(form.id, submitData)
        ElMessage.success('更新成功')
      } else {
        await createCustomer(submitData)
        ElMessage.success('创建成功')
      }
      
      dialogVisible.value = false
      fetchData()
    } catch (error) {
      console.error('Submit failed:', error)
    } finally {
      submitLoading.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.id = null
  form.customerName = ''
  form.customerType = 1
  form.industry = ''
  form.province = ''
  form.city = ''
  form.district = ''
  form.address = ''
  form.roomCount = null
  form.tags = []
  form.remark = ''
}

// 格式化日期
const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
}

// 格式化金额
const formatAmount = (amount) => {
  return amount ? parseFloat(amount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
}

// 组件挂载时获取数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.customers-page {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.table-actions {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

/* 详情抽屉样式 */
.detail-drawer {
  padding: 0 10px;
}

.detail-section {
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

.price-highlight {
  color: #e74c3c;
  font-weight: 500;
}

.price-actual {
  color: #e74c3c;
  font-weight: 500;
}

.last-communication {
  background-color: #f5f7fa;
  padding: 12px 15px;
  border-radius: 4px;
}

.comm-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.comm-operator {
  margin-left: 8px;
  color: #606266;
  font-weight: 500;
}

.comm-content {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}

/* 抽屉头部样式 */
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.drawer-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.drawer-actions {
  display: flex;
  gap: 10px;
}

/* 回访记录样式 */
.visit-history {
  border-top: 1px solid #ebeef5;
  padding-top: 15px;
  margin-top: 15px;
}

.visit-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.visit-operator {
  font-size: 12px;
  color: #909399;
}

.visit-content {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  background-color: #f5f7fa;
  padding: 8px 12px;
  border-radius: 4px;
  margin-top: 5px;
}
</style>
