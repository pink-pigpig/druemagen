<!-- src/views/DrugStore/CashierPage.vue -->
<template>
  <div class="cashier">
    <h2>收银结算</h2>
    
    <!-- 如果没有商品显示提示 -->
    <div v-if="cartItems.length === 0" class="empty-cart">
      <p>购物车为空，请先在扫码销售或手动销售页面添加商品。</p>
      <div class="actions">
        <button @click="goToScanSale">去扫码销售</button>
        <button @click="goToManualSale">去手动销售</button>
      </div>
    </div>
    
    <!-- 购物车列表 -->
    <div v-else class="cart-section">
      <h3>购物清单</h3>
      <div class="cart-items">
        <div 
          v-for="(item, index) in cartItems" 
          :key="index" 
          class="cart-item"
        >
          <div class="item-info">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-spec">{{ item.specification }}</span>
          </div>
          <div class="item-details">
            <span class="item-price">¥{{ item.price }}</span>
            <div class="quantity-control">
              <span class="quantity">{{ item.quantity }}</span>
            </div>
            <span class="item-total">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 结算信息 -->
    <div v-if="cartItems.length > 0" class="checkout-summary">
      <div class="summary-row">
        <span>商品总数:</span>
        <span>{{ totalItems }}</span>
      </div>
      <div class="summary-row">
        <span>总计金额:</span>
        <span class="total-amount">¥{{ totalPrice.toFixed(2) }}</span>
      </div>
    </div>

    <!-- 结算操作 -->
    <div v-if="cartItems.length > 0" class="checkout-actions">
      <button class="checkout-btn" @click="processCheckout">结算</button>
      <button class="clear-btn" @click="clearCart">清空</button>
    </div>

    <!-- 结算结果 -->
    <div v-if="checkoutResult" class="checkout-result">
      <div :class="['result-message', checkoutResult.success ? 'success' : 'error']">
        {{ checkoutResult.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

interface CartItem {
  id: string
  name: string
  specification: string
  price: number
  quantity: number
}

const router = useRouter()

// 购物车商品列表
const cartItems = ref<CartItem[]>([])

// 结算结果
const checkoutResult = ref<{
  success: boolean
  message: string
} | null>(null)

// 页面加载时获取购物车数据
onMounted(() => {
  const savedCart = localStorage.getItem('checkoutCart')
  if (savedCart) {
    cartItems.value = JSON.parse(savedCart)
  }
})

// 计算商品总数
const totalItems = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.quantity, 0)
})

// 计算总价
const totalPrice = computed(() => {
  return cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
})

// 清空购物车
const clearCart = () => {
  cartItems.value = []
  localStorage.removeItem('checkoutCart')
}

// 处理结算
const processCheckout = () => {
  // 这里将调用axios发送结算请求
  // 示例代码：
  /*
  axios.post('/api/checkout', {
    items: cartItems.value,
    totalAmount: totalPrice.value
  })
  .then(response => {
    checkoutResult.value = {
      success: true,
      message: '结算成功！'
    }
    clearCart()
  })
  .catch(error => {
    checkoutResult.value = {
      success: false,
      message: '结算失败，请重试'
    }
  })
  */
  
  // 临时模拟结算成功
  checkoutResult.value = {
    success: true,
    message: `结算成功！收款: ¥${totalPrice.value.toFixed(2)}`
  }
  clearCart()
}

// 导航到扫码销售页面
const goToScanSale = () => {
  router.push({ name: 'ScanSale' })
}

// 导航到手动销售页面
const goToManualSale = () => {
  router.push({ name: 'ManualSale' })
}
</script>

<style scoped>
.cashier {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.empty-cart {
  text-align: center;
  padding: 40px 20px;
  background: #f5f5f5;
  border-radius: 4px;
}

.empty-cart p {
  margin-bottom: 20px;
  font-size: 16px;
  color: #666;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.actions button {
  padding: 10px 20px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cart-section {
  margin-bottom: 20px;
}

.cart-section h3 {
  margin-bottom: 15px;
  color: #333;
}

.cart-items {
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-info {
  flex: 1;
}

.item-name {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

.item-spec {
  color: #666;
  font-size: 14px;
}

.item-details {
  display: flex;
  align-items: center;
  gap: 15px;
}

.item-price {
  width: 80px;
  text-align: center;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 5px;
}

.quantity {
  min-width: 30px;
  text-align: center;
}

.item-total {
  width: 80px;
  text-align: right;
  font-weight: bold;
}

.checkout-summary {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.total-amount {
  font-size: 18px;
  font-weight: bold;
  color: #ff6b00;
}

.checkout-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.checkout-btn {
  background: #1890ff;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  flex: 1;
}

.clear-btn {
  background: #ff4d4f;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  flex: 1;
}

.checkout-result {
  padding: 15px;
  border-radius: 4px;
}

.result-message {
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}

.success {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.error {
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}
</style>