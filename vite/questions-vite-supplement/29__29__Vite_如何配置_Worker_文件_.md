# 29. Vite 如何配置 Worker 文件？

**答案：**

```javascript
// worker.js
self.onmessage = (e) => {
  console.log('Received from main:', e.data);

  // 执行耗时任务
  const result = heavyComputation();

  self.postMessage({ result });
};

function heavyComputation() {
  // 耗时计算
  return 42;
}
```

---