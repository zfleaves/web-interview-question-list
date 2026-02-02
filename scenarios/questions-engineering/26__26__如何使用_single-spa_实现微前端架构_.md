# 26. 如何使用 single-spa 实现微前端架构？

**答案：**

```javascript
// 主应用
import { registerApplication, start } from 'single-spa';

registerApplication({
  name: 'app1',
  app: () => System.import('app1'),
  activeWhen: '/app1'
});

start();
```

---