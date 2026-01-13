# HTTP 面试题集锦

## 1. HTTP 和 HTTPS 的区别是什么？

**答案：**

HTTP（超文本传输协议）和 HTTPS（安全套接字层超文本传输协议）的主要区别：

### 1. 安全性
- **HTTP**：明文传输，数据在传输过程中容易被窃听、篡改和劫持
- **HTTPS**：通过 SSL/TLS 协议加密传输，保证数据传输的安全性

### 2. 端口
- **HTTP**：默认使用 80 端口
- **HTTPS**：默认使用 443 端口

### 3. 证书
- **HTTP**：不需要证书
- **HTTPS**：需要向 CA（证书授权中心）申请数字证书

### 4. 性能
- **HTTP**：由于没有加密解密过程，速度相对较快
- **HTTPS**：由于需要进行 SSL/TLS 握手和加密解密，速度相对较慢（但现代浏览器已经优化得很好）

### 5. 连接方式
- **HTTP**：TCP 三次握手后直接传输数据
- **HTTPS**：TCP 三次握手 + SSL/TLS 握手后传输数据

### 6. 搜索引擎权重
- **HTTP**：搜索引擎排名权重较低
- **HTTPS**：搜索引擎（如 Google、百度）会给予更高的排名权重

### HTTPS 握手过程

```
1. 客户端发送 ClientHello
   - 支持的 TLS 版本
   - 支持的加密套件
   - 随机数 random1

2. 服务器回复 ServerHello
   - 选择的 TLS 版本
   - 选择的加密套件
   - 随机数 random2
   - 服务器证书

3. 客户端验证证书
   - 验证证书是否由可信 CA 签发
   - 验证证书是否过期
   - 验证证书域名是否匹配

4. 客户端发送密钥交换消息
   - 使用服务器证书的公钥加密预主密钥
   - 发送给服务器

5. 服务器解密预主密钥
   - 使用私钥解密
   - 生成会话密钥

6. 双方发送 Finished 消息
   - 确认握手完成
   - 开始加密通信
```

### TLS 1.3 的改进

- **减少握手延迟**：从 2-RTT 减少到 1-RTT
- **移除不安全的加密算法**：只支持 AEAD 加密套件
- **0-RTT 模式**：在恢复会话时可以实现零往返时间
- **前向安全性**：即使私钥泄露，也无法解密之前的通信

---

## 2. 什么是 HTTP 的三次握手和四次挥手？

**答案：**

### 三次握手（建立连接）

三次握手是为了确认双方的接收与发送能力是否正常。

```
客户端                          服务器
   |                               |
   |-------- SYN (seq=x) --------->|  1. 客户端发送 SYN 报文
   |                               |     请求建立连接
   |                               |
   |<--- SYN+ACK (seq=y, ack=x+1) -|  2. 服务器回复 SYN+ACK
   |                               |     确认收到客户端请求
   |                               |     同时发送自己的 SYN
   |                               |
   |-------- ACK (ack=y+1) ------->|  3. 客户端发送 ACK
   |                               |     确认收到服务器的 SYN
   |                               |
   |        连接建立成功            |
```

**为什么需要三次握手？**

1. **防止已失效的连接请求报文段突然又传送到了服务器**
   - 如果只有两次握手，客户端发送的第一个连接请求在网络中滞留
   - 客户端超时重发第二个连接请求并建立连接
   - 然后第一个连接请求到达服务器，服务器误以为是新的连接请求
   - 这样就会造成资源浪费

2. **确认双方的接收和发送能力**
   - 第一次握手：服务器确认"对方发送正常"、"自己接收正常"
   - 第二次握手：客户端确认"对方发送正常"、"自己接收正常"、"对方接收正常"、"自己发送正常"
   - 第三次握手：服务器确认"对方接收正常"、"自己发送正常"

### 四次挥手（断开连接）

```
客户端                          服务器
   |                               |
   |-------- FIN (seq=u) --------->|  1. 客户端发送 FIN 报文
   |                               |     请求断开连接
   |                               |
   |<--- ACK (ack=u+1) ------------|  2. 服务器回复 ACK
   |                               |     确认收到 FIN
   |                               |     但可能还有数据要发送
   |                               |
   |<--- FIN (seq=w) ------------|  3. 服务器发送 FIN 报文
   |                               |     请求断开连接
   |                               |
   |-------- ACK (ack=w+1) ------->|  4. 客户端回复 ACK
   |                               |     确认收到 FIN
   |                               |
   |        连接断开成功            |
```

**为什么需要四次挥手？**

因为 TCP 是全双工协议，每个方向都必须单独关闭：

1. 客户端发送 FIN，表示客户端不再发送数据，但还能接收数据
2. 服务器收到 FIN 后回复 ACK，但可能还有数据要发送给客户端
3. 服务器发送完数据后，发送 FIN，表示服务器也不再发送数据
4. 客户端收到 FIN 后回复 ACK，等待 2MSL 后关闭连接

**为什么 TIME_WAIT 状态需要等待 2MSL？**

- **MSL（Maximum Segment Lifetime）**：报文最大生存时间，通常为 2 分钟
- **2MSL**：即 4 分钟

**原因：**

1. **确保最后一个 ACK 能够到达服务器**
   - 如果 ACK 丢失，服务器会重传 FIN
   - 客户端需要等待并重发 ACK

2. **确保所有旧报文消失**
   - 等待 2MSL 后，网络中所有旧的报文都会消失
   - 避免新连接收到旧连接的报文

---

## 3. HTTP 常见的状态码有哪些？

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

## 4. GET 和 POST 请求的区别是什么？

**答案：**

### 1. 语义上的区别

- **GET**：从服务器获取指定的资源（只读操作）
- **POST**：向服务器提交数据，对资源进行处理（新增或修改操作）

### 2. 数据传输位置

- **GET**：参数通过 URL 传递，放在 query string 中
- **POST**：参数放在请求体（body）中

```javascript
// GET 请求
GET /api/users?id=1&name=test HTTP/1.1

// POST 请求
POST /api/users HTTP/1.1
Content-Type: application/json

{
  "id": 1,
  "name": "test"
}
```

### 3. 数据大小限制

- **GET**：URL 长度有限制（浏览器限制，HTTP 协议本身没有限制）
  - IE：2083 字符
  - Chrome：8182 字符
  - Firefox：65536 字符
- **POST**：没有大小限制（受服务器配置限制）

### 4. 安全性

- **GET**：参数会显示在 URL 中，容易被记录在浏览器历史、服务器日志中
- **POST**：参数在请求体中，相对安全（但不是加密，仍可能被拦截）

### 5. 编码方式

- **GET**：只能传输 ASCII 字符，非 ASCII 字符需要 URL 编码
- **POST**：支持多种编码方式，可以传输二进制数据

