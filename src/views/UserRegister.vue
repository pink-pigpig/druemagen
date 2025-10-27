<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessageBox } from 'element-plus'

const router = useRouter()

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  userType: 'user' // 添加默认用户类型
})

// 控制弹窗显示的响应式变量
const dialogVisible = ref(false)
// 错误信息
const errorMessage = ref('')

// 计算属性：根据用户类型确定API端点
const registerEndpoint = computed(() => {
  return registerForm.userType === 'admin' 
    ? '/api/admin/register' 
    : '/api/users/register'
})

const handleRegister = async () => {
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
  } catch (error) {
    errorMessage.value = error.response?.data || '注册失败'
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
  router.push('/login')
}
</script>

<template>
  <div class="register-container">
    <div class="register-form">
      <h2>用户注册</h2>
      <form @submit.prevent="handleRegister">
        
        <!-- 添加用户类型选择 -->
        <div class="form-group">
          <label for="userType">注册类型</label>
          <select 
            id="userType" 
            v-model="registerForm.userType"
          >
            <option value="user">普通用户</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="registerForm.username" 
            placeholder="请输入用户名"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="email">邮箱</label>
          <input 
            type="email" 
            id="email" 
            v-model="registerForm.email" 
            placeholder="请输入邮箱"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="registerForm.password" 
            placeholder="请输入密码"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="registerForm.confirmPassword" 
            placeholder="请再次输入密码"
            required
          />
        </div>
        <!-- 显示错误信息 -->
         <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <button type="submit" class="register-button">注册</button>
      </form>
      
      <div class="register-footer">
        <p>已有账号？<router-link to="/login">立即登录</router-link></p>
      </div>
    </div>
  </div>

  <!-- 修改为新的对话框样式 -->
  <el-dialog
    v-model="dialogVisible"
    title="注册成功"
    width="500"
    :before-close="handleClose"
  >
    <span>注册成功！您可以现在登录了。</span>
    <template #footer>
      <div class="dialog-footer">
        <!-- <el-button @click="dialogVisible = false">取消</el-button> -->
        <el-button type="primary" @click="handleDialogConfirm">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  
  .register-form {
    width: 100%;
    max-width: 400px;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    background: #fff;
    
    h2 {
      text-align: center;
      margin-bottom: 1.5rem;
      color: #2c3e50;
    }
    
    .form-group {
      margin-bottom: 1rem;
      
      label {
        display: block;
        margin-bottom: 0.5rem;
        text-align: left;
        color: #2c3e50;
      }
      
      input, select {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        box-sizing: border-box;
        
        &:focus {
          outline: none;
          border-color: #409EFF; // Element蓝色主题
        }
      }
    }
    
    .register-button {
      width: 100%;
      padding: 0.75rem;
      background-color: #409EFF; // Element蓝色主题
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 1rem;
      
      &:hover {
        background-color: #337ecc; // 深一点的蓝色
      }
    }
    
    .register-footer {
      margin-top: 1.5rem;
      text-align: center;
      
      a {
        color: #409EFF; // Element蓝色主题
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}

/* 错误信息样式 */
.error-message {
  color: #f56c6c;
  background-color: #fef0f0;
  border: 1px solid #fde2e2;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  text-align: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>