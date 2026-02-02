# 4. Webpack 如何使用 dotenv？

**答案：**

```javascript
// 安装
npm install dotenv-webpack -D

// webpack.config.js
const Dotenv = require('dotenv-webpack');

module.exports = {
  plugins: [
    new Dotenv({
      path: './.env.production',
      safe: true,
      systemvars: true
    })
  ]
};
```

---