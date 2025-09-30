<!-- src/views/DrugStore/SalesRecords.vue -->
<template>
  <div class="sales-records">
    <h2>销售记录</h2>
    
    <!-- 查询条件 -->
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
          <label for="keyword">关键字:</label>
          <input 
            id="keyword" 
            type="text" 
            v-model="filter.keyword" 
            placeholder="药品名称/订单号"
          />
        </div>
        <div class="filter-actions">
          <button @click="searchRecords">查询</button>
          <button @click="resetFilter">重置</button>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-label">总销售额</div>
        <div class="stat-value">¥{{ stats.totalAmount.toFixed(2) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">订单数量</div>
        <div class="stat-value">{{ stats.orderCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">商品总数</div>
        <div class="stat-value">{{ stats.totalItems }}</div>
      </div>
    </div>

    <!-- 销售记录表格 -->
    <div class="records-table">
      <table>
        <thead>
          <tr>
            <th>订单号</th>
            <th>销售时间</th>
            <th>商品数量</th>
            <th>总金额</th>
            <th>操作员</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in records" :key="record.id">
            <td>{{ record.orderNo }}</td>
            <td>{{ formatDateTime(record.saleTime) }}</td>
            <td>{{ record.itemCount }}</td>
            <td>¥{{ record.totalAmount.toFixed(2) }}</td>
            <td>{{ record.operator }}</td>
            <td>
              <button class="detail-btn" @click="viewDetail(record)">详情</button>
            </td>
          </tr>
          <tr v-if="records.length === 0">
            <td colspan="6" class="no-data">暂无销售记录</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <button 
        :disabled="currentPage === 1" 
        @click="changePage(currentPage - 1)"
      >
        上一页
      </button>
      <span class="page-info">
        第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
      </span>
      <button 
        :disabled="currentPage === totalPages" 
        @click="changePage(currentPage + 1)"
      >
        下一页
      </button>
    </div>

    <!-- 订单详情弹窗 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>订单详情</h3>
          <button class="close-btn" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body">
          <div class="order-info">
            <div class="info-row">
              <span>订单号:</span>
              <span>{{ selectedRecord?.orderNo }}</span>
            </div>
            <div class="info-row">
              <span>销售时间:</span>
              <span>{{ selectedRecord ? formatDateTime(selectedRecord.saleTime) : '' }}</span>
            </div>
            <div class="info-row">
              <span>操作员:</span>
              <span>{{ selectedRecord?.operator }}</span>
            </div>
          </div>
          
          <div class="items-table">
            <table>
              <thead>
                <tr>
                  <th>药品名称</th>
                  <th>规格</th>
                  <th>单价</th>
                  <th>数量</th>
                  <th>小计</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in selectedRecord?.items" :key="item.id">
                  <td>{{ item.name }}</td>
                  <td>{{ item.specification }}</td>
                  <td>¥{{ item.price.toFixed(2) }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>¥{{ (item.price * item.quantity).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="order-total">
            <div class="total-row">
              <span>商品总数:</span>
              <span>{{ selectedRecord?.itemCount }}</span>
            </div>
            <div class="total-row">
              <span>总金额:</span>
              <span class="amount">¥{{ selectedRecord?.totalAmount.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

interface SaleItem {
  id: string
  name: string
  specification: string
  price: number
  quantity: number
}

interface SalesRecord {
  id: string
  orderNo: string
  saleTime: string
  itemCount: number
  totalAmount: number
  operator: string
  items: SaleItem[]
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

// 销售统计数据
const stats = reactive({
  totalAmount: 12850.60,
  orderCount: 128,
  totalItems: 326
})

// 销售记录数据
const records = ref<SalesRecord[]>([])

// 详情弹窗状态
const showDetailModal = ref(false)
const selectedRecord = ref<SalesRecord | null>(null)

// 总页数计算
const totalPages = computed(() => {
  return Math.ceil(totalRecords.value / pageSize.value)
})

// 初始化日期范围为最近一周
const initDateRange = () => {
  const today = new Date()
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  filter.endDate = formatDate(today)
  filter.startDate = formatDate(oneWeekAgo)
}

// 格式化日期为 YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

// 格式化日期时间
const formatDateTime = (dateTimeStr: string): string => {
  return dateTimeStr.replace('T', ' ').substring(0, 16)
}

// 搜索记录
const searchRecords = () => {
  // 这里应该是调用API获取数据
  // 暂时使用模拟数据
  
  // 重置到第一页
  currentPage.value = 1
  loadRecords()
}

// 重置筛选条件
const resetFilter = () => {
  filter.keyword = ''
  initDateRange()
  searchRecords()
}

// 加载记录数据
const loadRecords = () => {
  // 模拟API调用
  const mockData: SalesRecord[] = [
    {
      id: '1',
      orderNo: 'ORD20230701001',
      saleTime: '2023-07-01T10:30:00',
      itemCount: 3,
      totalAmount: 78.90,
      operator: '张三',
      items: [
        {
          id: '101',
          name: '阿莫西林胶囊',
          specification: '0.25g*24粒',
          price: 25.80,
          quantity: 1
        },
        {
          id: '102',
          name: '布洛芬片',
          specification: '0.1g*20片',
          price: 18.50,
          quantity: 2
        }
      ]
    },
    {
      id: '2',
      orderNo: 'ORD20230701002',
      saleTime: '2023-07-01T11:45:00',
      itemCount: 2,
      totalAmount: 65.00,
      operator: '李四',
      items: [
        {
          id: '103',
          name: '维生素C片',
          specification: '100mg*100片',
          price: 32.00,
          quantity: 1
        },
        {
          id: '104',
          name: '板蓝根颗粒',
          specification: '10g*10袋',
          price: 22.50,
          quantity: 1
        }
      ]
    },
    {
      id: '3',
      orderNo: 'ORD20230701003',
      saleTime: '2023-07-01T14:20:00',
      itemCount: 1,
      totalAmount: 28.60,
      operator: '王五',
      items: [
        {
          id: '105',
          name: '感冒灵颗粒',
          specification: '10g*9袋',
          price: 28.60,
          quantity: 1
        }
      ]
    }
  ]
  
  records.value = mockData
  totalRecords.value = mockData.length
}

// 查看详情
const viewDetail = (record: SalesRecord) => {
  selectedRecord.value = record
  showDetailModal.value = true
}

// 关闭详情弹窗
const closeDetailModal = () => {
  showDetailModal.value = false
  selectedRecord.value = null
}

// 切换页面
const changePage = (page: number) => {
  currentPage.value = page
  loadRecords()
}

// 组件挂载时初始化
onMounted(() => {
  initDateRange()
  loadRecords()
})
</script>

<style scoped>
.sales-records {
  padding: 20px;
  max-width: 1200px;
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
  min-width: 200px;
}

.filter-item label {
  margin-bottom: 5px;
  font-weight: bold;
}

.filter-item input {
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

.stats-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  flex: 1;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
}

.records-table {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
}

.records-table table {
  width: 100%;
  border-collapse: collapse;
}

.records-table th,
.records-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.records-table th {
  background: #fafafa;
  font-weight: bold;
  color: #333;
}

.records-table tbody tr:hover {
  background: #f5f5f5;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.detail-btn {
  background: #1890ff;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.page-info {
  color: #666;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 4px;
  width: 800px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 20px;
}

.order-info {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  margin-bottom: 10px;
}

.info-row span:first-child {
  width: 100px;
  font-weight: bold;
}

.items-table {
  margin-bottom: 20px;
}

.items-table table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th,
.items-table td {
  padding: 10px;
  text-align: left;
  border: 1px solid #ddd;
}

.items-table th {
  background: #fafafa;
}

.order-total {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.total-row:last-child {
  margin-bottom: 0;
}

.amount {
  font-weight: bold;
  color: #ff6b00;
  font-size: 18px;
}
</style>