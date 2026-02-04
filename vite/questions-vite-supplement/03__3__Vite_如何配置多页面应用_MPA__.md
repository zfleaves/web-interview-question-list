# 3. Vite 如何配置多页面应用（MPA）？

**答案：**

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html')
      }
    }
  }
});
```

```html
<!-- index.html -->
<script type="module" src="/src/main.js"></script>

<!-- about.html -->
<script type="module" src="/src/about.js"></script>
```

---