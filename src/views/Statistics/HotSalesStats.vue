<!-- src/views/Statistics/HotSalesStats.vue -->
<template>
  <div class="hot-sales-stats">
    <h2>热销统计</h2>
    
    <!-- 筛选条件 -->
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
          <label for="category">药品分类:</label>
          <select id="category" v-model="filter.category">
            <option value="">全部分类</option>
            <option value="prescription">处方药</option>
            <option value="otc">非处方药</option>
            <option value="health">保健品</option>
            <option value="medical">医疗器械</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="rankType">排序方式:</label>
          <select id="rankType" v-model="filter.rankType">
            <option value="sales">按销量</option>
            <option value="amount">按销售额</option>
          </select>
        </div>
        <div class="filter-actions">
          <button @click="loadHotSalesData">查询</button>
          <button @click="resetFilter">重置</button>
        </div>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-title">药品种类数</div>
        <div class="stat-value">{{ overview.totalDrugVariety }}</div>
        <div class="stat-desc">热销商品总数</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">订单总数</div>
        <div class="stat-value">{{ formatNumber(overview.totalOrderCount) }}</div>
        <div class="stat-desc">统计周期内订单数</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">销售总额</div>
        <div class="stat-value">¥{{ formatNumber(overview.totalSalesAmount) }}</div>
        <div class="stat-desc">统计周期内总销售额</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">平均订单金额</div>
        <div class="stat-value">¥{{ overview.avgOrderAmount.toFixed(2) }}</div>
        <div class="stat-desc">每单平均消费金额</div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <!-- 热销排行榜 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>热销商品排行榜</h3>
          <div class="chart-actions">
            <button 
              :class="{ active: chartView.topSales === 'bar' }"
              @click="switchTopSalesView('bar')"
            >
              柱状图
            </button>
            <button 
              :class="{ active: chartView.topSales === 'table' }"
              @click="switchTopSalesView('table')"
            >
              表格
            </button>
          </div>
        </div>
        <div v-if="chartView.topSales === 'bar'" ref="topSalesChart" class="chart-wrapper"></div>
        <div v-else class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>排名</th>
                <th>商品名称</th>
                <th>分类</th>
                <th>销量</th>
                <th>销售额</th>
                <th>单价</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in topSalesData" :key="item.drugCode">
                <td>
                  <span :class="getRankClass(item.rank)">
                    {{ item.rank }}
                  </span>
                </td>
                <td>{{ item.drugName }}</td>
                <td>{{ getCategoryName(item.category) }}</td>
                <td>{{ formatNumber(item.totalSales) }}</td>
                <td>¥{{ formatNumber(item.totalAmount) }}</td>
                <td>¥{{ item.avgPrice.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 分类销售占比 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>各分类销售占比</h3>
        </div>
        <div ref="categoryChart" class="chart-wrapper"></div>
      </div>

      <!-- 销量趋势 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>热销商品销量趋势</h3>
          <div class="chart-actions">
            <select v-model="selectedProduct" @change="loadProductTrend">
              <option value="">请选择商品</option>
              <option 
                v-for="product in topSalesData.slice(0, 10)" 
                :key="product.drugCode" 
                :value="product.drugCode"
              >
                {{ product.drugName }} (排名第{{ product.rank }})
              </option>
            </select>
          </div>
        </div>
        <div ref="trendChart" class="chart-wrapper"></div>
      </div>

      <!-- 销售热度地图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>销售热度分布</h3>
        </div>
        <div ref="heatmapChart" class="chart-wrapper"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { getHotSalesStats, getOverview, getProductTrend, type HotSalesItem, type OverviewData } from '@/services/statisticsService'

// 图表实例
const topSalesChart = ref<HTMLDivElement | null>(null)
const categoryChart = ref<HTMLDivElement | null>(null)
const trendChart = ref<HTMLDivElement | null>(null)
const heatmapChart = ref<HTMLDivElement | null>(null)

// ECharts实例
let topSalesChartInstance: echarts.ECharts | null = null
let categoryChartInstance: echarts.ECharts | null = null
let trendChartInstance: echarts.ECharts | null = null
let heatmapChartInstance: echarts.ECharts | null = null

// 加载状态
const loading = ref(false)

// 查询过滤条件
const filter = reactive({
  startDate: '',
  endDate: '',
  category: '',
  rankType: 'sales'
})

// 图表视图控制
const chartView = reactive({
  topSales: 'bar' // bar | table
})

// 选中的商品
const selectedProduct = ref('')

// 统计概览数据
const overview = reactive<OverviewData>({
  totalSalesAmount: 0,
  totalOrderCount: 0,
  totalProductQuantity: 0,
  totalDrugVariety: 0,
  avgOrderAmount: 0
})

// 热销数据
const topSalesData = ref<HotSalesItem[]>([])

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

// 格式化数字(添加千位分隔符)
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 获取排名样式
const getRankClass = (rank: number): string => {
  if (rank === 1) return 'rank-first'
  if (rank === 2) return 'rank-second'
  if (rank === 3) return 'rank-third'
  return 'rank-normal'
}

// 获取分类名称(将数字转换为中文)
const getCategoryName = (category: string | undefined): string => {
  if (!category) return '-'
  
  const categoryMap: Record<string, string> = {
    '1': '处方药',
    '2': '非处方药',
    '3': '中药饮片',
    '4': '保健品',
    '5': '医疗器械'
  }
  
  return categoryMap[category] || category
}

// 重置筛选条件
const resetFilter = () => {
  initDateRange()
  filter.category = ''
  filter.rankType = 'sales'
  loadHotSalesData()
}

// 切换热销排行榜视图
const switchTopSalesView = (view: string) => {
  chartView.topSales = view
  // 延迟渲染,等待 DOM 更新
  setTimeout(() => {
    if (view === 'bar') {
      renderTopSalesChart()
    }
  }, 100)
}

// 加载热销数据
const loadHotSalesData = async () => {
  try {
    loading.value = true
    
    // 并行请求两个接口
    const [hotSalesRes, overviewRes] = await Promise.all([
      getHotSalesStats({
        startDate: filter.startDate,
        endDate: filter.endDate,
        category: filter.category || undefined,
        rankType: filter.rankType as 'sales' | 'amount' | 'orderCount'
      }),
      getOverview({
        startDate: filter.startDate,
        endDate: filter.endDate
      })
    ])
    
    // 更新热销数据
    topSalesData.value = hotSalesRes
    
    // 更新概览数据
    overview.totalSalesAmount = overviewRes.totalSalesAmount
    overview.totalOrderCount = overviewRes.totalOrderCount
    overview.totalProductQuantity = overviewRes.totalProductQuantity
    overview.totalDrugVariety = overviewRes.totalDrugVariety
    overview.avgOrderAmount = overviewRes.avgOrderAmount
    
    // 渲染图表
    renderTopSalesChart()
    renderCategoryChart()
    
    ElMessage.success('数据加载成功')
  } catch (error: any) {
    console.error('加载热销数据失败:', error)
    ElMessage.error(error.message || '加载数据失败')
  } finally {
    loading.value = false
  }
}

// 加载商品趋势数据
const loadProductTrend = () => {
  if (!selectedProduct.value) return
  renderTrendChart()
}

// 渲染热销排行榜
const renderTopSalesChart = () => {
  if (!topSalesChart.value || topSalesData.value.length === 0) return
  
  if (!topSalesChartInstance) {
    topSalesChartInstance = echarts.init(topSalesChart.value)
  }
  
  // 根据排序方式决定显示的数据
  const names = topSalesData.value.map(item => item.drugName)
  let values: number[]
  let seriesName: string
  
  if (filter.rankType === 'sales') {
    values = topSalesData.value.map(item => item.totalSales)
    seriesName = '销量'
  } else if (filter.rankType === 'amount') {
    values = topSalesData.value.map(item => item.totalAmount)
    seriesName = '销售额'
  } else {
    values = topSalesData.value.map(item => item.orderCount)
    seriesName = '订单数'
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const item = topSalesData.value[params[0].dataIndex]
        let unit = '件'
        if (filter.rankType === 'amount') unit = '元'
        if (filter.rankType === 'orderCount') unit = '单'
        
        return `
          <div style="font-weight:bold">${item.drugName}</div>
          <div>排名: 第${item.rank}名</div>
          <div>${seriesName}: ${params[0].value}${unit}</div>
          <div>平均单价: ¥${item.avgPrice.toFixed(2)}</div>
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
        name: seriesName,
        type: 'bar',
        data: values,
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
  
  topSalesChartInstance.setOption(option)
}

// 渲染分类销售占比图
const renderCategoryChart = () => {
  if (!categoryChart.value || topSalesData.value.length === 0) return
  
  if (!categoryChartInstance) {
    categoryChartInstance = echarts.init(categoryChart.value)
  }
  
  // 药品分类映射
  const categoryMap: Record<string, string> = {
    '1': '处方药',
    '2': '非处方药',
    '3': '中药饮片',
    '4': '保健品',
    '5': '医疗器械'
  }
  
  // 按分类统计销售额
  const categoryAmountMap: Record<string, number> = {}
  topSalesData.value.forEach(item => {
    const categoryKey = item.category || '其他'
    categoryAmountMap[categoryKey] = (categoryAmountMap[categoryKey] || 0) + item.totalAmount
  })
  
  // 转换为饼图数据格式,并将数字分类转换为中文
  const categoryData = Object.entries(categoryAmountMap).map(([key, value]) => ({
    name: categoryMap[key] || key,  // 将数字转换为中文名称
    value
  }))
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.seriesName}<br/>${params.name}: ¥${params.value.toFixed(2)} (${params.percent}%)`
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: 'bottom'
    },
    series: [
      {
        name: '分类销售占比',
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
            fontSize: '14',
            fontWeight: 'bold',
            formatter: (params: any) => {
              return `${params.name}\n¥${params.value.toFixed(2)}\n${params.percent}%`
            }
          }
        },
        labelLine: {
          show: false
        },
        data: categoryData
      }
    ]
  }
  
  categoryChartInstance.setOption(option)
}

