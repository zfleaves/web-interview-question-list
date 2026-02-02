# 28. Vue3 的 shallowRef 如何使用？

**答案：**

```javascript
import { shallowRef, triggerRef } from 'vue';

const state = shallowRef({
  count: 0,
  nested: { value: 1 }
});

// ✅ 只有 .value 的赋值是响应式的
state.value = { count: 1, nested: { value: 2 } };

// ❌ 深层修改不是响应式的
state.value.count++;  // 不会触发更新
state.value.nested.value++;  // 不会触发更新

// ✅ 手动触发更新
triggerRef(state);
```

---