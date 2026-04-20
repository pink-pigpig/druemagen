<template>
  <div class="login-container">
    <!-- 背景图层 -->
    <div class="background-layer">
      <!-- 背景图片 - 使用内联样式直接引用 public 目录的图片 -->
      <div class="background-image" :style="{ backgroundImage: 'url(/img/background.png)' }"></div>
      <!-- 半透明遮罩层 -->
      <div class="background-overlay"></div>
    </div>

    <!-- 内容图层 -->
    <div class="content-layer">
      <div class="login-form">
        <h2>用户登录</h2>
        <el-form :model="loginForm" label-position="top" @submit.prevent="handleLogin">
          <el-form-item label="登录角色">
            <el-select v-model="loginForm.role" placeholder="请选择登录角色" style="width: 100%">
              <el-option label="普通用户" value="user"></el-option>
              <el-option label="管理员" value="admin"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="用户名">
            <el-input 
              v-model="loginForm.username" 
              placeholder="请输入用户名"
              clearable
            />
          </el-form-item>
          
          <el-form-item label="密码">
            <el-input 
              v-model="loginForm.password" 
              type="password"
              placeholder="请输入密码"
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
            :loading="loading"
            style="width: 100%; margin-top: 20px"
          >
            登录
          </el-button>
        </el-form>
        
        <div class="login-footer">
          <p>还没有账号？<router-link to="/register">立即注册</router-link></p>
        </div>
      </div>
    </div>
  </div>

  <!-- 登录成功弹窗 -->
  <el-dialog
    v-model="dialogVisible"
    title="登录成功"
    width="500"
    :before-close="handleClose"
  >
    <span>登录成功！正在跳转...</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleDialogConfirm">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessageBox } from 'element-plus'
import { useStore } from 'vuex'

const router = useRouter()
const store = useStore()

const loginForm = reactive({
  role: 'user',
  username: '',
  password: ''
})

const loading = ref(false)
const errorMessage = ref('')
const dialogVisible = ref(false)

// 计算属性：根据角色确定登录API端点
const loginEndpoint = computed(() => {
  return loginForm.role === 'admin' 
    ? '/api/admin/login' 
    : '/api/users/login'
})

const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    errorMessage.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    console.log('开始登录请求...')
    const response = await axios.post(loginEndpoint.value, {
      username: loginForm.username,
      password: loginForm.password
    })
    
    console.log('登录响应:', response)
    console.log('响应数据结构:', response.data)
    
    if (response.status === 200) {
      // 保存token到localStorage
      // 后端返回格式: { code: 1, msg: null, data: { id, userName, name, token, avatar } }
      const responseData = response.data.data || response.data;
      console.log('实际业务数据:', responseData);
      
      let tokenToStore = null
      
      // 检查不同的token位置
      if (responseData && responseData.token) {
        tokenToStore = responseData.token
        console.log('从 responseData.token 获取token:', tokenToStore)
      }
      
      if (tokenToStore) {
        localStorage.setItem('token', tokenToStore)
        localStorage.setItem('userRole', loginForm.role)
        console.log('token已存储到localStorage:', localStorage.getItem('token'))
        
        // 构造完整的用户信息对象并保存到 store
        // 注意：后端 name 可能为 null，需要使用降级策略显示 userName
        const userData = { 
          id: responseData.id,
          username: responseData.userName,
          name: responseData.name || responseData.userName, // 降级策略：name为空时使用userName
          avatar: responseData.avatar || '/default-avatar.png',
          phone: responseData.phone || '',
          email: responseData.email || '',
          roles: [],
          createTime: responseData.createTime || '',
          lastLoginTime: responseData.lastLoginTime || ''
        };
        
        // 保存到 Vuex store
        store.dispatch('login', {
          token: tokenToStore,
          user: userData
        });
        console.log('用户信息已存储到store:', userData);
      } else {
        console.error('未找到token!', responseData)
        errorMessage.value = '登录成功但未收到token'
        return
      }
      
      // 显示成功弹窗
      dialogVisible.value = true
      
      // 根据角色跳转到不同页面
      setTimeout(() => {
        if (loginForm.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/user')
        }
      }, 1500)
    } else {
      errorMessage.value = response.data?.message || '登录失败'
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '登录失败，请检查用户名和密码'
    console.error('登录错误:', error)
    console.error('错误详情:', error.response)
  } finally {
    loading.value = false
  }
}

// 弹窗关闭前的确认处理函数
const handleClose = (done) => {
  ElMessageBox.confirm('确定要关闭这个对话框吗？')
    .then(() => {
      done()
    })
    .catch(() => {
      // 取消关闭
    })
}

// 弹窗确认按钮处理函数
const handleDialogConfirm = () => {
  dialogVisible.value = false
  if (loginForm.role === 'admin') {
    router.push('/admin')
  } else {
    router.push('/user')
  }
}
</script>

<style lang="scss" scoped>
.login-container {
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
  
  .login-form {
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
    
    .login-footer {
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
  .login-form {
    padding: 2rem 1.5rem !important;
    max-width: 90% !important;
    
    h2 {
      font-size: 24px !important;
    }
  }
}
</style>