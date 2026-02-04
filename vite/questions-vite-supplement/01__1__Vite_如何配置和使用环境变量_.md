# 1. Vite 如何配置和使用环境变量？

**答案：**

Vite 使用 `.env` 文件管理环境变量，只有以 `VITE_` 开头的变量才会暴露给客户端。

```bash
# .env - 所有环境
VITE_APP_TITLE=My App

# .env.development - 开发环境
VITE_API_BASE_URL=http://localhost:8080

# .env.production - 生产环境
VITE_API_BASE_URL=https://api.example.com
```

```javascript
// vite.config.js
export default defineConfig({
  envPrefix: 'VITE_',  // 环境变量前缀
  envDir: './env'      // 环境变量目录
});

// 在代码中使用
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

---