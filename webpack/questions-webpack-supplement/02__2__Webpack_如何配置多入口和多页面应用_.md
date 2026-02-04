# 2. Webpack 如何配置多入口和多页面应用？

**答案：**

配置多个入口文件，配合 HtmlWebpackPlugin 生成多个 HTML 页面。

```javascript
// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    index: './src/index.js',
    about: './src/about.js',
    admin: './src/admin.js'
  },
  output: {
    filename: '[name].[contenthash:8].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      chunks: ['index']
    }),
    new HtmlWebpackPlugin({
      template: './src/about.html',
      filename: 'about.html',
      chunks: ['about']
    })
  ]
};
```

---