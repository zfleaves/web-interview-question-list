# 7. 如何启用 Gzip 压缩优化？

**答案：**

启用 Gzip 压缩可以大幅减少传输数据量。

```javascript
// Nginx 配置
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

// Express 配置
const compression = require('compression');
app.use(compression());
```

---