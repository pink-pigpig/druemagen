<!-- src/views/DrugStore/InventoryQuery.vue -->
<template>
  <div class="inventory-query">
    <!-- 查询条件区域 -->
    <el-card class="query-condition-card">
      <template #header>
        <div class="card-header">
          <span>查询条件</span>
        </div>
      </template>
      
      <el-form :model="queryForm" ref="queryFormRef" label-width="100px" class="query-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="药品名称">
              <el-input 
                v-model="queryForm.drugName" 
                placeholder="请输入药品名称" 
                clearable
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="药品编码">
              <el-input 
                v-model="queryForm.drugCode" 
                placeholder="请输入药品编码" 
                clearable
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="生产厂家">
              <el-input 
                v-model="queryForm.manufacturer" 
                placeholder="请输入生产厂家" 
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="药品分类">
              <el-select 
                v-model="queryForm.category" 
                placeholder="请选择药品分类" 
                clearable
                style="width: 100%"
              >
                <el-option label="处方药" value="prescription" />
                <el-option label="非处方药" value="otc" />
                <el-option label="中药饮片" value="traditional" />
                <el-option label="保健品" value="health" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="库存状态">
              <el-select 
                v-model="queryForm.stockStatus" 
                placeholder="请选择库存状态" 
                clearable
                style="width: 100%"
              >
                <el-option label="充足" value="adequate" />
                <el-option label="紧张" value="low" />
                <el-option label="缺货" value="out" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="批号">
              <el-input 
                v-model="queryForm.batchNumber" 
                placeholder="请输入批号" 
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item class="query-buttons">
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 库存统计信息 -->
    <el-card class="inventory-stats-card" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>库存统计</span>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">药品总数</div>
            <div class="stat-value">{{ inventoryStats.totalDrugs }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">批号总数</div>
            <div class="stat-value">{{ inventoryStats.totalBatches }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">库存总量</div>
            <div class="stat-value">{{ inventoryStats.totalQuantity }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">库存价值</div>
            <div class="stat-value">¥{{ inventoryStats.totalValue }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 库存明细表格 -->
    <el-card class="inventory-details-card" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>库存明细</span>
          <div class="card-header-actions">
            <el-button type="primary" @click="exportData">导出</el-button>
          </div>
        </div>
      </template>
      
      <el-table 
        :data="inventoryList" 
        style="width: 100%" 
        border
        v-loading="loading"
        element-loading-text="正在加载库存数据..."
      >
        <el-table-column prop="drugName" label="药品名称" min-width="120" fixed />
        <el-table-column prop="drugCode" label="药品编码" width="120" />
        <el-table-column prop="category" label="药品分类" width="100" />
        <el-table-column prop="manufacturer" label="生产厂家" min-width="150" />
        <el-table-column prop="batchNumber" label="批号" width="120" />
        <el-table-column prop="productionDate" label="生产日期" width="110" />
        <el-table-column prop="expiryDate" label="有效期至" width="110" />
        <el-table-column prop="quantity" label="库存数量" width="100" sortable>
          <template #default="scope">
            <span :class="getStockStatusClass(scope.row.quantity, scope.row.minStock)">
              {{ scope.row.quantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="minStock" label="最低库存" width="100" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="purchasePrice" label="采购价" width="100" />
        <el-table-column prop="retailPrice" label="零售价" width="100" />
        <el-table-column prop="totalValue" label="库存价值" width="120" />
        <el-table-column prop="storageLocation" label="存储位置" width="120" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">详情</el-button>
            <el-button size="small" type="primary" @click="editInventory(scope.row)">调整</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
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
    </el-card>
    
    <!-- 药品详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="药品库存详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="药品名称">{{ currentDrug.drugName }}</el-descriptions-item>
        <el-descriptions-item label="药品编码">{{ currentDrug.drugCode }}</el-descriptions-item>
        <el-descriptions-item label="药品分类">{{ currentDrug.category }}</el-descriptions-item>
        <el-descriptions-item label="生产厂家">{{ currentDrug.manufacturer }}</el-descriptions-item>
        <el-descriptions-item label="批号">{{ currentDrug.batchNumber }}</el-descriptions-item>
        <el-descriptions-item label="生产日期">{{ currentDrug.productionDate }}</el-descriptions-item>
        <el-descriptions-item label="有效期至">{{ currentDrug.expiryDate }}</el-descriptions-item>
        <el-descriptions-item label="库存数量">
          <span :class="getStockStatusClass(currentDrug.quantity, currentDrug.minStock)">
            {{ currentDrug.quantity }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="单位">{{ currentDrug.unit }}</el-descriptions-item>
        <el-descriptions-item label="采购价">¥{{ currentDrug.purchasePrice }}</el-descriptions-item>
        <el-descriptions-item label="零售价">¥{{ currentDrug.retailPrice }}</el-descriptions-item>
        <el-descriptions-item label="库存价值">¥{{ currentDrug.totalValue }}</el-descriptions-item>
        <el-descriptions-item label="最低库存">{{ currentDrug.minStock }}</el-descriptions-item>
        <el-descriptions-item label="存储位置">{{ currentDrug.storageLocation }}</el-descriptions-item>
        <el-descriptions-item label="供应商">{{ currentDrug.supplier }}</el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 库存调整对话框 -->
    <el-dialog v-model="adjustDialogVisible" title="库存调整" width="500px">
      <el-form :model="adjustForm" :rules="adjustRules" ref="adjustFormRef" label-width="100px">
        <el-form-item label="当前库存">
          <el-input v-model="adjustForm.currentQuantity" readonly />
        </el-form-item>
        <el-form-item label="调整数量" prop="adjustQuantity">
          <el-input-number 
            v-model="adjustForm.adjustQuantity" 
            :min="-adjustForm.currentQuantity" 
            controls-position="right" 
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="调整原因" prop="reason">
          <el-select v-model="adjustForm.reason" placeholder="请选择调整原因" style="width: 100%">
            <el-option label="损耗" value="loss" />
            <el-option label="盘点差异" value="inventory_diff" />
            <el-option label="过期销毁" value="expired" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="adjustForm.remark" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="adjustDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAdjustment">确认调整</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import axios from 'axios'

// 查询表单
const queryForm = reactive({
  drugName: '',
  drugCode: '',
  manufacturer: '',
  category: '',
  stockStatus: '',
  batchNumber: ''
})

// 查询表单引用
const queryFormRef = ref<FormInstance>()

// 库存统计数据
const inventoryStats = reactive({
  totalDrugs: 0,
  totalBatches: 0,
  totalQuantity: 0,
  totalValue: 0
})

// 库存列表数据
const inventoryList = ref<any[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalRecords = ref(0)

// 详情对话框
const detailDialogVisible = ref(false)
const currentDrug = ref({
  drugName: '',
  drugCode: '',
  category: '',
  manufacturer: '',
  batchNumber: '',
  productionDate: '',
  expiryDate: '',
  quantity: 0,
  unit: '',
  purchasePrice: 0,
  retailPrice: 0,
  totalValue: 0,
  minStock: 0,
  storageLocation: '',
  supplier: ''
})

// 调整对话框
const adjustDialogVisible = ref(false)
const adjustForm = reactive({
  drugId: '',
  currentQuantity: 0,
  adjustQuantity: 0,
  reason: '',
  remark: ''
})

// 调整表单引用
const adjustFormRef = ref<FormInstance>()

// 调整表单验证规则
const adjustRules = {
  adjustQuantity: [
    { required: true, message: '请输入调整数量', trigger: 'change' },
    { validator: validateAdjustQuantity, trigger: 'change' }
  ],
  reason: [{ required: true, message: '请选择调整原因', trigger: 'change' }]
}

// 验证调整数量
function validateAdjustQuantity(rule: any, value: number, callback: any) {
  if (value === 0) {
    callback(new Error('调整数量不能为0'))
  } else {
    callback()
  }
}

// 获取库存状态样式类
const getStockStatusClass = (quantity: number, minStock: number) => {
  if (quantity <= 0) return 'stock-status-out'
  if (quantity <= minStock) return 'stock-status-low'
  return 'stock-status-normal'
}

// 查询库存
const handleQuery = async () => {
  loading.value = true
  try {
    // 这里调用实际的API接口
    const response = await axios.get('/api/drugstore/inventory', {
      params: {
        ...queryForm,
        page: currentPage.value,
        size: pageSize.value
      }
    })
    
    inventoryList.value = response.data.records
    totalRecords.value = response.data.total
    
    // 更新统计数据
    Object.assign(inventoryStats, response.data.stats)
  } catch (error) {
    console.error('查询库存失败:', error)
    ElMessage.error('查询库存失败')
  } finally {
    loading.value = false
  }
}

// 重置查询条件
const resetQuery = () => {
  if (!queryFormRef.value) return
  queryFormRef.value.resetFields()
}

// 导出数据
const exportData = () => {
  ElMessageBox.confirm('确认导出当前查询结果吗？', '导出确认', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 实际导出逻辑
    ElMessage.success('数据导出成功')
  }).catch(() => {
    // 用户取消操作
  })
}

// 查看详情
const viewDetail = (row: any) => {
  currentDrug.value = row
  detailDialogVisible.value = true
}

// 编辑库存
const editInventory = (row: any) => {
  adjustForm.drugId = row.id
  adjustForm.currentQuantity = row.quantity
  adjustForm.adjustQuantity = 0
  adjustForm.reason = ''
  adjustForm.remark = ''
  
  if (adjustFormRef.value) {
    adjustFormRef.value.resetFields()
  }
  
  adjustDialogVisible.value = true
}

// 提交库存调整
const submitAdjustment = async () => {
  if (!adjustFormRef.value) return
  
  await adjustFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 这里调用实际的API接口
        const response = await axios.post('/api/drugstore/inventory/adjust', adjustForm)
        
        if (response.data.success) {
          ElMessage.success('库存调整成功')
          adjustDialogVisible.value = false
          handleQuery() // 重新加载数据
        } else {
          ElMessage.error(response.data.message || '库存调整失败')
        }
      } catch (error) {
        console.error('库存调整失败:', error)
        ElMessage.error('库存调整失败，请稍后重试')
      }
    }
  })
}

// 分页相关方法
const handleSizeChange = (val: number) => {
  pageSize.value = val
  handleQuery()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  handleQuery()
}

// 页面加载时获取数据
onMounted(() => {
  handleQuery()
})
</script>

<style scoped>
.inventory-query {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 84px);
}

.query-condition-card,
.inventory-stats-card,
.inventory-details-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.query-form {
  margin-top: 20px;
}

.query-buttons {
  display: flex;
  justify-content: flex-end;
}

.stat-item {
  text-align: center;
  padding: 10px 0;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.stock-status-out {
  color: #f56c6c;
  font-weight: bold;
}

.stock-status-low {
  color: #e6a23c;
  font-weight: bold;
}

.stock-status-normal {
  color: #67c23a;
}
</style>