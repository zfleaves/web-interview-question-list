# Vue3 ref 和 reactive 原理

## 核心概念

Vue3 使用 **Proxy** 替代 Vue2 的 Object.defineProperty，实现了更强大的响应式系统。

**ref：**
- 用于包装基本类型（string、number、boolean）
- 返回一个 Ref 对象，通过 .value 访问
- 在模板中自动解包，不需要 .value

**reactive：**
- 用于包装对象和数组
- 返回一个 Proxy 对象
- 直接访问属性，不需要 .value

## 源码核心实现

### 1. ref - 基本类型响应式

```javascript
// ref 函数
function ref(value) {
  return createRef(value, false);
}

// 创建 ref
function createRef(rawValue, shallow) {
  // 如果已经是 ref，直接返回
  if (isRef(rawValue)) {
    return rawValue;
  }
  
  return new RefImpl(rawValue, shallow);
}

// Ref 类
class RefImpl {
  constructor(value, __v_isShallow) {
    this.__v_isShallow = __v_isShallow;
    this.dep = undefined; // 依赖收集器
    this.__v_isRef = true; // 标记为 ref
    this._rawValue = __v_isShallow ? value : toRaw(value); // 原始值
    this._value = __v_isShallow ? value : toReactive(value); // 响应式值
  }
  
  // getter
  get value() {
    // 依赖收集
    trackRefValue(this);
    return this._value;
  }
  
  // setter
  set value(newVal) {
    // 浅比较
    newVal = this.__v_isShallow ? newVal : toRaw(newVal);
    
    // 值未变化，直接返回
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal;
      this._value = this.__v_isShallow ? newVal : toReactive(newVal);
      // 触发更新
      triggerRefValue(this);
    }
  }
}

// 依赖收集
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

// 触发更新
function triggerRefValue(ref) {
  ref = toRaw(ref);
  
  if (ref.dep) {
    triggerEffects(ref.dep);
  }
}

// 转换为响应式
function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}
```

### 2. reactive - 对象响应式

