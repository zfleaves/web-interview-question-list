# 12. Vite 如何配置 SSR（服务端渲染）？

**答案：**

### SSR 配置

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  ssr: {
    noExternal: ['some-dep']  // 不外部化的依赖
  }
});
```

---