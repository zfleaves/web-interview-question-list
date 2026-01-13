# 11. React Hooks 的规则是什么？为什么会有这些规则？

**答案：**

**Hooks 的两条黄金规则：**

1. **只在函数组件的顶层调用 Hooks**
2. **只在 React 函数中调用 Hooks**（函数组件、自定义 Hook）

**规则示例：**

```javascript
// ✅ 正确：在顶层调用
function Component() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  
  useEffect(() => {
    console.log('effect');
  }, []);
  
  return <div>{count}</div>;
}

// ❌ 错误：在条件语句中调用
function Component() {
  if (someCondition) {
    const [count, setCount] = useState(0); // 错误！
  }
  return <div></div>;
}

// ❌ 错误：在循环中调用
function Component({ items }) {
  items.forEach(item => {
    const [value, setValue] = useState(item); // 错误！
  });
  return <div></div>;
}

// ❌ 错误：在嵌套函数中调用
function Component() {
  const handleClick = () => {
    const [count, setCount] = useState(0); // 错误！
  };
  return <button onClick={handleClick}>点击</button>;
}

// ❌ 错误：在普通 JavaScript 函数中调用
function getData() {
  const [data, setData] = useState(null); // 错误！
}
```

**为什么需要这些规则？**

React Hooks 的实现依赖于调用顺序：

```javascript
// React 内部维护一个 hooks 数组
let hooks = [];
let hookIndex = 0;

function useState(initialState) {
  const index = hookIndex;
  hookIndex++;
  
  if (hooks[index] === undefined) {
    hooks[index] = initialState;
  }
  
  return [
    hooks[index],
    (newValue) => {
      hooks[index] = newValue;
      render(); // 触发重新渲染
    }
  ];
}

// 第一次渲染
function Component() {
  const [count, setCount] = useState(0); // hookIndex = 0
  const [name, setName] = useState('');  // hookIndex = 1
}

// hooks 数组: [0, '']

// 如果在条件语句中调用
function Component({ showCount }) {
  if (showCount) {
    const [count, setCount] = useState(0); // hookIndex = 0
  }
  // showCount = false 时，跳过第一个 hook
  const [name, setName] = useState('');   // hookIndex = 1
  // 但这应该对应第一个 hook，导致状态错乱
}
```

**ESLint 插件：**

```json
{
  "eslintConfig": {
    "plugins": ["react-hooks"],
    "rules": {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    }
  }
}
```
