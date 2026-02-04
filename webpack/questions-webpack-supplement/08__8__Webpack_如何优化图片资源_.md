# 8. Webpack 如何优化图片资源？

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