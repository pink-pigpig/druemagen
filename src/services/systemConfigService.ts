// src/services/systemConfigService.ts
import axios from 'axios'

/**
 * 系统配置数据类型
 */
export interface SystemConfig {
  allowAdminRegistration: boolean    // 是否允许管理员注册
  allowUserRegistration: boolean     // 是否允许普通用户注册
}

/**
 * 默认配置（当无法从后端获取时使用）
 */
const DEFAULT_CONFIG: SystemConfig = {
  allowAdminRegistration: true,
  allowUserRegistration: true
}

/**
 * 获取所有系统配置
 * GET /admin/config/all
 * 注意：如果接口需要认证但用户未登录，将返回默认配置
 */
export const getSystemConfig = async (): Promise<SystemConfig> => {
  try {
    const response = await axios.get('api/admin/config/all')
    
    if (response.data.code === 1) {
      const data = response.data.data
      
      // 将后端返回的嵌套配置转换为前端需要的格式
      return {
        allowAdminRegistration: Boolean(data.allow_admin_register?.value === 'true'),
        allowUserRegistration: Boolean(data.allow_user_register?.value === 'true')
      }
    }
    
    // 如果响应码不为1，返回默认配置
    console.warn('获取系统配置响应异常，使用默认配置')
    return DEFAULT_CONFIG
  } catch (error: any) {
    // 如果是401未授权错误，说明接口需要认证但用户未登录
    // 此时返回默认配置，让注册功能正常工作
    if (error.response?.status === 401) {
      console.warn('系统配置接口需要认证，使用默认配置（允许所有类型注册）')
      return DEFAULT_CONFIG
    }
    
    // 其他错误也返回默认配置，避免阻塞页面
    console.error('获取系统配置失败:', error)
    return DEFAULT_CONFIG
  }
}

/**
 * 更新系统配置
 * PUT /admin/config/update?configKey=xxx&configValue=xxx
 */
export const updateSystemConfig = async (config: Partial<SystemConfig>): Promise<void> => {
  // 逐个更新配置项
  const updates: Promise<any>[] = []
  
  if (config.allowAdminRegistration !== undefined) {
    updates.push(
      axios.put('api/admin/config/update', null, {
        params: {
          configKey: 'allow_admin_register',
          configValue: String(config.allowAdminRegistration)
        }
      })
    )
  }
  
  if (config.allowUserRegistration !== undefined) {
    updates.push(
      axios.put('api/admin/config/update', null, {
        params: {
          configKey: 'allow_user_register',
          configValue: String(config.allowUserRegistration)
        }
      })
    )
  }
  
  // 等待所有更新完成
  await Promise.all(updates)
  
  // 刷新缓存
  await axios.post('api/admin/config/refresh-cache')
}
