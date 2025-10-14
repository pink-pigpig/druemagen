<template>
  <div class="login-container">
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
        
        <el-button 
          type="primary" 
          native-type="submit" 
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
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const loginForm = reactive({
  role: 'user',
  username: '',
  password: ''
})

const handleLogin = async () => {
  try {
    let apiUrl = '';
    
    // 根据选择的角色确定API端点
    if (loginForm.role === 'admin') {
      apiUrl = '/api/admin/login';
    } else {
      apiUrl = '/api/users/login';
    }
    
    const response = await axios.post(apiUrl, {
      username: loginForm.username,
      password: loginForm.password
    })
    
    // 处理登录响应
    if (response.data.code === 1) { // 假设1表示成功
      const userData = response.data.data
      console.log('登录成功:', userData)
      
      // 存储JWT token和用户信息
      localStorage.setItem('userToken', userData.token)
      localStorage.setItem('userId', userData.id)
      localStorage.setItem('username', userData.userName)
      localStorage.setItem('userRole', loginForm.role) // 存储用户角色
      
      // 根据角色跳转到不同页面
      if (loginForm.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/user')
      }
    } else {
      console.error('登录失败:', response.data.msg)
      alert(`登录失败: ${response.data.msg}`)
    }
  } catch (error) {
    console.error('登录请求失败:', error)
    alert('登录请求失败')
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  
  .login-form {
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
    
    .login-footer {
      margin-top: 1.5rem;
      text-align: center;
      
      a {
        color: #409eff;
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>