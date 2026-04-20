<!-- src/views/Settings/StockSettings.vue -->
<template>
  <div class="stock-settings">
    <h2>系统设置</h2>
    
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>权限设置</span>
        </div>
      </template>
      
      <el-form :model="settings" label-width="200px" label-position="left">
        <el-form-item label="是否允许管理员注册">
          <el-switch
            v-model="settings.allowAdminRegistration"
            active-text="允许"
            inactive-text="禁止"
          />
          <div class="form-tip">开启后，新用户可以进行管理员注册</div>
        </el-form-item>
        
        <el-form-item label="是否允许普通用户注册">
          <el-switch
            v-model="settings.allowUserRegistration"
            active-text="允许"
            inactive-text="禁止"
          />
          <div class="form-tip">开启后，新用户可以进行普通用户注册</div>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="saveSettings" :loading="saving">
            保存设置
          </el-button>
          <el-button @click="resetSettings">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSystemConfig, updateSystemConfig, type SystemConfig } from '@/services/systemConfigService'

// 设置数据
const settings = reactive<SystemConfig>({
  allowAdminRegistration: false,
  allowUserRegistration: true
})

// 保存原始数据用于重置
const originalSettings = ref<SystemConfig>({
  allowAdminRegistration: false,
  allowUserRegistration: true
})

// 保存状态
const saving = ref(false)

// 加载系统设置
const loadSettings = async () => {
  try {
    const config = await getSystemConfig()
    
    // 更新设置数据
    settings.allowAdminRegistration = config.allowAdminRegistration
    settings.allowUserRegistration = config.allowUserRegistration
    
    // 保存原始数据
    originalSettings.value = { ...config }
    
    console.log('加载的系统配置:', config)
  } catch (error: any) {
    console.error('加载设置失败:', error)
    ElMessage.error(error.message || '加载设置失败')
  }
}

// 保存系统设置
const saveSettings = async () => {
  saving.value = true
  
  try {
    await updateSystemConfig(settings)
    
    ElMessage.success('设置保存成功')
    
    // 更新原始数据
    originalSettings.value = { ...settings }
  } catch (error: any) {
    console.error('保存设置失败:', error)
    ElMessage.error(error.message || '保存设置失败')
  } finally {
    saving.value = false
  }
}

// 重置设置
const resetSettings = () => {
  // 恢复到原始数据
  settings.allowAdminRegistration = originalSettings.value.allowAdminRegistration
  settings.allowUserRegistration = originalSettings.value.allowUserRegistration
  ElMessage.info('已重置为上次保存的设置')
}

// 组件挂载时加载数据
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.stock-settings {
  padding: 20px;
}

.settings-card {
  max-width: 800px;
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  line-height: 1.5;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-switch) {
  margin-left: 10px;
}
</style>