# 36. Vite 如何使用 rollup-plugin-visualizer 进行构建分析？

**答案：**

```javascript
// 安装
npm install rollup-plugin-visualizer -D

// vite.config.js
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
});
```

---