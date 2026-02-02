# 29. Webpack 如何使用 CSS Modules？

**答案：**

```javascript
// App.js
import styles from './App.css';

function App() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Hello World</h1>
    </div>
  );
}
```

---