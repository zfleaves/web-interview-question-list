# 20. Webpack 如何配置 publicPath？

**答案：**

```javascript
// webpack.config.js
module.exports = {
  output: {
    publicPath: 'https://cdn.example.com/assets/'
  }
};
```

---