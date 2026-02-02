## 7.  HTTP/1.1、HTTP/2、HTTP/3 的区别是什么？

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