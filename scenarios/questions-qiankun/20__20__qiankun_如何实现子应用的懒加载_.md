# 20. qiankun 如何实现子应用的懒加载？

**答案：**

### 1. 基于路由的懒加载（默认）

```javascript
registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/app1'
  }
]);

start();
// 只有当路由匹配 /app1 时才会加载
```

### 2. 手动加载

```javascript
import { loadMicroApp } from 'qiankun';

// 按需加载
let app = null;

function loadApp() {
  app = loadMicroApp({
    name: 'app1',
    entry: '//localhost:3001',
    container: '#container'
  });
}

function unloadApp() {
  app?.unmount();
  app = null;
}
```

### 3. 条件加载

```javascript
// 根据用户权限加载
if (user.hasPermission('app1')) {
  registerMicroApps([{
    name: 'app1',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/app1'
  }]);
}
```

---