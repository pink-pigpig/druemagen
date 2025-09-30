<!-- src/views/Profile/MyProfile.vue -->
<template>
  <div class="my-profile">
    <h2>个人中心</h2>
    
    <div class="profile-container">
      <!-- 个人信息卡片 -->
      <el-card class="profile-card">
        <template #header>
          <div class="card-header">
            <span>个人信息</span>
          </div>
        </template>
        
        <div class="profile-content">
          <el-row :gutter="20">
            <el-col :span="8" class="avatar-col">
              <div class="avatar-wrapper">
                <el-avatar :size="100" :src="userInfo.avatar || defaultAvatar">
                  {{ userInfo.name?.substring(0, 1) }}
                </el-avatar>
                <el-button 
                  type="primary" 
                  link 
                  @click="changeAvatar"
                  class="change-avatar-btn"
                >
                  更换头像
                </el-button>
              </div>
            </el-col>
            
            <el-col :span="16">
              <el-descriptions :column="1" border>
                <el-descriptions-item label="用户名">
                  {{ userInfo.username }}
                </el-descriptions-item>
                <el-descriptions-item label="姓名">
                  {{ userInfo.name }}
                </el-descriptions-item>
                <el-descriptions-item label="角色">
                  <el-tag 
                    v-for="role in userInfo.roles" 
                    :key="role.id"
                    :type="getRoleTagType(role.name)"
                    style="margin-right: 5px;"
                  >
                    {{ role.displayName }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="手机号">
                  <span v-if="!isEditing.phone">{{ userInfo.phone }}</span>
                  <div v-else class="edit-field">
                    <el-input 
                      v-model="editForm.phone" 
                      size="small"
                      :maxlength="11"
                    />
                    <el-button 
                      type="primary" 
                      size="small" 
                      @click="savePhone"
                      style="margin-left: 10px;"
                    >
                      保存
                    </el-button>
                    <el-button 
                      size="small" 
                      @click="cancelEdit('phone')"
                    >
                      取消
                    </el-button>
                  </div>
                  <el-button 
                    v-if="!isEditing.phone"
                    type="primary" 
                    link 
                    @click="startEdit('phone')"
                    style="margin-left: 10px;"
                  >
                    修改
                  </el-button>
                </el-descriptions-item>
                <el-descriptions-item label="邮箱">
                  <span v-if="!isEditing.email">{{ userInfo.email }}</span>
                  <div v-else class="edit-field">
                    <el-input 
                      v-model="editForm.email" 
                      size="small"
                      type="email"
                    />
                    <el-button 
                      type="primary" 
                      size="small" 
                      @click="saveEmail"
                      style="margin-left: 10px;"
                    >
                      保存
                    </el-button>
                    <el-button 
                      size="small" 
                      @click="cancelEdit('email')"
                    >
                      取消
                    </el-button>
                  </div>
                  <el-button 
                    v-if="!isEditing.email"
                    type="primary" 
                    link 
                    @click="startEdit('email')"
                    style="margin-left: 10px;"
                  >
                    修改
                  </el-button>
                </el-descriptions-item>
                <el-descriptions-item label="创建时间">
                  {{ formatDate(userInfo.createTime) }}
                </el-descriptions-item>
                <el-descriptions-item label="最后登录">
                  {{ formatDate(userInfo.lastLoginTime) }}
                </el-descriptions-item>
              </el-descriptions>
            </el-col>
          </el-row>
        </div>
      </el-card>
      
      <!-- 安全设置卡片 -->
      <el-card class="security-card">
        <template #header>
          <div class="card-header">
            <span>安全设置</span>
          </div>
        </template>
        
        <div class="security-content">
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="security-item">
                <div class="security-info">
                  <h4>登录密码</h4>
                  <p>定期修改密码有助于保护账户安全</p>
                </div>
                <el-button @click="showPasswordDialog">修改密码</el-button>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="security-item">
                <div class="security-info">
                  <h4>登录历史</h4>
                  <p>查看最近的登录记录</p>
                </div>
                <el-button @click="viewLoginHistory">查看详情</el-button>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>
    
    <!-- 修改密码对话框 -->
    <el-dialog 
      title="修改密码" 
      v-model="passwordDialogVisible" 
      width="500px"
      @close="handlePasswordDialogClose"
    >
      <el-form 
        :model="passwordForm" 
        :rules="passwordRules" 
        ref="passwordFormRef"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input 
            v-model="passwordForm.oldPassword" 
            type="password" 
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password" 
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password" 
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="changePassword">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 登录历史对话框 -->
    <el-dialog 
      title="登录历史" 
      v-model="loginHistoryDialogVisible" 
      width="700px"
    >
      <el-table :data="loginHistory" style="width: 100%" max-height="400">
        <el-table-column prop="loginTime" label="登录时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.loginTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="ipAddress" label="登录IP" width="150" />
        <el-table-column prop="userAgent" label="设备信息" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="loginHistoryDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import type { FormInstance, FormRules } from 'element-plus'

interface UserInfo {
  id: number
  username: string
  name: string
  phone: string
  email: string
  avatar: string
  roles: Array<{
    id: number
    name: string
    displayName: string
  }>
  createTime: string
  lastLoginTime: string
}

interface LoginHistory {
  id: number
  loginTime: string
  ipAddress: string
  userAgent: string
  status: number // 1: 成功, 0: 失败
}

// 用户信息
const userInfo = ref<UserInfo>({
  id: 0,
  username: '',
  name: '',
  phone: '',
  email: '',
  avatar: '',
  roles: [],
  createTime: '',
  lastLoginTime: ''
})

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 编辑状态
const isEditing = reactive({
  phone: false,
  email: false
})

// 编辑表单
const editForm = reactive({
  phone: '',
  email: ''
})

// 修改密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 登录历史
const loginHistory = ref<LoginHistory[]>([])

// 对话框状态
const passwordDialogVisible = ref(false)
const loginHistoryDialogVisible = ref(false)

// 表单引用
const passwordFormRef = ref<FormInstance>()

// 密码表单验证规则
const passwordRules = reactive<FormRules>({
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// 获取角色标签类型
const getRoleTagType = (roleName: string): 'primary' | 'success' | 'warning' | 'danger' | '' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | ''> = {
    admin: 'danger',
    manager: 'warning',
    cashier: 'success',
    pharmacist: 'primary'
  }
  return typeMap[roleName] || ''
}

// 格式化日期
const formatDate = (dateString: string): string => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const response = await axios.get('/api/profile')
    
    userInfo.value = response.data
    
    // 模拟数据（实际项目中删除此段）
    if (!response.data.id) {
      userInfo.value = {
        id: 1,
        username: 'admin',
        name: '系统管理员',
        phone: '13800138000',
        email: 'admin@example.com',
        avatar: '',
        roles: [
          { id: 1, name: 'admin', displayName: '系统管理员' }
        ],
        createTime: '2023-01-01T10:00:00',
        lastLoginTime: '2023-07-01T09:30:00'
      }
    }
  } catch (error) {
    ElMessage.error('加载用户信息失败')
    console.error(error)
  }
}

