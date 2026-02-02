# 25. Vite 如何使用 vite-plugin-svgr 处理 SVG？

**答案：**

```javascript
// 安装
npm install vite-plugin-svgr -D

// vite.config.js
import svgr from 'vite-plugin-svgr';

export default {
  plugins: [svgr()]
};
```

---