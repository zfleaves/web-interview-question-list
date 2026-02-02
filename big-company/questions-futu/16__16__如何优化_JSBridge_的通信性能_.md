# 16. 如何优化 JSBridge 的通信性能？

**答案：**

JSBridge 是 Native 与 H5 通信的核心，优化通信性能对混合应用至关重要。

**优化方案 1：使用消息队列和批量处理**

```javascript
class JSBridge {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.maxBatchSize = 10;
    this.batchTimeout = 100;
  }
  
  call(method, params = {}) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        method,
        params,
        resolve,
        reject,
        timestamp: Date.now()
      });
      
      this.processQueue();
    });
  }
  
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    // 批量处理
    const batch = this.queue.splice(0, this.maxBatchSize);
    
    try {
      const results = await this.executeBatch(batch);
      
      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      batch.forEach(item => item.reject(error));
    } finally {
      this.isProcessing = false;
      
      // 继续处理剩余队列
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), this.batchTimeout);
      }
    }
  }
  
  async executeBatch(batch) {
    // 实现 Native 调用
    const url = `jsbridge://batch?methods=${encodeURIComponent(JSON.stringify(batch.map(item => item.method)))}&params=${encodeURIComponent(JSON.stringify(batch.map(item => item.params)))}`;
    
    return new Promise((resolve, reject) => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      
      window.jsbridgeCallback = (result) => {
        document.body.removeChild(iframe);
        resolve(JSON.parse(result));
      };
      
      iframe.src = url;
      document.body.appendChild(iframe);
      
      setTimeout(() => {
        reject(new Error('JSBridge 调用超时'));
      }, 5000);
    });
  }
}

// 使用
const jsBridge = new JSBridge();

// 批量调用
const results = await Promise.all([
  jsBridge.call('getUserInfo'),
  jsBridge.call('getDeviceInfo'),
  jsBridge.call('getLocation')
]);
```

**优化方案 2：使用 WebView 注入 JavaScript**

```javascript
class OptimizedJSBridge {
  constructor() {
    this.nativeReady = false;
    this.pendingCalls = [];
    this.init();
  }
  
  init() {
    // 检查 Native 是否注入了 JavaScript
    if (window.JSBridge && window.JSBridge.call) {
      this.nativeReady = true;
      this.processPendingCalls();
    } else {
      // 等待 Native 注入
      document.addEventListener('JSBridgeReady', () => {
        this.nativeReady = true;
        this.processPendingCalls();
      });
    }
  }
  
  call(method, params = {}) {
    return new Promise((resolve, reject) => {
      const call = {
        method,
        params,
        resolve,
        reject,
        timestamp: Date.now()
      };
      
      if (this.nativeReady) {
        this.executeCall(call);
      } else {
        this.pendingCalls.push(call);
      }
    });
  }
  
  processPendingCalls() {
    while (this.pendingCalls.length > 0) {
      const call = this.pendingCalls.shift();
      this.executeCall(call);
    }
  }
  
  executeCall(call) {
    try {
      const result = window.JSBridge.call(call.method, call.params);
      call.resolve(result);
    } catch (error) {
      call.reject(error);
    }
  }
}

// 使用
const optimizedBridge = new OptimizedJSBridge();

const userInfo = await optimizedBridge.call('getUserInfo');
```

**优化方案 3：使用 WebView 协议优化**

```javascript
class ProtocolJSBridge {
  constructor() {
    this.messageId = 0;
    this.callbacks = new Map();
    this.init();
  }
  
  init() {
    // 监听 Native 消息
    window.addEventListener('message', this.handleMessage.bind(this));
  }
  
  handleMessage(event) {
    const { type, messageId, result, error } = event.data;
    
    if (type === 'jsbridge_response') {
      const callback = this.callbacks.get(messageId);
      
      if (callback) {
        if (error) {
          callback.reject(error);
        } else {
          callback.resolve(result);
        }
        
        this.callbacks.delete(messageId);
      }
    }
  }
  
  call(method, params = {}) {
    return new Promise((resolve, reject) => {
      const messageId = ++this.messageId;
      
      this.callbacks.set(messageId, { resolve, reject });
      
      // 发送消息到 Native
      window.postMessage({
        type: 'jsbridge_call',
        messageId,
        method,
        params
      }, '*');
      
      // 超时处理
      setTimeout(() => {
        const callback = this.callbacks.get(messageId);
        if (callback) {
          callback.reject(new Error('JSBridge 调用超时'));
          this.callbacks.delete(messageId);
        }
      }, 5000);
    });
  }
}

