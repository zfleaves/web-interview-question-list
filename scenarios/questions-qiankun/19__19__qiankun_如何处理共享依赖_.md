# 19. qiankun 如何处理共享依赖？

**答案：**

qiankun 支持共享依赖的多种方案：

### 1. Webpack Externals

**主应用**：
```javascript
// webpack.config.js
module.exports = {
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    vue: 'Vue'
  }
};
```

**子应用**：
```javascript
// webpack.config.js
module.exports = {
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
};
```

**主应用 HTML**：
```html
<script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"></script>
```

### 2. Module Federation

**主应用 webpack.config.js**：
```javascript
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {},
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      }
    })
  ]
};
```

**子应用 webpack.config.js**：
```javascript
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.js',
      exposes: {},
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      }
    })
  ]
};
```

### 3. CDN 共享

```javascript
// 主应用
window.React = React;
window.ReactDOM = ReactDOM;

// 子应用
import React from 'react';
import ReactDOM from 'react-dom';
```

---