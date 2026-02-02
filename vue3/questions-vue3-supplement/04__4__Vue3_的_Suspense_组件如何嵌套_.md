# 4. Vue3 的 Suspense 组件如何嵌套？

**答案：**

```vue
<template>
  <Suspense>
    <template #default>
      <ParentComponent />
    </template>
    <template #fallback>
      <div>Loading parent...</div>
    </template>
  </Suspense>
</template>

<script setup>
import ParentComponent from './ParentComponent.vue';
</script>

<!-- ParentComponent.vue -->
<template>
  <div>
    <h2>Parent</h2>
    <Suspense>
      <template #default>
        <ChildComponent />
      </template>
      <template #fallback>
        <div>Loading child...</div>
      </template>
    </Suspense>
  </div>
</template>
```

---