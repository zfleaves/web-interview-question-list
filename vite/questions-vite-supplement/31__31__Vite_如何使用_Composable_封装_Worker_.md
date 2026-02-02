# 31. Vite 如何使用 Composable 封装 Worker？

**答案：**

```javascript
// useWorker.js
import { ref } from 'vue';

export function useWorker(workerPath) {
  const result = ref(null);
  const error = ref(null);

  const worker = new Worker(new URL(workerPath, import.meta.url), {
    type: 'module'
  });

  worker.onmessage = (e) => {
    result.value = e.data;
  };

  worker.onerror = (e) => {
    error.value = e.message;
  };

  const postMessage = (data) => {
    worker.postMessage(data);
  };

  const terminate = () => {
    worker.terminate();
  };

  return {
    result,
    error,
    postMessage,
    terminate
  };
}
```

---