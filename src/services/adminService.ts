import { apiClient } from '@/services/authService'
import type { AdminInfo } from '@/services/authService'

/**
 * 管理员用户接口
 */
export interface AdminUser {
  id: number
  username: string
  name?: string
  phone?: string
  email?: string
  avatar?: string
  role: string
  status: number // 0: 禁用，1: 启用
  identity?: number
  createdAt?: string | number[]
  updatedAt?: string | number[]
}

/**
 * 角色信息接口
 */
export interface Role {
  id: number
  name: string
  description?: string
  status: number // 1: 启用，0: 禁用
  userCount?: number
  createdAt?: string | number[]
  permissions?: Permission[]
}

/**
 * 权限信息接口
 */
export interface Permission {
  id: number
  name: string
  label?: string
  type?: 'menu' | 'button' | 'api'
  parentId?: number
  path?: string
  children?: Permission[]
}

/**
 * 分页参数接口
 */
export interface PageParams {
  page: number
  size: number
  keyword?: string
}

/**
 * 分页结果接口
 */
export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

/**
 * 重置密码请求接口
 */
export interface ResetPasswordRequest {
  password: string
}

/**
 * 角色保存请求接口
 */
export interface SaveRoleRequest {
  name: string
  description?: string
  status?: number
  permissionIds?: number[]
}

/**
 * 管理员服务
 * 提供所有管理后台相关的 API 调用方法
 */
