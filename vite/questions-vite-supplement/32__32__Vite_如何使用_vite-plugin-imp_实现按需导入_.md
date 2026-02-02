# 32. Vite 如何使用 vite-plugin-imp 实现按需导入？

**答案：**

```javascript
// 安装
npm install vite-plugin-imp -D

// vite.config.js
import { defineConfig } from 'vite';
import imp from 'vite-plugin-imp';

export default defineConfig({
  plugins: [
    imp({
      libList: [
        {
          libName: 'antd',
          style: (name) => `antd/es/${name}/style/index.less`
        },
        {
          libName: 'element-plus',
          style: (name) => `element-plus/es/components/${name}/style/css`
        }
      ]
    })
  ]
});
```

---