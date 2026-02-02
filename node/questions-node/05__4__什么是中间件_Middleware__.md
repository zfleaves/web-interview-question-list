## 4. 什么是中间件（Middleware）？

**答案：**

中间件是在 Web 应用程序中处理 HTTP 请求的一种机制，它可以在请求到达路由处理之前或者在响应发送给客户端之前执行一些处理。

### Express 中间件

```javascript
const express = require('express');
const app = express();

// 应用级中间件
app.use((req, res, next) => {
  console.log('Time:', Date.now());
  next();
});

// 路由级中间件
app.get('/', (req, res, next) => {
  console.log('Request Type:', req.method);
  next();
}, (req, res) => {
  res.send('Hello World');
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
```

### 中间件的执行顺序

```javascript
app.use(middleware1);
app.use(middleware2);
app.use(middleware3);

app.get('/', handler);

// 执行顺序：
// middleware1 -> middleware2 -> middleware3 -> handler
```

### 自定义中间件

```javascript
function logger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  next();
}

function auth(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send('Unauthorized');
  }
  next();
}

app.use(logger);
app.use('/protected', auth);
```

---