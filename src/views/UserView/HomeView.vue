<template>
  <el-container class="layout-container-demo" style="height: 100vh">
    <el-header style="text-align: right; font-size: 12px">
      <!-- 添加系统标题 -->
      <div class="system-title">XX系统</div>
      <el-button type="primary">主要操作</el-button>
      <div class="toolbar">
        <el-dropdown>
          <el-icon style="margin-right: 8px; margin-top: px">
            <setting />
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>查看</el-dropdown-item>
              <el-dropdown-item>添加</el-dropdown-item>
              <el-dropdown-item>删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <span>Tom</span>
      </div>
    </el-header>

    <el-container style="height: calc(100vh - 60px)">
      <el-aside width="160px" class="aside">
        <el-scrollbar style="height: 100%">
          <!-- 设置默认展开 -->
         <!-- 在 UserView/HomeView.vue 的 template 部分替换 el-menu 内容 -->
<el-menu :default-openeds="['1']">
  <el-menu-item index="0" @click="navigateTo('Center')">
    <el-icon><Monitor /></el-icon>
    <span>集成中心</span>
  </el-menu-item>
  <el-sub-menu index="1">
    <template #title>
      <el-icon>
        <message />
      </el-icon>药店管理
    </template>
    <el-menu-item-group title="药店库存">
      <el-menu-item index="1-1" @click="goToRoute('InventoryQuery')">查询库存</el-menu-item>
      <el-menu-item index="1-2" @click="goToRoute('StockIn')">入库</el-menu-item>
      <el-menu-item index="1-3" @click="goToRoute('StockOut')">出库</el-menu-item>
    </el-menu-item-group>
    <el-menu-item-group title="药店销售">
      <el-menu-item index="1-4" @click="goToRoute('ScanSale')">扫码销售</el-menu-item>
      <el-menu-item index="1-5" @click="goToRoute('ManualSale')">手动销售</el-menu-item>
      <el-menu-item index="1-6" @click="goToRoute('Cashier')">收银结算</el-menu-item>
      <el-menu-item index="1-7" @click="goToRoute('SalesRecords')">销售记录</el-menu-item>
    </el-menu-item-group>
  </el-sub-menu>
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
      <el-menu-item index="3-1" @click="goToRoute('StockSettings')">出入库参数设置</el-menu-item>
      <el-menu-item index="3-2" @click="goToRoute('StatsSettings')">统计参数设置</el-menu-item>
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
            <p>© 2025 蓝湖. 版权所有.</p>
            <p>Version 1.0.0 | Contact: 1437689804@qq.com</p>
          </div>
        </el-footer>
      </el-container>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { Menu as IconMenu, Message, Setting ,Monitor } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'


const router = useRouter()
const navigateTo = (name: string) => {
  router.push({ name })
}

// 新增：为每个菜单项添加具体的路由导航
const goToRoute = (routeName: string) => {
  router.push({ name: routeName })
}
</script>

<style scoped>
.layout-container-demo {
  height: 100vh;
}

.layout-container-demo .el-header {
  background-color: var(--el-color-primary-light-7);
  color: var(--el-text-color-primary);
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
}

.layout-container-demo .el-aside {
  color: var(--el-text-color-primary);
  background: var(--el-color-primary-light-8);
  height: 100%;
}

.layout-container-demo .el-menu {
  border-right: none;
  height: 100%;
}

.layout-container-demo .el-main {
  padding: 20px;
  height: calc(100vh - 60px - 30px);
  /* 总高度 - header - footer */
  overflow: auto;
}

.layout-container-demo .toolbar {
  display: inline-flex;
  align-items: center;
  height: 100%;
}

/* Footer 样式 */
.layout-container-demo .el-footer {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-text-color-primary);
  text-align: center;
  padding: 5px 20px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid var(--el-border-color-light);
}

.footer-content p {
  margin: 2px 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.footer-content p:first-child {
  font-weight: 500;
}

/* 确保滚动条容器占满高度 */
.layout-container-demo .el-scrollbar {
  height: 100%;
}

.layout-container-demo .el-scrollbar .el-scrollbar__wrap {
  overflow-x: hidden;
}

/* 添加系统标题样式 */
.system-title {
  position: absolute;
  left: 40px;
  font-size: 22px;
  font-weight: bold;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}
</style>
