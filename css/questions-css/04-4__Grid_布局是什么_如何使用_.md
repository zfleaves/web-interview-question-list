# 4. Grid 布局是什么？如何使用？

**答案：**

**Grid 基础：**

```css
/* 容器属性 */
.container {
  display: grid;
  
  /* 定义列 */
  grid-template-columns: 1fr 2fr 1fr;
  /* 或 */
  grid-template-columns: repeat(3, 1fr);
  /* 或 */
  grid-template-columns: 200px 1fr 200px;
  
  /* 定义行 */
  grid-template-rows: 100px 1fr 100px;
  
  /* 间距 */
  gap: 20px;
  /* 或 */
  column-gap: 20px;
  row-gap: 20px;
  
  /* 区域 */
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  
  /* 对齐 */
  justify-items: stretch; /* stretch | start | end | center */
  align-items: stretch; /* stretch | start | end | center */
  justify-content: start; /* start | end | center | stretch | space-around | space-between */
  align-content: start; /* start | end | center | stretch | space-around | space-between */
}

/* 项目属性 */
.item {
  /* 指定位置 */
  grid-column: 1 / 3;
  grid-row: 1 / 2;
  
  /* 或使用 span */
  grid-column: span 2;
  
  /* 指定区域 */
  grid-area: header;
  
  /* 单独对齐 */
  justify-self: start;
  align-self: start;
}
```

**场景题：**

```css
/* 场景 1：圣杯布局 */
.layout {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  min-height: 100vh;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }

/* 场景 2：响应式网格 */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

/* 场景 3：卡片布局 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

/* 场景 4：仪表板 */
.dashboard {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto auto;
  gap: 20px;
}

.widget {
  grid-column: span 2;
}

.widget.large {
  grid-column: span 2;
  grid-row: span 2;
}
```