# 1. 谈谈你对 React 并发模式的理解

**答案：**

**React 并发模式（Concurrent Mode）核心概念：**

```javascript
// 1. 可中断渲染
// 传统模式：同步渲染，一旦开始就不能中断
function TraditionalRendering() {
  // 执行大量计算
  const result = heavyComputation();
  
  return <div>{result}</div>;
}

// 并发模式：可中断渲染，优先处理用户交互
function ConcurrentRendering() {
  const [result, setResult] = useState(null);
  
  // 使用 startTransition 标记非紧急更新
  const handleClick = () => {
    startTransition(() => {
      setResult(heavyComputation());
    });
  };
  
  return (
    <div>
      <button onClick={handleClick}>计算</button>
      {result && <div>{result}</div>}
    </div>
  );
}

// 2. useTransition Hook
function TransitionExample() {
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState('');
  const [results, setResults] = useState([]);
  
  const handleSearch = (value) => {
    // 立即更新输入框
    setFilter(value);
    
    // 标记为过渡更新，可以中断
    startTransition(() => {
      const filtered = heavySearch(value);
      setResults(filtered);
    });
  };
  
  return (
    <div>
      <input
        type="text"
        value={filter}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="搜索..."
      />
      {isPending && <div>搜索中...</div>}
      <ul>
        {results.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

// 3. useDeferredValue Hook
function DeferredValueExample() {
  const [query, setQuery] = useState('');
  
  // 延迟更新，减少频繁渲染
  const deferredQuery = useDeferredValue(query);
  
  const results = useMemo(() => {
    return heavySearch(deferredQuery);
  }, [deferredQuery]);
  
  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜索..."
      />
      <ul>
        {results.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

**并发模式的优势：**

```javascript
// 1. 提升用户体验
// 传统模式：长时间计算导致界面卡顿
function TraditionalList({ items }) {
  const results = items.map(item => heavyComputation(item));
  return <ul>{results.map(r => <li>{r}</li>)}</ul>;
}

// 并发模式：优先响应用户交互
function ConcurrentList({ items }) {
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  useEffect(() => {
    startTransition(() => {
      const computed = items.map(item => heavyComputation(item));
      setResults(computed);
    });
  }, [items]);
  
  return (
    <div>
      {isPending && <div>计算中...</div>}
      <ul>{results.map(r => <li>{r}</li>)}</ul>
    </div>
  );
}
```

---
