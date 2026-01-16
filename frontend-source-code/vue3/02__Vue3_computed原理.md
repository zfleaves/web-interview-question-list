# Vue3 computed 原理

## 核心概念

computed 是 Vue3 的计算属性，基于响应式依赖自动计算，具有缓存特性。

**核心特性：**
- 懒计算：只在访问时计算
- 缓存：依赖不变不会重新计算
- 自动收集依赖：自动追踪响应式依赖
- 支持可写计算属性

## 源码核心实现

### 1. computed 函数

```javascript
// computed 函数
function computed(getterOrOptions) {
  let getter;
  let setter;
  
  // 判断是函数还是对象
  const onlyGetter = isFunction(getterOrOptions);
  
  if (onlyGetter) {
    // 函数形式：只读计算属性
    getter = getterOrOptions;
    setter = NOOP;
  } else {
    // 对象形式：可写计算属性
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  
  // 创建 computed effect
  const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter);
  
  return cRef;
}

// ComputedRefImpl 类
class ComputedRefImpl {
  constructor(getter, _setter, isReadonly) {
    this._setter = _setter;
    this.dep = undefined; // 依赖集合
    this.__v_isRef = true; // 标记为 ref
    this._dirty = true; // 是否需要重新计算
    this.effect = new ReactiveEffect(getter, () => {
      // 调度器：标记为 dirty
      if (!this._dirty) {
        this._dirty = true;
        triggerRefValue(this);
      }
    });
    
    this.effect.computed = this; // 标记为 computed effect
    this.effect.active = this._cacheable = true;
    this.__v_isReadonly = isReadonly;
  }
  
  // getter
  get value() {
    // 依赖收集
    trackRefValue(this);
    
    // 如果 dirty，重新计算
    if (this._dirty || !this._cacheable) {
      this._dirty = false;
      this._value = this.effect.run();
    }
    
    return this._value;
  }
  
  // setter
  set value(newValue) {
    this._setter(newValue);
  }
}
```

### 2. ReactiveEffect - Effect 类

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

### 3. 依赖收集和触发

```javascript
// track - 依赖收集
function track(target, type, key) {
  if (!shouldTrack || activeEffect === null) {
    return;
  }
  
  // 获取 target 的依赖映射
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  
  // 获取 key 的依赖集合
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = createDep()));
  }
  
  // 收集依赖
  trackEffects(dep);
}

// trackEffects - 收集依赖到 effect
function trackEffects(dep) {
  let shouldTrack = false;
  
  if (effectTrackDepth <= maxMarkerBits) {
    if (!newTracked(dep)) {
      dep.n |= trackOpBit;
      shouldTrack = !wasTracked(dep);
    }
  } else {
    shouldTrack = !dep.has(activeEffect);
  }
  
  if (shouldTrack) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}

// trigger - 触发更新
function trigger(target, type, key, newValue, oldValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  
  let deps = [];
  
  // 添加 key 的依赖
  if (key !== void 0) {
    deps.push(depsMap.get(key));
  }
  
  // 触发所有依赖
  triggerEffects(createDep(deps));
}

// triggerEffects - 触发 effects
function triggerEffects(dep) {
  const effects = isArray(dep) ? dep : [...dep];
  
  // 先触发 computed effects
  for (const effect of effects) {
    if (effect.computed) {
      triggerEffect(effect);
    }
  }
  
  // 再触发普通 effects
  for (const effect of effects) {
    if (!effect.computed) {
      triggerEffect(effect);
    }
  }
}

// triggerEffect - 触发单个 effect
function triggerEffect(effect) {
  if (effect.scheduler) {
    effect.scheduler();
  } else {
    effect.run();
  }
}

// trackRefValue - ref 的依赖收集
function trackRefValue(ref) {
  if (shouldTrack && activeEffect) {
    ref = toRaw(ref);
    
    // 如果没有 dep，创建 dep
    if (!ref.dep) {
      ref.dep = createDep();
    }
    
    // 收集依赖
    trackEffects(ref.dep);
  }
}

// triggerRefValue - ref 的触发更新
function triggerRefValue(ref) {
  ref = toRaw(ref);
  
  if (ref.dep) {
    triggerEffects(ref.dep);
  }
}
```

### 4. 可写计算属性

