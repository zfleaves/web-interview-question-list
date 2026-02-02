# 3. Webpack 如何在代码中使用环境变量？

**答案：**

```javascript
// 使用 DefinePlugin 定义的环境变量
if (process.env.NODE_ENV === 'production') {
  console.log('Production mode');
}

const apiUrl = process.env.API_URL;
```

---