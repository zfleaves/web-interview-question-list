# 9. Vue3 的 Teleport 组件如何传送到指定元素？

**答案：**

```vue
<template>
  <Teleport to="#modal-container">
    <div class="modal">Modal Content</div>
  </Teleport>
</template>
```

---