// 开始编辑字段
const startEdit = (field: 'phone' | 'email') => {
  isEditing[field] = true
  editForm[field] = userInfo.value[field]
}

// 取消编辑
const cancelEdit = (field: 'phone' | 'email') => {
  isEditing[field] = false
}

// 保存手机号
const savePhone = async () => {
  if (!/^1[3-9]\d{9}$/.test(editForm.phone)) {
    ElMessage.error('请输入正确的手机号')
    return
  }
  
  try {
    await axios.put('/api/profile/phone', {
      phone: editForm.phone
    })
    
    userInfo.value.phone = editForm.phone
    isEditing.phone = false
    ElMessage.success('手机号更新成功')
  } catch (error) {
    ElMessage.error('手机号更新失败')
    console.error(error)
  }
}

// 保存邮箱
const saveEmail = async () => {
  if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(editForm.email)) {
    ElMessage.error('请输入正确的邮箱地址')
    return
  }
  
  try {
    await axios.put('/api/profile/email', {
      email: editForm.email
    })
    
    userInfo.value.email = editForm.email
    isEditing.email = false
    ElMessage.success('邮箱更新成功')
  } catch (error) {
    ElMessage.error('邮箱更新失败')
    console.error(error)
  }
}

// 更换头像
const changeAvatar = () => {
  ElMessage.info('头像更换功能开发中...')
  // 这里可以实现文件上传功能
}

// 显示修改密码对话框
const showPasswordDialog = () => {
  Object.assign(passwordForm, {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  passwordDialogVisible.value = true
}

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await axios.put('/api/profile/password', {
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
        
        ElMessage.success('密码修改成功，请重新登录')
        passwordDialogVisible.value = false
        
        // 可以在这里添加登出逻辑，要求用户重新登录
        // logout()
      } catch (error) {
        ElMessage.error('密码修改失败')
        console.error(error)
      }
    }
  })
}

// 处理密码对话框关闭
const handlePasswordDialogClose = () => {
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields()
  }
}

// 查看登录历史
const viewLoginHistory = async () => {
  try {
    const response = await axios.get('/api/profile/login-history')
    
    loginHistory.value = response.data
    
    // 模拟数据（实际项目中删除此段）
    if (!response.data.length) {
      loginHistory.value = [
        {
          id: 1,
          loginTime: '2023-07-01T09:30:00',
          ipAddress: '192.168.1.100',
          userAgent: 'Chrome 114.0.0.0 / Windows 10',
          status: 1
        },
        {
          id: 2,
          loginTime: '2023-06-30T16:45:00',
          ipAddress: '192.168.1.101',
          userAgent: 'Firefox 114.0 / Windows 10',
          status: 1
        },
        {
          id: 3,
          loginTime: '2023-06-29T08:15:00',
          ipAddress: '192.168.1.100',
          userAgent: 'Chrome 114.0.0.0 / Windows 10',
          status: 1
        }
      ]
    }
    
    loginHistoryDialogVisible.value = true
  } catch (error) {
    ElMessage.error('加载登录历史失败')
    console.error(error)
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.my-profile {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.profile-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-card,
.security-card {
  width: 100%;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.avatar-col {
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-wrapper {
  text-align: center;
}

.change-avatar-btn {
  display: block;
  margin: 10px auto 0;
}

.edit-field {
  display: flex;
  align-items: center;
}

.security-content {
  padding: 20px 0;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 20px;
}

.security-item:last-child {
  margin-bottom: 0;
}

.security-info h4 {
  margin: 0 0 10px 0;
}

.security-info p {
  margin: 0;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .avatar-col {
    margin-bottom: 20px;
  }
}
</style>