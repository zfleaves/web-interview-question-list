# qiankun 微前端面试题集锦

## 1. qiankun 的核心架构原理是什么？

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

## 2. qiankun 的 JS 沙箱有哪些模式？各自的实现原理是什么？

**答案：**

qiankun 提供了三种 JS 沙箱模式：

### 1. SnapshotSandbox（快照沙箱）

**适用场景**：单实例场景（同一时间只运行一个子应用）

**实现原理**：
- 子应用挂载时，保存当前 window 对象的快照（浅拷贝）
- 子应用运行期间，所有对 window 的修改记录在 modifyPropsMap 中
- 子应用卸载时，通过快照恢复全局 window，并将子应用的修改存入内存
- 下次挂载时重新应用这些修改

```javascript
// 快照沙箱简化实现
class SnapshotSandbox {
  constructor() {
    this.windowSnapshot = {};
    this.modifyPropsMap = {};
  }

  active() {
    // 保存当前 window 快照
    this.windowSnapshot = {};
    for (const prop in window) {
      this.windowSnapshot[prop] = window[prop];
    }

    // 恢复上次的修改
    Object.keys(this.modifyPropsMap).forEach(prop => {
      window[prop] = this.modifyPropsMap[prop];
    });
  }

  inactive() {
    // 记录本次修改
    for (const prop in window) {
      if (window[prop] !== this.windowSnapshot[prop]) {
        this.modifyPropsMap[prop] = window[prop];
      }
    }

    // 恢复 window 快照
    Object.keys(this.windowSnapshot).forEach(prop => {
      window[prop] = this.windowSnapshot[prop];
    });
  }
}
```

**缺点**：无法支持多实例同时运行，频繁的快照操作影响性能

### 2. ProxySandbox（代理沙箱）

**适用场景**：多实例场景（多个子应用同时运行）

**实现原理**：
- 为每个子应用创建一个假的全局对象（fakeWindow）
- 通过 Proxy 代理对 window 的访问
- 读操作：优先从 fakeWindow 读取，若不存在则从真实 window 读取
- 写操作：所有修改仅作用于 fakeWindow，不会污染真实 window

```javascript
// 代理沙箱简化实现
class ProxySandbox {
  constructor() {
    const fakeWindow = {};
    this.proxy = new Proxy(fakeWindow, {
      get(target, key) {
        // 优先返回子应用的变量
        if (key in target) {
          return target[key];
        }
        // 不存在则从真实 window 读取
        const value = window[key];
        return typeof value === 'function'
          ? value.bind(window)
          : value;
      },
      set(target, key, value) {
        // 修改仅作用于 fakeWindow
        target[key] = value;
        return true;
      },
      has(target, key) {
        return key in target || key in window;
      }
    });
  }
}
```

**优点**：支持多实例，隔离性更好
**限制**：依赖 ES6 Proxy，不支持 IE 浏览器

### 3. LegacySandbox（遗留沙箱）

**适用场景**：不支持的 Proxy 的浏览器降级方案

**实现原理**：结合快照和代理的方案，通过劫持全局变量的读写操作实现隔离

---

## 3. qiankun 的 CSS 隔离有哪些方案？各自的优缺点是什么？

**答案：**

qiankun 提供了三种 CSS 隔离方案：

### 1. 动态样式隔离（默认）

**实现原理**：
- 子应用挂载时，动态添加子应用的样式标签
- 子应用卸载时，自动移除其样式
- 确保单实例场景子应用之间的样式隔离

```javascript
// 配置
start({
  sandbox: true  // 默认值
});
```

**优点**：
- 实现简单，无需修改子应用代码
- 性能开销小

**缺点**：
- 无法确保主应用跟子应用之间的样式隔离
- 无法确保多实例场景子应用样式隔离

### 2. Shadow DOM 隔离（严格隔离）

**实现原理**：
- 为每个微应用的容器包裹上一个 Shadow DOM 节点
- Shadow DOM 提供了封闭的 DOM 树，样式和脚本与主 DOM 树隔离

```javascript
// 配置
start({
  sandbox: {
    strictStyleIsolation: true
  }
});
```

**优点**：
- 完全隔离子应用样式，不影响全局
- 浏览器原生支持

**缺点**：
- 某些 UI 库（如弹窗组件）可能无法在 Shadow DOM 内正常运行
- 越界的 DOM 操作（如动态添加到 document.body）无法被隔离
- 需要对子应用做一些适配

### 3. Scoped CSS（作用域隔离）

**实现原理**：
- 为所有样式规则添加唯一前缀选择器 `div[data-qiankun="xxx"]`
- 限制样式仅作用于当前子应用容器
- 动态改写 style 和 link 标签中的 CSS 规则

```css
/* 原始样式 */
.button { color: red; }

/* 改写后 */
div[data-qiankun="app1"] .button { color: red; }
```

```javascript
// 配置
start({
  sandbox: {
    experimentalStyleIsolation: true
  }
});
```

**优点**：
- 兼容性好，不需要浏览器支持 Shadow DOM
- 可以隔离大部分样式冲突

**缺点**：
- 实验性功能，可能存在兼容性问题
- 无法隔离动态添加的样式
- 需要动态解析和改写 CSS，有一定性能开销

**选择建议**：
- 单实例场景：动态样式隔离 + 工程化手段（CSS Modules、BEM）
- 多实例场景：Scoped CSS 或 Shadow DOM
- 需要严格隔离：Shadow DOM（需做好适配）

---

## 4. qiankun 的沙箱隔离机制有哪些细节？

**答案：**

qiankun 的沙箱隔离机制包含以下细节：

### 1. 事件监听隔离

```javascript
// 重写 addEventListener 方法
const rawAddEventListener = window.addEventListener;
window.addEventListener = function(type, listener, options) {
  // 记录事件监听器
  sandbox.eventListeners.push({ type, listener, options });
  return rawAddEventListener.call(window, type, listener, options);
};

// 子应用卸载时自动清理
sandbox.deactivate() {
  this.eventListeners.forEach(({ type, listener, options }) => {
    window.removeEventListener(type, listener, options);
  });
}
```

