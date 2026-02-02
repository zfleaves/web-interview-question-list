# 4. qiankun 的沙箱隔离机制有哪些细节？

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