### 6. 缓存

- **GET**：可以被缓存，浏览器、代理服务器都可以缓存
- **POST**：默认不会被缓存（可以通过 Cache-Control 控制）

### 7. 书签

- **GET**：可以保存为书签
- **POST**：不能保存为书签

### 8. 幂等性

- **GET**：幂等，多次执行结果相同
- **POST**：不幂等，多次执行可能创建多个资源

### 9. TCP 数据包

- **GET**：发送一个 TCP 数据包（请求头 + 数据）
- **POST**：发送两个 TCP 数据包（先发送请求头，等待 100 Continue 响应后发送数据）

**注意：** 这只是理论上的区别，实际实现可能不同。

### 10. 使用场景

**GET 适用于：**
- 获取数据
- 查询操作
- 可以缓存的请求

**POST 适用于：**
- 提交表单
- 上传文件
- 创建资源
- 发送敏感数据

### 常见误区

**误区 1：GET 比 POST 更安全**
- **错误**：GET 不安全，POST 安全
- **正确**：两者都不安全，都需要使用 HTTPS 加密

**误区 2：GET 只能获取数据，POST 只能提交数据**
- **错误**：GET 只能获取，POST 只能提交
- **正确**：GET 和 POST 都可以获取和提交，只是语义不同

**误区 3：POST 比 GET 更快**
- **错误**：POST 更快
- **正确**：GET 通常更快，因为可以被缓存且只发送一个 TCP 包

---

## 5. 什么是 HTTP 缓存？有哪些缓存策略？

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

## 6. 什么是跨域？如何解决跨域问题？

**答案：**

### 什么是跨域？

跨域是指浏览器出于安全考虑，限制从一个域名的网页去请求另一个域名的资源。

**同源策略：**

同源是指：协议、域名、端口都相同

```javascript
// 同源
http://www.example.com:80/api/users

// 不同源
http://api.example.com:80/api/users  // 域名不同
https://www.example.com:80/api/users  // 协议不同
http://www.example.com:8080/api/users // 端口不同
```

### 解决跨域的方法

#### 1. CORS（Cross-Origin Resource Sharing）- 推荐

**服务器端设置：**

```javascript
// Node.js Express
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});
```

**简单请求：**

- GET、HEAD、POST
- Content-Type：text/plain、multipart/form-data、application/x-www-form-urlencoded

**复杂请求：**

- 需要先发送 OPTIONS 预检请求
- 服务器返回允许的请求方法、请求头等

#### 2. JSONP（JSON with Padding）

**原理：** 利用 `<script>` 标签没有跨域限制的特性

```javascript
// 前端
function handleResponse(data) {
  console.log(data);
}

const script = document.createElement('script');
script.src = 'http://api.example.com/data?callback=handleResponse';
document.body.appendChild(script);

// 后端（返回）
handleResponse({ name: 'test', age: 18 });
```

**缺点：**
- 只支持 GET 请求
- 存在 XSS 安全风险
- 需要服务器配合

#### 3. 代理服务器

**开发环境：**

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://api.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
}

// webpack.config.js
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://api.example.com',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      }
    }
  }
}
```

**生产环境：**

```nginx
# nginx 配置
location /api/ {
  proxy_pass http://api.example.com/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
}
```

#### 4. WebSocket

WebSocket 不受同源策略限制：

```javascript
const ws = new WebSocket('ws://api.example.com');

ws.onopen = () => {
  ws.send('Hello Server');
};

ws.onmessage = (event) => {
  console.log(event.data);
};
```

#### 5. postMessage

```javascript
// 父窗口
const iframe = document.querySelector('iframe');
iframe.contentWindow.postMessage('Hello', 'http://child.example.com');

// 子窗口
window.addEventListener('message', (event) => {
  if (event.origin === 'http://parent.example.com') {
    console.log(event.data);
  }
});
```

#### 6. document.domain

只适用于子域名之间的跨域：

```javascript
// 父页面：http://parent.example.com
document.domain = 'example.com';

// 子页面：http://child.example.com
document.domain = 'example.com';
```

### CORS 跨域携带 Cookie

**前端：**

```javascript
fetch('http://api.example.com/data', {
  credentials: 'include'  // 携带 Cookie
});
```

**后端：**

```javascript
res.header('Access-Control-Allow-Origin', 'http://www.example.com');
res.header('Access-Control-Allow-Credentials', 'true');
```

**注意：** `Access-Control-Allow-Origin` 不能设置为 `*`，必须指定具体的域名。

---

## 7. HTTP/1.1、HTTP/2、HTTP/3 的区别是什么？

**答案：**

### HTTP/1.1

**特点：**

1. **持久连接**：默认使用 Keep-Alive，一个 TCP 连接可以发送多个请求
2. **管道化**：可以同时发送多个请求，但响应必须按顺序返回
3. **分块传输**：支持 Transfer-Encoding: chunked
4. **缓存控制**：引入 Cache-Control、ETag 等缓存机制

**缺点：**

- **队头阻塞**：前面的请求响应慢，后面的请求必须等待
- **文本协议**：解析效率低
- **头部冗余**：每次请求都重复发送相同的头部

### HTTP/2

**特点：**

1. **二进制协议**：使用二进制格式传输，解析效率更高
2. **多路复用**：一个 TCP 连接可以同时发送多个请求和响应
3. **头部压缩**：使用 HPACK 算法压缩头部
4. **服务端推送**：服务器可以主动推送资源给客户端
5. **请求优先级**：可以设置请求的优先级

**多路复用原理：**

```
HTTP/1.1：
请求1 --> TCP连接1 --> 响应1
请求2 --> TCP连接2 --> 响应2
请求3 --> TCP连接3 --> 响应3

HTTP/2：
请求1、请求2、请求3 --> TCP连接1 --> 响应1、响应2、响应3
```

**头部压缩：**

```javascript
// 静态表
method: GET
path: /
scheme: https
authority: www.example.com

// 动态表
每次请求只发送变化的头部，不变的头部使用索引
```

**服务端推送：**

```javascript
// 服务器响应
HTTP/2 200 OK
Content-Type: text/html

Push-Promise: /style.css
Push-Promise: /script.js
```

**缺点：**

- **TCP 层的队头阻塞**：一个包丢失，整个连接的请求都会阻塞
- **连接建立慢**：需要 TCP + TLS 握手

### HTTP/3

**特点：**

1. **基于 QUIC 协议**：基于 UDP 而不是 TCP
2. **解决了队头阻塞**：每个流独立传输，互不影响
3. **连接迁移**：网络切换（如从 WiFi 切换到 4G）不需要重新建立连接
4. **更快的握手**：0-RTT 和 1-RTT 握手

**QUIC vs TCP：**

```javascript
// TCP
丢失数据包 --> 阻塞整个连接

