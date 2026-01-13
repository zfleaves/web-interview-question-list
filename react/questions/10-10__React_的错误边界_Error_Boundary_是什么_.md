# 10. React 的错误边界（Error Boundary）是什么？

**答案：**

错误边界是一种 React 组件，可以捕获子组件树中任何位置的 JavaScript 错误。

**基本用法：**

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 可以将错误日志上报给服务器
    console.error('Error caught by boundary:', error, errorInfo);
    
    // 上报错误
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 自定义降级 UI
      return this.props.fallback || <h1>出错了</h1>;
    }

    return this.props.children;
  }
}

// 使用
function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

**错误边界的特点：**

1. **只能捕获类组件中的错误**：函数组件需要用类组件包裹
2. **不能捕获以下错误**：
   - 事件处理器中的错误
   - 异步代码（setTimeout、Promise）
   - 服务端渲染
   - 错误边界自身抛出的错误

**函数组件的错误处理（React 16+）：**

```javascript
// 使用 react-error-boundary 库
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>出错了：</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>重试</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // 重置应用状态
      }}
      onError={(error) => {
        // 记录错误
      }}
    >
      <MyComponent />
    </ErrorBoundary>
  );
}
```

**实际应用场景：**

```javascript
// 分层错误边界
function App() {
  return (
    <ErrorBoundary fallback={<GlobalError />}>
      <Header />
      <ErrorBoundary fallback={<MainError />}>
        <MainContent />
      </ErrorBoundary>
      <ErrorBoundary fallback={<SidebarError />}>
        <Sidebar />
      </ErrorBoundary>
      <Footer />
    </ErrorBoundary>
  );
}
```
