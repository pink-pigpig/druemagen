<!-- src/views/IntegrationCenter.vue -->
<template>
  <div class="integration-center">
    <!-- 页面标题 -->
    <el-page-header title="返回" content="集成中心" @back="goBack" class="mb-4" />
    
    <!-- 数据概览 -->
    <el-row :gutter="16" class="mb-4">
      <el-col :span="6" v-for="item in overviewData" :key="item.title">
        <el-card shadow="hover" class="overview-card">
          <div class="overview-content">
            <div class="overview-title">{{ item.title }}</div>
            <div class="overview-value">{{ item.value }}</div>
            <div class="overview-change" :class="item.change > 0 ? 'positive' : 'negative'">
              {{ item.change > 0 ? '+' : '' }}{{ item.change }}%
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 服务状态与活动记录 -->
    <el-row :gutter="16">
      <!-- 左侧：服务状态 -->
      <el-col :span="16">
        <el-card class="service-status-card">
          <template #header>
            <div class="card-header">
              <span>服务状态监控</span>
              <el-button class="button" type="primary" @click="refreshStatus">刷新</el-button>
            </div>
          </template>
          
          <el-table :data="serviceStatus" style="width: 100%" stripe>
            <el-table-column prop="name" label="服务名称" width="180" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.status === '正常' ? 'success' : row.status === '警告' ? 'warning' : 'danger'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastCheck" label="最后检查时间" width="180" />
            <el-table-column prop="responseTime" label="响应时间(ms)" width="120" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button size="small" @click="viewDetails(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧：活动记录 -->
      <el-col :span="8">
        <el-card class="activity-card">
          <template #header>
            <div class="card-header">
              <span>最近活动</span>
            </div>
          </template>
          
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in activities"
              :key="index"
              :timestamp="activity.timestamp"
              :type="activity.type"
            >
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <!-- 服务详情对话框 -->
    <el-dialog v-model="dialogVisible" title="服务详情" width="50%">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="服务名称">{{ currentService.name }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentService.status === '正常' ? 'success' : currentService.status === '警告' ? 'warning' : 'danger'">
            {{ currentService.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="最后检查时间">{{ currentService.lastCheck }}</el-descriptions-item>
        <el-descriptions-item label="响应时间">{{ currentService.responseTime }} ms</el-descriptions-item>
        <el-descriptions-item label="可用性">{{ currentService.availability }}</el-descriptions-item>
        <el-descriptions-item label="平均响应时间">{{ currentService.avgResponseTime }} ms</el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="dialogVisible = false">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

// 路由实例
const router = useRouter()

// 概览数据
const overviewData = ref([
  { title: '总服务数', value: '24', change: 5 },
  { title: '在线服务', value: '22', change: 2 },
  { title: '异常服务', value: '2', change: -1 },
  { title: '今日请求数', value: '1,245', change: 12 }
])

// 服务状态数据
const serviceStatus = ref([])

// 最近活动数据
const activities = ref([
  {
    content: '订单服务恢复正常',
    timestamp: '2023-06-15 14:30',
    type: 'success'
  },
  {
    content: '库存服务出现延迟',
    timestamp: '2023-06-15 12:45',
    type: 'warning'
  },
  {
    content: '支付服务中断',
    timestamp: '2023-06-15 10:15',
    type: 'danger'
  },
  {
    content: '用户服务更新完成',
    timestamp: '2023-06-14 18:20',
    type: ''
  }
])

interface ServiceDetail {
  name: string
  status: string
  lastCheck: string
  responseTime: number
  availability: string
  avgResponseTime: number
}
// 对话框控制
const dialogVisible = ref(false)
const currentService = ref<ServiceDetail>({
  name: '',
  status: '',
  lastCheck: '',
  responseTime: 0,
  availability: '',
  avgResponseTime: 0
})
// 返回上一页
const goBack = () => {
  router.back()
}

// 刷新服务状态
const refreshStatus = async () => {
  try {
    // 模拟API调用
    const response = await axios.get('/api/integration/status')
    serviceStatus.value = response.data
    ElMessage.success('状态刷新成功')
  } catch (error) {
    console.error('获取服务状态失败:', error)
    ElMessage.error('获取服务状态失败')
  }
}

// 查看服务详情
const viewDetails = (service: any) => {
  currentService.value = service
  dialogVisible.value = true
}

// 初始化加载数据
onMounted(async () => {
  await refreshStatus()
})
</script>

<style scoped>
.integration-center {
  padding: 20px;
}

.mb-4 {
  margin-bottom: 16px;
}

.overview-card {
  height: 120px;
}

.overview-content {
  text-align: center;
  padding: 10px 0;
}

.overview-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.overview-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.overview-change.positive {
  color: #67c23a;
}

.overview-change.negative {
  color: #f56c6c;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.service-status-card,
.activity-card {
  height: calc(100vh - 280px);
}

.dialog-footer {
  text-align: right;
}
</style>