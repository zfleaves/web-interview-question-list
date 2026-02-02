## 10. Webpack 5 有哪些新特性？

**答案：**

### Webpack 5 新特性

#### 1. 持久化缓存

```javascript
module.exports = {
  cache: {
    type: 'filesystem',  // 文件系统缓存
    cacheDirectory: path.resolve(__dirname, '.temp_cache'),
    buildDependencies: {
      config: [__filename]  // 配置文件变化时重新构建
    }
  }
};
```

#### 2. 模块联邦（Module Federation）

```javascript
// 应用 A（提供者）
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/Button'
      },
      shared: ['react', 'react-dom']
    })
  ]
};

// 应用 B（消费者）
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'app2',
      remotes: {
        app1: 'app1@http://localhost:3001/remoteEntry.js'
      },
      shared: ['react', 'react-dom']
    })
  ]
};

// 应用 B 中使用
const Button = React.lazy(() => import('app1/Button'));
```

#### 3. 更好的 Tree Shaking

```javascript
module.exports = {
  optimization: {
    usedExports: true,
    sideEffects: false,
    // Webpack 5 改进了 Tree Shaking
    // 可以更好地处理嵌套模块和动态导入
  }
};
```

#### 4. 资源模块（Asset Modules）

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset',  // 自动选择 resource 或 inline
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024  // 小于 8KB 转为 base64
          }
        }
      },
      {
        test: /\.txt$/,
        type: 'asset/source'  // 导出源代码
      }
    ]
  }
};
```

#### 5. 移除 Node.js Polyfills

```javascript
// Webpack 5 不再自动包含 Node.js Polyfills
// 需要手动安装和配置

module.exports = {
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
      util: require.resolve('util/')
    }
  }
};
```

#### 6. 更小的打包体积

```javascript
// Webpack 5 的打包体积更小
// 通过优化内部实现和移除不必要的代码
```

#### 7. 更好的性能

```javascript
// Webpack 5 的构建速度更快
// 通过优化算法和使用持久化缓存
```

#### 8. 微前端支持

```javascript
// 模块联邦使得微前端架构更容易实现
// 可以在多个应用之间共享代码和组件
```

#### 9. 更好的开发体验

```javascript
// 改进的错误信息和警告
// 更好的 Source Map 支持
```

#### 10. 移除废弃的功能

```javascript
// 移除了许多废弃的功能
// 如 CommonsChunkPlugin、NoEmitOnErrorsPlugin 等
```

---