## 3.  HTTP 常见的状态码有哪些？

**答案：**

### 1xx 信息性响应

- **100 Continue**：服务器已收到请求的初始部分，客户端应继续发送请求的其余部分
- **101 Switching Protocols**：服务器根据客户端的请求切换协议

### 2xx 成功响应

- **200 OK**：请求成功，返回请求的数据
- **201 Created**：请求成功，并创建了新资源
- **202 Accepted**：请求已接受，但处理尚未完成
- **204 No Content**：请求成功，但没有返回内容
- **206 Partial Content**：部分内容请求成功（用于断点续传）

### 3xx 重定向

- **301 Moved Permanently**：永久重定向，资源已永久移动到新位置
- **302 Found**：临时重定向，资源临时移动到新位置
- **304 Not Modified**：资源未修改，可以使用缓存的资源
- **307 Temporary Redirect**：临时重定向（保持请求方法和请求体不变）
- **308 Permanent Redirect**：永久重定向（保持请求方法和请求体不变）

**301 vs 302：**
- **301**：浏览器会缓存重定向，下次直接访问新 URL
- **302**：浏览器不会缓存，每次都访问旧 URL

### 4xx 客户端错误

- **400 Bad Request**：请求格式错误或参数错误
- **401 Unauthorized**：未授权，需要身份认证
- **403 Forbidden**：禁止访问，服务器理解请求但拒绝执行
- **404 Not Found**：资源不存在
- **405 Method Not Allowed**：请求方法不被允许
- **408 Request Timeout**：请求超时
- **409 Conflict**：请求与服务器当前状态冲突
- **413 Payload Too Large**：请求体过大
- **414 URI Too Long**：URL 过长
- **429 Too Many Requests**：请求过于频繁（限流）

### 5xx 服务器错误

- **500 Internal Server Error**：服务器内部错误
- **501 Not Implemented**：服务器不支持请求的功能
- **502 Bad Gateway**：网关或代理服务器从上游服务器收到无效响应
- **503 Service Unavailable**：服务不可用（通常用于维护或过载）
- **504 Gateway Timeout**：网关或代理服务器超时
- **505 HTTP Version Not Supported**：服务器不支持请求的 HTTP 版本

---