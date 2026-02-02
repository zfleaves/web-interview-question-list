# 10. Webpack 如何配置 SSR 服务端？

**答案：**

```javascript
// webpack.server.config.js
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node',
  entry: './src/server.js',
  output: {
    path: path.resolve(__dirname, 'dist/server'),
    filename: 'server.js',
    libraryTarget: 'commonjs2'
  },
  externals: [nodeExternals()],
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