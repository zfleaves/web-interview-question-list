# 23. qiankun 如何处理子应用的缓存？

**答案：**

### 1. 资源缓存

```javascript
// 使用浏览器缓存
start({
  fetch: window.fetch.bind(window)
});
```

### 2. 应用缓存

```javascript
// 缓存已加载的应用
const appCache = new Map();

async function loadAppWithCache(app) {
  if (appCache.has(app.name)) {
    return appCache.get(app.name);
  }

  const loadedApp = await loadMicroApp(app);
  appCache.set(app.name, loadedApp);
  return loadedApp;
}
```

### 3. Service Worker 缓存

```javascript
// 注册 Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// sw.js
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('localhost:3001')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});
```

---