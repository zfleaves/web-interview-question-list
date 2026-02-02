# 28. Webpack 如何配置 CSS Modules？

**答案：**

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]__[hash:base64:5]',
                exportLocalsConvention: 'camelCase'
              }
            }
          }
        ]
      }
    ]
  }
};
```

---