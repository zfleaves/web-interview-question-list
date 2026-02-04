# 5. Vite 如何配置库模式（Library Mode）？

**答案：**

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
        globals: { vue: 'Vue' }
      }
    }
  }
});

// src/main.js
export function useCounter() {
  const count = ref(0);
  const increment = () => count.value++;
  return { count, increment };
}

// package.json
{
  "main": "./dist/my-library.umd.js",
  "module": "./dist/my-library.es.js",
  "types": "./dist/main.d.ts"
}
```

---