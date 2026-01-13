# CSS 面试题集锦（截止 2025 年底）

## 目录
1. [CSS 基础](#css-基础)
2. [布局](#布局)
3. [动画与过渡](#动画与过渡)
4. [响应式设计](#响应式设计)
5. [性能优化](#性能优化)
6. [场景题](#场景题)

---

## CSS 基础

### 1. 盒模型是什么？box-sizing 属性有哪些值？

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

---

### 2. CSS 选择器的优先级是什么？

**答案：**

**优先级计算：**

```css
/* 优先级规则（从高到低）：
   1. !important
   2. 内联样式
   3. ID 选择器
   4. 类选择器、属性选择器、伪类
   5. 元素选择器、伪元素
   6. 通配符
*/

/* 1. !important（最高） */
.box {
  color: red !important;
}

/* 2. 内联样式 */
<div style="color: blue;"></div>

/* 3. ID 选择器 */
#header {
  color: green;
}

/* 4. 类选择器 */
.header {
  color: yellow;
}

/* 5. 元素选择器 */
div {
  color: orange;
}

/* 6. 通配符 */
* {
  margin: 0;
}
```

**优先级计算示例：**

```css
/* 优先级计算：(ID, 类, 元素) */

/* 0, 0, 1 */
div { }

/* 0, 1, 0 */
.class { }

/* 1, 0, 0 */
#id { }

/* 0, 1, 1 */
div.class { }

/* 1, 1, 0 */
#id.class { }

/* 1, 1, 1 */
div#id.class { }

/* 比较：1, 1, 0 > 0, 2, 1 */
```

**场景题：**

```css
/* 场景 1：覆盖第三方库样式 */
/* 第三方库 */
.button {
  background: blue;
}

/* 我们的自定义样式 */
.my-button {
  background: red !important; /* 覆盖第三方样式 */
}

/* 场景 2：组件样式隔离 */
.card {
  /* 基础样式 */
  padding: 20px;
  border: 1px solid #ddd;
}

.card.primary {
  /* 特定样式 */
  background: #007bff;
  color: white;
}

.card.primary:hover {
  /* 更高优先级 */
  background: #0056b3;
}
```

---

## 布局

### 3. Flexbox 是什么？如何使用？

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

---

### 4. Grid 布局是什么？如何使用？

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

---

## 动画与过渡

### 5. transition 和 animation 的区别是什么？

**答案：**

**区别对比：**

```css
/* transition：过渡效果 */
.box {
  width: 100px;
  height: 100px;
  background: blue;
  transition: all 0.3s ease;
}

.box:hover {
  width: 200px;
  background: red;
}

/* animation：动画效果 */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.box {
  animation: slideIn 0.5s ease-in-out;
}

/* 区别：
   1. transition：需要触发（如 hover）
   2. animation：可以自动执行
   3. transition：只能定义开始和结束状态
   4. animation：可以定义多个关键帧
*/
```

**场景题：**

```css
/* 场景 1：按钮悬停效果 */
.button {
  background: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  transition: all 0.3s ease;
}

.button:hover {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

/* 场景 2：加载动画 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 场景 3：淡入淡出 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}

/* 场景 4：滑动效果 */
@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-up {
  animation: slideUp 0.5s ease-out;
}
```

---

## 响应式设计

### 6. 媒体查询如何使用？

**答案：**

**媒体查询基础：**

```css
/* 基本语法 */
@media screen and (min-width: 768px) {
  /* 样式 */
}

/* 常用断点 */
/* 移动设备 */
@media (max-width: 767px) {
  .container {
    padding: 10px;
  }
}

/* 平板设备 */
@media (min-width: 768px) and (max-width: 1023px) {
  .container {
    padding: 20px;
  }
}

/* 桌面设备 */
@media (min-width: 1024px) {
  .container {
    padding: 30px;
  }
}
```

**场景题：**

```css
/* 场景 1：响应式导航 */
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 767px) {
  .nav {
    flex-direction: column;
  }
  
  .nav-links {
    display: none;
  }
}

/* 场景 2：响应式网格 */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 场景 3：响应式字体 */
body {
  font-size: 16px;
}

@media (min-width: 768px) {
  body {
    font-size: 18px;
  }
}

@media (min-width: 1024px) {
  body {
    font-size: 20px;
  }
}
```

---

## 性能优化

### 7. CSS 性能优化有哪些方法？

**答案：**

**优化方法：**

```css
/* 1. 使用简写属性 */
/* ❌ 不推荐 */
.box {
  margin-top: 10px;
  margin-right: 20px;
  margin-bottom: 10px;
  margin-left: 20px;
}

/* ✅ 推荐 */
.box {
  margin: 10px 20px;
}

/* 2. 避免过度嵌套 */
/* ❌ 不推荐 */
.container .header .nav .item .link {
  color: blue;
}

/* ✅ 推荐 */
.nav-link {
  color: blue;
}

/* 3. 使用 transform 代替 position */
/* ❌ 不推荐 */
.box {
  position: absolute;
  left: 100px;
  top: 100px;
}

/* ✅ 推荐 */
.box {
  transform: translate(100px, 100px);
}

/* 4. 使用 will-change */
.box {
  will-change: transform;
}

.box:hover {
  transform: scale(1.1);
}

/* 5. 避免使用 @import */
/* ❌ 不推荐 */
@import url('styles.css');

/* ✅ 推荐 */
<link rel="stylesheet" href="styles.css">

/* 6. 压缩 CSS */
/* 使用工具：cssnano, clean-css */
```

---

## 场景题

### 8. 实现一个水平垂直居中的元素

**答案：**

```css
/* 方法 1：Flexbox */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

/* 方法 2：Grid */
.center {
  display: grid;
  place-items: center;
  height: 100vh;
}

/* 方法 3：绝对定位 + transform */
.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 方法 4：绝对定位 + margin */
.center {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  width: 200px;
  height: 200px;
}

/* 方法 5：table-cell */
.center {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
}
```

---

## 总结

以上涵盖了 CSS 面试中最常问的问题，包括：

1. **CSS 基础**（盒模型、选择器优先级）
2. **布局**（Flexbox、Grid）
3. **动画与过渡**（transition、animation）
4. **响应式设计**（媒体查询）
5. **性能优化**
6. **场景题**（居中元素）

这些题目覆盖了 CSS 的核心概念和实际应用场景。