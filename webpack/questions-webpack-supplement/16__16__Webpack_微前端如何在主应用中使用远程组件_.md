# 16. Webpack 微前端如何在主应用中使用远程组件？

**答案：**

```javascript
// 主应用中使用远程组件
import React, { lazy, Suspense } from 'react';

const RemoteButton = lazy(() => import('app1/Button'));
const RemoteCard = lazy(() => import('app2/Card'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RemoteButton />
      <RemoteCard />
    </Suspense>
  );
}
```

---