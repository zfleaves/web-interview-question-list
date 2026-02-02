# 30. Vue3 的 shallowRef 和 shallowReactive 有什么使用场景？

**答案：**

```javascript
// 1. 大型数据集
const largeData = shallowRef(largeDataSet);

// 2. 第三方库实例
const map = shallowRef(new Map());
// 修改 map 不会触发响应式更新
map.value.set('key', 'value');
triggerRef(map);  // 手动触发更新

// 3. 性能优化
const state = shallowReactive({
  // 只需要监听顶层属性
  config: { ... },
  data: { ... }
});
```

---