// 使用
const protocolBridge = new ProtocolJSBridge();

const userInfo = await protocolBridge.call('getUserInfo');
```

**性能优化建议：**

1. **减少通信次数**：批量处理多个调用
2. **使用缓存**：缓存频繁调用的结果
3. **异步处理**：避免阻塞主线程
4. **错误重试**：实现自动重试机制
5. **性能监控**：记录调用耗时和成功率

```javascript
class MonitoredJSBridge extends ProtocolJSBridge {
  constructor() {
    super();
    this.metrics = {
      totalCalls: 0,
      successCalls: 0,
      failureCalls: 0,
      avgResponseTime: 0,
      responseTimes: []
    };
  }
  
  async call(method, params = {}) {
    const startTime = Date.now();
    this.metrics.totalCalls++;
    
    try {
      const result = await super.call(method, params);
      this.metrics.successCalls++;
      
      const responseTime = Date.now() - startTime;
      this.metrics.responseTimes.push(responseTime);
      this.updateMetrics();
      
      return result;
    } catch (error) {
      this.metrics.failureCalls++;
      throw error;
    }
  }
  
  updateMetrics() {
    if (this.metrics.responseTimes.length > 0) {
      this.metrics.avgResponseTime = this.metrics.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.responseTimes.length;
    }
    
    // 清理旧数据
    if (this.metrics.responseTimes.length > 1000) {
      this.metrics.responseTimes = this.metrics.responseTimes.slice(-100);
    }
  }
  
  getMetrics() {
    return { ...this.metrics };
  }
}

// 使用
const monitoredBridge = new MonitoredJSBridge();

// 定期检查性能指标
setInterval(() => {
  const metrics = monitoredBridge.getMetrics();
  console.log('JSBridge 性能指标:', metrics);
  
  if (metrics.avgResponseTime > 1000) {
    console.warn('JSBridge 响应时间过长，需要优化');
  }
}, 60000);
```

**富途特色考点：**
- 富途高频考察混合开发性能优化
- 结合实际项目说明 JSBridge 优化方案
- 考察对 Native 与 H5 通信的深入理解
- 关注性能监控和优化

---

## 总结

富途面试题重点掌握：

### 前端基础
1. **JavaScript 核心**（占比 33.3%）：事件循环、异步机制、闭包
2. **前端工程化**（占比 26.7%）：JSBridge、埋点、错误收集
3. **浏览器与网络**（占比 20.0%）：跨域、缓存、性能优化
4. **Vue 框架**（占比 20.0%）：响应式原理、nextTick、数组 hack

### 算法题
1. **递归与缓存**：斐波那契数列、缓存优化
2. **栈应用**：括号匹配
3. **动态规划**：股票交易问题

### 场景题
1. **async/await**：红绿灯交替、异步编程
2. **性能优化**：图片懒加载、防抖节流
3. **金融业务**：股票 K 线图、实时数据推送
4. **混合开发**：JSBridge 优化、Native 与 H5 通信
5. **实际应用**：将算法应用到实际场景

**面试准备建议：**
1. 深入理解 JavaScript 核心原理（事件循环、闭包、原型链）
2. 掌握前端工程化实践（JSBridge、埋点、错误监控）
3. 熟悉 Vue 框架底层原理（响应式系统、nextTick）
4. 熟练掌握手写代码题（斐波那契、括号匹配、防抖节流）
5. 结合金融业务场景（股票交易、数据收集）说明解决方案
6. 注重代码质量和性能优化
7. 保持对新技术的关注和学习热情
8. 掌握 WebSocket 实时通信技术
9. 了解 Canvas 高性能渲染
10. 熟悉混合开发性能优化方案

**富途特色：**
- 高频考察混合开发（JSBridge、Native 与 H5 通信）
- 关注数据埋点和错误监控（金融业务数据收集）
- 考察前端性能优化（懒加载、防抖节流）
- 注重算法题（动态规划、递归优化）
- 关注 Vue 框架深度（响应式原理、nextTick）
- 考察实际项目经验和问题解决能力
- 关注金融业务场景（股票 K 线图、实时数据推送）
- 注重 WebSocket 和 Canvas 的使用
- 关注性能监控和优化
