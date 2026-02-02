# 29. qiankun 如何实现子应用的灰度发布？

**答案：**

### 1. 基于用户特征的灰度

```javascript
// 根据用户 ID 分流
function shouldLoadNewVersion(userId) {
  // 取用户 ID 的哈希值
  const hash = hashCode(userId);
  // 10% 的用户使用新版本
  return hash % 10 === 0;
}

registerMicroApps([
  {
    name: 'app1',
    entry: shouldLoadNewVersion(userId)
      ? '//localhost:3001/v2.0.0'
      : '//localhost:3001/v1.0.0',
    container: '#subapp-viewport',
    activeRule: '/app1'
  }
]);
```

### 2. 基于路由的灰度

```javascript
// 特定路由使用新版本
registerMicroApps([
  {
    name: 'app1',
    entry: (location) => {
      if (location.pathname.startsWith('/app1/beta')) {
        return '//localhost:3001/v2.0.0';
      }
      return '//localhost:3001/v1.0.0';
    },
    container: '#subapp-viewport',
    activeRule: '/app1'
  }
]);
```

### 3. 动态配置

```javascript
// 从配置中心获取灰度配置
async function loadGrayConfig() {
  const response = await fetch('/api/gray-config');
  const config = await response.json();

  return config.apps;
}

// 使用配置加载应用
async function loadAppsWithGrayConfig() {
  const apps = await loadGrayConfig();
  registerMicroApps(apps);
}
```

---