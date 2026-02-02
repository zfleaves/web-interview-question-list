# 11. Webpack 如何配置 SSR 客户端？

**答案：**

```javascript
// webpack.client.config.js
const path = require('path');

module.exports = {
  target: 'web',
  entry: './src/client.js',
  output: {
    path: path.resolve(__dirname, 'dist/client'),
    filename: 'client.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  }
};
```

---