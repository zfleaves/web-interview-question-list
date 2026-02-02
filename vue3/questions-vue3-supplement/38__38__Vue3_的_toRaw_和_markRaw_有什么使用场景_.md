# 38. Vue3 的 toRaw 和 markRaw 有什么使用场景？

**答案：**

```javascript
// 1. 不需要响应式的复杂对象
const config = markRaw({
  // 大型配置对象
});

// 2. 第三方库实例
const map = markRaw(new Map());
const state = reactive({
  map
});

// 3. 性能优化
const largeData = markRaw(largeDataSet);
const state = reactive({
  data: largeData  // 不会被代理
});

// 4. 只读数据
const constants = markRaw({
  API_URL: 'https://api.example.com',
  VERSION: '1.0.0'
});
```

---