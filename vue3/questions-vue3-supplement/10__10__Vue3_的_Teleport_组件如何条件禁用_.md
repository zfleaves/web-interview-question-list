# 10. Vue3 的 Teleport 组件如何条件禁用？

**答案：**

```vue
<template>
  <Teleport to="body" :disabled="isInline">
    <div class="modal">Modal Content</div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';

const isInline = ref(false);
</script>
```

---