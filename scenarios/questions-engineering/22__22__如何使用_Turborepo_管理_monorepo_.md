# 22. 如何使用 Turborepo 管理 monorepo？

**答案：**

```bash
# 安装 Turborepo
pnpm add -D turbo

# 初始化
npx turbo init
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {}
  }
}
```

---