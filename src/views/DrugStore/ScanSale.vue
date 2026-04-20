<!-- src/views/DrugStore/ScanSale.vue -->
<template>
  <div class="scan-sale">
    <h2>扫码销售</h2>
    
    <!-- 扫码区域 -->
    <div class="scan-input-section">
      <div class="input-group">
        <label for="barcode">扫描条形码：</label>
        <input 
          id="barcode"
          type="text" 
          v-model="barcodeInput" 
          placeholder="请扫描药品条形码或手动输入"
          @keyup.enter="addProductByBarcode"
        />
        <button @click="addProductByBarcode">添加商品</button>
      </div>
    </div>

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
            <div class="product-code" v-if="product.drugCode">药品编码：{{ product.drugCode }}</div>
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
            <span class="item-code" v-if="item.drugCode">编码：{{ item.drugCode }}</span>
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
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Product {
  id: string | number
  name: string
  drugName?: string
  specification: string
  price: number
  retailPrice?: number
  barcode?: string
  drugCode?: string
  stockQuantity?: number
  drugInventoryId?: number | string  // 药品库存 ID，用于提交订单
}

interface CartItem extends Product {
  quantity: number
  drugInventoryId?: number | string  // 药品库存 ID，用于提交订单
}

// 订单项接口
interface OrderItem {
  drugInventoryId: number | string
  quantity: number
  price: number
}

// 订单数据接口
interface OrderData {
  items: OrderItem[]
  totalAmount: number
}

const router = useRouter()

// 条形码输入
const barcodeInput = ref('')

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
    price: 25.80,
    barcode: '6920123456789'
  },
  {
    id: '2',
    name: '布洛芬片',
    specification: '0.1g*20片',
    price: 18.50,
    barcode: '6920123456790'
  },
  {
    id: '3',
    name: '维生素C片',
    specification: '100mg*100片',
    price: 32.00,
    barcode: '6920123456791'
  }
]

// 根据条形码添加商品 - 支持从后端 API 查询
const addProductByBarcode = async () => {
  if (!barcodeInput.value) {
    ElMessage.warning('请输入条形码')
    return
  }
  
  try {
    // 调用后端 API 查询药品信息
    const response = await axios.get(`api/sales/drug/${barcodeInput.value}`)
    
    console.log('扫码查询响应:', response.data)
    
    if (response.data.code === 1) {
      // 查询成功，添加到购物车
      const drug = response.data.data
      addToCart({
        id: drug.id || drug.drugCode,
        drugInventoryId: drug.id,  // 设置药品库存 ID
        name: drug.drugName || drug.name,
        drugName: drug.drugName,
        specification: drug.specification || '',
        price: drug.retailPrice || drug.price || 0,
        drugCode: drug.drugCode,
        barcode: barcodeInput.value,
        stockQuantity: drug.stockQuantity || 0
      })
      
      ElMessage.success(`已添加：${drug.drugName}`)
      barcodeInput.value = '' // 清空输入框
    } else {
      // 查询失败，提示用户
      ElMessage.error(response.data.msg || '未找到该药品')
    }
  } catch (error) {
    console.error('扫码查询失败:', error)
    ElMessage.error('查询失败，请检查网络连接')
  }
}

// 搜索商品 - 支持从后端 API 查询
const searchProducts = async () => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    return
  }
  
  try {
    // 尝试调用后端 API 搜索药品
    const response = await axios.get('/api/drugstore/drugs/search', {
      params: {
        keyword: searchKeyword.value,
        page: 1,
        size: 20
      }
    })
    
    console.log('搜索响应:', response.data)
    
    if (response.data.code === 1) {
      // 将后端返回的数据转换为 Product 格式
      searchResults.value = response.data.data.records.map((drug: any) => ({
        id: drug.id || drug.drugCode,
        drugInventoryId: drug.id,  // 设置药品库存 ID
        name: drug.drugName || drug.name,
        drugName: drug.drugName,
        specification: drug.specification || '',
        price: drug.retailPrice || drug.price || 0,
        drugCode: drug.drugCode,
        barcode: drug.barcode,
        stockQuantity: drug.stockQuantity || 0
      }))
      
      if (searchResults.value.length === 0) {
        ElMessage.info('未找到匹配的药品')
      }
    } else {
      ElMessage.error(response.data.msg || '搜索失败')
      searchResults.value = []
    }
  } catch (error) {
    console.error('搜索失败:', error)
    // 如果 API 失败，使用本地模拟数据
    searchResults.value = productsDatabase.filter(
      product => product.name.includes(searchKeyword.value) || 
                 product.specification.includes(searchKeyword.value)
    )
    if (searchResults.value.length === 0) {
      ElMessage.info('未找到匹配的药品')
    }
  }
}

// 添加商品到购物车
const addProductToCart = (product: Product) => {
  addToCart(product)
  searchResults.value = [] // 清空搜索结果
  searchKeyword.value = '' // 清空搜索框
}

// 添加到购物车的通用方法
const addToCart = (product: Product) => {
  // 检查库存
  if (product.stockQuantity !== undefined && product.stockQuantity <= 0) {
    ElMessage.warning(`${product.name} 库存不足`)
    return
  }
  
  const existingItem = cartItems.value.find(item => item.id === product.id)
  if (existingItem) {
    // 检查是否超过库存
    if (product.stockQuantity !== undefined && existingItem.quantity + 1 > product.stockQuantity) {
      ElMessage.warning(`${product.name} 库存不足`)
      return
    }
    existingItem.quantity++
  } else {
    cartItems.value.push({
      ...product,
      quantity: 1
    })
    ElMessage.success(`已添加：${product.name}`)
  }
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

// 去结算 - 提交订单到后端
const goToCheckout = async () => {
  if (cartItems.value.length === 0) {
    ElMessage.warning('请先添加商品')
    return
  }
  
  try {
    // 显示确认对话框
    await ElMessageBox.confirm(
      `共 ${totalItems.value} 件商品，总计 ¥${totalPrice.value.toFixed(2)}，确认提交订单吗？`,
      '确认订单',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 构建订单数据
    const orderData: OrderData = {
      items: cartItems.value.map(item => ({
        drugInventoryId: item.drugInventoryId || item.id,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: totalPrice.value
    }
    
    console.log('提交订单数据:', orderData)
    
    // 调用后端 API 创建订单
    const response = await axios.post('/api/sales/order', orderData)
    
    console.log('订单响应:', response.data)
    
    if (response.data.code === 1) {
      ElMessage.success('订单创建成功！')
      
      // 获取订单ID
      const orderId = response.data.data.orderId || response.data.data.id
      
      // 清空购物车
      cartItems.value = []
      
      // 跳转到支付详情页面，传递订单ID和金额
      router.push({
        name: 'UserPaymentDetail',
        query: {
          orderId: orderId,
          amount: totalPrice.value.toFixed(2)
        }
      })
    } else {
      ElMessage.error(response.data.msg || '订单创建失败')
    }
  } catch (error: any) {
    if (error === 'cancel') {
      // 用户取消操作
      return
    }
    console.error('提交订单失败:', error)
    ElMessage.error(error.response?.data?.msg || '提交订单失败，请重试')
  }
}

</script>

<style scoped>
.scan-sale {
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
  margin-bottom: 2px;
}

.product-code {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
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
  display: block;
  margin-bottom: 3px;
}

.item-code {
  color: #999;
  font-size: 12px;
  display: block;
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