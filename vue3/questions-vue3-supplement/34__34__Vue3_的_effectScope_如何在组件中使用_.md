# 34. Vue3 的 effectScope 如何在组件中使用？

**答案：**

```javascript
import { effectScope, onScopeDispose, ref, watchEffect } from 'vue';

export function useMouse() {
  const scope = effectScope();

  const x = ref(0);
  const y = ref(0);

  scope.run(() => {
    watchEffect(() => {
      console.log(`Mouse at ${x.value}, ${y.value}`);
    });
  });

  // 组件卸载时停止作用域
  onScopeDispose(() => {
    scope.stop();
  });

  return { x, y };
}
```

---