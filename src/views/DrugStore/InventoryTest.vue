<!-- 简化测试版本 -->
<template>
  <div class="inventory-test">
    <h2>库存管理测试页面</h2>
    
    <!-- 调试信息显示 -->
    <el-card style="margin-bottom: 20px;">
      <template #header>
        <strong>调试信息</strong>
      </template>
      <div>
        <p><strong>加载状态:</strong> {{ loading ? '加载中...' : '已完成' }}</p>
        <p><strong>数据条数:</strong> {{ inventoryList.length }}</p>
        <p><strong>分页信息:</strong> 总计{{ pagination.total }}条，当前第{{ pagination.currentPage }}页，每页{{ pagination.pageSize }}条</p>
        <p v-if="error"><strong>错误信息:</strong> {{ error }}</p>
      </div>
    </el-card>
    
    <!-- 简化表格 -->
    <el-table 
      :data="inventoryList" 
      v-loading="loading"
      border
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="drugName" label="药品名称" />
      <el-table-column prop="drugCode" label="编码" />
      <el-table-column prop="category" label="分类">
        <template #default="{ row }">
          {{ getCategoryName(row.category) }}
        </template>
      </el-table-column>
      <el-table-column prop="stockQuantity" label="库存" />
      <el-table-column prop="stockStatus" label="状态">
        <template #default="{ row }">
          <el-tag :type="getStockStatusType(row.stockStatus)">
            {{ getStockStatusText(row.stockStatus) }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 操作按钮 -->
    <div style="margin-top: 20px;">
      <el-button type="primary" @click="loadData">重新加载数据</el-button>
      <el-button @click="showTestData">显示测试数据</el-button>
    </div>
    
    <!-- 原始数据显示 -->
    <el-card style="margin-top: 20px;" v-if="rawData">
      <template #header>
        <strong>原始响应数据</strong>
      </template>
      <pre>{{ JSON.stringify(rawData, null, 2) }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { apiClient } from '@/services/authService'
import { 
  getStockStatusText,
  getStockStatusType,
  getCategoryName
} from '@/services/drugInventoryService'

// 简化数据接口
interface SimpleDrug {
  id: number
  drugName: string
  drugCode: string
  category: string
  stockQuantity: number
  stockStatus: number
}

// 状态管理
const loading = ref(false)
const error = ref('')
const rawData = ref<any>(null)
const inventoryList = ref<SimpleDrug[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 加载数据
const loadData = async () => {
  try {
    loading.value = true
    error.value = ''
    
    console.log('=== 发送API请求 ===')
    const response = await apiClient.get('/api/drugstore/inventory', {
      params: {
        page: 1,
        size: 10
      }
    })
    
    console.log('=== 原始响应 ===')
    console.log('完整响应:', response)
    rawData.value = response.data
    
    if (response.data && response.data.code === 1) {
      const result = response.data.data
      console.log('=== 处理后的数据 ===')
      console.log('records:', result.records)
      console.log('total:', result.total)
      
      inventoryList.value = result.records
      pagination.total = result.total
      pagination.currentPage = result.page
      
      console.log('=== 最终数据 ===')
      console.log('inventoryList:', inventoryList.value)
    } else {
      throw new Error(response.data?.msg || '获取数据失败')
    }
  } catch (err: any) {
    console.error('=== 请求失败 ===')
    console.error('错误:', err)
    error.value = err.message || '请求失败'
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

// 显示测试数据
const showTestData = () => {
  const testData: SimpleDrug[] = [
    {
      id: 1,
      drugName: "测试药品1",
      drugCode: "TEST-001",
      category: "1",
      stockQuantity: 100,
      stockStatus: 2
    },
    {
      id: 2,
      drugName: "测试药品2",
      drugCode: "TEST-002",
      category: "2",
      stockQuantity: 5,
      stockStatus: 1
    }
  ]
  
  inventoryList.value = testData
  pagination.total = 2
  console.log('已加载测试数据:', testData)
}

// 组件挂载
onMounted(() => {
  console.log('=== 测试页面挂载 ===')
  loadData()
})
</script>

<style scoped>
.inventory-test {
  padding: 20px;
}
pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
}
</style>