# 19. 如何使用 SonarQube 进行代码质量分析？

**答案：**

```yaml
# .github/workflows/sonarqube.yml
name: SonarQube Scan

on:
  push:
    branches: [main]

jobs:
  sonarqube:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: SonarQube Scan
        uses: sonarsource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

---