// QUIC
丢失数据包 --> 只阻塞对应的流
```

**握手对比：**

```
HTTP/1.1 + TLS：
TCP 握手 (1-RTT) + TLS 握手 (2-RTT) = 3-RTT

HTTP/2 + TLS：
TCP 握手 (1-RTT) + TLS 握手 (2-RTT) = 3-RTT

HTTP/3 + QUIC：
首次连接：1-RTT
恢复连接：0-RTT
```

### 对比总结

| 特性 | HTTP/1.1 | HTTP/2 | HTTP/3 |
|------|----------|--------|--------|
| 传输协议 | TCP | TCP | QUIC (UDP) |
| 协议格式 | 文本 | 二进制 | 二进制 |
| 多路复用 | 不支持 | 支持 | 支持 |
| 头部压缩 | 不支持 | 支持 | 支持 |
| 服务端推送 | 不支持 | 支持 | 支持 |
| 队头阻塞 | 有 | 有（TCP 层） | 无 |
| 连接迁移 | 不支持 | 不支持 | 支持 |
| 握手时间 | 3-RTT | 3-RTT | 0-1RTT |

### 实际应用

```nginx
# nginx 配置 HTTP/2
listen 443 ssl http2;
listen [::]:443 ssl http2;

# nginx 配置 HTTP/3
listen 443 quic reuseport;
listen [::]:443 quic reuseport;
add_header Alt-Svc 'h3=":443"; ma=86400';
```

---

## 8. 什么是 WebSocket？它和 HTTP 的区别是什么？

**答案：**

### WebSocket 简介

WebSocket 是一种在单个 TCP 连接上进行全双工通信的协议。

**特点：**

1. **全双工通信**：客户端和服务器可以同时发送和接收消息
2. **持久连接**：连接建立后，可以一直保持，不需要每次都重新建立
3. **实时性强**：服务器可以主动推送消息给客户端
4. **低开销**：头部数据小，传输效率高

### WebSocket vs HTTP

| 特性 | HTTP | WebSocket |
|------|------|-----------|
| 通信方式 | 半双工 | 全双工 |
| 连接方式 | 短连接（HTTP/1.1 支持长连接） | 长连接 |
| 服务器推送 | 不支持（需要轮询） | 支持 |
| 协议 | HTTP/1.1、HTTP/2、HTTP/3 | WebSocket |
| 端口 | 80、443 | 80、443（基于 HTTP） |
| 状态 | 无状态 | 有状态 |

### WebSocket 握手过程

```
1. 客户端发送握手请求

GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

2. 服务器回复握手响应

HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=

3. 连接建立成功，开始全双工通信
```

### WebSocket API

```javascript
// 创建 WebSocket 连接
const ws = new WebSocket('ws://localhost:8080');

// 连接打开
ws.onopen = () => {
  console.log('WebSocket connected');
  ws.send('Hello Server');
};

// 接收消息
ws.onmessage = (event) => {
  console.log('Received:', event.data);
};

// 连接关闭
ws.onclose = () => {
  console.log('WebSocket disconnected');
};

// 连接错误
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

// 主动关闭连接
ws.close();
```

### WebSocket 心跳机制

```javascript
class HeartbeatWebSocket {
  constructor(url, interval = 30000) {
    this.ws = new WebSocket(url);
    this.interval = interval;
    this.timer = null;
    this.init();
  }

  init() {
    this.ws.onopen = () => {
      console.log('Connected');
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      if (event.data === 'pong') {
        this.resetHeartbeat();
      }
    };

    this.ws.onclose = () => {
      console.log('Disconnected');
      this.stopHeartbeat();
    };

    this.ws.onerror = (error) => {
      console.error('Error:', error);
    };
  }

  startHeartbeat() {
    this.timer = setInterval(() => {
      this.ws.send('ping');
    }, this.interval);
  }

  resetHeartbeat() {
    this.stopHeartbeat();
    this.startHeartbeat();
  }

  stopHeartbeat() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

// 使用
const ws = new HeartbeatWebSocket('ws://localhost:8080');
```

### WebSocket 重连机制

```javascript
class ReconnectingWebSocket {
  constructor(url, maxRetries = 5, retryInterval = 3000) {
    this.url = url;
    this.maxRetries = maxRetries;
    this.retryInterval = retryInterval;
    this.retryCount = 0;
    this.ws = null;
    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('Connected');
      this.retryCount = 0;
    };

    this.ws.onmessage = (event) => {
      console.log('Received:', event.data);
    };

    this.ws.onclose = () => {
      console.log('Disconnected');
      this.reconnect();
    };

    this.ws.onerror = (error) => {
      console.error('Error:', error);
    };
  }

  reconnect() {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`Reconnecting... (${this.retryCount}/${this.maxRetries})`);
      setTimeout(() => {
        this.connect();
      }, this.retryInterval);
    } else {
      console.error('Max retries reached');
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// 使用
const ws = new ReconnectingWebSocket('ws://localhost:8080');
```

### WebSocket 应用场景

1. **实时聊天**：如微信、QQ Web 版
2. **实时通知**：如股票行情、在线客服
3. **实时协作**：如 Google Docs、Figma
4. **实时游戏**：如在线棋牌游戏
5. **实时监控**：如服务器监控、设备监控

### WebSocket 安全性

```javascript
// 使用 WSS（WebSocket Secure）
const ws = new WebSocket('wss://localhost:8080');

// 验证 Origin
const ws = new WebSocket('ws://localhost:8080', {
  headers: {
    'Origin': 'https://www.example.com'
  }
});

// 使用 Token 认证
const ws = new WebSocket(`ws://localhost:8080?token=${token}`);
```

---

## 9. 什么是 Content-Type？常见的 Content-Type 有哪些？

**答案：**

### Content-Type 简介

Content-Type 是 HTTP 响应头中的一个字段，用于告诉客户端（浏览器）服务器返回的数据是什么格式。

### 常见的 Content-Type

#### 1. 文本类型

```javascript
Content-Type: text/html; charset=utf-8
Content-Type: text/plain; charset=utf-8
Content-Type: text/css; charset=utf-8
Content-Type: text/javascript; charset=utf-8
```

#### 2. 应用类型

```javascript
// JSON
Content-Type: application/json

// XML
Content-Type: application/xml

// 表单数据（URL 编码）
Content-Type: application/x-www-form-urlencoded

// 表单数据（多部分）
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

// PDF
Content-Type: application/pdf

// 压缩文件
Content-Type: application/zip
Content-Type: application/gzip
```

#### 3. 图片类型

```javascript
Content-Type: image/jpeg
Content-Type: image/png
Content-Type: image/gif
Content-Type: image/svg+xml
Content-Type: image/webp
```

#### 4. 音频类型

```javascript
Content-Type: audio/mpeg
Content-Type: audio/wav
Content-Type: audio/ogg
```

#### 5. 视频类型

```javascript
Content-Type: video/mp4
Content-Type: video/webm
Content-Type: video/ogg
```

#### 6. 字体类型

```javascript
Content-Type: font/woff
Content-Type: font/woff2
Content-Type: font/ttf
Content-Type: font/eot
```

### POST 请求的 Content-Type

#### 1. application/x-www-form-urlencoded

```javascript
// 请求头
Content-Type: application/x-www-form-urlencoded

// 请求体
name=test&age=18

// 发送方式
fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    name: 'test',
    age: 18
  })
});
```

#### 2. application/json

```javascript
// 请求头
Content-Type: application/json

