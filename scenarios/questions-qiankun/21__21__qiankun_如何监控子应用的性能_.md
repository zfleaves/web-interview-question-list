# 21. qiankun 如何监控子应用的性能？

**答案：**

### 1. 生命周期耗时监控

```javascript
registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/app1',
    props: {
      onPerformance: (metrics) => {
        console.log('性能指标:', metrics);
        // 上报到监控系统
        reportPerformance(metrics);
      }
    }
  }
]);
```

### 2. 自定义 Loader

```javascript
registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/app1',
    loader: (loading) => {
      const startTime = performance.now();

      if (loading) {
        console.log('开始加载应用');
      } else {
        const duration = performance.now() - startTime;
        console.log(`应用加载完成，耗时 ${duration}ms`);
        reportMetric({
          type: 'app_load',
          duration,
          app: 'app1'
        });
      }
    }
  }
]);
```

### 3. Resource Timing API

```javascript
// 监控资源加载时间
const resources = performance.getEntriesByType('resource');
const appResources = resources.filter(r => r.name.includes('localhost:3001'));

appResources.forEach(resource => {
  console.log(`${resource.name}: ${resource.duration}ms`);
});
```

---