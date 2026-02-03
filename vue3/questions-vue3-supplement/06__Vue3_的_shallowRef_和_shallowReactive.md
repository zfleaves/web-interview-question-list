# Vue3 的 shallowRef 和 shallowReactive

**答案：**

## shallowRef 使用

```javascript
import { shallowRef } from 'vue';

const state = shallowRef({ count: 0 });

// 不会触发更新
state.value.count = 1;

// 会触发更新
state.value = { count: 2 };
```

## shallowReactive 使用

```javascript
import { shallowReactive } from 'vue';

const state = shallowReactive({
  nested: { count: 0 }
});

// 不会触发更新
state.nested.count = 1;

// 会触发更新
state.nested = { count: 2 };
```

## 使用场景

### 1. 大型对象性能优化

```javascript
// 对于大型对象，使用 shallow 可以避免深层响应式的性能开销
const largeData = shallowRef({
  // 数千个属性
});
```

### 2. 只关心引用变化

```javascript
// 只关心对象引用是否变化，不关心内部属性变化
const config = shallowRef({
  theme: 'light',
  language: 'zh'
});
```

### 3. 外部库集成

```javascript
// 与不使用 Vue 响应式的外部库集成
const chartInstance = shallowRef(null);

onMounted(() => {
  chartInstance.value = new Chart(ctx, options);
});
```

---