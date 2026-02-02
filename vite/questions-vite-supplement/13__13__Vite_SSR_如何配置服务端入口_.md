# 13. Vite SSR 如何配置服务端入口？

**答案：**

```javascript
// src/entry-server.js
import { createSSRApp } from 'vue';
import App from './App.vue';

export function render(url) {
  const app = createSSRApp(App);

  return new Promise((resolve, reject) => {
    resolve(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>SSR App</title>
        </head>
        <body>
          <div id="app">${app}</div>
        </body>
      </html>
    `);
  });
}
```

---