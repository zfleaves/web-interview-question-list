## 17.  什么是 HTTP/2 Server Push？如何使用？

**答案：**

### Server Push 简介

Server Push 是 HTTP/2 中的一项特性，允许服务器在客户端请求之前主动推送资源。

### Server Push 原理

```
1. 客户端请求 HTML
   GET /index.html

2. 服务器返回 HTML，并推送 CSS 和 JS
   Response: index.html
   Push: style.css
   Push: app.js

3. 客户端接收 HTML、CSS、JS
```

### Server Push 的优点

1. **减少延迟**：不需要等待客户端请求
2. **提高性能**：并行加载资源

### Server Push 的缺点

1. **服务器资源占用**：需要预测客户端需要的资源
2. **缓存问题**：可能推送客户端已缓存的资源
3. **调试困难**：难以确定哪些资源被推送

### Server Push 使用

```nginx
# nginx 配置
location / {
  http2_push /style.css;
  http2_push /app.js;
}
```

```javascript
// Node.js Express
app.get('/index.html', (req, res) => {
  // 推送 CSS
  res.push('/style.css', {
    status: 200,
    headers: {
      'content-type': 'text/css'
    }
  });
  res.push('/style.css').end('body { color: red; }');

  // 推送 JS
  res.push('/app.js', {
    status: 200,
    headers: {
      'content-type': 'application/javascript'
    }
  });
  res.push('/app.js').end('console.log("Hello");');

  // 返回 HTML
  res.send('<html>...</html>');
});
```

### Server Push vs 预加载

| 特性 | Server Push | 预加载 |
|------|-------------|--------|
| 发起方 | 服务器 | 客户端 |
| 缓存检查 | 服务器不知道客户端缓存 | 客户端知道缓存 |
| 实现难度 | 复杂 | 简单 |

```html
<!-- 预加载 -->
<link rel="preload" href="/style.css" as="style">
<link rel="preload" href="/app.js" as="script">
```

### 最佳实践

1. **只推送关键资源**：如 CSS、关键 JS
2. **避免重复推送**：检查客户端缓存
3. **使用预加载替代**：预加载更简单、更可控

---