63<!-- src/views/Statistics/SalesStats.vue -->
<template>
  <div class="sales-stats">
    <h2>销售统计</h2>
    
    <!-- 时间筛选 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-item">
          <label for="startDate">开始日期:</label>
          <input 
            id="startDate" 
            type="date" 
            v-model="filter.startDate"
          />
        </div>
        <div class="filter-item">
          <label for="endDate">结束日期:</label>
          <input 
            id="endDate" 
            type="date" 
            v-model="filter.endDate"
          />
        </div>
        <div class="filter-item">
          <label for="statType">统计类型:</label>
          <select id="statType" v-model="filter.statType">
            <option value="daily">日统计</option>
            <option value="monthly">月统计</option>
            <option value="yearly">年统计</option>
          </select>
        </div>
        <div class="filter-actions">
          <button @click="loadStatistics">查询</button>
          <button @click="resetFilter">重置</button>
        </div>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-title">总销售额</div>
        <div class="stat-value">¥{{ formatNumber(overview.totalSales) }}</div>
        <div class="stat-change" :class="{ positive: overview.salesGrowth >= 0, negative: overview.salesGrowth < 0 }">
          {{ overview.salesGrowth >= 0 ? '+' : '' }}{{ overview.salesGrowth }}% 同比
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-title">订单总数</div>
        <div class="stat-value">{{ overview.totalOrders }}</div>
        <div class="stat-change" :class="{ positive: overview.ordersGrowth >= 0, negative: overview.ordersGrowth < 0 }">
          {{ overview.ordersGrowth >= 0 ? '+' : '' }}{{ overview.ordersGrowth }}% 同比
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-title">商品销量</div>
        <div class="stat-value">{{ overview.totalItems }}</div>
        <div class="stat-change" :class="{ positive: overview.itemsGrowth >= 0, negative: overview.itemsGrowth < 0 }">
          {{ overview.itemsGrowth >= 0 ? '+' : '' }}{{ overview.itemsGrowth }}% 同比
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-title">客单价</div>
        <div class="stat-value">¥{{ overview.avgOrderValue.toFixed(2) }}</div>
        <div class="stat-change" :class="{ positive: overview.avgOrderGrowth >= 0, negative: overview.avgOrderGrowth < 0 }">
          {{ overview.avgOrderGrowth >= 0 ? '+' : '' }}{{ overview.avgOrderGrowth }}% 同比
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <!-- 销售趋势图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>销售趋势</h3>
        </div>
        <div ref="salesTrendChart" class="chart-wrapper"></div>
      </div>

      <!-- 商品销量排行 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>商品销量排行</h3>
        </div>
        <div ref="productRankChart" class="chart-wrapper"></div>
      </div>

      <!-- 销售额占比 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>销售额占比</h3>
        </div>
        <div ref="salesProportionChart" class="chart-wrapper"></div>
      </div>

      <!-- 时段销售分析 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>时段销售分析</h3>
        </div>
        <div ref="timeAnalysisChart" class="chart-wrapper"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { 
  getSalesOverview, 
  getSalesTrend, 
  getProductSalesRank, 
  getCategoryProportion, 
  getTimeDistribution,
  type SalesOverviewData,
  type SalesTrendPoint,
  type ProductSalesRank,
  type CategoryProportion,
  type TimeDistribution
} from '@/services/statisticsService'

// 图表实例
const salesTrendChart = ref<HTMLDivElement | null>(null)
const productRankChart = ref<HTMLDivElement | null>(null)
const salesProportionChart = ref<HTMLDivElement | null>(null)
const timeAnalysisChart = ref<HTMLDivElement | null>(null)

// ECharts实例
let salesTrendChartInstance: echarts.ECharts | null = null
let productRankChartInstance: echarts.ECharts | null = null
let salesProportionChartInstance: echarts.ECharts | null = null
let timeAnalysisChartInstance: echarts.ECharts | null = null

// 加载状态
const loading = ref(false)

// 查询过滤条件
const filter = reactive({
  startDate: '',
  endDate: '',
  statType: 'daily' // daily, monthly, yearly
})

