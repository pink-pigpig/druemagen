<!-- src/views/DrugStore/StockOut.vue -->
<template>
  <div class="stock-out">
    <el-card class="stock-out-card">
      <template #header>
        <div class="card-header">
          <span>药品出库</span>
        </div>
      </template>
      
      <el-form 
        :model="stockOutForm" 
        :rules="rules" 
        ref="formRef" 
        label-width="120px" 
        class="stock-out-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="药品名称" prop="drugName">
              <el-autocomplete
                v-model="stockOutForm.drugName"
                :fetch-suggestions="queryDrugSuggestions"
                placeholder="请输入药品名称"
                @select="handleDrugSelect"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="药品编码" prop="drugCode">
              <el-input v-model="stockOutForm.drugCode" placeholder="请输入药品编码" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="批号" prop="batchNumber">
              <el-select 
                v-model="stockOutForm.batchNumber" 
                placeholder="请选择批号" 
                style="width: 100%"
                @change="handleBatchChange"
              >
                <el-option
                  v-for="batch in availableBatches"
                  :key="batch.batchNumber"
                  :label="batch.batchNumber"
                  :value="batch.batchNumber"
                />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="库存数量" prop="availableQuantity">
              <el-input 
                v-model="stockOutForm.availableQuantity" 
                readonly 
                placeholder="请选择药品查看库存"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出库数量" prop="quantity">
              <el-input-number
                v-model="stockOutForm.quantity"
                :min="minQuantity"
                :max="maxQuantity"
                :disabled="!stockOutForm.batchNumber"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-input v-model="stockOutForm.unit" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出库类型" prop="outType">
              <el-select v-model="stockOutForm.outType" placeholder="请选择出库类型" style="width: 100%">
                <el-option label="销售出库" value="SALE" />
                <el-option label="损耗出库" value="LOSS" />
                <el-option label="调拨出库" value="TRANSFER" />
                <el-option label="过期销毁" value="EXPIRED" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="客户/部门" prop="customer">
              <el-input v-model="stockOutForm.customer" placeholder="请输入客户或部门名称" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出库单价" prop="unitPrice">
              <el-input-number
                v-model="stockOutForm.unitPrice"
                :precision="2"
                :step="0.1"
                :min="0"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="总金额" prop="totalPrice">
              <el-input 
                v-model="stockOutForm.totalPrice" 
                readonly 
                placeholder="自动计算"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="stockOutForm.remark"
            type="textarea"
            placeholder="请输入备注信息"
            :rows="3"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm">确认出库</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 出库记录表格 -->
    <el-card class="stock-out-history-card" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>出库记录</span>
        </div>
      </template>
      
      <el-table :data="stockOutRecords" style="width: 100%" border>
        <el-table-column prop="drugName" label="药品名称" />
        <el-table-column prop="drugCode" label="药品编码" />
        <el-table-column prop="batchNumber" label="批号" />
        <el-table-column prop="quantity" label="数量" />
        <el-table-column prop="unit" label="单位" />
        <el-table-column prop="unitPrice" label="单价" />
        <el-table-column prop="totalPrice" label="总价" />
        <el-table-column prop="outType" label="出库类型" />
        <el-table-column prop="customer" label="客户/部门" />
        <el-table-column prop="createTime" label="出库时间" />
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="totalRecords"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'
import axios from 'axios'

// 定义表单引用
const formRef = ref<FormInstance>()

// 出库表单数据
const stockOutForm = reactive({
  drugName: '',
  drugCode: '',
  batchNumber: '',
  availableQuantity: 0,
  quantity: 1,
  unit: '',
  outType: '',
  customer: '',
  unitPrice: 0,
  totalPrice: 0,
  remark: ''
})

// 可用批次列表
const availableBatches = ref<any[]>([])

// 表单验证规则
const rules = {
  drugName: [{ required: true, message: '请输入药品名称', trigger: 'blur' }],
  drugCode: [{ required: true, message: '请输入药品编码', trigger: 'blur' }],
  batchNumber: [{ required: true, message: '请选择批号', trigger: 'change' }],
  quantity: [
    { required: true, message: '请输入出库数量', trigger: 'change' },
    { 
      validator: validateQuantity, 
      trigger: 'change' 
    }
  ],
  outType: [{ required: true, message: '请选择出库类型', trigger: 'change' }],
  customer: [{ required: true, message: '请输入客户或部门名称', trigger: 'blur' }],
  unitPrice: [{ required: true, message: '请输入出库单价', trigger: 'change' }]
}

