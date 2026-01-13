# HTML 面试题集锦（截止 2025 年底）

## 目录
1. [HTML 基础](#html-基础)
2. [语义化](#语义化)
3. [表单](#表单)
4. [SEO](#seo)
5. [场景题](#场景题)

---

## HTML 基础

### 1. DOCTYPE 的作用是什么？

**答案：**

```html
<!-- 告诉浏览器使用哪种 HTML 版本 -->
<!DOCTYPE html>

<!-- 作用：
   1. 告诉浏览器使用标准模式渲染
   2. 避免浏览器的怪异模式（Quirks Mode）
   3. 确保页面在不同浏览器中表现一致
-->
```

---

### 2. meta 标签有哪些常用属性？

**答案：**

```html
<!-- 1. 字符编码 -->
<meta charset="UTF-8">

<!-- 2. 视口设置（移动端） -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- 3. SEO 相关 -->
<meta name="description" content="页面描述">
<meta name="keywords" content="关键词">
<meta name="author" content="作者">

<!-- 4. Open Graph（社交媒体分享） -->
<meta property="og:title" content="标题">
<meta property="og:description" content="描述">
<meta property="og:image" content="图片URL">

<!-- 5. 其他 -->
<meta name="robots" content="index,follow">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
```

---

## 语义化

### 3. HTML5 语义化标签有哪些？

**答案：**

```html
<!-- 页面结构 -->
<header>头部</header>
<nav>导航</nav>
<main>主要内容</main>
<article>文章</article>
<section>章节</section>
<aside>侧边栏</aside>
<footer>页脚</footer>

<!-- 文本语义 -->
<mark>标记</mark>
<time>时间</time>
<address>地址</address>
<abbr>缩写</abbr>
<details>详情</details>
<summary>摘要</summary>

<!-- 表单语义 -->
<input type="email">
<input type="tel">
<input type="url">
<input type="number">
<input type="date">
<input type="range">
```

---

## 表单

### 4. HTML5 新增的表单类型有哪些？

**答案：**

```html
<!-- 新增类型 -->
<input type="email">    <!-- 邮箱 -->
<input type="tel">      <!-- 电话 -->
<input type="url">      <!-- URL -->
<input type="search">   <!-- 搜索 -->
<input type="number">   <!-- 数字 -->
<input type="range">    <!-- 滑块 -->
<input type="color">    <!-- 颜色 -->
<input type="date">     <!-- 日期 -->
<input type="time">     <!-- 时间 -->
<input type="datetime-local"> <!-- 日期时间 -->
<input type="month">    <!-- 月份 -->
<input type="week">     <!-- 周 -->

<!-- 新增属性 -->
<input required>        <!-- 必填 -->
<input pattern="">       <!-- 正则验证 -->
<input placeholder="">   <!-- 占位符 -->
<input autocomplete>     <!-- 自动完成 -->
<input multiple>         <!-- 多选 -->
<input min="" max="">    <!-- 最小值/最大值 -->
<input step="">          <!-- 步长 -->
```

---

## SEO

### 5. 如何优化 HTML 的 SEO？

**答案：**

```html
<!-- 1. 使用语义化标签 -->
<header><h1>页面标题</h1></header>
<main>
  <article>
    <h2>文章标题</h2>
    <p>内容...</p>
  </article>
</main>

<!-- 2. 正确使用标题层级 -->
<h1>主标题</h1>
<h2>副标题</h2>
<h3>三级标题</h3>

<!-- 3. 添加 meta 标签 -->
<meta name="description" content="页面描述">
<meta name="keywords" content="关键词">

<!-- 4. 添加 alt 属性 -->
<img src="image.jpg" alt="图片描述">

<!-- 5. 使用 Open Graph -->
<meta property="og:title" content="标题">
<meta property="og:description" content="描述">
<meta property="og:image" content="图片URL">

<!-- 6. 添加结构化数据 -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "标题",
  "author": "作者",
  "datePublished": "2025-01-01"
}
</script>
```

---

## 场景题

### 6. 实现一个响应式的图片

**答案：**

```html
<!-- 方法 1：使用 srcset -->
<img src="small.jpg"
     srcset="small.jpg 480w,
             medium.jpg 768w,
             large.jpg 1024w"
     sizes="(max-width: 480px) 480px,
            (max-width: 768px) 768px,
            1024px"
     alt="响应式图片">

<!-- 方法 2：使用 picture -->
<picture>
  <source media="(max-width: 480px)" srcset="small.jpg">
  <source media="(max-width: 768px)" srcset="medium.jpg">
  <img src="large.jpg" alt="响应式图片">
</picture>

<!-- 方法 3：使用 CSS -->
<img src="image.jpg" alt="图片" style="max-width: 100%; height: auto;">
```

---

## 总结

以上涵盖了 HTML 面试中最常问的问题，包括：

1. **HTML 基础**（DOCTYPE、meta 标签）
2. **语义化**（语义化标签）
3. **表单**（新增表单类型）
4. **SEO**（SEO 优化）
5. **场景题**（响应式图片）

这些题目覆盖了 HTML 的核心概念和实际应用场景。