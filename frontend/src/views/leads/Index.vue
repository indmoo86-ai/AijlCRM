<template>
  <div class="leads-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>线索管理</span>
          <el-button type="primary" :icon="Plus" @click="handleCreate">
            新建线索
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
            style="width: 150px"
          />
        </el-form-item>

        <el-form-item label="意向程度">
          <el-select
            v-model="searchForm.intentionLevel"
            placeholder="请选择"
            clearable
            style="width: 100px"
          >
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>

        <el-form-item label="需求分类">
          <el-select
            v-model="searchForm.demandCategory"
            placeholder="请选择"
            clearable
            style="width: 120px"
          >
            <el-option label="无人酒店" value="unmanned_hotel" />
            <el-option label="自助入住" value="self_checkin" />
            <el-option label="智能客控" value="smart_room_control" />
            <el-option label="送货机器人" value="delivery_robot" />
            <el-option label="酒管系统" value="pms" />
            <el-option label="酒店门锁" value="hotel_lock" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="客户经理">
          <el-select
            v-model="searchForm.salesOwnerId"
            placeholder="请选择"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="地区">
          <el-cascader
            v-model="searchForm.regionCode"
            :options="chinaRegionOptions"
            :props="{ expandTrigger: 'hover', checkStrictly: true }"
            placeholder="请选择"
            style="width: 200px"
            filterable
            clearable
            @change="handleSearchRegionChange"
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
        <el-table-column prop="leadNo" label="线索编号" width="150" />
        <el-table-column prop="customerName" label="客户名称" width="150" />
        <el-table-column prop="hotelName" label="酒店名称" width="150" />
        <el-table-column label="地区" width="160">
          <template #default="{ row }">
            {{ formatRegion(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="roomCount" label="房间数" width="70" />
        <el-table-column prop="phone" label="联系电话" width="120" />

        <el-table-column prop="intentionLevel" label="意向" width="70">
          <template #default="{ row }">
            <el-tag v-if="row.intentionLevel === 'high'" type="danger" size="small">高</el-tag>
            <el-tag v-else-if="row.intentionLevel === 'medium'" type="warning" size="small">中</el-tag>
            <el-tag v-else type="info" size="small">低</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="demandCategories" label="需求分类" width="180">
          <template #default="{ row }">
            <template v-if="row.demandCategories">
              <el-tag
                v-for="cat in parseDemandCategories(row.demandCategories)"
                :key="cat"
                size="small"
                style="margin-right: 4px; margin-bottom: 2px;"
              >
                {{ getDemandCategoryLabel(cat) }}
              </el-tag>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column label="客户经理" width="90">
          <template #default="{ row }">
            {{ row.salesOwner?.name || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="channelSource" label="来源" width="90">
          <template #default="{ row }">
            {{ getChannelSourceLabel(row.channelSource) }}
          </template>
        </el-table-column>

        <el-table-column prop="created_at" label="创建时间" width="150">
          <template #default="{ row }">
            {{ formatDate(row.created_at || row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" size="small" @click="handleView(row)">
                查看
              </el-button>
              <el-button link type="primary" size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button link type="success" size="small" @click="handleConvert(row)">
                转客户
              </el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)">
                删除
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

    <!-- 新建/编辑线索对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="750px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
      >
        <!-- 第一行：客户名称、联系电话、微信 -->
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="客户名称" prop="customerName">
              <el-input v-model="form.customerName" placeholder="请输入客户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="微信" prop="wechat">
              <el-input v-model="form.wechat" placeholder="请输入微信号" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第二行：酒店名称、房间数量 -->
        <el-row :gutter="16">
          <el-col :span="16">
            <el-form-item label="酒店名称" prop="hotelName">
              <el-input v-model="form.hotelName" placeholder="请输入酒店名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="房间数量" prop="roomCount">
              <el-input-number
                v-model="form.roomCount"
                :min="1"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第三行：所在地区 -->
        <el-form-item label="所在地区" prop="province" required>
          <el-row :gutter="10" style="width: 100%">
            <el-col :span="6">
              <el-select
                v-model="form.regionType"
                placeholder="地区类型"
                style="width: 100%"
                @change="handleRegionTypeChange"
              >
                <el-option label="中国大陆" value="china" />
                <el-option label="海外" value="overseas" />
              </el-select>
            </el-col>
            <el-col :span="18">
              <!-- 中国大陆：省市区三级联动 -->
              <el-cascader
                v-if="form.regionType === 'china'"
                v-model="form.regionCode"
                :options="chinaRegionOptions"
                :props="{ expandTrigger: 'hover' }"
                placeholder="请选择省/市/区"
                style="width: 100%"
                filterable
                clearable
                @change="handleChinaRegionChange"
              />
              <!-- 海外：大洲、国家二级联动 -->
              <el-cascader
                v-else
                v-model="form.overseasCode"
                :options="overseasOptions"
                :props="{ expandTrigger: 'hover' }"
                placeholder="请选择大洲/国家"
                style="width: 100%"
                filterable
                clearable
                @change="handleOverseasRegionChange"
              />
            </el-col>
          </el-row>
        </el-form-item>

        <!-- 第四行：来源渠道、意向程度 -->
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="来源渠道" prop="channelSource">
              <el-select v-model="form.channelSource" placeholder="请选择" style="width: 100%">
                <el-option label="官网咨询" value="website" />
                <el-option label="微信公众号" value="wechat" />
                <el-option label="电话咨询" value="phone" />
                <el-option label="展会" value="exhibition" />
                <el-option label="客户转介绍" value="referral" />
                <el-option label="抖音" value="douyin" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="意向程度" prop="intentionLevel">
              <el-select v-model="form.intentionLevel" placeholder="请选择" style="width: 100%">
                <el-option label="高" value="high" />
                <el-option label="中" value="medium" />
                <el-option label="低" value="low" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第五行：需求分类、客户经理 -->
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="需求分类" prop="demandCategories">
              <el-select
                v-model="form.demandCategories"
                multiple
                placeholder="请选择（可多选）"
                style="width: 100%"
              >
                <el-option label="无人酒店" value="unmanned_hotel" />
                <el-option label="自助入住" value="self_checkin" />
                <el-option label="智能客控" value="smart_room_control" />
                <el-option label="送货机器人" value="delivery_robot" />
                <el-option label="酒管系统" value="pms" />
                <el-option label="酒店门锁" value="hotel_lock" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户经理" prop="salesOwnerId">
              <el-select
                v-model="form.salesOwnerId"
                placeholder="请选择客户经理"
                style="width: 100%"
                filterable
              >
                <el-option
                  v-for="user in userList"
                  :key="user.id"
                  :label="user.name"
                  :value="user.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第六行：需求描述 -->
        <el-form-item label="需求描述" prop="requirement">
          <el-input
            v-model="form.requirement"
            type="textarea"
            :rows="3"
            placeholder="请输入需求描述"
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { getLeadList, createLead, updateLead, convertToCustomer, deleteLead } from '@/api/leads'
import { getUserList } from '@/api/users'
import dayjs from 'dayjs'
import { regionData, codeToText } from 'element-china-area-data'
import { overseasData, getContinentLabel, getCountryLabel } from '@/utils/overseas-data'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新建线索')
const formRef = ref(null)
const tableData = ref([])
const userList = ref([])

// 中国省市区数据（element-china-area-data）
const chinaRegionOptions = regionData

// 海外地区数据
const overseasOptions = overseasData

const searchForm = reactive({
  customerName: '',
  intentionLevel: '',
  demandCategory: '',
  salesOwnerId: '',
  regionCode: [],
  province: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  id: null,
  customerName: '',
  hotelName: '',
  phone: '',
  wechat: '',
  roomCount: null,
  regionType: 'china',
  regionCode: [],
  overseasCode: [],
  province: '',
  city: '',
  district: '',
  channelSource: '',
  intentionLevel: '',
  demandCategories: [],
  salesOwnerId: null,
  requirement: ''
})

// 地区验证器
const validateRegion = (rule, value, callback) => {
  if (!form.province) {
    callback(new Error('请选择所在地区'))
  } else {
    callback()
  }
}

const formRules = {
  customerName: [
    { required: true, message: '请输入客户名称', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  province: [
    { required: true, validator: validateRegion, trigger: 'change' }
  ],
  channelSource: [
    { required: true, message: '请选择来源渠道', trigger: 'change' }
  ],
  intentionLevel: [
    { required: true, message: '请选择意向程度', trigger: 'change' }
  ]
}

// 需求分类映射
const demandCategoryMap = {
  unmanned_hotel: '无人酒店',
  self_checkin: '自助入住',
  smart_room_control: '智能客控',
  delivery_robot: '送货机器人',
  pms: '酒管系统',
  hotel_lock: '酒店门锁',
  other: '其他'
}

// 渠道来源映射
const channelSourceMap = {
  website: '官网咨询',
  wechat: '微信公众号',
  phone: '电话咨询',
  exhibition: '展会',
  referral: '客户转介绍',
  douyin: '抖音',
  other: '其他'
}

// 获取需求分类标签
const getDemandCategoryLabel = (value) => {
  return demandCategoryMap[value] || value
}

// 获取渠道来源标签
const getChannelSourceLabel = (value) => {
  return channelSourceMap[value] || value
}

// 解析需求分类
const parseDemandCategories = (categories) => {
  if (!categories) return []
  if (Array.isArray(categories)) return categories
  try {
    return JSON.parse(categories)
  } catch {
    return categories.split(',').filter(Boolean)
  }
}

// 格式化地区显示
const formatRegion = (row) => {
  if (row.province === '海外' && row.city && row.district) {
    return `海外/${getContinentLabel(row.city)}/${getCountryLabel(row.city, row.district)}`
  }
  return [row.province, row.city, row.district].filter(Boolean).join('/') || '-'
}

// 地区类型变化
const handleRegionTypeChange = () => {
  form.regionCode = []
  form.overseasCode = []
  form.province = ''
  form.city = ''
  form.district = ''
}

// 中国地区选择变化
const handleChinaRegionChange = (value) => {
  if (value && value.length > 0) {
    form.province = codeToText[value[0]] || ''
    form.city = value[1] ? codeToText[value[1]] : ''
    form.district = value[2] ? codeToText[value[2]] : ''
  } else {
    form.province = ''
    form.city = ''
    form.district = ''
  }
}

// 海外地区选择变化
const handleOverseasRegionChange = (value) => {
  if (value && value.length > 0) {
    form.province = '海外'
    form.city = value[0] || '' // 大洲代码
    form.district = value[1] || '' // 国家代码
  } else {
    form.province = ''
    form.city = ''
    form.district = ''
  }
}

// 搜索地区选择变化
const handleSearchRegionChange = (value) => {
  if (value && value.length > 0) {
    searchForm.province = codeToText[value[0]] || ''
  } else {
    searchForm.province = ''
  }
}

// 获取用户列表
const fetchUserList = async () => {
  try {
    const res = await getUserList({ pageSize: 100 })
    userList.value = res.data.list || res.data.rows || []
  } catch (error) {
    console.error('Failed to fetch users:', error)
  }
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.customerName || undefined,
      intentionLevel: searchForm.intentionLevel || undefined,
      demandCategory: searchForm.demandCategory || undefined,
      salesOwnerId: searchForm.salesOwnerId || undefined,
      province: searchForm.province || undefined
    }
    const res = await getLeadList(params)
    tableData.value = res.data.list || res.data.rows || []
    pagination.total = res.data.pagination?.total || res.data.total || 0
  } catch (error) {
    console.error('Failed to fetch leads:', error)
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
  searchForm.intentionLevel = ''
  searchForm.demandCategory = ''
  searchForm.salesOwnerId = ''
  searchForm.regionCode = []
  searchForm.province = ''
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
  dialogTitle.value = '新建线索'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑线索'
  resetForm()

  // 判断是国内还是海外
  const isOverseas = row.province === '海外'

  // 复制数据
  Object.assign(form, {
    id: row.id,
    customerName: row.customerName,
    hotelName: row.hotelName,
    phone: row.phone,
    wechat: row.wechat,
    roomCount: row.roomCount,
    regionType: isOverseas ? 'overseas' : 'china',
    regionCode: [],
    overseasCode: [],
    province: row.province,
    city: row.city,
    district: row.district,
    channelSource: row.channelSource,
    intentionLevel: row.intentionLevel,
    demandCategories: parseDemandCategories(row.demandCategories),
    salesOwnerId: row.salesOwnerId,
    requirement: row.firstDemand || row.requirement
  })

  // 初始化地区选择器
  if (isOverseas) {
    form.overseasCode = [row.city, row.district].filter(Boolean)
  } else if (row.province) {
    // 尝试将省市区名称转为code（通过遍历 codeToText 反向查找）
    try {
      const codes = []
      // 查找省份code
      for (const [code, name] of Object.entries(codeToText)) {
        if (name === row.province && code.length === 2) {
          codes.push(code)
          break
        }
      }
      // 查找城市code
      if (codes.length > 0 && row.city) {
        for (const [code, name] of Object.entries(codeToText)) {
          if (name === row.city && code.startsWith(codes[0]) && code.length === 4) {
            codes.push(code)
            break
          }
        }
      }
      // 查找区县code
      if (codes.length > 1 && row.district) {
        for (const [code, name] of Object.entries(codeToText)) {
          if (name === row.district && code.startsWith(codes[1])) {
            codes.push(code)
            break
          }
        }
      }
      form.regionCode = codes
    } catch (e) {
      console.warn('无法解析地区代码:', e)
    }
  }

  dialogVisible.value = true
}

// 查看
const handleView = (row) => {
  ElMessage.info('查看详情功能开发中')
}

// 转客户
const handleConvert = async (row) => {
  try {
    await ElMessageBox.confirm('确定要将此线索转为客户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await convertToCustomer(row.id, {
      customerType: 'single_hotel',
      customerLevel: 'B'
    })

    ElMessage.success('转客户成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Convert failed:', error)
    }
  }
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除此线索吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteLead(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete failed:', error)
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      // 准备提交数据
      const submitData = {
        customerName: form.customerName,
        hotelName: form.hotelName,
        phone: form.phone,
        wechat: form.wechat,
        roomCount: form.roomCount,
        province: form.province,
        city: form.city,
        district: form.district,
        channelSource: form.channelSource,
        intentionLevel: form.intentionLevel,
        demandCategories: form.demandCategories.length > 0 ? JSON.stringify(form.demandCategories) : null,
        salesOwnerId: form.salesOwnerId,
        firstDemand: form.requirement
      }

      if (form.id) {
        await updateLead(form.id, submitData)
        ElMessage.success('更新成功')
      } else {
        await createLead(submitData)
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
  form.hotelName = ''
  form.phone = ''
  form.wechat = ''
  form.roomCount = null
  form.regionType = 'china'
  form.regionCode = []
  form.overseasCode = []
  form.province = ''
  form.city = ''
  form.district = ''
  form.channelSource = ''
  form.intentionLevel = ''
  form.demandCategories = []
  form.salesOwnerId = null
  form.requirement = ''
}

// 格式化日期
const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
}

// 组件挂载时获取数据
onMounted(() => {
  fetchData()
  fetchUserList()
})
</script>

<style scoped>
.leads-page {
  padding: 0;
}

.search-form {
  margin-bottom: 20px;
}

.table-actions {
  display: flex;
  gap: 5px;
}
</style>
