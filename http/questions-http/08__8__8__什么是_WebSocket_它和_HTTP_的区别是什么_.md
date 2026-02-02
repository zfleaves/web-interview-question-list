## 8.  什么是 WebSocket？它和 HTTP 的区别是什么？

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