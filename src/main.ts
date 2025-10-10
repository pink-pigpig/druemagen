import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import axios from 'axios'

// 添加请求拦截器
axios.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('userToken')
    if (token) {
      // 在请求头中添加 Authorization
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 添加响应拦截器（可选）
axios.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response?.status === 401) {
      // token 过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('userToken')
      localStorage.removeItem('userId')
      localStorage.removeItem('username')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
createApp(App).use(store).use(router).use(ElementPlus, {
  locale: zhCn,
}).mount('#app')
