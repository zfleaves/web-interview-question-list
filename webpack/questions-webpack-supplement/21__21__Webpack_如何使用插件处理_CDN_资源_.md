# 21. Webpack 如何使用插件处理 CDN 资源？

**答案：**

```javascript
// webpack.config.js
const CdnPlugin = require('webpack-cdn-plugin');

module.exports = {
  plugins: [
    new CdnPlugin({
      modules: [
        {
          name: 'react',
          var: 'React',
          path: 'umd/react.production.min.js',
          url: 'https://cdn.jsdelivr.net/npm/react@17/umd/react.production.min.js'
        },
        {
          name: 'react-dom',
          var: 'ReactDOM',
          path: 'umd/react-dom.production.min.js',
          url: 'https://cdn.jsdelivr.net/npm/react-dom@17/umd/react-dom.production.min.js'
        }
      ]
    })
  ]
};
```

---