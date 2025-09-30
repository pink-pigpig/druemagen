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
        <div class="stat-title">热销商品数</div>
        <div class="stat-value">{{ overview.hotProducts }}</div>
        <div class="stat-desc">本月新增5款</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">总销量</div>
        <div class="stat-value">{{ formatNumber(overview.totalSales) }}</div>
        <div class="stat-desc">环比增长12%</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">总销售额</div>
        <div class="stat-value">¥{{ formatNumber(overview.totalAmount) }}</div>
        <div class="stat-desc">环比增长8%</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">平均单价</div>
        <div class="stat-value">¥{{ overview.avgPrice.toFixed(2) }}</div>
        <div class="stat-desc">同比上升3%</div>
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
              <tr v-for="(item, index) in topSalesData" :key="item.id">
                <td>
                  <span :class="getRankClass(index + 1)">
                    {{ index + 1 }}
                  </span>
                </td>
                <td>{{ item.name }}</td>
                <td>{{ getCategoryName(item.category) }}</td>
                <td>{{ item.sales }}</td>
                <td>¥{{ formatNumber(item.amount) }}</td>
                <td>¥{{ item.price.toFixed(2) }}</td>
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
                :key="product.id" 
                :value="product.id"
              >
                {{ product.name }}
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
import axios from 'axios'

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
const overview = reactive({
  hotProducts: 128,
  totalSales: 56800,
  totalAmount: 1256800,
  avgPrice: 22.15
})

// 热销数据
const topSalesData = ref<any[]>([])

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

// 格式化数字（添加千位分隔符）
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

// 获取分类名称
const getCategoryName = (category: string): string => {
  const categories: Record<string, string> = {
    prescription: '处方药',
    otc: '非处方药',
    health: '保健品',
    medical: '医疗器械'
  }
  return categories[category] || category
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
}

// 加载热销数据
const loadHotSalesData = async () => {
  try {
    // 这里应该是实际的API调用
    // const response = await axios.get('/api/statistics/hot-sales', {
    //   params: {
    //     startDate: filter.startDate,
    //     endDate: filter.endDate,
    //     category: filter.category,
    //     rankType: filter.rankType
    //   }
    // })
    
    // 使用模拟数据
    topSalesData.value = [
      {
        id: '1',
        name: '阿莫西林胶囊',
        category: 'prescription',
        sales: 1250,
        amount: 32500,
        price: 26.00
      },
      {
        id: '2',
        name: '布洛芬片',
        category: 'otc',
        sales: 980,
        amount: 18200,
        price: 18.50
      },
      {
        id: '3',
        name: '维生素C片',
        category: 'health',
        sales: 870,
        amount: 27840,
        price: 32.00
      },
      {
        id: '4',
        name: '板蓝根颗粒',
        category: 'otc',
        sales: 760,
        amount: 17100,
        price: 22.50
      },
      {
        id: '5',
        name: '感冒灵颗粒',
        category: 'otc',
        sales: 650,
        amount: 18590,
        price: 28.60
      },
      {
        id: '6',
        name: '头孢拉定胶囊',
        category: 'prescription',
        sales: 540,
        amount: 21600,
        price: 40.00
      },
      {
        id: '7',
        name: '奥美拉唑肠溶片',
        category: 'prescription',
        sales: 430,
        amount: 23650,
        price: 55.00
      },
      {
        id: '8',
        name: '复方甘草片',
        category: 'otc',
        sales: 380,
        amount: 11400,
        price: 30.00
      },
      {
        id: '9',
        name: '硝酸甘油片',
        category: 'prescription',
        sales: 320,
        amount: 16000,
        price: 50.00
      },
      {
        id: '10',
        name: '藿香正气水',
        category: 'otc',
        sales: 290,
        amount: 8700,
        price: 30.00
      }
    ]
    
    renderTopSalesChart()
    renderCategoryChart()
    
  } catch (error) {
    console.error('加载热销数据失败:', error)
  }
}

// 加载商品趋势数据
const loadProductTrend = () => {
  if (!selectedProduct.value) return
  renderTrendChart()
}

// 渲染热销排行榜
const renderTopSalesChart = () => {
  if (!topSalesChart.value) return
  
  if (!topSalesChartInstance) {
    topSalesChartInstance = echarts.init(topSalesChart.value)
  }
  
  const names = topSalesData.value.map(item => item.name)
  const values = topSalesData.value.map(item => 
    filter.rankType === 'sales' ? item.sales : item.amount
  )
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const item = topSalesData.value[params[0]. dataIndex]
        const unit = filter.rankType === 'sales' ? '件' : '元'
        return `${item.name}<br/>${params[0].seriesName}: ${params[0].value}${unit}`
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
      data: names
    },
    series: [
      {
        name: filter.rankType === 'sales' ? '销量' : '销售额',
        type: 'bar',
        data: values,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#1890ff' }
          ])
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
  if (!categoryChart.value) return
  
  if (!categoryChartInstance) {
    categoryChartInstance = echarts.init(categoryChart.value)
  }
  
  const categoryData = [
    { value: 45, name: '处方药' },
    { value: 32, name: '非处方药' },
    { value: 15, name: '保健品' },
    { value: 8, name: '医疗器械' }
  ]
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
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
            formatter: '{b}\n{d}%'
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
const renderTrendChart = () => {
  if (!trendChart.value) return
  
  if (!trendChartInstance) {
    trendChartInstance = echarts.init(trendChart.value)
  }
  
  const months = ['1月', '2月', '3月', '4月', '5月', '6月']
  const salesData = [120, 132, 101, 134, 90, 230]
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: months
    },
    yAxis: {
      type: 'value'
    },
    series: [{
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