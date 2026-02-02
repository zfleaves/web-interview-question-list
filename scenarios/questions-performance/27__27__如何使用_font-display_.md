# 27. 如何使用 font-display？

**答案：**

font-display 可以控制字体的加载策略，提升用户体验。

```css
@font-face {
  font-family: 'MyFont';
  src: url('myfont.woff2') format('woff2');
  font-display: swap;  /* 立即显示后备字体 */
}
```

---