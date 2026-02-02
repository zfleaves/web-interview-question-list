# 1. Vite 如何配置环境变量文件？

**答案：**

Vite 使用 `.env` 文件来管理环境变量，支持不同环境的配置。

```bash
# .env - 所有环境
VITE_APP_TITLE=My App

# .env.development - 开发环境
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_MODE=development

# .env.production - 生产环境
VITE_API_BASE_URL=https://api.example.com
VITE_APP_MODE=production

# .env.staging - 预发布环境
VITE_API_BASE_URL=https://staging-api.example.com
VITE_APP_MODE=staging
```

---