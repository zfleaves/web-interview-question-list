# 20. 如何使用 Codecov 进行代码覆盖率分析？

**答案：**

```yaml
# .github/workflows/codecov.yml
name: Codecov

on:
  push:
    branches: [main]

jobs:
  codecov:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup pnpm
        uses: pnpm/action-setup@v2

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Test with coverage
        run: pnpm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
```

---