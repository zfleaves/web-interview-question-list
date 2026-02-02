# 32. 如何使用 Web Vitals 实现性能监控？

**答案：**

```javascript
// main.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

---