<!-- src/views/DrugStore/StockOut.vue -->
<template>
  <div class="stock-out">
    <el-card class="stock-out-card">
      <template #header>
        <div class="card-header">
          <span>药品出库</span>
        </div>
      </template>
      
      <!-- 快速查询区域 -->
      <div class="quick-search-section">
        <el-row :gutter="20" align="middle">
          <el-col :span="16">
            <el-input
              v-model="searchDrugCode"
              placeholder="请输入或扫描药品编码(条码)"
              clearable
              size="large"
              @keyup.enter="handleQuickSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
              <template #append>
                <el-button type="primary" @click="handleQuickSearch">查询</el-button>
              </template>
            </el-input>
          </el-col>
          <el-col :span="8">
            <el-button 
              type="success" 
              size="large" 
              :disabled="!selectedDrug"
              @click="showOutForm = true"
            >
              确认选择并出库
            </el-button>
          </el-col>
        </el-row>
        
        <!-- 查询结果展示 -->
        <div v-if="selectedDrug" class="drug-info-card">
          <el-descriptions title="药品信息" :column="3" border>
            <el-descriptions-item label="药品名称">
              {{ selectedDrug.drugName }}
            </el-descriptions-item>
            <el-descriptions-item label="药品编码">
              {{ selectedDrug.drugCode }}
            </el-descriptions-item>
            <el-descriptions-item label="规格">
              {{ selectedDrug.specification || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="单位">
              {{ selectedDrug.unit || '盒' }}
            </el-descriptions-item>
            <el-descriptions-item label="总库存">
              <el-tag type="success">{{ selectedDrug.totalStock }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="可用批次">
              <el-tag type="info">{{ availableBatches.length }} 个</el-tag>
            </el-descriptions-item>
          </el-descriptions>
          
          <!-- 批次选择表格 -->
          <div class="batch-selection">
            <h4>选择出库批次</h4>
            <el-table
              :data="availableBatches"
              highlight-current-row
              @current-change="handleBatchSelect"
              style="width: 100%"
              max-height="300"
              border
            >
              <el-table-column type="index" label="序号" width="60" align="center" />
              <el-table-column prop="batchNumber" label="批号" min-width="120" />
              <el-table-column prop="quantity" label="库存数量" width="100" align="center">
                <template #default="{ row }">
                  <el-tag type="success">{{ row.quantity }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="purchasePrice" label="进价" width="100" align="right">
                <template #default="{ row }">
                  ¥{{ (row.purchasePrice || 0).toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column prop="retailPrice" label="零售价" width="100" align="right">
                <template #default="{ row }">
                  ¥{{ (row.retailPrice || 0).toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column prop="expiryDate" label="有效期" width="120" align="center">
                <template #default="{ row }">
                  <el-tag :type="getExpireType(row.expiryDate)" size="small">
                    {{ formatDate(row.expiryDate) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="productionDate" label="生产日期" width="120" align="center">
                <template #default="{ row }">
                  <span>{{ formatDate(row.productionDate) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button 
                    type="primary" 
                    size="small"
                    @click="selectBatchAndShowForm(row)"
                  >
                    选择
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
      
      <!-- 出库表单对话框 -->
      <el-dialog
        v-model="showOutForm"
        title="确认出库"
        width="600px"
        :close-on-click-modal="false"
      >
        <el-form 
          :model="stockOutForm" 
          :rules="rules" 
          ref="formRef" 
          label-width="120px"
        >
          <!-- 只读信息展示 -->
          <el-alert
            title="药品信息"
            type="info"
            :closable="false"
            style="margin-bottom: 20px;"
          >
            <div class="drug-info-grid">
              <div class="info-item">
                <span class="label">药品名称:</span>
                <span class="value">{{ stockOutForm.drugName }}</span>
              </div>
              <div class="info-item">
                <span class="label">药品编码:</span>
                <span class="value">{{ stockOutForm.drugCode }}</span>
              </div>
              <div class="info-item">
                <span class="label">批号:</span>
                <span class="value">{{ stockOutForm.batchNumber }}</span>
              </div>
              <div class="info-item">
                <span class="label">生产日期:</span>
                <span class="value">{{ stockOutForm.productionDate || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">有效期至:</span>
                <el-tag :type="getExpireType(stockOutForm.expiryDate)" size="small">
                  {{ stockOutForm.expiryDate || '-' }}
                </el-tag>
              </div>
              <div class="info-item">
                <span class="label">当前库存:</span>
                <el-tag type="success">{{ stockOutForm.availableQuantity }}</el-tag>
              </div>
            </div>
          </el-alert>
          
          <el-form-item label="出库数量" prop="quantity">
            <el-input-number
              v-model="stockOutForm.quantity"
              :min="1"
              :max="stockOutForm.availableQuantity"
              controls-position="right"
              style="width: 100%"
              @change="calculateTotalPrice"
            />
            <div class="form-tip">最大可出库: {{ stockOutForm.availableQuantity }}</div>
          </el-form-item>
          
          <el-form-item label="单位">
            <el-input v-model="stockOutForm.unit" readonly />
          </el-form-item>
          
          <el-form-item label="出库类型" prop="outType">
            <el-select v-model="stockOutForm.outType" placeholder="请选择出库类型" style="width: 100%">
              <el-option label="销售出库" value="SALE" />
              <el-option label="损耗出库" value="LOSS" />
              <el-option label="调拨出库" value="TRANSFER" />
              <el-option label="过期销毁" value="EXPIRED" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="客户/部门" prop="customer">
            <el-input v-model="stockOutForm.customer" placeholder="请输入客户或部门名称" />
          </el-form-item>
          
          <el-form-item label="出库单价" prop="unitPrice">
            <el-input-number
              v-model="stockOutForm.unitPrice"
              :precision="2"
              :step="0.1"
              :min="0"
              controls-position="right"
              style="width: 100%"
              @change="calculateTotalPrice"
            />
          </el-form-item>
          
          <el-form-item label="总金额">
            <el-input 
              v-model="stockOutForm.totalPrice" 
              readonly 
              placeholder="自动计算"
            >
              <template #prefix>¥</template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="备注">
            <el-input
              v-model="stockOutForm.remark"
              type="textarea"
              placeholder="请输入备注信息"
              :rows="3"
            />
          </el-form-item>
        </el-form>
        
        <template #footer>
          <el-button @click="showOutForm = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            确认出库
          </el-button>
        </template>
      </el-dialog>
    </el-card>
    
    <!-- 出库记录表格 -->
    <el-card class="stock-out-history-card" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>出库记录</span>
        </div>
      </template>
      
      <el-table :data="stockOutRecords" style="width: 100%" border v-loading="loading">
        <el-table-column prop="drugName" label="药品名称" min-width="150" />
        <el-table-column prop="drugCode" label="药品编码" width="150" />
        <el-table-column prop="batchNumber" label="批号" width="120" />
        <el-table-column prop="quantity" label="数量" width="80" align="center" />
        <el-table-column prop="unit" label="单位" width="60" align="center" />
        <el-table-column prop="unitPrice" label="单价" width="100" align="right">
          <template #default="{ row }">
            ¥{{ (row.unitPrice || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalPrice" label="总价" width="100" align="right">
          <template #default="{ row }">
            ¥{{ (row.totalPrice || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="customer" label="客户/部门" min-width="120" />
        <el-table-column prop="outType" label="出库类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getOutTypeTag(row.outType)">
              {{ getOutTypeText(row.outType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="stockOutDate" label="出库日期" width="120" align="center">
          <template #default="{ row }">
            <span>{{ formatDate(row.stockOutDate) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="操作时间" width="180" align="center">
          <template #default="{ row }">
            <span>{{ formatDateTime(row.createdAt) }}</span>
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
import { ref, reactive, watch } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import axios from 'axios'

// 定义表单引用
const formRef = ref<FormInstance>()

// 快速搜索
const searchDrugCode = ref('')
const selectedDrug = ref<any>(null)
const availableBatches = ref<any[]>([])
const showOutForm = ref(false)
const submitting = ref(false)
const loading = ref(false)

// 出库记录相关
const stockOutRecords = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalRecords = ref(0)

// 出库表单数据
const stockOutForm = reactive({
  drugInventoryId: '',  // 药品库存ID
  drugName: '',
  drugCode: '',
  batchNumber: '',
  productionDate: '',   // 生产日期
  expiryDate: '',       // 有效期 (与后端字段名保持一致)
  availableQuantity: 0,
  quantity: 1,
  unit: '',
  outType: '',
  customer: '',
  unitPrice: 0,
  totalPrice: 0,
  remark: ''
})

// 表单验证规则
const rules = {
  quantity: [
    { required: true, message: '请输入出库数量', trigger: 'blur' },
    { 
      validator: validateQuantity, 
      trigger: 'blur' 
    }
  ],
  outType: [{ required: true, message: '请选择出库类型', trigger: 'change' }],
  customer: [{ required: true, message: '请输入客户或部门名称', trigger: 'blur' }],
  unitPrice: [{ required: true, message: '请输入出库单价', trigger: 'blur' }]
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

// 快速查询药品
const handleQuickSearch = async () => {
  if (!searchDrugCode.value) {
    ElMessage.warning('请输入药品编码')
    return
  }
  
  try {
    const response = await axios.get(`/api/drugstore/drug/${searchDrugCode.value}`)
    
    if (response.data.code === 1 && response.data.data) {
      // 判断返回的是单个对象还是数组
      const data = response.data.data
      
      if (Array.isArray(data)) {
        // 返回的是批次列表
        availableBatches.value = data.map((item: any) => ({
          id: item.id,
          batchNumber: item.batchNumber,
          quantity: item.stockQuantity,
          purchasePrice: item.purchasePrice,
          retailPrice: item.retailPrice,
          expiryDate: item.expiryDate,  // ✅ 保持与后端字段名一致
          productionDate: item.productionDate,
          drugName: item.drugName,
          drugCode: item.drugCode,
          unit: item.unit,
          specification: item.specification || '-',
          manufacturer: item.manufacturer || '-'
        }))
        
        // 从第一个批次提取药品基本信息
        if (data.length > 0) {
          const firstItem = data[0]
          selectedDrug.value = {
            drugName: firstItem.drugName,
            drugCode: firstItem.drugCode,
            specification: firstItem.specification || '-',
            unit: firstItem.unit,
            totalStock: data.reduce((sum: number, item: any) => sum + (item.stockQuantity || 0), 0),
            manufacturer: firstItem.manufacturer || '-'
          }
        }
        
        ElMessage.success(`查询成功，共 ${data.length} 个批次`)
      } else {
        // 返回的是单个库存记录
        const inventory = data
        selectedDrug.value = {
          drugName: inventory.drugName,
          drugCode: inventory.drugCode,
          specification: inventory.specification || '-',
          unit: inventory.unit,
          totalStock: inventory.stockQuantity,
          manufacturer: inventory.manufacturer || '-'
        }
        
        availableBatches.value = [{
          id: inventory.id,
          batchNumber: inventory.batchNumber,
          quantity: inventory.stockQuantity,
          purchasePrice: inventory.purchasePrice,
          retailPrice: inventory.retailPrice,
          expiryDate: inventory.expiryDate,           // ✅ 修正: 使用 expiryDate
          productionDate: inventory.productionDate,   // ✅ 新增: 添加生产日期
          drugName: inventory.drugName,
          drugCode: inventory.drugCode,
          unit: inventory.unit
        }]
        
        ElMessage.success('查询成功')
      }
    } else {
      ElMessage.error(response.data.msg || '未找到该药品')
      selectedDrug.value = null
      availableBatches.value = []
    }
  } catch (error) {
    console.error('查询药品失败:', error)
    ElMessage.error('查询药品失败，请检查药品编码')
    selectedDrug.value = null
    availableBatches.value = []
  }
}

// 加载可用批次 - 如果上面的接口已经返回了批次列表,这个方法可以简化或删除
const loadAvailableBatches = async (drugCode: string) => {
  // 如果 handleQuickSearch 已经处理了批次数据,这里可以留空或直接返回
  // 保留此方法是为了兼容性,如果后续需要单独调用批次接口
  console.log('批次数据已在查询药品时加载')
}

// 处理批次选择（表格行点击）
const handleBatchSelect = (row: any) => {
  if (row) {
    selectBatchAndShowForm(row)
  }
}

// 选择批次并显示表单
const selectBatchAndShowForm = (batch: any) => {
  console.log('=== 选择批次调试信息 ===')
  console.log('batch 对象:', batch)
  console.log('batch.batchNumber:', batch.batchNumber)
  console.log('batch.productionDate:', batch.productionDate)
  console.log('batch.expiryDate:', batch.expiryDate)
  console.log('selectedDrug.value:', selectedDrug.value)
  
  // 填充表单基本信息
  stockOutForm.drugInventoryId = batch.id || selectedDrug.value?.id
  stockOutForm.drugName = selectedDrug.value.drugName
  stockOutForm.drugCode = selectedDrug.value.drugCode
  stockOutForm.batchNumber = batch.batchNumber
  stockOutForm.productionDate = formatDate(batch.productionDate)  // 格式化生产日期
  stockOutForm.expiryDate = formatDate(batch.expiryDate)          // 格式化有效期
  stockOutForm.availableQuantity = batch.quantity
  stockOutForm.unit = selectedDrug.value.unit || '盒'
  stockOutForm.unitPrice = batch.retailPrice || batch.purchasePrice || 0
  stockOutForm.quantity = 1
  stockOutForm.outType = ''
  stockOutForm.customer = ''
  stockOutForm.remark = ''
  
  console.log('stockOutForm.batchNumber:', stockOutForm.batchNumber)
  console.log('stockOutForm.productionDate:', stockOutForm.productionDate)
  console.log('stockOutForm.expiryDate:', stockOutForm.expiryDate)
  console.log('========================')
  
  calculateTotalPrice()
  
  // 显示表单对话框
  showOutForm.value = true
}

// 计算总金额
const calculateTotalPrice = () => {
  stockOutForm.totalPrice = parseFloat(
    (stockOutForm.quantity * stockOutForm.unitPrice).toFixed(2)
  )
}

// 格式化日期 - 处理后端返回的 LocalDate 数组格式或字符串格式
const formatDate = (dateStr: string | number[] | undefined): string => {
  if (!dateStr) return '-'
  
  // 如果是数组格式 [年, 月, 日]
  if (Array.isArray(dateStr)) {
    const [year, month, day] = dateStr
    const formattedMonth = String(month).padStart(2, '0')
    const formattedDay = String(day).padStart(2, '0')
    return `${year}-${formattedMonth}-${formattedDay}`
  }
  
  // 如果是字符串格式 "2027-10-01",直接截取前10位
  if (typeof dateStr === 'string') {
    return dateStr.substring(0, 10)
  }
  
  return '-'
}

// 格式化日期时间
const formatDateTime = (dateTime: string | number[] | undefined): string => {
  if (!dateTime) return '-'
  
  if (Array.isArray(dateTime)) {
    const [year, month, day, hour, minute, second] = dateTime
    const formattedMonth = String(month).padStart(2, '0')
    const formattedDay = String(day).padStart(2, '0')
    const formattedHour = String(hour).padStart(2, '0')
    const formattedMinute = String(minute).padStart(2, '0')
    const formattedSecond = String(second || 0).padStart(2, '0')
    return `${year}-${formattedMonth}-${formattedDay} ${formattedHour}:${formattedMinute}:${formattedSecond}`
  }
  
  if (typeof dateTime === 'string') {
    return dateTime.replace('T', ' ').substring(0, 19)
  }
  
  return '-'
}

// 获取有效期标签类型
const getExpireType = (expireDate: string | undefined) => {
  if (!expireDate) return ''
  const expire = new Date(expireDate)
  const now = new Date()
  const diffDays = (expire.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  
  if (diffDays < 0) return 'danger'  // 已过期
  if (diffDays < 30) return 'warning'  // 即将过期
  return 'success'  // 正常
}

// 获取出库类型文本
const getOutTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    'SALE': '销售出库',
    'LOSS': '损耗出库',
    'TRANSFER': '调拨出库',
    'EXPIRED': '过期销毁'
  }
  return typeMap[type] || type
}

// 获取出库类型标签颜色
const getOutTypeTag = (type: string) => {
  const tagMap: Record<string, any> = {
    'SALE': 'success',
    'LOSS': 'warning',
    'TRANSFER': 'info',
    'EXPIRED': 'danger'
  }
  return tagMap[type] || ''
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitting.value = true
        
        // 构建请求体
        const requestBody = {
          drugName: stockOutForm.drugName,           // ✅ 药品名称
          drugCode: stockOutForm.drugCode,           // ✅ 药品编码 (关键字段!)
          manufacturer: selectedDrug.value?.manufacturer || '',  // ✅ 生产厂家
          batchNumber: stockOutForm.batchNumber,     // ✅ 批号
          productionDate: stockOutForm.productionDate,  // ✅ 生产日期
          expiryDate: stockOutForm.expiryDate,          // ✅ 有效期
          quantity: stockOutForm.quantity,           // ✅ 出库数量
          unit: stockOutForm.unit,                   // ✅ 单位
          unitPrice: stockOutForm.unitPrice,         // ✅ 出库单价
          outType: stockOutForm.outType,             // ✅ 出库类型
          customer: stockOutForm.customer,           // ✅ 客户/科室
          remark: stockOutForm.remark,               // ✅ 备注
          stockOutDate: new Date().toISOString().split('T')[0]  // ✅ 出库日期(当前日期 YYYY-MM-DD)
          // operator 由后端从 Token 中自动获取
        }
        
        console.log('=== 提交出库请求 ===')
        console.log('请求体:', JSON.stringify(requestBody, null, 2))
        console.log('====================')
        
        // 调用出库API - 修正路径为 /api/drugstore/stock-out
        const response = await axios.post('/api/drugstore/stockout', requestBody)
        
        if (response.data.code === 1) {
          ElMessage.success('药品出库成功')
          showOutForm.value = false
          
          // 重置搜索和选择
          searchDrugCode.value = ''
          selectedDrug.value = null
          availableBatches.value = []
          
          // 重新加载出库记录
          fetchStockOutRecords()
        } else {
          ElMessage.error(response.data.msg || '出库失败')
        }
      } catch (error: any) {
        console.error('出库失败:', error)
        ElMessage.error(error.response?.data?.msg || '出库操作失败，请稍后重试')
      } finally {
        submitting.value = false
      }
    } else {
      ElMessage.warning('请填写正确的表单信息')
    }
  })
}

// 获取出库记录
const fetchStockOutRecords = async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/drugstore/stockout/history', {
      params: {
        page: currentPage.value,
        size: pageSize.value
      }
    })
    
    if (response.data.code === 1 && response.data.data) {
      stockOutRecords.value = response.data.data.records || []
      totalRecords.value = response.data.data.total || 0
    }
  } catch (error) {
    console.error('查询出库记录失败:', error)
    ElMessage.error('查询出库记录失败')
  } finally {
    loading.value = false
  }
}

// 分页相关方法
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchStockOutRecords()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchStockOutRecords()
}

// 初始化获取数据
fetchStockOutRecords()
</script>