export const adminService = {
  // 获取当前admin信息
  async getCurrentAdminProfile(): Promise<AdminInfo> {
      console.log('请求用户信息 API: api/admin/profile')
      try {
        const response = await apiClient.get('api/admin/profile')
        console.log('原始 API 响应:', response)
        const adminData = response.data.data || response.data
        console.log('=== AdminService 调试信息 ===');
        console.log('完整响应:', response);
        console.log('提取的admin数据:', adminData);
        console.log('userData 所有属性:', Object.keys(adminData));
        console.log('userData.createdAt 是否存在:', 'createdAt' in adminData);
        console.log('userData.createdAt 值:', adminData.createdAt);
        console.log('userData.updatedAt 是否存在:', 'updatedAt' in adminData);
        console.log('userData.updatedAt 值:', adminData.updatedAt);
        // 根据 identity 字段设置角色
        let roleName = '店员'
        let roleDisplayName = '店员'
        if (adminData.identity === 1) {
          roleName = 'admin'
          roleDisplayName = '管理员'
        }
        console.log('创建时间数据:', adminData.createdAt);
        console.log('更新时间数据:', adminData.updatedAt);
        return {
          id: adminData.id || 0,
          username: adminData.username || '未设置',
          name: adminData.name || adminData.username || '未设置',
          phone: adminData.phone || '未设置',
          email: adminData.email || '未设置',
          avatar: adminData.avatar || '/default-avatar.png',
          roles: [{
            id: 1,
            name: roleName,
            displayName: roleDisplayName
          }],
          // 正确的字段映射：后端字段 -> 接口要求字段
          createTime: adminData.createdAt, // 后端 createdAt -> 接口 createTime
          lastLoginTime: adminData.updatedAt, // 后端 updatedAt -> 接口 lastLoginTime
          identity: adminData.identity // 保存身份标识
        }
      } catch (error: any) {
        console.error('用户信息 API 请求失败:', error)
        throw error
      }
  },
  
  /**
   * 获取所有用户列表（分页）
   * GET /api/admin/manageusers
   * 
   * @param params - 分页和查询参数
   * @returns 分页的用户列表
   */
  async getAllUsers(params: PageParams): Promise<PageResult<AdminUser>> {
    try {
      console.log('请求管理员用户列表 API: /api/admin/manageusers', params)
      const response = await apiClient.get('/api/admin/manageusers', { params })
      console.log('管理员用户列表响应:', response)
      
      // 处理后端返回的包装格式 {code: 1, msg: null, data: {...}}
      const resultData = response.data?.data || response.data
      return resultData
    } catch (error: any) {
      console.error('获取用户列表失败:', error)
      throw error
    }
  },

  /**
   * 创建新用户
   * POST /api/admin/users
   * 
   * @param user - 用户信息（不包含 id、createdAt、updatedAt）
   * @returns 创建的用户信息
   */
  async createUser(user: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminUser> {
    try {
      console.log('创建新用户 API: /api/admin/users', user)
      const response = await apiClient.post('/api/admin/users', user)
      console.log('创建用户响应:', response)
      
      const userData = response.data?.data || response.data
      return userData
    } catch (error: any) {
      console.error('创建用户失败:', error)
      throw error
    }
  },

  /**
   * 更新用户信息
   * PUT /api/admin/users/{id}
   * 
   * @param id - 用户 ID
   * @param user - 要更新的用户信息
   * @returns 更新后的用户信息
   */
  async updateUser(id: number, user: Partial<AdminUser>): Promise<AdminUser> {
    try {
      console.log(`更新用户信息 API: /api/admin/users/${id}`, user)
      const response = await apiClient.put(`/api/admin/users/${id}`, user)
      console.log('更新用户响应:', response)
      
      const userData = response.data?.data || response.data
      return userData
    } catch (error: any) {
      console.error(`更新用户 ${id} 失败:`, error)
      throw error
    }
  },

  /**
   * 删除用户
   * DELETE /api/admin/users/{id}
   * 
   * @param id - 用户 ID
   */
  async deleteUser(id: number): Promise<void> {
    try {
      console.log(`删除用户 API: /api/admin/users/${id}`)
      await apiClient.delete(`/api/admin/users/${id}`)
      console.log('用户删除成功')
    } catch (error: any) {
      console.error(`删除用户 ${id} 失败:`, error)
      throw error
    }
  },

  /**
   * 启用用户
   * PUT /api/admin/users/{id}/enable
   * 
   * @param id - 用户 ID
   * @returns 更新后的用户信息
   */
  async enableUser(id: number): Promise<AdminUser> {
    try {
      console.log(`启用用户 API: /api/admin/users/${id}/enable`)
      const response = await apiClient.put(`/api/admin/users/${id}/enable`)
      console.log('启用用户响应:', response)
      
      const userData = response.data?.data || response.data
      return userData
    } catch (error: any) {
      console.error(`启用用户 ${id} 失败:`, error)
      throw error
    }
  },

  /**
   * 禁用用户
   * PUT /api/admin/users/{id}/disable
   * 
   * @param id - 用户 ID
   * @returns 更新后的用户信息
   */
  async disableUser(id: number): Promise<AdminUser> {
    try {
      console.log(`禁用用户 API: /api/admin/users/${id}/disable`)
      const response = await apiClient.put(`/api/admin/users/${id}/disable`)
      console.log('禁用用户响应:', response)
      
      const userData = response.data?.data || response.data
      return userData
    } catch (error: any) {
      console.error(`禁用用户 ${id} 失败:`, error)
      throw error
    }
  },

  /**
   * 重置用户密码
   * PATCH /api/admin/users/{id}/password
   * 
   * @param id - 用户 ID
   * @param request - 新密码请求
   */
  async resetPassword(id: number, request: ResetPasswordRequest): Promise<void> {
    try {
      console.log(`重置用户密码 API: /api/admin/users/${id}/password`, request)
      await apiClient.patch(`/api/admin/users/${id}/password`, request)
      console.log('密码重置成功')
    } catch (error: any) {
      console.error(`重置用户 ${id} 密码失败:`, error)
      throw error
    }
  },

  /**
   * 搜索用户（带关键字）
   * GET /api/admin/manageusers?keyword=xxx
   * 
   * @param keyword - 搜索关键字（用户名/姓名/手机号）
   * @param params - 可选的分页参数
   * @returns 分页的用户列表
   */
  async searchUsers(keyword: string, params?: Omit<PageParams, 'keyword'>): Promise<PageResult<AdminUser>> {
    try {
      const searchParams = {
        page: params?.page || 1,
        size: params?.size || 10,
        keyword
      }
      console.log('搜索用户 API: /api/admin/manageusers', searchParams)
      const response = await apiClient.get('/api/admin/manageusers', { params: searchParams })
      
      const resultData = response.data?.data || response.data
      return resultData
    } catch (error: any) {
      console.error('搜索用户失败:', error)
      throw error
    }
  },

  /**
   * 更新管理员手机号
   * PUT /api/admin/profile/phone
   */
  async updatePhone(phone: string): Promise<AdminInfo> {
    try {
      console.log('更新管理员手机号 API: /api/admin/profile/phone')
      const response = await apiClient.put('/api/admin/profile/phone', { phone })
      console.log('更新手机号响应:', response)
      
      const adminData = response.data?.data || response.data
      return adminData
    } catch (error: any) {
      console.error('更新手机号失败:', error)
      throw error
    }
  },

  /**
   * 更新管理员邮箱
   * PUT /api/admin/profile/email
   */
  async updateEmail(email: string): Promise<AdminInfo> {
    try {
      console.log('更新管理员邮箱 API: /api/admin/profile/email')
      const response = await apiClient.put('/api/admin/profile/email', { email })
      console.log('更新邮箱响应:', response)
      
      const adminData = response.data?.data || response.data
      return adminData
    } catch (error: any) {
      console.error('更新邮箱失败:', error)
      throw error
    }
  },

  /**
   * 上传管理员头像
   * POST /api/admin/profile/avatar
   */
  async uploadAvatar(file: File): Promise<{ avatarUrl: string; message: string }> {
    const formData = new FormData()
    formData.append('avatar', file)
    
    try {
      console.log('上传管理员头像 API: /api/admin/profile/avatar')
      const response = await apiClient.post('/api/admin/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      console.log('上传头像响应:', response)
      
      const responseData = response.data?.data || response.data
      return {
        avatarUrl: responseData.avatarUrl || responseData.url || responseData,
        message: '头像上传成功'
      }
    } catch (error: any) {
      console.error('上传头像失败:', error)
      throw error
    }
  },

  /**
   * 修改管理员密码
   * PUT /api/admin/profile/password
   */
  async changePassword(request: { oldPassword: string; newPassword: string; confirmNewPassword: string }): Promise<void> {
    try {
      console.log('修改管理员密码 API: /api/admin/profile/password')
      await apiClient.put('/api/admin/profile/password', request)
      console.log('密码修改成功')
    } catch (error: any) {
      console.error('密码修改失败:', error)
      throw error
    }
  },

  /**
   * 获取管理员登录历史
   * GET /api/admin/login-history
   */
  async getLoginHistory(): Promise<any> {
    try {
      console.log('请求管理员登录历史 API: /api/admin/login-history')
      const response = await apiClient.get('/api/admin/login-history')
      console.log('管理员登录历史原始响应:', response)
      
      // 处理后端返回的包装格式 {code: 1, msg: null, data: [...]}
      if (response.data && response.data.code === 1 && Array.isArray(response.data.data)) {
        console.log('成功提取管理员登录历史数据:', response.data.data)
        return response.data
      } else if (Array.isArray(response.data)) {
        return { code: 1, data: response.data }
      } else {
        console.warn('管理员登录历史 API 响应格式不符合预期:', response.data)
        return { code: 1, data: [] }
      }
    } catch (error: any) {
      console.error('管理员登录历史 API 请求失败:', error)
      throw error
    }
  },

  /**
   * 管理员登出
   * POST /api/admin/logout
   */
  async logout(): Promise<void> {
    try {
      console.log('管理员登出 API: /api/admin/logout')
      await apiClient.post('/api/admin/logout')
      console.log('管理员登出成功')
    } catch (error: any) {
      console.error('管理员登出失败:', error)
      throw error
    }
  },

  /**
   * 获取所有角色列表
   * GET /api/admin/roles
   */
  async getAllRoles(): Promise<Role[]> {
    try {
      console.log('请求角色列表 API: /api/admin/roles')
      const response = await apiClient.get('/api/admin/roles')
      console.log('角色列表响应:', response)
      
      const resultData = response.data?.data || response.data
      return Array.isArray(resultData) ? resultData : []
    } catch (error: any) {
      console.error('获取角色列表失败:', error)
      throw error
    }
  },

  /**
   * 创建新角色
   * POST /api/admin/roles
   */
  async createRole(role: SaveRoleRequest): Promise<Role> {
    try {
      console.log('创建角色 API: /api/admin/roles', role)
      const response = await apiClient.post('/api/admin/roles', role)
      console.log('创建角色响应:', response)
      
      const roleData = response.data?.data || response.data
      return roleData
    } catch (error: any) {
      console.error('创建角色失败:', error)
      throw error
    }
  },

  /**
   * 更新角色信息
   * PUT /api/admin/roles/{id}
   */
  async updateRole(id: number, role: Partial<SaveRoleRequest>): Promise<Role> {
    try {
      console.log(`更新角色信息 API: /api/admin/roles/${id}`, role)
      const response = await apiClient.put(`/api/admin/roles/${id}`, role)
      console.log('更新角色响应:', response)
      
      const roleData = response.data?.data || response.data
      return roleData
    } catch (error: any) {
      console.error(`更新角色 ${id} 失败:`, error)
      throw error
    }
  },

  /**
   * 删除角色
   * DELETE /api/admin/roles/{id}
   */
  async deleteRole(id: number): Promise<void> {
    try {
      console.log(`删除角色 API: /api/admin/roles/${id}`)
      await apiClient.delete(`/api/admin/roles/${id}`)
      console.log('角色删除成功')
    } catch (error: any) {
      console.error(`删除角色 ${id} 失败:`, error)
      throw error
    }
  },

  /**
   * 获取角色的权限列表
   * GET /api/admin/roles/{id}/permissions
   */
  async getRolePermissions(id: number): Promise<Permission[]> {
    try {
      console.log(`获取角色权限 API: /api/admin/roles/${id}/permissions`)
      const response = await apiClient.get(`/api/admin/roles/${id}/permissions`)
      console.log('角色权限响应:', response)
      
      const permissionsData = response.data?.data || response.data
      return Array.isArray(permissionsData) ? permissionsData : []
    } catch (error: any) {
      console.error(`获取角色 ${id} 权限失败:`, error)
      throw error
    }
  },

  /**
   * 保存角色的权限配置
   * POST /api/admin/roles/{id}/permissions
   */
  async saveRolePermissions(id: number, permissionIds: number[]): Promise<void> {
    try {
      console.log(`保存角色权限 API: /api/admin/roles/${id}/permissions`, permissionIds)
      await apiClient.post(`/api/admin/roles/${id}/permissions`, { permissionIds })
      console.log('角色权限保存成功')
    } catch (error: any) {
      console.error(`保存角色 ${id} 权限失败:`, error)
      throw error
    }
  },

  /**
   * 获取所有权限树
   * GET /api/admin/permissions/tree
   */
  async getPermissionTree(): Promise<Permission[]> {
    try {
      console.log('获取权限树 API: /api/admin/permissions/tree')
      const response = await apiClient.get('/api/admin/permissions/tree')
      console.log('权限树响应:', response)
      
      const permissionsData = response.data?.data || response.data
      return Array.isArray(permissionsData) ? permissionsData : []
    } catch (error: any) {
      console.error('获取权限树失败:', error)
      throw error
    }
  }
}
