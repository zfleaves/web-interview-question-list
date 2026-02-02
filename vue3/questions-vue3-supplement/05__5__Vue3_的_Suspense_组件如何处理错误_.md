# 5. Vue3 的 Suspense 组件如何处理错误？

**答案：**

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <Loading />
    </template>
  </Suspense>
</template>

<script setup>
import { onErrorCaptured } from 'vue';
import { ref } from 'vue';

const error = ref(null);

onErrorCaptured((err) => {
  error.value = err;
  // 返回 false 阻止错误向上传播
  return false;
});
</script>
```

---