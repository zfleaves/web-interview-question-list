# 20. Vite 如何配置 CSS Modules？

**答案：**

### CSS Modules 配置

```javascript
// vite.config.js
export default {
  css: {
    modules: {
      localsConvention: 'camelCase',  // 命名约定
      scopeBehaviour: 'local',        // 作用域行为
      generateScopedName: '[name]__[local]__[hash:base64:5]'
    }
  }
};
```

---