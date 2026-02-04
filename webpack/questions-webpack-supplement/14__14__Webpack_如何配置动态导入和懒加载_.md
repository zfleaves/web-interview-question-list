# 14. Webpack 如何配置动态导入和懒加载？

**答案：**

使用 import() 语法实现动态导入和懒加载。

```javascript
// 路由懒加载
const Home = lazy(() => import('./Home'));
const About = lazy(() => import('./About'));

// 组件懒加载
const LazyComponent = lazy(() => import('./LazyComponent'));

// 动态导入
const loadModule = async () => {
  const module = await import('./module.js');
  module.default();
};
```

---