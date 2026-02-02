# 21. 如何使用 pnpm workspace 管理 monorepo？

**答案：**

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

```json
// package.json
{
  "name": "my-monorepo",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter './packages/*' dev",
    "build": "pnpm --filter './packages/*' build",
    "test": "pnpm --filter './packages/*' test"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

---