# 6. Webpack 如何配置 CSS Modules？

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