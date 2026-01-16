# Vue2 computed 和 watch 原理

## 核心概念

computed 和 watch 都是 Vue 的响应式特性，用于监听数据变化，但它们的使用场景和实现原理不同。

**computed：**
- 计算属性，基于依赖自动计算
- 有缓存，依赖不变不会重新计算
- 同步计算，不能执行异步操作

**watch：**
- 侦听器，监听数据变化执行回调
- 无缓存，每次变化都会执行
- 支持异步操作

## 源码核心实现

### 1. computed - 计算属性

```javascript
// 初始化计算属性
function initComputed(vm, computed) {
  const watchers = vm._computedWatchers = Object.create(null);
  
  // 遍历所有计算属性
  for (const key in computed) {
    const userDef = computed[key];
    
    // 获取 getter
    const getter = typeof userDef === 'function'
      ? userDef
      : userDef.get;
    
    // 创建计算属性的 watcher
    watchers[key] = new Watcher(
      vm,
      getter || noop,
      noop,
      computedWatcherOptions
    );
    
    // 如果 key 已经在 vm 上定义，发出警告
    if (!(key in vm)) {
      defineComputed(vm, key, userDef);
    }
  }
}

// 计算属性的 watcher 选项
const computedWatcherOptions = { lazy: true };

// 定义计算属性
function defineComputed(target, key, userDef) {
  const shouldCache = !isServerRendering();
  
  // 创建共享属性描述符
  const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
  };
  
  if (typeof userDef === 'function') {
    // 函数形式
    sharedPropertyDefinition.get = createComputedGetter(key);
    sharedPropertyDefinition.set = noop;
  } else {
    // 对象形式
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : createGetterInvoker(userDef.get)
      : noop;
    sharedPropertyDefinition.set = userDef.set || noop;
  }
  
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

// 创建计算属性的 getter
function createComputedGetter(key) {
  return function computedGetter() {
    const watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      // 如果 dirty 为 true，重新计算
      if (watcher.dirty) {
        watcher.evaluate();
      }
      // 依赖收集
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value;
    }
  };
}

// 计算属性的 watcher
class Watcher {
  constructor(vm, expOrFn, cb, options, isRenderWatcher) {
    this.vm = vm;
    this.cb = cb;
    this.id = ++uid;
    this.deps = [];
    this.newDeps = [];
    this.depIds = new Set();
    this.newDepIds = new Set();
    
    // computed 特有属性
    this.lazy = !!options.lazy; // 是否懒执行
    this.dirty = this.lazy; // 是否需要重新计算
    this.value = undefined;
    
    // 解析 getter
    this.getter = parsePath(expOrFn);
    
    // 如果不是懒执行，立即执行
    if (!this.lazy) {
      this.get();
    }
  }
  
  // 获取值
  get() {
    pushTarget(this);
    let value;
    try {
      value = this.getter.call(this.vm, this.vm);
    } finally {
      popTarget();
      this.cleanupDeps();
    }
    return value;
  }
  
  // 评估计算属性的值
  evaluate() {
    this.value = this.get();
    this.dirty = false; // 标记为已计算
  }
  
  // 依赖收集
  depend() {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend();
    }
  }
  
  // 更新
  update() {
    // computed 的 dirty 设为 true，不立即计算
    if (this.lazy) {
      this.dirty = true;
    } else {
      this.run();
    }
  }
  
  // 运行
  run() {
    const value = this.get();
    if (value !== this.value) {
      const oldValue = this.value;
      this.value = value;
      this.cb.call(this.vm, value, oldValue);
    }
  }
}
```

### 2. watch - 侦听器

```javascript
// 初始化侦听器
function initWatch(vm, watch) {
  for (const key in watch) {
    const handler = watch[key];
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

// 创建侦听器
function createWatcher(vm, expOrFn, handler, options) {
  if (isPlainObject(handler)) {
    options = handler;
    handler = handler.handler;
  }
  if (typeof handler === 'string') {
    handler = vm[handler];
  }
  return vm.$watch(expOrFn, handler, options);
}

// $watch 方法
Vue.prototype.$watch = function (expOrFn, cb, options) {
  const vm = this;
  options = options || {};
  options.user = true;
  
  const watcher = new Watcher(vm, expOrFn, cb, options);
  
  // immediate: 立即执行
  if (options.immediate) {
    try {
      cb.call(vm, watcher.value);
    } catch (error) {
      handleError(error, vm, `callback for immediate watcher "${expOrFn}"`);
    }
  }
  
  // 返回取消监听的函数
  return function unwatchFn() {
    watcher.teardown();
  };
};

// 侦听器的 watcher
class Watcher {
  constructor(vm, expOrFn, cb, options, isRenderWatcher) {
    this.vm = vm;
    this.cb = cb; // 回调函数
    this.id = ++uid;
    this.deep = !!options.deep; // 深度监听
    this.user = !!options.user; // 用户 watcher
    this.lazy = !!options.lazy;
    this.sync = !!options.sync; // 同步更新
    this.before = options.before;
    
    this.value = this.lazy ? undefined : this.get();
  }
  
  get() {
    pushTarget(this);
    let value;
    try {
      value = this.getter.call(this.vm, this.vm);
    } finally {
      popTarget();
      this.cleanupDeps();
    }
    return value;
  }
  
  // 深度监听
  traverse(val) {
    this.traverse(val, this.seenObjects);
  }
  
  traverse(val, seen) {
    if (!isObject(val) || Object.isFrozen(val)) {
      return;
    }
    if (!seen) {
      seen = this.seenObjects || (this.seenObjects = Object.create(null));
    }
    const key = seen[val];
    if (key) {
      return;
    }
    seen[val] = true;
    
    const keys = Object.keys(val);
    for (let i = 0; i < keys.length; i++) {
      this.traverse(val[keys[i]], seen);
    }
  }
  
  update() {
    if (this.lazy) {
      this.dirty = true;
    } else if (this.sync) {
      this.run();
    } else {
      queueWatcher(this); // 异步更新
    }
  }
  
  run() {
    const value = this.get();
    if (value !== this.value || isObject(value) || this.deep) {
      const oldValue = this.value;
      this.value = value;
      
      if (this.user) {
        try {
          this.cb.call(this.vm, value, oldValue);
        } catch (error) {
          handleError(error, this.vm, `callback for watcher "${this.expression}"`);
        }
      } else {
        this.cb.call(this.vm, value, oldValue);
      }
    }
  }
  
  // 取消监听
  teardown() {
    if (this.active) {
      this.deps.forEach(dep => {
        dep.removeSub(this);
      });
      this.active = false;
    }
  }
}
```

