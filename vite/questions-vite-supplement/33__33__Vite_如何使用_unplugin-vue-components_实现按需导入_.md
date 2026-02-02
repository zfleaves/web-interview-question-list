# 33. Vite 如何使用 unplugin-vue-components 实现按需导入？

**答案：**

```javascript
// 安装
npm install unplugin-vue-components -D

// vite.config.js
import { defineConfig } from 'vite';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver, ElementPlusResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
  plugins: [
    Components({
      resolvers: [
        AntDesignVueResolver(),
        ElementPlusResolver()
      ]
    })
  ]
});
```

---