// 统计概览数据
const overview = reactive<SalesOverviewData>({
  totalSales: 0,
  salesGrowth: 0,
  totalOrders: 0,
  ordersGrowth: 0,
  totalItems: 0,
  itemsGrowth: 0,
  avgOrderValue: 0,
  avgOrderGrowth: 0
})

// 初始化日期范围
const initDateRange = () => {
  const today = new Date()
  const oneMonthAgo = new Date(today)
  oneMonthAgo.setMonth(today.getMonth() - 1)
  
  filter.endDate = formatDate(today)
  filter.startDate = formatDate(oneMonthAgo)
}

// 格式化日期为 YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

// 格式化数字
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 重置筛选条件
const resetFilter = () => {
  initDateRange()
  filter.statType = 'daily'
  loadStatistics()
}

// 加载统计数据
const loadStatistics = async () => {
  try {
    loading.value = true
    
    // 并行请求所有接口
    const [overviewRes, trendRes, rankRes, proportionRes, timeRes] = await Promise.all([
      getSalesOverview({
        startDate: filter.startDate,
        endDate: filter.endDate
      }),
      getSalesTrend({
        startDate: filter.startDate,
        endDate: filter.endDate,
        statType: filter.statType as 'daily' | 'monthly' | 'yearly'
      }),
      getProductSalesRank({
        startDate: filter.startDate,
        endDate: filter.endDate,
        limit: 8
      }),
      getCategoryProportion({
        startDate: filter.startDate,
        endDate: filter.endDate
      }),
      getTimeDistribution({
        startDate: filter.startDate,
        endDate: filter.endDate
      })
    ])
    
    // 更新概览数据
    Object.assign(overview, overviewRes)
    
    // 渲染图表
    renderSalesTrendChart(trendRes)
    renderProductRankChart(rankRes)
    renderSalesProportionChart(proportionRes)
    renderTimeAnalysisChart(timeRes)
    
    ElMessage.success('数据加载成功')
  } catch (error: any) {
    console.error('加载统计数据失败:', error)
    ElMessage.error(error.message || '加载数据失败')
  } finally {
    loading.value = false
  }
}

// 渲染销售趋势图
const renderSalesTrendChart = (trendData: SalesTrendPoint[]) => {
  if (!salesTrendChart.value || trendData.length === 0) return
  
  if (!salesTrendChartInstance) {
    salesTrendChartInstance = echarts.init(salesTrendChart.value)
  }
  
  const dates = trendData.map(item => item.date)
  const sales = trendData.map(item => item.sales)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const date = params[0].name
        const sales = params[0].value
        return `${date}<br/>销售额: ¥${formatNumber(sales)}`
      }
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => `¥${formatNumber(value)}`
      }
    },
    series: [{
      name: '销售额',
      data: sales,
      type: 'line',
      smooth: true,
      areaStyle: {
        opacity: 0.3
      },
      itemStyle: {
        color: '#1890ff'
      }
    }]
  }
  
  salesTrendChartInstance.setOption(option)
}

// 渲染商品销量排行图
const renderProductRankChart = (rankData: ProductSalesRank[]) => {
  if (!productRankChart.value || rankData.length === 0) return
  
  if (!productRankChartInstance) {
    productRankChartInstance = echarts.init(productRankChart.value)
  }
  
  // 药品分类映射
  const categoryMap: Record<string, string> = {
    '1': '处方药',
    '2': '非处方药',
    '3': '中药饮片',
    '4': '保健品',
    '5': '医疗器械'
  }
  
  const names = rankData.map(item => item.drugName)
  const sales = rankData.map(item => item.totalSales)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const item = rankData[params[0].dataIndex]
        return `
          <div style="font-weight:bold">${item.drugName}</div>
          <div>排名: 第${item.rank}名</div>
          <div>分类: ${categoryMap[item.category] || item.category}</div>
          <div>销量: ${formatNumber(item.totalSales)}件</div>
          <div>销售额: ¥${formatNumber(item.totalAmount)}</div>
        `
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.01]
    },
    yAxis: {
      type: 'category',
      data: names,
      inverse: true  // 反转,让第一名在顶部
    },
    series: [
      {
        type: 'bar',
        data: sales,
        itemStyle: {
          color: (params: any) => {
            const colors = ['#ff4d4f', '#fa8c16', '#faad14', '#52c41a', '#1890ff']
            return colors[params.dataIndex % colors.length]
          }
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}'
        }
      }
    ]
  }
  
  productRankChartInstance.setOption(option)
}

