# Vite 面试题集锦

## 1. 什么是 Vite？它和 Webpack 的区别是什么？

**答案：**

### Vite 简介

Vite 是由 Vue.js 作者尤雨溪开发的新一代前端构建工具，旨在提供更快的开发体验和更快的构建速度。

### Vite 的特点

1. **极速的冷启动**
   - 开发环境使用原生 ES Modules
   - 无需打包，按需编译

2. **即时的热更新（HMR）**
   - 基于 ES Modules 的 HMR
   - 无论应用大小，都能保持快速

3. **丰富的功能**
   - 支持 TypeScript、JSX、CSS 预处理器
   - 开箱即用的配置
   - 丰富的插件生态

4. **优化的构建**
   - 使用 Rollup 进行生产构建
   - 自动代码分割
   - CSS 代码分割

### Vite vs Webpack

| 特性 | Vite | Webpack |
|------|------|---------|
| 开发模式 | 原生 ES Modules | 打包所有模块 |
| 冷启动速度 | 极快 | 较慢 |
| 热更新速度 | 快 | 较慢 |
| 构建工具 | Rollup | Webpack |
| 配置复杂度 | 简单 | 复杂 |
| 插件生态 | 发展中 | 成熟 |
| 生产构建 | Rollup | Webpack |

### Vite 的工作原理

#### 开发环境

```
1. 启动开发服务器
   ├── 不打包代码
   └── 使用原生 ES Modules

2. 浏览器请求模块
   ├── 请求 main.js
   └── 服务器返回 main.js

3. 浏览器解析 import
   ├── 发现 import './app.js'
   └── 请求 app.js

4. 服务器编译模块
   ├── 使用 esbuild 编译
   └── 返回编译后的代码

5. 浏览器执行代码
   └── 继续解析 import
```

#### 生产环境

```
1. 使用 Rollup 打包
   ├── 代码分割
   ├── Tree Shaking
   └── 压缩代码

2. 生成静态资源
   ├── JS 文件
   ├── CSS 文件
   └── 其他资源
```

### Vite 的优势

1. **开发体验**
   - 极快的冷启动
   - 即时的热更新
   - 简单的配置

2. **性能**
   - 使用 esbuild 预构建依赖
   - 使用 Rollup 进行生产构建
   - 自动优化

3. **生态**
   - 支持主流框架（Vue、React、Svelte 等）
   - 丰富的插件
   - 社区活跃

### Vite 的适用场景

1. **新项目**
   - 推荐使用 Vite
   - 开发体验更好

2. **Vue 项目**
   - Vite 是 Vue 官方推荐
   - 更好的支持

3. **React 项目**
   - Vite 完全支持 React
   - 开发体验优于 Webpack

4. **大型项目**
   - Vite 的优势更明显
   - 冷启动和热更新更快

---

## 2. Vite 的开发环境和生产环境的区别是什么？

**答案：**

### 开发环境（Development）

**特点：**

1. **使用原生 ES Modules**
   - 不打包代码
   - 按需编译

2. **使用 esbuild 预构建依赖**
   - 将 CommonJS/UMD 转换为 ESM
   - 加速依赖加载

3. **热模块替换（HMR）**
   - 基于 ES Modules
   - 即时更新

4. **Source Map**
   - 生成 Source Map
   - 便于调试

**配置：**

```javascript
// vite.config.js
export default {
  mode: 'development',
  server: {
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  css: {
    devSourcemap: true
  }
};
```

### 生产环境（Production）

**特点：**

1. **使用 Rollup 打包**
   - 代码分割
   - Tree Shaking
   - 压缩代码

2. **优化输出**
   - 压缩 JS 和 CSS
   - 生成哈希文件名
   - 自动清理输出目录

3. **静态资源优化**
   - 图片压缩
   - 资源内联
   - CDN 部署

**配置：**

```javascript
// vite.config.js
export default {
  mode: 'production',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
};
```

### 区别总结

| 特性 | 开发环境 | 生产环境 |
|------|----------|----------|
| 构建工具 | esbuild | Rollup |
| 代码打包 | 不打包 | 打包 |
| 代码压缩 | 不压缩 | 压缩 |
| Source Map | 生成 | 可选 |
| 热更新 | 支持 | 不支持 |
| 代码分割 | 不支持 | 支持 |
| Tree Shaking | 不支持 | 支持 |