### 2. 动态脚本拦截

```javascript
// 劫持 document.createElement
const rawCreateElement = document.createElement;
document.createElement = function(tagName) {
  const element = rawCreateElement.call(document, tagName);

  if (tagName === 'script') {
    // 拦截脚本加载，在沙箱中执行
    element.addEventListener('load', () => {
      sandbox.execScript(element.src);
    });
  }

  return element;
};
```

### 3. 全局 API 代理

```javascript
// 对 setInterval、setTimeout 等全局 API 做劫持
const rawSetInterval = window.setInterval;
window.setInterval = function(handler, timeout) {
  const timerId = rawSetInterval.call(window, handler, timeout);
  sandbox.timers.push(timerId);
  return timerId;
};

// 子应用卸载时清除
sandbox.deactivate() {
  this.timers.forEach(timerId => clearInterval(timerId));
}
```

### 4. History API 劫持

```javascript
// 劫持 history API 以支持路由同步
const rawPushState = window.history.pushState;
window.history.pushState = function(state, title, url) {
  rawPushState.call(window.history, state, title, url);
  // 通知主应用路由变化
  window.dispatchEvent(new PopStateEvent('popstate', { state }));
};
```

### 5. Location 代理

```javascript
// 代理 location 对象，确保子应用只能修改自己的路由
const sandboxLocation = new Proxy(window.location, {
  get(target, key) {
    return target[key];
  },
  set(target, key, value) {
    // 限制只能修改 href
    if (key === 'href') {
      target[key] = value;
    }
    return true;
  }
});
```

---

## 5. qiankun 如何实现应用间通信？

**答案：**

qiankun 提供了多种应用间通信方式：

### 1. Actions 通信（官方推荐）

```javascript
// 主应用
import { initGlobalState } from 'qiankun';

// 1. 初始化全局状态
const { onGlobalStateChange, setGlobalState } = initGlobalState({
  user: { name: '张三', role: 'admin' },
  token: 'xxx'
});

// 2. 监听状态变化
onGlobalStateChange((state, prev) => {
  console.log('主应用监听到状态变化:', state, prev);
});

// 3. 修改全局状态
setGlobalState({ user: { name: '李四' } });
```

```javascript
// 子应用
export async function mount(props) {
  // 1. 获取全局状态
  const { onGlobalStateChange, setGlobalState } = props;

  // 2. 监听状态变化
  onGlobalStateChange((state, prev) => {
    console.log('子应用监听到状态变化:', state, prev);
  });

  // 3. 修改全局状态
  setGlobalState({ token: 'new-token' });
}
```

### 2. 自定义事件通信

```javascript
// 主应用发送事件
window.dispatchEvent(new CustomEvent('app-message', {
  detail: { type: 'update', data: 'hello' }
}));

// 子应用监听事件
window.addEventListener('app-message', (event) => {
  console.log('收到消息:', event.detail);
});
```

### 3. Props 传递

```javascript
// 主应用注册时传递 props
registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/app1',
    props: {
      data: '主应用数据',
      methods: {
        sendMessage: (msg) => console.log(msg)
      }
    }
  }
]);

// 子应用接收 props
export async function mount(props) {
  console.log(props.data);
  props.methods.sendMessage('来自子应用的消息');
}
```

### 4. 全局变量（不推荐）

```javascript
// 主应用设置全局变量
window.sharedData = { user: '张三' };

// 子应用读取
const user = window.sharedData.user;
```

### 5. postMessage 通信

```javascript
// 主应用发送
const iframe = document.querySelector('#subapp-viewport iframe');
iframe.contentWindow.postMessage({ type: 'message', data: 'hello' }, '*');

// 子应用监听
window.addEventListener('message', (event) => {
  if (event.data.type === 'message') {
    console.log(event.data.data);
  }
});
```

### 6. LocalStorage 共享

```javascript
// 主应用写入
localStorage.setItem('shared-key', JSON.stringify({ data: 'hello' }));

// 子应用读取
const data = JSON.parse(localStorage.getItem('shared-key'));
```

**通信方式对比**：

| 方式 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| Actions | 官方推荐，类型安全 | 需要初始化 | 状态共享 |
| 自定义事件 | 简单直接 | 类型不安全 | 简单通信 |
| Props | 单向数据流 | 只能主→子 | 初始化数据 |
| 全局变量 | 最简单 | 容易污染全局 | 简单场景 |
| postMessage | 跨域安全 | 通信延迟 | 跨域场景 |
| LocalStorage | 持久化存储 | 同步问题 | 持久化数据 |

---

## 6. qiankun 如何实现资源预加载？

**答案：**

qiankun 提供了多种资源预加载策略：

### 1. 默认预加载

```javascript
// 第一个子应用挂载完成后预加载其他应用
start({
  prefetch: true
});
```

### 2. 全量预加载

```javascript
// 立即预加载所有子应用
start({
  prefetch: 'all'
});
```

### 3. 选择性预加载

```javascript
// 预加载指定的应用
start({
  prefetch: ['app1', 'app2']
});
```

### 4. 自定义预加载策略

```javascript
// 根据应用重要性分级预加载
start({
  prefetch: (apps) => {
    const criticalApps = apps.filter(app =>
      app.name.includes('dashboard') || app.name.includes('home')
    );
    const normalApps = apps.filter(app =>
      !criticalApps.includes(app)
    );

    return {
      criticalAppNames: criticalApps.map(app => app.name),
      minorAppsName: normalApps.map(app => app.name)
    };
  }
});
```

### 5. 预加载实现原理

```javascript
// 预加载核心逻辑
function prefetchApp(app) {
  const { entry } = app;

  // 1. 获取 HTML 内容
  fetch(entry).then(res => res.text()).then(html => {
    // 2. 解析 HTML，提取 JS 和 CSS 资源
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const scripts = Array.from(doc.querySelectorAll('script[src]'));
    const styles = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));

    // 3. 预加载 JS 资源
    scripts.forEach(script => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = script.src;
      document.head.appendChild(link);
    });

    // 4. 预加载 CSS 资源
    styles.forEach(style => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = style.href;
      document.head.appendChild(link);
    });
  });
}
```

