import axios from 'axios'
import store from '@/store'

const API_BASE_URL = '' // 根据实际情况设置基础 URL

// 创建axios实例
export const apiClient = axios.create({
  baseURL: API_BASE_URL
})

// 请求拦截器，自动添加 token
apiClient.interceptors.request.use(
  (config) => {
    const storeToken = store.state.token
    const localToken = localStorage.getItem('token')
    
    console.log('=== 请求拦截器被触发 ===')
    console.log('请求 URL:', config.url)
    console.log('Store中的 token:', storeToken ? '存在' : 'null/undefined')
    console.log('localStorage 中的 token:', localToken ? '存在' : 'null/undefined')
    
    const token = storeToken || localToken
    
    if (token) {
      console.log('使用 token 长度:', token.length)
      config.headers.Authorization = `Bearer ${token}`
      console.log('已设置 Authorization header')
    } else {
      console.warn('⚠️ 未找到 token!')
    }
    console.log('========================')
    
    return config
  },
  (error) => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器，处理未授权情况
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token过期或无效，清除本地存储并跳转到登录页
      store.dispatch('logout')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 定义用户信息接口
export interface UserInfo {
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
  // 身份标识：1-管理员，2-普通用户
  identity?: number
  // 后端可能返回的额外字段
  createdAt?: string
  updatedAt?: string
  status?: number
  password?: string
}
// 定义管理员信息接口
export interface AdminInfo {
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
  // 身份标识：1-管理员，2-普通用户
  identity?: number
  // 后端可能返回的额外字段
  createdAt?: string
  updatedAt?: string
  status?: number
  password?: string
}

// 定义登录历史接口
export interface LoginHistory {
  id: number
  loginTime: string
  ipAddress: string
  userAgent: string
  status: number // 1: 成功, 0: 失败
}

// 定义API响应接口
interface ApiResponse<T> {
  data: T
  message?: string
  code?: number
}

export const authService = {
  async login(username: string, password: string): Promise<any> {
    console.log('authService.login 被调用，参数:', { username, password })
    
    const response = await apiClient.post(`/users/login`, {
      username,
      password
    })
    
    console.log('authService login 响应:', response)
    console.log('authService 响应数据:', response.data)
    
    // 后端返回格式: { code: 1, msg: null, data: { id, userName, name, token, avatar } }
    const responseData = response.data.data || response.data;
    console.log('authService 实际业务数据:', responseData);
    
    // 保存token到store和localStorage
    let tokenToStore = null
    
    // 检查不同的token位置
    if (responseData && responseData.token) {
      tokenToStore = responseData.token
      console.log('authService: 从 responseData.token 获取token:', tokenToStore)
    }
    
    if (tokenToStore) {
      // 构造完整的用户信息对象
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
      
      store.dispatch('login', {
        token: tokenToStore,
        user: userData
      })
      console.log('authService: 用户信息已存储到store:', userData)
    } else {
      console.error('authService: 未找到token!', responseData)
    }
    
    return response.data
  },
  
  // 获取用户信息
  async getProfile(): Promise<UserInfo> {
    const response = await apiClient.get<UserInfo>('/users/profile')
    // 更新store中的用户信息
    store.commit('SET_USER', response.data)
    return response.data
  },
  
  // 更新手机号
  async updatePhone(phone: string): Promise<any> {
    const response = await apiClient.put('/users/profile/phone', { phone })
    // 更新store中的用户信息
    if (store.state.user) {
      store.commit('SET_USER', { ...store.state.user as UserInfo, phone })
    }
    return response.data
  },
  
  // 更新邮箱
  async updateEmail(email: string): Promise<any> {
    const response = await apiClient.put('/users/profile/email', { email })
    // 更新store中的用户信息
    if (store.state.user) {
      store.commit('SET_USER', { ...store.state.user as UserInfo, email })
    }
    return response.data
  },
  
  // 更新密码
  async updatePassword(oldPassword: string, newPassword: string): Promise<any> {
    const response = await apiClient.put('/users/profile/password', {
      oldPassword,
      newPassword
    })
    return response.data
  },
  
  // 获取登录历史
  async getLoginHistory(): Promise<ApiResponse<LoginHistory[]>> {
    const response = await apiClient.get<ApiResponse<LoginHistory[]>>('/users/login-history')
    return response.data
  },
  
  // 登出
  async logout(): Promise<void> {
    try {
      await apiClient.post('/users/logout')
    } catch (error) {
      console.error('登出请求失败:', error)
    }
    store.dispatch('logout')
  },
  
  // 检查是否已登录
  isLoggedIn(): boolean {
    return !!store.getters.isAuthenticated
  }
}