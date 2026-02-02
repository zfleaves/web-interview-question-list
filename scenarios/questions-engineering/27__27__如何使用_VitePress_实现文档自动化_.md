# 27. 如何使用 VitePress 实现文档自动化？

**答案：**

```bash
# 安装 VitePress
pnpm add -D vitepress

# 初始化
pnpm vitepress init
```

```typescript
// docs/.vitepress/config.ts
import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'My Docs',
  description: 'Documentation',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' }
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/' }
        ]
      }
    ]
  }
});
```

---