### 环境变量

```javascript
// .env.development
VITE_API_BASE_URL=http://localhost:8080

// .env.production
VITE_API_BASE_URL=https://api.example.com

// 使用
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

---

## 3. Vite 的热更新（HMR）是如何工作的？

**答案：**

### Vite HMR 简介

Vite 的热更新基于原生 ES Modules 和 WebSocket，实现了极快的热更新速度。

### HMR 工作原理

```
1. 文件变化
   ├── Vite 监听文件变化
   └── 重新编译变化的模块

2. 生成更新
   ├── 生成新的模块代码
   └── 生成 HMR 更新消息

3. 通过 WebSocket 发送更新
   ├── 发送更新通知
   └── 发送更新内容

4. 浏览器接收更新
   ├── 接收 HMR 通知
   └── 请求更新的模块

5. 替换模块
   ├── 使用新的模块替换旧模块
   └── 执行模块的 HMR 代码

6. 更新界面
   ├── 更新 DOM
   └── 保留应用状态
```

### HMR API

```javascript
// 检测模块是否支持 HMR
if (import.meta.hot) {
  // 接受当前模块的更新
  import.meta.hot.accept();

  // 接受依赖模块的更新
  import.meta.hot.accept('./dependency', (newDependency) => {
    // 依赖模块更新后的回调
    console.log('Dependency updated', newDependency);
  });

  // 处理更新错误
  import.meta.hot.dispose(() => {
    // 清理工作
    console.log('Module disposed');
  });

  // 削减模块
  import.meta.hot.prune(() => {
    // 清理工作
  });
}
```

### Vue HMR

```javascript
// Vue 组件自动支持 HMR
// 无需手动配置
```

### React HMR

```javascript
// 安装：npm install @vitejs/plugin-react-fast-refresh
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-fast-refresh';

export default defineConfig({
  plugins: [react()]
});
```

### HMR 配置

```javascript
// vite.config.js
export default {
  server: {
    hmr: {
      overlay: true,  // 显示错误覆盖层
      protocol: 'ws',  // WebSocket 协议
      host: 'localhost',  // WebSocket 主机
      port: 24678  // WebSocket 端口
    }
  }
};
```

### HMR 注意事项

1. **CSS HMR**
   - CSS 自动支持 HMR
   - 无需手动配置

2. **生产环境不启用 HMR**
   - HMR 只在开发环境启用
   - 生产环境不适用

3. **HMR 失败**
   - 如果 HMR 失败，会自动刷新页面
   - 可以通过 `hmr.overlay` 配置错误覆盖层

---

## 4. Vite 的配置文件有哪些？如何配置？

**答案：**

### Vite 配置文件

Vite 支持多种配置文件格式：

1. **vite.config.js**
2. **vite.config.ts**
3. **vite.config.mjs**

### 基础配置

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  // 插件
  plugins: [vue()],

  // 路径别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      components: path.resolve(__dirname, 'src/components')
    }
  },

  // 开发服务器
  server: {
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia']
        }
      }
    }
  },

  // CSS 配置
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },

  // 环境变量
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0')
  }
});
```

### 详细配置

