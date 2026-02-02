# 8. Vue3 的 Teleport 组件如何使用？

**答案：**

### 基本用法

```vue
<template>
  <div>
    <h3>Inside Component</h3>
    <Teleport to="body">
      <div class="modal">Modal Content</div>
    </Teleport>
  </div>
</template>
```

---