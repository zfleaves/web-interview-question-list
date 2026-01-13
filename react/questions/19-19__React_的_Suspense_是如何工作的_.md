# 19. React 的 Suspense 是如何工作的？

**答案：**

Suspense 让组件可以"等待"某些操作（如数据获取、代码分割）完成。

**基本用法：**

```javascript
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <UserProfile />
    </Suspense>
  );
}

function UserProfile() {
  // 使用 use 读取 Promise
  const user = use(fetchUser());
  
  return (
    <div>
      <h1>{user.name}</h1>
      <Suspense fallback={<PostsSkeleton />}>
        <UserPosts userId={user.id} />
      </Suspense>
    </div>
  );
}
```

**代码分割：**

```javascript
import { Suspense, lazy } from 'react';

// 懒加载组件
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <div>
      <Suspense fallback={<div>加载中...</div>}>
        <HeavyComponent />
      </Suspense>
    </div>
  );
}
```

**数据获取：**

```javascript
// 使用 React Query
import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';

function UserProfile() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    suspense: true, // 启用 Suspense
  });

  return <div>{user.name}</div>;
}

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <UserProfile />
    </Suspense>
  );
}
```

**嵌套 Suspense：**

```javascript
function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Header />
      <Suspense fallback={<ContentSkeleton />}>
        <MainContent />
      </Suspense>
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>
      <Footer />
    </Suspense>
  );
}
```

**错误边界：**

```javascript
import { Suspense } from 'react';

function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <Suspense fallback={<Loading />}>
        <UserProfile />
      </Suspense>
    </ErrorBoundary>
  );
}
```

**Suspense List（React 18）：**

```javascript
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Component1 />
      <Component2 />
      <Component3 />
    </Suspense>
  );
}

// 或使用 revealOrder
<Suspense fallback={<Loading />} revealOrder="forwards">
  <Component1 />
  <Component2 />
  <Component3 />
</Suspense>

// revealOrder 选项：
// - "forwards": 从前到后显示
// - "backwards": 从后到前显示
// - "together": 一起显示
```
