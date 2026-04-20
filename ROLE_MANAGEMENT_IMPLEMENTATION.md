# 角色管理功能实现指南

## 📋 功能概述

角色管理是系统权限控制的核心模块，支持角色的增删改查以及权限配置功能。

## 🏗️ 架构设计

### 前端架构
```
src/
├── services/
│   └── adminService.ts          # 管理员服务（包含角色管理方法）
├── views/System/
│   └── RoleManagement.vue       # 角色管理页面
└── services/adminService.ts     # 导出的接口类型（Role, Permission）
```

### 后端架构
```
src/main/java/org/lanhu/druemagenbackend/
├── Controller/
│   └── RoleController.java      # 角色管理 REST API
├── dto/
│   └── RoleDto.java             # 角色数据传输对象
├── entity/
│   ├── Role.java                # 角色实体
│   └── Permission.java          # 权限实体
├── mapper/
│   └── RoleMapper.java          # 角色数据访问层
└── service/
    ├── RoleService.java         # 角色服务接口
    └── impl/
        └── RoleServiceImpl.java # 角色服务实现
```

## 📊 数据库设计

### 1. role 表 - 角色信息
```sql
CREATE TABLE `role` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(200),
  `status` TINYINT DEFAULT 1,
  `created_at` DATETIME,
  `updated_at` DATETIME
);
```

### 2. permission 表 - 权限信息
```sql
CREATE TABLE `permission` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,      -- 权限标识（英文）
  `label` VARCHAR(100) NOT NULL,     -- 显示名称（中文）
  `type` VARCHAR(20) DEFAULT 'menu', -- menu/button/api
  `parent_id` BIGINT DEFAULT 0,
  `path` VARCHAR(200),
  `sort_order` INT DEFAULT 0
);
```

### 3. role_permission 表 - 角色权限关联
```sql
CREATE TABLE `role_permission` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `role_id` BIGINT NOT NULL,
  `permission_id` BIGINT NOT NULL,
  UNIQUE KEY (`role_id`, `permission_id`)
);
```

## 🔌 API 接口文档

### 1. 获取所有角色
- **路径**: `GET /api/admin/roles`
- **认证**: 需要
- **响应**: 
```json
{
  "code": 1,
  "msg": null,
  "data": [
    {
      "id": 1,
      "name": "系统管理员",
      "description": "拥有系统全部权限",
      "status": 1,
      "userCount": 5,
      "createdAt": "2024-01-01T10:00:00"
    }
  ]
}
```

### 2. 创建角色
- **路径**: `POST /api/admin/roles`
- **请求体**:
```json
{
  "name": "新角色",
  "description": "角色描述",
  "status": 1,
  "permissionIds": [1, 2, 3]
}
```

### 3. 更新角色
- **路径**: `PUT /api/admin/roles/{id}`
- **请求体**: 同创建角色

### 4. 删除角色
- **路径**: `DELETE /api/admin/roles/{id}`
- **约束**: 
  - ID=1 的系统管理员角色不可删除
  - 有用户使用的角色不可删除

### 5. 获取角色权限
- **路径**: `GET /api/admin/roles/{id}/permissions`
- **响应**: 权限列表

### 6. 保存角色权限
- **路径**: `POST /api/admin/roles/{id}/permissions`
- **请求体**:
```json
[1, 2, 3, 101, 102]
```

### 7. 获取权限树
- **路径**: `GET /api/admin/permissions/tree`
- **响应**: 树形结构的权限列表

## 💻 前端使用示例

### 在 Vue 组件中使用

```vue
<script setup lang="ts">
import { adminService } from '@/services/adminService'

// 加载角色列表
const loadRoles = async () => {
  const roles = await adminService.getAllRoles()
  console.log('角色列表:', roles)
}

// 创建角色
const createRole = async () => {
  const newRole = await adminService.createRole({
    name: '新角色',
    description: '描述',
    status: 1
  })
}

// 配置权限
const configPermissions = async (roleId: number, permissionIds: number[]) => {
  await adminService.saveRolePermissions(roleId, permissionIds)
}
</script>
```

## 🔧 后端实现要点

### 1. 完善权限关联表的 CRUD 操作

在 `RoleServiceImpl.java` 中需要实现：

```java
@Autowired
private JdbcTemplate jdbcTemplate; // 或其他数据库操作工具

private void saveRolePermissionsInternal(Long roleId, List<Long> permissionIds) {
    String sql = "INSERT INTO role_permission (role_id, permission_id) VALUES (?, ?)";
    for (Long permissionId : permissionIds) {
        jdbcTemplate.update(sql, roleId, permissionId);
    }
}

private void deleteRolePermissionsInternal(Long roleId) {
    String sql = "DELETE FROM role_permission WHERE role_id = ?";
    jdbcTemplate.update(sql, roleId);
}
```

### 2. 在 UserMapper 中添加统计方法

```java
@Select("SELECT COUNT(*) FROM user WHERE role_id = #{roleId}")
Integer countByRoleId(Long roleId);
```

## 🚀 部署步骤

### 1. 执行数据库脚本
```bash
mysql -u root -p druemagen < src/main/resources/sql/role_management.sql
```

### 2. 启动后端服务
确保后端服务运行在 8080 端口

### 3. 启动前端服务
```bash
yarn serve
```

### 4. 访问页面
导航到：系统管理 → 角色管理

## ✅ 功能验证清单

- [ ] 角色列表正常显示
- [ ] 可以新增角色
- [ ] 可以编辑角色信息
- [ ] 可以删除角色（除系统管理员）
- [ ] 可以为角色配置权限
- [ ] 权限树正常展示
- [ ] 角色权限保存成功
- [ ] 角色统计用户数正确
- [ ] 系统管理员角色不可删除
- [ ] 有用户的角色不可删除

## 🐛 常见问题

### 1. 404 错误
- 检查后端服务是否启动
- 确认 `/api/admin/roles` 等接口路径正确
- 查看后端日志确认路由注册

### 2. 权限树不显示
- 检查 permission 表是否有初始化数据
- 验证 `getPermissionTree()` 方法返回值
- 查看浏览器控制台网络请求

### 3. 权限保存失败
- 确认 role_permission 表已创建
- 检查数据库外键约束
- 查看事务是否正确回滚

## 📝 后续优化建议

1. **权限缓存**: 使用 Redis 缓存用户权限，提高性能
2. **动态菜单**: 根据用户权限动态生成侧边栏菜单
3. **按钮级权限**: 在按钮级别控制显示/隐藏
4. **API 权限**: 在后端接口层面进行权限校验
5. **审计日志**: 记录角色和权限的变更历史

## 🔗 相关文件

- 前端服务：`src/services/adminService.ts`
- 前端页面：`src/views/System/RoleManagement.vue`
- 后端控制器：`src/main/java/org/lanhu/druemagenbackend/Controller/RoleController.java`
- 后端服务：`src/main/java/org/lanhu/druemagenbackend/service/impl/RoleServiceImpl.java`
- 数据库脚本：`src/main/resources/sql/role_management.sql`
