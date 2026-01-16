# Vue3 watch 和 watchEffect 原理

## 核心概念

watch 和 watchEffect 都是 Vue3 的侦听器，用于监听响应式数据变化并执行副作用。

**watch：**
- 显式指定监听源
- 支持获取新旧值
- 支持配置选项（immediate、deep、flush）
- 惰性执行（默认）

**watchEffect：**
- 自动收集依赖
- 立即执行
- 无法获取新旧值
- 不支持配置选项

## 源码核心实现

### 1. watch 函数

```javascript
// watch 函数
function watch(source, cb, options) {
  return doWatch(source, cb, options);
}

// doWatch - 核心实现
function doWatch(source, cb, { immediate, deep, flush, onTrack, onTrigger } = EMPTY_OBJ) {
  // 获取 getter
  const getter = source => isReactive(source)
    ? source => traverse(source, deep === false ? 1 : undefined)
    : getter;
  
  // 如果是 ref，创建 getter
  if (isRef(source)) {
    getter = () => source.value;
  }
  // 如果是 reactive，创建 getter
  else if (isReactive(source)) {
    getter = () => source;
    deep = true; // reactive 默认深度监听
  }
  // 如果是数组，创建 getter
  else if (isArray(source)) {
    getter = () =>
      source.map(s => {
        if (isRef(s)) {
          return s.value;
        } else if (isReactive(s)) {
          return traverse(s);
        } else if (isFunction(s)) {
          return callWithErrorHandling(s, instance, 2 /* WATCH_GETTER */);
        } else {
          return;
        }
      });
  }
  // 如果是函数，直接使用
  else if (isFunction(source)) {
    if (cb) {
      getter = () => callWithErrorHandling(source, instance, 2 /* WATCH_GETTER */);
    } else {
      getter = () => {
        if (instance && instance.isUnmounted) {
          return;
        }
        if (cleanup) {
          cleanup();
        }
        return callWithAsyncErrorHandling(source, instance, 3 /* WATCH_CALLBACK */, [onInvalidate]);
      };
    }
  } else {
    getter = NOOP;
  }
  
  // 如果有 cb，创建 job
  if (cb) {
    const job = () => {
      if (!effect.active) {
        return;
      }
      
      if (flush === 'sync') {
        effect.run();
      } else if (flush === 'post') {
        queuePostRenderEffect(effect.run, effect.scope);
      } else {
        // 默认 pre
        effect.run();
      }
    };
  }
  
  // 创建 scheduler
  let scheduler;
  if (flush === 'sync') {
    scheduler = job;
  } else if (flush === 'post') {
    scheduler = () => queuePostRenderEffect(job, effect.scope);
  } else {
    // 默认 pre
    scheduler = () => {
      if (!effect.active) {
        return;
      }
      if (!instance || instance.isMounted) {
        queueJob(job);
      } else {
        // 组件挂载前，立即执行
        job();
      }
    };
  }
  
  // 创建 effect
  const effect = new ReactiveEffect(getter, scheduler);
  
  // 初始执行
  if (cb) {
    if (immediate) {
      job();
    } else {
      oldValue = effect.run();
    }
  } else {
    effect.run();
  }
  
  // 返回停止函数
  return () => {
    effect.stop();
  };
}

// traverse - 深度遍历
function traverse(value, depth = Infinity, seen = new Set()) {
  // 如果不是对象或已遍历，直接返回
  if (!isObject(value) || value[ReactiveFlags.SKIP] || seen.has(value)) {
    return value;
  }
  
  seen.add(value);
  depth--;
  
  // 递归遍历
  if (depth > 0) {
    if (isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        traverse(value[i], depth, seen);
      }
    } else if (isMap(value)) {
      value.forEach((v, key) => {
        traverse(v, depth, seen);
        traverse(key, depth, seen);
      });
    } else if (isSet(value)) {
      value.forEach(v => {
        traverse(v, depth, seen);
      });
    } else {
      for (const key in value) {
        traverse(value[key], depth, seen);
      }
    }
  }
  
  return value;
}
```

### 2. watchEffect 函数

