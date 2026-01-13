## 5.  什么是 HTTP 缓存？有哪些缓存策略？

**答案：**

HTTP 缓存是 Web 性能优化的重要手段，通过缓存可以减少网络请求，加快页面加载速度。

### 缓存分类

#### 1. 强缓存（Cache-Control、Expires）

浏览器不会向服务器发送请求，直接从缓存中读取资源。

**Cache-Control（推荐）：**

```javascript
// 响应头
Cache-Control: max-age=3600  // 缓存 1 小时
Cache-Control: no-cache      // 每次都要验证
Cache-Control: no-store      // 不缓存
Cache-Control: private       // 只允许浏览器缓存
Cache-Control: public        // 允许浏览器和代理服务器缓存
```

**Expires（已废弃）：**

```javascript
// 响应头
Expires: Wed, 21 Oct 2025 07:28:00 GMT
```

#### 2. 协商缓存（ETag、Last-Modified）

浏览器先向服务器发送请求，验证缓存是否有效，如果有效则返回 304，否则返回新资源。

**ETag（推荐）：**

```javascript
// 第一次请求
Response Headers:
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"

// 第二次请求
Request Headers:
If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"

// 如果资源未修改
Response Headers:
Status: 304 Not Modified
```

**Last-Modified：**

```javascript
// 第一次请求
Response Headers:
Last-Modified: Wed, 21 Oct 2025 07:28:00 GMT

// 第二次请求
Request Headers:
If-Modified-Since: Wed, 21 Oct 2025 07:28:00 GMT

// 如果资源未修改
Response Headers:
Status: 304 Not Modified
```

### 缓存策略

#### 1. HTML 文件

```javascript
// 不缓存，每次都从服务器获取
Cache-Control: no-cache
```

#### 2. CSS、JS 文件

```javascript
// 长期缓存，通过文件名 hash 更新
Cache-Control: max-age=31536000  // 1 年
```

#### 3. 图片、字体等静态资源

```javascript
// 长期缓存
Cache-Control: max-age=31536000
```

#### 4. API 响应

```javascript
// 短期缓存
Cache-Control: max-age=60  // 1 分钟
```

### ETag vs Last-Modified

| 特性 | ETag | Last-Modified |
|------|------|---------------|
| 精度 | 精确到文件内容 | 精确到秒 |
| 性能 | 需要计算文件 hash | 只需要读取修改时间 |
| 优先级 | 高 | 低 |

**ETag 优先级更高**：如果同时存在 ETag 和 Last-Modified，服务器会优先使用 ETag。

### 缓存流程

```
1. 浏览器请求资源
   |
   v
2. 检查强缓存
   |
   |-- 有效 --> 直接返回缓存
   |
   v
3. 检查协商缓存
   |
   |-- 有效 (304) --> 返回缓存
   |
   v
4. 返回新资源 (200)
```

### 实际应用

```javascript
// webpack 配置
output: {
  filename: '[name].[contenthash:8].js',
  chunkFilename: '[name].[contenthash:8].chunk.js'
}

// nginx 配置
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

location / {
  add_header Cache-Control "no-cache";
}
```

---