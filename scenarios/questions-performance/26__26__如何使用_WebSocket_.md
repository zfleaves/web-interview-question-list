# 26. 如何使用 WebSocket？

**答案：**

WebSocket 可以实现双向通信，减少轮询开销。

```javascript
// 建立 WebSocket 连接
const socket = new WebSocket('ws://localhost:8080');

socket.onopen = () => {
  console.log('Connected');
};

socket.onmessage = (event) => {
  console.log('Message:', event.data);
};

socket.send('Hello Server');
```

---