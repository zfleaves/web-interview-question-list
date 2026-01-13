# 7. React 的 setState 是同步还是异步的？

**答案：**

setState 的执行时机取决于调用上下文：

**异步情况（批量更新）：**
```javascript
function Component() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  const handleClick = () => {
    // React 事件处理函数中：批量更新
    setCount(count + 1);  // 不会立即更新
    setName('new');       // 不会立即更新
    console.log(count);   // 仍然是 0
  };

  return <button onClick={handleClick}>点击</button>;
}
```

**同步情况（React 18 自动批处理）：**
```javascript
// React 18+：所有更新都会被批处理
function Component() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  const handleClick = () => {
    setTimeout(() => {
      // 异步回调中也会批处理（React 18+）
      setCount(count + 1);
      setName('new');
      console.log(count);  // 仍然是 0
    }, 0);

    fetch('/api').then(() => {
      // Promise 回调中也会批处理（React 18+）
      setCount(count + 1);
    });
  };

  return <button onClick={handleClick}>点击</button>;
}
```

**函数式更新（推荐）：**
```javascript
// ✅ 使用函数式更新，确保基于最新状态
const increment = () => {
  setCount(prev => prev + 1);  // prev 是最新值
  setCount(prev => prev + 1);  // 累加 2
};

// ❌ 直接使用值
const increment = () => {
  setCount(count + 1);  // 基于旧值
  setCount(count + 1);  // 只增加 1
};
```

**强制同步更新：**
```javascript
// React 18：使用 flushSync 强制同步更新
import { flushSync } from 'react-dom';

function Component() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    flushSync(() => {
      setCount(count + 1);  // 立即更新
    });
    console.log(count);  // 1
  };

  return <button onClick={handleClick}>点击</button>;
}
```