// 请求体
{
  "name": "test",
  "age": 18
}

// 发送方式
fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'test',
    age: 18
  })
});
```

#### 3. multipart/form-data

```javascript
// 请求头
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

// 请求体
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="name"

test
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="age"

18
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="test.jpg"
Content-Type: image/jpeg

[二进制数据]
------WebKitFormBoundary7MA4YWxkTrZu0gW--

// 发送方式
const formData = new FormData();
formData.append('name', 'test');
formData.append('age', 18);
formData.append('file', fileInput.files[0]);

fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

### Content-Type 与 Accept

```javascript
// 请求头：Accept - 客户端告诉服务器自己能接受什么格式
Accept: application/json, text/plain, */*

// 响应头：Content-Type - 服务器告诉客户端返回的是什么格式
Content-Type: application/json
```

### Content-Type 与字符编码

```javascript
// 显式指定字符编码
Content-Type: text/html; charset=utf-8

// 默认字符编码
// text/html: ISO-8859-1
// application/json: UTF-8
```

### Content-Type 与文件上传

```javascript
// 单文件上传
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/api/upload', {
  method: 'POST',
  body: formData
});

// 多文件上传
const formData = new FormData();
Array.from(fileInput.files).forEach(file => {
  formData.append('files', file);
});

fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

---

## 10. 什么是 DNS？DNS 解析过程是怎样的？

**答案：**

### DNS 简介

DNS（Domain Name System，域名系统）是将域名转换为 IP 地址的系统。

**作用：**

- 将人类可读的域名（如 www.google.com）转换为机器可读的 IP 地址（如 142.250.185.238）
- 反向解析：将 IP 地址转换为域名
- 邮件路由：MX 记录
- 负载均衡：多个 IP 对应同一个域名

### DNS 记录类型

| 记录类型 | 作用 | 示例 |
|----------|------|------|
| A | 将域名指向 IPv4 地址 | www.example.com → 192.0.2.1 |
| AAAA | 将域名指向 IPv6 地址 | www.example.com → 2001:db8::1 |
| CNAME | 将域名指向另一个域名 | www.example.com → example.com |
| MX | 邮件交换记录 | @ → mail.example.com |
| TXT | 文本记录（SPF、DKIM） | @ → "v=spf1 include:_spf.google.com ~all" |
| NS | 域名服务器记录 | @ → ns1.example.com |
| SRV | 服务记录 | _sip._tcp.example.com → 10 60 5060 sipserver.example.com |

### DNS 解析过程

```
1. 浏览器缓存
   |
   |-- 命中 --> 返回 IP
   |
   v
2. 操作系统缓存（hosts 文件）
   |
   |-- 命中 --> 返回 IP
   |
   v
3. 路由器缓存
   |
   |-- 命中 --> 返回 IP
   |
   v
4. ISP DNS 服务器（本地 DNS）
   |
   |-- 命中 --> 返回 IP
   |
   v
5. 根域名服务器（.）
   |
   |-- 返回顶级域名服务器地址
   |
   v
6. 顶级域名服务器（.com）
   |
   |-- 返回权威域名服务器地址
   |
   v
7. 权威域名服务器（example.com）
   |
   |-- 返回 IP
   |
   v
8. 缓存并返回 IP
```

### DNS 查询方式

#### 1. 递归查询

```
客户端 --> 本地 DNS --> 根 DNS --> 顶级 DNS --> 权威 DNS
        |                                           |
        |<-------------------------------------------|
        |
        |<-------------------------------------------|
```

客户端只发送一次请求，剩下的由本地 DNS 服务器完成。

#### 2. 迭代查询

```
客户端 --> 本地 DNS
        |<--- 返回根 DNS 地址
        |
        |--> 根 DNS
        |<--- 返回顶级 DNS 地址
        |
        |--> 顶级 DNS
        |<--- 返回权威 DNS 地址
        |
        |--> 权威 DNS
        |<--- 返回 IP
```

客户端需要多次发送请求。

### DNS 缓存

```javascript
// 浏览器缓存时间
// Chrome: chrome://net-internals/#dns
// Firefox: about:networking#dns

// 操作系统缓存
// Windows: ipconfig /displaydns
// Linux: sudo systemd-resolve --statistics
// macOS: sudo discoveryutil udnsflushcaches

// 清除 DNS 缓存
// Windows: ipconfig /flushdns
// Linux: sudo systemd-resolve --flush-caches
// macOS: sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
```

### DNS 优化

#### 1. DNS 预解析

```html
<!-- 预解析域名 -->
<link rel="dns-prefetch" href="//cdn.example.com">
<link rel="dns-prefetch" href="//api.example.com">
```

#### 2. DNS 预连接

```html
<!-- 预解析并建立 TCP 连接 -->
<link rel="preconnect" href="//cdn.example.com">
```

#### 3. 使用公共 DNS

```
Google DNS: 8.8.8.8, 8.8.4.4
Cloudflare DNS: 1.1.1.1, 1.0.0.1
阿里 DNS: 223.5.5.5, 223.6.6.6
腾讯 DNS: 119.29.29.29, 182.254.116.116
```

#### 4. 减少 DNS 查询

```javascript
// 合并域名
// 不推荐
<script src="https://cdn1.example.com/jquery.js"></script>
<script src="https://cdn2.example.com/lodash.js"></script>

// 推荐
<script src="https://cdn.example.com/jquery.js"></script>
<script src="https://cdn.example.com/lodash.js"></script>
```

### DNS 劫持

**什么是 DNS 劫持？**

DNS 劫持是指攻击者篡改 DNS 解析结果，将用户访问的域名解析到错误的 IP 地址。

**类型：**

1. **本地 DNS 劫持**：修改本地 hosts 文件或路由器 DNS 设置
2. **中间人攻击**：在 DNS 查询过程中拦截并篡改响应
3. **DNS 缓存投毒**：向 DNS 服务器投递虚假的 DNS 记录

**防范措施：**

1. **使用 HTTPS**：HTTPS 可以防止中间人攻击
2. **使用 DNSSEC**：DNS 安全扩展，验证 DNS 记录的真实性
3. **使用可信的 DNS 服务器**：如 Google DNS、Cloudflare DNS
4. **定期检查 DNS 设置**：确保没有被篡改

---

## 11. 什么是 CDN？CDN 的工作原理是什么？

**答案：**

### CDN 简介

CDN（Content Delivery Network，内容分发网络）是一种分布式网络架构，通过将内容缓存到离用户最近的边缘节点，提高访问速度和可用性。

### CDN 的工作原理

```
用户请求 --> 边缘节点（缓存）
              |
              |-- 命中 --> 直接返回
              |
              |-- 未命中 --> 源站
                              |
                              |-- 返回内容
                              |
                              v
                        边缘节点缓存
                              |
                              v
                        返回给用户
