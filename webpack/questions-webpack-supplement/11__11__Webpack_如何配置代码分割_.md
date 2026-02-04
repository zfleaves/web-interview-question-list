# 11. Webpack 如何配置代码分割？

**答案：**

使用 optimization.splitChunks 配置代码分割，提取公共代码。

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'initial',
          priority: 0
        }
      }
    }
  }
};
```

---