```javascript
// watchEffect 函数
function watchEffect(effect, options) {
  return doWatch(effect, null, options);
}

// doWatch - watchEffect 的实现
function doWatch(effect, cb, { flush = 'pre', onTrack, onTrigger } = EMPTY_OBJ) {
  let getter;
  
  // 如果是函数，直接使用
  if (isFunction(effect)) {
    getter = effect;
  } else {
    getter = () => {};
  }
  
  // 创建 cleanup 函数
  let cleanup;
  const onInvalidate = (fn) => {
    cleanup = effect.onStop = () => {
      callWithErrorHandling(fn, instance, 4 /* WATCH_CLEANUP */);
    };
  };
  
  // 创建 job
  const job = () => {
    if (!effect.active) {
      return;
    }
    
    // 执行 cleanup
    if (cleanup) {
      cleanup();
    }
    
    // 执行 effect
    const newValue = effect.run();
    
    // 如果有 cb，执行 cb
    if (cb) {
      callWithAsyncErrorHandling(cb, instance, 3 /* WATCH_CALLBACK */, [
        newValue,
        oldValue,
        onInvalidate
      ]);
      oldValue = newValue;
    }
  };
  
  // 创建 scheduler
  let scheduler;
  if (flush === 'sync') {
    scheduler = job;
  } else if (flush === 'post') {
    scheduler = () => queuePostRenderEffect(job, effect.scope);
  } else {
    // 默认 pre
    scheduler = () => {
      if (!effect.active) {
        return;
      }
      if (!instance || instance.isMounted) {
        queueJob(job);
      } else {
        // 组件挂载前，立即执行
        job();
      }
    };
  }
  
  // 创建 effect
  const effect = new ReactiveEffect(getter, scheduler);
  
  // 立即执行
  effect.run();
  
  // 返回停止函数
  return () => {
    effect.stop();
  };
}
```

### 3. ReactiveEffect - Effect 类

```javascript
// ReactiveEffect 类
class ReactiveEffect {
  constructor(fn, scheduler = null, scope) {
    this.fn = fn;
    this.scheduler = scheduler; // 调度器
    this.active = true; // 是否激活
    this.deps = []; // 依赖的 dep 集合
    this.parent = undefined; // 父 effect
    this.computed = null; // 是否是 computed effect
    this.stop = () => this.active = false; // 停止 effect
    this.onStop = null; // 停止回调
    
    // 记录 effect 栈
    recordEffectScope(this, scope);
  }
  
  // 执行 effect
  run() {
    if (!this.active) {
      return this.fn();
    }
    
    // 父 effect
    let parent = activeEffect;
    let lastShouldTrack = shouldTrack;
    
    while (parent) {
      if (parent === this) {
        return;
      }
      parent = parent.parent;
    }
    
    try {
      // 设置当前 effect
      this.parent = activeEffect;
      activeEffect = this;
      shouldTrack = true;
      
      // 执行函数
      return this.fn();
    } finally {
      // 恢复状态
      activeEffect = this.parent;
      shouldTrack = lastShouldTrack;
      this.parent = undefined;
    }
  }
  
  // 停止 effect
  stop() {
    if (this.active) {
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}

// 清理 effect
function cleanupEffect(effect) {
  const { deps } = effect;
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect);
    }
    deps.length = 0;
  }
}
```

### 4. 调度器和队列

```javascript
// 调度队列
const queue = [];
let isFlushing = false;
let isFlushPending = false;

// queueJob - 加入队列
function queueJob(job) {
  // 避免重复加入
  if (!queue.includes(job)) {
    queue.push(job);
    queueFlush();
  }
}

// queueFlush - 刷新队列
function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true;
    currentFlushPromise = resolvedPromise.then(flushJobs);
  }
}

// flushJobs - 执行队列中的 job
function flushJobs(seen) {
  isFlushPending = false;
  isFlushing = true;
  
  // 排序，确保父组件先更新
  queue.sort((a, b) => getId(a) - getId(b));
  
  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job) {
        callWithErrorHandling(job, null, 14 /* SCHEDULER */);
      }
    }
  } finally {
    flushIndex = 0;
    queue.length = 0;
    isFlushing = false;
  }
}

// queuePostRenderEffect - 在渲染后执行
function queuePostRenderEffect(effect, scope) {
  if (effect) {
    currentPostFlushCbs.push(() => {
      if (effect.active) {
        effect.run();
      }
    });
  }
}
```

## 简化版实现

