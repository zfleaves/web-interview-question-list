# 33. 如何使用 passive 事件监听器？

**答案：**

passive: true 可以提示浏览器不会调用 preventDefault()，提升滚动性能。

```javascript
// passive: true 提示浏览器不会调用 preventDefault()
window.addEventListener('touchstart', handleTouch, { passive: true });
window.addEventListener('touchmove', handleTouch, { passive: true });
```

---