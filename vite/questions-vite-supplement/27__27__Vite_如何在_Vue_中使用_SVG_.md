# 27. Vite 如何在 Vue 中使用 SVG？

**答案：**

```vue
<!-- App.vue -->
<template>
  <div>
    <Logo class="logo" />
  </div>
</template>

<script setup>
import Logo from './logo.svg?component';
</script>

<style scoped>
.logo {
  width: 100px;
  height: 100px;
}
</style>
```

---