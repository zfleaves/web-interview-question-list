## 7. Vite 的代理配置是如何工作的？

**答案：**

### 代理配置

Vite 使用 `http-proxy` 中间件实现代理功能。

### 基础配置

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
};
```

### 详细配置

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      // 字符串形式
      '/api': 'http://localhost:8080',

      // 对象形式
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response:', proxyRes.statusCode, req.url);
          });
        }
      },

      // 正则表达式
      '^/fallback/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, '')
      }
    }
  }
};
```

### 代理选项

```javascript
{
  target: 'http://localhost:8080',  // 目标服务器
  changeOrigin: true,  // 修改请求头中的 origin
  rewrite: (path) => path.replace(/^\/api/, ''),  // 重写路径
  configure: (proxy, options) => {},  // 自定义配置
  ws: true,  // 支持 WebSocket
  secure: false,  // 不验证 SSL 证书
  bypass: (req, res, proxyOptions) => {
    // 绕过代理
    if (req.headers.accept.indexOf('html') !== -1) {
      return '/index.html';
    }
  }
}
```

### 使用示例

```javascript
// 前端请求
fetch('/api/users').then(res => res.json());

// 实际请求：http://localhost:8080/users
```

---