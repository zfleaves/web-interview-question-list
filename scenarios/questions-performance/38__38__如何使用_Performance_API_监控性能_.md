# 38. 如何使用 Performance API 监控性能？

**答案：**

Performance API 可以获取详细的性能指标。

```javascript
// 获取性能指标
const perfData = performance.getEntriesByType('navigation')[0];

const metrics = {
  dns: perfData.domainLookupEnd - perfData.domainLookupStart,
  tcp: perfData.connectEnd - perfData.connectStart,
  ttfb: perfData.responseStart - perfData.requestStart,
  download: perfData.responseEnd - perfData.responseStart,
  domLoad: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
  windowLoad: perfData.loadEventEnd - perfData.loadEventStart
};

console.log(metrics);
```

---