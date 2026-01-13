# 18. React Server Components 是什么？有什么优势？

**答案：**

React Server Components (RSC) 是在服务器上渲染的组件，可以访问服务器资源。

**核心概念：**

```javascript
// 服务器组件（默认）
// 文件名：UserProfile.server.jsx
async function UserProfile({ userId }) {
  // 直接访问数据库
  const user = await db.user.findUnique({ where: { id: userId } });
  
  // 直接访问文件系统
  const avatar = await fs.readFile(`/avatars/${userId}.png`);
  
  // 直接调用 API（不需要 fetch）
  const posts = await getPosts(userId);

  return (
    <div>
      <img src={`data:image/png;base64,${avatar.toString('base64')}`} />
      <h1>{user.name}</h1>
      <PostList posts={posts} />
    </div>
  );
}

// 客户端组件
// 文件名：PostList.client.jsx
'use client';

import { useState } from 'react';

function PostList({ posts }) {
  const [filter, setFilter] = useState('');

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      {filteredPosts.map(post => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
```

**优势：**

1. **减少客户端包大小：**
```javascript
// 服务器组件：不会发送到客户端
async function ServerComponent() {
  // 使用重型库（如 date-fns、lodash）
  const date = format(new Date(), 'yyyy-MM-dd');
  const result = _.map(data, item => item.value);
  
  // 这些库不会打包到客户端
  return <div>{date}</div>;
}

// 客户端组件：需要发送到客户端
'use client';

function ClientComponent() {
  // 这些库会打包到客户端
  const date = format(new Date(), 'yyyy-MM-dd');
  const result = _.map(data, item => item.value);
  
  return <div>{date}</div>;
}
```

2. **直接访问服务器资源：**
```javascript
// 服务器组件
async function ProductPage({ productId }) {
  // 直接查询数据库
  const product = await db.product.findUnique({
    where: { id: productId },
    include: { reviews: true }
  });

  // 直接读取文件
  const images = await fs.readdir(`/products/${productId}/images`);

  // 直接调用内部 API
  const recommendations = await getRecommendations(productId);

  return (
    <div>
      <h1>{product.name}</h1>
      <Gallery images={images} />
      <Reviews reviews={product.reviews} />
      <Recommendations items={recommendations} />
    </div>
  );
}
```

3. **保持代码在服务器：**
```javascript
// 服务器组件：敏感逻辑不会暴露到客户端
async function AdminDashboard() {
  // 密钥和 API 配置只在服务器
  const apiKey = process.env.ADMIN_API_KEY;
  
  // 敏感业务逻辑
  const data = await fetchSensitiveData(apiKey);
  
  // 不会发送到客户端
  return <Dashboard data={data} />;
}
```

4. **流式渲染：**
```javascript
// 服务器组件支持流式渲染
async function Page() {
  return (
    <div>
      <Header />
      <Suspense fallback={<Skeleton />}>
        <MainContent />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <Sidebar />
      </Suspense>
      <Footer />
    </div>
  );
}

// MainContent 和 Sidebar 可以独立加载
```

**使用场景：**

```javascript
// ✅ 适合服务器组件
async function ProductList() {
  // 数据获取
  const products = await db.product.findMany();
  
  // 重型数据处理
  const processed = heavyProcessing(products);
  
  // 访问服务器资源
  const config = await getConfig();
  
  return <div>{/* ... */}</div>;
}

// ✅ 适合客户端组件
'use client';

function InteractiveComponent() {
  // 事件处理
  const [isOpen, setIsOpen] = useState(false);
  
  // 浏览器 API
  useEffect(() => {
    const handler = () => console.log('scroll');
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // 交互逻辑
  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return <button onClick={handleClick}>点击</button>;
}
```

**组合使用：**

```javascript
// 服务器组件
async function Page() {
  const user = await getCurrentUser();
  const posts = await getUserPosts(user.id);

  return (
    <div>
      <Header user={user} />
      <PostList posts={posts} />
      <InteractiveWidget />
    </div>
  );
}

// 客户端组件
'use client';

function InteractiveWidget() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      点击次数: {count}
    </button>
  );
}
```
