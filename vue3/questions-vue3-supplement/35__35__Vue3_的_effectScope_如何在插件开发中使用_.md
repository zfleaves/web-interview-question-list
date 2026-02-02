# 35. Vue3 的 effectScope 如何在插件开发中使用？

**答案：**

```javascript
import { effectScope, onScopeDispose } from 'vue';

export function createMyPlugin(app) {
  const scope = effectScope();

  app.provide('myPlugin', {
    state: scope.run(() => reactive({ ... })),
    stop: () => scope.stop()
  });

  app.mixin({
    beforeUnmount() {
      scope.stop();
    }
  });
}
```

---