# 13. Webpack 如何配置 Source Map？

**答案：**

配置 devtool 选项，生产环境推荐 source-map。

```javascript
// webpack.config.js
module.exports = {
  // 开发环境
  devtool: 'eval-cheap-module-source-map',

  // 生产环境
  devtool: 'source-map'
};
```

---