---

## 7. qiankun 的生命周期有哪些？如何使用？

**答案：**

qiankun 的子应用需要导出三个生命周期函数：

### 1. bootstrap

```javascript
/**
 * 可选
 * 只在子应用首次加载时调用一次
 * 用于初始化一些全局资源
 */
export async function bootstrap() {
  console.log('子应用初始化');
}
```

### 2. mount

```javascript
/**
 * 必选
 * 每次子应用进入时调用
 * 用于渲染子应用
 */
export async function mount(props) {
  console.log('子应用挂载', props);

  // 接收主应用传递的 props
  const { container, onGlobalStateChange, setGlobalState } = props;

  // 渲染子应用
  const render = () => {
    ReactDOM.createRoot(container.querySelector('#root'))
      .render(<App />);
  };

  render();
}
```

### 3. unmount

```javascript
/**
 * 必选
 * 每次子应用切出/卸载时调用
 * 用于清理资源
 */
export async function unmount(props) {
  console.log('子应用卸载');

  // 卸载子应用
  const { container } = props;
  ReactDOM.unmountComponentAtNode(container.querySelector('#root'));
}
```

### 4. update（可选）

```javascript
/**
 * 可选
 * 主应用调用 loadMicroApp 的 update 方法时触发
 * 用于更新子应用
 */
export async function update(props) {
  console.log('子应用更新', props);
}
```

### 完整示例

```javascript
// 子应用入口文件
let instance = null;

export async function bootstrap() {
  console.log('React app bootstraped');
}

export async function mount(props) {
  const { container } = props;
  instance = ReactDOM.createRoot(container.querySelector('#root'))
    .render(<App />);
}

export async function unmount(props) {
  const { container } = props;
  instance.unmount();
  instance = null;
}

export async function update(props) {
  console.log('update props', props);
}
```

### 独立运行支持

```javascript
// 支持子应用独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}
```

---

## 8. qiankun 如何实现子应用独立运行？

**答案：**

子应用可以通过检测 `window.__POWERED_BY_QIANKUN__` 来判断是否在 qiankun 环境中运行：

```javascript
// 子应用入口
function render(props = {}) {
  const { container } = props;
  const dom = container
    ? container.querySelector('#root')
    : document.querySelector('#root');

  ReactDOM.createRoot(dom).render(<App />);
}

// 判断是否在 qiankun 环境中
if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
} else {
  // 独立运行
  render();
}

export async function bootstrap() {}
export async function mount(props) {
  render(props);
}
export async function unmount(props) {}
```

---

## 9. qiankun 如何处理子应用的路由？

**答案：**

qiankun 支持两种路由模式：

### 1. history 模式（推荐）

```javascript
// 主应用
import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'react-app',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/react',  // 路由前缀
  }
]);

start();

// 子应用（React Router）
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter basename="/react">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 2. hash 模式

```javascript
// 主应用
registerMicroApps([
  {
    name: 'vue-app',
    entry: '//localhost:3002',
    container: '#subapp-viewport',
    activeRule: (location) => location.pathname.startsWith('/vue')
  }
]);

// 子应用（Vue Router）
import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About }
  ]
});
```

### 3. 自定义 activeRule

```javascript
// 函数形式，支持复杂路由判断
registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: (location) => {
      // 根据查询参数判断
      const params = new URLSearchParams(location.search);
      return params.get('app') === 'app1';
    }
  }
]);
```

---

## 10. qiankun 如何实现样式隔离的增强？

**答案：**

除了 qiankun 自带的样式隔离方案，还可以结合工程化手段：

### 1. CSS Modules

```css
/* Button.module.css */
.button {
  color: red;
}
```

```javascript
import styles from './Button.module.css';

function Button() {
  return <button className={styles.button}>Click</button>;
}
```

### 2. CSS-in-JS

```javascript
import styled from 'styled-components';

const Button = styled.button`
  color: red;
`;
```

### 3. BEM 命名规范

```css
/* 主应用 */
.app-header__button { }

/* 子应用 */
.subapp-header__button { }
```

### 4. PostCSS 插件

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-prefix-selector')({
      prefix: '[data-qiankun="app1"]',
      transform(prefix, selector) {
        return `${prefix} ${selector}`;
      }
    })
  ]
};
```

---

## 11. qiankun 如何实现 JS 沙箱的逃逸防护？

**答案：**

qiankun 通过以下方式防止沙箱逃逸：

### 1. 拦截 window.top、window.parent

```javascript
const proxy = new Proxy(fakeWindow, {
  get(target, key) {
    if (key === 'top' || key === 'parent' || key === 'self' || key === 'window') {
      return proxy;  // 返回代理对象，而非真实 window
    }
    return target[key] || window[key];
  }
});
```

### 2. 拦截 document

```javascript
// 代理 document 对象
const sandboxDocument = new Proxy(document, {
  get(target, key) {
    if (key === 'createElement') {
      return (tagName) => {
        const element = target.createElement(tagName);
        if (tagName === 'script') {
          // 拦截脚本创建
        }
        return element;
      };
    }
    return target[key];
  }
});
```

### 3. 限制全局 API 访问

```javascript
// 禁止访问危险 API
const forbiddenAPIs = ['eval', 'Function', 'setTimeout', 'setInterval'];

const proxy = new Proxy(fakeWindow, {
  get(target, key) {
    if (forbiddenAPIs.includes(key)) {
      throw new Error(`Access to ${key} is forbidden`);
    }
    return target[key] || window[key];
  }
});
```

### 4. Content Security Policy

```html
<!-- 主应用设置 CSP -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' 'unsafe-inline'">
```

---

## 12. qiankun 如何实现性能优化？

**答案：**

### 1. 资源预加载

```javascript
start({
  prefetch: true  // 启用预加载
});
```

### 2. 公共依赖提取

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};
```

### 3. 懒加载

```javascript
// 手动加载子应用
import { loadMicroApp } from 'qiankun';

