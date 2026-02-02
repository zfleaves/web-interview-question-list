# 23. Vite CSS Modules 如何支持 TypeScript？

**答案：**

```typescript
// vite-env.d.ts
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// 使用
import styles from './styles.module.css';
const containerClass: string = styles.container;
```

---