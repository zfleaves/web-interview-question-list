# 15. qiankun 如何实现子应用的热更新？

**答案：**

### 1. 开发环境配置

```javascript
// 主应用 vite.config.ts
export default defineConfig({
  server: {
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    }
  }
});
```

### 2. 子应用配置

```javascript
// 子应用 webpack.config.js
module.exports = {
  devServer: {
    hot: true,
    port: 3001,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
};
```

### 3. HMR 集成

```javascript
// 子应用入口
if (module.hot) {
  module.hot.accept();
}
```

---