// 渲染趋势图
const renderTrendChart = async () => {
  if (!trendChart.value || !selectedProduct.value) return
  
  if (!trendChartInstance) {
    trendChartInstance = echarts.init(trendChart.value)
  }
  
  try {
    // 调用后端接口获取真实趋势数据
    const trendData = await getProductTrend({
      drugCode: selectedProduct.value,
      startDate: filter.startDate,
      endDate: filter.endDate
    })
    
    if (trendData.length === 0) {
      ElMessage.warning('该商品在选定时间段内无销售记录')
      return
    }
    
    // 格式化日期为 "月/日" 格式
    const dates = trendData.map(item => {
      const date = new Date(item.date)
      return `${date.getMonth() + 1}/${date.getDate()}`
    })
    const salesData = trendData.map(item => item.sales)
    
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          return `${dates[params[0].dataIndex]}<br/>销量: ${params[0].value}件`
        }
      },
      xAxis: {
        type: 'category',
        data: dates,
        boundaryGap: false
      },
      yAxis: {
        type: 'value',
        name: '销量'
      },
      series: [{
        name: '销量',
        data: salesData,
        type: 'line',
        smooth: true,
        itemStyle: {
          color: '#1890ff'
        },
        areaStyle: {
          opacity: 0.3
        }
      }]
    }
    
    trendChartInstance.setOption(option)
  } catch (error: any) {
    console.error('获取趋势数据失败:', error)
    ElMessage.error(error.message || '获取趋势数据失败')
  }
}

