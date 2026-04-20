<template>
  <div class="register-container">
    <!-- 背景图层 -->
    <div class="background-layer">
      <!-- 背景图片 - 使用内联样式直接引用 public 目录的图片 -->
      <div class="background-image" :style="{ backgroundImage: 'url(/img/background.png)' }"></div>
      <!-- 半透明遮罩层 -->
      <div class="background-overlay"></div>
    </div>

    <!-- 内容图层 -->
    <div class="content-layer">
      <div class="register-form">
        <h2>用户注册</h2>
        <el-form :model="registerForm" label-position="top" @submit.prevent="handleRegister">
          
          <!-- 用户类型选择 -->
          <el-form-item label="注册类型" v-if="availableUserTypes.length > 0">
            <el-select v-model="registerForm.userType" placeholder="请选择注册类型" style="width: 100%">
              <el-option 
                v-for="type in availableUserTypes" 
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </el-form-item>
          
          <!-- 如果所有注册类型都被禁止,显示提示 -->
          <el-alert
            v-else
            title="当前系统禁止注册"
            type="warning"
            :closable="false"
            style="margin-bottom: 20px"
          >
            <template #default>
              系统管理员已关闭所有类型的注册功能,请联系管理员获取账号。
            </template>
          </el-alert>
          
          <el-form-item label="用户名">
            <el-input 
              v-model="registerForm.username" 
              placeholder="请输入用户名"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="邮箱">
            <el-input 
              v-model="registerForm.email" 
              type="email"
              placeholder="请输入邮箱"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="密码">
            <el-input 
              v-model="registerForm.password" 
              type="password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
          
          <el-form-item label="确认密码">
            <el-input 
              v-model="registerForm.confirmPassword" 
              type="password"
              placeholder="请再次输入密码"
              show-password
            />
          </el-form-item>
          
          <!-- 显示错误信息 -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          
          <el-button 
            type="primary" 
            native-type="submit" 
            style="width: 100%; margin-top: 20px"
          >
            注册
          </el-button>
        </el-form>
        
        <div class="register-footer">
          <p>已有账号？<router-link to="/login">立即登录</router-link></p>
        </div>
      </div>
    </div>
  </div>

  <!-- 注册成功弹窗 -->
  <el-dialog
    v-model="dialogVisible"
    title="注册成功"
    width="500"
    :before-close="handleClose"
  >
    <span>注册成功！您可以现在登录了。</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleDialogConfirm">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getSystemConfig, type SystemConfig } from '@/services/systemConfigService'

const router = useRouter()

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  userType: 'user' // 默认普通用户
})

// 控制弹窗显示的响应式变量
const dialogVisible = ref(false)
// 错误信息
const errorMessage = ref('')

// 系统配置
const systemConfig = ref<SystemConfig>({
  allowAdminRegistration: true,
  allowUserRegistration: true
})

// 加载系统配置
const loadSystemConfig = async () => {
  try {
    const config = await getSystemConfig()
    systemConfig.value = config
    
    // 如果禁止了当前选择的类型,重置为允许的类型
    if (registerForm.userType === 'admin' && !config.allowAdminRegistration) {
      registerForm.userType = 'user'
    } else if (registerForm.userType === 'user' && !config.allowUserRegistration) {
      registerForm.userType = 'admin'
    }
  } catch (error: any) {
    console.error('加载系统配置失败:', error)
    ElMessage.warning('加载系统配置失败,使用默认配置')
  }
}

// 计算属性：可用的用户类型选项
const availableUserTypes = computed(() => {
  const types = []
  if (systemConfig.value.allowUserRegistration) {
    types.push({ label: '普通用户', value: 'user' })
  }
  if (systemConfig.value.allowAdminRegistration) {
    types.push({ label: '管理员', value: 'admin' })
  }
  return types
})

// 计算属性：根据用户类型确定API端点
const registerEndpoint = computed(() => {
  return registerForm.userType === 'admin' 
    ? '/api/admin/register' 
    : '/api/users/register'
})

