# 28. qiankun 如何处理子应用的依赖冲突？

**答案：**

### 1. 版本锁定

```javascript
// package.json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "resolutions": {
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}
```

### 2. Webpack 配置

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom')
    }
  }
};
```

### 3. Module Federation

```javascript
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.0.0'
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.0.0'
        }
      }
    })
  ]
};
```

---