# 15. Vite SSR 如何配置 Express 服务器？

**答案：**

```javascript
// server.js
const fs = require('fs');
const path = require('path');
const express = require('express');
const { createServer: createViteServer } = require('vite');

async function createServer() {
  const app = express();

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });

  app.use(vite.middlewares);

  app.use('*', async (req, res) => {
    try {
      const template = fs.readFileSync(
        path.resolve(__dirname, 'index.html'),
        'utf-8'
      );

      const { render } = await vite.ssrLoadModule('/src/entry-server.js');
      const appHtml = await render(req.url);

      const html = template.replace(`<!--app-html-->`, appHtml);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      console.error(e);
      res.status(500).end(e.message);
    }
  });

  app.listen(3000);
}

createServer();
```

---