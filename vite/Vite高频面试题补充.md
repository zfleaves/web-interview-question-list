# Vite 高频面试题补充

## 1. Vite 如何配置环境变量文件？

**答案：**

Vite 使用 `.env` 文件来管理环境变量，支持不同环境的配置。

```bash
# .env - 所有环境
VITE_APP_TITLE=My App

# .env.development - 开发环境
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_MODE=development

# .env.production - 生产环境
VITE_API_BASE_URL=https://api.example.com
VITE_APP_MODE=production

# .env.staging - 预发布环境
VITE_API_BASE_URL=https://staging-api.example.com
VITE_APP_MODE=staging
```

---

## 2. Vite 如何在代码中使用环境变量？

**答案：**

```javascript
// 在代码中使用
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const appMode = import.meta.env.VITE_APP_MODE;

// 在 HTML 中使用
<script>
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
</script>
```

---

## 3. Vite 如何配置环境变量？

**答案：**

```javascript
// vite.config.js
export default defineConfig({
  envPrefix: 'VITE_',  // 环境变量前缀，默认为 VITE_
  envDir: './env',     // 环境变量目录，默认为项目根目录
});
```

---

## 4. Vite 环境变量有哪些注意事项？

**答案：**

1. **只有以 `VITE_` 开头的变量才会暴露给客户端**
2. **服务器端变量不会暴露给客户端**
3. **环境变量在构建时会被替换为字符串**

---

## 5. Vite 依赖预构建是如何工作的？

**答案：**

### 依赖预构建简介

Vite 在开发服务器启动时，会自动预构建项目中的依赖，将 CommonJS/UMD 转换为 ESM，并提高依赖的加载速度。

### 工作原理

```
1. 扫描依赖
   ├── 扫描项目中的 import 语句
   └── 识别出所有第三方依赖

2. 预构建依赖
   ├── 使用 esbuild 将依赖转换为 ESM
   ├── 将多个依赖打包到一个 chunk 中
   └── 生成缓存的依赖文件

3. 使用预构建的依赖
   ├── 浏览器请求依赖时，返回预构建的文件
   └── 避免重复转换和打包
```

---

## 6. Vite 如何配置依赖预构建？

**答案：**

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    // 强制预构建的依赖
    include: ['vue', 'vue-router', 'pinia'],

    // 不预构建的依赖
    exclude: ['your-dep'],

    // esbuild 选项
    esbuildOptions: {
      target: 'es2020',
      define: {
        'process.env.NODE_ENV': JSON.stringify('development')
      }
    },

    // 自动发现依赖
    auto: true,

    // 依赖扫描的入口
    entries: ['index.html', 'src/main.js']
  }
};
```

---

## 7. Vite 依赖预构建的缓存机制是什么？

**答案：**

```javascript
// Vite 会将预构建的依赖缓存到 node_modules/.vite 目录
// 当依赖变化时，会自动重新预构建

// 手动清除缓存
rm -rf node_modules/.vite

// 或者使用 --force 参数
vite dev --force
```

---

## 8. Vite 如何配置多页面应用（MPA）？

**答案：**

### 多页面应用配置

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

---

## 9. Vite 多页面应用的项目结构是什么？

**答案：**

```
project/
├── index.html
├── about.html
├── contact.html
├── src/
│   ├── main.js
│   ├── about.js
│   └── contact.js
└── vite.config.js
```

---

## 10. Vite 多页面应用如何配置 HTML 文件？

**答案：**

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Home</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>

<!-- about.html -->
<!DOCTYPE html>
<html>
<head>
  <title>About</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/about.js"></script>
</body>
</html>
```

---

## 11. Vite 如何使用插件实现多页面应用？

**答案：**

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
  plugins: [
    createHtmlPlugin({
      minify: true,
      pages: [
        {
          entry: 'src/main.js',
          template: 'index.html',
          filename: 'index.html'
        },
        {
          entry: 'src/about.js',
          template: 'about.html',
          filename: 'about.html'
        }
      ]
    })
  ]
});
```

---

## 12. Vite 如何配置 SSR（服务端渲染）？

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

## 13. Vite SSR 如何配置服务端入口？

**答案：**

```javascript
// src/entry-server.js
import { createSSRApp } from 'vue';
import App from './App.vue';

