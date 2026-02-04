# 3. Webpack 如何使用 Module Federation 实现微前端？

**答案：**

Module Federation 允许多个独立构建的 JavaScript 应用在运行时动态加载彼此的代码。

```javascript
// 主应用 webpack.config.js
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        app1: 'app1@http://localhost:3001/remoteEntry.js',
        app2: 'app2@http://localhost:3002/remoteEntry.js'
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true }
      }
    })
  ]
};

// 子应用 webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/Button',
        './Card': './src/Card'
      },
      shared: ['react', 'react-dom']
    })
  ]
};

// 主应用中使用
const RemoteButton = lazy(() => import('app1/Button'));
```

---