# 8. Vite 如何配置和使用 Web Worker？

**答案：**

```javascript
// 主线程
const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: 'module'
});
worker.postMessage({ message: 'Hello' });
worker.onmessage = (e) => console.log(e.data);

// worker.js
self.onmessage = (e) => {
  console.log('Received:', e.data);
  const result = heavyComputation();
  self.postMessage({ result });
};

// vite.config.js
export default {
  worker: {
    format: 'es',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/worker-[hash].js'
      }
    }
  }
};
```

---