```javascript
// reactive 函数
function reactive(target) {
  // 如果已经是响应式，直接返回
  if (isProxy(target)) {
    return target;
  }
  
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  );
}

// 创建响应式对象
function createReactiveObject(
  target,
  isReadonly,
  baseHandlers,
  collectionHandlers,
  proxyMap
) {
  // 目标不是对象，直接返回
  if (!isObject(target)) {
    return target;
  }
  
  // 如果已经是 proxy，直接返回
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }
  
  // 如果目标只读，直接返回
  if (target[ReactiveFlags.IS_READONLY]) {
    return target;
  }
  
  // 从缓存中获取
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  
  // 判断目标类型
  const targetType = getTargetType(target);
  
  // 目标类型无效，直接返回
  if (targetType === TargetType.INVALID) {
    return target;
  }
  
  // 创建 proxy
  const proxy = new Proxy(
    target,
    targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers
  );
  
  // 缓存 proxy
  proxyMap.set(target, proxy);
  return proxy;
}

// 获取目标类型
function getTargetType(value) {
  return value[ReactiveFlags.SKIP] || !Object.isExtensible(value)
    ? TargetType.INVALID
    : targetTypeMap(toRawType(value));
}

// 目标类型映射
const targetTypeMap = {
  [ObjectType.OBJECT]: TargetType.COMMON,
  [ObjectType.ARRAY]: TargetType.COMMON,
  [ObjectType.SET]: TargetType.COLLECTION,
  [ObjectType.MAP]: TargetType.COLLECTION,
  [ObjectType.WEAKSET]: TargetType.COLLECTION,
  [ObjectType.WEAKMAP]: TargetType.COLLECTION
};

// 可变处理器
const mutableHandlers = {
  get,
  set,
  deleteProperty,
  has,
  ownKeys
};

// get 拦截器
function get(target, key, receiver) {
  const isReadonly = isReadonlyMap.get(target);
  const isShallow = isShallowMap.get(target);
  
  // 如果 key 是响应式相关的内部属性，直接返回
  if (key === ReactiveFlags.IS_REACTIVE) {
    return !isReadonly;
  }
  if (key === ReactiveFlags.IS_READONLY) {
    return isReadonly;
  }
  if (key === ReactiveFlags.IS_SHALLOW) {
    return isShallow;
  }
  
  // 如果 key 是 __v_raw，返回原始对象
  if (key === ReactiveFlags.RAW) {
    return target;
  }
  
  // 获取值
  const targetIsArray = isArray(target);
  
  // 数组方法特殊处理
  if (!isReadonly && targetIsArray && hasOwn(arrayInstrumentations, key)) {
    return Reflect.get(arrayInstrumentations, key, receiver);
  }
  
  // 获取值
  const res = Reflect.get(target, key, receiver);
  
  // 如果 key 是 symbol，直接返回
  if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
    return res;
  }
  
  // 非只读，收集依赖
  if (!isReadonly) {
    track(target, TrackOpTypes.GET, key);
  }
  
  // 如果是浅响应式，直接返回
  if (isShallow) {
    return res;
  }
  
  // 如果是 ref，自动解包
  if (isRef(res)) {
    // 数组或整数 key 不自动解包
    return targetIsArray && isIntegerKey(key) ? res : res.value;
  }
  
  // 如果是对象，递归响应式化
  if (isObject(res)) {
    return isReadonly ? readonly(res) : reactive(res);
  }
  
  return res;
}

// set 拦截器
function set(target, key, value, receiver) {
  // 获取旧值
  let oldValue = target[key];
  
  // 如果旧值是 ref，新值不是 ref，设置 ref.value
  if (isReadonly(oldValue) && isRef(oldValue) && !isRef(value)) {
    return false;
  }
  
  // 判断是否添加新属性
  const hadKey = isArray(target) && isIntegerKey(key)
    ? Number(key) < target.length
    : hasOwn(target, key);
  
  // 设置值
  const result = Reflect.set(target, key, value, receiver);
  
  // 如果目标不是原型链上的对象
  if (target === toRaw(receiver)) {
    // 判断操作类型
    if (!hadKey) {
      // 添加新属性
      trigger(target, TriggerOpTypes.ADD, key, value);
    } else if (hasChanged(value, oldValue)) {
      // 修改属性
      trigger(target, TriggerOpTypes.SET, key, value, oldValue);
    }
  }
  
  return result;
}

// deleteProperty 拦截器
function deleteProperty(target, key) {
  const hadKey = hasOwn(target, key);
  const oldValue = target[key];
  const result = Reflect.deleteProperty(target, key);
  
  // 删除成功，触发更新
  if (result && hadKey) {
    trigger(target, TriggerOpTypes.DELETE, key, undefined, oldValue);
  }
  
  return result;
}
```

### 3. 依赖收集和触发

```javascript
// 全局变量
let activeEffect = null;
let shouldTrack = true;
const effectStack = [];

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

// 收集依赖到 effect
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
  
  // 数组长度变化
  if (type === TriggerOpTypes.ADD) {
    if (!isArray(target)) {
      deps.push(depsMap.get(ITERATE_KEY));
      if (isMap(target)) {
        deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
      }
    } else if (isIntegerKey(key)) {
      deps.push(depsMap.get('length'));
    }
  }
  
  // 触发所有依赖
  triggerEffects(createDep(deps));
}

// 触发 effects
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

// 触发单个 effect
function triggerEffect(effect) {
  if (effect.scheduler) {
    effect.scheduler();
  } else {
    effect.run();
  }
}
```

## 简化版实现