const app = loadMicroApp({
  name: 'app1',
  entry: '//localhost:3001',
  container: '#container'
});

// 需要时卸载
app.unmount();
```

### 4. 单例模式

```javascript
start({
  singular: true  // 同一时间只加载一个子应用
});
```

### 5. 缓存优化

```javascript
start({
  fetch: window.fetch.bind(window),  // 使用浏览器缓存
  sandbox: {
    loose: true  // 宽松模式，减少性能开销
  }
});
```

### 6. 资源压缩

```javascript
// 启用 gzip 压缩
// nginx 配置
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

---

## 13. qiankun 与 iframe 的区别是什么？

**答案：**

| 特性 | qiankun | iframe |
|------|---------|--------|
| 隔离性 | JS 沙箱 + CSS 隔离 | 完全隔离（JS、CSS、Storage） |
| 通信 | Props、Actions、事件 | postMessage |
| 性能 | 较好，共享主应用环境 | 较差，独立上下文 |
| 兼容性 | 需要现代浏览器 | 兼容性好 |
| 路由同步 | 自动同步 | 需要手动处理 |
| 共享依赖 | 支持 | 不支持 |
| SEO | 友好 | 不友好 |
| 加载速度 | 快 | 慢 |

**选择建议**：
- 需要共享状态、路由同步、性能要求高：qiankun
- 需要完全隔离、技术栈差异大、安全性要求高：iframe

---

## 14. qiankun 如何处理子应用报错？

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

## 15. qiankun 如何实现子应用的热更新？

**答案：**

### 1. 开发环境配置

```javascript
// 主应用 vite.config.ts
export default defineConfig({
  server: {
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    }
  }
});
```

### 2. 子应用配置

```javascript
// 子应用 webpack.config.js
module.exports = {
  devServer: {
    hot: true,
    port: 3001,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
};
```

### 3. HMR 集成

```javascript
// 子应用入口
if (module.hot) {
  module.hot.accept();
}
```

---

## 16. qiankun 如何实现子应用的版本管理？

**答案：**

### 1. 通过 URL 版本控制

```javascript
registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:3001/v1.0.0',
    container: '#subapp-viewport',
    activeRule: '/app1'
  }
]);
```

### 2. 动态版本管理

```javascript
// 从配置中心获取版本
async function loadMicroAppConfig() {
  const response = await fetch('/api/micro-apps');
  const configs = await response.json();

  configs.forEach(config => {
    registerMicroApps([{
      name: config.name,
      entry: config.entry,
      container: '#subapp-viewport',
      activeRule: config.activeRule
    }]);
  });
}
```

### 3. 灰度发布

```javascript
// 根据用户特征加载不同版本
registerMicroApps([
  {
    name: 'app1',
    entry: isBetaUser
      ? '//localhost:3001/v2.0.0'
      : '//localhost:3001/v1.0.0',
    container: '#subapp-viewport',
    activeRule: '/app1'
  }
]);
```

---

## 17. qiankun 解决了 single-spa 的哪些问题？

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

## 18. qiankun 的 HTML Entry 是如何实现的？

**答案：**

HTML Entry 是 qiankun 的核心特性，通过以下步骤实现：

### 1. 获取 HTML 内容

```javascript
async function importEntry(entry) {
  const { template, execScripts, assetPublicPath } = await importHTML(entry);

  return {
    template,
    assetPublicPath,
    execScripts
  };
}
```

### 2. 解析 HTML

```javascript
export async function importHTML(url) {
  const html = await fetch(url).then(res => res.text());

  // 创建 DOM 解析器
  const div = document.createElement('div');
  div.innerHTML = html;

  // 提取资源
  const scripts = Array.from(div.querySelectorAll('script'));
  const styles = Array.from(div.querySelectorAll('link[rel="stylesheet"]'));

  return {
    template: html,
    scripts: scripts.map(script => script.src),
    styles: styles.map(style => style.href)
  };
}
```

### 3. 加载资源

```javascript
async function execScripts(scripts) {
  for (const script of scripts) {
    await loadScript(script);
  }
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
```

### 4. 执行生命周期

```javascript
const { template, execScripts } = await importEntry('//localhost:3001');

// 渲染模板
container.innerHTML = template;

// 执行脚本，获取生命周期
const lifeCycles = await execScripts();

// 调用生命周期
await lifeCycles.bootstrap(props);
await lifeCycles.mount(props);
```

---

## 19. qiankun 如何处理共享依赖？

**答案：**

qiankun 支持共享依赖的多种方案：

### 1. Webpack Externals

**主应用**：
```javascript
// webpack.config.js
module.exports = {
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    vue: 'Vue'
  }
};
```

**子应用**：
```javascript
// webpack.config.js
module.exports = {
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
};
```

**主应用 HTML**：
```html
<script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"></script>
```

### 2. Module Federation

**主应用 webpack.config.js**：
```javascript
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {},
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      }
    })
  ]
};
```

**子应用 webpack.config.js**：
```javascript
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.js',
      exposes: {},
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      }
    })
  ]
};
```

### 3. CDN 共享

```javascript
// 主应用
window.React = React;
window.ReactDOM = ReactDOM;

// 子应用
import React from 'react';
import ReactDOM from 'react-dom';
```

---

## 20. qiankun 如何实现子应用的懒加载？

**答案：**

### 1. 基于路由的懒加载（默认）

```javascript
registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/app1'
  }
]);

start();
// 只有当路由匹配 /app1 时才会加载
```

### 2. 手动加载

```javascript
import { loadMicroApp } from 'qiankun';

// 按需加载
let app = null;

function loadApp() {
  app = loadMicroApp({
    name: 'app1',
    entry: '//localhost:3001',
    container: '#container'
  });
}

function unloadApp() {
  app?.unmount();
  app = null;
}
```

### 3. 条件加载

```javascript
// 根据用户权限加载
if (user.hasPermission('app1')) {
  registerMicroApps([{
    name: 'app1',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/app1'
  }]);
}
```

---

## 21. qiankun 如何监控子应用的性能？

**答案：**

