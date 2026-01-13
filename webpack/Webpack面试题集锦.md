# Webpack 面试题集锦

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

## 3. Webpack 的构建流程是什么？

**答案：**

### Webpack 构建流程详解

```
1. 初始化参数
   ├── 读取配置文件（webpack.config.js）
   ├── 合并命令行参数
   └── 创建 Compiler 对象

2. 开始编译
   ├── 触发 run 钩子
   └── 开始编译流程

3. 确定入口
   ├── 根据 entry 配置找到入口文件
   └── 创建 Compilation 对象

4. 编译模块
   ├── 从入口文件开始
   ├── 使用 Loader 转换模块
   ├── 解析模块依赖
   └── 递归处理所有依赖

5. 完成模块编译
   ├── 生成模块依赖图
   └── 生成模块 AST

6. 输出资源
   ├── 根据依赖图组装 Chunk
   ├── 转换 Chunk 为文件
   └── 优化输出（Tree Shaking、压缩等）

7. 输出完成
   ├── 写入文件系统
   └── 触发 done 钩子
```

### 关键钩子

```javascript
class MyPlugin {
  apply(compiler) {
    // 1. 初始化阶段
    compiler.hooks.environment.tap('MyPlugin', () => {
      console.log('环境初始化');
    });

    compiler.hooks.afterEnvironment.tap('MyPlugin', () => {
      console.log('环境初始化完成');
    });

    compiler.hooks.entryOption.tap('MyPlugin', (context, entry) => {
      console.log('入口配置', entry);
    });

    // 2. 编译阶段
    compiler.hooks.compile.tap('MyPlugin', (params) => {
      console.log('开始编译');
    });

    compiler.hooks.make.tapAsync('MyPlugin', (compilation, callback) => {
      console.log('开始构建');
      callback();
    });

    compiler.hooks.afterCompile.tapAsync('MyPlugin', (compilation, callback) => {
      console.log('编译完成');
      callback();
    });

    // 3. 输出阶段
    compiler.hooks.emit.tapAsync('MyPlugin', (compilation, callback) => {
      console.log('生成资源');
      callback();
    });

    compiler.hooks.afterEmit.tapAsync('MyPlugin', (compilation, callback) => {
      console.log('资源生成完成');
      callback();
    });

    // 4. 完成阶段
    compiler.hooks.done.tap('MyPlugin', (stats) => {
      console.log('构建完成', stats.toJson());
    });
  }
}
```

### 构建流程示例

```javascript
// webpack.config.js
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin()
  ]
};
```

```
构建流程：

1. 读取配置文件
   - entry: './src/index.js'
   - output: { filename: 'bundle.js', path: 'dist' }
   - module: { rules: [...] }
   - plugins: [HtmlWebpackPlugin]

2. 创建 Compiler 对象
   - 包含所有配置信息
   - 注册所有插件

3. 开始编译
   - 创建 Compilation 对象
   - 找到入口文件 './src/index.js'

4. 编译模块
   - 读取 './src/index.js'
   - 使用 babel-loader 转换
   - 解析依赖（如 import './app.js'）
   - 递归处理所有依赖

5. 完成模块编译
   - 生成模块依赖图
   - index.js -> app.js -> utils.js

6. 输出资源
   - 组装 Chunk
   - 生成 bundle.js
   - 生成 index.html

7. 输出完成
   - 写入文件系统
   - dist/bundle.js
   - dist/index.html
```

### 构建性能优化

```javascript
module.exports = {
  // 1. 减少构建范围
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),  // 只处理 src 目录
        exclude: /node_modules/,                  // 排除 node_modules
        use: 'babel-loader'
      }
    ]
  },

  // 2. 开启缓存
  cache: {
    type: 'filesystem'  // 文件系统缓存
  },

  // 3. 多进程构建
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'thread-loader'  // 多进程处理
      }
    ]
  },

  // 4. 开启持久化缓存（Webpack 5）
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.temp_cache')
  }
};
```

---

## 4. 什么是 Tree Shaking？它是如何工作的？

**答案：**

### Tree Shaking 简介

Tree Shaking 是一种通过静态分析消除无用代码的技术，它会在打包时移除未被使用的代码，从而减小打包体积。

### Tree Shaking 原理

```
1. 静态分析
   - 分析模块的导入和导出
   - 标记被使用的导出

2. 标记
   - 标记被使用的代码
   - 标记未被使用的代码

3. 清除
   - 移除未被使用的代码
```

### Tree Shaking 示例

```javascript
// utils.js
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

export function multiply(a, b) {
  return a * b;
}

// index.js
import { add } from './utils';

console.log(add(1, 2));

// 打包后：只包含 add 函数
// subtract 和 multiply 函数被移除
```

### Tree Shaking 的要求

1. **使用 ES Modules**
   - 必须使用 `import` 和 `export`
   - 不能使用 `require` 和 `module.exports`

2. **代码必须是静态的**
   - 不能动态导入
   - 不能使用 `eval`

