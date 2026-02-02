# 32. Vue3 的 effectScope 如何使用？

**答案：**

```javascript
import { effectScope, reactive, watchEffect } from 'vue';

const scope = effectScope();

scope.run(() => {
  const state = reactive({ count: 0 });

  watchEffect(() => {
    console.log(state.count);
  });
});

// 停止作用域内的所有 effect
scope.stop();
```

---