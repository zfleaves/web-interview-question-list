# Vue3 的 toRaw 和 markRaw

**答案：**

## toRaw 使用

```javascript
import { reactive, toRaw } from 'vue';

const state = reactive({ count: 0 });

// 获取原始对象
const raw = toRaw(state);

console.log(raw === state); // false
console.log(raw === state.__v_raw); // true
```

## markRaw 使用

```javascript
import { reactive, markRaw } from 'vue';

const config = markRaw({
  apiUrl: 'https://api.example.com'
});

const state = reactive({
  config, // config 不会被转为响应式
  data: []
});

// 修改 config 不会触发更新
state.config.apiUrl = 'new-url'; // 不会触发响应式更新
```

## 使用场景

### toRaw 使用场景

```javascript
// 1. 获取原始对象用于第三方库
const chart = reactive({ data: [] });
chartInstance.setData(toRaw(chart.data));

// 2. 性能优化，避免响应式开销
const rawData = toRaw(largeReactiveData);
processData(rawData);

// 3. 对象比较
if (toRaw(obj1) === toRaw(obj2)) {
  console.log('Same object');
}
```

### markRaw 使用场景

```javascript
// 1. 不需要响应式的配置对象
const constants = markRaw({
  MAX_SIZE: 100,
  DEFAULT_TIMEOUT: 5000
});

// 2. 第三方库实例
const chartInstance = markRaw(new Chart(ctx));

// 3. 复杂对象，性能考虑
const largeImmutable = markRaw(createLargeObject());
```

---