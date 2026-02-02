# 18. Vite 库模式如何配置 package.json？

**答案：**

```json
{
  "name": "my-library",
  "version": "1.0.0",
  "main": "./dist/my-library.umd.js",
  "module": "./dist/my-library.es.js",
  "types": "./dist/main.d.ts",
  "exports": {
    ".": {
      "import": "./dist/my-library.es.js",
      "require": "./dist/my-library.umd.js"
    }
  },
  "files": [
    "dist"
  ]
}
```

---