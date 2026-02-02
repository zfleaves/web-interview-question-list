# 33. Vue3 的 effectScope 如何嵌套？

**答案：**

```javascript
const parentScope = effectScope();
const childScope = effectScope(true);  // detached

parentScope.run(() => {
  const state = reactive({ count: 0 });

  watchEffect(() => {
    console.log('parent:', state.count);
  });

  childScope.run(() => {
    watchEffect(() => {
      console.log('child:', state.count);
    });
  });
});

// 停止父作用域，子作用域也会停止
parentScope.stop();
```

---