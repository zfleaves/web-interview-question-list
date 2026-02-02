# 22. Webpack 如何配置动态 publicPath？

**答案：**

```javascript
// webpack.config.js
module.exports = {
  output: {
    publicPath: process.env.NODE_ENV === 'production'
      ? 'https://cdn.example.com/'
      : '/'
  }
};
```

---