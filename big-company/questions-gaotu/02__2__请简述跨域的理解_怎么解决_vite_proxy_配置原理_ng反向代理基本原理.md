# 2. 请简述跨域的理解 怎么解决 vite proxy 配置原理 ng反向代理基本原理

**答案：**

**跨域是指浏览器限制从一个域名的网页去请求另一个域名的资源。**

**为什么要有同源策略？**
- 防止恶意网站读取其他网站的敏感信息
- 保护用户隐私和安全
- 防止 CSRF 攻击

**解决方案：**

**1. Vite Proxy 配置原理**

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq) => {
            console.log('Proxy request:', proxyReq.url);
          });
        }
      }
    }
  }
}
```

**Vite Proxy 原理：**

```javascript
// Vite Proxy 原理流程
1. 接收开发服务器请求
2. 检查请求路径是否匹配代理规则
3. 转发请求到目标服务器
4. 返回目标服务器响应
5. 将响应返回给开发服务器
```

**2. Nginx 反向代理原理**

```nginx
server {
    listen 80;
    server_name localhost;
    
    location /api {
        proxy_pass http://localhost:3000;
        
        # CORS 头理
        add_header 'Access-Control-Allow-Origin' $http://localhost:5173 always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
        add_header 'Access-Control-Allow-Credentials' true;
    }
}
```

**Nginx 反向代理原理：**

```
1. 接收客户端请求
2. 检查缓存是否存在
3. 如果缓存不存在，转发到后端服务器
4. 将后端响应返回给客户端
```

**高途特色考点：**
- 高频考察跨域问题的理解和解决方案
- 结合实际项目说明跨域场景的处理
- 考察对浏览器安全机制的理解

---

## 算法题
