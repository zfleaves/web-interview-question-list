# 2. qiankun 的 JS 沙箱有哪些模式？各自的实现原理是什么？

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