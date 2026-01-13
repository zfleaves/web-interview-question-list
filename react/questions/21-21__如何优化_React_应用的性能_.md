# 21. 如何优化 React 应用的性能？

**答案：**

**1. 组件层面优化：**

```javascript
// 使用 React.memo 避免不必要的重渲染
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  return <div>{/* 复杂渲染逻辑 */}</div>;
});

// 自定义比较函数
const Component = React.memo(
  function Component({ user }) {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    return prevProps.user.id === nextProps.user.id;
  }
);
```

**2. 列表渲染优化：**

```javascript
// ✅ 使用稳定的 key
function List({ items }) {
  return (
    <ul>
      {items.map(item => (
        <Item key={item.id} item={item} />
      ))}
    </ul>
  );
}

// ❌ 避免使用 index 作为 key
function List({ items }) {
  return (
    <ul>
      {items.map((item, index) => (
        <Item key={index} item={item} />
      ))}
    </ul>
  );
}
```

**3. 状态优化：**

```javascript
// 拆分状态，避免不必要的重渲染
function Component() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('');

  // user 和 posts 变化时，filter 相关的 UI 也会重渲染
  // 解决方案：拆分成多个组件
}

// ✅ 拆分组件
function UserSection({ user }) {
  return <div>{user?.name}</div>;
}

function PostsSection({ posts, filter }) {
  const filteredPosts = posts.filter(post =>
    post.title.includes(filter)
  );
  
  return <div>{/* ... */}</div>;
}

function Component() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('');

  return (
    <div>
      <UserSection user={user} />
      <PostsSection posts={posts} filter={filter} />
    </div>
  );
}
```

**4. 使用虚拟列表：**

```javascript
import { FixedSizeList } from 'react-window';

function VirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={400}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

**5. 懒加载：**

```javascript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

**6. 防抖和节流：**

```javascript
import { useDebouncedCallback } from 'use-debounce';

function SearchInput() {
  const [query, setQuery] = useState('');
  
  const debouncedSearch = useDebouncedCallback(
    (value) => {
      search(value);
    },
    500
  );

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  return <input value={query} onChange={handleChange} />;
}
```

**7. 使用 React DevTools Profiler：**

```javascript
import { Profiler } from 'react';

function onRenderCallback(
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) {
  console.log(`${id} ${phase} took ${actualDuration}ms`);
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Component />
    </Profiler>
  );
}
```

**8. 优化 Context：**

```javascript
// 拆分 Context
const ThemeContext = createContext();
const AuthContext = createContext();

function App() {
  return (
    <ThemeContext.Provider value={theme}>
      <AuthContext.Provider value={auth}>
        <ChildComponents />
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}

// 选择性消费
function Child() {
  const theme = useContext(ThemeContext);
  return <div>{theme}</div>;
}
```
