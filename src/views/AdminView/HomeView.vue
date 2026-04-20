<template>
  <el-container class="layout-container-demo" style="height: 100vh">
    <el-header class="header">
      <!-- 左侧: Logo + 系统标题 -->
      <div class="header-left">
        <div class="logo">
          <!-- SVG医疗图标 - 蓝色主题色 -->
          <svg t="1775711538230" class="logo-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1881" width="36" height="36">
            <path d="M689.30366 475.342102l79.31237 0 0 79.316463 79.320557 0 0 79.316463-79.320557 0 0 79.316463-79.31237 0 0-79.316463-79.320557 0 0-79.316463 79.320557 0L689.30366 475.342102 689.30366 475.342102zM494.963487 463.324394 11.12692 463.324394 11.12692 300.845882c0-13.087063 10.711969-23.794939 23.794939-23.794939l436.248735 0c13.081946 0 23.790846 10.707876 23.790846 23.794939L494.963487 463.324394 494.963487 463.324394zM130.097522 649.837298l222.104517 0 0 63.453171L130.097522 713.290469 130.097522 649.837298 130.097522 649.837298zM610.178555 365.132024c-3.9121 3.768837-8.137331 7.257288-12.626575 10.429537-0.73985 0.553609-1.487887 1.072425-2.258437 1.588171-21.521153 14.355963-43.193755 28.473495-64.574714 43.069935-3.222391 2.176572-4.013407 4.91494-4.013407 8.79941l0 356.806405c0 9.279341 3.715625 17.331737 10.824533 23.318078 7.110955 5.988388 15.626909 8.330736 24.810059 6.782473l70.77595-12.014638c66.579371-11.304464 125.102253-11.304464 191.668321 0l70.78516 12.014638c9.178033 1.548262 17.699104-0.789992 24.809035-6.782473 7.109931-5.987365 10.837836-14.038738 10.837836-23.318078 0-118.93581 0-237.870596 0-356.806405 0-4.044106-0.921999-6.739495-4.315282-9.039887l-64.276932-42.872436c-5.350868-3.566222-10.340509-7.570419-14.900362-11.974729-39.59274 3.291976-79.17627 7.099698-118.765941 7.099698-39.59581 0-79.184457-3.807722-118.78436-7.099698L610.178555 365.132024z" fill="#ffffff" p-id="1882"></path>
            <path d="M927.237701 201.700815l-35.680641 0 0 71.302953c0 6.386454 1.359974 12.137435 3.965312 17.017582 2.611477 4.875031 6.596232 9.197476 11.82942 12.68695l0.072655 0.038886 0.016373-0.038886 66.004273 43.979654c0.528026 0.357134 1.030469 0.717338 1.518586 1.111311 11.05273 7.734148 19.755949 17.49035 25.827225 28.871561 6.386454 11.897981 9.740852 25.220405 9.740852 39.302121l0.00307 416.291195c0 17.489326-7.143701 33.353642-18.631336 44.851511-11.486612 11.463076-27.358091 18.60166-44.824905 18.60166L510.842129 895.717312c-2.691295 0-5.340635-0.157589-7.941879-0.476861l0.002047-49.254797c2.340301 1.38658 5.055133 2.14178 7.936763 2.14178l436.239526 0c4.329609 0 8.29492-1.784646 11.17655-4.678556 2.885723-2.854001 4.686742-6.824429 4.686742-11.184737l0-416.291195c0-6.385431-1.37123-12.136412-3.965312-17.012466-2.448772-4.561899-6.109138-8.647961-10.851139-11.978822-0.358157-0.23536-0.724501-0.476861-1.077541-0.713244l-66.001203-43.980677 0.030699-0.038886c-11.792581-7.892761-21.034059-18.047028-27.381627-29.945009-6.382361-11.896958-9.728572-25.220405-9.728572-39.302121l0-71.302953L613.950462 201.698768l0 71.302953c0 14.081717-3.354398 27.405163-9.741875 39.302121-6.012947 11.261485-14.627139 20.982894-25.557072 28.674063-0.577145 0.433882-1.172709 0.913812-1.789763 1.308809l-54.138014 36.087916 0-57.186444 27.741831-18.481933c0.416486-0.317225 0.840134-0.554632 1.269923-0.789992 4.65502-3.373841 8.240685-7.377014 10.646478-11.896958 2.606361-4.880147 3.964288-10.631128 3.964288-17.017582l0-71.302953-35.675524 0L530.670733 27.204595c0-13.087063 10.700713-23.794939 23.779589-23.794939l349.006765 0c13.078877 0 23.779589 10.746762 23.779589 23.794939L927.236678 201.700815 927.237701 201.700815zM463.249181 511.033999 463.249181 979.00011c0 10.945283-4.461615 20.859074-11.637038 28.03859-7.1744 7.17747-17.096377 11.618619-28.021194 11.618619L82.503551 1018.657318c-10.92584 0-20.847817-4.442172-28.024264-11.618619-0.642636-0.63445-1.24741-1.308809-1.796926-2.025123-6.115278-6.978948-9.837042-16.061814-9.837042-26.01449l0.004093-467.966111 47.585785 0 0 43.623543 261.766842 0 0 47.589878L90.435197 602.246397l0 198.290135 261.766842 0 0 47.589878L90.435197 848.12641l0 122.94103 325.220013 0L415.65521 511.033999 463.249181 511.033999z" fill="#ffffff" p-id="1883"></path>
          </svg>
        </div>
        <div class="divider"></div>
        <div class="system-title">蓝湖智药管理系统</div>
      </div>
      
      <!-- 右侧: 用户信息 -->
      <div class="header-right">
        <div class="toolbar">
          <el-dropdown trigger="click">
            <div class="user-info">
              <el-avatar 
                :size="32" 
                :src="getAvatarUrl(userInfo?.avatar || '')"
                style="margin-right: 8px; background: linear-gradient(135deg, #93CDFC 0%, #6BA3D6 100%);"
                @error="(e: Event) => { const img = e.target as HTMLImageElement; img.src = defaultAvatar; }"
              >
                <span style="font-size: 14px; color: white; font-weight: 600;">{{ displayInitial }}</span>
              </el-avatar>
              <span class="username">{{ displayName }}</span>
              <el-icon class="dropdown-icon"><arrow-down /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToRoute('MyProfile')">
                  <el-icon style="margin-right: 5px;"><user /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item @click="switchAccount">
                  <el-icon style="margin-right: 5px;"><switch-button /></el-icon>
                  切换账号
                </el-dropdown-item>
                <el-dropdown-item divided @click="logout">
                  <el-icon style="margin-right: 5px;"><switch /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <el-container style="height: calc(100vh - 60px)">
      <el-aside width="160px" class="aside">
        <el-scrollbar style="height: 100%">
          <!-- 设置默认展开 -->
         <!-- 在 UserView/HomeView.vue 的 template 部分替换 el-menu 内容 -->
