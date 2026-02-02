# 17. qiankun 解决了 single-spa 的哪些问题？

**答案：**

qiankun 在 single-spa 的基础上解决了以下问题：

### 1. HTML Entry 接入方式

**single-spa 问题**：需要子应用暴露 JS Entry，接入复杂

**qiankun 解决**：通过 HTML Entry，像 iframe 一样简单接入

```javascript
// single-spa
registerApplication({
  name: 'app1',
  app: () => System.import('//localhost:3001/main.js'),
  activeWhen: '/app1'
});

// qiankun
registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:3001',  // HTML 入口
    container: '#subapp-viewport',
    activeRule: '/app1'
  }
]);
```

### 2. 样式隔离

**single-spa 问题**：没有样式隔离，子应用样式会互相污染

**qiankun 解决**：提供三种样式隔离方案

```javascript
start({
  sandbox: {
    strictStyleIsolation: true  // Shadow DOM
  }
});
```

### 3. JS 沙箱隔离

**single-spa 问题**：没有 JS 沙箱，全局变量会互相污染

**qiankun 解决**：提供多种 JS 沙箱模式

### 4. 资源预加载

**single-spa 问题**：没有预加载机制

**qiankun 解决**：提供灵活的预加载策略

```javascript
start({
  prefetch: true
});
```

### 5. 应用间通信

**single-spa 问题**：没有内置通信机制

**qiankun 解决**：提供 Actions 全局状态管理

```javascript
const { setGlobalState, onGlobalStateChange } = initGlobalState({});
```

---