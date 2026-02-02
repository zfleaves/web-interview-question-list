# 2. Webpack 如何使用环境变量？

**答案：**

```javascript
// package.json
{
  "scripts": {
    "build": "webpack --env NODE_ENV=production",
    "build:dev": "webpack --env NODE_ENV=development",
    "build:staging": "webpack --env NODE_ENV=staging --env API_URL=https://staging-api.example.com"
  }
}
```

---