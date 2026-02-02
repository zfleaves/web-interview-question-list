# 1. 盒模型是什么？box-sizing 属性有哪些值？

**答案：**

**盒模型组成：**

```css
/* 盒模型包含 */
- content: 内容区域
- padding: 内边距
- border: 边框
- margin: 外边距
```

**box-sizing 属性：**

```css
/* 1. content-box（默认值） */
.box {
  box-sizing: content-box;
  width: 200px;
  padding: 20px;
  border: 5px solid #000;
  /* 实际宽度 = 200 + 20*2 + 5*2 = 250px */
}

/* 2. border-box */
.box {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 5px solid #000;
  /* 实际宽度 = 200px（包含 padding 和 border） */
}

/* 最佳实践：全局设置 */
* {
  box-sizing: border-box;
}
```

**场景题：**

```css
/* 场景 1：固定宽度的卡片 */
.card {
  width: 300px;
  padding: 20px;
  border: 1px solid #ddd;
  box-sizing: border-box; /* 确保 padding 不会超出宽度 */
}

/* 场景 2：响应式网格 */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.grid-item {
  box-sizing: border-box;
  padding: 20px;
  border: 1px solid #ddd;
}
```