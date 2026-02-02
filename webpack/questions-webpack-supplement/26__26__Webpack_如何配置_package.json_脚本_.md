# 26. Webpack 如何配置 package.json 脚本？

**答案：**

```json
{
  "scripts": {
    "dev": "webpack serve --config webpack.dev.js",
    "build": "webpack --config webpack.prod.js",
    "build:staging": "webpack --config webpack.staging.js"
  }
}
```

---