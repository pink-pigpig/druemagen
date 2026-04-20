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
                <el-avatar 
                  :size="100" 
                  :src="getAvatarUrl(userInfo.avatar)"
                  @error="handleAvatarError"
                >
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
import { authService } from '@/services/authService'
import { adminService } from '@/services/adminService'
import type { FormInstance, FormRules } from 'element-plus'
import type { AdminInfo } from '@/services/authService'

// 用户信息
const userInfo = ref<AdminInfo & { identity?: number }>({
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

// 处理头像路径显示
const getAvatarUrl = (avatarPath: string): string => {
  console.log('=== 头像处理开始 ===');
  console.log('原始头像路径:', avatarPath);
  console.log('当前环境:', process.env.NODE_ENV);
  
  if (!avatarPath || avatarPath === '/default-avatar.png') {
    console.log('使用默认头像');
    return defaultAvatar;
  }
  
  // 处理相对路径
  if (avatarPath.startsWith('/avatar/')) {
    // 强制使用开发环境配置进行测试
    const fullUrl = `http://localhost:8080${avatarPath}`;
    console.log('强制生成的完整 URL:', fullUrl);
    console.log('=== 头像处理结束 ===');
    return fullUrl;
  }
  
  // 如果已经是完整 URL，直接返回
  if (avatarPath.startsWith('http')) {
    console.log('已经是完整 URL，直接返回');
    return avatarPath;
  }
  
  console.log('未知路径格式，使用默认头像');
  return defaultAvatar;
};

// 头像加载错误处理
const handleAvatarError = (event: Event) => {
  console.log('=== 头像加载失败 ===');
  console.log('错误事件:', event);
  const img = event.target as HTMLImageElement;
  console.log('当前图片 src:', img.src);
  console.log('切换到默认头像:', defaultAvatar);
  img.src = defaultAvatar;
  ElMessage.warning('头像加载失败，显示默认头像');
};

// 编辑状态
const isEditing = reactive({
  phone: false,
  email: false
});

// 编辑表单
const editForm = reactive({
  phone: '',
  email: ''
});

// 修改密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 登录历史
const loginHistory = ref<any[]>([]);

// 对话框状态
const passwordDialogVisible = ref(false);
const loginHistoryDialogVisible = ref(false);

// 表单引用
const passwordFormRef = ref<FormInstance>();

// 密码表单验证规则
const passwordRules = reactive<FormRules>({
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
});

// 获取角色标签类型
const getRoleTagType = (roleName: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    admin: 'danger',
    manager: 'warning',
    cashier: 'success',
    pharmacist: 'primary',
    user: 'info' // 普通用户使用 info 样式
  }
  console.log('获取角色标签类型:', roleName, '->', typeMap[roleName] || 'info');
  return typeMap[roleName] || 'info'; // 默认返回 info 而不是空字符串
}

// 时间格式化函数
const formatTime = (dateValue: any): string => {
  if (!dateValue) return '-';
  
  // 处理数组格式 [年，月，日，时，分，秒]
  if (Array.isArray(dateValue) && dateValue.length >= 3) {
    const year = dateValue[0];
    const month = String(dateValue[1]).padStart(2, '0'); // 月份不需要减 1
    const day = String(dateValue[2]).padStart(2, '0');
    const hour = dateValue.length > 3 ? String(dateValue[3]).padStart(2, '0') : '00';
    const minute = dateValue.length > 4 ? String(dateValue[4]).padStart(2, '0') : '00';
    const second = dateValue.length > 5 ? String(dateValue[5]).padStart(2, '0') : '00';
    
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }
  
  // 处理字符串格式
  if (typeof dateValue === 'string') {
    return dateValue;
  }
  
  // 处理 Date 对象
  if (dateValue instanceof Date) {
    return dateValue.toLocaleString();
  }
  
  return '-';
}

// 保留旧的 formatDate 函数用于兼容性，内部调用 formatTime
const formatDate = (dateValue: any): string => {
  return formatTime(dateValue);
}

/**
 * 加载用户信息
 * 使用 userService.getCurrentUserProfile() 获取当前用户信息
 */
const loadUserInfo = async () => {
  try {
    console.log('=== 开始加载用户信息 ===');
    
    // 调用用户服务获取当前用户信息
    const response = await adminService.getCurrentAdminProfile();
    console.log('原始 API 响应:', response);
    console.log('admin头像字段:', response.avatar);
    console.log('admin identity 字段:', response.identity);
    console.log('admin createTime 字段:', response.createTime);
    console.log('=== 调试信息 ===');
    console.log('response 对象所有属性:', Object.keys(response));
    console.log('response.createTime 是否存在:', 'createTime' in response);
    console.log('response.createTime 值:', response.createTime);
    console.log('response.lastLoginTime 是否存在:', 'lastLoginTime' in response);
    console.log('response.lastLoginTime 值:', response.lastLoginTime);
    
    // 根据 identity 字段动态生成角色信息
    let roles = [];
    if (response.identity === 1) {
      roles = [{
        id: 1,
        name: 'admin',
        displayName: '管理员'
      }];
    } else {
      roles = [{
        id: 2,
        name: 'user', 
        displayName: '普通用户'
      }];
    }
    
    // 直接使用后端返回的数据结构
    userInfo.value = {
      id: response.id || 0,
      username: response.username || '未设置',
      name: response.name || response.username || '未设置',
      phone: response.phone || '未设置',
      email: response.email || '未设置',
      avatar: response.avatar || '/default-avatar.png',
      roles: roles,
      createTime: response.createTime, // 使用映射后的字段
      lastLoginTime: response.lastLoginTime, // 使用映射后的字段
      identity: response.identity
    } as AdminInfo;
    
    console.log('=== 用户信息加载完成 ===');
    console.log('最终 userInfo:', userInfo.value);
  } catch (error: any) {
    console.error('=== 加载用户信息失败 ===');
    console.error('错误对象:', error);
    console.error('错误详情:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });
    
    // 根据不同错误类型显示不同消息
    if (error.response?.status === 404) {
      ElMessage.error('API 接口未找到，请检查后端服务是否启动在正确端口');
    } else if (error.response?.status === 401) {
      ElMessage.error('未授权访问，请重新登录');
    } else {
      ElMessage.error(`加载用户信息失败：${error.message}`);
    }
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

/**
 * 保存手机号
 * 调用 adminService.updatePhone() 更新管理员手机号
 */
const savePhone = async () => {
  if (!/^1[3-9]\d{9}$/.test(editForm.phone)) {
    ElMessage.error('请输入正确的手机号')
    return
  }
  
  try {
    await adminService.updatePhone(editForm.phone)
    
    userInfo.value.phone = editForm.phone
    isEditing.phone = false
    ElMessage.success('手机号更新成功')
  } catch (error) {
    ElMessage.error('手机号更新失败')
    console.error(error)
  }
}

/**
 * 保存邮箱
 * 调用 adminService.updateEmail() 更新管理员邮箱
 */
const saveEmail = async () => {
  if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(editForm.email)) {
    ElMessage.error('请输入正确的邮箱地址')
    return
  }
  
  try {
    await adminService.updateEmail(editForm.email)
    
    userInfo.value.email = editForm.email
    isEditing.email = false
    ElMessage.success('邮箱更新成功')
  } catch (error) {
    ElMessage.error('邮箱更新失败')
    console.error(error)
  }
}

/**
 * 更换头像
 * 调用 adminService.uploadAvatar() 上传管理员头像
 */
const changeAvatar = async () => {
  // 创建文件选择输入框
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
      try {
        const response = await adminService.uploadAvatar(file)
        userInfo.value.avatar = response.avatarUrl
        ElMessage.success('头像更新成功')
      } catch (error) {
        ElMessage.error('头像上传失败')
        console.error(error)
      }
    }
  }
  input.click()
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

/**
 * 修改密码
 * 调用 adminService.changePassword() 修改管理员密码
 */
const changePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await adminService.changePassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
          confirmNewPassword: passwordForm.confirmPassword
          
        })
        
        ElMessage.success('密码修改成功，请重新登录')
        passwordDialogVisible.value = false
        
        // 登出用户，要求重新登录
        setTimeout(async () => {
          await adminService.logout()
          await authService.logout() // 确保本地状态也被清除
          window.location.href = '/login'
        }, 1500)
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

