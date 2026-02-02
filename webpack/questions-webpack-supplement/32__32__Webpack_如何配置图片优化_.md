# 32. Webpack 如何配置图片优化？

**答案：**

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|svg|webp)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024  // 小于 8KB 转为 base64
          }
        },
        generator: {
          filename: 'images/[name].[hash:8][ext]'
        }
      }
    ]
  }
};
```

---