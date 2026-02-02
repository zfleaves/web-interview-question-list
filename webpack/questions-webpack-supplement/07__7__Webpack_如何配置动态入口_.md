# 7. Webpack 如何配置动态入口？

**答案：**

```javascript
// webpack.config.js
const glob = require('glob');

const entries = glob.sync('./src/pages/**/*.js').reduce((acc, file) => {
  const name = file.replace('./src/pages/', '').replace('.js', '');
  acc[name] = file;
  return acc;
}, {});

module.exports = {
  entry: entries
};
```

---