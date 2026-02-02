# 37. 如何使用 SSR 优化 SEO？

**答案：**

SSR（服务器端渲染）可以让搜索引擎更好地抓取页面内容。

```javascript
// 使用 Next.js
export async function getServerSideProps() {
  const data = await fetchData();
  return {
    props: { data }
  };
}

// 使用 Nuxt.js
export default {
  async asyncData() {
    const data = await fetchData();
    return { data };
  }
};
```

---