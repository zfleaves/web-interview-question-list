# 30. 如何使用 Google Analytics 实现监控？

**答案：**

```javascript
// main.ts
import VueGtag from 'vue-gtag';

app.use(VueGtag, {
  config: { id: 'GA_MEASUREMENT_ID' }
});
```

---