```javascript
// 可写计算属性示例
const state = reactive({
  firstName: 'John',
  lastName: 'Doe'
});

// 可写计算属性
const fullName = computed({
  get() {
    return `${state.firstName} ${state.lastName}`;
  },
  set(newValue) {
    const [firstName, lastName] = newValue.split(' ');
    state.firstName = firstName;
    state.lastName = lastName;
  }
});

// 读取
console.log(fullName.value); // John Doe

// 写入
fullName.value = 'Jane Smith';
console.log(state.firstName); // Jane
console.log(state.lastName); // Smith
```

## 简化版实现

```javascript
// 简化版 computed
class ComputedRef {
  constructor(getter, setter) {
    this._getter = getter;
    this._setter = setter;
    this._value = undefined;
    this._dirty = true;
    this.dep = new Set();
    this.effect = null;
    this.__v_isRef = true;
    
    // 创建 effect
    this.effect = effect(() => {
      this._dirty = true;
      this.dep.forEach(fn => fn());
    });
  }
  
  get value() {
    // 依赖收集
    if (activeEffect) {
      this.dep.add(activeEffect);
      activeEffect.deps.push(this.dep);
    }
    
    // 如果 dirty，重新计算
    if (this._dirty) {
      this._dirty = false;
      this._value = this._getter();
    }
    
    return this._value;
  }
  
  set value(newValue) {
    if (this._setter) {
      this._setter(newValue);
    }
  }
}

function computed(getterOrOptions) {
  let getter, setter;
  
  if (typeof getterOrOptions === 'function') {
    getter = getterOrOptions;
    setter = () => {};
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  
  return new ComputedRef(getter, setter);
}

// 简化版 effect
function effect(fn) {
  const _effect = function() {
    activeEffect = _effect;
    try {
      return fn();
    } finally {
      activeEffect = null;
    }
  };
  
  _effect.deps = [];
  _effect();
  
  return _effect;
}

// 使用示例
const targetMap = new Map();
let activeEffect = null;

const state = reactive({
  count: 0,
  doubleCount: computed(() => state.count * 2)
});

effect(() => {
  console.log('doubleCount:', state.doubleCount.value);
});

state.count = 1; // 输出: doubleCount: 2
state.count = 2; // 输出: doubleCount: 4
```

## 使用场景

1. **派生数据**：基于多个响应式数据计算
2. **复杂计算**：避免在模板中写复杂逻辑
3. **缓存优化**：避免重复计算
4. **可写计算属性**：双向绑定派生数据

```javascript
// 场景1: 派生数据
const fullName = computed(() => `${state.firstName} ${state.lastName}`);

// 场景2: 复杂计算
const filteredList = computed(() => {
  return state.items.filter(item => item.active);
});

// 场景3: 可写计算属性
const fullName = computed({
  get() {
    return `${state.firstName} ${state.lastName}`;
  },
  set(value) {
    const [first, last] = value.split(' ');
    state.firstName = first;
    state.lastName = last;
  }
});
```

## 面试要点

1. **computed 的缓存机制**：
   - 使用 _dirty 标记是否需要重新计算
   - 依赖不变不会重新计算
   - 只有访问时才计算（懒计算）

2. **computed vs watch**：
   - computed 有缓存，watch 无缓存
   - computed 必须返回值，watch 不需要
   - computed 不能执行异步，watch 可以
   - computed 适合计算，watch 适合副作用

3. **computed 的依赖收集**：
   - 自动收集响应式依赖
   - 在 getter 中收集依赖
   - 依赖变化时标记为 dirty

4. **computed 的更新时机**：
   - 依赖变化时标记为 dirty
   - 访问时才重新计算
   - 使用调度器异步更新

5. **可写计算属性**：
   - 提供 get 和 set 方法
   - 可以反向修改依赖数据
   - 实现双向绑定

6. **Vue3 的改进**：
   - 更好的性能
   - 支持可写计算属性
   - 更清晰的实现
   - 更好的 TypeScript 支持

5. **注意事项**：
   - computed 只读时不要修改
   - 不要在 computed 中执行副作用
   - computed 的值会被缓存

8. **性能优化**：
   - 优先使用 computed 而非 watch
   - 避免在 computed 中执行复杂计算
   - 合理使用缓存特性
   - 避免在 computed 中创建新对象