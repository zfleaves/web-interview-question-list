# 40. 如何使用 WeakMap/WeakSet 优化内存？

**答案：**

WeakMap/WeakSet 可以避免内存泄漏，当键被回收时，值也会被回收。

```javascript
// 使用 WeakMap 避免内存泄漏
const cache = new WeakMap();

function getData(element) {
  if (cache.has(element)) {
    return cache.get(element);
  }
  const data = fetchData();
  cache.set(element, data);
  return data;
}
```

---

## 总结

以上补充了前端性能优化的高频面试题，涵盖了：

1. **首屏加载优化** - 代码分割、资源预加载、关键 CSS 内联
2. **JavaScript 执行优化** - 避免阻塞、防抖节流、优化循环
3. **CSS 性能优化** - 选择器优化、CSS 变量、动画优化
4. **网络请求优化** - HTTP/2、Service Worker、请求合并
5. **图片加载优化** - 现代格式、响应式图片、懒加载
6. **字体加载优化** - font-display、预加载、子集化
7. **移动端性能优化** - 视口优化、触摸优化、减少重绘
8. **SEO 优化** - 语义化 HTML、Meta 标签、结构化数据
9. **性能监控** - Performance API、Web Vitals、Lighthouse
10. **内存使用优化** - 避免泄漏、WeakMap、对象池

这些题目补充了前端性能优化的高级技巧，能够更全面地考察候选人的性能优化能力。