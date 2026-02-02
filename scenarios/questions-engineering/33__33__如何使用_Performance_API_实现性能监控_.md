# 33. 如何使用 Performance API 实现性能监控？

**答案：**

```javascript
// performance.ts
export function getPerformanceMetrics() {
  const perfData = performance.getEntriesByType('navigation')[0];

  return {
    dns: perfData.domainLookupEnd - perfData.domainLookupStart,
    tcp: perfData.connectEnd - perfData.connectStart,
    ttfb: perfData.responseStart - perfData.requestStart,
    download: perfData.responseEnd - perfData.responseStart,
    domLoad: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
    windowLoad: perfData.loadEventEnd - perfData.loadEventStart
  };
}
```

---