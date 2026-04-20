import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import axios from 'axios'
import 'element-plus/dist/index.css'

// 添加请求拦截器
axios.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token，统一使用 'token' 作为键名
    const token = localStorage.getItem('token')
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

/**
 * 格式化后端数组格式的时间 [年,月,日,时,分,秒]
 * @param timeArr 时间数组
 * @param separator 日期和时间的分隔符，默认空格
 * @returns 格式化后的时间字符串
 */
const formatArrayTime = (
  timeArr: number[] | undefined | null,
  separator = ' '
): string => {
  // 空值/非数组兜底
  if (!Array.isArray(timeArr) || timeArr.length < 6) {
    return '未知时间'
  }

  // 解构年、月、日、时、分、秒
  const [year, month, day, hour, minute, second] = timeArr
  // 补零函数：确保个位数补0（如 2 → 02）
  const padZero = (num: number): string => num.toString().padStart(2, '0')

  // 拼接标准格式
  const dateStr = `${year}-${padZero(month)}-${padZero(day)}`
  const timeStr = `${padZero(hour)}:${padZero(minute)}:${padZero(second)}`
  return `${dateStr}${separator}${timeStr}`
}

// 先声明app变量
const app = createApp(App)

// 解决 Vue3 + TS 中使用全局方法时的类型提示问题
declare module 'vue' {
  interface ComponentCustomProperties {
    $formatArrayTime: (timeArr: number[] | undefined | null, separator?: string) => string
  }
}

// 添加响应拦截器（可选）
axios.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response?.status === 401) {
      // token 过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('token')
      // localStorage.removeItem('userId')
      // localStorage.removeItem('username')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 创建Vue应用实例并配置全局属性
app.config.globalProperties.$formatArrayTime = formatArrayTime

// 挂载应用
app.use(store).use(router).use(ElementPlus, {
  locale: zhCn,
}).mount('#app')

// 初始化认证状态（从 localStorage 加载 token）
store.dispatch('initializeAuth')
