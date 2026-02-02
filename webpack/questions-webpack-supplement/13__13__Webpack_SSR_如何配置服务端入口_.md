# 13. Webpack SSR 如何配置服务端入口？

**答案：**

```javascript
// src/server.js
import express from 'express';
import { renderToString } from 'react-dom/server';
import App from './App';

const app = express();

app.get('*', (req, res) => {
  const appHtml = renderToString(<App />);
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>SSR App</title>
      </head>
      <body>
        <div id="app">${appHtml}</div>
        <script src="/client.js"></script>
      </body>
    </html>
  `);
});

app.listen(3000);
```

---