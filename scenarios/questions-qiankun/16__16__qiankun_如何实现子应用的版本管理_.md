# 16. qiankun 如何实现子应用的版本管理？

**答案：**

### 1. 通过 URL 版本控制

```javascript
registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:3001/v1.0.0',
    container: '#subapp-viewport',
    activeRule: '/app1'
  }
]);
```

### 2. 动态版本管理

```javascript
// 从配置中心获取版本
async function loadMicroAppConfig() {
  const response = await fetch('/api/micro-apps');
  const configs = await response.json();

  configs.forEach(config => {
    registerMicroApps([{
      name: config.name,
      entry: config.entry,
      container: '#subapp-viewport',
      activeRule: config.activeRule
    }]);
  });
}
```

### 3. 灰度发布

```javascript
// 根据用户特征加载不同版本
registerMicroApps([
  {
    name: 'app1',
    entry: isBetaUser
      ? '//localhost:3001/v2.0.0'
      : '//localhost:3001/v1.0.0',
    container: '#subapp-viewport',
    activeRule: '/app1'
  }
]);
```

---