<template>
  <div class="settings-page">
    <el-card shadow="never">
      <el-tabs v-model="activeTab">
        <!-- 用户管理 -->
        <el-tab-pane label="用户管理" name="users">
          <div class="tab-header">
            <el-button type="primary" @click="handleAddUser" :icon="Plus">
              添加用户
            </el-button>
          </div>

          <el-table :data="userList" border style="width: 100%">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="username" label="用户名" width="120" />
            <el-table-column prop="full_name" label="姓名" width="120" />
            <el-table-column prop="email" label="邮箱" min-width="180" />
            <el-table-column prop="phone" label="手机号" width="130" />
            <el-table-column prop="role" label="角色" width="120">
              <template #default="{ row }">
                <el-tag :type="getRoleType(row.role)">
                  {{ getRoleText(row.role) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : 'info'">
                  {{ row.status === 'active' ? '正常' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="250" align="center" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" link @click="handleEditUser(row)">
                  编辑
                </el-button>
                <el-button type="warning" size="small" link @click="handleResetPassword(row)">
                  重置密码
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  link
                  @click="handleDeleteUser(row)"
                  v-if="row.user_id !== currentUserId"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 角色管理 -->
        <el-tab-pane label="角色管理" name="roles">
          <div class="tab-header">
            <el-button type="primary" @click="handleAddRole" :icon="Plus">
              添加角色
            </el-button>
          </div>

          <el-table :data="roleList" border style="width: 100%">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="role_name" label="角色名称" width="150" />
            <el-table-column prop="role_code" label="角色代码" width="150" />
            <el-table-column prop="description" label="描述" min-width="200" />
            <el-table-column prop="user_count" label="用户数" width="100" align="center" />
            <el-table-column label="操作" width="150" align="center" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" link @click="handleEditRole(row)">
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  link
                  @click="handleDeleteRole(row)"
                  v-if="!row.is_system"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 系统参数 -->
        <el-tab-pane label="系统参数" name="params">
          <el-form
            :model="systemParams"
            :rules="paramsRules"
            ref="paramsFormRef"
            label-width="150px"
            style="max-width: 800px"
          >
            <el-divider content-position="left">基本设置</el-divider>

            <el-form-item label="系统名称" prop="system_name">
              <el-input v-model="systemParams.system_name" placeholder="请输入系统名称" />
            </el-form-item>

            <el-form-item label="公司名称" prop="company_name">
              <el-input v-model="systemParams.company_name" placeholder="请输入公司名称" />
            </el-form-item>

            <el-form-item label="联系电话" prop="contact_phone">
              <el-input v-model="systemParams.contact_phone" placeholder="请输入联系电话" />
            </el-form-item>

            <el-form-item label="联系邮箱" prop="contact_email">
              <el-input v-model="systemParams.contact_email" placeholder="请输入联系邮箱" />
            </el-form-item>

            <el-divider content-position="left">业务设置</el-divider>

            <el-form-item label="报价单有效期" prop="quotation_validity_days">
              <el-input-number
                v-model="systemParams.quotation_validity_days"
                :min="1"
                :max="365"
                controls-position="right"
              />
              <span style="margin-left: 10px; color: #909399;">天</span>
            </el-form-item>

            <el-form-item label="合同默认期限" prop="contract_default_months">
              <el-input-number
                v-model="systemParams.contract_default_months"
                :min="1"
                :max="120"
                controls-position="right"
              />
              <span style="margin-left: 10px; color: #909399;">月</span>
            </el-form-item>

            <el-form-item label="任务逾期提醒" prop="task_reminder_days">
              <el-input-number
                v-model="systemParams.task_reminder_days"
                :min="0"
                :max="30"
                controls-position="right"
              />
              <span style="margin-left: 10px; color: #909399;">天前提醒</span>
            </el-form-item>

            <el-divider content-position="left">其他设置</el-divider>

            <el-form-item label="启用邮件通知">
              <el-switch v-model="systemParams.email_notification_enabled" />
            </el-form-item>

            <el-form-item label="启用短信通知">
              <el-switch v-model="systemParams.sms_notification_enabled" />
            </el-form-item>

            <el-form-item label="数据备份">
              <el-switch v-model="systemParams.auto_backup_enabled" />
              <span style="margin-left: 10px; color: #909399;">自动备份数据</span>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="submitSystemParams" :loading="paramsLoading">
                保存设置
              </el-button>
              <el-button @click="resetSystemParams">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="userDialogVisible"
      :title="userDialogTitle"
      width="600px"
      @close="resetUserForm"
    >
      <el-form
        :model="userForm"
        :rules="userRules"
        ref="userFormRef"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="姓名" prop="full_name">
          <el-input v-model="userForm.full_name" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option
              v-for="role in roleList"
              :key="role.role_code"
              :label="role.role_name"
              :value="role.role_code"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="密码" prop="password" v-if="!userForm.user_id">
          <el-input
            v-model="userForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio value="active">正常</el-radio>
            <el-radio value="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUserForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 添加/编辑角色对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      :title="roleDialogTitle"
      width="600px"
      @close="resetRoleForm"
    >
      <el-form
        :model="roleForm"
        :rules="roleRules"
        ref="roleFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="role_name">
          <el-input v-model="roleForm.role_name" placeholder="请输入角色名称" />
        </el-form-item>

        <el-form-item label="角色代码" prop="role_code">
          <el-input
            v-model="roleForm.role_code"
            placeholder="请输入角色代码（英文）"
            :disabled="!!roleForm.role_id"
          />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>

        <el-form-item label="权限设置">
          <el-tree
            :data="permissionTree"
            show-checkbox
            node-key="id"
            :default-checked-keys="roleForm.permissions"
            @check="handlePermissionCheck"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRoleForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  getUserList,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  getRoleList,
  createRole,
  updateRole,
  deleteRole,
  getSystemParams,
  updateSystemParams
} from '@/api/settings'

// 当前用户ID（用于防止删除自己）
const currentUserId = ref(1)

// 标签页
const activeTab = ref('users')

// 用户列表
const userList = ref([])
const userDialogVisible = ref(false)
const userDialogTitle = ref('添加用户')
const userFormRef = ref(null)
const userForm = reactive({
  user_id: null,
  username: '',
  full_name: '',
  email: '',
  phone: '',
  role: '',
  password: '',
  status: 'active'
})

const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  full_name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 角色列表
const roleList = ref([])
const roleDialogVisible = ref(false)
const roleDialogTitle = ref('添加角色')
const roleFormRef = ref(null)
const roleForm = reactive({
  role_id: null,
  role_name: '',
  role_code: '',
  description: '',
  permissions: []
})

const roleRules = {
  role_name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ],
  role_code: [
    { required: true, message: '请输入角色代码', trigger: 'blur' },
    { pattern: /^[a-z_]+$/, message: '角色代码只能包含小写字母和下划线', trigger: 'blur' }
  ]
}

// 权限树
const permissionTree = ref([
  {
    id: 1,
    label: '线索管理',
    children: [
      { id: 11, label: '查看线索' },
      { id: 12, label: '创建线索' },
      { id: 13, label: '编辑线索' },
      { id: 14, label: '删除线索' }
    ]
  },
  {
    id: 2,
    label: '客户管理',
    children: [
      { id: 21, label: '查看客户' },
      { id: 22, label: '创建客户' },
      { id: 23, label: '编辑客户' },
      { id: 24, label: '删除客户' }
    ]
  },
  {
    id: 3,
    label: '产品管理',
    children: [
      { id: 31, label: '查看产品' },
      { id: 32, label: '创建产品' },
      { id: 33, label: '编辑产品' },
      { id: 34, label: '删除产品' }
    ]
  },
  {
    id: 4,
    label: '报价管理',
    children: [
      { id: 41, label: '查看报价' },
      { id: 42, label: '创建报价' },
      { id: 43, label: '编辑报价' },
      { id: 44, label: '删除报价' }
    ]
  },
  {
    id: 5,
    label: '合同管理',
    children: [
      { id: 51, label: '查看合同' },
      { id: 52, label: '创建合同' },
      { id: 53, label: '编辑合同' },
      { id: 54, label: '删除合同' }
    ]
  },
  {
    id: 6,
    label: '系统设置',
    children: [
      { id: 61, label: '用户管理' },
      { id: 62, label: '角色管理' },
      { id: 63, label: '系统参数' }
    ]
  }
])

// 系统参数
const paramsFormRef = ref(null)
const paramsLoading = ref(false)
const systemParams = reactive({
  system_name: '',
  company_name: '',
  contact_phone: '',
  contact_email: '',
  quotation_validity_days: 30,
  contract_default_months: 12,
  task_reminder_days: 3,
  email_notification_enabled: false,
  sms_notification_enabled: false,
  auto_backup_enabled: false
})

const paramsRules = {
  system_name: [
    { required: true, message: '请输入系统名称', trigger: 'blur' }
  ],
  company_name: [
    { required: true, message: '请输入公司名称', trigger: 'blur' }
  ],
  contact_email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 加载用户列表
const loadUserList = async () => {
  try {
    const res = await getUserList()
    userList.value = res.data?.list || []
  } catch (error) {
    ElMessage.error('加载用户列表失败')
    console.error(error)
  }
}

// 添加用户
const handleAddUser = () => {
  userDialogTitle.value = '添加用户'
  resetUserForm()
  userDialogVisible.value = true
}

// 编辑用户
const handleEditUser = (row) => {
  userDialogTitle.value = '编辑用户'
  Object.assign(userForm, {
    user_id: row.user_id,
    username: row.username,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    status: row.status
  })
  userDialogVisible.value = true
}

// 删除用户
const handleDeleteUser = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个用户吗？', '提示', {
      type: 'warning'
    })
    await deleteUser(row.user_id)
    ElMessage.success('删除成功')
    await loadUserList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

// 重置密码
const handleResetPassword = async (row) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入新密码', '重置密码', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^.{6,20}$/,
      inputErrorMessage: '密码长度在 6 到 20 个字符'
    })

    await resetUserPassword(row.user_id, { new_password: value })
    ElMessage.success('密码重置成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('密码重置失败')
      console.error(error)
    }
  }
}