// 验证出库数量是否超过库存
function validateQuantity(rule: any, value: number, callback: any) {
  if (value > stockOutForm.availableQuantity) {
    callback(new Error('出库数量不能大于库存数量'))
  } else if (value <= 0) {
    callback(new Error('出库数量必须大于0'))
  } else {
    callback()
  }
}

// 计算最小出库数量
const minQuantity = computed(() => {
  return stockOutForm.availableQuantity > 0 ? 1 : 0
})

// 计算最大出库数量
const maxQuantity = computed(() => {
  return stockOutForm.availableQuantity > 0 ? stockOutForm.availableQuantity : undefined
})

// 查询药品建议 - 修复 Function 类型问题
const queryDrugSuggestions = async (queryString: string, cb: (results: any[]) => void) => {
  if (!queryString) {
    cb([])
    return
  }
  
  try {
    // 模拟药品搜索API
    const response = await axios.get('/api/drugs/search', {
      params: { keyword: queryString }
    })
    const drugs = response.data.map((item: any) => ({
      value: item.name,
      drugCode: item.code
    }))
    cb(drugs)
  } catch (error) {
    console.error('搜索药品失败:', error)
    cb([])
  }
}

// 处理药品选择
const handleDrugSelect = async (item: any) => {
  stockOutForm.drugCode = item.drugCode
  await loadAvailableBatches(item.value)
}

// 加载可用批次
const loadAvailableBatches = async (drugName: string) => {
  try {
    // 模拟获取药品批次信息API
    const response = await axios.get('/api/drugs/batches', {
      params: { drugName }
    })
    
    availableBatches.value = response.data
    // 如果只有一个批次，默认选中
    if (response.data.length === 1) {
      stockOutForm.batchNumber = response.data[0].batchNumber
      handleBatchChange(stockOutForm.batchNumber)
    }
  } catch (error) {
    console.error('获取药品批次信息失败:', error)
    ElMessage.error('获取药品批次信息失败')
  }
}

// 处理批次变更
const handleBatchChange = (batchNumber: string) => {
  const selectedBatch = availableBatches.value.find(
    batch => batch.batchNumber === batchNumber
  )
  
  if (selectedBatch) {
    stockOutForm.availableQuantity = selectedBatch.quantity
    stockOutForm.unit = selectedBatch.unit
    stockOutForm.unitPrice = selectedBatch.purchasePrice || 0
    calculateTotalPrice()
  }
}

// 计算总金额
const calculateTotalPrice = () => {
  stockOutForm.totalPrice = parseFloat(
    (stockOutForm.quantity * stockOutForm.unitPrice).toFixed(2)
  )
}

// 监听数量和单价变化，自动计算总金额
watch([() => stockOutForm.quantity, () => stockOutForm.unitPrice], () => {
  calculateTotalPrice()
})

// 出库记录数据
const stockOutRecords = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalRecords = ref(0)

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 这里调用实际的API接口
        const response = await axios.post('/api/drugstore/stockout', stockOutForm)
        
        if (response.data.success) {
          ElMessage.success('药品出库成功')
          resetForm()
          fetchStockOutRecords() // 重新加载出库记录
        } else {
          ElMessage.error(response.data.message || '出库失败')
        }
      } catch (error) {
        console.error('出库失败:', error)
        ElMessage.error('出库操作失败，请稍后重试')
      }
    } else {
      ElMessage.warning('请填写正确的表单信息')
    }
  })
}

// 重置表单
const resetForm = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  availableBatches.value = []
}

// 获取出库记录
const fetchStockOutRecords = async () => {
  try {
    // 这里调用实际的API接口获取出库记录
    const response = await axios.get('/api/drugstore/stockout/history', {
      params: {
        page: currentPage.value,
        size: pageSize.value
      }
    })
    
    stockOutRecords.value = response.data.records
    totalRecords.value = response.data.total
  } catch (error) {
    console.error('获取出库记录失败:', error)
    ElMessage.error('获取出库记录失败')
  }
}

// 分页相关方法
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchStockOutRecords()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchStockOutRecords()
}

// 初始化获取数据
fetchStockOutRecords()
</script>

<style scoped>
.stock-out {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 84px);
}

.stock-out-card,
.stock-out-history-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.stock-out-form {
  margin-top: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>