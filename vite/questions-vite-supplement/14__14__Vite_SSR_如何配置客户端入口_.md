# 14. Vite SSR 如何配置客户端入口？

**答案：**

```javascript
// src/entry-client.js
import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);
app.mount('#app');
```

---