# 18. Webpack 如何使用 externals 处理 CDN 资源？

**答案：**

```javascript
// webpack.config.js
module.exports = {
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    lodash: '_',
    axios: 'axios'
  }
};
```

---