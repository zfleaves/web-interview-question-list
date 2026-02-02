# 6. Vite 如何配置依赖预构建？

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