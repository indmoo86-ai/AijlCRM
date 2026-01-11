<template>
  <div class="contract-parties-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>合同主体管理</span>
          <div class="header-actions">
            <el-button type="primary" :icon="Plus" @click="handleCreate">
              新建合同主体
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="主体名称">
          <el-input
            v-model="searchForm.keyword"
            placeholder="名称/代表/税号"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="主体类型">
          <el-select
            v-model="searchForm.party_type"
            placeholder="请选择"
            clearable
            @clear="handleSearch"
          >
            <el-option label="公司" value="company" />
            <el-option label="个人" value="individual" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择"
            clearable
            @clear="handleSearch"
          >
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
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
        <el-table-column prop="party_name" label="主体名称" min-width="180" show-overflow-tooltip />

        <el-table-column prop="party_type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.party_type === 'company'" type="primary">公司</el-tag>
            <el-tag v-else type="info">个人</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="representative" label="代表人" width="100" />
        <el-table-column prop="contact_phone" label="联系方式" width="130" />
        <el-table-column prop="tax_id" label="税号/身份证号" min-width="180" show-overflow-tooltip />
        <el-table-column prop="bank_name" label="开户行" min-width="180" show-overflow-tooltip />
        <el-table-column prop="bank_account" label="银行账号" min-width="180" show-overflow-tooltip />

        <el-table-column prop="is_default" label="默认" width="70" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.is_default === 1" type="success" size="small">是</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'active'" type="success">启用</el-tag>
            <el-tag v-else type="danger">禁用</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button
                v-if="row.status === 'active'"
                link
                type="warning"
                size="small"
                @click="handleToggleStatus(row, 'inactive')"
              >
                禁用
              </el-button>
              <el-button
                v-else
                link
                type="success"
                size="small"
                @click="handleToggleStatus(row, 'active')"
              >
                启用
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

    <!-- 新建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="主体类型" prop="party_type">
              <el-select v-model="form.party_type" placeholder="请选择" style="width: 100%">
                <el-option label="公司" value="company" />
                <el-option label="个人" value="individual" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主体名称" prop="party_name">
              <el-input v-model="form.party_name" placeholder="请输入主体名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="代表人" prop="representative">
              <el-input v-model="form.representative" placeholder="法定代表人/负责人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系方式" prop="contact_phone">
              <el-input v-model="form.contact_phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="税号/身份证号" prop="tax_id">
              <el-input v-model="form.tax_id" placeholder="公司税号或个人身份证号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设为默认" prop="is_default">
              <el-switch
                v-model="form.is_default"
                :active-value="1"
                :inactive-value="0"
                active-text="是"
                inactive-text="否"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入详细地址" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开户行" prop="bank_name">
              <el-input v-model="form.bank_name" placeholder="请输入开户银行名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="银行账号" prop="bank_account">
              <el-input v-model="form.bank_account" placeholder="请输入银行账号" />
            </el-form-item>
          </el-col>
        </el-row>
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
import {
  getContractPartyList,
  createContractParty,
  updateContractParty,
  updateContractPartyStatus,
  deleteContractParty
} from '@/api/contractParties'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新建合同主体')
const formRef = ref(null)
const tableData = ref([])

const searchForm = reactive({
  keyword: '',
  party_type: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  party_id: null,
  party_type: 'company',
  party_name: '',
  representative: '',
  contact_phone: '',
  tax_id: '',
  bank_name: '',
  bank_account: '',
  address: '',
  is_default: 0
})

const formRules = {
  party_type: [
    { required: true, message: '请选择主体类型', trigger: 'change' }
  ],
  party_name: [
    { required: true, message: '请输入主体名称', trigger: 'blur' }
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
    const res = await getContractPartyList(params)
    tableData.value = res.data.list || res.data.rows || []
    pagination.total = res.data.pagination?.total || res.data.total || 0
  } catch (error) {
    console.error('Failed to fetch contract parties:', error)
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
  searchForm.party_type = ''
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

// 新建
const handleCreate = () => {
  dialogTitle.value = '新建合同主体'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑合同主体'
  Object.assign(form, {
    party_id: row.party_id,
    party_type: row.party_type,
    party_name: row.party_name,
    representative: row.representative || '',
    contact_phone: row.contact_phone || '',
    tax_id: row.tax_id || '',
    bank_name: row.bank_name || '',
    bank_account: row.bank_account || '',
    address: row.address || '',
    is_default: row.is_default || 0
  })
  dialogVisible.value = true
}

// 切换状态
const handleToggleStatus = async (row, status) => {
  const statusText = status === 'active' ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(
      `确定要${statusText}该合同主体吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await updateContractPartyStatus(row.party_id, status)
    ElMessage.success(`${statusText}成功`)
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Toggle status failed:', error)
    }
  }
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该合同主体吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteContractParty(row.party_id)
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
      const submitData = { ...form }
      delete submitData.party_id

      if (form.party_id) {
        await updateContractParty(form.party_id, submitData)
        ElMessage.success('更新成功')
      } else {
        await createContractParty(submitData)
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
  form.party_id = null
  form.party_type = 'company'
  form.party_name = ''
  form.representative = ''
  form.contact_phone = ''
  form.tax_id = ''
  form.bank_name = ''
  form.bank_account = ''
  form.address = ''
  form.is_default = 0
}

// 组件挂载时获取数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.contract-parties-page {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-form {
  margin-bottom: 20px;
}

.table-actions {
  display: flex;
  gap: 5px;
}
</style>
