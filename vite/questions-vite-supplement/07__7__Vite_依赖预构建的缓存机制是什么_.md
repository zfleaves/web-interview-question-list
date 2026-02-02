# 7. Vite 依赖预构建的缓存机制是什么？

**答案：**

```javascript
// Vite 会将预构建的依赖缓存到 node_modules/.vite 目录
// 当依赖变化时，会自动重新预构建

// 手动清除缓存
rm -rf node_modules/.vite

// 或者使用 --force 参数
vite dev --force
```

---