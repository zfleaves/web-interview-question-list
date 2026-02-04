# 14. 如何使用 Web Vitals 监控性能？

**答案：**

Web Vitals 提供了关键的性能指标（LCP、FID、CLS）。

```javascript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);  // 累积布局偏移
getFID(console.log);  // 首次输入延迟
getFCP(console.log);  // 首次内容绘制
getLCP(console.log);  // 最大内容绘制
getTTFB(console.log); // 首字节时间
```

---