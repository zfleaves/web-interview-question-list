# 12. qiankun 如何实现性能优化？

**答案：**

### 1. 资源预加载

```javascript
start({
  prefetch: true  // 启用预加载
});
```

### 2. 公共依赖提取

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};
```

### 3. 懒加载

```javascript
// 手动加载子应用
import { loadMicroApp } from 'qiankun';

const app = loadMicroApp({
  name: 'app1',
  entry: '//localhost:3001',
  container: '#container'
});

// 需要时卸载
app.unmount();
```

### 4. 单例模式

```javascript
start({
  singular: true  // 同一时间只加载一个子应用
});
```

### 5. 缓存优化

```javascript
start({
  fetch: window.fetch.bind(window),  // 使用浏览器缓存
  sandbox: {
    loose: true  // 宽松模式，减少性能开销
  }
});
```

### 6. 资源压缩

```javascript
// 启用 gzip 压缩
// nginx 配置
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

---