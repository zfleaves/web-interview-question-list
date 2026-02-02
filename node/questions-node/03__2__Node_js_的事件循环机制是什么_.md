## 2. Node.js 的事件循环机制是什么？

**答案：**

Node.js 的事件循环是 Node.js 实现异步非阻塞 I/O 的核心机制。

### 事件循环的六个阶段

```javascript
┌───────────────────────────┐
┌─>│ timers                  │
│  setTimeout(), setInterval()│
└─────────────────────────────┘
┌───────────────────────────┐
│  pending callbacks        │
│  I/O callbacks            │
└─────────────────────────────┘
┌───────────────────────────┐
│  idle, prepare            │
│  internal use only        │
└─────────────────────────────┘
┌───────────────────────────┐
│  poll                    │
│  retrieve new I/O events  │
└─────────────────────────────┘
┌───────────────────────────┐
│  check                   │
│  setImmediate() callbacks │
└─────────────────────────────┘
┌───────────────────────────┐
│  close callbacks          │
│  socket.on('close')       │
└─────────────────────────────┘
```

### 宏任务和微任务

```javascript
console.log('1');

setTimeout(() => {
  console.log('2'); // 宏任务
}, 0);

Promise.resolve().then(() => {
  console.log('3'); // 微任务
});

console.log('4');

// 输出：1 4 3 2
```

### 实际示例

```javascript
console.log('start');

setTimeout(() => {
  console.log('timeout');
}, 0);

setImmediate(() => {
  console.log('immediate');
});

Promise.resolve().then(() => {
  console.log('promise');
});

process.nextTick(() => {
  console.log('nextTick');
});

console.log('end');

// 输出：
// start
// end
// nextTick
// promise
// timeout
// immediate
```

---