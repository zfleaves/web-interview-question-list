# 1. Webpack 如何配置环境变量？

**答案：**

使用 DefinePlugin 配置环境变量，配合 package.json 脚本传递。

```javascript
// webpack.config.js
const webpack = require('webpack');

module.exports = (env) => {
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

```json
// package.json
{
  "scripts": {
    "build": "webpack --env NODE_ENV=production",
    "build:staging": "webpack --env NODE_ENV=staging --env API_URL=https://staging-api.example.com"
  }
}
```

---