```javascript
// 简化版 watch
function watch(source, cb, options = {}) {
  const { immediate = false, deep = false } = options;
  let getter;
  let oldValue;
  
  // 创建 getter
  if (typeof source === 'function') {
    getter = source;
  } else if (typeof source === 'object' && source !== null) {
    getter = () => {
      if (deep) {
        return traverse(source);
      }
      return source;
    };
  }
  
  // 创建 effect
  const effect = new ReactiveEffect(getter, () => {
    const newValue = effect.run();
    if (newValue !== oldValue) {
      cb(newValue, oldValue);
      oldValue = newValue;
    }
  });
  
  // 立即执行
  if (immediate) {
    const value = effect.run();
    cb(value, undefined);
  } else {
    oldValue = effect.run();
  }
  
  // 返回停止函数
  return () => effect.stop();
}

// 简化版 watchEffect
function watchEffect(effect) {
  const _effect = new ReactiveEffect(effect, () => {
    _effect.run();
  });
  
  _effect.run();
  
  return () => _effect.stop();
}

// 简化版 ReactiveEffect
class ReactiveEffect {
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.active = true;
    this.deps = [];
  }
  
  run() {
    if (!this.active) {
      return this.fn();
    }
    
    activeEffect = this;
    try {
      return this.fn();
    } finally {
      activeEffect = null;
    }
  }
  
  stop() {
    if (this.active) {
      this.deps.forEach(dep => dep.delete(this));
      this.active = false;
    }
  }
}

// 简化版 traverse
function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || value === null || seen.has(value)) {
    return value;
  }
  
  seen.add(value);
  
  for (const key in value) {
    traverse(value[key], seen);
  }
  
  return value;
}

// 使用示例
const state = reactive({ count: 0 });

// watch 示例
watch(
  () => state.count,
  (newValue, oldValue) => {
    console.log(`count 从 ${oldValue} 变为 ${newValue}`);
  },
  { immediate: true }
);

state.count = 1; // 输出: count 从 0 变为 1

// watchEffect 示例
watchEffect(() => {
  console.log('count:', state.count);
});

state.count = 2; // 输出: count: 2
```

## 使用场景

### watch 使用场景

1. **监听特定数据**：监听某个响应式数据变化
2. **获取新旧值**：需要比较新旧值
3. **异步操作**：数据变化后执行异步请求
4. **深度监听**：监听对象内部变化

```javascript
// 场景1: 监听特定数据
watch(() => state.count, (newValue, oldValue) => {
  console.log(newValue, oldValue);
});

// 场景2: 深度监听
watch(state, (newValue, oldValue) => {
  console.log(newValue, oldValue);
}, { deep: true });

// 场景3: 异步操作
watch(() => state.userId, async (newId) => {
  const user = await fetchUser(newId);
  state.user = user;
});

// 场景4: 立即执行
watch(() => state.count, (value) => {
  console.log(value);
}, { immediate: true });
```

### watchEffect 使用场景

1. **自动收集依赖**：不需要显式指定监听源
2. **立即执行**：初始化时立即执行一次
3. **简单副作用**：不需要获取新旧值
4. **日志记录**：记录数据变化

```javascript
// 场景1: 自动收集依赖
watchEffect(() => {
  console.log(state.count, state.name);
});

// 场景2: 立即执行
watchEffect(() => {
  document.title = `Count: ${state.count}`;
});

// 场景3: 清理副作用
watchEffect((onCleanup) => {
  const timer = setInterval(() => {
    console.log('tick');
  }, 1000);
  
  onCleanup(() => {
    clearInterval(timer);
  });
});
```

## 面试要点

1. **watch vs watchEffect**：
   - watch 显式指定监听源，watchEffect 自动收集依赖
   - watch 支持获取新旧值，watchEffect 不支持
   - watch 支持配置选项，watchEffect 不支持
   - watch 默认惰性执行，watchEffect 立即执行

2. **watch 的配置选项**：
   - immediate：立即执行
   - deep：深度监听
   - flush：执行时机（pre、post、sync）

3. **watchEffect 的 onInvalidate**：
   - 用于清理副作用
   - 在 effect 重新执行前调用
   - 适合清理定时器、事件监听等

4. **深度监听的实现**：
   - 使用 traverse 遍历对象
   - 递归访问所有属性
   - 收集所有属性的依赖

5. **调度器的作用**：
   - 控制执行的时机
   - 支持同步、异步执行
   - 避免重复执行

6. **Vue3 的改进**：
   - 更清晰的 API
   - 更好的类型推断
   - 支持停止监听
   - 更灵活的配置

5. **注意事项**：
   - watch 需要明确指定监听的源
   - watchEffect 会自动追踪依赖
   - 及时清理副作用

8. **性能优化**：
   - 优先使用 watch 而非 deep watch
   - 避免在 watch 中执行复杂操作
   - 及时清理副作用
   - 合理使用 flush 选项