# 1. Webpack 如何配置环境变量？

**答案：**

```javascript
// webpack.config.js
const webpack = require('webpack');

module.exports = (env) => {
  console.log('NODE_ENV:', env.NODE_ENV);  // 从命令行获取

  return {
    mode: env.NODE_ENV || 'development',
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
        'process.env.API_URL': JSON.stringify(env.API_URL || 'http://localhost:8080')
      })
    ]
  };
};
```

---