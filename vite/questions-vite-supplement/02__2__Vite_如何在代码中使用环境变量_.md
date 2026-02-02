# 2. Vite 如何在代码中使用环境变量？

**答案：**

```javascript
// 在代码中使用
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const appMode = import.meta.env.VITE_APP_MODE;

// 在 HTML 中使用
<script>
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
</script>
```

---