### 1. 生命周期耗时监控

```javascript
registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/app1',
    props: {
      onPerformance: (metrics) => {
        console.log('性能指标:', metrics);
        // 上报到监控系统
        reportPerformance(metrics);
      }
    }
  }
]);
```

### 2. 自定义 Loader

```javascript
registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/app1',
    loader: (loading) => {
      const startTime = performance.now();

      if (loading) {
        console.log('开始加载应用');
      } else {
        const duration = performance.now() - startTime;
        console.log(`应用加载完成，耗时 ${duration}ms`);
        reportMetric({
          type: 'app_load',
          duration,
          app: 'app1'
        });
      }
    }
  }
]);
```

### 3. Resource Timing API

```javascript
// 监控资源加载时间
const resources = performance.getEntriesByType('resource');
const appResources = resources.filter(r => r.name.includes('localhost:3001'));

appResources.forEach(resource => {
  console.log(`${resource.name}: ${resource.duration}ms`);
});
```

---

## 22. qiankun 如何实现子应用的降级方案？

**答案：**

### 1. 加载失败降级

```javascript
registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/app1',
    errorHandler: (error) => {
      console.error('子应用加载失败:', error);

      // 降级方案 1：显示错误页面
      document.getElementById('subapp-viewport').innerHTML =
        '<div class="error-page">应用加载失败，请刷新重试</div>';

      // 降级方案 2：加载备用版本
      loadBackupApp();

      // 降级方案 3：跳转到独立页面
      window.location.href = '/app1-standalone.html';
    }
  }
]);
```

### 2. 版本降级

```javascript
async function loadAppWithFallback(appName) {
  const versions = ['v2.0.0', 'v1.0.0', 'v0.9.0'];

  for (const version of versions) {
    try {
      const entry = `//localhost:3001/${version}`;
      await loadMicroApp({ name: appName, entry, container: '#container' });
      return;
    } catch (error) {
      console.warn(`版本 ${version} 加载失败，尝试下一个版本`);
    }
  }

  // 所有版本都失败
  showErrorPage();
}
```

### 3. 功能降级

```javascript
// 检测浏览器支持
if (!window.Proxy) {
  // 降级到 iframe 方案
  loadAppInIframe();
} else {
  // 使用 qiankun
  loadAppWithQiankun();
}
```

---

## 23. qiankun 如何处理子应用的缓存？

**答案：**

### 1. 资源缓存

```javascript
// 使用浏览器缓存
start({
  fetch: window.fetch.bind(window)
});
```

### 2. 应用缓存

```javascript
// 缓存已加载的应用
const appCache = new Map();

async function loadAppWithCache(app) {
  if (appCache.has(app.name)) {
    return appCache.get(app.name);
  }

  const loadedApp = await loadMicroApp(app);
  appCache.set(app.name, loadedApp);
  return loadedApp;
}
```

### 3. Service Worker 缓存

```javascript
// 注册 Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// sw.js
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('localhost:3001')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});
```

---

## 24. qiankun 如何实现子应用的权限控制？

**答案：**

### 1. 路由级权限控制

```javascript
// 主应用
function hasPermission(appName) {
  const user = getUserInfo();
  return user.permissions.includes(appName);
}

registerMicroApps(
  apps.filter(app => hasPermission(app.name))
);
```

### 2. 组件级权限控制

```javascript
// 主应用传递权限信息
registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/app1',
    props: {
      permissions: ['read', 'write'],
      hasPermission: (permission) => {
        return props.permissions.includes(permission);
      }
    }
  }
]);
```

### 3. API 级权限控制

```javascript
// 子应用
export async function mount(props) {
  const { hasPermission } = props;

  // 根据权限控制功能
  if (hasPermission('write')) {
    showWriteButton();
  }
}
```

---

## 25. qiankun 如何实现子应用的主题切换？

**答案：**

### 1. CSS 变量方案

```css
/* 主应用 */
:root {
  --primary-color: #1890ff;
  --background-color: #ffffff;
}

/* 子应用 */
.button {
  background-color: var(--primary-color);
}
```

```javascript
// 主题切换
function setTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.style.setProperty('--primary-color', '#177ddc');
    root.style.setProperty('--background-color', '#141414');
  } else {
    root.style.setProperty('--primary-color', '#1890ff');
    root.style.setProperty('--background-color', '#ffffff');
  }
}
```

### 2. Props 传递主题

```javascript
// 主应用
registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/app1',
    props: {
      theme: 'dark'
    }
  }
]);

// 子应用
export async function mount(props) {
  const { theme } = props;
  document.body.setAttribute('data-theme', theme);
}
```

### 3. 全局状态管理主题

```javascript
// 主应用
const { setGlobalState } = initGlobalState({ theme: 'light' });

function changeTheme(theme) {
  setGlobalState({ theme });
}

// 子应用
export async function mount(props) {
  const { onGlobalStateChange } = props;

  onGlobalStateChange((state) => {
    document.body.setAttribute('data-theme', state.theme);
  });
}
```

---

## 26. qiankun 如何处理子应用的国际化？

**答案：**

### 1. 主应用统一管理

```javascript
// 主应用
const i18n = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
});

registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/app1',
    props: {
      i18n,
      t: i18n.global.t
    }
  }
]);

// 子应用
export async function mount(props) {
  const { t } = props;
  console.log(t('hello'));
}
```

### 2. 子应用独立管理

```javascript
// 子应用
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
});

// 通过 props 接收主应用的语言设置
export async function mount(props) {
  if (props.locale) {
    i18n.global.locale = props.locale;
  }
}
```

### 3. 全局状态同步

```javascript
// 主应用
const { setGlobalState } = initGlobalState({
  locale: 'zh-CN'
});

function changeLocale(locale) {
  setGlobalState({ locale });
}

// 子应用
export async function mount(props) {
  props.onGlobalStateChange((state) => {
    i18n.global.locale = state.locale;
  });
}
```

---

## 27. qiankun 如何实现子应用的日志收集？

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

## 28. qiankun 如何处理子应用的依赖冲突？

**答案：**

### 1. 版本锁定

```javascript
// package.json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "resolutions": {
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}
```

### 2. Webpack 配置

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom')
    }
  }
};
```

