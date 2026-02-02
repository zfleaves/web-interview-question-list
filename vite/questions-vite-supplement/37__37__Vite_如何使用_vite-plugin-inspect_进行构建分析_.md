# 37. Vite 如何使用 vite-plugin-inspect 进行构建分析？

**答案：**

```javascript
// 安装
npm install vite-plugin-inspect -D

// vite.config.js
import { defineConfig } from 'vite';
import Inspect from 'vite-plugin-inspect';

export default defineConfig({
  plugins: [
    Inspect({
      build: true,
      server: true
    })
  ]
});
```

---