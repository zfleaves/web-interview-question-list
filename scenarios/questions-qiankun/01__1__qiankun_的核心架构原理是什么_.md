# 1. qiankun 的核心架构原理是什么？

**答案：**

qiankun 是基于 single-spa 的微前端实现框架，其核心架构包含以下几个关键部分：

1. **HTML Entry**：通过 HTML 入口文件加载子应用，自动解析 JS、CSS 等资源
2. **沙箱隔离**：通过 JS 沙箱和 CSS 沙箱实现子应用间的隔离
3. **路由调度**：基于路由变化动态加载和卸载子应用
4. **生命周期管理**：管理子应用的生命周期（bootstrap、mount、unmount）
5. **应用间通信**：提供全局状态管理和事件机制

```javascript
// qiankun 工作流程
import { registerMicroApps, start } from 'qiankun';

// 1. 注册子应用
registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:3001',  // HTML 入口
    container: '#subapp-viewport',
    activeRule: '/app1',
    props: { data: '主应用传递的数据' }
  }
]);

// 2. 启动 qiankun
start({
  sandbox: {
    strictStyleIsolation: true
  },
  prefetch: true
});
```

---