```javascript
// 简化版 ref
class Ref {
  constructor(value) {
    this._value = value;
    this._rawValue = value;
    this.dep = new Set();
    this.__v_isRef = true;
  }
  
  get value() {
    // 依赖收集
    if (activeEffect) {
      this.dep.add(activeEffect);
      activeEffect.deps.push(this.dep);
    }
    return this._value;
  }
  
  set value(newVal) {
    if (newVal !== this._rawValue) {
      this._rawValue = newVal;
      this._value = typeof newVal === 'object' ? reactive(newVal) : newVal;
      
      // 触发更新
      this.dep.forEach(effect => effect());
    }
  }
}

function ref(value) {
  return new Ref(value);
}

// 简化版 reactive
function reactive(target) {
  if (typeof target !== 'object' || target === null) {
    return target;
  }
  
  // 如果已经是 proxy，直接返回
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }
  
  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      // 收集依赖
      if (activeEffect) {
        let depsMap = targetMap.get(target);
        if (!depsMap) {
          targetMap.set(target, (depsMap = new Map()));
        }
        let dep = depsMap.get(key);
        if (!dep) {
          depsMap.set(key, (dep = new Set()));
        }
        dep.add(activeEffect);
        activeEffect.deps.push(dep);
      }
      
      const result = Reflect.get(target, key, receiver);
      
      // 如果是对象，递归响应式化
      if (typeof result === 'object' && result !== null) {
        return reactive(result);
      }
      
      return result;
    },
    
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      
      // 触发更新
      if (oldValue !== value) {
        const depsMap = targetMap.get(target);
        if (depsMap) {
          const dep = depsMap.get(key);
          if (dep) {
            dep.forEach(effect => effect());
          }
        }
      }
      
      return result;
    }
  });
  
  proxy[ReactiveFlags.IS_REACTIVE] = true;
  return proxy;
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

const ReactiveFlags = {
  IS_REACTIVE: '__v_isReactive'
};

// ref 示例
const count = ref(0);
effect(() => {
  console.log('count:', count.value);
});
count.value = 1; // 输出: count: 1

// reactive 示例
const state = reactive({
  count: 0,
  user: {
    name: 'John'
  }
});

effect(() => {
  console.log('state.count:', state.count);
});

state.count = 1; // 输出: state.count: 1
state.user.name = 'Jane'; // 输出: state.count: 1
```

## 使用场景

### ref 使用场景

1. **基本类型响应式**：包装 string、number、boolean
2. **DOM 引用**：获取 DOM 元素引用
3. **解构赋值**：在 setup 中解构时保持响应式

```javascript
const count = ref(0);
const message = ref('Hello');
const isVisible = ref(true);

// DOM 引用
const inputRef = ref(null);
onMounted(() => {
  inputRef.value.focus();
});
```

### reactive 使用场景

1. **对象响应式**：包装复杂对象
2. **数组响应式**：包装数组
3. **嵌套对象**：自动递归响应式化

```javascript
const state = reactive({
  count: 0,
  user: {
    name: 'John',
    age: 30
  },
  items: [1, 2, 3]
});

state.count++;
state.user.name = 'Jane';
state.items.push(4);
```

## 面试要点

1. **ref 和 reactive 的区别**：
   - ref 用于基本类型，reactive 用于对象
   - ref 需要 .value 访问，reactive 直接访问
   - ref 在模板中自动解包，reactive 不需要

2. **Vue3 使用 Proxy 的优势**：
   - 支持数组索引和长度变化
   - 支持对象新增和删除属性
   - 不需要遍历所有属性，性能更好
   - 支持 Map、Set、WeakMap、WeakSet

3. **依赖收集的时机**：
   - 在 effect 执行时收集依赖
   - 在 getter 中收集依赖
   - 使用 activeEffect 标记当前 effect

4. **响应式系统的缓存**：
   - reactive 使用 WeakMap 缓存 proxy
   - 避免重复创建 proxy
   - 自动解包嵌套的 ref

5. **ref 的自动解包**：
   - 在模板中自动解包
   - 在 reactive 对象中自动解包
   - 数组中不自动解包

6. **注意事项**：
   - 解构 reactive 对象会失去响应式
   - 使用 toRefs 保持响应式
   - ref 的 value 是响应式的，不要直接替换
   - 避免在 reactive 中混用 ref

7. **Vue3 响应式系统的改进**：
   - 使用 Proxy 替代 Object.defineProperty
   - 更好的性能和功能
   - 支持 TypeScript
   - 更小的包体积

---

## 参考资料

- [Vue3 源码](https://github.com/vuejs/core/tree/main/packages)
- [本项目 GitHub 仓库](https://github.com/zfleaves/web-interview-question-list)