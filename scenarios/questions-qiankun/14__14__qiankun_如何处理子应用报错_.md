# 14. qiankun 如何处理子应用报错？

**答案：**

### 1. 全局错误捕获

```javascript
// 主应用
registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/app1',
    // 错误处理
    errorHandler: (error) => {
      console.error('子应用加载失败:', error);
      // 显示错误页面
      document.getElementById('subapp-viewport').innerHTML =
        '<div>应用加载失败，请刷新重试</div>';
    }
  }
]);
```

### 2. 生命周期错误处理

```javascript
// 子应用
export async function mount(props) {
  try {
    render(props);
  } catch (error) {
    console.error('子应用挂载失败:', error);
    // 通知主应用
    props.onError?.(error);
  }
}
```

### 3. 全局错误监听

```javascript
// 主应用
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise 错误:', event.reason);
});
```

### 4. 错误边界（React）

```javascript
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('错误边界捕获:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>应用出错了，请刷新重试</div>;
    }
    return this.props.children;
  }
}
```

---