### 3. Module Federation

```javascript
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.0.0'
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.0.0'
        }
      }
    })
  ]
};
```

---

## 29. qiankun 如何实现子应用的灰度发布？

**答案：**

### 1. 基于用户特征的灰度

```javascript
// 根据用户 ID 分流
function shouldLoadNewVersion(userId) {
  // 取用户 ID 的哈希值
  const hash = hashCode(userId);
  // 10% 的用户使用新版本
  return hash % 10 === 0;
}

registerMicroApps([
  {
    name: 'app1',
    entry: shouldLoadNewVersion(userId)
      ? '//localhost:3001/v2.0.0'
      : '//localhost:3001/v1.0.0',
    container: '#subapp-viewport',
    activeRule: '/app1'
  }
]);
```

### 2. 基于路由的灰度

```javascript
// 特定路由使用新版本
registerMicroApps([
  {
    name: 'app1',
    entry: (location) => {
      if (location.pathname.startsWith('/app1/beta')) {
        return '//localhost:3001/v2.0.0';
      }
      return '//localhost:3001/v1.0.0';
    },
    container: '#subapp-viewport',
    activeRule: '/app1'
  }
]);
```

### 3. 动态配置

```javascript
// 从配置中心获取灰度配置
async function loadGrayConfig() {
  const response = await fetch('/api/gray-config');
  const config = await response.json();

  return config.apps;
}

// 使用配置加载应用
async function loadAppsWithGrayConfig() {
  const apps = await loadGrayConfig();
  registerMicroApps(apps);
}
```

---

## 30. qiankun 的最佳实践有哪些？

**答案：**

### 1. 项目结构

```
micro-frontend/
├── main-app/          # 主应用
│   ├── src/
│   │   ├── micro-apps/  # 子应用配置
│   │   └── shared/      # 共享资源
│   └── package.json
├── sub-app1/          # 子应用1
├── sub-app2/          # 子应用2
└── shared/            # 共享依赖
```

### 2. 代码规范

- **命名规范**：子应用使用统一的前缀（如 `@company/app1`）
- **版本管理**：使用语义化版本号
- **API 规范**：统一接口规范和数据格式

### 3. 样式规范

- 使用 CSS Modules 或 CSS-in-JS
- 采用 BEM 命名规范
- 使用 CSS 变量定义主题

### 4. 通信规范

- 优先使用 Global State 进行状态共享
- 避免直接操作全局变量
- 统一事件命名规范

### 5. 错误处理

- 子应用必须导出完整的生命周期函数
- 实现错误边界
- 添加全局错误监听

### 6. 性能优化

- 启用资源预加载
- 提取公共依赖
- 使用 CDN 加速

### 7. 监控告警

- 收集子应用性能指标
- 监控错误和异常
- 设置告警规则

### 8. 部署策略

- 独立部署子应用
- 使用 CI/CD 自动化部署
- 实现蓝绿部署或金丝雀发布

---

## 31. 多个子应用（Vue、React）之间如何处理通信和路由跳转？

**答案：**

### 1. 不同技术栈子应用之间的通信

#### 1.1 使用 Global State（推荐）

无论子应用使用什么技术栈，都可以通过 qiankun 的 Global State 进行通信：

```javascript
// 主应用
import { initGlobalState } from 'qiankun';

const actions = initGlobalState({
  user: { name: '张三', id: 1 },
  theme: 'light',
  sharedData: {}
});

// Vue 子应用
export async function mount(props) {
  // 监听全局状态变化
  props.onGlobalStateChange((state, prev) => {
    console.log('Vue 子应用监听到变化:', state, prev);
    // 更新 Vue 组件状态
    this.user = state.user;
    this.theme = state.theme;
  });

  // 修改全局状态
  props.setGlobalState({
    sharedData: { from: 'vue', message: 'Hello from Vue' }
  });
}

// React 子应用
export async function mount(props) {
  // 监听全局状态变化
  props.onGlobalStateChange((state, prev) => {
    console.log('React 子应用监听到变化:', state, prev);
    // 更新 React 组件状态
    setUser(state.user);
    setTheme(state.theme);
  });

  // 修改全局状态
  props.setGlobalState({
    sharedData: { from: 'react', message: 'Hello from React' }
  });
}
```

#### 1.2 使用自定义事件总线

创建一个不依赖框架的全局事件总线：

```javascript
// 主应用
window.eventBus = {
  events: {},
  on(event, callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  },
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(cb => cb(data));
    }
  },
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
};

// Vue 子应用发送事件
window.eventBus.emit('user-login', { 
  from: 'vue', 
  user: { name: '张三' } 
});

// React 子应用监听事件
useEffect(() => {
  const handler = (data) => {
    console.log('React 收到 Vue 的事件:', data);
    setUser(data.user);
  };

  window.eventBus.on('user-login', handler);

  return () => {
    window.eventBus.off('user-login', handler);
  };
}, []);
```

#### 1.3 使用 RxJS 进行响应式通信

```javascript
// 主应用
import { BehaviorSubject } from 'rxjs';

const sharedState$ = new BehaviorSubject({
  user: null,
  theme: 'light'
});

// 将 Observable 挂载到 window，供子应用使用
window.sharedState$ = sharedState$;
window.sharedStateObserver = sharedState$.asObservable();

// Vue 子应用
export async function mount(props) {
  // 订阅状态变化
  this.subscription = window.sharedStateObserver.subscribe(state => {
    console.log('Vue 收到状态更新:', state);
    this.$set(state);
  });

  // 发送状态更新
  window.sharedState$.next({ user: { name: '李四' } });
}

export async function unmount() {
  if (this.subscription) {
    this.subscription.unsubscribe();
  }
}

// React 子应用
export async function mount(props) {
  // 订阅状态变化
  this.subscription = window.sharedStateObserver.subscribe(state => {
    console.log('React 收到状态更新:', state);
    setState(state);
  });

  // 发送状态更新
  window.sharedState$.next({ theme: 'dark' });
}

export async function unmount() {
  if (this.subscription) {
    this.subscription.unsubscribe();
  }
}
```

