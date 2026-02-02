## 9. 如何优化 Webpack 打包体积？

**答案：**

### 打包体积优化方案

#### 1. Tree Shaking

```javascript
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true,
    sideEffects: false
  }
};
```

#### 2. 代码分割

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: -10
        },
        common: {
          name: 'common',
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```

#### 3. 压缩代码

```javascript
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: true  // 移除 console
          }
        }
      }),
      new CssMinimizerPlugin()
    ]
  }
};
```

#### 4. 压缩图片

```javascript
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024  // 小于 8KB 转为 base64
          }
        },
        use: [
          {
            loader: ImageMinimizerPlugin.loader,
            options: {
              minimizer: {
                implementation: ImageMinimizerPlugin.imageminMinify,
                options: {
                  plugins: [
                    ['gifsicle', { interlaced: true }],
                    ['jpegtran', { progressive: true }],
                    ['optipng', { optimizationLevel: 5 }],
                    ['svgo', {
                      plugins: [
                        {
                          name: 'preset-default',
                          params: {
                            overrides: {
                              removeViewBox: false,
                              addAttributesToSVGElement: {
                                params: {
                                  attributes: [
                                    { xmlns: 'http://www.w3.org/2000/svg' }
                                  ]
                                }
                              }
                            }
                          }
                        }
                      ]
                    }]
                  ]
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

#### 5. 使用 externals

```javascript
module.exports = {
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    lodash: '_',
    axios: 'axios'
  }
};
```

#### 6. 使用 CDN

```html
<!-- index.html -->
<script src="https://cdn.jsdelivr.net/npm/react@17/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@17/umd/react-dom.production.min.js"></script>
```

```javascript
// webpack.config.js
module.exports = {
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
};
```

#### 7. 开启 Gzip 压缩

```javascript
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  plugins: [
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,  // 大于 10KB 才压缩
      minRatio: 0.8  // 压缩率小于 0.8 才压缩
    })
  ]
};
```

#### 8. 提取 CSS

```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,  // 提取 CSS
          'css-loader',
          'postcss-loader'
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

#### 9. 移除未使用的 CSS

```javascript
const PurgeCSSPlugin = require('purgecss-webpack-plugin');
const glob = require('glob');

module.exports = {
  plugins: [
    new PurgeCSSPlugin({
      paths: glob.sync(`${path.join(__dirname, 'src')}/**/*`, { nodir: true }),
      safelist: {
        standard: [/^ant-/]  // 保留 antd 的样式
      }
    })
  ]
};
```

#### 10. 使用 Scope Hoisting

```javascript
module.exports = {
  optimization: {
    concatenateModules: true  // 开启 Scope Hoisting
  }
};
```

### 打包体积分析

```javascript
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html'
    })
  ]
};
```

---