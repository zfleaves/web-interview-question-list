# 5. qiankun 如何实现应用间通信？

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