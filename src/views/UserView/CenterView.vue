<!-- src/views/UserView/CenterView.vue -->
<template>
  <div class="integration-center">
    <!-- 页面标题 -->
    <el-page-header title="返回" content="数据中心" @back="goBack" class="mb-4" />
    
    <!-- 数据概览卡片 -->
    <el-row :gutter="16" class="mb-4">
      <el-col :xs="24" :sm="12" :md="6" v-for="item in overviewCards" :key="item.title">
        <el-card shadow="hover" class="overview-card">
          <div class="overview-content">
            <div class="overview-icon" :style="{ background: item.color }">
              <el-icon :size="24"><component :is="item.icon" /></el-icon>
            </div>
            <div class="overview-info">
              <div class="overview-title">{{ item.title }}</div>
              <div class="overview-value">{{ item.value }}</div>
              <div class="overview-change" :class="item.change >= 0 ? 'positive' : 'negative'">
                <el-icon><component :is="item.change >= 0 ? 'CaretTop' : 'CaretBottom'" /></el-icon>
                {{ Math.abs(item.change) }}% 同比
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 销售趋势与库存预警 -->
    <el-row :gutter="16" class="mb-4">
      <!-- 左侧：销售趋势图 -->
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>销售趋势分析</span>
              <el-radio-group v-model="trendType" size="small" @change="loadSalesTrend">
                <el-radio-button label="daily">日</el-radio-button>
                <el-radio-button label="monthly">月</el-radio-button>
                <el-radio-button label="yearly">年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="salesTrendChart" class="chart-wrapper" v-loading="trendLoading"></div>
        </el-card>
      </el-col>

      <!-- 右侧：库存预警列表 -->
      <el-col :xs="24" :lg="8">
        <el-card class="alert-card">
          <template #header>
            <div class="card-header">
              <span>库存预警</span>
              <el-tag type="danger" effect="dark">{{ alertCount }} 条预警</el-tag>
            </div>
          </template>
          <el-scrollbar height="400px">
            <div v-if="inventoryAlerts.length > 0" class="alert-list">
              <div 
                v-for="item in inventoryAlerts" 
                :key="item.id" 
                class="alert-item"
                :class="getAlertClass(item.stockStatus)"
              >
                <div class="alert-header">
                  <el-tag :type="getStockStatusType(item.stockStatus)" size="small">
                    {{ getStockStatusText(item.stockStatus) }}
                  </el-tag>
                  <span class="alert-time">{{ formatDateArray(item.expiryDate) }}</span>
                </div>
                <div class="alert-content">
                  <div class="drug-name">{{ item.drugName }}</div>
                  <div class="drug-info">
                    <span>编码: {{ item.drugCode }}</span>
                    <span>库存: {{ item.stockQuantity }}{{ item.unit }}</span>
                  </div>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无库存预警" :image-size="80" />
          </el-scrollbar>
        </el-card>
      </el-col>
    </el-row>

    <!-- 热销排行与分类占比 -->
    <el-row :gutter="16">
      <!-- 左侧：热销商品排行 -->
      <el-col :xs="24" :md="16">
        <el-card class="rank-card">
          <template #header>
            <div class="card-header">
              <span>热销商品排行榜</span>
              <el-select v-model="rankType" size="small" style="width: 120px" @change="loadHotSales">
                <el-option label="按销量" value="sales" />
                <el-option label="按销售额" value="amount" />
                <el-option label="按订单数" value="orderCount" />
              </el-select>
            </div>
          </template>
          <el-table :data="hotSalesData" stripe max-height="450" v-loading="rankLoading">
            <el-table-column label="排名" width="80" align="center">
              <template #default="{ $index }">
                <span :class="getRankClass($index + 1)">
                  {{ $index + 1 }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="drugName" label="商品名称" min-width="150" show-overflow-tooltip />
            <el-table-column prop="category" label="分类" width="100" align="center">
              <template #default="{ row }">
                {{ getCategoryName(row.category) }}
              </template>
            </el-table-column>
            <el-table-column label="销量" width="100" align="right">
              <template #default="{ row }">
                {{ formatNumber(row.totalSales) }}
              </template>
            </el-table-column>
            <el-table-column label="销售额" width="120" align="right">
              <template #default="{ row }">
                <span class="amount-text">¥{{ formatNumber(row.totalAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="平均单价" width="100" align="right">
              <template #default="{ row }">
                ¥{{ row.avgPrice.toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧：分类销售占比 -->
      <el-col :xs="24" :md="8">
        <el-card class="pie-card">
          <template #header>
            <div class="card-header">
              <span>分类销售占比</span>
            </div>
          </template>
          <div ref="categoryPieChart" class="chart-wrapper" v-loading="pieLoading"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { 
  getOverview, 
  getSalesTrend, 
  getHotSalesStats,
  getCategoryProportion,
  type OverviewData,
  type SalesTrendPoint,
  type HotSalesItem,
  type CategoryProportion
} from '@/services/statisticsService'
import { 
  drugInventoryService, 
  type DrugInventory,
  getStockStatusText,
  getStockStatusType,
  getCategoryName,
  formatDateArray,
  StockStatus
} from '@/services/drugInventoryService'

// 路由实例
const router = useRouter()

// 图表DOM引用
const salesTrendChart = ref<HTMLDivElement | null>(null)
const categoryPieChart = ref<HTMLDivElement | null>(null)

// ECharts实例
let trendChartInstance: echarts.ECharts | null = null
let pieChartInstance: echarts.ECharts | null = null

// 加载状态
const trendLoading = ref(false)
const rankLoading = ref(false)
const pieLoading = ref(false)

// 趋势类型
const trendType = ref<'daily' | 'monthly' | 'yearly'>('daily')

// 排行类型
const rankType = ref<'sales' | 'amount' | 'orderCount'>('sales')

// 初始化日期范围（最近30天）
const initDateRange = () => {
  const today = new Date()
  const oneMonthAgo = new Date(today)
  oneMonthAgo.setDate(today.getDate() - 30)
  
  return {
    startDate: formatDate(oneMonthAgo),
    endDate: formatDate(today)
  }
}

// 格式化日期为 YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 格式化数字
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 获取排名样式类
const getRankClass = (rank: number): string => {
  if (rank === 1) return 'rank-first'
  if (rank === 2) return 'rank-second'
  if (rank === 3) return 'rank-third'
  return 'rank-normal'
}

// 获取预警项样式类
const getAlertClass = (status: number): string => {
  switch (status) {
    case StockStatus.OUT_OF_STOCK:
      return 'alert-danger'
    case StockStatus.SHORTAGE:
      return 'alert-warning'
    default:
      return ''
  }
}

// 日期范围
const dateRange = reactive(initDateRange())

// 概览数据
const overviewData = ref<OverviewData>({
  totalSalesAmount: 0,
  totalOrderCount: 0,
  totalProductQuantity: 0,
  totalDrugVariety: 0,
  avgOrderAmount: 0
})

// 计算属性：概览卡片数据
const overviewCards = computed(() => [
  {
    title: '销售总额',
    value: `¥${formatNumber(overviewData.value.totalSalesAmount)}`,
    change: 12.5,
    icon: 'Money',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    title: '订单总数',
    value: formatNumber(overviewData.value.totalOrderCount),
    change: 8.3,
    icon: 'ShoppingCart',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    title: '药品种类',
    value: formatNumber(overviewData.value.totalDrugVariety),
    change: -2.1,
    icon: 'Goods',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    title: '平均客单价',
    value: `¥${overviewData.value.avgOrderAmount.toFixed(2)}`,
    change: 5.7,
    icon: 'TrendCharts',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  }
])

// 热销数据
const hotSalesData = ref<HotSalesItem[]>([])

// 库存预警数据（缺货和紧缺的商品）
const inventoryAlerts = ref<DrugInventory[]>([])

// 计算预警数量
const alertCount = computed(() => inventoryAlerts.value.length)

// 返回上一页
const goBack = () => {
  router.back()
}

// 加载概览数据
const loadOverview = async () => {
  try {
    const data = await getOverview({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    })
    overviewData.value = data
  } catch (error: any) {
    console.error('加载概览数据失败:', error)
    ElMessage.error(error.message || '加载概览数据失败')
  }
}

// 加载销售趋势数据
const loadSalesTrend = async () => {
  trendLoading.value = true
  try {
    const data = await getSalesTrend({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      statType: trendType.value
    })
    renderSalesTrendChart(data)
  } catch (error: any) {
    console.error('加载销售趋势失败:', error)
    ElMessage.error(error.message || '加载销售趋势失败')
  } finally {
    trendLoading.value = false
  }
}

// 渲染销售趋势图
const renderSalesTrendChart = (data: SalesTrendPoint[]) => {
  if (!salesTrendChart.value || data.length === 0) return
  
  if (!trendChartInstance) {
    trendChartInstance = echarts.init(salesTrendChart.value)
  }
  
  const dates = data.map(item => item.date)
  const sales = data.map(item => item.sales)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        return `${params[0].name}<br/>销售额: ¥${formatNumber(params[0].value)}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
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
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(102, 126, 234, 0.5)' },
          { offset: 1, color: 'rgba(102, 126, 234, 0.1)' }
        ])
      },
      itemStyle: {
        color: '#667eea'
      },
      lineStyle: {
        width: 3
      }
    }]
  }
  
  trendChartInstance.setOption(option)
}

// 加载热销商品数据
const loadHotSales = async () => {
  rankLoading.value = true
  try {
    const data = await getHotSalesStats({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      rankType: rankType.value
    })
    hotSalesData.value = data.slice(0, 10) // 只显示前10名
  } catch (error: any) {
    console.error('加载热销商品失败:', error)
    ElMessage.error(error.message || '加载热销商品失败')
  } finally {
    rankLoading.value = false
  }
}

// 加载分类占比数据
const loadCategoryProportion = async () => {
  pieLoading.value = true
  try {
    const data = await getCategoryProportion({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    })
    renderCategoryPieChart(data)
  } catch (error: any) {
    console.error('加载分类占比失败:', error)
    ElMessage.error(error.message || '加载分类占比失败')
  } finally {
    pieLoading.value = false
  }
}

// 渲染分类饼图
const renderCategoryPieChart = (data: CategoryProportion[]) => {
  if (!categoryPieChart.value || data.length === 0) return
  
  if (!pieChartInstance) {
    pieChartInstance = echarts.init(categoryPieChart.value)
  }
  
  const chartData = data.map(item => ({
    name: getCategoryName(item.category),
    value: item.amount
  }))
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.name}<br/>销售额: ¥${formatNumber(params.value)} (${params.percent}%)`
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    series: [{
      name: '销售占比',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['60%', '50%'],
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
          fontSize: '16',
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
    }]
  }
  
  pieChartInstance.setOption(option)
}

// 加载库存预警数据
const loadInventoryAlerts = async () => {
  try {
    // 查询缺货和紧缺的商品
    const [outOfStock, shortage] = await Promise.all([
      drugInventoryService.getInventoryList({
        stockStatus: StockStatus.OUT_OF_STOCK,
        page: 1,
        size: 5
      }),
      drugInventoryService.getInventoryList({
        stockStatus: StockStatus.SHORTAGE,
        page: 1,
        size: 5
      })
    ])
    
    // 合并并排序（优先显示缺货商品）
    const alerts = [
      ...outOfStock.records,
      ...shortage.records
    ].slice(0, 10) // 最多显示10条
    
    inventoryAlerts.value = alerts
  } catch (error: any) {
    console.error('加载库存预警失败:', error)
  }
}

// 窗口大小改变时重绘图表
const handleResize = () => {
  if (trendChartInstance) trendChartInstance.resize()
  if (pieChartInstance) pieChartInstance.resize()
}

// 组件挂载时初始化
onMounted(async () => {
  await Promise.all([
    loadOverview(),
    loadSalesTrend(),
    loadHotSales(),
    loadCategoryProportion(),
    loadInventoryAlerts()
  ])
  
  window.addEventListener('resize', handleResize)
})

// 组件卸载前清理
onBeforeUnmount(() => {
  if (trendChartInstance) trendChartInstance.dispose()
  if (pieChartInstance) pieChartInstance.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.integration-center {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.mb-4 {
  margin-bottom: 16px;
}

// 概览卡片
.overview-card {
  height: 140px;
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
  
  :deep(.el-card__body) {
    padding: 0;
    height: 100%;
  }
}

.overview-content {
  display: flex;
  align-items: center;
  padding: 20px;
  height: 100%;
}

.overview-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 16px;
  flex-shrink: 0;
}

.overview-info {
  flex: 1;
}

.overview-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.overview-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 4px;
}

.overview-change {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &.positive {
    color: #67c23a;
  }
  
  &.negative {
    color: #f56c6c;
  }
}

// 卡片头部
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

// 图表卡片
.chart-card,
.alert-card,
.rank-card,
.pie-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.chart-wrapper {
  width: 100%;
  height: 350px;
}

// 预警列表
.alert-list {
  padding: 8px;
}

.alert-item {
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  border-left: 4px solid transparent;
  background: #fafafa;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f5f5f5;
    transform: translateX(4px);
  }
  
  &.alert-danger {
    border-left-color: #f56c6c;
    background: #fef0f0;
  }
  
  &.alert-warning {
    border-left-color: #e6a23c;
    background: #fdf6ec;
  }
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.alert-time {
  font-size: 12px;
  color: #909399;
}

.alert-content {
  .drug-name {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
  }
  
  .drug-info {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #606266;
  }
}

// 排名样式
.rank-first {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
  border-radius: 50%;
  font-weight: bold;
}

.rank-second {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background: linear-gradient(135deg, #ffa502 0%, #ff8c00 100%);
  color: white;
  border-radius: 50%;
  font-weight: bold;
}

.rank-third {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
  color: white;
  border-radius: 50%;
  font-weight: bold;
}

.rank-normal {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background: #f0f0f0;
  color: #606266;
  border-radius: 50%;
  font-weight: 500;
}

// 金额文本
.amount-text {
  color: #ff6b00;
  font-weight: 600;
}

// 响应式设计
@media (max-width: 768px) {
  .integration-center {
    padding: 16px;
  }
  
  .overview-card {
    height: auto;
    margin-bottom: 12px;
  }
  
  .overview-content {
    flex-direction: column;
    text-align: center;
  }
  
  .overview-icon {
    margin-right: 0;
    margin-bottom: 12px;
  }
  
  .chart-wrapper {
    height: 250px;
  }
}
</style>