# 9. React.memo、useMemo 和 useCallback 的区别是什么？

**答案：**

三者都是性能优化工具，但使用场景不同。

**React.memo：**
```javascript
// 组件级别的 memo（浅比较 props）
const MyComponent = React.memo(function MyComponent({ name, age }) {
  console.log('组件重新渲染');
  return <div>{name} - {age}</div>;
});

// 自定义比较函数
const MyComponent = React.memo(
  function MyComponent({ user }) {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    // 返回 true 表示 props 相等，不需要重新渲染
    return prevProps.user.id === nextProps.user.id;
  }
);
```

**useMemo：**
```javascript
// 缓存计算结果
function Component({ items }) {
  // ❌ 每次渲染都重新计算
  const expensiveValue = items
    .filter(item => item.active)
    .map(item => item.value * 2)
    .reduce((sum, val) => sum + val, 0);

  // ✅ 只在 items 变化时重新计算
  const expensiveValue = useMemo(() => {
    return items
      .filter(item => item.active)
      .map(item => item.value * 2)
      .reduce((sum, val) => sum + val, 0);
  }, [items]);

  return <div>{expensiveValue}</div>;
}
```

**useCallback：**
```javascript
// 缓存函数引用
function Component({ onClick }) {
  // ❌ 每次渲染都创建新函数
  const handleClick = () => {
    console.log('clicked');
  };

  // ✅ 只在依赖变化时创建新函数
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return <button onClick={handleClick}>点击</button>;
}

// 实际应用场景
function Parent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  // ✅ 使用 useCallback 避免子组件不必要的重渲染
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return (
    <>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
      <Child onClick={handleClick} />
    </>
  );
}

const Child = React.memo(function Child({ onClick }) {
  console.log('Child 渲染');
  return <button onClick={onClick}>子组件</button>;
});
```

**三者对比：**

| 工具 | 作用级别 | 缓存内容 | 使用场景 |
|------|---------|---------|---------|
| React.memo | 组件 | 组件渲染结果 | props 不变时避免重渲染 |
| useMemo | 值 | 计算结果 | 避免昂贵计算 |
| useCallback | 函数 | 函数引用 | 传递给子组件的回调函数 |

**useCallback 的常见陷阱：闭包陷阱**

```javascript
// ❌ 错误示例：闭包陷阱，获取不到最新的 count 值
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log(count); // 永远打印 0，因为闭包捕获了初始值
    setCount(count + 1); // 永远设置为 1
  }, []); // 依赖数组为空，函数只创建一次

  return <button onClick={handleClick}>Count: {count}</button>;
}

// ✅ 正确做法 1：添加依赖项
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log(count); // 每次都能获取到最新的 count
    setCount(count + 1);
  }, [count]); // count 变化时重新创建函数

  return <button onClick={handleClick}>Count: {count}</button>;
}

// ✅ 正确做法 2：使用函数式更新
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    setCount(prev => prev + 1); // 使用函数式更新，无需依赖 count
  }, []);

  return <button onClick={handleClick}>Count: {count}</button>;
}
```

**useCallback 与 Zustand 的闭包陷阱**

```javascript
// ❌ 错误示例：获取不到最新的 zustand 状态
import useStore from './store';

function MyComponent() {
  const increment = useStore(state => state.increment);
  const count = useStore(state => state.count);

  const handleClick = useCallback(() => {
    console.log(count); // 闭包陷阱，可能获取不到最新的 count
    increment();
  }, [increment]); // 缺少 count 依赖

  return <button onClick={handleClick}>Count: {count}</button>;
}

// ✅ 正确做法 1：添加所有依赖
function MyComponent() {
  const increment = useStore(state => state.increment);
  const count = useStore(state => state.count);

  const handleClick = useCallback(() => {
    console.log(count); // 现在能获取到最新的 count
    increment();
  }, [increment, count]); // 添加 count 依赖

  return <button onClick={handleClick}>Count: {count}</button>;
}

// ✅ 正确做法 2：在回调中直接获取最新状态
function MyComponent() {
  const increment = useStore(state => state.increment);
  const getCount = useStore(state => state.count);

  const handleClick = useCallback(() => {
    const currentCount = useStore.getState().count; // 直接获取最新状态
    console.log(currentCount);
    increment();
  }, [increment]);

  return <button onClick={handleClick}>Count: {getCount}</button>;
}

// ✅ 正确做法 3：使用 zustand 的 selector 函数
function MyComponent() {
  const increment = useStore(state => state.increment);

  const handleClick = useCallback(() => {
    increment(); // 在 store 内部处理状态更新
    console.log(useStore.getState().count); // 获取最新状态
  }, [increment]);

  const count = useStore(state => state.count);

  return <button onClick={handleClick}>Count: {count}</button>;
}
```

