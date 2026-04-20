<!-- src/views/DrugStore/PaymentDetail.vue -->
<template>
  <div class="payment-detail">
    <h2>收银结算</h2>
    
    <!-- 如果没有订单ID显示提示 -->
    <div v-if="!orderId" class="empty-cart">
      <p>暂无待支付的订单，请先在扫码销售或手动销售页面创建订单。</p>
      <div class="actions">
        <button @click="goToScanSale">去扫码销售</button>
        <button @click="goToCashierList">返回订单列表</button>
      </div>
    </div>
    
    <!-- 订单信息 -->
    <div v-else class="order-info-section">
      <div class="info-card">
        <div class="info-row">
          <span class="label">订单号：</span>
          <span class="value">{{ orderInfo.orderNo || '加载中...' }}</span>
        </div>
        <div class="info-row">
          <span class="label">下单时间：</span>
          <span class="value">{{ formatDateTime(orderInfo.orderTime) }}</span>
        </div>
        <div class="info-row">
          <span class="label">商品数量：</span>
          <span class="value">{{ orderInfo.totalQuantity }} 件</span>
        </div>
        <div class="info-row highlight">
          <span class="label">应付金额：</span>
          <span class="value amount">¥{{ orderAmount }}</span>
        </div>
      </div>
    </div>

    <!-- 支付方式选择 -->
    <div v-if="orderId && !paymentSuccess" class="payment-section">
      <h3>选择支付方式</h3>
      <div class="payment-methods">
        <div 
          v-for="method in paymentMethods" 
          :key="method.value"
          :class="['payment-method', { active: selectedPayment === method.value }]"
          @click="selectedPayment = method.value"
        >
          <el-icon class="method-icon">
            <component :is="method.icon" />
          </el-icon>
          <span class="method-name">{{ method.label }}</span>
          <el-icon v-if="selectedPayment === method.value" class="check-icon">
            <Check />
          </el-icon>
        </div>
      </div>
      
      <!-- 备注输入 -->
      <div class="remark-section">
        <label>备注（可选）：</label>
        <el-input
          v-model="remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
          maxlength="200"
          show-word-limit
        />
      </div>
      
      <!-- 支付按钮 -->
      <div class="payment-actions">
        <el-button 
          type="primary" 
          size="large" 
          :loading="paying"
          :disabled="!selectedPayment"
          @click="confirmPayment"
        >
          确认支付 ¥{{ orderAmount }}
        </el-button>
        <el-button size="large" @click="cancelOrder">取消订单</el-button>
        <el-button size="large" @click="goToCashierList">返回列表</el-button>
      </div>
    </div>

    <!-- 支付成功提示 -->
    <div v-if="paymentSuccess" class="success-section">
      <el-result icon="success" title="支付成功">
        <template #sub-title>
          <p>订单号：{{ orderInfo.orderNo }}</p>
          <p>支付金额：¥{{ orderAmount }}</p>
          <p>支付方式：{{ getPaymentMethodName(selectedPayment) }}</p>
        </template>
        <template #extra>
          <el-button type="primary" @click="goToSalesRecords">查看销售记录</el-button>
          <el-button @click="continueSale">继续销售</el-button>
          <el-button @click="goToCashierList">返回订单列表</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Wallet, CreditCard, Money, Check } from '@element-plus/icons-vue'

interface OrderInfo {
  id?: number | string
  orderNo?: string
  orderTime?: string | number[]
  totalQuantity?: number
  totalAmount?: number
  status?: number
  statusDesc?: string
  paymentMethod?: string
  paymentMethodDesc?: string
  paymentTime?: string | number[]
  operator?: string
  remark?: string
}

const router = useRouter()
const route = useRoute()

// 订单ID和金额
const orderId = ref<number | string>('')
const orderAmount = ref('0.00')

// 订单信息
const orderInfo = ref<OrderInfo>({})

// 支付方式
const paymentMethods = [
  { label: '现金', value: '1', icon: Wallet },
  { label: '微信', value: '2', icon: CreditCard },
  { label: '支付宝', value: '3', icon: Money },
  { label: '银行卡', value: '4', icon: CreditCard }
]

const selectedPayment = ref('')
const remark = ref('')
const paying = ref(false)
const paymentSuccess = ref(false)

// 页面加载时获取订单信息
onMounted(async () => {
  // 从路由参数获取订单ID和金额
  const queryOrderId = route.query.orderId as string
  const queryAmount = route.query.amount as string
  
  if (queryOrderId) {
    orderId.value = queryOrderId
    orderAmount.value = queryAmount || '0.00'
    
    // 加载订单详情 - 使用单个订单详情接口
    await loadOrderDetail()
  } else {
    // 没有订单ID时,不发出任何请求,直接显示空状态
    console.log('未提供订单ID,显示空状态')
    ElMessage.warning('暂无待支付的订单，请先在扫码销售或手动销售页面创建订单。')
  }
})

