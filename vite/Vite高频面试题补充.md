# Vite 高频面试题补充

## 1. Vite 如何配置和使用环境变量？

**答案：**

Vite 使用 `.env` 文件管理环境变量，只有以 `VITE_` 开头的变量才会暴露给客户端。

```bash
# .env - 所有环境
VITE_APP_TITLE=My App

# .env.development - 开发环境
VITE_API_BASE_URL=http://localhost:8080

# .env.production - 生产环境
VITE_API_BASE_URL=https://api.example.com
```

```javascript
// vite.config.js
export default defineConfig({
  envPrefix: 'VITE_',  // 环境变量前缀
  envDir: './env'      // 环境变量目录
});

// 在代码中使用
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

---

## 2. Vite 依赖预构建是如何工作的？

**答案：**

Vite 在开发服务器启动时，会自动预构建项目中的依赖，将 CommonJS/UMD 转换为 ESM。

**工作原理：**
1. 扫描项目中的 import 语句，识别第三方依赖
2. 使用 esbuild 将依赖转换为 ESM
3. 将多个依赖打包到一个 chunk 中
4. 生成缓存的依赖文件到 `node_modules/.vite`
5. 浏览器请求依赖时，返回预构建的文件

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    include: ['vue', 'vue-router'],  // 强制预构建
    exclude: ['your-dep'],            // 不预构建
    esbuildOptions: {
      target: 'es2020'
    }
  }
};

// 清除缓存
rm -rf node_modules/.vite
vite dev --force
```

---

## 3. Vite 如何配置多页面应用（MPA）？

**答案：**

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html')
      }
    }
  }
});
```

```html
<!-- index.html -->
<script type="module" src="/src/main.js"></script>

<!-- about.html -->
<script type="module" src="/src/about.js"></script>
```

---

## 4. Vite 如何配置 SSR（服务端渲染）？

**答案：**

```javascript
// vite.config.js
export default defineConfig({
  plugins: [vue()],
  ssr: {
    noExternal: ['some-dep']  // 不外部化的依赖
  }
});

// src/entry-server.js
import { createSSRApp } from 'vue';
import App from './App.vue';

export function render(url) {
  const app = createSSRApp(App);
  return app;  // 返回渲染后的内容
}

// src/entry-client.js
import { createApp } from 'vue';
import App from './App.vue';
createApp(App).mount('#app');

// server.js
import express from 'express';
import { createServer as createViteServer } from 'vite';

const app = express();
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'custom'
});

app.use(vite.middlewares);
app.use('*', async (req, res) => {
  const { render } = await vite.ssrLoadModule('/src/entry-server.js');
  const appHtml = await render(req.url);
  res.send(`<div id="app">${appHtml}</div><script src="/src/entry-client.js"></script>`);
});
```

---

## 5. Vite 如何配置库模式（Library Mode）？

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

## 6. Vite 如何配置和使用 CSS Modules？

**答案：**

```javascript
// vite.config.js
export default {
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]__[hash:base64:5]'
    }
  }
};
```

```vue
<template>
  <div :class="$style.container">
    <p :class="$style.title">Hello</p>
  </div>
</template>

<style module>
.container { padding: 20px; }
.title { font-size: 24px; }
</style>
```

```typescript
// TypeScript 支持
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
```

---

## 7. Vite 如何导入和使用 SVG？

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

## 8. Vite 如何配置和使用 Web Worker？

**答案：**

```javascript
// 主线程
const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: 'module'
});
worker.postMessage({ message: 'Hello' });
worker.onmessage = (e) => console.log(e.data);

// worker.js
self.onmessage = (e) => {
  console.log('Received:', e.data);
  const result = heavyComputation();
  self.postMessage({ result });
};

// vite.config.js
export default {
  worker: {
    format: 'es',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/worker-[hash].js'
      }
    }
  }
};
```

---

## 9. Vite 如何实现按需导入组件和 API？

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

## 10. Vite 如何进行构建分析？

**答案：**

```javascript
// 使用 rollup-plugin-visualizer
npm install rollup-plugin-visualizer -D

import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html'
    })
  ]
};

// 使用 vite-plugin-inspect
npm install vite-plugin-inspect -D

import Inspect from 'vite-plugin-inspect';

export default {
  plugins: [
    Inspect({
      build: true,
      server: true
    })
  ]
};
```

---

## 11. Vite 如何配置代码分割？

**答案：**

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'utils': ['lodash', 'axios']
        }
      }
    }
  }
};

// 动态导入
const LazyComponent = defineAsyncComponent(() => import('./LazyComponent.vue'));
```

---

## 12. Vite 如何配置代理解决跨域？

**答案：**

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/files': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
};
```

---

## 13. Vite 如何配置别名？

**答案：**

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils')
    }
  }
});

// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"]
    }
  }
}
```

---

## 14. Vite 如何配置打包优化？

**答案：**

```javascript
// vite.config.js
export default {
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1500
  }
};
```

---

## 15. Vite 和 Webpack 有什么区别？

**答案：**

| 特性 | Vite | Webpack |
|------|------|---------|
| **开发服务器启动** | 极快（基于 esbuild） | 较慢（需要打包） |
| **热更新** | 极快（ESM） | 较慢（重新打包） |
| **构建工具** | Rollup | 自研 |
| **配置复杂度** | 简单，开箱即用 | 复杂，需要大量配置 |
| **插件生态** | 基于Rollup插件 | 成熟丰富 |
| **生产构建** | Rollup（较慢） | Webpack（较快） |
| **预构建** | 自动预构建依赖 | 无需 |
| **模块系统** | 原生 ESM | 模拟 ESM |

**Vite 优势：**
- 开发体验极佳，启动和热更新极快
- 配置简单，开箱即用
- 原生 ESM 支持

**Webpack 优势：**
- 生态成熟，插件丰富
- 生产构建优化更强大
- 更适合复杂项目