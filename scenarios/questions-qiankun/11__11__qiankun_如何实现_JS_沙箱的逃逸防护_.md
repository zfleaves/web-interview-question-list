# 11. qiankun 如何实现 JS 沙箱的逃逸防护？

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