const handleRegister = async () => {
  // 验证是否至少有一个注册类型可用
  if (availableUserTypes.value.length === 0) {
    ElMessage.warning('当前系统禁止所有类型的注册')
    return
  }
  
  if (registerForm.password !== registerForm.confirmPassword) {
    errorMessage.value = '两次输入的密码不一致'
    return
  }

  try {
    const response = await axios.post(registerEndpoint.value, {
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password
    })
    
    if (response.status === 200) {
      // 清除错误信息并显示成功弹窗
      errorMessage.value = ''
      dialogVisible.value = true
    } else {
      errorMessage.value = response.data || '注册失败'
    }
  } catch (error: any) {
    errorMessage.value = error.response?.data?.msg || error.response?.data || '注册失败'
  }
}

const handleClose = () => {
  dialogVisible.value = false
}

const handleDialogConfirm = () => {
  dialogVisible.value = false
  router.push('/login')
}

// 组件挂载时加载系统配置
onMounted(() => {
  loadSystemConfig()
})
</script>

<style lang="scss" scoped>
.register-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  
  // 背景图层
  .background-layer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    
    .background-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      animation: backgroundZoom 20s ease-in-out infinite alternate;
    }
    
    .background-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      backdrop-filter: blur(0px);
      background: linear-gradient(135deg, rgba(66, 185, 131, 0.3) 0%, rgba(0, 181, 252, 0.3) 100%);
    }
  }
  
  // 内容图层
  .content-layer {
    position: relative;
    z-index: 1;
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 20px;
  }
  
  .register-form {
    width: 100%;
    max-width: 450px;
    padding: 3rem 2.5rem;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    animation: fadeInUp 0.8s ease-out;
    
    h2 {
      text-align: center;
      margin-bottom: 2rem;
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #42b983 0%, #00b5fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    // 统一表单间距
    :deep(.el-form-item) {
      margin-bottom: 1.2rem;
    }
    
    // 统一标签样式
    :deep(.el-form-item__label) {
      color: #2c3e50;
      font-weight: 500;
      text-align: left;
      padding: 0 0 0.5rem;
    }
    
    // 统一输入框样式
    :deep(.el-input__inner) {
      width: 100%;
      padding: 0.75rem;
      font-size: 1rem;
      box-sizing: border-box;
      
      &:focus {
        outline: none;
        border-color: #42b983;
      }
    }
    
    // 统一选择框样式
    :deep(.el-select) {
      width: 100%;
      
      .el-input__inner {
        padding: 0.75rem;
      }
    }
    
    // 统一按钮样式
    :deep(.el-button) {
      width: 100%;
      padding: 0.875rem;
      background: linear-gradient(135deg, #42b983 0%, #36a86f 100%);
      color: white;
      border: none;
      border-radius: 50px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 1.5rem;
      box-shadow: 0 4px 15px rgba(66, 185, 131, 0.4);
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(66, 185, 131, 0.6);
      }
      
      &:active {
        transform: translateY(0);
      }
    }
    
    .register-footer {
      margin-top: 2rem;
      text-align: center;
      font-size: 14px;
      color: #606266;
      
      a {
        color: #42b983;
        text-decoration: none;
        font-weight: 500;
        transition: all 0.3s ease;
        
        &:hover {
          color: #00b5fc;
          text-decoration: underline;
        }
      }
    }
  }
}

// 背景缩放动画
@keyframes backgroundZoom {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.1);
  }
}

// 淡入向上动画
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 错误信息样式 */
.error-message {
  color: #f56c6c;
  background-color: #fef0f0;
  border: 1px solid #fde2e2;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 15px;
  text-align: center;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

// 响应式设计
@media (max-width: 768px) {
  .register-form {
    padding: 2rem 1.5rem !important;
    max-width: 90% !important;
    
    h2 {
      font-size: 24px !important;
    }
  }
}
</style>