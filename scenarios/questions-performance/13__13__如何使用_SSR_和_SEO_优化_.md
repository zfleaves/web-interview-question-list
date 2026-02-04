# 13. 如何使用 SSR 和 SEO 优化？

**答案：**

SSR（服务器端渲染）可以让搜索引擎更好地抓取页面内容，配合语义化 HTML 和 Meta 标签。

```html
<!-- 语义化 HTML -->
<header><nav><ul><li><a href="/">Home</a></li></ul></nav></header>
<main><article><h1>Title</h1><p>Content</p></article></main>

<!-- Meta 标签 -->
<meta name="description" content="Page description">
<meta property="og:title" content="Page Title">
<meta property="og:image" content="image.jpg">

<!-- 结构化数据 -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "datePublished": "2025-01-08"
}
</script>
```

---