# 24. 如何使用 qiankun 实现微前端架构？

**答案：**

```javascript
// 主应用
import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/app1'
  },
  {
    name: 'app2',
    entry: '//localhost:3002',
    container: '#subapp-viewport',
    activeRule: '/app2'
  }
]);

start();
```

---