/**
 * 查看登录历史
 * 调用 adminService.getLoginHistory() 获取管理员登录历史
 */
const viewLoginHistory = async () => {
  try {
    console.log('开始获取登录历史...');
    const response = await adminService.getLoginHistory();
    console.log('登录历史原始响应:', response);
    
    // 处理后端返回的包装格式 {code: 1, msg: null, data: [...]}
    let historyData = [];
    if (response && response.code === 1 && Array.isArray(response.data)) {
      historyData = response.data;
      console.log('提取的登录历史数据:', historyData);
    } else if (Array.isArray(response)) {
      // 如果直接返回数组格式
      historyData = response;
      console.log('直接数组格式的登录历史数据:', historyData);
    }
    
    // 映射后端数据到前端接口格式
    loginHistory.value = historyData.map((item: any) => ({
      id: item.id,
      loginTime: item.loginTime, // 保持原始时间数组格式，由 formatDate 处理
      ipAddress: item.ip || item.ipAddress || '未知 IP',
      userAgent: item.deviceInfo || item.userAgent || '未知设备',
      status: item.status === '成功' ? 1 : 0 // 后端返回字符串"成功"/"失败"
    }));
    
    console.log('处理后的登录历史:', loginHistory.value);
    
    loginHistoryDialogVisible.value = true;
  } catch (error) {
    console.error('加载登录历史失败:', error);
    ElMessage.error('加载登录历史失败');
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