#### 1.4 使用 postMessage（适用于 iframe 场景）

```javascript
// Vue 子应用发送消息
window.parent.postMessage({
  type: 'VUE_MESSAGE',
  from: 'vue-app',
  data: { message: 'Hello from Vue' }
}, '*');

// React 子应用接收消息
useEffect(() => {
  const handleMessage = (event) => {
    if (event.data.type === 'VUE_MESSAGE') {
      console.log('React 收到 Vue 消息:', event.data);
      setVueMessage(event.data.data);
    }
  };

  window.addEventListener('message', handleMessage);

  return () => {
    window.removeEventListener('message', handleMessage);
  };
}, []);
```

### 2. 不同技术栈子应用之间的路由跳转

#### 2.1 主应用控制路由跳转（推荐）

**问题**：直接使用 `window.history.pushState` 会导致页面重新加载

**解决方案**：使用主应用提供的路由方法，确保在单页应用内跳转

```javascript
// 主应用
import { history } from 'umi'; // 或使用 createBrowserHistory

// 从 Vue 子应用跳转到 React 子应用
function navigateToReactApp(path) {
  history.push(`/react${path}`);
}

// 从 React 子应用跳转到 Vue 子应用
function navigateToVueApp(path) {
  history.push(`/vue${path}`);
}
```

#### 2.2 子应用内部路由跳转

子应用内部的跳转不会导致页面重新加载：

```javascript
// Vue 子应用内部跳转
this.$router.push('/detail');
// 或
import { useRouter } from 'vue-router';
const router = useRouter();
router.push('/detail');

// React 子应用内部跳转
import { useHistory } from 'react-router-dom';
const history = useHistory();
history.push('/detail');
```

#### 2.3 跨技术栈子应用路由跳转（避免页面重新加载）

**错误做法**（会导致页面重新加载）：
```javascript
// ❌ 错误：直接使用 window.history.pushState
window.history.pushState({}, '', '/react/dashboard');
```

**正确做法**（使用主应用提供的路由方法）：

```javascript
// Vue 子应用跳转到 React 子应用
export async function mount(props) {
  // ✅ 方法1：使用主应用提供的路由方法（推荐）
  if (props.mainAppHistory) {
    props.mainAppHistory.push('/react/dashboard');
  }

  // ✅ 方法2：使用 qiankun 的路由跳转
  // 需要在主应用中配置路由监听
}

// React 子应用跳转到 Vue 子应用
export async function mount(props) {
  // ✅ 使用主应用提供的路由方法（推荐）
  if (props.mainAppHistory) {
    props.mainAppHistory.push('/vue/home');
  }
}
```

#### 2.4 主应用配置路由监听

为了避免页面重新加载，主应用需要正确配置路由监听：

```javascript
// 主应用
import { registerMicroApps, start } from 'qiankun';
import { createBrowserHistory } from 'history';

// 创建 history 实例
const history = createBrowserHistory();

// 监听路由变化
history.listen(({ location }) => {
  console.log('路由变化:', location.pathname);
});

// 注册子应用
registerMicroApps([
  {
    name: 'vue-app',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/vue',
    props: {
      // 将 history 方法传递给子应用
      mainAppHistory: history
    }
  },
  {
    name: 'react-app',
    entry: '//localhost:3002',
    container: '#subapp-viewport',
    activeRule: '/react',
    props: {
      mainAppHistory: history
    }
  }
]);

// 启动 qiankun
start({
  singular: false  // 允许多个子应用同时存在
});
```

#### 2.5 带参数的路由跳转

```javascript
// Vue 子应用跳转到 React 子应用并传递参数
export async function mount(props) {
  if (props.mainAppHistory) {
    props.mainAppHistory.push('/react/detail?id=123&from=vue');
  }
}

// React 子应用接收参数
import { useLocation } from 'react-router-dom';

function DetailPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const from = params.get('from');

  console.log('id:', id, 'from:', from);
}
```

### 3. 不同技术栈子应用的状态同步

#### 3.1 使用 Global State 同步用户信息

```javascript
// 主应用
const actions = initGlobalState({
  user: null,
  isAuthenticated: false
});

// 用户登录后更新全局状态
function login(user) {
  actions.setGlobalState({
    user: user,
    isAuthenticated: true
  });
}

// Vue 子应用监听登录状态
export async function mount(props) {
  props.onGlobalStateChange((state) => {
    if (state.isAuthenticated) {
      this.user = state.user;
      this.isLoggedIn = true;
    } else {
      this.$router.push('/login');
    }
  });
}

// React 子应用监听登录状态
export async function mount(props) {
  props.onGlobalStateChange((state) => {
    if (state.isAuthenticated) {
      setUser(state.user);
      setIsLoggedIn(true);
    } else {
      navigate('/login');
    }
  });
}
```

#### 3.2 使用 Global State 同步主题

```javascript
// 主应用
const actions = initGlobalState({
  theme: 'light'
});

function toggleTheme() {
  actions.setGlobalState({
    theme: theme === 'light' ? 'dark' : 'light'
  });
}

// Vue 子应用监听主题变化
export async function mount(props) {
  props.onGlobalStateChange((state) => {
    document.documentElement.setAttribute('data-theme', state.theme);
    this.theme = state.theme;
  });
}

// React 子应用监听主题变化
export async function mount(props) {
  props.onGlobalStateChange((state) => {
    document.documentElement.setAttribute('data-theme', state.theme);
    setTheme(state.theme);
  });
}
```

### 4. Vue 和 React 子应用的最佳实践

#### 4.1 统一的接口规范

