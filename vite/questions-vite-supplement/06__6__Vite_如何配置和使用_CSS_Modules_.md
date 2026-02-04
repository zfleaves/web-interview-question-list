# 6. Vite 如何配置和使用 CSS Modules？

**答案：**

```javascript
// vite.config.js
export default {
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]__[hash:base64:5]'
    }
  }
};
```

```vue
<template>
  <div :class="$style.container">
    <p :class="$style.title">Hello</p>
  </div>
</template>

<style module>
.container { padding: 20px; }
.title { font-size: 24px; }
</style>
```

```typescript
// TypeScript 支持
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
```

---