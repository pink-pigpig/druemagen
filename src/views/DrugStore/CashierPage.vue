<!-- src/views/DrugStore/CashierPage.vue -->
<template>
  <div class="cashier">
    <h2>收银结算 - 待支付订单</h2>
    
    <!-- 搜索和筛选区域 -->
    <div class="filter-section">
      <el-input
        v-model="searchOrderNo"
        placeholder="请输入订单号搜索"
        clearable
        style="width: 300px; margin-right: 16px;"
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><search /></el-icon>
        </template>
      </el-input>
      
      <el-select
        v-model="filterStatus"
        placeholder="订单状态"
        clearable
        style="width: 150px; margin-right: 16px;"
        @change="handleSearch"
      >
        <el-option label="待支付" :value="1" />
        <el-option label="已支付" :value="2" />
        <el-option label="已完成" :value="3" />
        <el-option label="已取消" :value="4" />
      </el-select>
      
      <el-button type="primary" @click="handleSearch">
        <el-icon><search /></el-icon>
        搜索
      </el-button>
      
      <el-button @click="handleReset">
        <el-icon><refresh /></el-icon>
        重置
      </el-button>
    </div>

    <!-- 订单列表表格 -->
    <div class="order-table-section">
      <el-table
        v-loading="loading"
        :data="orderList"
        stripe
        style="width: 100%"
        empty-text="暂无待支付订单"
      >
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="orderTime" label="下单时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.orderTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalQuantity" label="商品数量" width="100" align="center" />
        <el-table-column prop="totalAmount" label="订单金额" width="120" align="right">
          <template #default="{ row }">
            <span class="amount-text">¥{{ (row.totalAmount || 0).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="statusDesc" label="订单状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.statusDesc || getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作员" width="100" align="center" />
        <el-table-column label="操作" fixed="right" min-width="180">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 1"
              type="primary" 
              size="small"
              @click="goToPayment(row)"
            >
              去支付
            </el-button>
            <el-button 
              v-else
              type="info" 
              size="small"
              disabled
            >
              {{ row.statusDesc || getStatusText(row.status) }}
            </el-button>
            <el-button 
              size="small"
              @click="viewOrderDetail(row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页组件 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="700px"
    >
      <div v-if="currentOrder" class="order-detail">
        <div class="detail-row">
          <span class="label">订单号：</span>
          <span class="value">{{ currentOrder.orderNo }}</span>
        </div>
        <div class="detail-row">
          <span class="label">下单时间：</span>
          <span class="value">{{ formatDateTime(currentOrder.orderTime) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">商品数量：</span>
          <span class="value">{{ currentOrder.totalQuantity }} 件</span>
        </div>
        <div class="detail-row">
          <span class="label">订单金额：</span>
          <span class="value amount">¥{{ (currentOrder.totalAmount || 0).toFixed(2) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">订单状态：</span>
          <el-tag :type="getStatusType(currentOrder.status)">
            {{ currentOrder.statusDesc || getStatusText(currentOrder.status) }}
          </el-tag>
        </div>
        <div class="detail-row" v-if="currentOrder.paymentMethodDesc">
          <span class="label">支付方式：</span>
          <span class="value">{{ currentOrder.paymentMethodDesc }}</span>
        </div>
        <div class="detail-row" v-if="currentOrder.paymentTime">
          <span class="label">支付时间：</span>
          <span class="value">{{ formatDateTime(currentOrder.paymentTime) }}</span>
        </div>
        <div class="detail-row" v-if="currentOrder.operator">
          <span class="label">操作员：</span>
          <span class="value">{{ currentOrder.operator }}</span>
        </div>
        <div class="detail-row" v-if="currentOrder.remark">
          <span class="label">备注：</span>
          <span class="value">{{ currentOrder.remark }}</span>
        </div>
        
        <!-- 订单明细 -->
        <div v-if="currentOrder.items && currentOrder.items.length > 0" class="items-section">
          <h4>订单明细</h4>
          <el-table :data="currentOrder.items" border size="small">
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
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button 
          v-if="currentOrder && currentOrder.status === 1"
          type="primary" 
          @click="goToPaymentFromDialog"
        >
          去支付
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'

interface OrderItem {
  drugName?: string
  drugCode?: string
  batchNumber?: string
  quantity?: number
  unitPrice?: number
  amount?: number
}

interface OrderVO {
  id?: number | string
  orderNo?: string
  orderTime?: string
  totalQuantity?: number
  totalAmount?: number
  status?: number
  statusDesc?: string
  paymentMethod?: string
  paymentMethodDesc?: string
  paymentTime?: string
  operator?: string
  remark?: string
  items?: OrderItem[]
}

const router = useRouter()

// 搜索和筛选
const searchOrderNo = ref('')
const filterStatus = ref<number | undefined>(undefined)

// 订单列表数据
const orderList = ref<OrderVO[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 订单详情对话框
const detailDialogVisible = ref(false)
const currentOrder = ref<OrderVO | null>(null)

// 页面加载时获取订单列表
onMounted(() => {
  loadOrderList()
})

// 加载订单列表
const loadOrderList = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      size: pageSize.value
    }
    
    // 添加搜索条件
    if (searchOrderNo.value) {
      params.orderNo = searchOrderNo.value
    }
    if (filterStatus.value !== undefined) {
      params.status = filterStatus.value
    }
    
    console.log('查询订单列表参数:', params)
    
    const response = await axios.get('/api/sales/orders', { params })
    
    console.log('订单列表响应:', response.data)
    
    if (response.data.code === 1 && response.data.data) {
      orderList.value = response.data.data.records || []
      total.value = response.data.data.total || 0
    } else {
      ElMessage.error(response.data.msg || '加载订单列表失败')
    }
  } catch (error) {
    console.error('加载订单列表失败:', error)
    ElMessage.error('加载订单列表失败，请重试')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadOrderList()
}

// 重置
const handleReset = () => {
  searchOrderNo.value = ''
  filterStatus.value = undefined
  currentPage.value = 1
  loadOrderList()
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  loadOrderList()
}

// 当前页变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadOrderList()
}

// 格式化日期时间 - 处理后端返回的 LocalDateTime 数组格式
const formatDateTime = (dateTime: string | number[] | undefined) => {
  if (!dateTime) return '-'
  
  // 如果是数组格式 [年, 月, 日, 时, 分, 秒]
  if (Array.isArray(dateTime)) {
    const [year, month, day, hour, minute, second] = dateTime
    // 月份需要补零
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

// 获取状态文本
const getStatusText = (status: number | undefined) => {
  const statusMap: Record<number, string> = {
    1: '待支付',
    2: '已支付',
    3: '已完成',
    4: '已取消'
  }
  return status ? statusMap[status] || '未知' : '未知'
}

// 获取状态标签类型
const getStatusType = (status: number | undefined) => {
  const typeMap: Record<number, any> = {
    1: 'warning',
    2: 'success',
    3: 'info',
    4: 'danger'
  }
  return status ? typeMap[status] || '' : ''
}

// 查看订单详情
const viewOrderDetail = async (order: OrderVO) => {
  try {
    // 调用详情接口获取完整信息（包括订单明细）
    const response = await axios.get(`/api/sales/order/${order.id}`)
    
    if (response.data.code === 1 && response.data.data) {
      currentOrder.value = response.data.data
      detailDialogVisible.value = true
    } else {
      ElMessage.error(response.data.msg || '加载订单详情失败')
    }
  } catch (error) {
    console.error('加载订单详情失败:', error)
    ElMessage.error('加载订单详情失败，请重试')
  }
}

// 去支付（从列表）
const goToPayment = (order: OrderVO) => {
  router.push({
    name: 'UserPaymentDetail',
    query: {
      orderId: order.id,
      amount: (order.totalAmount || 0).toFixed(2)
    }
  })
}

// 从对话框去支付
const goToPaymentFromDialog = () => {
  if (currentOrder.value) {
    detailDialogVisible.value = false
    goToPayment(currentOrder.value)
  }
}
</script>

<style scoped lang="scss">
.cashier {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  
  h2 {
    margin-bottom: 24px;
    color: #303133;
    font-size: 24px;
  }
}

/* 搜索筛选区域 */
.filter-section {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* 订单表格区域 */
.order-table-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.amount-text {
  color: #ff6b00;
  font-weight: 600;
  font-size: 14px;
}

/* 分页区域 */
.pagination-section {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 订单详情 */
.order-detail {
  .detail-row {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
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
        font-size: 18px;
        color: #ff6b00;
        font-weight: 700;
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
  .cashier {
    padding: 16px;
  }
  
  .filter-section {
    flex-direction: column;
    gap: 12px;
    
    .el-input,
    .el-select {
      width: 100% !important;
      margin-right: 0 !important;
    }
  }
}
</style>