```

### CDN 的优势

1. **提高访问速度**：内容缓存到离用户最近的节点
2. **减轻源站压力**：大部分请求由边缘节点处理
3. **提高可用性**：分布式架构，单点故障不影响整体服务
4. **节省带宽成本**：边缘节点缓存减少源站带宽消耗
5. **提高安全性**：可以防御 DDoS 攻击

### CDN 的应用场景

1. **静态资源**：图片、CSS、JS、字体等
2. **视频流媒体**：点播、直播
3. **软件下载**：安装包、更新包
4. **API 接口**：加速 API 请求

### CDN 配置

```javascript
// 前端配置
// webpack.config.js
module.exports = {
  output: {
    publicPath: 'https://cdn.example.com/'
  }
};

// vite.config.js
export default {
  base: 'https://cdn.example.com/'
};
```

### CDN 缓存策略

```nginx
# nginx 配置
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
  add_header Access-Control-Allow-Origin "*";
}
```

### CDN 常见问题

#### 1. 缓存更新问题

**问题：** 文件更新后，CDN 缓存未更新，用户访问的还是旧版本

**解决方案：**

```javascript
// 文件名 hash
output: {
  filename: '[name].[contenthash:8].js'
}

// 查询参数
<script src="https://cdn.example.com/app.js?v=123456"></script>
```

#### 2. 跨域问题

**问题：** CDN 资源跨域访问失败

**解决方案：**

```nginx
# CDN 配置 CORS
add_header Access-Control-Allow-Origin "*";
add_header Access-Control-Allow-Methods "GET, OPTIONS";
add_header Access-Control-Allow-Headers "*";
```

#### 3. HTTPS 证书问题

**问题：** CDN 节点的 HTTPS 证书过期或不匹配

**解决方案：**

```javascript
// 使用 CDN 提供的 HTTPS
// 自定义域名需要配置 SSL 证书
```

### 常见 CDN 服务商

| 服务商 | 特点 | 适用场景 |
|--------|------|----------|
| Cloudflare | 免费，全球节点 | 个人项目、小型网站 |
| AWS CloudFront | 与 AWS 集成 | AWS 用户 |
| 阿里云 CDN | 国内节点多，价格低 | 国内项目 |
| 腾讯云 CDN | 国内节点多，价格低 | 国内项目 |
| 七牛云 | 存储 + CDN | 需要存储的项目 |

---

## 12. 什么是 Cookie、Session、Token？它们的区别是什么？

**答案：**

### Cookie

**简介：**

Cookie 是服务器发送到浏览器并保存在本地的一小段文本信息，浏览器每次请求都会携带 Cookie。

**特点：**

- 存储在浏览器中
- 每次请求都会自动携带
- 有大小限制（4KB）
- 可以设置过期时间
- 可以设置域名和路径限制

**设置 Cookie：**

```javascript
// 服务器端设置（Node.js Express）
res.cookie('name', 'value', {
  maxAge: 900000,  // 过期时间（毫秒）
  httpOnly: true,  // 只能通过 HTTP 访问，不能通过 JS 访问
  secure: true,    // 只能通过 HTTPS 传输
  sameSite: 'strict',  // 防止 CSRF 攻击
  domain: '.example.com',  // 域名限制
  path: '/'  // 路径限制
});
```

**读取 Cookie：**

```javascript
// 浏览器端
document.cookie  // "name=value; name2=value2"

// 解析 Cookie
function parseCookie(cookie) {
  return cookie.split(';').reduce((acc, item) => {
    const [key, value] = item.trim().split('=');
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}
```

### Session

**简介：**

Session 是服务器端存储的用户会话信息，通过 Cookie 中的 Session ID 来标识。

**特点：**

- 存储在服务器端
- 通过 Cookie 中的 Session ID 来标识
- 可以存储大量数据
- 服务器可以主动销毁

**Session 工作流程：**

```
1. 用户登录
   |
   v
2. 服务器创建 Session
   |
   v
3. 生成 Session ID
   |
   v
4. 将 Session ID 存储到 Cookie
   |
   v
5. 浏览器请求时携带 Session ID
   |
   v
6. 服务器根据 Session ID 查找 Session
   |
   v
7. 返回用户信息
```

**Session 存储：**

```javascript
// 内存存储（不推荐）
const sessions = {};

// Redis 存储（推荐）
const Redis = require('ioredis');
const redis = new Redis();

// 创建 Session
app.post('/login', (req, res) => {
  const sessionId = generateSessionId();
  redis.set(sessionId, JSON.stringify(user), 'EX', 3600);
  res.cookie('sessionId', sessionId);
});

// 获取 Session
app.get('/profile', (req, res) => {
  const sessionId = req.cookies.sessionId;
  const user = JSON.parse(await redis.get(sessionId));
  res.json(user);
});
```

### Token

**简介：**

Token 是一种无状态的认证方式，通常使用 JWT（JSON Web Token）。

**特点：**

- 无状态，服务器不需要存储
- 可以包含用户信息
- 可以设置过期时间
- 可以跨域使用

**JWT 结构：**

```
Header.Payload.Signature

Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "userId": "123",
  "username": "test",
  "exp": 1234567890
}

Signature: HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

**JWT 使用：**

```javascript
const jwt = require('jsonwebtoken');

// 生成 Token
const token = jwt.sign(
  { userId: '123', username: 'test' },
  'secret',
  { expiresIn: '1h' }
);

// 验证 Token
const decoded = jwt.verify(token, 'secret');

// 中间件
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, 'secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

### Cookie vs Session vs Token

| 特性 | Cookie | Session | Token |
|------|--------|---------|-------|
| 存储位置 | 浏览器 | 服务器 | 浏览器 |
| 大小限制 | 4KB | 无限制 | 无限制 |
| 安全性 | 较低 | 较高 | 较高 |
| 跨域支持 | 不支持 | 不支持 | 支持 |
| 服务器状态 | 无状态 | 有状态 | 无状态 |
| 扩展性 | 差 | 差 | 好 |

### 使用场景

**Cookie：**
- 存储用户偏好设置
- 存储购物车信息
- 存储 Session ID

**Session：**
- 用户登录状态
- 敏感信息存储

**Token：**
- API 认证
- 跨域认证
- 移动端认证

### 安全注意事项

1. **Cookie：**
   - 设置 `httpOnly` 防止 XSS 攻击
   - 设置 `secure` 只通过 HTTPS 传输
   - 设置 `sameSite` 防止 CSRF 攻击

2. **Session：**
   - 定期更新 Session ID
   - 设置合理的过期时间
   - 使用 Redis 等内存数据库存储

3. **Token：**
   - 使用 HTTPS 传输
   - 设置合理的过期时间
   - 定期刷新 Token
   - 不要在 Token 中存储敏感信息

---

## 13. 什么是 XSS 攻击？如何防范？

**答案：**

### XSS 简介

XSS（Cross-Site Scripting，跨站脚本攻击）是一种代码注入攻击，攻击者将恶意脚本注入到网页中，当用户访问网页时，恶意脚本被执行。

### XSS 类型

#### 1. 反射型 XSS（Reflected XSS）

**原理：** 攻击者构造恶意 URL，诱导用户点击，服务器将恶意脚本反射给用户。

```javascript
// 恶意 URL
http://example.com/search?q=<script>alert('XSS')</script>

// 服务器直接返回
<div>搜索结果：<script>alert('XSS')</script></div>
```

**防范：**

```javascript
// 输入过滤
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 使用 DOMPurify
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(unsafe);
```

#### 2. 存储型 XSS（Stored XSS）

**原理：** 攻击者将恶意脚本存储到服务器数据库，当其他用户访问时，恶意脚本被执行。

```javascript
// 攻击者提交恶意内容
const comment = '<script>alert('XSS')</script>';
fetch('/api/comments', {
  method: 'POST',
  body: JSON.stringify({ comment })
});

// 其他用户访问时，恶意脚本被执行
<div class="comment">
  <script>alert('XSS')</script>
</div>
```

**防范：**

```javascript
// 输入过滤
function sanitizeInput(input) {
  return input
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/g, '')
    .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/g, '')
    .replace(/<object\b[^>]*>([\s\S]*?)<\/object>/g, '');
}

