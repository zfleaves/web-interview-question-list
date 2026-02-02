# 7. qiankun 的生命周期有哪些？如何使用？

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