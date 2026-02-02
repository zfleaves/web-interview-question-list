# 12. Webpack 如何同时构建客户端和服务端？

**答案：**

```javascript
// webpack.config.js
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base.config.js');
const serverConfig = require('./webpack.server.config.js');
const clientConfig = require('./webpack.client.config.js');

module.exports = [
  merge(baseConfig, serverConfig),
  merge(baseConfig, clientConfig)
];
```

---