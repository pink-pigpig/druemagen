// src/router/index.ts
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import type { DefineComponent } from 'vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue').then(m => m.default || m) as Promise<DefineComponent>
  },
  {
    path: '/user',
    name: 'userhomer',
    component: () => import('../views/UserView/HomeView.vue').then(m => m.default || m) as Promise<DefineComponent>,
    children: [
      {
        path: 'center',
        name: 'UserCenter',
        component: () => import('../views/UserView/CenterView.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      // 药店管理 - 药店库存
      {
        path: 'drugstore/inventory-query',
        name: 'UserInventoryQuery',
        component: () => import('../views/DrugStore/InventoryQuery.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      {
        path: 'drugstore/inventory-management',
        name: 'UserInventoryManagement',
        component: () => import('../views/DrugStore/InventoryManagement.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      {
        path: 'drugstore/inventory-test',
        name: 'UserInventoryTest',
        component: () => import('../views/DrugStore/InventoryTest.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      {
        path: 'drugstore/stock-in',
        name: 'UserStockIn',
        component: () => import('../views/DrugStore/StockIn.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      {
        path: 'drugstore/stock-out',
        name: 'UserStockOut',
        component: () => import('../views/DrugStore/StockOut.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      // 药店管理 - 药店销售
      {
        path: 'drugstore/scan-sale',
        name: 'UserScanSale',
        component: () => import('../views/DrugStore/ScanSale.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      {
        path: 'drugstore/manual-sale',
        name: 'UserManualSale',
        component: () => import('../views/DrugStore/ManualSale.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      {
        path: 'drugstore/cashier',
        name: 'UserCashier',
        component: () => import('../views/DrugStore/CashierPage.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      {
        path: 'drugstore/payment-detail',
        name: 'UserPaymentDetail',
        component: () => import('../views/DrugStore/PaymentDetail.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      {
        path: 'drugstore/sales-records',
        name: 'UserSalesRecords',
        component: () => import('../views/DrugStore/SalesRecords.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      // 数据统计
      {
        path: 'statistics/sales-stats',
        name: 'UserSalesStats',
        component: () => import('../views/Statistics/SalesStats.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      {
        path: 'statistics/hot-sales-stats',
        name: 'UserHotSalesStats',
        component: () => import('../views/Statistics/HotSalesStats.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      // 设置
      {
        path: 'settings/stock-settings',
        name: 'UserStockSettings',
        component: () => import('../views/Settings/StockSettings.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      {
        path: 'settings/stats-settings',
        name: 'UserStatsSettings',
        component: () => import('../views/Settings/StatsSettings.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      // 系统管理
      {
        path: 'system/user-management',
        name: 'UserManagement',
        component: () => import('../views/System/UserManagement.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      {
        path: 'system/role-management',
        name: 'UserRoleManagement',
        component: () => import('../views/System/RoleManagement.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      {
        path: 'system/my-profile',
        name: 'UserMyProfile',
        component: () => import('../views/System/MyProfile.vue').then(m => m.default || m) as Promise<DefineComponent>
      }
    ]
  },
   {
    path: '/admin',
    name: 'adminhomer',
    component: () => import('../views/AdminView/HomeView.vue').then(m => m.default || m) as Promise<DefineComponent>,
    children: [
      {
        path: 'center',
        name: 'Center',
        component: () => import('../views/UserView/CenterView.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      // 药店管理 - 药店库存
      {
        path: 'drugstore/inventory-query',
        name: 'InventoryQuery',
        component: () => import('../views/DrugStore/InventoryQuery.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      {
        path: 'drugstore/stock-in',
        name: 'StockIn',
        component: () => import('../views/DrugStore/StockIn.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      {
        path: 'drugstore/stock-out',
        name: 'StockOut',
        component: () => import('../views/DrugStore/StockOut.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      // 药店管理 - 药店销售
      {
        path: 'drugstore/scan-sale',
        name: 'ScanSale',
        component: () => import('../views/DrugStore/ScanSale.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      {
        path: 'drugstore/manual-sale',
        name: 'ManualSale',
        component: () => import('../views/DrugStore/ManualSale.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      {
        path: 'drugstore/cashier',
        name: 'Cashier',
        component: () => import('../views/DrugStore/CashierPage.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      {
        path: 'drugstore/sales-records',
        name: 'SalesRecords',
        component: () => import('../views/DrugStore/SalesRecords.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      // 数据统计
      {
        path: 'statistics/sales-stats',
        name: 'SalesStats',
        component: () => import('../views/Statistics/SalesStats.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      {
        path: 'statistics/hot-sales-stats',
        name: 'HotSalesStats',
        component: () => import('../views/Statistics/HotSalesStats.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      // 设置
      {
        path: 'settings/stock-settings',
        name: 'StockSettings',
        component: () => import('../views/Settings/StockSettings.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      {
        path: 'settings/stats-settings',
        name: 'StatsSettings',
        component: () => import('../views/Settings/StatsSettings.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      // 系统管理
      {
        path: 'system/user-management',
        name: 'UserManagement',
        component: () => import('../views/System/UserManagement.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      {
        path: 'system/role-management',
        name: 'RoleManagement',
        component: () => import('../views/System/RoleManagement.vue').then(m => m.default || m) as Promise<DefineComponent>
      },
      {
        path: 'system/my-profile',
        name: 'MyProfile',
        component: () => import('../views/System/AdminMyProfile.vue').then(m => m.default || m) as Promise<DefineComponent>
      }
    ]
  },
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue').then(m => m.default || m) as Promise<DefineComponent>
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/UserLogin.vue').then(m => m.default || m) as Promise<DefineComponent>
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/UserRegister.vue').then(m => m.default || m) as Promise<DefineComponent>
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router