// 提交用户表单
const submitUserForm = async () => {
  try {
    await userFormRef.value.validate()

    const data = {
      username: userForm.username,
      full_name: userForm.full_name,
      email: userForm.email,
      phone: userForm.phone,
      role: userForm.role,
      status: userForm.status
    }

    if (!userForm.user_id) {
      data.password = userForm.password
      await createUser(data)
      ElMessage.success('添加成功')
    } else {
      await updateUser(userForm.user_id, data)
      ElMessage.success('更新成功')
    }

    userDialogVisible.value = false
    await loadUserList()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败')
      console.error(error)
    }
  }
}

// 重置用户表单
const resetUserForm = () => {
  Object.assign(userForm, {
    user_id: null,
    username: '',
    full_name: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    status: 'active'
  })
  userFormRef.value?.clearValidate()
}

// 加载角色列表
const loadRoleList = async () => {
  try {
    const res = await getRoleList()
    roleList.value = res.data?.list || []
  } catch (error) {
    ElMessage.error('加载角色列表失败')
    console.error(error)
  }
}

// 添加角色
const handleAddRole = () => {
  roleDialogTitle.value = '添加角色'
  resetRoleForm()
  roleDialogVisible.value = true
}

// 编辑角色
const handleEditRole = (row) => {
  roleDialogTitle.value = '编辑角色'
  Object.assign(roleForm, {
    role_id: row.role_id,
    role_name: row.role_name,
    role_code: row.role_code,
    description: row.description,
    permissions: row.permissions || []
  })
  roleDialogVisible.value = true
}

