# 23. 如何使用 Changesets 管理 monorepo 版本？

**答案：**

```bash
# 安装 Changesets
pnpm add -D @changesets/cli

# 初始化
pnpm changeset init
```

```json
// .changeset/config.json
{
  "$schema": "https://unpkg.com/@changesets/config@2.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

---