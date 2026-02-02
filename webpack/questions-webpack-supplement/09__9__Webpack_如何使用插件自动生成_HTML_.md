# 9. Webpack 如何使用插件自动生成 HTML？

**答案：**

```javascript
// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const glob = require('glob');

const pages = glob.sync('./src/pages/**/*.html');

const htmlPlugins = pages.map(page => {
  const name = page.replace('./src/pages/', '').replace('.html', '');
  return new HtmlWebpackPlugin({
    template: page,
    filename: `${name}.html`,
    chunks: [name]
  });
});

module.exports = {
  plugins: [...htmlPlugins]
};
```

---