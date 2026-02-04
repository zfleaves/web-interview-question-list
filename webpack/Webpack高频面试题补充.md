# Webpack 高频面试题补充

## 1. Webpack 如何配置环境变量？

**答案：**

使用 DefinePlugin 配置环境变量，配合 package.json 脚本传递。

```javascript
// webpack.config.js
const webpack = require('webpack');

module.exports = (env) => {
  return {
    mode: env.NODE_ENV || 'development',
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
        'process.env.API_URL': JSON.stringify(env.API_URL || 'http://localhost:8080')
      })
    ]
  };
};
```

```json
// package.json
{
  "scripts": {
    "build": "webpack --env NODE_ENV=production",
    "build:staging": "webpack --env NODE_ENV=staging --env API_URL=https://staging-api.example.com"
  }
}
```

---

## 2. Webpack 如何配置多入口和多页面应用？

**答案：**

配置多个入口文件，配合 HtmlWebpackPlugin 生成多个 HTML 页面。

```javascript
// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    index: './src/index.js',
    about: './src/about.js',
    admin: './src/admin.js'
  },
  output: {
    filename: '[name].[contenthash:8].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      chunks: ['index']
    }),
    new HtmlWebpackPlugin({
      template: './src/about.html',
      filename: 'about.html',
      chunks: ['about']
    })
  ]
};
```

---

## 3. Webpack 如何使用 Module Federation 实现微前端？

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

## 4. Webpack 如何配置 SSR（服务端渲染）？

**答案：**

分别配置服务端和客户端构建配置，服务端使用 nodeExternals 排除 node_modules。

```javascript
// webpack.server.config.js
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node',
  entry: './src/server.js',
  output: {
    filename: 'server.js',
    libraryTarget: 'commonjs2'
  },
  externals: [nodeExternals()]
};

// webpack.client.config.js
module.exports = {
  target: 'web',
  entry: './src/client.js',
  output: {
    filename: 'client.js'
  }
};

// 同时构建
module.exports = [serverConfig, clientConfig];
```

---

## 5. Webpack 如何使用 externals 和 CDN？

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

## 6. Webpack 如何配置 CSS Modules？

**答案：**

配置 css-loader 的 modules 选项，实现 CSS 模块化。

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]__[hash:base64:5]',
                exportLocalsConvention: 'camelCase'
              }
            }
          }
        ]
      }
    ]
  }
};

// 使用
import styles from './App.css';
<div className={styles.container}>Hello</div>
```

---

## 7. Webpack 如何提取 CSS 到单独文件？

**答案：**

使用 MiniCssExtractPlugin 将 CSS 提取到单独文件。

```javascript
// webpack.config.js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css'
    })
  ]
};
```

---

## 8. Webpack 如何优化图片资源？

**答案：**

使用 asset 模块处理图片，配合 image-minimizer-webpack-plugin 压缩。

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|svg|webp)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024  // 小于 8KB 转为 base64
          }
        },
        generator: {
          filename: 'images/[name].[hash:8][ext]'
        }
      }
    ]
  }
};

// 使用 image-minimizer-webpack-plugin 压缩
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|svg|webp)$/,
        use: [
          {
            loader: ImageMinimizerPlugin.loader,
            options: {
              minimizer: {
                implementation: ImageMinimizerPlugin.imageminMinify,
                options: {
                  plugins: ['gifsicle', 'jpegtran', 'optipng', 'svgo']
                }
              }
            }
          }
        ]
      }
    ]
  }
};
```

---

## 9. Webpack 如何配置字体文件？

**答案：**

使用 asset/resource 处理字体文件。

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash:8][ext]'
        }
      }
    ]
  }
};

// CSS 中使用
@font-face {
  font-family: 'MyFont';
  src: url('./fonts/myfont.woff2') format('woff2');
}
```

---

## 10. Webpack 如何配置持久化缓存？

**答案：**

Webpack 5 使用 filesystem 缓存，可以大幅提升二次构建速度。

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.webpack-cache'),
    buildDependencies: {
      config: [__filename]
    }
  },
  // Babel 缓存
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      }
    ]
  }
};
```

---

## 11. Webpack 如何配置代码分割？

**答案：**

使用 optimization.splitChunks 配置代码分割，提取公共代码。

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'initial',
          priority: 0
        }
      }
    }
  }
};
```

---

## 12. Webpack 如何配置 Tree Shaking？

**答案：**

Tree Shaking 通过标记未使用的代码，在打包时移除。

```javascript
// webpack.config.js
module.exports = {
  mode: 'production',  // 生产环境自动开启
  optimization: {
    usedExports: true,
    sideEffects: false
  }
};

// package.json
{
  "sideEffects": false  // 或指定有副作用的文件
}
```

---

## 13. Webpack 如何配置 Source Map？

**答案：**

配置 devtool 选项，生产环境推荐 source-map。

```javascript
// webpack.config.js
module.exports = {
  // 开发环境
  devtool: 'eval-cheap-module-source-map',

  // 生产环境
  devtool: 'source-map'
};
```

---

## 14. Webpack 如何配置动态导入和懒加载？

**答案：**

使用 import() 语法实现动态导入和懒加载。

```javascript
// 路由懒加载
const Home = lazy(() => import('./Home'));
const About = lazy(() => import('./About'));

// 组件懒加载
const LazyComponent = lazy(() => import('./LazyComponent'));

// 动态导入
const loadModule = async () => {
  const module = await import('./module.js');
  module.default();
};
```

---

## 15. Webpack 有哪些性能优化策略？

**答案：**

Webpack 性能优化策略包括：

1. **构建速度优化**：
   - 开启持久化缓存
   - 使用多线程
   - 减少构建范围（exclude/include）
   - 使用 DLL 预编译

2. **打包体积优化**：
   - 代码分割
   - Tree Shaking
   - 压缩代码
   - 使用 externals 和 CDN

3. **加载性能优化**：
   - 懒加载
   - 预加载/预取
   - 资源压缩
   - 开启 Gzip/Brotli

4. **开发体验优化**：
   - 热更新
   - Source Map
   - 构建分析（webpack-bundle-analyzer）