// 加载订单详情 - 使用单个订单详情接口
const loadOrderDetail = async () => {
  try {
    // 调用后端 API 查询单个订单详情
    const response = await axios.get(`/api/sales/order/${orderId.value}`)
    
    console.log('订单详情响应:', response.data)
    
    if (response.data.code === 1 && response.data.data) {
      // 直接使用返回的订单数据
      const order = response.data.data
      orderInfo.value = {
        id: order.id,
        orderNo: order.orderNo,
        orderTime: order.orderTime,
        totalQuantity: order.totalQuantity,
        totalAmount: order.totalAmount,
        status: order.status,
        statusDesc: order.statusDesc,
        paymentMethod: order.paymentMethod,
        paymentMethodDesc: order.paymentMethodDesc,
        paymentTime: order.paymentTime,
        operator: order.operator,
        remark: order.remark
      }
      orderAmount.value = (order.totalAmount || 0).toFixed(2)
    } else {
      ElMessage.error(response.data.msg || '未找到该订单')
    }
  } catch (error) {
    console.error('加载订单失败:', error)
    ElMessage.error('加载订单失败，请重试')
  }
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

// 获取支付方式名称
const getPaymentMethodName = (value: string) => {
  const method = paymentMethods.find(m => m.value === value)
  return method ? method.label : ''
}

// 确认支付
const confirmPayment = async () => {
  if (!selectedPayment.value) {
    ElMessage.warning('请选择支付方式')
    return
  }
  
  try {
    // 显示确认对话框
    await ElMessageBox.confirm(
      `确认使用${getPaymentMethodName(selectedPayment.value)}支付 ¥${orderAmount.value}？`,
      '确认支付',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    paying.value = true
    
    console.log('提交支付请求，订单ID:', orderId.value)
    
    // 调用后端 API 完成支付 - 使用 PUT 方法
    const response = await axios.put(`/api/sales/order/${orderId.value}/pay`)
    
    console.log('支付响应:', response.data)
    
    if (response.data.code === 1) {
      paymentSuccess.value = true
      ElMessage.success('支付成功！')
    } else {
      ElMessage.error(response.data.msg || '支付失败')
    }
  } catch (error: any) {
    if (error === 'cancel') {
      // 用户取消操作
      return
    }
    console.error('支付失败:', error)
    ElMessage.error(error.response?.data?.msg || '支付失败，请重试')
  } finally {
    paying.value = false
  }
}

// 取消订单
const cancelOrder = async () => {
  try {
    await ElMessageBox.confirm(
      '确认取消该订单吗？',
      '取消订单',
      {
        confirmButtonText: '确定',
        cancelButtonText: '返回',
        type: 'warning'
      }
    )
    
    const response = await axios.put(`/api/sales/order/${orderId.value}/cancel`)
    
    if (response.data.code === 1) {
      ElMessage.success('订单已取消')
      router.push({ name: 'UserCashier' })
    } else {
      ElMessage.error(response.data.msg || '取消订单失败')
    }
  } catch (error: any) {
    if (error === 'cancel') {
      return
    }
    console.error('取消订单失败:', error)
    ElMessage.error('取消订单失败，请重试')
  }
}

// 导航到扫码销售页面
const goToScanSale = () => {
  router.push({ name: 'UserScanSale' })
}

// 导航到订单列表页面
const goToCashierList = () => {
  router.push({ name: 'UserCashier' })
}

// 导航到销售记录页面
const goToSalesRecords = () => {
  router.push({ name: 'UserSalesRecords' })
}

// 继续销售
const continueSale = () => {
  router.push({ name: 'UserScanSale' })
}
</script>

<style scoped lang="scss">
.payment-detail {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
  
  h2 {
    margin-bottom: 24px;
    color: #303133;
    font-size: 24px;
  }
}

.empty-cart {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.empty-cart p {
  margin-bottom: 30px;
  font-size: 16px;
  color: #606266;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.actions button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #93CDFC 0%, #6BA3D6 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(147, 205, 252, 0.4);
  }
}

/* 订单信息卡片 */
.order-info-section {
  margin-bottom: 30px;
}

.info-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e4e7ed;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  &.highlight {
    background: linear-gradient(135deg, rgba(147, 205, 252, 0.1) 0%, rgba(107, 163, 214, 0.1) 100%);
    margin: 12px -24px -24px -24px;
    padding: 16px 24px;
    border-radius: 0 0 12px 12px;
  }
  
  .label {
    font-size: 14px;
    color: #909399;
    font-weight: 500;
  }
  
  .value {
    font-size: 14px;
    color: #303133;
    font-weight: 600;
    
    &.amount {
      font-size: 24px;
      color: #ff6b00;
      font-weight: 700;
    }
  }
}

/* 支付方式选择 */
.payment-section {
  h3 {
    margin-bottom: 20px;
    color: #303133;
    font-size: 18px;
  }
}

.payment-methods {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: #ffffff;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    border-color: #93CDFC;
    box-shadow: 0 4px 12px rgba(147, 205, 252, 0.2);
    transform: translateY(-2px);
  }
  
  &.active {
    border-color: #93CDFC;
    background: linear-gradient(135deg, rgba(147, 205, 252, 0.1) 0%, rgba(107, 163, 214, 0.1) 100%);
    box-shadow: 0 4px 16px rgba(147, 205, 252, 0.3);
  }
  
  .method-icon {
    font-size: 28px;
    color: #93CDFC;
  }
  
  .method-name {
    flex: 1;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
  
  .check-icon {
    font-size: 20px;
    color: #67c23a;
  }
}

/* 备注区域 */
.remark-section {
  margin-bottom: 24px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: #606266;
    font-weight: 500;
  }
}

/* 支付按钮 */
.payment-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

/* 成功页面 */
.success-section {
  padding: 40px 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .payment-detail {
    padding: 16px;
  }
  
  .payment-methods {
    grid-template-columns: 1fr;
  }
  
  .payment-actions {
    flex-direction: column;
  }
  
  .info-row.highlight .value.amount {
    font-size: 20px;
  }
}
</style>
