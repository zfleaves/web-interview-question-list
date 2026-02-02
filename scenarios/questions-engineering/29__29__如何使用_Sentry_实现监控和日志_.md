# 29. 如何使用 Sentry 实现监控和日志？

**答案：**

```javascript
// main.ts
import * as Sentry from '@sentry/vue';

Sentry.init({
  app,
  dsn: 'your-dsn',
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
});
```

---