```javascript
// 定义统一的接口类型
interface SubAppProps {
  onGlobalStateChange: (callback: (state: any, prev: any) => void) => void;
  setGlobalState: (state: any) => void;
  getGlobalState: () => any;
  mainAppHistory?: any;
}

// Vue 子应用
export async function mount(props: SubAppProps) {
  const { onGlobalStateChange, setGlobalState } = props;

  onGlobalStateChange((state) => {
    // 处理状态变化
  });

  setGlobalState({ vueReady: true });
}

// React 子应用
export async function mount(props: SubAppProps) {
  const { onGlobalStateChange, setGlobalState } = props;

  useEffect(() => {
    const unsubscribe = onGlobalStateChange((state) => {
      // 处理状态变化
    });

    setGlobalState({ reactReady: true });

    return unsubscribe;
  }, []);
}
```

#### 4.2 统一的路由配置

```javascript
// 主应用路由配置
const routes = [
  {
    path: '/vue/*',
    microApp: 'vue-app'
  },
  {
    path: '/react/*',
    microApp: 'react-app'
  }
];

// Vue 子应用路由配置
const router = new VueRouter({
  mode: 'history',
  base: window.__POWERED_BY_QIANKUN__ ? '/vue' : '/',
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About }
  ]
});

// React 子应用路由配置
<BrowserRouter basename={window.__POWERED_BY_QIANKUN__ ? '/react' : '/'}>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
  </Routes>
</BrowserRouter>
```

#### 4.3 统一的错误处理

```javascript
// 主应用统一错误处理
registerMicroApps([
  {
    name: 'vue-app',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/vue',
    props: {
      onError: (error) => {
        console.error('Vue 子应用错误:', error);
        // 统一错误上报
        reportError(error, 'vue-app');
      }
    }
  },
  {
    name: 'react-app',
    entry: '//localhost:3002',
    container: '#subapp-viewport',
    activeRule: '/react',
    props: {
      onError: (error) => {
        console.error('React 子应用错误:', error);
        // 统一错误上报
        reportError(error, 'react-app');
      }
    }
  }
]);

// Vue 子应用
export async function mount(props) {
  try {
    // Vue 应用逻辑
  } catch (error) {
    props.onError?.(error);
  }
}

// React 子应用
export async function mount(props) {
  try {
    // React 应用逻辑
  } catch (error) {
    props.onError?.(error);
  }
}
```

### 5. 实际案例：Vue 子应用与 React 子应用的完整交互

```javascript
// 场景：Vue 子应用显示商品列表，React 子应用显示商品详情

// 1. 用户在 Vue 子应用点击商品
// Vue 子应用
methods: {
  handleProductClick(product) {
    // 方法1：使用 Global State
    props.setGlobalState({ selectedProduct: product });

    // 方法2：使用事件总线
    window.eventBus.emit('product-selected', product);

    // 方法3：跳转到 React 子应用
    window.history.pushState({}, '', `/react/detail?id=${product.id}`);
  }
}

// 2. React 子应用接收并显示商品详情
// React 子应用
export async function mount(props) {
  // 监听 Global State
  props.onGlobalStateChange((state) => {
    if (state.selectedProduct) {
      setSelectedProduct(state.selectedProduct);
    }
  });

  // 监听事件总线
  useEffect(() => {
    const handler = (data) => {
      setSelectedProduct(data);
    };

    window.eventBus.on('product-selected', handler);

    return () => {
      window.eventBus.off('product-selected', handler);
    };
  }, []);

  // 处理 URL 参数
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const productId = params.get('id');

    if (productId) {
      fetchProductDetail(productId);
    }
  }, [location.search]);
}

// 3. React 子应用返回到 Vue 子应用
// React 子应用
function DetailPage() {
  const navigateBack = () => {
    // 方法1：使用 Global State 清除选中状态
    props.setGlobalState({ selectedProduct: null });

    // 方法2：跳转回 Vue 子应用
    window.history.pushState({}, '', '/vue/products');
  };

  return (
    <div>
      <h1>{selectedProduct.name}</h1>
      <button onClick={navigateBack}>返回列表</button>
    </div>
  );
}
```

### 总结

Vue 和 React 子应用之间的通信和路由跳转主要方案：

1. **通信方式**：
   - Global State（推荐，框架无关）
   - 自定义事件总线
   - RxJS（响应式数据流）
   - postMessage（跨 iframe 场景）

2. **路由跳转**：
   - 主应用控制路由
   - 子应用内部路由
   - 跨应用路由跳转
   - 带参数的路由跳转

3. **最佳实践**：
   - 使用统一的接口规范
   - 统一的路由配置
   - 统一的错误处理
   - 使用 Global State 进行状态同步

---

## 总结

以上涵盖了 qiankun 微前端的核心知识点，包括：

1. **核心架构**：HTML Entry、沙箱隔离、路由调度、生命周期管理
2. **JS 沙箱**：SnapshotSandbox、ProxySandbox、LegacySandbox
3. **CSS 隔离**：动态样式隔离、Shadow DOM、Scoped CSS
4. **沙箱细节**：事件监听隔离、动态脚本拦截、全局 API 代理
5. **应用通信**：Actions、自定义事件、Props、postMessage、LocalStorage
6. **资源管理**：预加载、懒加载、缓存优化
7. **生命周期**：bootstrap、mount、unmount、update
8. **路由处理**：history 模式、hash 模式、自定义 activeRule
9. **样式隔离增强**：CSS Modules、CSS-in-JS、BEM、PostCSS
10. **沙箱逃逸防护**：拦截 window、document、全局 API
11. **性能优化**：预加载、公共依赖提取、懒加载、单例模式
12. **错误处理**：全局错误捕获、生命周期错误、错误边界
13. **热更新**：开发环境配置、HMR 集成
14. **版本管理**：URL 版本控制、动态版本管理、灰度发布
15. **共享依赖**：Webpack Externals、Module Federation、CDN 共享
16. **权限控制**：路由级、组件级、API 级权限控制
17. **主题切换**：CSS 变量、Props 传递、全局状态管理
18. **国际化**：主应用统一管理、子应用独立管理、全局状态同步
19. **日志收集**：拦截 console、全局错误监听、主动上报
20. **最佳实践**：项目结构、代码规范、样式规范、通信规范、错误处理、性能优化、监控告警

这些内容能够帮助你全面掌握 qiankun 微前端架构的核心知识点和最佳实践！