// 渲染热力图
const renderHeatmapChart = () => {
  if (!heatmapChart.value) return
  
  if (!heatmapChartInstance) {
    heatmapChartInstance = echarts.init(heatmapChart.value)
  }
  
  // 模拟数据
  const hours = ['0点', '4点', '8点', '12点', '16点', '20点']
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  
  const data = []
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 6; j++) {
      data.push([j, i, Math.floor(Math.random() * 100)])
    }
  }
  
  const option = {
    tooltip: {
      position: 'top'
    },
    grid: {
      height: '50%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: hours,
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: days,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%'
    },
    series: [{
      name: '销售热度',
      type: 'heatmap',
      data: data,
      label: {
        show: true
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
  
  heatmapChartInstance.setOption(option)
}

// 窗口大小改变时重绘图表
const handleResize = () => {
  if (topSalesChartInstance) topSalesChartInstance.resize()
  if (categoryChartInstance) categoryChartInstance.resize()
  if (trendChartInstance) trendChartInstance.resize()
  if (heatmapChartInstance) heatmapChartInstance.resize()
}

// 组件挂载时初始化
onMounted(() => {
  initDateRange()
  loadHotSalesData()
  renderHeatmapChart()
  
  window.addEventListener('resize', handleResize)
})

// 组件卸载前清理
onBeforeUnmount(() => {
  if (topSalesChartInstance) topSalesChartInstance.dispose()
  if (categoryChartInstance) categoryChartInstance.dispose()
  if (trendChartInstance) trendChartInstance.dispose()
  if (heatmapChartInstance) heatmapChartInstance.dispose()
  
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.hot-sales-stats {
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
  min-width: 160px;
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
  text-align: center;
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

.stat-desc {
  font-size: 12px;
  color: #999;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.chart-header h3 {
  margin: 0;
  color: #333;
}

.chart-actions {
  display: flex;
  gap: 10px;
}

.chart-actions button,
.chart-actions select {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.chart-actions button.active {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.chart-wrapper {
  width: 100%;
  height: 400px;
}

.table-wrapper {
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background: #fafafa;
  font-weight: bold;
  color: #333;
}

.rank-first {
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  background: #ff4d4f;
  color: white;
  border-radius: 50%;
}

.rank-second {
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  background: #fa8c16;
  color: white;
  border-radius: 50%;
}

.rank-third {
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  background: #faad14;
  color: white;
  border-radius: 50%;
}

.rank-normal {
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
  
  .chart-wrapper {
    height: 300px;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-item {
    min-width: auto;
  }
}
</style>