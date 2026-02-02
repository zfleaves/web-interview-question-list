# 16. Vite 如何配置库模式（Library Mode）？

**答案：**

### 库模式配置

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.js'),
      name: 'MyLibrary',
      fileName: (format) => `my-library.${format}.js`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
});
```

---