# 14. useRef 的使用场景有哪些？

**答案：**

useRef 返回一个可变的 ref 对象，其 `.current` 属性被初始化为传入的参数。

**使用场景：**

1. **访问 DOM 元素：**
```javascript
function Component() {
  const inputRef = useRef(null);
  const divRef = useRef(null);

  const focusInput = () => {
    inputRef.current.focus();
  };

  useEffect(() => {
    console.log(divRef.current.offsetWidth);
  }, []);

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>聚焦输入框</button>
      <div ref={divRef}>内容</div>
    </div>
  );
}
```

2. **保存不需要触发重渲染的值：**
```javascript
function Component() {
  const [count, setCount] = useState(0);
  const renderCount = useRef(0);

  renderCount.current += 1; // 不会触发重渲染

  return (
    <div>
      <p>Count: {count}</p>
      <p>Render count: {renderCount.current}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}
```

3. **保存定时器 ID：**
```javascript
function Component() {
  const timerRef = useRef(null);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      console.log('定时器执行');
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
  };

  useEffect(() => {
    return () => {
      // 组件卸载时清理
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div>
      <button onClick={startTimer}>开始</button>
      <button onClick={stopTimer}>停止</button>
    </div>
  );
}
```

4. **保存上一次的值：**
```javascript
function Component() {
  const [count, setCount] = useState(0);
  const prevCountRef = useRef();

  useEffect(() => {
    prevCountRef.current = count;
  }, [count]);

  const prevCount = prevCountRef.current;

  return (
    <div>
      <p>当前值: {count}</p>
      <p>上一次值: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}
```

5. **可变容器（类似实例变量）：**
```javascript
function Component() {
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchData = async () => {
    const response = await fetch('/api/data');
    const data = await response.json();
    
    // 避免在已卸载的组件中更新状态
    if (isMountedRef.current) {
      setData(data);
    }
  };

  return <button onClick={fetchData}>获取数据</button>;
}
```

6. **useRef vs useState：**
```javascript
function Component() {
  // useState：更新会触发重渲染
  const [count, setCount] = useState(0);

  // useRef：更新不会触发重渲染
  const countRef = useRef(0);

  const incrementState = () => {
    setCount(count + 1); // 触发重渲染
  };

  const incrementRef = () => {
    countRef.current += 1; // 不触发重渲染
    console.log(countRef.current); // 需要手动读取
  };

  return (
    <div>
      <p>State: {count}</p>
      <p>Ref: {countRef.current}</p>
      <button onClick={incrementState}>增加 State</button>
      <button onClick={incrementRef}>增加 Ref</button>
    </div>
  );
}
```
