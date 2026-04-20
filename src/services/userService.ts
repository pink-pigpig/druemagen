import { apiClient } from '@/services/authService'
import type { UserInfo, LoginHistory } from '@/services/authService'

// 定义用户服务接口
export interface UpdateUserInfo {
  name?: string
  phone?: string
  email?: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
  confirmNewPassword: string
}

export interface UploadAvatarResponse {
  avatarUrl: string
  message: string
}

export const userService = {
  // 获取当前用户信息
  async getCurrentUserProfile(): Promise<UserInfo> {
    console.log('请求用户信息API: api/users/profile')
    try {
      const response = await apiClient.get('api/users/profile')
      console.log('原始API响应:', response)
      
      // 修正：后端返回的是Result包装格式
      const userData = response.data.data || response.data
      console.log('=== UserService调试信息 ===');
      console.log('完整响应:', response);
      console.log('提取的用户数据:', userData);
      console.log('userData所有属性:', Object.keys(userData));
      console.log('userData.createdAt是否存在:', 'createdAt' in userData);
      console.log('userData.createdAt值:', userData.createdAt);
      console.log('userData.updatedAt是否存在:', 'updatedAt' in userData);
      console.log('userData.updatedAt值:', userData.updatedAt);
      
      // 根据identity字段设置角色
      let roleName = '店员'
      let roleDisplayName = '店员'
      if (userData.identity === 1) {
        roleName = 'admin'
        roleDisplayName = '管理员'
      }
      console.log('创建时间数据:', userData.createdAt);
      console.log('更新时间数据:', userData.updatedAt);
      
      return {
        id: userData.id || 0,
        username: userData.username || '未设置',
        name: userData.name || userData.username || '未设置',
        phone: userData.phone || '未设置',
        email: userData.email || '未设置',
        avatar: userData.avatar || '/default-avatar.png',
        roles: [{
          id: 1,
          name: roleName,
          displayName: roleDisplayName
        }],
        // 正确的字段映射：后端字段 -> 接口要求字段
        createTime: userData.createdAt, // 后端createdAt -> 接口createTime
        lastLoginTime: userData.updatedAt, // 后端updatedAt -> 接口lastLoginTime
        identity: userData.identity // 保存身份标识
      }
    } catch (error: any) {
      console.error('用户信息API请求失败:', error)
      throw error
    }
  },

  // 更新用户基本信息
  async updateUserInfo(userInfo: UpdateUserInfo): Promise<UserInfo> {
    const response = await apiClient.put<UserInfo>('api/users/profile', userInfo)
    return response.data
  },

  // 更新手机号
  async updatePhone(phone: string): Promise<UserInfo> {
    const response = await apiClient.put<UserInfo>('api/users/profile/phone', { phone })
    return response.data
  },

  // 更新邮箱
  async updateEmail(email: string): Promise<UserInfo> {
    const response = await apiClient.put<UserInfo>('api/users/profile/email', { email })
    return response.data
  },

  // 修改密码
  async changePassword(request: ChangePasswordRequest): Promise<void> {
    await apiClient.put('api/users/profile/password', request)
  },

  // 上传头像
  async uploadAvatar(file: File): Promise<UploadAvatarResponse> {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const response = await apiClient.post<UploadAvatarResponse>('api/users/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // 获取登录历史
  async getLoginHistory(): Promise<any> {
    try {
      console.log('请求登录历史API: /users/login-history');
      const response = await apiClient.get('api/users/login-history');
      console.log('登录历史API原始响应:', response);
      
      // 处理后端返回的包装格式 {code: 1, msg: null, data: [...]}
      if (response.data && response.data.code === 1 && Array.isArray(response.data.data)) {
        console.log('成功提取登录历史数据:', response.data.data);
        return response.data; // 返回完整的包装对象，让调用方处理
      } else {
        console.warn('登录历史API响应格式不符合预期:', response.data);
        return { code: 1, data: [] }; // 返回空数据的包装格式
      }
    } catch (error: any) {
      console.error('登录历史API请求失败:', error);
      throw error;
    }
  },

  // 用户登出
  async logout(): Promise<void> {
    await apiClient.post('api/users/logout')
  }
}