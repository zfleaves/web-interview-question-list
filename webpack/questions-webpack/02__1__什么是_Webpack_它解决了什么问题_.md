## 1. 什么是 Webpack？它解决了什么问题？

**答案：**

### Webpack 简介

Webpack 是一个现代 JavaScript 应用程序的静态模块打包器。它将项目中的各种资源（JavaScript、CSS、图片等）视为模块，通过加载器和插件将这些模块打包成浏览器可执行的文件。

### Webpack 解决的问题

1. **模块化开发**
   - 支持 ES Modules、CommonJS、AMD 等模块化标准
   - 自动处理模块之间的依赖关系

2. **代码转换**
   - 将 TypeScript 转换为 JavaScript
   - 将 SCSS/Less 转换为 CSS
   - 将 JSX 转换为 JavaScript

3. **资源优化**
   - 代码压缩和混淆
   - 图片压缩
   - Tree Shaking（移除未使用的代码）

4. **代码分割**
   - 按需加载
   - 提取公共代码

5. **开发体验**
   - 热模块替换（HMR）
   - 开发服务器
   - Source Map

### Webpack 核心概念

#### 1. Entry（入口）

```javascript
// 单入口
module.exports = {
  entry: './src/index.js'
};

// 多入口
module.exports = {
  entry: {
    app: './src/app.js',
    vendor: './src/vendor.js'
  }
};
```

#### 2. Output（输出）

```javascript
module.exports = {
  output: {
    filename: '[name].[contenthash:8].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  }
};
```

#### 3. Loader（加载器）

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};
```

#### 4. Plugin（插件）

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
};
```

#### 5. Mode（模式）

```javascript
module.exports = {
  mode: 'production' // 或 'development'
};
```

### Webpack 构建流程

```
1. 初始化参数
   - 读取配置文件
   - 合并参数

2. 开始编译
   - 创建 Compiler 对象
   - 加载插件

3. 确定入口
   - 找到入口文件

4. 编译模块
   - 从入口开始递归解析依赖
   - 使用 Loader 转换模块

5. 完成模块编译
   - 生成模块依赖图

6. 输出资源
   - 组装成 Chunk
   - 转换成文件

7. 输出完成
   - 写入文件系统
```

---