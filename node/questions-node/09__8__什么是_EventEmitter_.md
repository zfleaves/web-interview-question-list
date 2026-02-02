## 8. 什么是 EventEmitter？

**答案：**

EventEmitter 是 Node.js 中实现事件驱动编程的核心类，它提供了发布-订阅模式的实现。

### 基本用法

```javascript
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

// 监听事件
myEmitter.on('event', () => {
  console.log('事件触发');
});

// 触发事件
myEmitter.emit('event');

// 带参数的事件
myEmitter.on('data', (data) => {
  console.log('收到数据:', data);
});

myEmitter.emit('data', { name: 'test' });

// 只触发一次
myEmitter.once('once-event', () => {
  console.log('只触发一次');
});

myEmitter.emit('once-event');
myEmitter.emit('once-event'); // 不会触发
```

### 移除监听器

```javascript
const handler = () => {
  console.log('事件触发');
};

myEmitter.on('event', handler);
myEmitter.removeListener('event', handler);
```

### 错误处理

```javascript
myEmitter.on('error', (err) => {
  console.error('发生错误:', err);
});

myEmitter.emit('error', new Error('Something went wrong'));
```

---