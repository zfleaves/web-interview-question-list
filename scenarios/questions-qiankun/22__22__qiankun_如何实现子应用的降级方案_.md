# 22. qiankun 如何实现子应用的降级方案？

**答案：**

### 1. 加载失败降级

```javascript
registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/app1',
    errorHandler: (error) => {
      console.error('子应用加载失败:', error);

      // 降级方案 1：显示错误页面
      document.getElementById('subapp-viewport').innerHTML =
        '<div class="error-page">应用加载失败，请刷新重试</div>';

      // 降级方案 2：加载备用版本
      loadBackupApp();

      // 降级方案 3：跳转到独立页面
      window.location.href = '/app1-standalone.html';
    }
  }
]);
```

### 2. 版本降级

```javascript
async function loadAppWithFallback(appName) {
  const versions = ['v2.0.0', 'v1.0.0', 'v0.9.0'];

  for (const version of versions) {
    try {
      const entry = `//localhost:3001/${version}`;
      await loadMicroApp({ name: appName, entry, container: '#container' });
      return;
    } catch (error) {
      console.warn(`版本 ${version} 加载失败，尝试下一个版本`);
    }
  }

  // 所有版本都失败
  showErrorPage();
}
```

### 3. 功能降级

```javascript
// 检测浏览器支持
if (!window.Proxy) {
  // 降级到 iframe 方案
  loadAppInIframe();
} else {
  // 使用 qiankun
  loadAppWithQiankun();
}
```

---