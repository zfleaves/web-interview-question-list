# 38. Webpack 如何配置字体子集化？

**答案：**

```javascript
// 使用 fontmin-webpack-plugin
// 安装
npm install fontmin-webpack-plugin -D

// webpack.config.js
const FontminPlugin = require('fontmin-webpack-plugin');

module.exports = {
  plugins: [
    new FontminPlugin({
      text: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      glyphs: ['你', '好', '世', '界']
    })
  ]
};
```

---