# 4. Vite 如何配置 SSR（服务端渲染）？

**答案：**

```javascript
// vite.config.js
export default defineConfig({
  plugins: [vue()],
  ssr: {
    noExternal: ['some-dep']  // 不外部化的依赖
  }
});

// src/entry-server.js
import { createSSRApp } from 'vue';
import App from './App.vue';

export function render(url) {
  const app = createSSRApp(App);
  return app;  // 返回渲染后的内容
}

// src/entry-client.js
import { createApp } from 'vue';
import App from './App.vue';
createApp(App).mount('#app');

// server.js
import express from 'express';
import { createServer as createViteServer } from 'vite';

const app = express();
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'custom'
});

app.use(vite.middlewares);
app.use('*', async (req, res) => {
  const { render } = await vite.ssrLoadModule('/src/entry-server.js');
  const appHtml = await render(req.url);
  res.send(`<div id="app">${appHtml}</div><script src="/src/entry-client.js"></script>`);
});
```

---