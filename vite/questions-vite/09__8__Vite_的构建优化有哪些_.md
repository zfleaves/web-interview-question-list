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