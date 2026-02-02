## 2. Loader 和 Plugin 的区别是什么？

**答案：**

### Loader

**简介：**

Loader 是文件转换器，用于将非 JavaScript 文件转换为 Webpack 能够处理的模块。

**特点：**

- 只负责文件转换
- 在 module.rules 中配置
- 从右到左、从下到上执行
- 返回转换后的代码

**常用 Loader：**

```javascript
module.exports = {
  module: {
    rules: [
      // Babel：ES6+ 转 ES5
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },

      // CSS：处理 CSS 文件
      {
        test: /\.css$/,
        use: [
          'style-loader',    // 将 CSS 注入到 DOM
          'css-loader',      // 解析 CSS 文件
          'postcss-loader'   // 自动添加浏览器前缀
        ]
      },

      // 图片：处理图片文件
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024 // 小于 8KB 转为 base64
          }
        }
      },

      // Vue：处理 Vue 文件
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  }
};
```

**自定义 Loader：**

```javascript
// my-loader.js
module.exports = function(source) {
  // 处理源代码
  const result = source.replace(/console\.log\((.*?)\)/g, '');
  return result;
};

// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: path.resolve(__dirname, 'my-loader.js')
      }
    ]
  }
};
```

### Plugin

**简介：**

Plugin 是扩展器，用于扩展 Webpack 的功能，在构建流程的特定时机执行自定义逻辑。

**特点：**

- 可以访问 Webpack 的整个构建流程
- 在 plugins 中配置
- 通过钩子（Hook）机制工作
- 可以修改构建结果

**常用 Plugin：**

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  plugins: [
    // 生成 HTML 文件
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: true
      }
    }),

    // 提取 CSS 到单独文件
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css'
    }),

    // 清理输出目录
    new CleanWebpackPlugin(),

    // 复制静态资源
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          to: 'public'
        }
      ]
    })
  ]
};
```

**自定义 Plugin：**

```javascript
// my-plugin.js
class MyPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    // 监听编译完成事件
    compiler.hooks.done.tap('MyPlugin', (stats) => {
      console.log('编译完成！');
      console.log(stats.toJson());
    });

    // 监听 emit 事件（生成资源到输出目录之前）
    compiler.hooks.emit.tapAsync('MyPlugin', (compilation, callback) => {
      // 添加自定义资源
      compilation.assets['custom.txt'] = {
        source: () => 'Hello Webpack',
        size: () => 14
      };
      callback();
    });
  }
}

module.exports = MyPlugin;

// webpack.config.js
const MyPlugin = require('./my-plugin');

module.exports = {
  plugins: [
    new MyPlugin({
      name: 'my-plugin'
    })
  ]
};
```

### Loader vs Plugin

| 特性 | Loader | Plugin |
|------|--------|--------|
| 作用 | 文件转换 | 扩展功能 |
| 配置位置 | module.rules | plugins |
| 执行时机 | 编译阶段 | 整个构建流程 |
| 返回值 | 转换后的代码 | 可以不返回 |
| 访问范围 | 只能访问当前文件 | 可以访问整个构建流程 |

### 执行顺序

**Loader 执行顺序：**

```javascript
{
  test: /\.css$/,
  use: [
    'style-loader',    // 3. 最后执行
    'css-loader',      // 2. 中间执行
    'postcss-loader'   // 1. 最先执行
  ]
}
```

**Plugin 执行顺序：**

```javascript
plugins: [
  new Plugin1(),  // 先执行
  new Plugin2()   // 后执行
]
```

---