// 使用 DOMPurify
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(unsafe);
```

#### 3. DOM 型 XSS（DOM-based XSS）

**原理：** 恶意脚本通过 DOM 操作执行，不经过服务器。

```javascript
// 恶意 URL
http://example.com/#<img src=x onerror=alert('XSS')>

// JavaScript 代码
const hash = window.location.hash;
document.getElementById('content').innerHTML = hash;  // XSS
```

**防范：**

```javascript
// 不使用 innerHTML
const hash = window.location.hash;
document.getElementById('content').textContent = hash;

// 使用 textContent 而不是 innerHTML
element.textContent = userContent;  // 安全
element.innerHTML = userContent;   // 不安全
```

### XSS 防范措施

#### 1. 输入过滤

```javascript
// 白名单过滤
function whitelistFilter(input) {
  const allowedTags = ['p', 'span', 'div'];
  const allowedAttrs = ['class', 'id'];
  // 过滤逻辑...
}

// 黑名单过滤（不推荐）
function blacklistFilter(input) {
  return input
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}
```

#### 2. 输出编码

```javascript
// HTML 编码
function htmlEncode(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// URL 编码
const url = encodeURIComponent(url);

// JavaScript 编码
const js = json.stringify(js);
```

#### 3. CSP（Content Security Policy）

```html
<!-- HTTP 头 -->
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; object-src 'none'

<!-- meta 标签 -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'">
```

#### 4. HttpOnly Cookie

```javascript
// 设置 HttpOnly Cookie
res.cookie('sessionId', sessionId, {
  httpOnly: true,  // 防止 JavaScript 访问
  secure: true,    // 只通过 HTTPS 传输
  sameSite: 'strict'  // 防止 CSRF
});
```

#### 5. 使用安全的 API

```javascript
// 不安全
element.innerHTML = userContent;
document.write(userContent);

// 安全
element.textContent = userContent;
element.innerText = userContent;
```

### XSS 检测工具

1. **浏览器开发者工具**：检查可疑脚本
2. **XSStrike**：自动化 XSS 扫描工具
3. **DOM XSS Scanner**：DOM 型 XSS 扫描工具

---

## 14. 什么是 CSRF 攻击？如何防范？

**答案：**

### CSRF 简介

CSRF（Cross-Site Request Forgery，跨站请求伪造）是一种攻击方式，攻击者诱导用户在已认证的网站上执行非预期的操作。

### CSRF 攻击原理

```
1. 用户登录了银行网站（bank.com），浏览器保存了 Cookie
2. 用户访问了恶意网站（evil.com）
3. 恶意网站向银行网站发送请求（携带 Cookie）
4. 银行网站认为这是用户发起的请求，执行操作
```

**示例：**

```html
<!-- 恶意网站 evil.com -->
<img src="http://bank.com/transfer?to=attacker&amount=10000">
```

### CSRF 防范措施

#### 1. CSRF Token

**原理：** 服务器生成随机 Token，客户端提交时携带 Token，服务器验证 Token。

```javascript
// 服务器端生成 Token
const crypto = require('crypto');
const csrfToken = crypto.randomBytes(32).toString('hex');
session.csrfToken = csrfToken;

// 前端携带 Token
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify({ to: 'attacker', amount: 10000 })
});

// 服务器端验证
app.post('/api/transfer', (req, res) => {
  const token = req.headers['x-csrf-token'];
  if (token !== req.session.csrfToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  // 处理请求
});
```

#### 2. SameSite Cookie

**原理：** 设置 Cookie 的 SameSite 属性，限制 Cookie 在跨站请求中发送。

```javascript
// Strict：完全禁止跨站请求发送 Cookie
res.cookie('sessionId', sessionId, {
  sameSite: 'strict'
});

// Lax：允许部分跨站请求发送 Cookie（如 GET 请求）
res.cookie('sessionId', sessionId, {
  sameSite: 'lax'
});

// None：允许跨站请求发送 Cookie（需要 secure）
res.cookie('sessionId', sessionId, {
  sameSite: 'none',
  secure: true
});
```

#### 3. 验证 Referer

**原理：** 检查请求的 Referer 是否来自可信的域名。

```javascript
app.post('/api/transfer', (req, res) => {
  const referer = req.headers.referer;
  if (!referer || !referer.startsWith('https://bank.com')) {
    return res.status(403).json({ error: 'Invalid referer' });
  }
  // 处理请求
});
```

#### 4. 自定义 Header

**原理：** 要求请求携带自定义 Header，浏览器会阻止跨站请求携带自定义 Header。

```javascript
// 前端
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  },
  body: JSON.stringify({ to: 'attacker', amount: 10000 })
});

