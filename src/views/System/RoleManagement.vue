<!-- src/views/System/RoleManagement.vue -->
<template>
  <div class="role-management">
    <h2>角色管理</h2>
    
    <!-- 操作栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="showAddRoleDialog">新增角色</el-button>
      <el-button @click="refreshRoles">刷新</el-button>
    </div>

    <!-- 角色表格 -->
    <el-table 
      :data="roles" 
      v-loading="loading"
      element-loading-text="加载中..."
      style="width: 100%"
      border
    >
      <el-table-column prop="id" label="角色ID" width="80" />
      <el-table-column prop="name" label="角色名称" width="150" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="userCount" label="用户数" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="showEditRoleDialog(scope.row)">编辑</el-button>
          <el-button size="small" @click="configPermissions(scope.row)">配置权限</el-button>
          <el-button 
            size="small" 
            type="danger" 
            @click="deleteRole(scope.row)"
            :disabled="scope.row.id === 1"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑角色对话框 -->
    <el-dialog 
      :title="dialogTitle" 
      v-model="roleDialogVisible" 
      width="500px"
      @close="handleRoleDialogClose"
    >
      <el-form 
        :model="currentRole" 
        :rules="roleFormRules" 
        ref="roleFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="currentRole.name" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input 
            v-model="currentRole.description" 
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="currentRole.status"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRole">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 权限配置对话框 -->
    <el-dialog 
      title="配置权限" 
      v-model="permissionDialogVisible" 
      width="600px"
      @close="handlePermissionDialogClose"
    >
      <div class="permission-tree">
        <el-tree
          ref="permissionTreeRef"
          :data="permissions"
          show-checkbox
          node-key="id"
          :props="defaultProps"
          :default-checked-keys="selectedPermissions"
          :default-expanded-keys="expandedPermissionKeys"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="savePermissions">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog 
      title="确认删除" 
      v-model="deleteDialogVisible" 
      width="400px"
    >
      <span>确定要删除角色 "{{ roleToDelete?.name }}" 吗？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDeleteRole">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElTree } from 'element-plus'
import { adminService } from '@/services/adminService'
import type { FormInstance, FormRules } from 'element-plus'
import type { Role, Permission } from '@/services/adminService'

// 角色数据
const roles = ref<Role[]>([])

// 权限数据
const permissions = ref<Permission[]>([])

// 加载状态
const loading = ref(false)

// 当前编辑的角色
const currentRole = reactive<Partial<Role>>({
  id: 0,
  name: '',
  description: '',
  status: 1
})

// 当前配置权限的角色
const currentRoleId = ref<number>(0)

// 选中的权限
const selectedPermissions = ref<number[]>([])

// 展开的权限节点
const expandedPermissionKeys = ref<number[]>([])

// 对话框状态
const roleDialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const isEditMode = ref(false)
const roleToDelete = ref<Role | null>(null)

// 表单引用
const roleFormRef = ref<FormInstance>()
const permissionTreeRef = ref<InstanceType<typeof ElTree> | null>(null)

// 树形控件属性
const defaultProps = {
  children: 'children',
  label: 'label'
}

// 表单验证规则
const roleFormRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入角色描述', trigger: 'blur' }
  ]
})

// 对话框标题
const dialogTitle = computed(() => {
  return isEditMode.value ? '编辑角色' : '新增角色'
})

// 格式化日期
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

/**
 * 加载角色数据
 * 调用 adminService.getAllRoles() 获取所有角色
 */
const loadRoles = async () => {
  loading.value = true
  try {
    const response = await adminService.getAllRoles()
    roles.value = response
    console.log('角色列表加载成功:', response)
  } catch (error: any) {
    console.error('加载角色数据失败:', error)
    ElMessage.error(error.response?.status === 404 
      ? 'API 接口未找到，请检查后端服务是否启动'
      : `加载角色数据失败：${error.message}`)
  } finally {
    loading.value = false
  }
}

/**
 * 加载权限数据
 * 调用 adminService.getPermissionTree() 获取权限树
 */
const loadPermissions = async () => {
  try {
    const response = await adminService.getPermissionTree()
    permissions.value = response
    console.log('权限树加载成功:', response)
  } catch (error: any) {
    console.error('加载权限数据失败:', error)
    // 如果 API 失败，使用模拟数据用于开发测试
    permissions.value = [
      {
        id: 1,
        label: '系统管理',
        name: 'system',
        type: 'menu',
        children: [
          {
            id: 101,
            label: '用户管理',
            name: 'user management',
            type: 'menu',
            children: [
              { id: 1011, label: '查看用户', name: 'view user', type: 'button' as const },
              { id: 1012, label: '新增用户', name: 'create user', type: 'button' as const },
              { id: 1013, label: '编辑用户', name: 'edit user', type: 'button' as const },
              { id: 1014, label: '删除用户', name: 'delete user', type: 'button' as const }
            ]
          },
          {
            id: 102,
            label: '角色管理',
            name: 'role management',
            type: 'menu',
            children: [
              { id: 1021, label: '查看角色', name: 'view role', type: 'button' as const },
              { id: 1022, label: '新增角色', name: 'create role', type: 'button' as const },
              { id: 1023, label: '编辑角色', name: 'edit role', type: 'button' as const },
              { id: 1024, label: '删除角色', name: 'delete role', type: 'button' as const }
            ]
          }
        ]
      },
      {
        id: 2,
        label: '药品管理',
        name: 'drug management',
        type: 'menu',
        children: [
          { id: 201, label: '药品信息管理', name: 'drug info', type: 'menu' as const },
          { id: 202, label: '库存管理', name: 'inventory', type: 'menu' as const },
          { id: 203, label: '进货管理', name: 'stock in', type: 'menu' as const }
        ]
      },
      {
        id: 3,
        label: '销售管理',
        name: 'sales management',
        type: 'menu',
        children: [
          { id: 301, label: '扫码销售', name: 'scan sale', type: 'button' as const },
          { id: 302, label: '手动销售', name: 'manual sale', type: 'button' as const },
          { id: 303, label: '收银结算', name: 'payment', type: 'button' as const }
        ]
      },
      {
        id: 4,
        label: '统计报表',
        name: 'statistics',
        type: 'menu',
        children: [
          { id: 401, label: '销售统计', name: 'sales stats', type: 'menu' as const },
          { id: 402, label: '热销统计', name: 'hot sales', type: 'menu' as const },
          { id: 403, label: '销售记录', name: 'sales records', type: 'menu' as const }
        ]
      }
    ]
  }
}

