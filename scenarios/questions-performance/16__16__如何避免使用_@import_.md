# 16. 如何避免使用 @import？

**答案：**

使用 link 标签代替 @import，避免阻塞渲染。

```css
/* ❌ 使用 @import 会阻塞渲染 */
@import url('styles.css');

/* ✅ 使用 link 标签 */
<link rel="stylesheet" href="styles.css">
```

---