// 服务器端
app.post('/api/transfer', (req, res) => {
  if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
    return res.status(403).json({ error: 'Invalid request' });
  }
  // 处理请求
});
```

#### 5. 双重 Cookie

**原理：** 将 CSRF Token 存储在 Cookie 中，请求时从 Cookie 中读取并验证。

```javascript
// 服务器端
res.cookie('csrfToken', csrfToken);

// 前端
const csrfToken = document.cookie
  .split('; ')
  .find(row => row.startsWith('csrfToken='))
  .split('=')[1];

fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify({ to: 'attacker', amount: 10000 })
});
```

### CSRF vs XSS

| 特性 | CSRF | XSS |
|------|------|-----|
| 攻击方式 | 伪造请求 | 注入脚本 |
| 需要用户登录 | 是 | 否 |
| 目标 | 服务器 | 用户 |
| 防范 | CSRF Token、SameSite Cookie | 输入过滤、输出编码、CSP |

### 最佳实践

1. **使用 CSRF Token**：最常用的防范措施
2. **设置 SameSite Cookie**：简单有效的防范措施
3. **验证 Referer**：辅助防范措施
4. **使用 POST 请求**：GET 请求更容易被 CSRF
5. **重要操作需要二次确认**：如转账、删除等操作

---

## 15. 什么是 HTTPS？HTTPS 的握手过程是怎样的？

**答案：**

### HTTPS 简介

HTTPS（Hypertext Transfer Protocol Secure）是 HTTP 的安全版本，通过 SSL/TLS 协议加密传输数据。

### HTTPS vs HTTP

| 特性 | HTTP | HTTPS |
|------|------|-------|
| 安全性 | 明文传输 | 加密传输 |
| 端口 | 80 | 443 |
| 证书 | 不需要 | 需要 |
| 性能 | 快 | 稍慢 |
| 搜索引擎权重 | 低 | 高 |

### SSL/TLS 版本

| 版本 | 发布时间 | 状态 |
|------|----------|------|
| SSL 1.0 | 1995 | 已废弃 |
| SSL 2.0 | 1995 | 已废弃 |
| SSL 3.0 | 1996 | 已废弃 |
| TLS 1.0 | 1999 | 已废弃 |
| TLS 1.1 | 2006 | 已废弃 |
| TLS 1.2 | 2008 | 推荐 |
| TLS 1.3 | 2018 | 推荐 |

### HTTPS 握手过程（TLS 1.2）

```
1. Client Hello
   - 支持的 TLS 版本
   - 支持的加密套件
   - 随机数 random1

2. Server Hello
   - 选择的 TLS 版本
   - 选择的加密套件
   - 随机数 random2
   - 服务器证书

3. Certificate
   - 服务器证书（包含公钥）

4. Server Key Exchange
   - 服务器密钥交换

5. Server Hello Done
   - 服务器完成

6. Client Key Exchange
   - 客户端生成预主密钥
   - 使用服务器证书的公钥加密预主密钥
   - 发送给服务器

7. Change Cipher Spec
   - 客户端通知服务器开始加密

8. Finished
   - 客户端发送完成消息

9. Change Cipher Spec
   - 服务器通知客户端开始加密

10. Finished
    - 服务器发送完成消息

11. 加密通信开始
```

### HTTPS 握手过程（TLS 1.3）

```
1. Client Hello
   - 支持的 TLS 版本
   - 支持的加密套件
   - 随机数 random1
   - 密钥共享参数

2. Server Hello
   - 选择的 TLS 版本
   - 选择的加密套件
   - 随机数 random2
   - 服务器证书
   - 密钥共享参数

3. (Finished)
   - 服务器发送完成消息

4. (Finished)
   - 客户端发送完成消息

5. 加密通信开始
```

**TLS 1.3 的改进：**

- 减少握手延迟：从 2-RTT 减少到 1-RTT
- 移除不安全的加密算法
- 支持 0-RTT 模式（恢复会话时）
- 前向安全性

### 对称加密 vs 非对称加密

| 特性 | 对称加密 | 非对称加密 |
|------|----------|------------|
| 密钥数量 | 1 个 | 2 个（公钥、私钥） |
| 加密速度 | 快 | 慢 |
| 安全性 | 较低 | 较高 |
| 使用场景 | 数据加密 | 密钥交换、数字签名 |

**混合加密：**

```
1. 使用非对称加密交换密钥
2. 使用对称加密传输数据
```

### HTTPS 证书

**证书类型：**

1. **DV（Domain Validation）**：只验证域名
2. **OV（Organization Validation）**：验证域名和组织
3. **EV（Extended Validation）**：严格验证，浏览器会显示组织名称

**免费证书：**

- Let's Encrypt
- Cloudflare SSL

**付费证书：**

- DigiCert
- GlobalSign
- Symantec

### HTTPS 配置

```nginx
# nginx 配置
server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;

  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;

  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;

  ssl_session_cache shared:SSL:10m;
  ssl_session_timeout 10m;
}
```

### HTTPS 性能优化

1. **启用 HTTP/2**：多路复用、头部压缩
2. **启用 TLS 1.3**：减少握手延迟
3. **启用 OCSP Stapling**：减少证书验证时间
4. **启用 Session Resumption**：减少握手次数
5. **使用 CDN**：加速证书验证

---

## 14. 什么是 HTTP 代理？代理服务器的作用是什么？

**答案：**

### HTTP 代理简介

HTTP 代理是一种中间服务器，客户端通过代理服务器访问目标服务器。

### 代理服务器的作用

1. **访问控制**：限制某些网站的访问
2. **缓存加速**：缓存常用资源，提高访问速度
3. **匿名访问**：隐藏真实 IP 地址
4. **负载均衡**：分发请求到多个服务器
5. **安全防护**：过滤恶意请求、防御攻击

### 代理类型

#### 1. 正向代理

**原理：** 客户端通过代理服务器访问目标服务器。

```
客户端 --> 代理服务器 --> 目标服务器
```

**用途：**

- 访问受限资源（如公司内网）
- 匿名访问
- 绕过地理限制

**配置：**

```javascript
// 浏览器配置
// HTTP 代理
Proxy: http://proxy.example.com:8080

