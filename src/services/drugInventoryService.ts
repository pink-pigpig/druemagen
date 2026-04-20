import { apiClient } from '@/services/authService'

// 分页结果接口 - 与后端返回字段匹配
export interface PageResult<T> {
  records: T[]
  total: number
  page: number      // 后端返回的是page而不是pageNum
  size: number      // 后端返回的是size而不是pageSize
}

// 药品库存实体接口
export interface DrugInventory {
  id: number
  drugName: string           // 药品名称
  drugCode: string           // 药品编码
  category: string           // 药品分类（数字字符串）
  manufacturer: string       // 生产厂家
  batchNumber: string        // 批号
  productionDate: number[] | string     // 生产日期 [年,月,日] 或字符串
  expiryDate: number[] | string         // 有效期至 [年,月,日] 或字符串
  stockQuantity: number      // 库存数量
  minStock: number           // 最低库存
  unit: string               // 单位
  purchasePrice: number      // 采购价
  retailPrice: number        // 零售价
  inventoryValue: number     // 库存价值
  storageLocation: string    // 存储位置
  stockStatus: number        // 库存状态：1缺货、2充足、3紧缺
}

// 查询参数接口
export interface InventoryQueryParams {
  drugName?: string
  drugCode?: string
  manufacturer?: string
  category?: string
  stockStatus?: number
  batchNumber?: string
  page?: number
  size?: number
}

// 库存状态枚举
export enum StockStatus {
  OUT_OF_STOCK = 1,  // 缺货
  ADEQUATE = 2,      // 充足
  SHORTAGE = 3       // 紧缺
}

// 药品分类映射
const CATEGORY_MAP: Record<string, string> = {
  '1': '处方药',
  '2': '非处方药',
  '3': '中药饮片',
  '4': '保健品',
  '5': '医疗器械'
}

// 获取药品分类名称
export const getCategoryName = (category: string): string => {
  return CATEGORY_MAP[category] || '未知分类'
}

// 获取库存状态标签文本
export const getStockStatusText = (status: number): string => {
  switch (status) {
    case StockStatus.OUT_OF_STOCK:
      return '缺货'
    case StockStatus.ADEQUATE:
      return '充足'
    case StockStatus.SHORTAGE:
      return '紧缺'
    default:
      return '未知'
  }
}

// 获取库存状态标签类型
export const getStockStatusType = (status: number): 'danger' | 'success' | 'warning' | 'info' => {
  switch (status) {
    case StockStatus.OUT_OF_STOCK:
      return 'danger'
    case StockStatus.ADEQUATE:
      return 'success'
    case StockStatus.SHORTAGE:
      return 'warning'
    default:
      return 'info'
  }
}

// 格式化日期数组 [年,月,日] 为字符串
export const formatDateArray = (dateArray: number[] | string | null | undefined): string => {
  if (!dateArray) return '-'
  
  // 如果已经是字符串格式，直接返回
  if (typeof dateArray === 'string') {
    return dateArray
  }
  
  // 处理数组格式 [年,月,日]
  if (Array.isArray(dateArray) && dateArray.length >= 3) {
    try {
      const [year, month, day] = dateArray
      // 注意：JavaScript的月份是从0开始的，但后端返回的是实际月份
      const date = new Date(year, month - 1, day)
      if (isNaN(date.getTime())) {
        return '-'
      }
      return date.toLocaleDateString('zh-CN')
    } catch (error) {
      console.error('日期格式化错误:', error)
      return '-'
    }
  }
  
  return '-'
}

export const drugInventoryService = {
  // 查询库存列表
  async getInventoryList(params: InventoryQueryParams): Promise<PageResult<DrugInventory>> {
    try {
      console.log('=== 请求库存列表API ===')
      console.log('请求URL: /api/drugstore/inventory')
      console.log('查询参数:', params)
      
      const response = await apiClient.get('/api/drugstore/inventory', { params })
      console.log('=== API原始响应 ===')
      console.log('完整响应:', response)
      console.log('响应数据:', response.data)
      console.log('响应状态:', response.status)
      
      // 处理后端返回的Result包装格式
      if (response.data && response.data.code === 1) {
        const result = response.data.data
        console.log('=== 解包后的数据 ===')
        console.log('解包数据:', result)
        console.log('records类型:', typeof result.records)
        console.log('records长度:', result.records?.length)
        console.log('第一条记录:', result.records?.[0])
        console.log('total:', result.total)
        console.log('page:', result.page)
        console.log('size:', result.size)
        return result
      } else {
        console.error('API返回错误:', response.data)
        throw new Error(response.data?.msg || '获取库存列表失败')
      }
    } catch (error: any) {
      console.error('=== API调用失败 ===')
      console.error('错误详情:', error)
      console.error('错误消息:', error.message)
      if (error.response) {
        console.error('响应状态:', error.response.status)
        console.error('响应数据:', error.response.data)
      }
      throw error
    }
  },

  // 格式化金额显示
  formatCurrency(amount: number): string {
    return `¥${amount.toFixed(2)}`
  },

  // 格式化库存状态显示
  formatStockStatus(status: number): string {
    return getStockStatusText(status)
  },

  // 格式化分类显示
  formatCategory(category: string): string {
    return getCategoryName(category)
  },

  // 格式化日期显示
  formatDate(date: number[] | string): string {
    return formatDateArray(date)
  }
}