// 删除角色
const handleDeleteRole = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个角色吗？', '提示', {
      type: 'warning'
    })
    await deleteRole(row.role_id)
    ElMessage.success('删除成功')
    await loadRoleList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

// 权限选择
const handlePermissionCheck = (data, checked) => {
  roleForm.permissions = checked.checkedKeys
}

// 提交角色表单
const submitRoleForm = async () => {
  try {
    await roleFormRef.value.validate()

    const data = {
      role_name: roleForm.role_name,
      role_code: roleForm.role_code,
      description: roleForm.description,
      permissions: roleForm.permissions
    }

    if (!roleForm.role_id) {
      await createRole(data)
      ElMessage.success('添加成功')
    } else {
      await updateRole(roleForm.role_id, data)
      ElMessage.success('更新成功')
    }

    roleDialogVisible.value = false
    await loadRoleList()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败')
      console.error(error)
    }
  }
}

// 重置角色表单
const resetRoleForm = () => {
  Object.assign(roleForm, {
    role_id: null,
    role_name: '',
    role_code: '',
    description: '',
    permissions: []
  })
  roleFormRef.value?.clearValidate()
}

// 加载系统参数
const loadSystemParams = async () => {
  try {
    const res = await getSystemParams()
    Object.assign(systemParams, res.data || {})
  } catch (error) {
    ElMessage.error('加载系统参数失败')
    console.error(error)
  }
}

// 提交系统参数
const submitSystemParams = async () => {
  try {
    await paramsFormRef.value.validate()

    paramsLoading.value = true
    await updateSystemParams(systemParams)

    ElMessage.success('保存成功')
    await loadSystemParams()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('保存失败')
      console.error(error)
    }
  } finally {
    paramsLoading.value = false
  }
}

// 重置系统参数
const resetSystemParams = () => {
  loadSystemParams()
}

// 获取角色类型
const getRoleType = (role) => {
  const types = {
    admin: 'danger',
    manager: 'warning',
    sales: 'success',
    support: 'info'
  }
  return types[role] || 'info'
}

// 获取角色文本
const getRoleText = (role) => {
  const texts = {
    admin: '系统管理员',
    manager: '销售经理',
    sales: '销售人员',
    support: '客服人员'
  }
  return texts[role] || role
}

// 页面加载
onMounted(() => {
  loadUserList()
  loadRoleList()
  loadSystemParams()
})
</script>

<style scoped lang="scss">
.settings-page {
  padding: 20px;

  .tab-header {
    margin-bottom: 20px;
  }
}
</style>
