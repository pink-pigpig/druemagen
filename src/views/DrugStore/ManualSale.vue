<!-- src/views/DrugStore/ManualSale.vue -->
<template>
  <div class="manual-sale">
    <h2>手动销售</h2>
    
    <!-- 商品搜索 -->
    <div class="search-section">
      <div class="input-group">
        <label for="search">搜索药品：</label>
        <input 
          id="search"
          type="text" 
          v-model="searchKeyword" 
          placeholder="输入药品名称或拼音码"
          @keyup.enter="searchProducts"
        />
        <button @click="searchProducts">搜索</button>
      </div>
      
      <!-- 搜索结果 -->
      <div v-if="searchResults.length > 0" class="search-results">
        <div 
          v-for="product in searchResults" 
          :key="product.id"
          class="search-result-item"
          @click="addProductToCart(product)"
        >
          <div class="product-info">
            <div class="product-name">{{ product.name }}</div>
            <div class="product-spec">{{ product.specification }}</div>
          </div>
          <div class="product-price">¥{{ product.price }}</div>
        </div>
      </div>
    </div>

    <!-- 已选商品列表 -->
    <div class="selected-products">
      <h3>已选商品</h3>
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
              <button @click="decreaseQuantity(index)">-</button>
              <span class="quantity">{{ item.quantity }}</span>
              <button @click="increaseQuantity(index)">+</button>
            </div>
            <span class="item-total">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
            <button class="remove-btn" @click="removeItem(index)">删除</button>
          </div>
        </div>
      </div>
      
      <div class="cart-summary">
        <div class="summary-row">
          <span>商品总数:</span>
          <span>{{ totalItems }}</span>
        </div>
        <div class="summary-row">
          <span>总计金额:</span>
          <span class="total-amount">¥{{ totalPrice.toFixed(2) }}</span>
        </div>
        <div class="cart-actions">
          <button class="checkout-btn" @click="goToCheckout">去结算</button>
          <button class="clear-btn" @click="clearCart">清空</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

interface Product {
  id: string
  name: string
  specification: string
  price: number
}

interface CartItem extends Product {
  quantity: number
}

const router = useRouter()

// 搜索关键词
const searchKeyword = ref('')

// 搜索结果
const searchResults = ref<Product[]>([])

// 购物车商品
const cartItems = ref<CartItem[]>([])

// 模拟药品数据库
const productsDatabase: Product[] = [
  {
    id: '1',
    name: '阿莫西林胶囊',
    specification: '0.25g*24粒',
    price: 25.80
  },
  {
    id: '2',
    name: '布洛芬片',
    specification: '0.1g*20片',
    price: 18.50
  },
  {
    id: '3',
    name: '维生素C片',
    specification: '100mg*100片',
    price: 32.00
  },
  {
    id: '4',
    name: '感冒灵颗粒',
    specification: '10g*9袋',
    price: 28.60
  },
  {
    id: '5',
    name: '板蓝根颗粒',
    specification: '10g*10袋',
    price: 22.50
  }
]

// 搜索商品
const searchProducts = () => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    return
  }
  
  searchResults.value = productsDatabase.filter(
    product => product.name.includes(searchKeyword.value) || 
               product.specification.includes(searchKeyword.value)
  )
}

// 添加商品到购物车
const addProductToCart = (product: Product) => {
  const existingItem = cartItems.value.find(item => item.id === product.id)
  if (existingItem) {
    existingItem.quantity++
  } else {
    cartItems.value.push({
      ...product,
      quantity: 1
    })
  }
  
  // 清空搜索结果和关键词
  searchResults.value = []
  searchKeyword.value = ''
}

// 计算商品总数
const totalItems = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.quantity, 0)
})

// 计算总价
const totalPrice = computed(() => {
  return cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
})

// 增加数量
const increaseQuantity = (index: number) => {
  cartItems.value[index].quantity++
}

// 减少数量
const decreaseQuantity = (index: number) => {
  if (cartItems.value[index].quantity > 1) {
    cartItems.value[index].quantity--
  }
}

// 删除商品
const removeItem = (index: number) => {
  cartItems.value.splice(index, 1)
}

// 清空购物车
const clearCart = () => {
  cartItems.value = []
}

// 去结算
const goToCheckout = () => {
  if (cartItems.value.length === 0) {
    alert('请先添加商品')
    return
  }
  
  // 将购物车数据存储到 localStorage 供收银页面使用
  localStorage.setItem('checkoutCart', JSON.stringify(cartItems.value))
  router.push('Cashier')
}
</script>

<style scoped>
.manual-sale {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.input-group {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 10px;
}

.input-group label {
  white-space: nowrap;
}

.input-group input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.input-group button {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.search-results {
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 10px;
}

.search-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.search-result-item:hover {
  background-color: #f5f5f5;
}

.search-result-item:last-child {
  border-bottom: none;
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.product-spec {
  font-size: 14px;
  color: #666;
}

.product-price {
  font-weight: bold;
  color: #ff6b00;
}

.selected-products {
  margin-top: 30px;
}

.selected-products h3 {
  margin-bottom: 15px;
}

.cart-items {
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 20px;
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

.quantity-control button {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background: #f5f5f5;
  cursor: pointer;
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

.remove-btn {
  background: #ff4d4f;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.cart-summary {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
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

.cart-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
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
</style>