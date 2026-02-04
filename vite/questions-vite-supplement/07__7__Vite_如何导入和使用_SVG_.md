# 7. Vite 如何导入和使用 SVG？

**答案：**

```javascript
// 作为 URL 导入
import logoUrl from './logo.svg?url';
<img :src="logoUrl" alt="Logo" />

// 作为字符串导入
import logoString from './logo.svg?raw';
<div v-html="logoString"></div>

// 使用 vite-plugin-svgr 作为组件导入
npm install vite-plugin-svgr -D

// vite.config.js
import svgr from 'vite-plugin-svgr';
export default { plugins: [svgr()] };

// 作为组件使用
import Logo from './logo.svg';
<Logo width={100} height={100} />
```

---