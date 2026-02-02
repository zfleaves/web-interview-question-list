# 34. Vite 如何使用 unplugin-auto-import 实现按需导入？

**答案：**

```javascript
// 安装
npm install unplugin-auto-import -D

// vite.config.js
import { defineConfig } from 'vite';
import AutoImport from 'unplugin-auto-import/vite';

export default defineConfig({
  plugins: [
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia'
      ],
      dts: 'src/auto-imports.d.ts'
    })
  ]
});
```

---