export function render(url) {
  const app = createSSRApp(App);

  return new Promise((resolve, reject) => {
    resolve(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>SSR App</title>
        </head>
        <body>
          <div id="app">${app}</div>
        </body>
      </html>
    `);
  });
}
```

---

## 14. Vite SSR 如何配置客户端入口？

**答案：**

```javascript
// src/entry-client.js
import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);
app.mount('#app');
```

---

## 15. Vite SSR 如何配置 Express 服务器？

**答案：**

```javascript
// server.js
const fs = require('fs');
const path = require('path');
const express = require('express');
const { createServer: createViteServer } = require('vite');

async function createServer() {
  const app = express();

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });

  app.use(vite.middlewares);

  app.use('*', async (req, res) => {
    try {
      const template = fs.readFileSync(
        path.resolve(__dirname, 'index.html'),
        'utf-8'
      );

      const { render } = await vite.ssrLoadModule('/src/entry-server.js');
      const appHtml = await render(req.url);

      const html = template.replace(`<!--app-html-->`, appHtml);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      console.error(e);
      res.status(500).end(e.message);
    }
  });

  app.listen(3000);
}

createServer();
```

---

## 16. Vite 如何配置库模式（Library Mode）？

**答案：**

### 库模式配置

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
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
});
```

---

## 17. Vite 库模式如何配置入口文件？

**答案：**

```javascript
// src/main.js
import { ref } from 'vue';

export function useCounter() {
  const count = ref(0);

  const increment = () => {
    count.value++;
  };

  return {
    count,
    increment
  };
}

export default {
  useCounter
};
```

---

## 18. Vite 库模式如何配置 package.json？

**答案：**

```json
{
  "name": "my-library",
  "version": "1.0.0",
  "main": "./dist/my-library.umd.js",
  "module": "./dist/my-library.es.js",
  "types": "./dist/main.d.ts",
  "exports": {
    ".": {
      "import": "./dist/my-library.es.js",
      "require": "./dist/my-library.umd.js"
    }
  },
  "files": [
    "dist"
  ]
}
```

---

## 19. Vite 库模式如何构建？

**答案：**

```bash
npm run build

# 生成文件
# dist/my-library.es.js  (ES Module)
# dist/my-library.umd.js (UMD)
# dist/main.d.ts         (TypeScript 声明文件)
```

---

## 20. Vite 如何配置 CSS Modules？

**答案：**

### CSS Modules 配置

```javascript
// vite.config.js
export default {
  css: {
    modules: {
      localsConvention: 'camelCase',  // 命名约定
      scopeBehaviour: 'local',        // 作用域行为
      generateScopedName: '[name]__[local]__[hash:base64:5]'
    }
  }
};
```

---

## 21. Vite 如何使用 CSS Modules？

**答案：**

```vue
<!-- App.vue -->
<template>
  <div :class="$style.container">
    <p :class="$style.title">Hello World</p>
  </div>
</template>

<style module>
.container {
  padding: 20px;
  background: #f0f0f0;
}

.title {
  font-size: 24px;
  color: #333;
}
</style>
```

---

## 22. Vite CSS Modules 如何使用动态类名？

**答案：**

```javascript
// 使用 CSS Modules
import styles from './styles.module.css';

const className = styles.container;
const activeClass = styles.active;

// 在模板中使用
<div :class="className">Content</div>
<div :class="[styles.button, activeClass]">Button</div>
```

---

## 23. Vite CSS Modules 如何支持 TypeScript？

**答案：**

```typescript
// vite-env.d.ts
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// 使用
import styles from './styles.module.css';
const containerClass: string = styles.container;
```

---

## 24. Vite 如何导入 SVG？

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

## 25. Vite 如何使用 vite-plugin-svgr 处理 SVG？

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

## 26. Vite 如何在 React 中使用 SVG？

**答案：**

```javascript
import React from 'react';
import Logo from './logo.svg';

function App() {
  return (
    <div>
      <Logo width={100} height={100} />
    </div>
  );
}
```

---

## 27. Vite 如何在 Vue 中使用 SVG？

**答案：**

```vue
<!-- App.vue -->
<template>
  <div>
    <Logo class="logo" />
  </div>
</template>

<script setup>
import Logo from './logo.svg?component';
</script>

<style scoped>
.logo {
  width: 100px;
  height: 100px;
}
</style>
```

---

## 28. Vite 如何在主线程中使用 Worker？

**答案：**

### 主线程

```javascript
// main.js
const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: 'module'
});

worker.postMessage({ message: 'Hello Worker' });

worker.onmessage = (e) => {
  console.log('Received:', e.data);
};
```

---

## 29. Vite 如何配置 Worker 文件？

**答案：**

```javascript
// worker.js
self.onmessage = (e) => {
  console.log('Received from main:', e.data);

  // 执行耗时任务
  const result = heavyComputation();

  self.postMessage({ result });
};

function heavyComputation() {
  // 耗时计算
  return 42;
}
```

---

## 30. Vite 如何配置 Worker？

**答案：**

```javascript
// vite.config.js
export default {
  worker: {
    format: 'es',  // Worker 格式
    plugins: [],   // Worker 插件
    rollupOptions: {
      output: {
        entryFileNames: 'assets/worker-[hash].js'
      }
    }
  }
};
```

---

## 31. Vite 如何使用 Composable 封装 Worker？

**答案：**

```javascript
// useWorker.js
import { ref } from 'vue';

