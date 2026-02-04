# 4. Webpack 如何配置 SSR（服务端渲染）？

**答案：**

分别配置服务端和客户端构建配置，服务端使用 nodeExternals 排除 node_modules。

```javascript
// webpack.server.config.js
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node',
  entry: './src/server.js',
  output: {
    filename: 'server.js',
    libraryTarget: 'commonjs2'
  },
  externals: [nodeExternals()]
};

// webpack.client.config.js
module.exports = {
  target: 'web',
  entry: './src/client.js',
  output: {
    filename: 'client.js'
  }
};

// 同时构建
module.exports = [serverConfig, clientConfig];
```

---