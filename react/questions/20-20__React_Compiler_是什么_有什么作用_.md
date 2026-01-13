# 20. React Compiler 是什么？有什么作用？

**答案：**

React Compiler 是一个自动优化 React 应用的编译器，可以自动添加 memoization。

**工作原理：**

```javascript
// 源代码
function Component({ items }) {
  const [filter, setFilter] = useState('');
  
  const filteredItems = items.filter(item =>
    item.name.includes(filter)
  );
  
  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      {filteredItems.map(item => (
        <Item key={item.id} item={item} />
      ))}
    </div>
  );
}

// React Compiler 自动优化为
function Component({ items }) {
  const [filter, setFilter] = useState('');
  
  const filteredItems = useMemo(() =>
    items.filter(item => item.name.includes(filter)),
    [items, filter]
  );
  
  const handleChange = useCallback((e) => {
    setFilter(e.target.value);
  }, []);
  
  return (
    <div>
      <input value={filter} onChange={handleChange} />
      {filteredItems.map(item => (
        <Item key={item.id} item={item} />
      ))}
    </div>
  );
}
```

**使用方法：**

```javascript
// 安装
npm install react-compiler-runtime

// 配置 Babel
{
  "plugins": [
    ["babel-plugin-react-compiler", {
      "runtimeModule": "react-compiler-runtime"
    }]
  ]
}

// 或在 Next.js 中使用
// next.config.js
module.exports = {
  experimental: {
    reactCompiler: true,
  },
};
```

**优化场景：**

```javascript
// 1. 自动 memoize 计算值
function Component({ data }) {
  // 自动添加 useMemo
  const processed = expensiveComputation(data);
  
  return <div>{processed}</div>;
}

// 2. 自动 memoize 函数
function Component({ onSave }) {
  // 自动添加 useCallback
  const handleClick = () => {
    onSave();
  };
  
  return <button onClick={handleClick}>保存</button>;
}

// 3. 自动 memoize 组件
const Item = function Item({ item }) {
  // 自动添加 React.memo
  return <div>{item.name}</div>;
};

function List({ items }) {
  return items.map(item => <Item key={item.id} item={item} />);
}
```

**限制：**

```javascript
// ❌ React Compiler 无法优化的情况

// 1. 使用了外部可变状态
let externalState = 0;
function Component() {
  const [count, setCount] = useState(0);
  
  // externalState 变化时，无法自动优化
  const value = externalState + count;
  
  return <div>{value}</div>;
}

// 2. 使用了 ref.current 作为依赖
function Component() {
  const ref = useRef(0);
  const [count, setCount] = useState(0);
  
  // ref.current 变化时，无法自动优化
  useEffect(() => {
    console.log(ref.current);
  }, [ref.current]);
  
  return <div>{count}</div>;
}

// 3. 手动添加了 memoization
function Component({ items }) {
  // 已经手动优化，Compiler 会跳过
  const filtered = useMemo(() => 
    items.filter(item => item.active),
    [items]
  );
  
  return <div>{filtered.length}</div>;
}
```

**最佳实践：**

```javascript
// ✅ 让 Compiler 自动优化
function Component({ items }) {
  const [filter, setFilter] = useState('');
  
  const filtered = items.filter(item => 
    item.name.includes(filter)
  );
  
  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      {filtered.map(item => (
        <Item key={item.id} item={item} />
      ))}
    </div>
  );
}

// ❌ 手动优化（Compiler 启用时不需要）
function Component({ items }) {
  const [filter, setFilter] = useState('');
  
  const filtered = useMemo(() =>
    items.filter(item => item.name.includes(filter)),
    [items, filter]
  );
  
  const handleChange = useCallback((e) => {
    setFilter(e.target.value);
  }, []);
  
  return (
    <div>
      <input value={filter} onChange={handleChange} />
      {filtered.map(item => (
        <Item key={item.id} item={item} />
      ))}
    </div>
  );
}
```