// HTTPS 代理
HTTPS Proxy: http://proxy.example.com:8080
```

#### 2. 反向代理

**原理：** 客户端访问代理服务器，代理服务器转发请求到后端服务器。

```
客户端 --> 反向代理服务器 --> 后端服务器
```

**用途：**

- 负载均衡
- 缓存加速
- SSL 终止
- 安全防护

**配置：**

```nginx
# nginx 反向代理
server {
  listen 80;
  server_name example.com;

  location / {
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}

upstream backend {
  server backend1.example.com;
  server backend2.example.com;
  server backend3.example.com;
}
```

### 代理协议

#### 1. HTTP 代理

```javascript
// 普通请求
GET http://example.com/ HTTP/1.1
Host: example.com

// HTTPS 请求（CONNECT 方法）
CONNECT example.com:443 HTTP/1.1
Host: example.com
```

#### 2. SOCKS 代理

```javascript
// 支持多种协议（HTTP、FTP、SMTP 等）
// 配置
Proxy: socks5://proxy.example.com:1080
```

### 代理缓存

```nginx
# nginx 代理缓存
proxy_cache_path /path/to/cache levels=1:2 keys_zone=my_cache:10m max_size=1g;

server {
  location / {
    proxy_cache my_cache;
    proxy_cache_valid 200 1h;
    proxy_pass http://backend;
  }
}
```

### 代理认证

```nginx
# nginx 代理认证
server {
  location / {
    auth_basic "Restricted";
    auth_basic_user_file /etc/nginx/.htpasswd;
    proxy_pass http://backend;
  }
}
```

### 代理与 VPN 的区别

| 特性 | 代理 | VPN |
|------|------|-----|
| 工作层级 | 应用层 | 网络层 |
| 加密 | 可选 | 全部加密 |
| 配置复杂度 | 简单 | 复杂 |
| 性能 | 较好 | 较差 |
| 适用场景 | 特定应用 | 全局代理 |

---

## 15. 什么是 HTTP 长连接和短连接？

**答案：**

### 短连接

**原理：** 每次请求都建立一个新的 TCP 连接，请求完成后关闭连接。

```
请求1 --> 建立连接 --> 发送请求 --> 接收响应 --> 关闭连接
请求2 --> 建立连接 --> 发送请求 --> 接收响应 --> 关闭连接
请求3 --> 建立连接 --> 发送请求 --> 接收响应 --> 关闭连接
```

**优点：**
- 简单
- 服务器资源占用少

**缺点：**
- 每次请求都需要建立连接，延迟高
- TCP 握手开销大

**配置：**

```javascript
// HTTP/1.0 默认使用短连接
Connection: close
```

### 长连接

**原理：** 一个 TCP 连接可以发送多个请求，请求完成后不关闭连接。

```
建立连接 --> 请求1 --> 响应1 --> 请求2 --> 响应2 --> 请求3 --> 响应3 --> 关闭连接
```

**优点：**
- 减少 TCP 握手次数，延迟低
- 提高资源利用率

**缺点：**
- 服务器资源占用多
- 需要管理连接状态

**配置：**

```javascript
// HTTP/1.1 默认使用长连接
Connection: keep-alive

// 设置超时时间
Keep-Alive: timeout=60, max=100
```

### 长连接 vs 短连接

| 特性 | 短连接 | 长连接 |
|------|--------|--------|
| 连接次数 | 每次请求都建立连接 | 多个请求共享连接 |
| 延迟 | 高 | 低 |
| 服务器资源 | 少 | 多 |
| 适用场景 | 低并发、低频率请求 | 高并发、高频率请求 |

### 实际应用

```nginx
# nginx 配置长连接
keepalive_timeout 65;
keepalive_requests 100;
```

```javascript
// Node.js Express
app.use((req, res, next) => {
  res.setHeader('Connection', 'keep-alive');
  next();
});
```

---

## 16. 什么是 HTTP 管道化（Pipelining）？

**答案：**

### HTTP 管道化简介

HTTP 管道化是 HTTP/1.1 中的一种技术，允许客户端在收到响应之前发送多个请求。

### 管道化原理

```
非管道化：
请求1 --> 响应1 --> 请求2 --> 响应2 --> 请求3 --> 响应3

管道化：
请求1 --> 请求2 --> 请求3 --> 响应1 --> 响应2 --> 响应3
```

### 管道化的优点

1. **减少延迟**：不需要等待前一个请求的响应
2. **提高吞吐量**：充分利用网络带宽

### 管道化的缺点

1. **队头阻塞**：第一个请求响应慢，后面的请求必须等待
2. **服务器支持差**：很多服务器不支持管道化
3. **调试困难**：请求和响应的顺序不一致

### 管道化 vs HTTP/2 多路复用

| 特性 | 管道化 | HTTP/2 多路复用 |
|------|--------|----------------|
| 响应顺序 | 必须按顺序返回 | 可以乱序返回 |
| 队头阻塞 | 有 | 无 |
| 服务器支持 | 差 | 好 |

### 实际应用

```javascript
// 浏览器默认不启用管道化
// 可以通过以下方式启用
fetch('http://example.com/api1', {
  pipeline: true
});
fetch('http://example.com/api2', {
  pipeline: true
});
```

---

## 17. 什么是 HTTP 压缩？常见的压缩算法有哪些？

**答案：**

### HTTP 压缩简介

HTTP 压缩是指在传输数据前对数据进行压缩，减少传输数据量，提高传输速度。

### 压缩流程

```
1. 客户端发送请求，声明支持的压缩算法
   Accept-Encoding: gzip, deflate, br

2. 服务器选择压缩算法，压缩数据
   Content-Encoding: gzip

3. 客户端接收数据，解压缩
```

### 常见的压缩算法

#### 1. Gzip

**特点：**
- 兼容性好
- 压缩率中等
- CPU 开销中等

**配置：**

```nginx
# nginx 配置
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
gzip_min_length 1000;
```

#### 2. Deflate

**特点：**
- 兼容性好
- 压缩率较低
- CPU 开销较低

**配置：**

```nginx
# nginx 配置
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_disable "msie6";
```

#### 3. Brotli（br）

**特点：**
- 压缩率高
- CPU 开销高
- 兼容性较差

**配置：**

```nginx
# nginx 配置
brotli on;
brotli_types text/plain text/css application/json application/javascript;
brotli_static on;
```

### 压缩算法对比

| 算法 | 压缩率 | 速度 | 兼容性 |
|------|--------|------|--------|
| Gzip | 中等 | 中等 | 好 |
| Deflate | 较低 | 快 | 好 |
| Brotli | 高 | 慢 | 较差 |

### 实际应用

```javascript
// 前端配置
// webpack.config.js
module.exports = {
  plugins: [
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/
    })
  ]
};
```

---

## 18. 什么是 HTTP/2 Server Push？如何使用？

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

## 总结

HTTP 面试题涵盖了网络协议、安全性、性能优化等多个方面。掌握这些知识点对于前端工程师来说非常重要，可以帮助我们：

1. **优化性能**：通过缓存、CDN、压缩等技术提高页面加载速度
2. **提高安全性**：防范 XSS、CSRF 等攻击
3. **解决问题**：快速定位和解决网络相关问题
4. **架构设计**：选择合适的技术方案

建议深入学习 HTTP 协议，理解其原理和应用场景，这样才能在实际工作中灵活运用。