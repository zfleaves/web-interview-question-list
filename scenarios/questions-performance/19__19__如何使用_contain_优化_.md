# 19. 如何使用 contain 优化？

**答案：**

contain 可以隔离元素的重绘和重排，提高性能。

```css
/* 隔离元素的重绘和重排 */
.element {
  contain: layout paint;
}

/* 更严格的隔离 */
.element {
  contain: strict;
}
```

---