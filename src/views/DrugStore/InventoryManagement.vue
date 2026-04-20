<!-- src/views/DrugStore/InventoryManagement.vue -->
<template>
  <div class="inventory-management">
    <!-- 错误信息显示 -->
    <el-alert 
      v-if="error" 
      :title="error" 
      type="error" 
      show-icon 
      closable 
      @close="error = ''"
      style="margin-bottom: 20px;"
    />
    
    <!-- 查询条件区域 -->
    <el-card class="query-condition-card">
      <template #header>
        <div class="card-header">
          <span>库存查询</span>
          <el-button type="primary" @click="handleRefresh">刷新</el-button>
        </div>
      </template>
      
      <el-form :model="queryForm" ref="queryFormRef" label-width="100px" class="query-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="药品名称">
              <el-input 
                v-model="queryForm.drugName" 
                placeholder="请输入药品名称" 
                clearable
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="6">
            <el-form-item label="药品编码">
              <el-input 
                v-model="queryForm.drugCode" 
                placeholder="请输入药品编码" 
                clearable
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="6">
            <el-form-item label="生产厂家">
              <el-input 
                v-model="queryForm.manufacturer" 
                placeholder="请输入生产厂家" 
                clearable
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="6">
            <el-form-item label="批号">
              <el-input 
                v-model="queryForm.batchNumber" 
                placeholder="请输入批号" 
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="药品分类">
              <el-select 
                v-model="queryForm.category" 
                placeholder="请选择药品分类" 
                clearable
                style="width: 100%"
              >
                <el-option label="处方药" value="1" />
                <el-option label="非处方药" value="2" />
                <el-option label="中药饮片" value="3" />
                <el-option label="保健品" value="4" />
                <el-option label="医疗器械" value="5" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="6">
            <el-form-item label="库存状态">
              <el-select 
                v-model="queryForm.stockStatus" 
                placeholder="请选择库存状态" 
                clearable
                style="width: 100%"
              >
                <el-option label="缺货" :value="1" />
                <el-option label="充足" :value="2" />
                <el-option label="紧缺" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label-width="0">
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="handleReset">重置</el-button>
              <el-button @click="handleRefresh">刷新</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 库存列表区域 -->
    <el-card class="inventory-list-card">
      <template #header>
        <div class="card-header">
          <span>库存列表</span>
          <div class="header-info">
            <span>总计 {{ pagination.total }} 条记录</span>
          </div>
        </div>
      </template>
      
      <!-- 数据表格 - 完整版本 -->
      <el-table 
        :data="inventoryList" 
        v-loading="loading"
        element-loading-text="加载中..."
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        
        <el-table-column prop="drugName" label="药品名称" min-width="120" show-overflow-tooltip />
        
        <el-table-column prop="drugCode" label="药品编码" width="120" align="center" />
        
        <el-table-column prop="category" label="分类" width="100" align="center">
          <template #default="{ row }">
            {{ getCategoryName(row.category) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="manufacturer" label="生产厂家" min-width="150" show-overflow-tooltip />
        
        <el-table-column prop="batchNumber" label="批号" width="120" align="center" />
        
        <el-table-column prop="productionDate" label="生产日期" width="120" align="center">
          <template #default="{ row }">
            {{ formatDateArray(row.productionDate) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="expiryDate" label="有效期至" width="120" align="center">
          <template #default="{ row }">
            {{ formatDateArray(row.expiryDate) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="stockQuantity" label="库存数量" width="100" align="center" />
        
        <el-table-column prop="minStock" label="最低库存" width="100" align="center" />
        
        <el-table-column prop="unit" label="单位" width="80" align="center" />
        
        <el-table-column prop="purchasePrice" label="采购价" width="100" align="center">
          <template #default="{ row }">
            {{ formatCurrency(row.purchasePrice) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="retailPrice" label="零售价" width="100" align="center">
          <template #default="{ row }">
            {{ formatCurrency(row.retailPrice) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="inventoryValue" label="库存价值" width="120" align="center">
          <template #default="{ row }">
            {{ formatCurrency(row.inventoryValue) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="storageLocation" label="存储位置" width="120" align="center" />
        
        <el-table-column prop="stockStatus" label="库存状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStockStatusType(row.stockStatus)">
              {{ getStockStatusText(row.stockStatus) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          :current-page="pagination.currentPage"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import { 
  drugInventoryService, 
  type DrugInventory, 
  type InventoryQueryParams,
  getStockStatusText,
  getStockStatusType,
  getCategoryName,
  formatDateArray
} from '@/services/drugInventoryService'

// 查询表单
const queryForm = reactive<InventoryQueryParams>({
  drugName: '',
  drugCode: '',
  manufacturer: '',
  category: '',
  stockStatus: undefined,
  batchNumber: '',
  page: 1,
  size: 10
})

// 表单引用
const queryFormRef = ref<InstanceType<typeof ElForm>>()

// 加载状态
const loading = ref(false)

// 库存列表数据
const inventoryList = ref<DrugInventory[]>([])

// 分页信息 - 与后端返回字段匹配
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 错误信息
const error = ref('')

// 格式化金额
const formatCurrency = (amount: number): string => {
  return drugInventoryService.formatCurrency(amount)
}

// 监听数据变化，用于调试
watch(inventoryList, (newVal) => {
  console.log('=== inventoryList 数据变化 ===')
  console.log('新数据长度:', newVal.length)
  console.log('第一条数据示例:', newVal[0])
  console.log('=========================')
}, { deep: true })

// 查询库存列表
const loadInventoryList = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // 确保使用当前分页状态
    const params: InventoryQueryParams = {
      ...queryForm,
      page: pagination.currentPage,
      size: pagination.pageSize
    }
    
    console.log('=== 开始加载库存列表 ===')
    console.log('当前分页状态:', {
      currentPage: pagination.currentPage,
      pageSize: pagination.pageSize
    })
    console.log('查询参数:', params)
    
    const result = await drugInventoryService.getInventoryList(params)
    
    console.log('API返回结果:', result)
    
    // 数据验证
    if (!result.records || !Array.isArray(result.records)) {
      throw new Error('返回的数据格式不正确：records不是数组')
    }
    
    // 更新数据和分页信息
    inventoryList.value = result.records
    pagination.total = result.total
    pagination.currentPage = result.page
    pagination.pageSize = result.size
    
    console.log('=== 数据更新完成 ===')
    console.log('显示数据条数:', inventoryList.value.length)
    console.log('总记录数:', pagination.total)
    console.log('当前页:', pagination.currentPage)
  } catch (err: any) {
    console.error('=== 加载失败 ===')
    console.error('错误详情:', err)
    error.value = err.message || '加载库存列表失败'
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

// 查询按钮点击事件
const handleSearch = () => {
  console.log('=== 执行查询 ===')
  console.log('查询表单数据:', queryForm)
  
  // 重置到第一页
  pagination.currentPage = 1
  ElMessage.info('正在查询...')
  loadInventoryList()
}

// 重置按钮点击事件
const handleReset = () => {
  console.log('=== 执行重置 ===')
  
  // 重置表单
  queryForm.drugName = ''
  queryForm.drugCode = ''
  queryForm.manufacturer = ''
  queryForm.category = ''
  queryForm.stockStatus = undefined
  queryForm.batchNumber = ''
  
  // 重置分页
  pagination.currentPage = 1
  
  console.log('重置后的表单:', queryForm)
  ElMessage.info('正在重置查询条件...')
  loadInventoryList()
}

// 刷新按钮点击事件
const handleRefresh = () => {
  console.log('=== 执行刷新 ===')
  ElMessage.info('正在刷新数据...')
  loadInventoryList()
}

// 分页大小改变事件
const handleSizeChange = (val: number) => {
  console.log('=== 分页大小改变 ===', val)
  pagination.pageSize = val
  pagination.currentPage = 1
  ElMessage.info(`每页显示 ${val} 条`)
  loadInventoryList()
}

// 当前页改变事件
const handleCurrentChange = (val: number) => {
  console.log('=== 当前页改变 ===', val)
  pagination.currentPage = val
  ElMessage.info(`跳转到第 ${val} 页`)
  loadInventoryList()
}

// 表格选择变化处理
const handleSelectionChange = (selection: DrugInventory[]) => {
  console.log('表格选择变化:', selection)
}

// 组件挂载时加载数据
onMounted(() => {
  console.log('=== 组件挂载 ===')
  loadInventoryList()
})
</script>

<style scoped>
.inventory-management {
  padding: 20px;
}

.query-condition-card,
.inventory-list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info {
  font-size: 14px;
  color: #666;
}

.query-form {
  margin-bottom: -20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  min-height: 300px; /* 确保表格有最小高度 */
}

:deep(.el-table th) {
  background-color: #f5f7fa;
}

:deep(.el-table .cell) {
  padding: 0 10px;
}

/* 强制显示调试样式 */
.debug-border {
  border: 2px solid red !important;
}
</style>