## 简化版实现

```javascript
// 简化版 computed
class Computed {
  constructor(getter) {
    this.getter = getter;
    this.dirty = true;
    this.value = undefined;
    this.deps = [];
  }
  
  get() {
    if (this.dirty) {
      this.value = this.getter();
      this.dirty = false;
    }
    return this.value;
  }
  
  depend() {
    this.deps.forEach(dep => dep.depend());
  }
  
  update() {
    this.dirty = true;
  }
}

// 简化版 watch
class Watcher {
  constructor(getter, callback) {
    this.getter = getter;
    this.callback = callback;
    this.value = getter();
  }
  
  update() {
    const newValue = this.getter();
    if (newValue !== this.value) {
      const oldValue = this.value;
      this.value = newValue;
      this.callback(newValue, oldValue);
    }
  }
}

// 简化版响应式系统
class Reactive {
  constructor() {
    this.computedMap = new Map();
    this.watchers = [];
  }
  
  computed(key, getter) {
    const computed = new Computed(getter);
    this.computedMap.set(key, computed);
    return computed;
  }
  
  watch(getter, callback) {
    const watcher = new Watcher(getter, callback);
    this.watchers.push(watcher);
    return () => {
      const index = this.watchers.indexOf(watcher);
      if (index > -1) {
        this.watchers.splice(index, 1);
      }
    };
  }
  
  notify() {
    // 通知所有 computed 更新
    this.computedMap.forEach(computed => computed.update());
    // 通知所有 watcher 更新
    this.watchers.forEach(watcher => watcher.update());
  }
}

// 使用示例
const reactive = new Reactive();

const data = {
  firstName: 'John',
  lastName: 'Doe'
};

// computed
const fullName = reactive.computed('fullName', () => {
  return `${data.firstName} ${data.lastName}`;
});

console.log(fullName.get()); // 输出: John Doe

// watch
const unwatch = reactive.watch(
  () => data.firstName,
  (newValue, oldValue) => {
    console.log(`firstName 从 ${oldValue} 变为 ${newValue}`);
  }
);

data.firstName = 'Jane'; // 输出: firstName 从 John 变为 Jane
reactive.notify();

console.log(fullName.get()); // 输出: Jane Doe
```

## 使用场景

### computed 使用场景

1. **派生数据**：基于多个响应式数据计算
2. **模板中的复杂逻辑**：简化模板表达式
3. **需要缓存的结果**：避免重复计算

```javascript
computed: {
  fullName() {
    return `${this.firstName} ${this.lastName}`;
  },
  totalPrice() {
    return this.items.reduce((sum, item) => sum + item.price * item.count, 0);
  }
}
```

### watch 使用场景

1. **异步操作**：数据变化后执行异步请求
2. **数据变化需要额外处理**：如保存到 localStorage
3. **监听嵌套对象**：使用 deep 选项

```javascript
watch: {
  userId(newVal) {
    // 异步获取用户信息
    this.fetchUserInfo(newVal);
  },
  formData: {
    handler(newVal) {
      // 保存到 localStorage
      localStorage.setItem('formData', JSON.stringify(newVal));
    },
    deep: true,
    immediate: true
  }
}
```

## 面试要点

1. **computed 和 watch 的区别**：
   - computed 有缓存，watch 无缓存
   - computed 必须返回值，watch 不需要
   - computed 不能执行异步，watch 可以
   - computed 适合计算，watch 适合监听

2. **computed 的缓存机制**：
   - 依赖不变不会重新计算
   - dirty 标记是否需要重新计算
   - 依赖收集在 getter 中进行

3. **watch 的 deep 选项**：
   - 深度监听对象内部变化
   - 遍历对象所有属性进行依赖收集
   - 性能开销较大，慎用

4. **immediate 选项**：
   - 立即执行回调
   - 在创建时触发一次
   - 适合需要初始值的场景

5. **watch 的取消监听**：
   - $watch 返回取消函数
   - 调用取消函数移除监听
   - 避免内存泄漏

6. **Vue3 的改进**：
   - computed 支持可写计算属性
   - watch 支持 watchEffect（自动收集依赖）
   - 更好的类型推断

7. **性能优化建议**：
   - 优先使用 computed 而非 watch
   - 避免在 computed 中执行复杂计算
   - 慎用 deep 选项，考虑监听具体属性
   - 及时取消不需要的 watch 监听

## 最佳实践

- computed 用于派生数据
- watch 用于副作用和异步操作
- 避免在 computed 中执行副作用