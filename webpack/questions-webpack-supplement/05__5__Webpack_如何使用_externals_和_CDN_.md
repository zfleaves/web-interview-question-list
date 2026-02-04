# 5. Webpack 如何使用 externals 和 CDN？

**答案：**

externals 配置将某些依赖排除在打包之外，通过 CDN 引入。

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

```html
<!-- index.html -->
<script src="https://cdn.jsdelivr.net/npm/react@17/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@17/umd/react-dom.production.min.js"></script>
```

---