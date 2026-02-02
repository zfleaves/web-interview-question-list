# 18. 如何使用 will-change 优化？

**答案：**

will-change 提示浏览器元素会变化，提前做好优化准备。

```css
/* 提示浏览器元素会变化 */
.element {
  will-change: transform;
}

/* 动画结束后移除 */
.element.animating {
  will-change: transform;
  animation: slide 1s;
}
```

---