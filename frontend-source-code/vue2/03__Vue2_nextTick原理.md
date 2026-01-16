# Vue2 nextTick 原理

## 核心概念

nextTick 是 Vue 提供的异步更新 DOM 的方法，用于在下次 DOM 更新循环结束之后执行延迟回调。

**核心作用：**
1. 确保 DOM 更新完成后再执行回调
2. 合并多次数据修改，避免频繁更新 DOM
3. 提供微任务和宏任务的降级方案

## 源码核心实现

### 1. nextTick 函数

```javascript
// 回调队列
const callbacks = [];
let pending = false;

// 执行所有回调
function flushCallbacks() {
  pending = false;
  const copies = callbacks.slice(0);
  callbacks.length = 0;
  for (let i = 0; i < copies.length; i++) {
    copies[i]();
  }
}

// 异步执行函数的降级策略
let timerFunc;

// 优先使用 Promise（微任务）
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve();
  timerFunc = () => {
    p.then(flushCallbacks);
    // iOS 中有时会卡住，需要强制刷新微任务队列
    if (isIOS) setTimeout(noop);
  };
  isUsingMicroTask = true;
}
// 降级到 MutationObserver（微任务）
else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  let counter = 1;
  const observer = new MutationObserver(flushCallbacks);
  const textNode = document.createTextNode(String(counter));
  observer.observe(textNode, {
    characterData: true
  });
  timerFunc = () => {
    counter = (counter + 1) % 2;
    textNode.data = String(counter);
  };
  isUsingMicroTask = true;
}
// 降级到 setImmediate（宏任务，IE 支持）
else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  timerFunc = () => {
    setImmediate(flushCallbacks);
  };
}
// 最后降级到 setTimeout（宏任务）
else {
  timerFunc = () => {
    setTimeout(flushCallbacks, 0);
  };
}

// nextTick 核心函数
export function nextTick(cb, ctx) {
  let _resolve;
  // 将回调加入队列
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx);
      } catch (e) {
        handleError(e, ctx, 'nextTick');
      }
    } else if (_resolve) {
      _resolve(ctx);
    }
  });
  
  // 如果没有等待中的更新，启动异步执行
  if (!pending) {
    pending = true;
    timerFunc();
  }
  
  // 如果没有回调，返回 Promise
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve;
    });
  }
}
```

### 2. Watcher 更新队列

```javascript
// Watcher 更新时调用
Watcher.prototype.update = function () {
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync) {
    this.run();
  } else {
    queueWatcher(this); // 加入更新队列
  }
};

// 更新队列
const queue = [];
let has = {};
let waiting = false;
let flushing = false;
let index = 0;

// 将 watcher 加入队列
function queueWatcher(watcher) {
  const id = watcher.id;
  // 去重：同一个 watcher 只加入一次
  if (has[id] == null) {
    has[id] = true;
    
    if (!flushing) {
      queue.push(watcher);
    } else {
      // 如果正在刷新，插入到正确位置
      let i = queue.length - 1;
      while (i > index && queue[i].id > watcher.id) {
        i--;
      }
      queue.splice(i + 1, 0, watcher);
    }
    
    // 启动刷新
    if (!waiting) {
      waiting = true;
      nextTick(flushSchedulerQueue);
    }
  }
}

// 刷新队列
function flushSchedulerQueue() {
  flushing = true;
  let watcher, id;
  
  // 按 id 从小到大排序（确保父组件先于子组件更新）
  queue.sort((a, b) => a.id - b.id);
  
  // 遍历执行所有 watcher
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index];
    id = watcher.id;
    has[id] = null;
    watcher.run();
  }
  
  // 重置状态
  resetSchedulerState();
}

function resetSchedulerState() {
  index = queue.length = 0;
  has = {};
  waiting = flushing = false;
}
```

### 3. 响应式数据更新触发 nextTick

```javascript
// 在 setter 中触发更新
function defineReactive(obj, key, val) {
  const dep = new Dep();
  
  Object.defineProperty(obj, key, {
    get() {
      if (Dep.target) {
        dep.depend();
      }
      return val;
    },
    set(newVal) {
      if (newVal === val) return;
      val = newVal;
      // 通知所有订阅的 watcher 更新
      dep.notify();
    }
  });
}

// Dep 的 notify 方法
Dep.prototype.notify = function () {
  const subs = this.subs.slice();
  for (let i = 0, l = subs.length; i < l; i++) {
    subs[i].update(); // 调用 watcher.update()
  }
};
```