// 刷新角色列表
const refreshRoles = () => {
  loadRoles()
}

// 显示新增角色对话框
const showAddRoleDialog = () => {
  isEditMode.value = false
  Object.assign(currentRole, {
    id: 0,
    name: '',
    description: '',
    status: 1
  })
  roleDialogVisible.value = true
}

// 显示编辑角色对话框
const showEditRoleDialog = (role: Role) => {
  isEditMode.value = true
  Object.assign(currentRole, { ...role })
  roleDialogVisible.value = true
}

/**
 * 保存角色
 * 根据编辑模式调用创建或更新接口
 */
const saveRole = async () => {
  if (!roleFormRef.value) return
  
  await roleFormRef.value.validate(async (valid) => {
    if (valid) {
      const roleData = {
        name: currentRole.name || '',
        description: currentRole.description || '',
        status: currentRole.status ?? 1
      }
        
      if (isEditMode.value && currentRole.id) {
        // 编辑角色
        await adminService.updateRole(currentRole.id, roleData)
        ElMessage.success('角色更新成功')
      } else {
        // 新增角色
        await adminService.createRole(roleData)
        ElMessage.success('角色创建成功')
      }
        
      roleDialogVisible.value = false
      loadRoles()
    }
  })
}

// 处理角色对话框关闭
const handleRoleDialogClose = () => {
  if (roleFormRef.value) {
    roleFormRef.value.resetFields()
  }
}

/**
 * 配置权限
 * 加载角色的已有权限并显示权限配置对话框
 */
const configPermissions = async (role: Role) => {
  currentRoleId.value = role.id
  permissionDialogVisible.value = true
  
  try {
    // 加载该角色已有的权限
    const response = await adminService.getRolePermissions(role.id)
    
    // 设置选中的权限
    selectedPermissions.value = response.map((p: Permission) => p.id)
    
    // 展开所有节点
    expandedPermissionKeys.value = getAllPermissionIds(permissions.value)
    console.log('角色权限加载成功:', response)
  } catch (error: any) {
    console.error('加载角色权限失败:', error)
    ElMessage.error('加载角色权限失败')
  }
}

// 获取所有权限ID
const getAllPermissionIds = (perms: Permission[]): number[] => {
  let ids: number[] = []
  perms.forEach(perm => {
    ids.push(perm.id)
    if (perm.children) {
      ids = ids.concat(getAllPermissionIds(perm.children))
    }
  })
  return ids
}

/**
 * 保存权限配置
 * 调用 adminService.saveRolePermissions() 保存权限
 */
const savePermissions = async () => {
  if (!permissionTreeRef.value) return
  
  try {
    const checkedKeys = permissionTreeRef.value.getCheckedKeys() as number[]
    const halfCheckedKeys = permissionTreeRef.value.getHalfCheckedKeys() as number[]
    const allKeys = [...checkedKeys, ...halfCheckedKeys]
    
    await adminService.saveRolePermissions(currentRoleId.value, allKeys)
    
    ElMessage.success('权限配置保存成功')
    permissionDialogVisible.value = false
  } catch (error: any) {
    console.error('保存权限配置失败:', error)
    ElMessage.error('保存权限配置失败')
  }
}

// 处理权限对话框关闭
const handlePermissionDialogClose = () => {
  selectedPermissions.value = []
  expandedPermissionKeys.value = []
}

// 删除角色
const deleteRole = (role: Role) => {
  // 禁止删除系统管理员角色
  if (role.id === 1) {
    ElMessage.warning('不能删除系统管理员角色')
    return
  }
  
  roleToDelete.value = role
  deleteDialogVisible.value = true
}

/**
 * 确认删除角色
 * 调用 adminService.deleteRole() 删除角色
 */
const confirmDeleteRole = async () => {
  if (!roleToDelete.value) return
  
  try {
    await adminService.deleteRole(roleToDelete.value.id)
    ElMessage.success('角色删除成功')
    deleteDialogVisible.value = false
    loadRoles()
  } catch (error: any) {
    console.error('删除角色失败:', error)
    ElMessage.error('删除角色失败')
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadRoles()
  loadPermissions()
})
</script>

<style scoped>
.role-management {
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
}

.permission-tree {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>