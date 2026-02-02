# 10. Vite 多页面应用如何配置 HTML 文件？

**答案：**

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Home</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>

<!-- about.html -->
<!DOCTYPE html>
<html>
<head>
  <title>About</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/about.js"></script>
</body>
</html>
```

---