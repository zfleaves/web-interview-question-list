## 10.  什么是 DNS？DNS 解析过程是怎样的？

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