<el-menu :default-openeds="['1']">
  <el-menu-item index="0" @click="goToAdminCenter">
    <el-icon><Monitor /></el-icon>
    <span>集成中心</span>
  </el-menu-item>

  <el-sub-menu index="2">
    <template #title>
      <el-icon><icon-menu /></el-icon>数据统计
    </template>
    <el-menu-item-group>
      <el-menu-item index="2-1" @click="goToRoute('SalesStats')">销售统计</el-menu-item>
      <el-menu-item index="2-2" @click="goToRoute('HotSalesStats')">热销统计</el-menu-item>
    </el-menu-item-group>
  </el-sub-menu>
  <el-sub-menu index="3">
    <template #title>
      <el-icon>
        <setting />
      </el-icon>设置
    </template>
    <el-menu-item-group>
      <template #title>参数设置</template>
      <el-menu-item index="3-1" @click="goToRoute('StockSettings')">参数设置</el-menu-item>
      <!-- <el-menu-item index="3-2" @click="goToRoute('StatsSettings')">统计参数设置</el-menu-item> -->
    </el-menu-item-group>
  </el-sub-menu>
  <el-sub-menu index="4">
    <template #title>
      <el-icon>
        <icon-menu />
      </el-icon>系统管理
    </template>
    <el-menu-item-group>
      <template #title>用户管理</template>
      <el-menu-item index="4-1" @click="goToRoute('UserManagement')">用户管理</el-menu-item>
      <el-menu-item index="4-2" @click="goToRoute('RoleManagement')">角色管理</el-menu-item>
      <el-menu-item index="4-3" @click="goToRoute('MyProfile')">个人中心</el-menu-item>
    </el-menu-item-group>
  </el-sub-menu>
</el-menu>
        </el-scrollbar>
      </el-aside>

      <el-container>
        <el-main>
          <!-- <el-scrollbar>
            <el-table :data="tableData">
              <el-table-column prop="date" label="Date" width="140" />
              <el-table-column prop="name" label="Name" width="120" />
              <el-table-column prop="address" label="Address" />
            </el-table>
          </el-scrollbar> -->

            <el-scrollbar>
    <router-view />
  </el-scrollbar>
        </el-main>

        <!-- 添加 Footer -->
        <el-footer class="footer"  >
          <div class="footer-content">
            <p>© 2025 蓝湖. 版权所有.Version 1.0.0 | Contact: 1437689804@qq.com</p>
          </div>
        </el-footer>
      </el-container>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { Menu as IconMenu, Message, Setting ,Monitor } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useStore } from 'vuex'
import { authService } from '@/services/authService'


const router = useRouter()
const store = useStore()

// 从 store 获取用户信息
const userInfo = computed(() => store.state.user)

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 处理头像路径显示
const getAvatarUrl = (avatarPath: string): string => {
  if (!avatarPath || avatarPath === '/default-avatar.png') {
    return defaultAvatar;
  }
  
  // 如果已经是完整URL，直接返回
  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }
  
  return defaultAvatar;
};

// 获取用户名（优先使用 name，其次 username）
const displayName = computed(() => {
  if (!userInfo.value) return '管理员';
  return userInfo.value.name || userInfo.value.username || '管理员';
});