**为什么会出现闭包陷阱？**

问题的本质是 **React 的渲染机制和闭包捕获**：

```javascript
function Component() {
  const { mqttConfig } = useMqttStore(state => state.mqttConfig);
  
  const handleMqttMessage = useCallback(
    (data) => {
      const { deviceMac } = mqttConfig || {}; // 闭包捕获 mqttConfig
    },
    [mqttConfig]
  );
  
  const handleClick = () => {
    console.log('1. 调用前 mqttConfig:', mqttConfig.deviceMac); // 'A'
    
    // 更新 store
    setMqttStore({ deviceMac: 'B' });
    
    console.log('2. 更新后立即读取组件内的 mqttConfig:', mqttConfig.deviceMac); // 还是 'A'！
    // 因为组件还没有重新渲染，mqttConfig 变量还是旧值
    
    console.log('3. 读取 store 最新值:', useMqttStore.getState().mqttConfig.deviceMac); // 'B'
    // store 已经更新了
    
    handleMqttMessage(); // ❌ 还是打印 'A'，因为调用的是旧函数
  };
  
  return <button onClick={handleClick}>点击</button>;
}
```

**执行时序：**

```
时刻 T1: handleClick 执行
  ├─ mqttConfig 变量 = { deviceMac: 'A' }
  ├─ handleMqttMessage = fn1（闭包捕获 { deviceMac: 'A' }）
  ├─ setMqttStore({ deviceMac: 'B' })
  │   └─ store 立即更新 ✓
  ├─ mqttConfig 变量还是 { deviceMac: 'A' }（组件未重新渲染）
  └─ handleMqttMessage() 调用 fn1 → 打印 'A' ❌

时刻 T2: React 调度重新渲染
  ├─ 组件重新渲染
  ├─ mqttConfig 变量 = { deviceMac: 'B' }
  ├─ 依赖变化，创建 fn2（闭包捕获 { deviceMac: 'B' }）
  └─ handleMqttMessage = fn2

时刻 T3: 再次调用 handleMqttMessage
  └─ 调用 fn2 → 打印 'B' ✓
```

**核心原因：**

1. **闭包捕获**：`useCallback` 创建的函数会捕获创建时的 `mqttConfig` 值
2. **渲染异步**：Zustand 状态更新是同步的，但 React 组件重新渲染是异步的
3. **时序问题**：在状态更新后、组件重新渲染前调用函数，获取到的是旧值

**为什么 `getState()` 可以解决？**

```javascript
const handleMqttMessage = useCallback(
  (data) => {
    // 每次调用时都从 store 获取最新值
    const mqttConfig = useMqttStore.getState().mqttConfig; 
    console.log(mqttConfig.deviceMac);
  },
  [] // 空依赖，函数引用不变
);
```

**原理：**

- 不依赖闭包，每次调用都动态从 store 获取最新值
- 函数引用稳定，不会因为依赖变化而重新创建
- 无论何时调用，都能获取到最新的状态

**核心原则：**

1. **依赖数组必须完整**：useCallback 函数内部使用的所有外部变量都必须添加到依赖数组中
2. **函数式更新优先**：对于状态更新，优先使用函数式更新（`setCount(prev => prev + 1)`），避免依赖项
3. **直接获取最新状态**：对于 zustand 等状态管理库，可以使用 `getState()` 方法直接获取最新状态
4. **避免过度优化**：如果依赖项变化频繁，useCallback 可能反而降低性能，此时直接定义函数可能更好
