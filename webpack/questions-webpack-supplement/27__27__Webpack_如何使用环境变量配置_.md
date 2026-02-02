# 27. Webpack 如何使用环境变量配置？

**答案：**

```javascript
// webpack.config.js
const webpack = require('webpack');

module.exports = (env) => {
  const isProduction = env.NODE_ENV === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV)
      })
    ]
  };
};
```

---