3. **生产模式**
   - 只有在生产模式下才会生效
   - 开发模式下会保留所有代码

### Tree Shaking 配置

```javascript
module.exports = {
  mode: 'production',  // 生产模式自动开启 Tree Shaking

  optimization: {
    usedExports: true,  // 标记未使用的导出
    sideEffects: false, // 告诉 Webpack 没有副作用
    minimize: true      // 压缩代码
  }
};
```

### sideEffects 配置

```javascript
// package.json
{
  "sideEffects": false  // 所有文件都没有副作用
}

// 或者指定有副作用的文件
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfill.js"
  ]
}
```

**副作用：** 指模块在被导入时会执行的代码，如修改全局变量、注册事件监听器等。

### Tree Shaking 与 CSS

```javascript
// CSS Tree Shaking
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          },
          'postcss-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css'
    })
  ],
  optimization: {
    minimizer: [
      new CssMinimizerPlugin()  // 压缩 CSS，移除未使用的样式
    ]
  }
};
```

### Tree Shaking 的局限性

1. **动态导入**
   ```javascript
   // 无法 Tree Shaking
   const module = require('./module');
   ```

2. **对象属性访问**
   ```javascript
   // 无法 Tree Shaking
   import * as utils from './utils';
   utils.add(1, 2);
   ```

3. **有副作用的代码**
   ```javascript
   // 无法 Tree Shaking
   console.log('This is a side effect');
   export function add(a, b) {
     return a + b;
   }
   ```

### 最佳实践

1. **使用 ES Modules**
   ```javascript
   // 推荐
   import { add } from './utils';

   // 不推荐
   const utils = require('./utils');
   ```

2. **按需导入**
   ```javascript
   // 推荐
   import { Button } from 'antd';

   // 不推荐
   import antd from 'antd';
   ```

3. **配置 sideEffects**
   ```json
   {
     "sideEffects": [
       "*.css",
       "*.scss"
     ]
   }
   ```

---

## 5. 什么是代码分割（Code Splitting）？如何实现？

**答案：**

### 代码分割简介

代码分割是将代码拆分成多个小块，按需加载，从而减少初始加载时间，提高性能。

### 代码分割的方式

#### 1. 入口起点（Entry Points）

```javascript
module.exports = {
  entry: {
    app: './src/app.js',
    vendor: './src/vendor.js'
  }
};

// 生成 app.js 和 vendor.js
```

#### 2. 动态导入（Dynamic Import）

```javascript
// 普通导入（同步）
import { add } from './utils';

// 动态导入（异步）
import('./utils').then(utils => {
  console.log(utils.add(1, 2));
});

// 使用 async/await
async function loadUtils() {
  const utils = await import('./utils');
  console.log(utils.add(1, 2));
}
```

#### 3. SplitChunksPlugin

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',  // 对所有模块进行分割
      minSize: 30000,  // 最小 30KB
      maxSize: 0,  // 无最大限制
      minChunks: 1,  // 最少被引用 1 次
      maxAsyncRequests: 5,  // 最大异步请求数
      maxInitialRequests: 3,  // 最大初始请求数
      automaticNameDelimiter: '~',  // 名称分隔符
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,  // 优先级
          name: 'vendors'
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```

### 代码分割示例

#### 1. 路由懒加载

```javascript
// React Router
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

#### 2. 组件懒加载

```javascript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

#### 3. 条件加载

```javascript
// 根据条件加载模块
async function loadFeature() {
  if (isMobile) {
    const MobileFeature = await import('./MobileFeature');
    MobileFeature.init();
  } else {
    const DesktopFeature = await import('./DesktopFeature');
    DesktopFeature.init();
  }
}
```

### 代码分割优化

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 提取 React 和 Vue
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all'
        },
        // 提取 Vue
        vue: {
          test: /[\\/]node_modules[\\/](vue|vue-router|vuex)[\\/]/,
          name: 'vue',
          chunks: 'all'
        },
        // 提取第三方库
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: -10
        },
        // 提取公共代码
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

### 代码分割的好处

1. **减少初始加载时间**
   - 只加载必要的代码
   - 按需加载其他代码

2. **提高缓存利用率**
   - 第三方库单独打包，不易变化
   - 业务代码单独打包，频繁更新

3. **提高性能**
   - 减少网络请求
   - 提高加载速度

### 预加载和预取

```javascript
// 预加载（Preload）
// 在当前页面加载完成后立即加载
import(
  /* webpackChunkName: "heavy" */
  /* webpackPreload: true */
  './HeavyComponent'
);

