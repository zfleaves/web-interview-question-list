# 43. Webpack 如何配置持久化缓存？

**答案：**

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.webpack-cache'),
    maxAge: 1000 * 60 * 60 * 24 * 7,  // 7 天
    compression: 'gzip',
    hashAlgorithm: 'md4',
    idleTimeout: 60000,
    idleTimeoutForInitialStore: 5000
  }
};
```

---