# 10. qiankun 如何实现样式隔离的增强？

**答案：**

除了 qiankun 自带的样式隔离方案，还可以结合工程化手段：

### 1. CSS Modules

```css
/* Button.module.css */
.button {
  color: red;
}
```

```javascript
import styles from './Button.module.css';

function Button() {
  return <button className={styles.button}>Click</button>;
}
```

### 2. CSS-in-JS

```javascript
import styled from 'styled-components';

const Button = styled.button`
  color: red;
`;
```

### 3. BEM 命名规范

```css
/* 主应用 */
.app-header__button { }

/* 子应用 */
.subapp-header__button { }
```

### 4. PostCSS 插件

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-prefix-selector')({
      prefix: '[data-qiankun="app1"]',
      transform(prefix, selector) {
        return `${prefix} ${selector}`;
      }
    })
  ]
};
```

---