// 预取（Prefetch）
// 在浏览器空闲时加载
import(
  /* webpackChunkName: "heavy" */
  /* webpackPrefetch: true */
  './HeavyComponent'
);
```

---

## 6. 什么是 Source Map？如何配置？

**答案：**

### Source Map 简介

Source Map 是一个映射关系，将打包后的代码映射到源代码，便于调试和错误定位。

### Source Map 类型

| 类型 | 说明 | 构建速度 | 适用场景 |
|------|------|----------|----------|
| eval | 每个模块都封装在 eval 中，不生成 Source Map | 最快 | 开发环境 |
| cheap-source-map | 不包含列信息，不包含 loader 的 Source Map | 快 | 开发环境 |
| cheap-module-source-map | 不包含列信息，包含 loader 的 Source Map | 中等 | 开发环境 |
| source-map | 生成完整的 Source Map 文件 | 慢 | 生产环境 |
| inline-source-map | Source Map 内联在打包文件中 | 慢 | 开发环境 |
| hidden-source-map | 生成 Source Map 文件，但不引用 | 慢 | 生产环境 |
| nosources-source-map | 生成 Source Map 文件，但不包含源代码 | 慢 | 生产环境 |

### Source Map 配置

```javascript
module.exports = {
  // 开发环境
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',

  // 生产环境
  mode: 'production',
  devtool: 'source-map'
};
```

### Source Map 最佳实践

```javascript
// 开发环境
module.exports = {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map'  // 快速，包含 loader 的 Source Map
};

// 生产环境
module.exports = {
  mode: 'production',
  devtool: 'source-map'  // 完整的 Source Map
};
```

### Source Map 安全性

```javascript
// 生产环境使用 hidden-source-map
module.exports = {
  mode: 'production',
  devtool: 'hidden-source-map',  // 生成 Source Map 但不引用
  plugins: [
    new SourceMapDevToolPlugin({
      filename: '[file].map',
      exclude: [/vendor\.js/]  // 排除第三方库
    })
  ]
};
```

### Source Map 使用

```javascript
// 在浏览器开发者工具中启用 Source Map
// Chrome DevTools -> Settings -> Enable JavaScript source maps
// Chrome DevTools -> Settings -> Enable CSS source maps
```

---

## 7. 什么是热模块替换（HMR）？它是如何工作的？

**答案：**

### HMR 简介

热模块替换（Hot Module Replacement）是 Webpack 提供的一种功能，可以在不刷新页面的情况下更新模块。

### HMR 的好处

1. **保留应用状态**
   - 不刷新页面
   - 保留当前的应用状态

2. **提高开发效率**
   - 实时预览修改
   - 减少等待时间

3. **提升开发体验**
   - 实时反馈
   - 快速迭代

### HMR 工作原理

```
1. 文件变化
   ├── Webpack 监听文件变化
   └── 重新编译变化的模块

2. 生成更新
   ├── 生成新的模块代码
   └── 生成更新清单（Manifest）

3. 通知客户端
   ├── 通过 WebSocket 发送更新通知
   └── 发送更新清单

4. 客户端接收更新
   ├── 接收更新通知
   └── 请求更新的模块

5. 替换模块
   ├── 使用新的模块替换旧模块
   └── 执行模块的 HMR 代码

6. 更新界面
   ├── 更新 DOM
   └── 保留应用状态
```

### HMR 配置

```javascript
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  devServer: {
    hot: true,  // 启用 HMR
    open: true  // 自动打开浏览器
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()  // HMR 插件
  ]
};
```

### HMR API

```javascript
// 检测模块是否支持 HMR
if (module.hot) {
  // 接受当前模块的更新
  module.hot.accept();

  // 接受依赖模块的更新
  module.hot.accept('./dependency', () => {
    // 依赖模块更新后的回调
    console.log('Dependency updated');
  });

  // 处理更新错误
  module.hot.dispose(() => {
    // 清理工作
    console.log('Module disposed');
  });
}
```

### React HMR

```javascript
// React Fast Refresh
// 安装：npm install @pmmmwh/react-refresh-webpack-plugin react-refresh

const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = {
  mode: 'development',
  devServer: {
    hot: true
  },
  plugins: [
    new ReactRefreshWebpackPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: ['react-refresh/babel']
          }
        }
      }
    ]
  }
};
```

### Vue HMR

```javascript
// Vue Loader 默认支持 HMR
module.exports = {
  mode: 'development',
  devServer: {
    hot: true
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  }
};
```

### HMR 注意事项

1. **CSS HMR**
   ```javascript
   // CSS 默认支持 HMR
   module.exports = {
     module: {
       rules: [
         {
           test: /\.css$/,
           use: [
             'style-loader',  // 支持 HMR
             'css-loader'
           ]
         }
       ]
     }
   };
   ```

2. **生产环境不启用 HMR**
   ```javascript
   module.exports = {
     mode: 'production',  // 生产环境不启用 HMR
     devServer: {
       hot: false
     }
   };
   ```

---

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

## 总结

Webpack 是前端工程化的重要工具，掌握 Webpack 的配置和优化对于提高开发效率和项目性能至关重要。通过合理配置 Loader 和 Plugin，优化构建速度和打包体积，可以显著提升项目的整体性能。

建议深入学习 Webpack 的原理和最佳实践，这样才能在实际项目中灵活运用，解决各种构建问题。