## 简化版实现

```javascript
// 简化版 nextTick
const callbacks = [];
let pending = false;

// 异步执行函数（使用 Promise）
function flushCallbacks() {
  pending = false;
  const copies = callbacks.slice(0);
  callbacks.length = 0;
  copies.forEach(cb => cb());
}

function nextTick(cb) {
  callbacks.push(cb);
  
  if (!pending) {
    pending = true;
    Promise.resolve().then(flushCallbacks);
  }
}

// 简化版 Watcher
class Watcher {
  constructor(vm, key, callback) {
    this.vm = vm;
    this.key = key;
    this.callback = callback;
    this.id = ++uid;
  }
  
  update() {
    // 异步更新
    queueWatcher(this);
  }
  
  run() {
    const value = this.vm.data[this.key];
    this.callback.call(this.vm, value);
  }
}

// 更新队列
const queue = [];
const has = {};
let waiting = false;
let flushing = false;
let uid = 0;

function queueWatcher(watcher) {
  const id = watcher.id;
  
  if (!has[id]) {
    has[id] = true;
    
    if (!flushing) {
      queue.push(watcher);
    } else {
      // 插入到正确位置
      let i = queue.length - 1;
      while (i >= 0 && queue[i].id > watcher.id) {
        i--;
      }
      queue.splice(i + 1, 0, watcher);
    }
    
    if (!waiting) {
      waiting = true;
      nextTick(flushSchedulerQueue);
    }
  }
}

function flushSchedulerQueue() {
  flushing = true;
  
  // 排序确保父组件先更新
  queue.sort((a, b) => a.id - b.id);
  
  queue.forEach(watcher => {
    watcher.run();
  });
  
  // 重置状态
  queue.length = 0;
  for (const key in has) {
    delete has[key];
  }
  waiting = flushing = false;
}

// 使用示例
const vm = {
  data: { count: 0 }
};

const watcher = new Watcher(vm, 'count', (value) => {
  console.log('count 更新为:', value);
});

// 修改数据
vm.data.count = 1;
vm.data.count = 2;
vm.data.count = 3;

// 输出: count 更新为: 3 (只输出一次，合并了多次更新)
```

## 使用场景

1. **DOM 更新后操作**：在数据修改后立即操作 DOM
2. **获取更新后的 DOM**：确保 DOM 已更新后再获取元素
3. **异步更新优化**：合并多次数据修改，避免频繁更新

```javascript
// 场景1: DOM 更新后操作
this.message = 'Hello';
this.$nextTick(() => {
  console.log(this.$refs.myDiv.offsetHeight); // 获取更新后的高度
});

// 场景2: 合并多次更新
for (let i = 0; i < 10; i++) {
  this.count++;
}
// 只会触发一次 DOM 更新

// 场景3: Promise 形式
await this.$nextTick();
console.log('DOM 已更新');
```

## 面试要点

1. **为什么需要异步更新**：
   - 避免频繁操作 DOM，提高性能
   - 合并多次数据修改，减少渲染次数
   - 确保在正确的时机执行回调

2. **微任务 vs 宏任务**：
   - 优先使用微任务（Promise、MutationObserver）
   - 微任务在当前事件循环结束前执行
   - 宏任务（setTimeout、setImmediate）在下一个事件循环执行

3. **降级策略**：
   - Promise → MutationObserver → setImmediate → setTimeout
   - 确保在所有浏览器中都能正常工作

4. **更新队列的作用**：
   - 去重：同一个 watcher 只执行一次
   - 排序：确保父组件先于子组件更新
   - 批量：一次性执行所有更新

5. **Vue3 的改进**：
   - 使用 Promise 作为默认异步函数
   - 移除了 MutationObserver 和 setImmediate
   - 代码更简洁，性能更好

3. **注意事项**：
   - 不要在 data 中返回 Promise
   - 不要在 nextTick 中修改响应式数据
   - 多次调用 nextTick 只会执行一次回调

---

## 参考资料

- [Vue2 源码](https://github.com/vuejs/vue/tree/2.6/src)
- [本项目 GitHub 仓库](https://github.com/zfleaves/web-interview-question-list)