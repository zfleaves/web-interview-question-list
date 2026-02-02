# 36. Vue3 的 toRaw 如何使用？

**答案：**

```javascript
import { reactive, toRaw } from 'vue';

const original = { count: 0 };
const state = reactive(original);

// 获取原始对象
const raw = toRaw(state);

console.log(raw === original);  // true
console.log(raw === state);  // false
```

---