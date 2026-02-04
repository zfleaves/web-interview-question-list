# 9. Vite 如何实现按需导入组件和 API？

**答案：**

```javascript
// 按需导入组件
npm install unplugin-vue-components -D

import { defineConfig } from 'vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

export default {
  plugins: [
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ]
};

// 按需导入 API
npm install unplugin-auto-import -D

import AutoImport from 'unplugin-auto-import/vite';

export default {
  plugins: [
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts'
    })
  ]
};

// 使用：无需手动导入 ref、computed 等
const count = ref(0);
```

---