// 获取用户名的首字母用于头像
const displayInitial = computed(() => {
  const name = displayName.value;
  return name ? name.charAt(0).toUpperCase() : 'A';
});

const navigateTo = (name: string) => {
  router.push({ name })
}

// 新增：为每个菜单项添加具体的路由导航
const goToRoute = (routeName: string) => {
  router.push({ name: routeName })
}

// 专门为集成中心添加的导航方法，确保跳转到正确的管理员路径
const goToAdminCenter = () => {
  router.push('/admin/center')
}

// 组件挂载时加载用户信息
onMounted(async () => {
  // 如果 store 中没有用户信息，尝试从 API 获取
  if (!store.state.user && store.state.token) {
    try {
      console.log('Admin HomeView: 检测到 token 但无用户信息，尝试获取...');
      const userProfile = await authService.getProfile();
      console.log('Admin HomeView: 获取到用户信息:', userProfile);
    } catch (error) {
      console.error('Admin HomeView: 获取用户信息失败:', error);
    }
  }
});

// 切换账号功能
const switchAccount = async () => {
  try {
    // 获取当前token
    const currentToken = localStorage.getItem('token')
    
    if (!currentToken) {
      // 如果没有token，直接跳转到登录页
      router.push('/login')
      return
    }
    
    // 这里需要获取新账号信息，可以通过弹窗或其他方式
    // 示例：假设我们有新账号信息
    const newAccountInfo = {
      username: 'newUsername', // 需要实际获取
      password: 'newPassword'  // 需要实际获取
    }
    
    // 调用后端切换账号接口
    const response = await axios.post('/switch-account', newAccountInfo, {
      headers: {
        'token': currentToken
      }
    })
    
    if (response.data.code === 1) { // 假设1表示成功
      // 更新本地存储的token
      localStorage.setItem('token', response.data.data)
      // 可以更新其他用户信息
      // localStorage.setItem('username', newUsername)
      
      // 刷新页面或重新加载用户信息
      window.location.reload()
    } else {
      console.error('切换账号失败:', response.data.msg)
    }
  } catch (error) {
    console.error('切换账号请求失败:', error)
  }
}

// 退出登录功能
const logout = async () => {
  try {
    const token = localStorage.getItem('token')
    if (token) {
      // 调用后端退出登录接口
      await axios.post('/logout', {}, {
        headers: {
          'token': token
        }
      })
    }
 // 清除本地存储的用户信息
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    
    // 跳转到登录页面
    router.push('/login')
  }catch (error) {
    console.error('退出登录失败:', error)
    // 即使后端调用失败，也清除本地信息并跳转到登录页
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    router.push('/login')
  }
}
</script>

<style scoped lang="scss">
.layout-container-demo {
  height: 100vh;
}

/* Header 样式 - 蓝色主题 */
.header {
  background: linear-gradient(135deg, #93CDFC 0%, #6BA3D6 100%);
  color: #ffffff;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(107, 163, 214, 0.3);
  position: relative;
  z-index: 10;
  
  /* 顶部装饰条 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #ffffff 0%, rgba(255, 255, 255, 0.3) 50%, #ffffff 100%);
  }
}

/* 左侧: Logo + 标题 */
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Logo 图标样式 */
.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.05) rotate(5deg);
    background: rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
  }
  
  .logo-icon {
    transition: transform 0.3s ease;
  }
}

/* 分隔线 */
.divider {
  width: 1px;
  height: 32px;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.6), transparent);
}

/* 系统标题样式 */
.system-title {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}

/* 右侧: 用户信息 */
.header-right {
  display: flex;
  align-items: center;
}

/* 用户信息区域 */
.toolbar {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }
  
  .username {
    font-size: 14px;
    font-weight: 500;
    color: #ffffff;
    margin-right: 6px;
  }
  
  .dropdown-icon {
    color: #ffffff;
    font-size: 12px;
    transition: transform 0.3s ease;
  }
  
  &:hover .dropdown-icon {
    transform: rotate(180deg);
  }
}

/* 侧边栏样式 */
.layout-container-demo .el-aside {
  color: var(--el-text-color-primary);
  background: #f8f9fa;
  height: 100%;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.layout-container-demo .el-menu {
  border-right: none;
  height: 100%;
  background: transparent;
}

/* 主内容区域 */
.layout-container-demo .el-main {
  padding: 24px;
  height: calc(100vh - 60px - 15px);
  background: #f5f7fa;
  overflow: auto;
}

/* Footer 样式 */
.layout-container-demo .el-footer {
  background-color: #ffffff;
  color: #606266;
  text-align: center;
  padding: 4px 20px;
  height: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #e4e7ed;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.03);
}

.footer-content p {
  margin: 1px 0;
  font-size: 10px;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }
  
  .system-title {
    font-size: 16px;
    letter-spacing: 1px;
  }
  
  .logo {
    width: 36px;
    height: 36px;
  }
  
  .user-info {
    padding: 4px 12px;
    
    .username {
      display: none;
    }
  }
}
</style>