# 7. Webpack 如何提取 CSS 到单独文件？

**答案：**

使用 MiniCssExtractPlugin 将 CSS 提取到单独文件。

```javascript
// webpack.config.js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css'
    })
  ]
};
```

---