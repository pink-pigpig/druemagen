<!-- src/views/Login.vue -->
<template>
  <div class="login-container">
    <div class="login-form">
      <h2>用户登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="loginForm.username" 
            placeholder="请输入用户名"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="loginForm.password" 
            placeholder="请输入密码"
            required
          />
        </div>
        
        <button type="submit" class="login-button">登录</button>
      </form>
      
      <div class="login-footer">
        <p>还没有账号？<router-link to="/register">立即注册</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios' // 需要引入axios

const router = useRouter()

const loginForm = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  try {
    const response = await axios.post('/api/users/login', {
      username: loginForm.username,
      password: loginForm.password
    })
    
      // 处理登录响应
    if (response.data.code === 1) { // 假设1表示成功
      const userData = response.data.data
      console.log('登录成功:', userData)
      alert('登录成功')
      
      // 存储JWT token（可以存到localStorage或sessionStorage）
      localStorage.setItem('userToken', userData.token)
      localStorage.setItem('userId', userData.id)
      localStorage.setItem('username', userData.userName)
      
      // 跳转到用户页面
      router.push('/user')
    } else {
      console.error('登录失败:', response.data.msg)
      // 可以添加错误提示
    }
  } catch (error) {
    console.error('登录请求失败:', error)
    // 可以添加网络错误提示
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
    
    .form-group {
      margin-bottom: 1rem;
      
      label {
        display: block;
        margin-bottom: 0.5rem;
        text-align: left;
        color: #2c3e50;
      }
      
      input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        box-sizing: border-box;
        
        &:focus {
          outline: none;
          border-color: #42b983;
        }
      }
    }
    
    .login-button {
      width: 100%;
      padding: 0.75rem;
      background-color: #42b983;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 1rem;
      
      &:hover {
        background-color: #359c6d;
      }
    }
    
    .login-footer {
      margin-top: 1.5rem;
      text-align: center;
      
      a {
        color: #42b983;
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>