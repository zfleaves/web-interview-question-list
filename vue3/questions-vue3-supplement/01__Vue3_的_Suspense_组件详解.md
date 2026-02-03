# Vue3 的 Suspense 组件详解

**答案：**

## Suspense 简介

Suspense 是 Vue3 的一个内置组件，用于处理异步组件的加载状态，可以在异步组件加载完成前显示加载状态。

## 基本用法

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';

const AsyncComponent = defineAsyncComponent(() =>
  import('./AsyncComponent.vue')
);
</script>
```

## 高级配置

```vue
<script setup>
import { defineAsyncComponent } from 'vue';

const AsyncComponent = defineAsyncComponent({
  loader: () => import('./AsyncComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorComponent,
  delay: 200,      // 延迟显示 loading
  timeout: 3000,   // 超时时间
  suspensible: true
});
</script>
```

## 嵌套使用

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

## 错误处理

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

## 注意事项

1. **Suspense 只能在 setup 函数或 `<script setup>` 中使用**
2. **异步组件必须返回一个 Promise**
3. **Suspense 会等待所有异步依赖加载完成**

---