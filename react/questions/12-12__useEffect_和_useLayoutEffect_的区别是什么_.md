# 12. useEffect 和 useLayoutEffect 的区别是什么？

**答案：**

**useEffect：**
- 异步执行，不阻塞浏览器绘制
- 在 DOM 更新后、屏幕绘制后执行
- 适合副作用：数据获取、订阅、手动修改 DOM

**useLayoutEffect：**
- 同步执行，阻塞浏览器绘制
- 在 DOM 更新后、屏幕绘制前执行
- 适合需要读取 DOM 布局的操作

**执行时机对比：**

```javascript
function Component() {
  const [width, setWidth] = useState(0);
  const divRef = useRef(null);

  // useEffect：在绘制后执行
  useEffect(() => {
    console.log('useEffect - DOM 已绘制');
    // 用户会看到初始状态，然后看到更新
  });

  // useLayoutEffect：在绘制前执行
  useLayoutEffect(() => {
    console.log('useLayoutEffect - DOM 已更新，未绘制');
    // 用户不会看到中间状态
    if (divRef.current) {
      setWidth(divRef.current.offsetWidth);
    }
  });

  return <div ref={divRef}>内容</div>;
}
```

**执行顺序：**

```
1. render（计算虚拟 DOM）
2. commit（更新真实 DOM）
3. useLayoutEffect（同步执行）
4. 浏览器绘制
5. useEffect（异步执行）
```

**使用场景：**

```javascript
// ✅ useEffect 适合的场景
function Component() {
  useEffect(() => {
    // 数据获取
    fetchData().then(data => setData(data));
    
    // 订阅事件
    const subscription = subscribe();
    return () => subscription.unsubscribe();
    
    // 修改 DOM（不依赖布局）
    document.title = '新标题';
  }, []);
}

// ✅ useLayoutEffect 适合的场景
function Component() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef(null);

  useLayoutEffect(() => {
    // 读取布局信息
    const rect = elementRef.current.getBoundingClientRect();
    setPosition({ x: rect.left, y: rect.top });
    
    // 同步修改 DOM 避免闪烁
    elementRef.current.style.transform = 'translateX(100px)';
  }, []);

  return <div ref={elementRef}>元素</div>;
}
```

**性能考虑：**

```javascript
// ❌ 避免在 useLayoutEffect 中执行耗时操作
useLayoutEffect(() => {
  // 这会阻塞绘制，导致卡顿
  heavyComputation();
}, []);

// ✅ 使用 useEffect
useEffect(() => {
  // 不阻塞绘制
  heavyComputation();
}, []);
```

**服务端渲染注意事项：**

```javascript
// useLayoutEffect 在服务端渲染时会报警告
// 可以使用 useEffect 替代，或使用条件渲染
function Component() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // 或加载状态
  }

  // 现在可以安全使用 useLayoutEffect
  return <ChildComponent />;
}
```
