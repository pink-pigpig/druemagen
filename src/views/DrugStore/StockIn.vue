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
            <el-form-item label="生产厂家" prop="manufacturer">
              <el-input v-model="stockInForm.manufacturer" placeholder="请输入生产厂家" />
            </el-form-item>
          </el-col>
          
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
      
      <el-table :data="stockInRecords" style="width: 100%" border>
        <el-table-column prop="drugName" label="药品名称" />
        <el-table-column prop="drugCode" label="药品编码" />
        <el-table-column prop="batchNumber" label="批号" />
        <el-table-column prop="quantity" label="数量" />
        <el-table-column prop="unit" label="单位" />
        <el-table-column prop="unitPrice" label="单价" />
        <el-table-column prop="totalPrice" label="总价" />
        <el-table-column prop="supplier" label="供应商" />
        <el-table-column prop="createTime" label="入库时间" />
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

// 入库表单数据
const stockInForm = reactive({
  drugName: '',
  drugCode: '',
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
        // 这里调用实际的API接口
        const response = await axios.post('/api/drugstore/stockin', {
          ...stockInForm,
          totalPrice: stockInForm.quantity * stockInForm.unitPrice
        })
        
        if (response.data.success) {
          ElMessage.success('药品入库成功')
          resetForm()
          fetchStockInRecords() // 重新加载入库记录
        } else {
          ElMessage.error(response.data.message || '入库失败')
        }
      } catch (error) {
        console.error('入库失败:', error)
        ElMessage.error('入库操作失败，请稍后重试')
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

// 获取入库记录
const fetchStockInRecords = async () => {
  try {
    // 这里调用实际的API接口获取入库记录
    const response = await axios.get('/api/drugstore/stockin/history', {
      params: {
        page: currentPage.value,
        size: pageSize.value
      }
    })
    
    stockInRecords.value = response.data.records
    totalRecords.value = response.data.total
  } catch (error) {
    console.error('获取入库记录失败:', error)
    ElMessage.error('获取入库记录失败')
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