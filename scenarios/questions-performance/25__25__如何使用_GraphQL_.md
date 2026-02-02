# 25. 如何使用 GraphQL？

**答案：**

GraphQL 可以精确请求需要的数据，减少传输量。

```javascript
// 只请求需要的数据
const query = `
  query {
    user(id: 1) {
      name
      email
    }
  }
`;

fetch('/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query })
});
```

---