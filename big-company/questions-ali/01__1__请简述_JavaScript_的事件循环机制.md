# 1. 请简述 JavaScript 的事件循环机制

**答案：**

**事件循环（Event Loop）是 JavaScript 实现异步非阻塞 I/O 的机制。**

**执行顺序：**

```
1. 执行同步代码
2. 执行微任务队列
3. 执行宏任务队列
4. 重复 2-3
```

**示例：**

```javascript
console.log('1'); // 同步

setTimeout(() => console.log('2'), 0); // 宏任务

Promise.resolve().then(() => console.log('3')); // 微任务

console.log('4'); // 同步

// 输出：1 4 3 2
```

**宏任务：**
- setTimeout
- setInterval
- I/O
- UI 渲染

**微任务：**
- Promise.then
- queueMicrotask
- MutationObserver

**阿里特色考点：**
- 阿里高频考察事件循环的执行顺序
- 结合实际业务场景分析异步代码执行流程
- 考察对微任务与宏任务的理解深度

---
