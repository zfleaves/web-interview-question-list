# 3. Vue3 的 Suspense 组件如何进行高级配置？

**答案：**

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

---