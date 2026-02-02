# 25. qiankun 如何实现子应用的主题切换？

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