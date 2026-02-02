# 10. 什么是事件循环（Event Loop）？

**答案：**

**事件循环定义：**

事件循环是 JavaScript 实现异步非阻塞 I/O 的机制。

```javascript
// 1. 宏任务和微任务
console.log('1');

setTimeout(() => console.log('2'), 0); // 宏任务

Promise.resolve().then(() => console.log('3')); // 微任务

console.log('4');

// 输出顺序：1 4 3 2
```

**执行顺序：**

```
1. 执行同步代码
2. 执行微任务队列
3. 执行宏任务队列
4. 重复 2-3
```

**示例：**

```javascript
console.log('Start');

setTimeout(() => console.log('Timeout 1'), 0);

Promise.resolve().then(() => {
  console.log('Promise 1');
  Promise.resolve().then(() => console.log('Promise 2'));
});

setTimeout(() => console.log('Timeout 2'), 0);

console.log('End');

// 输出：
// Start
// End
// Promise 1
// Promise 2
// Timeout 1
// Timeout 2
```

**场景题：**

```javascript
// 场景 1：理解执行顺序
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('4');

// 输出：1 4 3 2

// 场景 2：嵌套的微任务
Promise.resolve().then(() => {
  console.log('1');
  Promise.resolve().then(() => console.log('2'));
  console.log('3');
});

Promise.resolve().then(() => {
  console.log('4');
});

// 输出：1 3 2 4

// 场景 3：宏任务中的微任务
setTimeout(() => {
  console.log('1');
  Promise.resolve().then(() => console.log('2'));
}, 0);

setTimeout(() => {
  console.log('3');
  Promise.resolve().then(() => console.log('4'));
}, 0);

// 输出：1 2 3 4
```

---

## 场景题