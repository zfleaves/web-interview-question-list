# 15. Vue3 的 provide 和 inject 如何使用 readonly？

**答案：**

```javascript
import { provide, ref, readonly } from 'vue';

export default {
  setup() {
    const state = ref({
      count: 0,
      name: 'John'
    });

    // 提供只读数据
    provide('state', readonly(state));

    // 提供修改方法
    provide('setState', (newState) => {
      state.value = { ...state.value, ...newState };
    });
  }
};
```

---