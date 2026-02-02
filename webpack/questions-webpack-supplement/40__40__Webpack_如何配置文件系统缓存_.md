# 40. Webpack 如何配置文件系统缓存？

**答案：**

```javascript
// webpack.config.js
module.exports = {
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.temp_cache'),
    buildDependencies: {
      config: [__filename]
    }
  }
};
```

---