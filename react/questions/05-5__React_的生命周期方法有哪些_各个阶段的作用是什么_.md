# 5. React 的生命周期方法有哪些？各个阶段的作用是什么？

**答案：**

**类组件生命周期（React 17 及之前）：**

```javascript
class MyComponent extends React.Component {
  // 1. 挂载阶段（Mounting）
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  static getDerivedStateFromProps(props, state) {
    // 从 props 派生 state
    return null;
  }

  componentDidMount() {
    // DOM 已挂载，适合发送请求、订阅事件
    console.log('组件已挂载');
  }

  // 2. 更新阶段（Updating）
  shouldComponentUpdate(nextProps, nextState) {
    // 决定是否重新渲染
    return true;
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    // 更新前获取 DOM 信息
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // DOM 已更新，适合发送请求
  }

  // 3. 卸载阶段（Unmounting）
  componentWillUnmount() {
    // 清理工作：取消订阅、清除定时器
  }

  // 4. 错误处理
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误
  }
}
```

**函数组件生命周期映射：**

```javascript
function MyComponent() {
  // componentDidMount + componentDidUpdate
  useEffect(() => {
    console.log('组件挂载或更新');
    return () => {
      console.log('组件卸载或依赖变化前清理');
    };
  }, [dependencies]);

  // componentDidMount
  useEffect(() => {
    console.log('仅挂载时执行');
  }, []);

  // componentWillUnmount
  useEffect(() => {
    return () => {
      console.log('组件卸载时清理');
    };
  }, []);

  // shouldComponentUpdate
  const MemoizedComponent = React.memo(Component);

  // getSnapshotBeforeUpdate + componentDidUpdate
  const prevRef = useRef();
  useEffect(() => {
    if (prevRef.current !== null) {
      console.log('更新了', prevRef.current);
    }
    prevRef.current = value;
  }, [value]);
}
```
