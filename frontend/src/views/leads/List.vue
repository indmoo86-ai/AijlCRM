<template>
  <div class="leads-container">
    <!-- 筛选区 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="线索状态">
          <el-select v-model="filterForm.status" placeholder="全部" clearable>
            <el-option label="新建" :value="1" />
            <el-option label="跟进中" :value="2" />
            <el-option label="已转化" :value="3" />
            <el-option label="已放弃" :value="4" />
          </el-select>
        </el-form-item>

        <el-form-item label="渠道来源">
          <el-select v-model="filterForm.channel" placeholder="全部" clearable>
            <el-option label="抖音沟通" value="抖音沟通" />
            <el-option label="抖音询单" value="抖音询单" />
            <el-option label="小红书" value="小红书" />
            <el-option label="官网" value="官网" />
            <el-option label="转介绍" value="转介绍" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item label="关键词">
          <el-input
            v-model="filterForm.keyword"
            placeholder="客户姓名/酒店/手机"
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <div class="action-buttons">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新建线索
        </el-button>
        <el-button>
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </el-card>

    <!-- 表格区 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="leadNo" label="线索编号" width="150" />
        <el-table-column prop="customerName" label="客户姓名" width="120" />
        <el-table-column prop="hotelName" label="酒店名称" width="180" />
        <el-table-column label="项目地址" width="200">
          <template #default="{ row }">
            {{ row.province }} {{ row.city }} {{ row.district }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号码" width="120" />
        <el-table-column prop="channelSource" label="渠道来源" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="销售负责人" width="120">
          <template #default="{ row }">
            {{ row.salesOwner?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button
              v-if="row.status !== 3"
              link
              type="primary"
              size="small"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button link type="primary" size="small" @click="handleFollowUp(row)">
              跟进
            </el-button>
            <el-button
              v-if="row.status === 2"
              link
              type="success"
              size="small"
              @click="handleConvert(row)"
            >
              转客户
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSearch"
        @current-change="handleSearch"
      />
    </el-card>

    <!-- 新建/编辑线索对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="客户姓名" prop="customerName">
          <el-input v-model="form.customerName" placeholder="请输入客户姓名" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="微信号">
          <el-input v-model="form.wechat" placeholder="请输入微信号" />
        </el-form-item>
        <el-form-item label="酒店名称">
          <el-input v-model="form.hotelName" placeholder="请输入酒店名称" />
        </el-form-item>
        <el-form-item label="渠道来源" prop="channelSource">
          <el-select v-model="form.channelSource" placeholder="请选择">
            <el-option label="抖音沟通" value="抖音沟通" />
            <el-option label="抖音询单" value="抖音询单" />
            <el-option label="小红书" value="小红书" />
            <el-option label="官网" value="官网" />
            <el-option label="转介绍" value="转介绍" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="首次咨询需求">
          <el-input
            v-model="form.firstDemand"
            type="textarea"
            :rows="3"
            placeholder="请输入首次咨询需求"
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

    <!-- 添加跟进记录对话框 -->
    <el-dialog
      v-model="followUpDialogVisible"
      title="添加跟进记录"
      width="500px"
    >
      <el-form ref="followUpFormRef" :model="followUpForm" label-width="100px">
        <el-form-item label="跟进方式" required>
          <el-select v-model="followUpForm.followType" placeholder="请选择">
            <el-option label="电话" value="电话" />
            <el-option label="微信" value="微信" />
            <el-option label="现场拜访" value="现场拜访" />
            <el-option label="视频会议" value="视频会议" />
            <el-option label="邮件" value="邮件" />
          </el-select>
        </el-form-item>
        <el-form-item label="跟进内容" required>
          <el-input
            v-model="followUpForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入跟进内容"
          />
        </el-form-item>
        <el-form-item label="意向度">
          <el-select v-model="followUpForm.intentionLevel" placeholder="请选择">
            <el-option label="高" value="高" />
            <el-option label="中" value="中" />
            <el-option label="低" value="低" />
            <el-option label="待定" value="待定" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="followUpDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleFollowUpSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getLeadList, createLead, updateLead, addFollowUp } from '@/api/lead'
import dayjs from 'dayjs'

const loading = ref(false)
const dialogVisible = ref(false)
const followUpDialogVisible = ref(false)
const submitLoading = ref(false)
const dialogTitle = ref('新建线索')
const currentRow = ref(null)

const tableData = ref([])
const filterForm = reactive({
  status: '',
  channel: '',
  keyword: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const form = reactive({
  customerName: '',
  phone: '',
  wechat: '',
  hotelName: '',
  channelSource: '',
  firstDemand: ''
})

const followUpForm = reactive({
  followType: '',
  content: '',
  intentionLevel: ''
})

const formRules = {
  customerName: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号码', trigger: 'blur' }],
  channelSource: [{ required: true, message: '请选择渠道来源', trigger: 'change' }]
}

// 获取列表
const fetchList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filterForm
    }

    const res = await getLeadList(params)
    tableData.value = res.data.list
    pagination.total = res.data.pagination.total
  } catch (error) {
    ElMessage.error(error.message || '获取失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchList()
}

// 重置
const handleReset = () => {
  Object.keys(filterForm).forEach(key => {
    filterForm[key] = ''
  })
  handleSearch()
}

// 新建
const handleAdd = () => {
  dialogTitle.value = '新建线索'
  currentRow.value = null
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑线索'
  currentRow.value = row
  Object.keys(form).forEach(key => {
    form[key] = row[key] || ''
  })
  dialogVisible.value = true
}

// 查看
const handleView = (row) => {
  ElMessage.info('查看详情功能开发中')
}

// 跟进
const handleFollowUp = (row) => {
  currentRow.value = row
  followUpForm.followType = ''
  followUpForm.content = ''
  followUpForm.intentionLevel = ''
  followUpDialogVisible.value = true
}

// 转客户
const handleConvert = (row) => {
  ElMessage.info('转客户功能开发中')
}

// 提交表单
const handleSubmit = async () => {
  submitLoading.value = true
  try {
    if (currentRow.value) {
      await updateLead(currentRow.value.id, form)
      ElMessage.success('更新成功')
    } else {
      await createLead(form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchList()
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

// 提交跟进记录
const handleFollowUpSubmit = async () => {
  if (!followUpForm.followType || !followUpForm.content) {
    ElMessage.warning('请填写跟进方式和跟进内容')
    return
  }

  try {
    await addFollowUp(currentRow.value.id, followUpForm)
    ElMessage.success('添加成功')
    followUpDialogVisible.value = false
    fetchList()
  } catch (error) {
    ElMessage.error(error.message || '添加失败')
  }
}

// 关闭对话框
const handleDialogClose = () => {
  Object.keys(form).forEach(key => {
    form[key] = ''
  })
}

// 格式化日期
const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
}

// 状态文本
const getStatusText = (status) => {
  const map = { 1: '新建', 2: '跟进中', 3: '已转化', 4: '已放弃' }
  return map[status] || '-'
}

// 状态类型
const getStatusType = (status) => {
  const map = { 1: 'info', 2: '', 3: 'success', 4: 'danger' }
  return map[status] || ''
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped lang="scss">
.leads-container {
  .filter-card {
    margin-bottom: 20px;

    .filter-form {
      margin-bottom: 10px;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
    }
  }

  .table-card {
    :deep(.el-pagination) {
      margin-top: 20px;
      justify-content: flex-end;
    }
  }
}
</style>
