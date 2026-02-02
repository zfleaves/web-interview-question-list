# 33. Webpack 如何使用 image-minimizer-webpack-plugin？

**答案：**

```javascript
// 安装
npm install image-minimizer-webpack-plugin imagemin -D

// webpack.config.js
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|svg|webp)$/,
        type: 'asset',
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
                    [
                      'svgo',
                      {
                        plugins: [
                          {
                            name: 'preset-default',
                            params: {
                              overrides: {
                                removeViewBox: false
                              }
                            }
                          }
                        ]
                      }
                    ]
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

---