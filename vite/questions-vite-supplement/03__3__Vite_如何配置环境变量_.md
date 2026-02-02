# 3. Vite 如何配置环境变量？

**答案：**

```javascript
// vite.config.js
export default defineConfig({
  envPrefix: 'VITE_',  // 环境变量前缀，默认为 VITE_
  envDir: './env',     // 环境变量目录，默认为项目根目录
});
```

---