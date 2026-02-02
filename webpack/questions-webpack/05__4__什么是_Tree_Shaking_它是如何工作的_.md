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