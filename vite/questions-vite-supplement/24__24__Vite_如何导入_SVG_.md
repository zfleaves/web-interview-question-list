# 24. Vite 如何导入 SVG？

**答案：**

### 导入 SVG

```javascript
// 作为 URL 导入
import logoUrl from './logo.svg?url';
<img :src="logoUrl" alt="Logo" />

// 作为字符串导入
import logoString from './logo.svg?raw';
<div v-html="logoString"></div>

// 作为组件导入（需要插件）
import LogoComponent from './logo.svg?component';
<LogoComponent />
```

---