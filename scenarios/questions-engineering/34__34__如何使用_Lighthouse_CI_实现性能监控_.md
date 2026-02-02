# 34. 如何使用 Lighthouse CI 实现性能监控？

**答案：**

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  push:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
          uploadArtifacts: true
          temporaryPublicStorage: true
```

---

## 总结

以上补充了前端工程化的高频面试题，涵盖了：

1. **项目初始化** - 使用 Vite 创建项目
2. **目录结构设计** - 企业级项目结构
3. **项目配置** - Vite 和 TypeScript 配置
4. **代码规范** - ESLint 和 Prettier 配置
5. **Git 规范** - Husky 和 lint-staged 配置
6. **组件库结构** - Monorepo 组件库设计
7. **组件开发** - Vue 3 组件开发
8. **组件导出** - 组件导出方式
9. **主题系统** - 组件库主题配置
10. **文档生成** - VitePress 文档配置
11. **单元测试** - Vitest 单元测试
12. **组件测试** - Vue 组件测试
13. **E2E 测试** - Playwright 端到端测试
14. **GitHub Actions** - CI/CD 配置
15. **Docker 部署** - 容器化部署
16. **Kubernetes 部署** - K8s 部署配置
17. **ESLint** - 代码质量检查
18. **Prettier** - 代码格式化
19. **SonarQube** - 代码质量分析
20. **Codecov** - 代码覆盖率分析
21. **pnpm workspace** - Monorepo 管理
22. **Turborepo** - Monorepo 构建优化
23. **Changesets** - Monorepo 版本管理
24. **qiankun** - 微前端实现
25. **Module Federation** - 微前端实现
26. **single-spa** - 微前端实现
27. **VitePress** - 文档自动化
28. **Storybook** - 组件文档
29. **Sentry** - 错误监控
30. **Google Analytics** - 用户行为分析
31. **自定义日志** - 日志系统实现
32. **Web Vitals** - 性能指标监控
33. **Performance API** - 性能数据采集
34. **Lighthouse CI** - 性能测试自动化

这些题目补充了前端工程化的高级实践，能够更全面地考察候选人的工程化能力。