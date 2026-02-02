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