export function useWorker(workerPath) {
  const result = ref(null);
  const error = ref(null);

  const worker = new Worker(new URL(workerPath, import.meta.url), {
    type: 'module'
  });

  worker.onmessage = (e) => {
    result.value = e.data;
  };

  worker.onerror = (e) => {
    error.value = e.message;
  };

  const postMessage = (data) => {
    worker.postMessage(data);
  };

  const terminate = () => {
    worker.terminate();
  };

  return {
    result,
    error,
    postMessage,
    terminate
  };
}
```

---

## 32. Vite 如何使用 vite-plugin-imp 实现按需导入？

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

## 33. Vite 如何使用 unplugin-vue-components 实现按需导入？

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

## 34. Vite 如何使用 unplugin-auto-import 实现按需导入？

**答案：**

```javascript
// 安装
npm install unplugin-auto-import -D

// vite.config.js
import { defineConfig } from 'vite';
import AutoImport from 'unplugin-auto-import/vite';

export default defineConfig({
  plugins: [
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia'
      ],
      dts: 'src/auto-imports.d.ts'
    })
  ]
});
```

---

## 35. Vite 按需导入如何使用？

**答案：**

```vue
<!-- 自动导入 Vue API -->
<template>
  <div>{{ count }}</div>
  <button @click="increment">Increment</button>
</template>

<script setup>
// 不需要手动导入 ref、computed 等
const count = ref(0);
const increment = () => {
  count.value++;
};
</script>
```

---

## 36. Vite 如何使用 rollup-plugin-visualizer 进行构建分析？

**答案：**

```javascript
// 安装
npm install rollup-plugin-visualizer -D

// vite.config.js
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
});
```

---

## 37. Vite 如何使用 vite-plugin-inspect 进行构建分析？

**答案：**

```javascript
// 安装
npm install vite-plugin-inspect -D

// vite.config.js
import { defineConfig } from 'vite';
import Inspect from 'vite-plugin-inspect';

export default defineConfig({
  plugins: [
    Inspect({
      build: true,
      server: true
    })
  ]
});
```

---

## 38. Vite 构建分析如何使用？

**答案：**

```bash
# 构建时会自动打开分析页面
npm run build

# 或者手动打开
npm run preview
```

---

## 39. Vite 如何自定义构建分析配置？

**答案：**

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      filename: 'dist/stats.html',  // 输出文件
      open: false,                   // 不自动打开
      gzipSize: true,                // 显示 gzip 大小
      brotliSize: true,              // 显示 brotli 大小
      template: 'treemap',           // 模板类型
      json: false                    // 不生成 JSON
    })
  ]
});
```

---

## 总结

以上补充了 Vite 的高频面试题，涵盖了：

1. **环境变量文件** - `.env` 文件的配置
2. **环境变量使用** - 在代码中使用环境变量
3. **环境变量配置** - Vite 配置环境变量
4. **环境变量注意事项** - 使用环境变量的注意点
5. **依赖预构建原理** - 预构建的工作流程
6. **依赖预构建配置** - optimizeDeps 配置
7. **依赖预构建缓存** - 缓存机制
8. **多页面应用配置** - MPA 配置
9. **多页面应用结构** - 项目结构
10. **多页面应用 HTML** - HTML 文件配置
11. **多页面应用插件** - 使用插件
12. **SSR 配置** - 服务端渲染配置
13. **SSR 服务端入口** - 服务端入口文件
14. **SSR 客户端入口** - 客户端入口文件
15. **SSR Express 服务器** - 服务器配置
16. **库模式配置** - Library Mode 配置
17. **库模式入口** - 入口文件
18. **库模式 package.json** - 包配置
19. **库模式构建** - 构建命令
20. **CSS Modules 配置** - CSS 模块化配置
21. **CSS Modules 使用** - 使用 CSS Modules
22. **CSS Modules 动态类名** - 动态类名
23. **CSS Modules TypeScript** - TypeScript 支持
24. **SVG 导入** - 导入 SVG
25. **SVG vite-plugin-svgr** - 使用 svgr 插件
26. **SVG React** - React 中使用
27. **SVG Vue** - Vue 中使用
28. **Worker 主线程** - 主线程使用
29. **Worker 文件** - Worker 文件配置
30. **Worker 配置** - Worker 配置
31. **Worker Composable** - 封装 Worker
32. **按需导入 vite-plugin-imp** - 按需导入组件
33. **按需导入 unplugin-vue-components** - 自动导入组件
34. **按需导入 unplugin-auto-import** - 自动导入 API
35. **按需导入使用** - 使用示例
36. **构建分析 rollup-plugin-visualizer** - 可视化分析
37. **构建分析 vite-plugin-inspect** - 检查插件
38. **构建分析使用** - 使用方法
39. **构建分析自定义配置** - 自定义配置

这些题目补充了 Vite 的高级特性，能够更全面地考察候选人的 Vite 能力。