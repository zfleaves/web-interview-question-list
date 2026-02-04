# 12. Webpack 如何配置 Tree Shaking？

**答案：**

Tree Shaking 通过标记未使用的代码，在打包时移除。

```javascript
// webpack.config.js
module.exports = {
  mode: 'production',  // 生产环境自动开启
  optimization: {
    usedExports: true,
    sideEffects: false
  }
};

// package.json
{
  "sideEffects": false  // 或指定有副作用的文件
}
```

---