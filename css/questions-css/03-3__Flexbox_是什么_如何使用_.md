# 3. Flexbox 是什么？如何使用？

**答案：**

**Flexbox 基础：**

```css
/* 容器属性 */
.container {
  display: flex;
  
  /* 主轴方向 */
  flex-direction: row; /* row | row-reverse | column | column-reverse */
  
  /* 换行 */
  flex-wrap: nowrap; /* nowrap | wrap | wrap-reverse */
  
  /* 主轴对齐 */
  justify-content: flex-start; /* flex-start | flex-end | center | space-between | space-around | space-evenly */
  
  /* 交叉轴对齐 */
  align-items: stretch; /* stretch | flex-start | flex-end | center | baseline */
  
  /* 多行对齐 */
  align-content: stretch; /* stretch | flex-start | flex-end | center | space-between | space-around */
}

/* 项目属性 */
.item {
  /* 放大比例 */
  flex-grow: 0;
  
  /* 缩小比例 */
  flex-shrink: 1;
  
  /* 初始大小 */
  flex-basis: auto;
  
  /* 简写 */
  flex: 0 1 auto;
  
  /* 单独对齐 */
  align-self: auto; /* auto | flex-start | flex-end | center | baseline | stretch */
  
  /* 排序 */
  order: 0;
}
```

**场景题：**

```css
/* 场景 1：水平垂直居中 */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

/* 场景 2：固定头部、自适应内容 */
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header {
  flex: 0 0 auto; /* 固定高度 */
}

.content {
  flex: 1; /* 占据剩余空间 */
  overflow-y: auto;
}

.footer {
  flex: 0 0 auto; /* 固定高度 */
}

/* 场景 3：等宽列 */
.columns {
  display: flex;
}

.column {
  flex: 1; /* 每列等宽 */
  padding: 10px;
}

/* 场景 4：左侧固定，右侧自适应 */
.sidebar-layout {
  display: flex;
}

.sidebar {
  flex: 0 0 250px; /* 固定宽度 */
}

.main {
  flex: 1; /* 自适应 */
}
```