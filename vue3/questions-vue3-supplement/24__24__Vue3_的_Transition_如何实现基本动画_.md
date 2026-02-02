# 24. Vue3 的 Transition 如何实现基本动画？

**答案：**

```vue
<template>
  <Transition name="fade">
    <div v-if="show">Content</div>
  </Transition>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

---