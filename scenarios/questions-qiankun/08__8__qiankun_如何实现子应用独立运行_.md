# 8. qiankun 如何实现子应用独立运行？

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