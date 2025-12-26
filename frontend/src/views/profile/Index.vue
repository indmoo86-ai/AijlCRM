<template>
  <div class="profile-page">
    <el-row :gutter="20">
      <!-- 左侧：用户信息卡片 -->
      <el-col :span="8">
        <el-card shadow="never" class="profile-card">
          <div class="user-avatar">
            <el-avatar
              :size="120"
              :src="userInfo.avatar"
              :icon="UserFilled"
            />
            <el-upload
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :http-request="handleAvatarUpload"
              class="avatar-uploader"
            >
              <el-button size="small" type="primary" :icon="Upload" class="upload-btn">
                更换头像
              </el-button>
            </el-upload>
          </div>

          <div class="user-info">
            <h2>{{ userInfo.username || '-' }}</h2>
            <p class="user-role">{{ getRoleText(userInfo.role) }}</p>
            <el-divider />
            <div class="info-item">
              <el-icon><Message /></el-icon>
              <span>{{ userInfo.email || '-' }}</span>
            </div>
            <div class="info-item">
              <el-icon><Phone /></el-icon>
              <span>{{ userInfo.phone || '-' }}</span>
            </div>
            <div class="info-item">
              <el-icon><Calendar /></el-icon>
              <span>加入时间：{{ formatDate(userInfo.created_at) }}</span>
            </div>
          </div>
        </el-card>

        <!-- 账户统计 -->
        <el-card shadow="never" class="stats-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">账户统计</span>
            </div>
          </template>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ stats.leads_count }}</div>
              <div class="stat-label">我的线索</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.customers_count }}</div>
              <div class="stat-label">我的客户</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.quotations_count }}</div>
              <div class="stat-label">我的报价</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.contracts_count }}</div>
              <div class="stat-label">我的合同</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：编辑表单 -->
      <el-col :span="16">
        <!-- 基本信息 -->
        <el-card shadow="never" class="form-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">基本信息</span>
            </div>
          </template>

          <el-form
            :model="profileForm"
            :rules="profileRules"
            ref="profileFormRef"
            label-width="100px"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="profileForm.username" placeholder="请输入用户名" />
            </el-form-item>

            <el-form-item label="姓名" prop="full_name">
              <el-input v-model="profileForm.full_name" placeholder="请输入真实姓名" />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
            </el-form-item>

            <el-form-item label="手机号" prop="phone">
              <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
            </el-form-item>

            <el-form-item label="部门">
              <el-input v-model="profileForm.department" placeholder="请输入部门" />
            </el-form-item>

            <el-form-item label="职位">
              <el-input v-model="profileForm.position" placeholder="请输入职位" />
            </el-form-item>

            <el-form-item label="个人简介">
              <el-input
                v-model="profileForm.bio"
                type="textarea"
                :rows="4"
                placeholder="请输入个人简介"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="submitProfileForm" :loading="profileLoading">
                保存信息
              </el-button>
              <el-button @click="resetProfileForm">取消</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 修改密码 -->
        <el-card shadow="never" class="form-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">修改密码</span>
            </div>
          </template>

          <el-form
            :model="passwordForm"
            :rules="passwordRules"
            ref="passwordFormRef"
            label-width="100px"
          >
            <el-form-item label="当前密码" prop="old_password">
              <el-input
                v-model="passwordForm.old_password"
                type="password"
                placeholder="请输入当前密码"
                show-password
              />
            </el-form-item>

            <el-form-item label="新密码" prop="new_password">
              <el-input
                v-model="passwordForm.new_password"
                type="password"
                placeholder="请输入新密码（6-20位）"
                show-password
              />
            </el-form-item>

            <el-form-item label="确认密码" prop="confirm_password">
              <el-input
                v-model="passwordForm.confirm_password"
                type="password"
                placeholder="请再次输入新密码"
                show-password
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="submitPasswordForm" :loading="passwordLoading">
                修改密码
              </el-button>
              <el-button @click="resetPasswordForm">取消</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 最近活动 -->
        <el-card shadow="never" class="form-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">最近活动</span>
            </div>
          </template>

          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in activities"
              :key="index"
              :timestamp="activity.created_at"
              placement="top"
            >
              <el-tag :type="getActivityType(activity.type)" size="small">
                {{ getActivityText(activity.type) }}
              </el-tag>
              <span class="activity-content">{{ activity.content }}</span>
            </el-timeline-item>
          </el-timeline>

          <el-empty v-if="activities.length === 0" description="暂无活动记录" :image-size="80" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  UserFilled,
  Upload,
  Message,
  Phone,
  Calendar
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import {
  getUserInfo,
  updateUserInfo,
  changePassword,
  uploadAvatar
} from '@/api/auth'

// 用户信息
const userInfo = ref({})

// 账户统计
const stats = ref({
  leads_count: 0,
  customers_count: 0,
  quotations_count: 0,
  contracts_count: 0
})

// 基本信息表单
const profileFormRef = ref(null)
const profileLoading = ref(false)
const profileForm = reactive({
  username: '',
  full_name: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  bio: ''
})

const profileRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 修改密码表单
const passwordFormRef = ref(null)
const passwordLoading = ref(false)
const passwordForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== passwordForm.new_password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  old_password: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 最近活动
const activities = ref([])

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const res = await getUserInfo()
    userInfo.value = res.data || {}

    // 填充表单
    Object.assign(profileForm, {
      username: userInfo.value.username || '',
      full_name: userInfo.value.full_name || '',
      email: userInfo.value.email || '',
      phone: userInfo.value.phone || '',
      department: userInfo.value.department || '',
      position: userInfo.value.position || '',
      bio: userInfo.value.bio || ''
    })

    // 模拟统计数据
    stats.value = {
      leads_count: userInfo.value.leads_count || 0,
      customers_count: userInfo.value.customers_count || 0,
      quotations_count: userInfo.value.quotations_count || 0,
      contracts_count: userInfo.value.contracts_count || 0
    }

    // 模拟活动数据
    activities.value = userInfo.value.recent_activities || []
  } catch (error) {
    ElMessage.error('加载用户信息失败')
    console.error(error)
  }
}

// 提交基本信息表单
const submitProfileForm = async () => {
  try {
    await profileFormRef.value.validate()

    profileLoading.value = true
    await updateUserInfo(profileForm)

    ElMessage.success('保存成功')
    await loadUserInfo()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('保存失败')
      console.error(error)
    }
  } finally {
    profileLoading.value = false
  }
}

// 重置基本信息表单
const resetProfileForm = () => {
  Object.assign(profileForm, {
    username: userInfo.value.username || '',
    full_name: userInfo.value.full_name || '',
    email: userInfo.value.email || '',
    phone: userInfo.value.phone || '',
    department: userInfo.value.department || '',
    position: userInfo.value.position || '',
    bio: userInfo.value.bio || ''
  })
  profileFormRef.value?.clearValidate()
}

// 提交密码表单
const submitPasswordForm = async () => {
  try {
    await passwordFormRef.value.validate()

    passwordLoading.value = true
    await changePassword({
      old_password: passwordForm.old_password,
      new_password: passwordForm.new_password
    })

    ElMessage.success('密码修改成功，请重新登录')
    resetPasswordForm()

    // 可以在这里跳转到登录页或清除登录状态
    setTimeout(() => {
      // router.push('/login')
    }, 1500)
  } catch (error) {
    if (error !== false) {
      ElMessage.error('密码修改失败')
      console.error(error)
    }
  } finally {
    passwordLoading.value = false
  }
}

// 重置密码表单
const resetPasswordForm = () => {
  Object.assign(passwordForm, {
    old_password: '',
    new_password: '',
    confirm_password: ''
  })
  passwordFormRef.value?.clearValidate()
}

// 上传头像前的校验
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

// 处理头像上传
const handleAvatarUpload = async (options) => {
  try {
    const formData = new FormData()
    formData.append('avatar', options.file)

    const res = await uploadAvatar(formData)
    userInfo.value.avatar = res.data.avatar_url

    ElMessage.success('头像上传成功')
  } catch (error) {
    ElMessage.error('头像上传失败')
    console.error(error)
  }
}

// 获取角色文本
const getRoleText = (role) => {
  const roles = {
    admin: '系统管理员',
    manager: '销售经理',
    sales: '销售人员',
    support: '客服人员'
  }
  return roles[role] || role
}

// 获取活动类型
const getActivityType = (type) => {
  const types = {
    login: 'info',
    create: 'success',
    update: 'warning',
    delete: 'danger'
  }
  return types[type] || 'info'
}

// 获取活动文本
const getActivityText = (type) => {
  const texts = {
    login: '登录',
    create: '创建',
    update: '更新',
    delete: '删除'
  }
  return texts[type] || type
}

// 格式化日期
const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD') : '-'
}

// 页面加载
onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped lang="scss">
.profile-page {
  padding: 20px;

  .profile-card {
    margin-bottom: 20px;

    .user-avatar {
      text-align: center;
      padding: 20px 0;

      .avatar-uploader {
        margin-top: 15px;

        .upload-btn {
          border-radius: 20px;
        }
      }
    }

    .user-info {
      text-align: center;

      h2 {
        margin: 10px 0;
        font-size: 24px;
        color: #303133;
      }

      .user-role {
        color: #909399;
        font-size: 14px;
        margin-bottom: 15px;
      }

      .info-item {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin: 10px 0;
        color: #606266;
        font-size: 14px;

        .el-icon {
          color: #409eff;
        }
      }
    }
  }

  .stats-card {
    .card-header {
      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;

      .stat-item {
        text-align: center;
        padding: 15px;
        background: #f5f7fa;
        border-radius: 8px;

        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: #409eff;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }

  .form-card {
    margin-bottom: 20px;

    .card-header {
      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

    .activity-content {
      margin-left: 10px;
      color: #606266;
    }
  }
}
</style>
