# 22. Vite CSS Modules 如何使用动态类名？

**答案：**

```javascript
// 使用 CSS Modules
import styles from './styles.module.css';

const className = styles.container;
const activeClass = styles.active;

// 在模板中使用
<div :class="className">Content</div>
<div :class="[styles.button, activeClass]">Button</div>
```

---