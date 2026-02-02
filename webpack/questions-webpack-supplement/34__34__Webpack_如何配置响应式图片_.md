# 34. Webpack 如何配置响应式图片？

**答案：**

```javascript
// 使用 responsive-loader
// 安装
npm install responsive-loader sharp -D

// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg)$/,
        use: [
          {
            loader: 'responsive-loader',
            options: {
              adapter: require('responsive-loader/sharp'),
              sizes: [300, 600, 1200],
              placeholder: true,
              placeholderSize: 50
            }
          }
        ]
      }
    ]
  }
};
```

---