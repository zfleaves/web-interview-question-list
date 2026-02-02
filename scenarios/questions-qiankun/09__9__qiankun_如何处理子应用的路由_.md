# 9. qiankun 如何处理子应用的路由？

**答案：**

qiankun 支持两种路由模式：

### 1. history 模式（推荐）

```javascript
// 主应用
import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'react-app',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/react',  // 路由前缀
  }
]);

start();

// 子应用（React Router）
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter basename="/react">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 2. hash 模式

```javascript
// 主应用
registerMicroApps([
  {
    name: 'vue-app',
    entry: '//localhost:3002',
    container: '#subapp-viewport',
    activeRule: (location) => location.pathname.startsWith('/vue')
  }
]);

// 子应用（Vue Router）
import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About }
  ]
});
```

### 3. 自定义 activeRule

```javascript
// 函数形式，支持复杂路由判断
registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: (location) => {
      // 根据查询参数判断
      const params = new URLSearchParams(location.search);
      return params.get('app') === 'app1';
    }
  }
]);
```

---