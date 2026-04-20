<!-- src/views/DrugStore/SalesRecords.vue -->
<template>
  <div class="sales-records">
    <h2>销售记录</h2>
    
    <!-- 查询条件 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-item">
          <label for="startDate">开始日期:</label>
          <el-date-picker
            id="startDate"
            v-model="filter.startDate"
            type="date"
            placeholder="选择开始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%;"
          />
        </div>
        <div class="filter-item">
          <label for="endDate">结束日期:</label>
          <el-date-picker
            id="endDate"
            v-model="filter.endDate"
            type="date"
            placeholder="选择结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%;"
          />
        </div>
        <div class="filter-item">
          <label for="keyword">关键字:</label>
          <el-input
            id="keyword"
            v-model="filter.keyword"
            placeholder="订单号/药品名称"
            clearable
          />
        </div>
        <div class="filter-actions">
          <el-button type="primary" @click="searchRecords">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="resetFilter">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-label">总销售额</div>
        <div class="stat-value">¥{{ stats.totalSalesAmount.toFixed(2) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">订单数量</div>
        <div class="stat-value">{{ stats.totalOrderCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">商品总数</div>
        <div class="stat-value">{{ stats.totalProductQuantity }}</div>
      </div>
    </div>

    <!-- 销售记录表格 -->
    <div class="records-table" v-loading="loading">
      <el-table
        :data="records"
        stripe
        style="width: 100%"
        empty-text="暂无销售记录"
      >
        <el-table-column prop="orderNo" label="订单号" width="200" />
        <el-table-column label="销售时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.orderTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalQuantity" label="商品数量" width="100" align="center" />
        <el-table-column label="总金额" width="120" align="right">
          <template #default="{ row }">
            <span class="amount-text">¥{{ (row.totalAmount || 0).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作员" width="100" align="center" />
        <el-table-column label="操作" fixed="right" min-width="100">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalRecords"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 订单详情弹窗 -->
    <el-dialog
      v-model="showDetailModal"
      title="订单详情"
      width="700px"
    >
      <div v-if="selectedRecord" class="order-detail">
        <div class="detail-info">
          <div class="info-row">
            <span class="label">订单号:</span>
            <span class="value">{{ selectedRecord.orderNo }}</span>
          </div>
          <div class="info-row">
            <span class="label">销售时间:</span>
            <span class="value">{{ formatDateTime(selectedRecord.orderTime) }}</span>
          </div>
          <div class="info-row">
            <span class="label">操作员:</span>
            <span class="value">{{ selectedRecord.operator }}</span>
          </div>
          <div class="info-row">
            <span class="label">商品数量:</span>
            <span class="value">{{ selectedRecord.totalQuantity }} 件</span>
          </div>
          <div class="info-row highlight">
            <span class="label">总金额:</span>
            <span class="value amount">¥{{ (selectedRecord.totalAmount || 0).toFixed(2) }}</span>
          </div>
        </div>
        
        <!-- 订单明细 -->
        <div v-if="selectedRecord.items && selectedRecord.items.length > 0" class="items-section">
          <h4>订单明细</h4>
          <el-table :data="selectedRecord.items" border size="small">
            <el-table-column prop="drugName" label="药品名称" />
            <el-table-column prop="drugCode" label="药品编码" width="120" />
            <el-table-column prop="batchNumber" label="批号" width="120" />
            <el-table-column prop="quantity" label="数量" width="80" align="center" />
            <el-table-column prop="unitPrice" label="单价" width="100" align="right">
              <template #default="{ row }">
                ¥{{ (row.unitPrice || 0).toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="小计" width="100" align="right">
              <template #default="{ row }">
                ¥{{ (row.amount || 0).toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showDetailModal = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'

interface OrderItem {
  id?: number
  drugInventoryId?: number
  drugName?: string
  drugCode?: string
  batchNumber?: string
  quantity?: number
  unitPrice?: number
  amount?: number
}

interface SalesRecordVO {
  orderNo: string
  orderTime: string | number[]
  totalQuantity: number
  totalAmount: number
  operator: string
  items?: OrderItem[]
}

interface SalesSummaryVO {
  totalSalesAmount: number
  totalOrderCount: number
  totalProductQuantity: number
}

// 查询过滤条件
const filter = reactive({
  startDate: '',
  endDate: '',
  keyword: ''
})

// 分页信息
const currentPage = ref(1)
const pageSize = ref(10)
const totalRecords = ref(0)
const loading = ref(false)

// 销售统计数据
const stats = reactive<SalesSummaryVO>({
  totalSalesAmount: 0,
  totalOrderCount: 0,
  totalProductQuantity: 0
})

// 销售记录数据
const records = ref<SalesRecordVO[]>([])

// 详情弹窗状态
const showDetailModal = ref(false)
const selectedRecord = ref<SalesRecordVO | null>(null)

// 初始化日期范围为最近一周
const initDateRange = () => {
  const today = new Date()
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  filter.endDate = formatDate(today)
  filter.startDate = formatDate(oneWeekAgo)
}

// 格式化日期为 YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 格式化日期时间 - 处理后端返回的 LocalDateTime 数组格式
const formatDateTime = (dateTime: string | number[] | undefined): string => {
  if (!dateTime) return '-'
  
  // 如果是数组格式 [年, 月, 日, 时, 分, 秒]
  if (Array.isArray(dateTime)) {
    const [year, month, day, hour, minute, second] = dateTime
    const formattedMonth = String(month).padStart(2, '0')
    const formattedDay = String(day).padStart(2, '0')
    const formattedHour = String(hour).padStart(2, '0')
    const formattedMinute = String(minute).padStart(2, '0')
    const formattedSecond = String(second || 0).padStart(2, '0')
    return `${year}-${formattedMonth}-${formattedDay} ${formattedHour}:${formattedMinute}:${formattedSecond}`
  }
  
  // 如果是字符串格式,直接处理
  if (typeof dateTime === 'string') {
    return dateTime.replace('T', ' ').substring(0, 19)
  }
  
  return '-'
}

// 加载汇总统计
const loadSummary = async () => {
  try {
    const params: any = {}
    if (filter.startDate) params.startDate = filter.startDate
    if (filter.endDate) params.endDate = filter.endDate
    
    const response = await axios.get('/api/sales/records/summary', { params })
    
    if (response.data.code === 1 && response.data.data) {
      const summary = response.data.data
      stats.totalSalesAmount = summary.totalSalesAmount || 0
      stats.totalOrderCount = summary.totalOrderCount || 0
      stats.totalProductQuantity = summary.totalProductQuantity || 0
    }
  } catch (error) {
    console.error('加载汇总统计失败:', error)
  }
}

// 加载销售记录列表
const loadRecords = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      size: pageSize.value
    }
    
    // 添加筛选条件
    if (filter.startDate) params.startDate = filter.startDate
    if (filter.endDate) params.endDate = filter.endDate
    
    // 判断关键字是订单号还是药品名称
    if (filter.keyword) {
      // 简单判断：如果包含字母或数字组合，可能是订单号；否则认为是药品名称
      if (/^[A-Za-z0-9]+$/.test(filter.keyword)) {
        params.orderNo = filter.keyword
      } else {
        params.drugName = filter.keyword
      }
    }
    
    console.log('查询销售记录参数:', params)
    
    const response = await axios.get('/api/sales/records', { params })
    
    console.log('销售记录响应:', response.data)
    
    if (response.data.code === 1 && response.data.data) {
      records.value = response.data.data.records || []
      totalRecords.value = response.data.data.total || 0
    } else {
      ElMessage.error(response.data.msg || '加载销售记录失败')
    }
  } catch (error) {
    console.error('加载销售记录失败:', error)
    ElMessage.error('加载销售记录失败，请重试')
  } finally {
    loading.value = false
  }
}

// 搜索记录
const searchRecords = () => {
  currentPage.value = 1
  Promise.all([loadRecords(), loadSummary()])
}

// 重置筛选条件
const resetFilter = () => {
  filter.keyword = ''
  initDateRange()
  searchRecords()
}

// 查看详情 - 调用订单详情接口获取完整信息
const viewDetail = async (record: SalesRecordVO) => {
  try {
    // 由于列表中没有订单ID,需要先通过订单号查找订单ID
    // 方案1: 如果后端支持通过订单号查询详情
    // const response = await axios.get(`/api/sales/order/by-no/${record.orderNo}`)
    
    // 方案2: 先调用订单列表接口,通过订单号过滤获取订单ID
    const listResponse = await axios.get('/api/sales/orders', {
      params: {
        orderNo: record.orderNo,
        page: 1,
        size: 1
      }
    })
    
    if (listResponse.data.code === 1 && listResponse.data.data?.records?.length > 0) {
      const orderId = listResponse.data.data.records[0].id
      
      // 调用订单详情接口获取完整信息(包括items)
      const detailResponse = await axios.get(`/api/sales/order/${orderId}`)
      
      if (detailResponse.data.code === 1 && detailResponse.data.data) {
        selectedRecord.value = detailResponse.data.data
        showDetailModal.value = true
      } else {
        ElMessage.error(detailResponse.data.msg || '加载订单详情失败')
      }
    } else {
      ElMessage.error('未找到该订单')
    }
  } catch (error) {
    console.error('加载订单详情失败:', error)
    ElMessage.error('加载订单详情失败,请重试')
  }
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  loadRecords()
}

// 当前页变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadRecords()
}

// 组件挂载时初始化
onMounted(() => {
  initDateRange()
  Promise.all([loadRecords(), loadSummary()])
})
</script>

<style scoped lang="scss">
.sales-records {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  
  h2 {
    margin-bottom: 24px;
    color: #303133;
    font-size: 24px;
  }
}

.filter-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  min-width: 200px;
  flex: 1;
  
  label {
    margin-bottom: 8px;
    font-weight: 500;
    color: #606266;
    font-size: 14px;
  }
}

.filter-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 1px;
}

.stats-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  flex: 1;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 12px;
  font-weight: 500;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #ff6b00;
}

.records-table {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.amount-text {
  color: #ff6b00;
  font-weight: 600;
  font-size: 14px;
}

.pagination-section {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 订单详情 */
.order-detail {
  .detail-info {
    margin-bottom: 20px;
    
    .info-row {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      &.highlight {
        background: linear-gradient(135deg, rgba(147, 205, 252, 0.1) 0%, rgba(107, 163, 214, 0.1) 100%);
        margin: 12px -20px -20px -20px;
        padding: 16px 20px;
        border-radius: 0 0 12px 12px;
      }
      
      .label {
        width: 100px;
        font-size: 14px;
        color: #909399;
        font-weight: 500;
      }
      
      .value {
        flex: 1;
        font-size: 14px;
        color: #303133;
        
        &.amount {
          font-size: 20px;
          color: #ff6b00;
          font-weight: 700;
        }
      }
    }
  }
  
  .items-section {
    margin-top: 20px;
    
    h4 {
      margin-bottom: 12px;
      color: #303133;
      font-size: 16px;
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sales-records {
    padding: 16px;
  }
  
  .filter-row {
    flex-direction: column;
    
    .filter-item {
      width: 100%;
    }
  }
  
  .stats-section {
    flex-direction: column;
  }
  
  .stat-value {
    font-size: 24px;
  }
}
</style>
