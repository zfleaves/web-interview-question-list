## 12.  什么是 Cookie、Session、Token？它们的区别是什么？

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