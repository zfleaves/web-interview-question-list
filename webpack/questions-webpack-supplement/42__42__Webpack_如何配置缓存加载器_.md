# 42. Webpack 如何配置缓存加载器？

**答案：**

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'cache-loader',
        options: {
          cacheDirectory: path.resolve(__dirname, '.cache-loader')
        }
      }
    ]
  }
};
```

---