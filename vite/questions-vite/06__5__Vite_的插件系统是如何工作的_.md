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