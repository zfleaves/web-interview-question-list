# 13. 实现一个 EventEmitter

**答案：**

```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return this;
  }
  
  off(event, callback) {
    if (!this.events[event]) {
      return this;
    }
    
    if (!callback) {
      delete this.events[event];
    } else {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
    
    return this;
  }
  
  emit(event, ...args) {
    if (!this.events[event]) {
      return this;
    }
    
    this.events[event].forEach(callback => {
      callback.apply(this, args);
    });
    
    return this;
  }
  
  once(event, callback) {
    const onceCallback = (...args) => {
      callback.apply(this, args);
      this.off(event, onceCallback);
    };
    
    this.on(event, onceCallback);
    return this;
  }
}

// 使用
const emitter = new EventEmitter();

emitter.on('data', (data) => {
  console.log('Received:', data);
});

emitter.emit('data', 'Hello'); // "Received: Hello"
emitter.off('data');
emitter.emit('data', 'World'); // 不会输出
```

---