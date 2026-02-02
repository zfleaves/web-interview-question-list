# 6. qiankun 如何实现资源预加载？

**答案：**

qiankun 提供了多种资源预加载策略：

### 1. 默认预加载

```javascript
// 第一个子应用挂载完成后预加载其他应用
start({
  prefetch: true
});
```

### 2. 全量预加载

```javascript
// 立即预加载所有子应用
start({
  prefetch: 'all'
});
```

### 3. 选择性预加载

```javascript
// 预加载指定的应用
start({
  prefetch: ['app1', 'app2']
});
```

### 4. 自定义预加载策略

```javascript
// 根据应用重要性分级预加载
start({
  prefetch: (apps) => {
    const criticalApps = apps.filter(app =>
      app.name.includes('dashboard') || app.name.includes('home')
    );
    const normalApps = apps.filter(app =>
      !criticalApps.includes(app)
    );

    return {
      criticalAppNames: criticalApps.map(app => app.name),
      minorAppsName: normalApps.map(app => app.name)
    };
  }
});
```

### 5. 预加载实现原理

```javascript
// 预加载核心逻辑
function prefetchApp(app) {
  const { entry } = app;

  // 1. 获取 HTML 内容
  fetch(entry).then(res => res.text()).then(html => {
    // 2. 解析 HTML，提取 JS 和 CSS 资源
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const scripts = Array.from(doc.querySelectorAll('script[src]'));
    const styles = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));

    // 3. 预加载 JS 资源
    scripts.forEach(script => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = script.src;
      document.head.appendChild(link);
    });

    // 4. 预加载 CSS 资源
    styles.forEach(style => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = style.href;
      document.head.appendChild(link);
    });
  });
}
```

---