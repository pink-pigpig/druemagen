<!-- src/views/System/UserManagement.vue -->
<template>
  <div class="user-management">
    <h2>用户管理</h2>
    
    <!-- 操作栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="showAddUserDialog">新增用户</el-button>
        <el-button @click="refreshUsers">刷新</el-button>
      </div>
      <div class="toolbar-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户名/姓名/手机号"
          style="width: 300px"
          clearable
          @keyup.enter="searchUsers"
        >
          <template #append>
            <el-button @click="searchUsers">搜索</el-button>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 用户表格 -->
    <el-table 
      :data="users" 
      v-loading="loading"
      element-loading-text="加载中..."
      style="width: 100%"
      border
    >
      <el-table-column prop="id" label="用户 ID" width="80" />
      <el-table-column prop="username" label="用户名" width="150" />
      <el-table-column label="姓名" width="120">
        <template #default="scope">
          {{ scope.row.name || scope.row.username || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" width="120">
        <template #default="scope">
          {{ scope.row.phone || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="email" label="邮箱">
        <template #default="scope">
          {{ scope.row.email || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="role" label="角色" width="120">
        <template #default="scope">
          <el-tag :type="getRoleTagType(scope.row.role)">
            {{ getRoleName(scope.row.role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="1"
            :inactive-value="0"
            @change="toggleUserStatus(scope.row)"
          />
          <span :class="scope.row.status === 1 ? 'status-active' : 'status-inactive'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="showEditUserDialog(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteUser(scope.row)">删除</el-button>
          <el-button size="small" @click="resetPassword(scope.row)">重置密码</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 用户编辑对话框 -->
    <el-dialog 
      :title="dialogTitle" 
      v-model="userDialogVisible" 
      width="500px"
      @close="handleDialogClose"
    >
      <el-form 
        :model="currentUser" 
        :rules="userFormRules" 
        ref="userFormRef"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="currentUser.username" :disabled="isEditMode" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="currentUser.name" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="currentUser.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="currentUser.email" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="currentUser.role" style="width: 100%">
            <el-option
              v-for="role in roles"
              :key="role.value"
              :label="role.label"
              :value="role.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!isEditMode" label="密码" prop="password">
          <el-input v-model="currentUser.password" type="password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="userDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveUser">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog 
      title="确认删除" 
      v-model="deleteDialogVisible" 
      width="400px"
    >
      <span>确定要删除用户 "{{ userToDelete?.name || userToDelete?.username }}" 吗？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDeleteUser">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { apiClient } from '@/services/authService'
import type { FormInstance, FormRules } from 'element-plus'

interface User {
  id: number
  username: string
  name: string
  phone: string
  email: string
  role: string
  status: number // 1: 启用，0: 禁用
  createdAt: string | number[] // 支持数组格式的原始时间数据
  password?: string // 可选密码字段，仅用于新增/编辑用户
}

// 用户数据
const users = ref<User[]>([])

// 加载状态
const loading = ref(false)

// 搜索关键词
const searchKeyword = ref('')

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 当前编辑的用户
const currentUser = reactive<User>({
  id: 0,
  username: '',
  name: '',
  phone: '',
  email: '',
  role: '',
  status: 1,
  createdAt: ''
})

// 用户角色选项
const roles = [
  { value: 'admin', label: '管理员' },
  { value: 'manager', label: '经理' },
  { value: 'cashier', label: '收银员' },
  { value: 'pharmacist', label: '药师' },
  { value: 'user', label: '普通用户' }
]

// 对话框状态
const userDialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const isEditMode = ref(false)
const userToDelete = ref<User | null>(null)

// 表单引用
const userFormRef = ref<FormInstance>()

// 表单验证规则
const userFormRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
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
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
})

// 对话框标题
const dialogTitle = computed(() => {
  return isEditMode.value ? '编辑用户' : '新增用户'
})

// 获取角色名称
const getRoleName = (role: string): string => {
  const roleMap: Record<string, string> = {
    admin: '管理员',
    manager: '经理',
    cashier: '收银员',
    pharmacist: '药师',
    user: '普通用户'
  }
  return roleMap[role] || role
}

// 获取角色标签类型
const getRoleTagType = (role: string): 'primary' | 'success' | 'warning' | 'danger' | '' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | ''> = {
    admin: 'danger',
    manager: 'warning',
    cashier: 'success',
    pharmacist: 'primary',
    user: ''
  }
  return typeMap[role] || ''
}

// 格式化日期 - 支持数组格式 [年，月，日，时，分，秒] 和字符串格式
const formatDate = (dateValue: string | number[]): string => {
  if (!dateValue) {
    return '-'
  }
  
  let date: Date
  if (Array.isArray(dateValue)) {
    // 后端返回 [年，月，日，时，分，秒] 数组格式，月份需减 1
    const [year, month, day, hour, minute, second] = dateValue
    date = new Date(year, month - 1, day, hour || 0, minute || 0, second || 0)
  } else {
    date = new Date(dateValue)
  }
  
  if (isNaN(date.getTime())) {
    return '-'
  }
  
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

// 加载用户数据
const loadUsers = async () => {
  loading.value = true
  try {
    const response = await apiClient.get('/api/admin/manageusers', {
      params: {
        page: pagination.currentPage,
        size: pagination.pageSize,
        keyword: searchKeyword.value
      }
    })
    
    console.log('原始响应数据:', response.data)
    
    // 根据响应结构，数据在 data.records 中
    const responseData = response.data.data || response.data
    const rawUsers = responseData.records || []
    
    // 直接使用后端返回的 role 字段，不再进行映射
    users.value = rawUsers.map((user: any) => ({
      ...user,
      // 如果后端没有返回 role，则根据 identity 映射（兼容旧数据）
      role: user.role || mapIdentityToRole(user.identity)
    }))
    pagination.total = responseData.total || 0
    
    console.log('解析后的用户数据:', users.value)
    console.log('总数:', pagination.total)
    
    // 模拟数据（实际项目中删除此段）
    if (!responseData.records || responseData.records.length === 0) {
      users.value = [
        {
          id: 1,
          username: 'admin',
          name: '系统管理员',
          phone: '13800138000',
          email: 'admin@example.com',
          role: 'admin',
          status: 1,
          createdAt: [2023, 1, 1, 10, 0, 0]
        },
        {
          id: 2,
          username: 'manager',
          name: '张经理',
          phone: '13800138001',
          email: 'manager@example.com',
          role: 'manager',
          status: 1,
          createdAt: [2023, 1, 2, 10, 0, 0]
        },
        {
          id: 3,
          username: 'cashier001',
          name: '李收银员',
          phone: '13800138002',
          email: 'cashier@example.com',
          role: 'cashier',
          status: 1,
          createdAt: [2023, 1, 3, 10, 0, 0]
        }
      ]
      pagination.total = 3
    }
  } catch (error) {
    ElMessage.error('加载用户数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 将 identity 映射为 role
const mapIdentityToRole = (identity: number): string => {
  const roleMap: Record<number, string> = {
    0: 'user',      // 普通用户
    1: 'admin',     // 管理员
    2: 'manager',   // 经理
    3: 'cashier',   // 收银员
    4: 'pharmacist' // 药师
  }
  return roleMap[identity] || 'user'
}

// 搜索用户
const searchUsers = () => {
  pagination.currentPage = 1
  loadUsers()
}

// 刷新用户列表
const refreshUsers = () => {
  searchKeyword.value = ''
  pagination.currentPage = 1
  loadUsers()
}

// 处理分页大小变化
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  loadUsers()
}

// 处理当前页变化
const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  loadUsers()
}

// 显示新增用户对话框
const showAddUserDialog = () => {
  isEditMode.value = false
  Object.assign(currentUser, {
    id: 0,
    username: '',
    name: '',
    phone: '',
    email: '',
    role: 'user',
    status: 1,
    createdAt: ''
  })
  userDialogVisible.value = true
}

// 显示编辑用户对话框
const showEditUserDialog = (user: User) => {
  isEditMode.value = true
  Object.assign(currentUser, { 
    ...user,
    // 确保所有字段都有值
    name: user.name || user.username, // 如果 name 为空，使用 username 作为默认值
    phone: user.phone || '',
    email: user.email || ''
  })
  userDialogVisible.value = true
}

// 保存用户
const saveUser = async () => {
  if (!userFormRef.value) return
  
  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let response
        if (isEditMode.value) {
          // 编辑用户
          response = await apiClient.put(`/api/admin/manageusers/${currentUser.id}`, currentUser)
        } else {
          // 新增用户
          response = await apiClient.post('/api/admin/manageusers', currentUser)
        }
        
        // 检查响应码，必须 code === 1 才算成功
        if (response.data.code === 1) {
          ElMessage.success(isEditMode.value ? '用户更新成功' : '用户创建成功')
          userDialogVisible.value = false
          loadUsers()
        } else {
          // 后端返回错误信息
          ElMessage.error(response.data.msg || (isEditMode.value ? '更新用户失败' : '创建用户失败'))
        }
      } catch (error: any) {
        console.error('保存用户失败:', error)
        ElMessage.error(error.response?.data?.msg || (isEditMode.value ? '更新用户失败' : '创建用户失败'))
      }
    }
  })
}

// 处理对话框关闭
const handleDialogClose = () => {
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
}

// 切换用户状态
const toggleUserStatus = async (user: User) => {
  try {
    // 注意：此时 user.status 已经是新值了（因为 v-model 双向绑定）
    const endpoint = user.status === 1 ? 'enable' : 'disable'
    await apiClient.put(`/api/admin/manageusers/${user.id}/${endpoint}`)
    ElMessage.success(`用户已${user.status === 1 ? '启用' : '禁用'}`)
  } catch (error) {
    // 回滚状态
    user.status = user.status === 1 ? 0 : 1
    ElMessage.error('更新用户状态失败')
    console.error(error)
  }
}

// 删除用户
const deleteUser = (user: User) => {
  userToDelete.value = user
  deleteDialogVisible.value = true
}

// 确认删除用户
const confirmDeleteUser = async () => {
  if (!userToDelete.value) return
  
  try {
    await apiClient.delete(`/api/admin/manageusers/${userToDelete.value.id}`)
    ElMessage.success('用户删除成功')
    deleteDialogVisible.value = false
    loadUsers()
  } catch (error) {
    ElMessage.error('删除用户失败')
    console.error(error)
  }
}

// 重置密码
const resetPassword = async (user: User) => {
  try {
    const { value, action } = await ElMessageBox.prompt(
      '请输入新密码（留空则使用默认密码：123456）',
      '重置密码',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^.{0,}$|.{6,}$/,  // 允许空或至少6位
        inputErrorMessage: '密码长度至少 6 位'
      }
    )
    
    // 如果用户点击了确定
    if (action === 'confirm') {
      // 准备请求体：如果输入为空，传空对象使用默认密码；否则传新密码
      const requestBody = value && value.trim() 
        ? { newPassword: value } 
        : {}
      
      const response = await apiClient.put(
        `/api/admin/manageusers/${user.id}/reset-password`,
        requestBody
      )
      
      // 检查响应码
      if (response.data.code === 1) {
        ElMessage.success('密码重置成功')
      } else {
        ElMessage.error(response.data.msg || '密码重置失败')
      }
    }
  } catch (error: any) {
    // 用户取消操作不显示错误
    if (error !== 'cancel' && error !== 'close') {
      console.error('重置密码失败:', error)
      ElMessage.error(error.response?.data?.msg || '重置密码失败')
    }
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
}

.toolbar-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.status-active {
  margin-left: 5px;
  color: #67c23a;
}

.status-inactive {
  margin-left: 5px;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>