```javascript
// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    // 基础路径
    base: '/',

    // 插件
    plugins: [
      vue(),
      // 其他插件
    ],

    // 路径解析
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@utils': path.resolve(__dirname, 'src/utils')
      }
    },

    // 开发服务器
    server: {
      host: '0.0.0.0',
      port: 3000,
      open: true,
      cors: true,
      strictPort: false,
      https: false,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Sending Request:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Received Response:', proxyRes.statusCode, req.url);
            });
          }
        }
      },
      hmr: {
        overlay: true
      }
    },

    // 预览服务器
    preview: {
      port: 4000,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true
        }
      }
    },

    // 依赖优化
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia'],
      exclude: ['your-dep'],
      esbuildOptions: {
        target: 'es2020'
      }
    },

    // 构建配置
    build: {
      target: 'modules',
      outDir: 'dist',
      assetsDir: 'assets',
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html')
        },
        output: {
          entryFileNames: 'assets/js/[name]-[hash].js',
          chunkFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia'],
            utils: ['lodash', 'axios']
          }
        }
      },
      chunkSizeWarningLimit: 1000,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true
      }
    },

    // CSS 配置
    css: {
      modules: {
        localsConvention: 'camelCase'
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        },
        less: {
          modifyVars: {
            'primary-color': '#1890ff'
          }
        }
      },
      devSourcemap: true
    },

    // JSON 配置
    json: {
      namedExports: true,
      stringify: true
    },

    // 全局变量
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION),
      __API_URL__: JSON.stringify(env.VITE_API_URL)
    },

    // 环境变量前缀
    envPrefix: 'VITE_',

    // Worker 配置
    worker: {
      format: 'es',
      plugins: [],
      rollupOptions: {}
    },

    // 实验性功能
    experimental: {
      renderBuiltUrl: (filename, { hostId, hostType, type }) => {
        return `https://cdn.example.com/${filename}`;
      }
    }
  };
});
```

### 环境变量

```javascript
// .env
VITE_APP_TITLE=My App

// .env.development
VITE_API_BASE_URL=http://localhost:8080

// .env.production
VITE_API_BASE_URL=https://api.example.com

// 使用
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

---

## 5. Vite 的插件系统是如何工作的？

**答案：**

### Vite 插件简介

Vite 插件基于 Rollup 插件系统，同时添加了 Vite 特有的钩子。

### 插件结构

```javascript
// my-plugin.js
export default function myPlugin(options) {
  return {
    name: 'my-plugin',

    // Rollup 钩子
    resolveId(source) {
      if (source === 'virtual-module') {
        return source;
      }
    },

    load(id) {
      if (id === 'virtual-module') {
        return 'export default "Hello from virtual module"';
      }
    },

    transform(code, id) {
      if (id.endsWith('.js')) {
        return code.replace(/console\.log\((.*?)\)/g, '');
      }
    },

    // Vite 特有钩子
    config(config, { command }) {
      // 修改配置
      return {
        define: {
          __MY_PLUGIN__: JSON.stringify(true)
        }
      };
    },

    configResolved(config) {
      // 配置解析完成后
      console.log('Config resolved');
    },

    configureServer(server) {
      // 配置开发服务器
      server.middlewares.use((req, res, next) => {
        if (req.url === '/hello') {
          res.end('Hello World');
        } else {
          next();
        }
      });
    },

    transformIndexHtml(html) {
      // 转换 HTML
      return html.replace('{{ title }}', 'My App');
    },

    handleHotUpdate({ file, server }) {
      // 处理热更新
      console.log('File changed:', file);
    }
  };
}
```

### 常用插件

#### 1. Vue 插件

```javascript
import vue from '@vitejs/plugin-vue';

export default {
  plugins: [vue()]
};
```

#### 2. React 插件

```javascript
import react from '@vitejs/plugin-react';

export default {
  plugins: [react()]
};
```

#### 3. TypeScript 插件

```javascript
import typescript from '@rollup/plugin-typescript';

export default {
  plugins: [typescript()]
};
```

#### 4. 路径别名插件

```javascript
import path from 'path';

export default {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
};
```

#### 5. 环境变量插件

```javascript
import dotenv from 'dotenv';

export default {
  plugins: [
    {
      name: 'dotenv',
      config() {
        const env = dotenv.config();
        return {
          define: Object.keys(env.parsed || {}).reduce((acc, key) => {
            acc[`process.env.${key}`] = JSON.stringify(env.parsed[key]);
            return acc;
          }, {})
        };
      }
    }
  ]
};
```

### 插件配置

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import myPlugin from './my-plugin';

export default defineConfig({
  plugins: [
    vue(),
    myPlugin({
      option: 'value'
    })
  ]
});
```

### 插件开发最佳实践

1. **命名规范**
   - 使用 kebab-case 命名
   - 包含 `vite-plugin-` 前缀

2. **错误处理**
   - 使用 `this.error()` 报告错误
   - 提供清晰的错误信息

3. **性能优化**
   - 避免不必要的转换
   - 使用缓存

4. **文档完善**
   - 提供使用示例
   - 说明配置选项

---

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

## 7. Vite 的代理配置是如何工作的？

**答案：**

### 代理配置

Vite 使用 `http-proxy` 中间件实现代理功能。

### 基础配置

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
};
```

