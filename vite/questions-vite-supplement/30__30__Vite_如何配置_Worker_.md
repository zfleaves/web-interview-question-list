# 30. Vite 如何配置 Worker？

**答案：**

```javascript
// vite.config.js
export default {
  worker: {
    format: 'es',  // Worker 格式
    plugins: [],   // Worker 插件
    rollupOptions: {
      output: {
        entryFileNames: 'assets/worker-[hash].js'
      }
    }
  }
};
```

---