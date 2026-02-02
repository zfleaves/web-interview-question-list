# 37. Vue3 的 markRaw 如何使用？

**答案：**

```javascript
import { reactive, markRaw } from 'vue';

const obj = markRaw({
  count: 0,
  nested: { value: 1 }
});

const state = reactive({
  obj
});

// ❌ obj 不会被代理
state.obj.count++;  // 不会触发更新
state.obj.nested.value++;  // 不会触发更新
```

---