# 24. qiankun 如何实现子应用的权限控制？

**答案：**

### 1. 路由级权限控制

```javascript
// 主应用
function hasPermission(appName) {
  const user = getUserInfo();
  return user.permissions.includes(appName);
}

registerMicroApps(
  apps.filter(app => hasPermission(app.name))
);
```

### 2. 组件级权限控制

```javascript
// 主应用传递权限信息
registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/app1',
    props: {
      permissions: ['read', 'write'],
      hasPermission: (permission) => {
        return props.permissions.includes(permission);
      }
    }
  }
]);
```

### 3. API 级权限控制

```javascript
// 子应用
export async function mount(props) {
  const { hasPermission } = props;

  // 根据权限控制功能
  if (hasPermission('write')) {
    showWriteButton();
  }
}
```

---