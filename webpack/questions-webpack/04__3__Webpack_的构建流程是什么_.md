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