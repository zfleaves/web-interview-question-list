# 27. qiankun 如何实现子应用的日志收集？

**答案：**

### 1. 拦截 console

```javascript
// 主应用
const originalConsole = { ...console };

function setupConsoleProxy() {
  ['log', 'warn', 'error', 'info'].forEach(level => {
    console[level] = function(...args) {
      // 收集日志
      collectLog({
        level,
        message: args.join(' '),
        timestamp: Date.now(),
        app: currentApp?.name
      });

      // 调用原始方法
      originalConsole[level](...args);
    };
  });
}

setupConsoleProxy();
```

### 2. 全局错误监听

```javascript
window.addEventListener('error', (event) => {
  collectLog({
    level: 'error',
    message: event.error?.message || event.message,
    stack: event.error?.stack,
    timestamp: Date.now(),
    app: currentApp?.name
  });
});

window.addEventListener('unhandledrejection', (event) => {
  collectLog({
    level: 'error',
    message: event.reason?.message || 'Unhandled Promise Rejection',
    stack: event.reason?.stack,
    timestamp: Date.now(),
    app: currentApp?.name
  });
});
```

### 3. 主动上报

```javascript
// 子应用
export async function mount(props) {
  const { reportLog } = props;

  // 使用主应用提供的日志上报方法
  reportLog({
    level: 'info',
    message: '子应用挂载成功',
    timestamp: Date.now()
  });
}
```

---