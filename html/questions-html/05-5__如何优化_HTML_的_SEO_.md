# 5. 如何优化 HTML 的 SEO？

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