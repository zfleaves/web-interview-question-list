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