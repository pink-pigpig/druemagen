<!-- src/views/DrugStore/StockIn.vue -->
<template>
  <div class="stock-in">
    <el-card class="stock-in-card">
      <template #header>
        <div class="card-header">
          <span>药品入库</span>
        </div>
      </template>
      
      <el-form 
        :model="stockInForm" 
        :rules="rules" 
        ref="formRef" 
        label-width="120px" 
        class="stock-in-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="药品名称" prop="drugName">
              <el-input v-model="stockInForm.drugName" placeholder="请输入药品名称" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="药品编码" prop="drugCode">
              <el-input v-model="stockInForm.drugCode" placeholder="请输入药品编码" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="药品分类" prop="category">
              <el-select v-model="stockInForm.category" placeholder="请选择药品分类" style="width: 100%">
                <el-option label="处方药" value="1" />
                <el-option label="非处方药" value="2" />
                <el-option label="中药饮片" value="3" />
                <el-option label="保健品" value="4" />
                <el-option label="医疗器械" value="5" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="生产厂家" prop="manufacturer">
              <el-input v-model="stockInForm.manufacturer" placeholder="请输入生产厂家" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="批号" prop="batchNumber">
              <el-input v-model="stockInForm.batchNumber" placeholder="请输入批号" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生产日期" prop="productionDate">
              <el-date-picker
                v-model="stockInForm.productionDate"
                type="date"
                placeholder="请选择生产日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="有效期至" prop="expiryDate">
              <el-date-picker
                v-model="stockInForm.expiryDate"
                type="date"
                placeholder="请选择有效期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="入库数量" prop="quantity">
              <el-input-number
                v-model="stockInForm.quantity"
                :min="1"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-select v-model="stockInForm.unit" placeholder="请选择单位" style="width: 100%">
                <el-option label="盒" value="盒" />
                <el-option label="瓶" value="瓶" />
                <el-option label="片" value="片" />
                <el-option label="粒" value="粒" />
                <el-option label="克g" value="克" />
                <el-option label="千克Kg" value="千克" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="采购单价" prop="unitPrice">
              <el-input-number
                v-model="stockInForm.unitPrice"
                :precision="2"
                :step="0.1"
                :min="0"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="供应商" prop="supplier">
              <el-input v-model="stockInForm.supplier" placeholder="请输入供应商" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="stockInForm.remark"
            type="textarea"
            placeholder="请输入备注信息"
            :rows="3"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm">确认入库</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 入库记录表格 -->
    <el-card class="stock-in-history-card" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>入库记录</span>
        </div>
      </template>
      
      <!-- 查询条件表单 -->
      <el-form :model="queryForm" ref="queryFormRef" label-width="80px" class="query-form" style="margin-bottom: 20px;">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="药品名称">
              <el-input v-model="queryForm.drugName" placeholder="请输入药品名称" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="药品编码">
              <el-input v-model="queryForm.drugCode" placeholder="请输入药品编码" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="生产厂家">
              <el-input v-model="queryForm.manufacturer" placeholder="请输入生产厂家" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="批号">
              <el-input v-model="queryForm.batchNumber" placeholder="请输入批号" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="开始日期">
              <el-date-picker
                v-model="queryForm.startDate"
                type="date"
                placeholder="请选择开始日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="结束日期">
              <el-date-picker
                v-model="queryForm.endDate"
                type="date"
                placeholder="请选择结束日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label-width="0">
              <el-button type="primary" @click="handleQuery">查询</el-button>
              <el-button @click="handleResetQuery">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <el-table :data="stockInRecords" style="width: 100%" border v-loading="tableLoading">
        <el-table-column prop="drugName" label="药品名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="drugCode" label="药品编码" width="120" />
        <el-table-column prop="batchNumber" label="批号" width="120" />
        <el-table-column prop="quantity" label="数量" width="80" align="center" />
        <el-table-column prop="unit" label="单位" width="80" align="center" />
        <el-table-column prop="unitPrice" label="单价" width="100" align="center">
          <template #default="{ row }">
            ¥{{ row.unitPrice?.toFixed(2) || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column prop="totalPrice" label="总价" width="100" align="center">
          <template #default="{ row }">
            ¥{{ (row.quantity * row.unitPrice)?.toFixed(2) || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column prop="supplier" label="供应商" min-width="120" show-overflow-tooltip />
        <el-table-column label="入库时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatStockInTime(row.stockInDate, row.createdAt) }}
          </template>
        </el-table-column>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import axios from 'axios'

// 定义表单引用
const formRef = ref<FormInstance>()
const queryFormRef = ref<FormInstance>()

// 查询表单数据
const queryForm = reactive({
  drugName: '',
  drugCode: '',
  manufacturer: '',
  batchNumber: '',
  startDate: '',
  endDate: ''
})

// 加载状态
const tableLoading = ref(false)

// 入库表单数据
const stockInForm = reactive({
  drugName: '',
  drugCode: '',
  category: '',  // 添加药品分类字段
  manufacturer: '',
  batchNumber: '',
  productionDate: '',
  expiryDate: '',
  quantity: 1,
  unit: '盒',
  unitPrice: 0,
  supplier: '',
  remark: ''
})

// 表单验证规则
const rules = {
  drugName: [{ required: true, message: '请输入药品名称', trigger: 'blur' }],
  drugCode: [{ required: true, message: '请输入药品编码', trigger: 'blur' }],
  category: [{ required: true, message: '请选择药品分类', trigger: 'change' }],  // 添加分类验证
  batchNumber: [{ required: true, message: '请输入批号', trigger: 'blur' }],
  productionDate: [{ required: true, message: '请选择生产日期', trigger: 'change' }],
  expiryDate: [{ required: true, message: '请选择有效期', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入入库数量', trigger: 'change' }],
  unitPrice: [{ required: true, message: '请输入采购单价', trigger: 'change' }],
  supplier: [{ required: true, message: '请输入供应商', trigger: 'blur' }]
}

// 入库记录数据
const stockInRecords = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalRecords = ref(0)

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        console.log('=== 开始入库操作 ===')
        console.log('提交数据:', {
          ...stockInForm,
          totalPrice: stockInForm.quantity * stockInForm.unitPrice
        })
        
        // 这里调用实际的API接口
        const response = await axios.post('/api/drugstore/stock-in', {
          ...stockInForm,
          totalPrice: stockInForm.quantity * stockInForm.unitPrice
        })
        
        console.log('=== 入库API响应 ===')
        console.log('完整响应:', response)
        console.log('响应数据:', response.data)
        console.log('响应状态:', response.status)
        
        // 按照后端Result包装格式检查成功状态
        if (response.data && response.data.code === 1) {
          ElMessage.success(response.data.data || '药品入库成功')
          console.log('入库成功，准备重置表单和刷新记录')
          resetForm()
          fetchStockInRecords() // 重新加载入库记录
        } else {
          const errorMsg = response.data.msg || response.data.message || '入库失败'
          console.error('入库失败:', errorMsg)
          ElMessage.error(errorMsg)
        }
      } catch (error: any) {
        console.error('=== 入库请求异常 ===')
        console.error('错误详情:', error)
        if (error.response) {
          console.error('响应状态:', error.response.status)
          console.error('响应数据:', error.response.data)
          ElMessage.error(error.response.data?.msg || error.response.data?.message || '入库操作失败，请稍后重试')
        } else {
          ElMessage.error('入库操作失败，请稍后重试')
        }
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
}

// 时间格式化函数
const formatStockInTime = (stockInDate: string, createdAt: string) => {
  if (stockInDate) {
    return stockInDate
  }
  if (createdAt) {
    // 如果是数组格式 [年,月,日,时,分,秒]
    if (Array.isArray(createdAt)) {
      const [year, month, day, hour, minute, second] = createdAt
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`
    }
    // 如果是字符串格式
    return createdAt
  }
  return '-'
}

// 查询方法
const handleQuery = () => {
  console.log('=== 执行查询 ===')
  console.log('查询条件:', queryForm)
  currentPage.value = 1 // 重置到第一页
  fetchStockInRecords()
}

// 重置查询
const handleResetQuery = () => {
  console.log('=== 重置查询 ===')
  queryForm.drugName = ''
  queryForm.drugCode = ''
  queryForm.manufacturer = ''
  queryForm.batchNumber = ''
  queryForm.startDate = ''
  queryForm.endDate = ''
  currentPage.value = 1
  fetchStockInRecords()
}

// 获取入库记录
const fetchStockInRecords = async () => {
  try {
    tableLoading.value = true
    console.log('=== 获取入库记录 ===')
    console.log('查询参数:', {
      ...queryForm,
      page: currentPage.value,
      size: pageSize.value
    })
    
    // 使用正确的API端点
    const response = await axios.get('/api/drugstore/stock-in-records', {
      params: {
        ...queryForm,
        page: currentPage.value,
        size: pageSize.value
      }
    })
    
    console.log('入库记录响应:', response.data)
    
    // 按照Result包装格式处理响应
    if (response.data && response.data.code === 1) {
      stockInRecords.value = response.data.data.records || []
      totalRecords.value = response.data.data.total || 0
      console.log('成功获取记录数:', stockInRecords.value.length)
    } else {
      throw new Error(response.data.msg || '获取入库记录失败')
    }
  } catch (error: any) {
    console.error('获取入库记录失败:', error)
    ElMessage.error(error.response?.data?.msg || error.message || '获取入库记录失败')
    // 设置默认值避免页面错误
    stockInRecords.value = []
    totalRecords.value = 0
  } finally {
    tableLoading.value = false
  }
}

// 分页相关方法
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchStockInRecords()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchStockInRecords()
}

// 页面加载时获取数据
onMounted(() => {
  fetchStockInRecords()
})
</script>

<style scoped>
.stock-in {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 84px);
}

.stock-in-card,
.stock-in-history-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.stock-in-form {
  margin-top: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>