### 详细配置

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      // 字符串形式
      '/api': 'http://localhost:8080',

      // 对象形式
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response:', proxyRes.statusCode, req.url);
          });
        }
      },

      // 正则表达式
      '^/fallback/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, '')
      }
    }
  }
};
```

### 代理选项

```javascript
{
  target: 'http://localhost:8080',  // 目标服务器
  changeOrigin: true,  // 修改请求头中的 origin
  rewrite: (path) => path.replace(/^\/api/, ''),  // 重写路径
  configure: (proxy, options) => {},  // 自定义配置
  ws: true,  // 支持 WebSocket
  secure: false,  // 不验证 SSL 证书
  bypass: (req, res, proxyOptions) => {
    // 绕过代理
    if (req.headers.accept.indexOf('html') !== -1) {
      return '/index.html';
    }
  }
}
```

### 使用示例

```javascript
// 前端请求
fetch('/api/users').then(res => res.json());

// 实际请求：http://localhost:8080/users
```

---

## 8. Vite 的构建优化有哪些？

**答案：**

### 构建优化

#### 1. 代码分割

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          utils: ['lodash', 'axios']
        }
      }
    }
  }
};
```

#### 2. 压缩代码

```javascript
// vite.config.js
export default {
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
};
```

#### 3. Tree Shaking

```javascript
// Vite 默认开启 Tree Shaking
// 只需要生产模式即可
```

#### 4. 资源优化

```javascript
// vite.config.js
export default {
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

#### 5. CSS 优化

```javascript
// vite.config.js
export default {
  build: {
    cssCodeSplit: true
  },
  css: {
    devSourcemap: false
  }
};
```

#### 6. 依赖预构建

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia'],
    exclude: ['your-dep'],
    esbuildOptions: {
      target: 'es2020'
    }
  }
};
```

#### 7. 持久化缓存

```javascript
// Vite 5 默认开启持久化缓存
// 可以通过配置禁用
export default {
  cacheDir: 'node_modules/.vite'
};
```

---

## 9. Vite 如何支持 TypeScript？

**答案：**

### TypeScript 支持

Vite 原生支持 TypeScript，无需额外配置。

### 基础配置

```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()]
});
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 类型检查

```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'vite-plugin-checker',
      config() {
        return {
          build: {
            watch: {}
          }
        };
      }
    }
  ]
});
```

### 使用 TypeScript

```typescript
// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);
app.mount('#app');
```

---

## 10. Vite 如何支持 CSS 预处理器？

**答案：**

### CSS 预处理器支持

Vite 支持多种 CSS 预处理器，包括 SCSS、SASS、LESS、Stylus 等。

### 安装依赖

```bash
# SCSS/SASS
npm install -D sass

# LESS
npm install -D less

# Stylus
npm install -D stylus
```

### 配置

```javascript
// vite.config.js
export default {
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
        api: 'modern-compiler'
      },
      less: {
        modifyVars: {
          'primary-color': '#1890ff'
        },
        javascriptEnabled: true
      },
      stylus: {
        additionalData: `@import "@/styles/variables.styl"`
      }
    }
  }
};
```

### 使用

```vue
<!-- App.vue -->
<style lang="scss">
.container {
  color: $primary-color;
}
</style>
```

### CSS Modules

```vue
<!-- App.vue -->
<template>
  <div :class="$style.container">
    Hello World
  </div>
</template>

<style module>
.container {
  color: red;
}
</style>
```

### PostCSS

```javascript
// postcss.config.js
export default {
  plugins: {
    autoprefixer: {},
    'postcss-pxtorem': {
      rootValue: 16,
      propList: ['*']
    }
  }
};
```

---

## 总结

Vite 是一个现代化的前端构建工具，具有以下优势：

1. **极速的开发体验**
   - 冷启动快
   - 热更新快

2. **简单的配置**
   - 开箱即用
   - 配置简洁

3. **丰富的功能**
   - 支持主流框架
   - 丰富的插件

4. **优化的构建**
   - 使用 Rollup
   - 自动优化

建议在新项目中使用 Vite，可以显著提升开发效率和用户体验。