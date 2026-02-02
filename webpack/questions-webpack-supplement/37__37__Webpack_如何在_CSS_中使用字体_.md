# 37. Webpack 如何在 CSS 中使用字体？

**答案：**

```css
/* styles.css */
@font-face {
  font-family: 'MyFont';
  src: url('./fonts/myfont.woff2') format('woff2'),
       url('./fonts/myfont.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}

body {
  font-family: 'MyFont', sans-serif;
}
```

---