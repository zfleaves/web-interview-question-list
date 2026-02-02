# 29. Vue3 的 shallowReactive 如何使用？

**答案：**

```javascript
import { shallowReactive, trigger } from 'vue';

const state = shallowReactive({
  count: 0,
  nested: { value: 1 }
});

// ✅ 只有顶层属性的赋值是响应式的
state.count++;  // 会触发更新
state.count = 1;  // 会触发更新

// ❌ 深层修改不是响应式的
state.nested.value++;  // 不会触发更新
```

---