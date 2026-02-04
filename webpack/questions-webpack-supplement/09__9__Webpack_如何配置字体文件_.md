# 9. Webpack 如何配置字体文件？

**答案：**

使用 asset/resource 处理字体文件。

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash:8][ext]'
        }
      }
    ]
  }
};

// CSS 中使用
@font-face {
  font-family: 'MyFont';
  src: url('./fonts/myfont.woff2') format('woff2');
}
```

---