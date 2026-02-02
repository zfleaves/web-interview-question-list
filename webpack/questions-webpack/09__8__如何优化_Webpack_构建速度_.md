## 8. 如何优化 Webpack 构建速度？

**答案：**

### 构建速度优化方案

#### 1. 减少构建范围

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),  // 只处理 src 目录
        exclude: /node_modules/,                  // 排除 node_modules
        use: 'babel-loader'
      }
    ]
  }
};
```

#### 2. 开启缓存

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true  // 开启缓存
          }
        }
      }
    ]
  }
};
```

#### 3. 多进程构建

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'thread-loader'  // 多进程处理
      }
    ]
  }
};
```

#### 4. 开启持久化缓存（Webpack 5）

```javascript
module.exports = {
  cache: {
    type: 'filesystem',  // 文件系统缓存
    cacheDirectory: path.resolve(__dirname, '.temp_cache')
  }
};
```

#### 5. 使用 DLL

```javascript
// webpack.dll.config.js
const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    vendor: ['react', 'react-dom', 'lodash']
  },
  output: {
    path: path.resolve(__dirname, 'dll'),
    filename: '[name].dll.js',
    library: '[name]_library'
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.resolve(__dirname, 'dll/[name]-manifest.json'),
      name: '[name]_library'
    })
  ]
};

// webpack.config.js
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.DllReferencePlugin({
      manifest: require('./dll/vendor-manifest.json')
    }),
    new AddAssetHtmlWebpackPlugin({
      filepath: path.resolve(__dirname, 'dll/vendor.dll.js')
    })
  ]
};
```

#### 6. 使用 externals

```javascript
module.exports = {
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    lodash: '_'
  }
};

// index.html
<script src="https://cdn.jsdelivr.net/npm/react@17/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@17/umd/react-dom.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>
```

#### 7. 使用 Happypack

```javascript
const HappyPack = require('happypack');
const os = require('os');

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'happypack/loader?id=js'
      }
    ]
  },
  plugins: [
    new HappyPack({
      id: 'js',
      loaders: ['babel-loader'],
      threads: os.cpus().length - 1
    })
  ]
};
```

#### 8. 优化 resolve 配置

```javascript
module.exports = {
  resolve: {
    extensions: ['.js', '.jsx', '.json'],  // 减少扩展名尝试
    alias: {
      '@': path.resolve(__dirname, 'src'),  // 配置别名
      components: path.resolve(__dirname, 'src/components')
    },
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],  // 指定模块查找路径
    mainFields: ['main', 'module']  // 指定入口字段
  }
};
```

#### 9. 使用 IgnorePlugin

```javascript
const webpack = require('webpack');

module.exports = {
  plugins: [
    // 忽略 moment 的 locale
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ]
};
```

#### 10. 使用 ParallelUglifyPlugin

```javascript
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');

module.exports = {
  optimization: {
    minimizer: [
      new ParallelUglifyPlugin({
        uglifyJS: {
          output: {
            comments: false
          },
          compress: {
            warnings: false,
            drop_console: true
          }
        }
      })
    ]
  }
};
```

### 构建速度分析

```javascript
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const smp = new SpeedMeasurePlugin();

module.exports = smp.wrap({
  // Webpack 配置
});
```

### 构建结果分析

```javascript
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'server',
      analyzerPort: 8888,
      openAnalyzer: true
    })
  ]
};
```

---