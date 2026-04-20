import axios from 'axios'

export interface HotSalesItem {
  drugCode: string
  drugName: string
  manufacturer: string
  category: string
  totalSales: number
  totalAmount: number
  avgPrice: number
  orderCount: number
  rank: number
}

export interface OverviewData {
  totalSalesAmount: number      // 销售总额
  totalOrderCount: number       // 订单总数
  totalProductQuantity: number  // 商品总数量
  totalDrugVariety: number      // 药品种类数
  avgOrderAmount: number        // 平均订单金额
}

/**
 * 获取热销药品统计
 * @param params 查询参数
 */
export const getHotSalesStats = async (params: {
  startDate?: string
  endDate?: string
  category?: string
  rankType?: 'sales' | 'amount' | 'orderCount'
}): Promise<HotSalesItem[]> => {
  const response = await axios.get('/api/statistics/hot-sales', { params })
  
  if (response.data.code === 1) {
    return response.data.data || []
  }
  
  throw new Error(response.data.msg || '获取热销统计失败')
}

/**
 * 获取统计概览
 * @param params 查询参数
 */
export const getOverview = async (params: {
  startDate?: string
  endDate?: string
}): Promise<OverviewData> => {
  const response = await axios.get('/api/statistics/overview', { params })
  
  if (response.data.code === 1) {
    return response.data.data
  }
  
  throw new Error(response.data.msg || '获取统计概览失败')
}

/**
 * 获取商品销量趋势
 * @param params 查询参数
 */
export const getProductTrend = async (params: {
  drugCode: string
  startDate: string
  endDate: string
}): Promise<Array<{ date: string; sales: number }>> => {
  const response = await axios.get('/api/statistics/product-trend', { params })
  
  if (response.data.code === 1) {
    return response.data.data || []
  }
  
  throw new Error(response.data.msg || '获取商品趋势失败')
}

// ==================== 销售统计相关接口 ====================

/**
 * 销售概览数据
 */
export interface SalesOverviewData {
  totalSales: number          // 总销售额
  salesGrowth: number         // 销售额同比增长率(%)
  totalOrders: number         // 订单总数
  ordersGrowth: number        // 订单数同比增长率(%)
  totalItems: number          // 商品总销量
  itemsGrowth: number         // 商品销量同比增长率(%)
  avgOrderValue: number       // 客单价
  avgOrderGrowth: number      // 客单价同比增长率(%)
}

/**
 * 销售趋势数据点
 */
export interface SalesTrendPoint {
  date: string    // 日期/月份/年份
  sales: number   // 销售额
  orders?: number // 订单数(可选)
}

/**
 * 商品销量排行
 */
export interface ProductSalesRank {
  drugCode: string
  drugName: string
  category: string
  totalSales: number    // 总销量
  totalAmount: number   // 总销售额
  rank: number
}

/**
 * 分类销售占比
 */
export interface CategoryProportion {
  category: string      // 分类名称
  amount: number        // 销售额
  percentage: number    // 占比(%)
}

/**
 * 时段销售分布
 */
export interface TimeDistribution {
  timeRange: string     // 时段范围 "08:00-12:00"
  amount: number        // 销售额
  percentage: number    // 占比(%)
}

/**
 * 获取销售概览统计
 * @param params 查询参数
 */
export const getSalesOverview = async (params: {
  startDate: string
  endDate: string
}): Promise<SalesOverviewData> => {
  const response = await axios.get('/api/statistics/sales-overview', { params })
  
  if (response.data.code === 1) {
    return response.data.data
  }
  
  throw new Error(response.data.msg || '获取销售概览失败')
}

/**
 * 获取销售趋势数据
 * @param params 查询参数
 */
export const getSalesTrend = async (params: {
  startDate: string
  endDate: string
  statType: 'daily' | 'monthly' | 'yearly'
}): Promise<SalesTrendPoint[]> => {
  const response = await axios.get('/api/statistics/sales-trend', { params })
  
  if (response.data.code === 1) {
    return response.data.data || []
  }
  
  throw new Error(response.data.msg || '获取销售趋势失败')
}

/**
 * 获取商品销量排行
 * @param params 查询参数
 */
export const getProductSalesRank = async (params: {
  startDate: string
  endDate: string
  limit?: number
}): Promise<ProductSalesRank[]> => {
  const response = await axios.get('/api/statistics/product-sales-rank', { params })
  
  if (response.data.code === 1) {
    return response.data.data || []
  }
  
  throw new Error(response.data.msg || '获取商品销量排行失败')
}

/**
 * 获取分类销售占比
 * @param params 查询参数
 */
export const getCategoryProportion = async (params: {
  startDate: string
  endDate: string
}): Promise<CategoryProportion[]> => {
  const response = await axios.get('/api/statistics/category-proportion', { params })
  
  if (response.data.code === 1) {
    return response.data.data || []
  }
  
  throw new Error(response.data.msg || '获取分类销售占比失败')
}

/**
 * 获取时段销售分布
 * @param params 查询参数
 */
export const getTimeDistribution = async (params: {
  startDate: string
  endDate: string
}): Promise<TimeDistribution[]> => {
  const response = await axios.get('/api/statistics/time-distribution', { params })
  
  if (response.data.code === 1) {
    return response.data.data || []
  }
  
  throw new Error(response.data.msg || '获取时段销售分布失败')
}
