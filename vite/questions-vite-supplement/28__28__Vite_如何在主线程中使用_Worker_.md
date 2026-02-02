# 28. Vite 如何在主线程中使用 Worker？

**答案：**

### 主线程

```javascript
// main.js
const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: 'module'
});

worker.postMessage({ message: 'Hello Worker' });

worker.onmessage = (e) => {
  console.log('Received:', e.data);
};
```

---