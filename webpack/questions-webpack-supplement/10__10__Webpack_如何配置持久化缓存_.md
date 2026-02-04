# 10. Webpack 如何配置持久化缓存？

**答案：**

Webpack 5 使用 filesystem 缓存，可以大幅提升二次构建速度。

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.webpack-cache'),
    buildDependencies: {
      config: [__filename]
    }
  },
  // Babel 缓存
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      }
    ]
  }
};
```

---