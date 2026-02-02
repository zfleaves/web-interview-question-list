# 21. Vite 如何使用 CSS Modules？

**答案：**

```vue
<!-- App.vue -->
<template>
  <div :class="$style.container">
    <p :class="$style.title">Hello World</p>
  </div>
</template>

<style module>
.container {
  padding: 20px;
  background: #f0f0f0;
}

.title {
  font-size: 24px;
  color: #333;
}
</style>
```

---