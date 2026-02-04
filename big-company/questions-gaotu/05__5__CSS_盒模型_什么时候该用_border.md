# 5. CSS 盒模型 什么时候该用 border

**答案：**

**盒模型使用 border 的场景：**

**1. 明确的边框需求**

```css
.card {
  border: 1px solid #ccc; /* 需要边框 */
  border-radius: 4px;
  padding: 20px;
  background: white;
}
```

**2. 表格样式**

```css
table {
  border-collapse: collapse;
}

td, th {
  border: 1px solid #ddd; /* 需要边框 */
  padding: 10px;
}
```

**3. 分隔线**

```css
.separator {
  border-top: 1px solid #eee;
  border-bottom: none;
}
```

**使用 margin 的场景：**

```css
/* 使用 margin 的场景 */
.box {
  margin: 10px; /* 间距 */
}

.nav-item {
  margin-right: 20px; /* 导航项间距 */
}
```

**高途特色考点：**
- 高频考察盒模型的使用场景
- 结合实际项目说明 border 和 margin 的选择
- 考察对布局的理解

---
