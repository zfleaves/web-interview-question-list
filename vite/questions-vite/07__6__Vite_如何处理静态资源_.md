## 6. Vite 如何处理静态资源？

**答案：**

### 静态资源处理

Vite 支持多种静态资源类型，包括图片、字体、JSON 等。

### 图片资源

```javascript
// 导入图片
import logo from './logo.png';

// 使用
<img :src="logo" alt="Logo" />

// 动态导入
const logoUrl = new URL('./logo.png', import.meta.url).href;
```

### 字体资源

```javascript
// 导入字体
import './font.woff2';

// CSS 中使用
@font-face {
  font-family: 'MyFont';
  src: url('./font.woff2') format('woff2');
}
```

### JSON 资源

```javascript
// 导入 JSON
import data from './data.json';

// 使用
console.log(data);
```

### 其他资源

```javascript
// 导入文本
import text from './text.txt?raw';

// 导入 URL
import url from './file.pdf?url';

// 导入 Worker
import worker from './worker.js?worker';
```

### 资源内联

```javascript
// 小于 4KB 的资源自动内联为 base64
import smallImage from './small.png';

// 手动内联
import largeImage from './large.png?url';
import largeImageBase64 from './large.png?inline';
```

### 资源配置

```javascript
// vite.config.js
export default {
  assetsInclude: ['**/*.gltf', '**/*.glb'],

  build: {
    assetsInlineLimit: 4096,  // 小于 4KB 内联
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    }
  }
};
```

### public 目录

```
public/
  ├── favicon.ico
  ├── logo.png
  └── robots.txt
```

```javascript
// public 目录下的文件会被原样复制到输出目录
// 可以通过根路径引用
<img src="/favicon.ico" alt="Favicon" />
```

---