// 渲染销售额占比图
const renderSalesProportionChart = (proportionData: CategoryProportion[]) => {
  if (!salesProportionChart.value || proportionData.length === 0) return
  
  if (!salesProportionChartInstance) {
    salesProportionChartInstance = echarts.init(salesProportionChart.value)
  }
  
  // 药品分类映射
  const categoryMap: Record<string, string> = {
    '1': '处方药',
    '2': '非处方药',
    '3': '中药饮片',
    '4': '保健品',
    '5': '医疗器械'
  }
  
  const chartData = proportionData.map(item => ({
    name: categoryMap[item.category] || item.category,
    value: item.amount
  }))
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.seriesName}<br/>${params.name}: ¥${formatNumber(params.value)} (${params.percent}%)`
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '销售额占比',
        type: 'pie',
        radius: '50%',
        data: chartData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  salesProportionChartInstance.setOption(option)
}

// 渲染时段销售分析图
const renderTimeAnalysisChart = (timeData: TimeDistribution[]) => {
  if (!timeAnalysisChart.value || timeData.length === 0) return
  
  if (!timeAnalysisChartInstance) {
    timeAnalysisChartInstance = echarts.init(timeAnalysisChart.value)
  }
  
  const chartData = timeData.map(item => ({
    name: item.timeRange,
    value: item.amount
  }))
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.seriesName}<br/>${params.name}: ¥${formatNumber(params.value)} (${params.percent}%)`
      }
    },
    legend: {
      bottom: 'bottom'
    },
    series: [
      {
        name: '时段销售',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold',
            formatter: (params: any) => {
              return `${params.name}\n¥${formatNumber(params.value)}\n${params.percent}%`
            }
          }
        },
        labelLine: {
          show: false
        },
        data: chartData
      }
    ]
  }
  
  timeAnalysisChartInstance.setOption(option)
}

// 窗口大小改变时重绘图表
const handleResize = () => {
  if (salesTrendChartInstance) salesTrendChartInstance.resize()
  if (productRankChartInstance) productRankChartInstance.resize()
  if (salesProportionChartInstance) salesProportionChartInstance.resize()
  if (timeAnalysisChartInstance) timeAnalysisChartInstance.resize()
}

// 组件挂载时初始化
onMounted(() => {
  initDateRange()
  loadStatistics()
  
  window.addEventListener('resize', handleResize)
})

// 组件卸载前清理
onBeforeUnmount(() => {
  if (salesTrendChartInstance) salesTrendChartInstance.dispose()
  if (productRankChartInstance) productRankChartInstance.dispose()
  if (salesProportionChartInstance) salesProportionChartInstance.dispose()
  if (timeAnalysisChartInstance) timeAnalysisChartInstance.dispose()
  
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.sales-stats {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.filter-section {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  min-width: 180px;
}

.filter-item label {
  margin-bottom: 5px;
  font-weight: bold;
}

.filter-item input,
.filter-item select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filter-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 1px;
}

.filter-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.filter-actions button:first-child {
  background: #1890ff;
  color: white;
}

.filter-actions button:last-child {
  background: #f5f5f5;
  border: 1px solid #ddd;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.stat-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.stat-change {
  font-size: 12px;
}

.stat-change.positive {
  color: #52c41a;
}

.stat-change.negative {
  color: #ff4d4f;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
  gap: 20px;
}

.chart-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.chart-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.chart-header h3 {
  margin: 0;
  color: #333;
}

.chart-wrapper {
  width: 100%;
  height: 400px;
}

@media (max-width: 768px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
  
  .chart-wrapper {
    height: 300px;
  }
  
  .stats-overview {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}
</style>