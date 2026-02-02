# 6. Webpack 如何配置多入口？

**答案：**

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  entry: {
    main: './src/main.js',
    admin: './src/admin.js',
    vendor: './src/vendor.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js',
    clean: true
  }
};
```

---