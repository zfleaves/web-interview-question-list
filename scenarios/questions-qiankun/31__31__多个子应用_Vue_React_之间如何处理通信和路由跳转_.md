# 31. 多个子应用（Vue、React）之间如何处理通信和路由跳转？

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