# 39. 如何使用 Web Vitals 监控性能？

**答案：**

Web Vitals 提供了关键的性能指标。

```javascript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

---