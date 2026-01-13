# Vue3 响应式 API 详解

## 目录
1. [ref](#ref)
2. [reactive](#reactive)
3. [toRaw](#toraw)
4. [watch](#watch)
5. [effect](#effect)
6. [对比总结](#对比总结)

---

## ref

### 基本用法

**ref 用于创建一个响应式的引用对象，常用于包装基本数据类型。**

```javascript
import { ref } from 'vue'

// 基本类型
const count = ref(0)
const message = ref('Hello')
const isVisible = ref(true)

// 访问和修改
console.log(count.value) // 0
count.value = 1

// 在模板中使用（自动解包）
<template>
  <div>{{ count }}</div>
  <button @click="count++">增加</button>
</template>
```

### 原理实现

**核心原理：使用 Proxy 包装对象，通过 .value 访问实际值。**

```javascript
// 简化的 ref 实现
function ref(value) {
  return createRef(value, false)
}

function createRef(rawValue, shallow) {
  // 如果已经是 ref 对象，直接返回
  if (isRef(rawValue)) {
    return rawValue
  }
  
  return new RefImpl(rawValue, shallow)
}

class RefImpl {
  constructor(value, __v_isShallow) {
    this.__v_isShallow = __v_isShallow
    this.dep = undefined // 依赖收集器
    this.__v_isRef = true // 标识这是一个 ref
    this._rawValue = __v_isShallow ? value : toRaw(value)
    this._value = __v_isShallow ? value : toReactive(value)
  }
  
  get value() {
    // 收集依赖
    trackRefValue(this)
    return this._value
  }
  
  set value(newVal) {
    // 如果是浅响应，直接比较；否则比较原始值
    const useDirectValue = this.__v_isShallow || isShallow(newVal) || isReadonly(newVal)
    newVal = useDirectValue ? newVal : toRaw(newVal)
    
    // 值没有变化，直接返回
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal
      this._value = useDirectValue ? newVal : toReactive(newVal)
      // 触发更新
      triggerRefValue(this)
    }
  }
}

// 依赖收集
function trackRefValue(ref) {
  if (shouldTrack && activeEffect) {
    ref = toRaw(ref)
    if (!ref.dep) {
      ref.dep = createDep()
    }
    trackEffects(ref.dep)
  }
}

// 触发更新
function triggerRefValue(ref) {
  ref = toRaw(ref)
  if (ref.dep) {
    triggerEffects(ref.dep)
  }
}
```

### 使用场景

```javascript
// 1. 基本数据类型的响应式
const count = ref(0)
const message = ref('Hello')

// 2. 单个值的响应式
const user = ref({
  name: 'John',
  age: 20
})

// 3. DOM 元素引用
const inputRef = ref(null)

onMounted(() => {
  inputRef.value.focus()
})

// 4. 组件引用
const childRef = ref(null)

// 5. computed 的返回值
const doubleCount = computed(() => count.value * 2)
```

### 注意事项

```javascript
// ❌ 错误：直接赋值 ref 对象
const count = ref(0)
const state = { count } // state.count 是 ref 对象，不是值

// ✅ 正确：在模板中自动解包
<template>
  <div>{{ count }}</div> <!-- 自动解包 -->
</template>

// ✅ 正确：在 JS 中使用 .value
console.log(count.value)

// ❌ 错误：解构 ref 会丢失响应性
const { value } = count // value 不是响应式的

// ✅ 正确：使用 toRefs
const state = reactive({ count: ref(0) })
const { count } = toRefs(state) // count 保持响应性
```

---

## reactive

### 基本用法

**reactive 用于创建一个响应式的对象，常用于包装对象和数组。**

```javascript
import { reactive } from 'vue'

// 对象
const state = reactive({
  count: 0,
  message: 'Hello',
  user: {
    name: 'John',
    age: 20
  }
})

// 数组
const list = reactive([1, 2, 3])

// 访问和修改
state.count = 1
state.user.name = 'Jane'
list.push(4)
```

### 原理实现

**核心原理：使用 Proxy 包装对象，拦截所有操作。**

```javascript
// 简化的 reactive 实现
function reactive(target) {
  // 如果已经是响应式对象，直接返回
  if (target && target.__v_isReactive) {
    return target
  }
  
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers
  )
}

function createReactiveObject(target, isReadonly, baseHandlers, collectionHandlers) {
  // 只能处理对象
  if (!isObject(target)) {
    return target
  }
  
  // 创建 Proxy
  const proxy = new Proxy(
    target,
    isCollectionType(target) ? collectionHandlers : baseHandlers
  )
  
  // 标记为响应式
  proxy.__v_isReactive = true
  
  return proxy
}

// Proxy 处理器
const mutableHandlers = {
  get(target, key, receiver) {
    // 1. 收集依赖
    track(target, TrackOpTypes.GET, key)
    
    // 2. 获取值
    const res = Reflect.get(target, key, receiver)
    
    // 3. 如果是对象，递归转换为响应式
    if (isObject(res)) {
      return reactive(res)
    }
    
    return res
  },
  
  set(target, key, value, receiver) {
    const oldValue = target[key]
    
    // 1. 设置值
    const result = Reflect.set(target, key, value, receiver)
    
    // 2. 如果值发生变化，触发更新
    if (hasChanged(value, oldValue)) {
      trigger(target, TriggerOpTypes.SET, key, value, oldValue)
    }
    
    return result
  },
  
  deleteProperty(target, key) {
    const hadKey = hasOwn(target, key)
    const oldValue = target[key]
    
    // 1. 删除属性
    const result = Reflect.deleteProperty(target, key)
    
    // 2. 如果属性存在且删除成功，触发更新
    if (result && hadKey) {
      trigger(target, TriggerOpTypes.DELETE, key, undefined, oldValue)
    }
    
    return result
  },
  
  has(target, key) {
    track(target, TrackOpTypes.HAS, key)
    return Reflect.has(target, key)
  },
  
  ownKeys(target) {
    track(target, TrackOpTypes.ITERATE, ITERATE_KEY)
    return Reflect.ownKeys(target)
  }
}

// 依赖收集
function track(target, type, key) {
  if (!shouldTrack || activeEffect === undefined) {
    return
  }
  
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = createDep()))
  }
  
  trackEffects(dep)
}

// 触发更新
function trigger(target, type, key, newValue, oldValue) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  
  const effects = new Set()
  
  // 收集需要触发的 effects
  if (key !== undefined) {
    const dep = depsMap.get(key)
    if (dep) {
      dep.forEach(effect => effects.add(effect))
    }
  }
  
  // 触发 effects
  effects.forEach(effect => {
    if (effect !== activeEffect) {
      effect.scheduler ? effect.scheduler() : effect.run()
    }
  })
}
```

### 使用场景

```javascript
// 1. 复杂对象的响应式
const state = reactive({
  count: 0,
  message: 'Hello',
  user: {
    name: 'John',
    age: 20
  }
})

// 2. 数组的响应式
const list = reactive([1, 2, 3])

// 3. 表单数据
const formData = reactive({
  username: '',
  password: '',
  email: ''
})

// 4. 状态管理
const store = reactive({
  user: null,
  isLoggedIn: false,
  cart: []
})
```

### 注意事项

```javascript
// ❌ 错误：解构会丢失响应性
const { count } = state // count 不是响应式的

// ✅ 正确：使用 toRefs
const { count, message } = toRefs(state)

// ❌ 错误：直接替换整个对象
state = { count: 1 } // 不会触发更新

// ✅ 正确：使用 Object.assign
Object.assign(state, { count: 1 })

// ❌ 错误：直接赋值给 reactive 对象
state = reactive({ count: 1 }) // 不会触发更新

// ✅ 正确：修改属性
state.count = 1
```

---

## toRaw

### 基本用法

**toRaw 用于获取 reactive 或 ref 的原始对象，可以用于临时读取而不引起依赖跟踪，或写入而不触发更改。**

```javascript
import { reactive, toRaw } from 'vue'

const state = reactive({
  count: 0,
  user: {
    name: 'John'
  }
})

// 获取原始对象
const rawState = toRaw(state)
console.log(rawState === state) // false
console.log(rawState.count) // 0

// 修改原始对象不会触发响应式更新
rawState.count = 1
console.log(state.count) // 1（因为是同一个对象）

// 但不会触发视图更新
```

### 原理实现

**核心原理：返回原始对象，绕过 Proxy 代理。**

```javascript
// 简化的 toRaw 实现
function toRaw(observed) {
  // 如果不是响应式对象，直接返回
  const raw = observed && (observed)[ReactiveFlags.RAW]
  return raw ? toRaw(raw) : observed
}

// ReactiveFlags 标记
const ReactiveFlags = {
  RAW: '__v_raw',
  REACTIVE: '__v_isReactive',
  READONLY: '__v_isReadonly',
  SHALLOW: '__v_isShallow'
}

// 在 createReactiveObject 中标记原始对象
function createReactiveObject(target, isReadonly, baseHandlers, collectionHandlers) {
  const proxy = new Proxy(
    target,
    isCollectionType(target) ? collectionHandlers : baseHandlers
  )
  
  // 标记原始对象
  proxy[ReactiveFlags.RAW] = target
  proxy[ReactiveFlags.REACTIVE] = true
  
  return proxy
}
```

### 使用场景

```javascript
// 1. 临时读取而不引起依赖跟踪
const state = reactive({
  count: 0
})

function logState() {
  // 使用 toRaw 避免依赖收集
  const raw = toRaw(state)
  console.log(raw.count) // 不会建立依赖关系
}

// 2. 写入而不触发更改
const state = reactive({
  list: [1, 2, 3]
})

function addManyItems() {
  const raw = toRaw(state.list)
  // 批量添加，不会触发多次更新
  for (let i = 0; i < 1000; i++) {
    raw.push(i)
  }
  // 手动触发一次更新
  trigger(state, 'set', 'list')
}

// 3. 性能优化：避免响应式开销
const state = reactive({
  heavyData: {}
})

function processData() {
  const raw = toRaw(state.heavyData)
  // 处理大量数据，避免响应式开销
  for (let key in raw) {
    // 复杂计算
  }
}

// 4. 与第三方库集成
const state = reactive({
  data: {}
})

// 某些第三方库需要原始对象
someLibrary.processData(toRaw(state.data))
```

### 注意事项

```javascript
// ⚠️ 修改原始对象会影响响应式对象
const state = reactive({ count: 0 })
const raw = toRaw(state)
raw.count = 1
console.log(state.count) // 1

// ⚠️ 但不会触发视图更新
// 需要手动触发更新或使用其他方式

// ✅ 如果需要批量更新后触发一次
const state = reactive({ list: [] })
const raw = toRaw(state.list)

// 批量操作
raw.push(1, 2, 3, 4, 5)

// 手动触发更新
state.list = [...raw]

// ✅ 用于只读场景
const state = reactive({ count: 0 })

function getCount() {
  // 只读取，不建立依赖
  return toRaw(state).count
}
```

---

## watch

### 基本用法

**watch 用于侦听一个或多个响应式数据源，并在数据变化时执行回调。**

```javascript
import { ref, reactive, watch } from 'vue'

// 侦听单个 ref
const count = ref(0)
watch(count, (newValue, oldValue) => {
  console.log(`count changed from ${oldValue} to ${newValue}`)
})

// 侦听单个 reactive 对象的属性
const state = reactive({ count: 0 })
watch(() => state.count, (newValue, oldValue) => {
  console.log(`count changed from ${oldValue} to ${newValue}`)
})

// 侦听多个数据源
const firstName = ref('John')
const lastName = ref('Doe')
watch([firstName, lastName], ([newFirst, newLast], [oldFirst, oldLast]) => {
  console.log(`name changed from ${oldFirst} ${oldLast} to ${newFirst} ${newLast}`)
})

// 侦听整个 reactive 对象（需要 deep: true）
const user = reactive({ name: 'John', age: 20 })
watch(user, (newValue, oldValue) => {
  console.log('user changed')
}, { deep: true })
```

### 原理实现

**核心原理：创建一个 Watcher 实例，在 getter 中收集依赖，数据变化时触发回调。**

```javascript
// 简化的 watch 实现
function watch(source, cb, options = {}) {
  const { immediate, deep, flush = 'pre' } = options
  
  let getter
  if (isRef(source)) {
    getter = () => source.value
  } else if (isReactive(source)) {
    getter = () => source
    deep = true // reactive 对象默认深度监听
  } else if (isFunction(source)) {
    getter = source
  } else if (isArray(source)) {
    getter = () => source.map(s => {
      if (isRef(s)) return s.value
      if (isReactive(s)) return traverse(s)
      if (isFunction(s)) return s()
      return s
    })
  }
  
  if (deep) {
    const baseGetter = getter
    getter = () => traverse(baseGetter())
  }
  
  let oldValue
  let cleanup
  
  const onCleanup = (fn) => {
    cleanup = fn
  }
  
  const job = () => {
    if (cleanup) {
      cleanup()
    }
    
    const newValue = effect.run()
    
    if (deep || hasChanged(newValue, oldValue)) {
      cleanup = undefined
      cb(newValue, oldValue, onCleanup)
      oldValue = deep ? clone(newValue) : newValue
    }
  }
  
  const scheduler = () => {
    if (flush === 'sync') {
      job()
    } else if (flush === 'post') {
      queuePostRenderEffect(job)
    } else {
      queueJob(job)
    }
  }
  
  const effect = new ReactiveEffect(getter, scheduler)
  
  if (options.immediate) {
    job()
  } else {
    oldValue = effect.run()
  }
  
  const stop = () => {
    effect.stop()
  }
  
  return stop
}

// 深度遍历
function traverse(value, seen = new Set()) {
  if (!isObject(value) || seen.has(value)) {
    return value
  }
  
  seen.add(value)
  
  if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], seen)
    }
  } else if (isPlainObject(value)) {
    for (const key in value) {
      traverse(value[key], seen)
    }
  }
  
  return value
}
```

### 使用场景

```javascript
// 1. 侦听单个值的变化
const count = ref(0)
watch(count, (newVal, oldVal) => {
  console.log(`count: ${oldVal} -> ${newVal}`)
})

// 2. 侦听对象属性的变化
const state = reactive({
  user: {
    name: 'John'
  }
})
watch(() => state.user.name, (newVal, oldVal) => {
  console.log(`name: ${oldVal} -> ${newVal}`)
})

// 3. 侦听多个值的变化
const firstName = ref('John')
const lastName = ref('Doe')
watch([firstName, lastName], ([newFirst, newLast], [oldFirst, oldLast]) => {
  console.log(`name: ${oldFirst} ${oldLast} -> ${newFirst} ${newLast}`)
})

// 4. 深度侦听
const user = reactive({
  profile: {
    name: 'John',
    age: 20
  }
})
watch(user, (newVal, oldVal) => {
  console.log('user changed')
}, { deep: true })

// 5. 立即执行
const count = ref(0)
watch(count, (newVal, oldVal) => {
  console.log(`count: ${oldVal} -> ${newVal}`)
}, { immediate: true })

// 6. 清理副作用
const source = ref(0)
watch(source, async (newVal, oldVal, onCleanup) => {
  const controller = new AbortController()
  
  onCleanup(() => {
    controller.abort()
  })
  
  const data = await fetch(`/api/data?id=${newVal}`, {
    signal: controller.signal
  })
  
  console.log(data)
})

// 7. 刷新时机
const count = ref(0)
watch(count, (newVal, oldVal) => {
  console.log('count changed')
}, { flush: 'post' }) // 在 DOM 更新后执行
```

### watch vs watchEffect

```javascript
// watchEffect：自动收集依赖，立即执行
const count = ref(0)
watchEffect(() => {
  console.log(`count is: ${count.value}`)
})
// 立即执行一次，count 变化时自动执行

// watch：明确指定依赖，可以控制执行时机
const count = ref(0)
watch(count, (newVal, oldVal) => {
  console.log(`count changed: ${oldVal} -> ${newVal}`)
})
// count 变化时执行，不会立即执行（除非 immediate: true）

// 区别：
// 1. watchEffect 自动收集依赖，watch 需要明确指定
// 2. watchEffect 立即执行，watch 默认不立即执行
// 3. watch 可以获取新旧值，watchEffect 不行
// 4. watch 可以停止监听，watchEffect 也可以但不太常用
```

---

## effect

### 基本用法

**effect 是 Vue3 响应式系统的核心，用于创建一个响应式副作用函数。**

```javascript
import { reactive, effect } from 'vue'

const state = reactive({
  count: 0
})

// 创建 effect
effect(() => {
  console.log(`count is: ${state.count}`)
})

state.count++ // 会触发 effect 执行
state.count++ // 会触发 effect 执行
```

### 原理实现

**核心原理：在执行副作用函数时收集依赖，数据变化时重新执行。**

```javascript
// 简化的 effect 实现
let activeEffect = null
const effectStack = []

class ReactiveEffect {
  constructor(fn, scheduler = null) {
    this.fn = fn
    this.scheduler = scheduler
    this.deps = [] // 依赖的响应式对象
    this.active = true
    this.parent = null
  }
  
  run() {
    if (!this.active) {
      return this.fn()
    }
    
    try {
      // 保存当前 effect
      this.parent = activeEffect
      activeEffect = this
      effectStack.push(this)
      
      // 清理旧的依赖
      cleanupEffect(this)
      
      // 执行函数，收集依赖
      return this.fn()
    } finally {
      effectStack.pop()
      activeEffect = this.parent
      this.parent = null
    }
  }
  
  stop() {
    if (this.active) {
      cleanupEffect(this)
      this.active = false
    }
  }
}

function effect(fn, options = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  
  // 扩展属性
  if (options) {
    extend(_effect, options)
  }
  
  // 立即执行一次
  _effect.run()
  
  // 返回 runner，可以手动执行
  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  
  return runner
}

// 依赖收集
function track(target, type, key) {
  if (!activeEffect) {
    return
  }
  
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = createDep()))
  }
  
  trackEffects(dep)
}

function trackEffects(dep) {
  let shouldTrack = false
  if (effectTrackDepth <= maxMarkerBits) {
    if (!newTracked(dep)) {
      dep.n |= trackOpBit
      shouldTrack = !wasTracked(dep)
    }
  } else {
    shouldTrack = !dep.has(activeEffect)
  }
  
  if (shouldTrack) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
  }
}

// 触发更新
function trigger(target, type, key, newValue, oldValue) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  
  const effects = new Set()
  
  // 收集需要触发的 effects
  if (key !== undefined) {
    const dep = depsMap.get(key)
    if (dep) {
      dep.forEach(effect => effects.add(effect))
    }
  }
  
  // 触发 effects
  effects.forEach(effect => {
    if (effect !== activeEffect) {
      if (effect.scheduler) {
        effect.scheduler()
      } else {
        effect.run()
      }
    }
  })
}

// 清理依赖
function cleanupEffect(effect) {
  const { deps } = effect
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect)
    }
    deps.length = 0
  }
}
```

### 使用场景

```javascript
// 1. 基本使用
const state = reactive({ count: 0 })
effect(() => {
  console.log(`count is: ${state.count}`)
})

// 2. 停止 effect
const state = reactive({ count: 0 })
const stopEffect = effect(() => {
  console.log(`count is: ${state.count}`)
})

state.count++ // 会触发
stopEffect() // 停止
state.count++ // 不会触发

// 3. 调度器
const state = reactive({ count: 0 })
effect(() => {
  console.log(`count is: ${state.count}`)
}, {
  scheduler: () => {
    // 使用调度器控制执行时机
    queueJob(() => {
      console.log(`count changed to: ${state.count}`)
    })
  }
})

// 4. 嵌套 effect
const state = reactive({ count: 0 })
effect(() => {
  console.log(`outer: ${state.count}`)
  effect(() => {
    console.log(`inner: ${state.count}`)
  })
})

// 5. 计算属性的基础
const state = reactive({ count: 0 })
const double = computed(() => state.count * 2)
// computed 内部使用 effect 实现

// 6. watch 的基础
const state = reactive({ count: 0 })
watch(() => state.count, (newVal, oldVal) => {
  console.log(`count changed: ${oldVal} -> ${newVal}`)
})
// watch 内部使用 effect 实现
```

### effect vs watchEffect

```javascript
// effect: 基础的副作用函数
const state = reactive({ count: 0 })
effect(() => {
  console.log(`count is: ${state.count}`)
})

// watchEffect: 基于 effect 的封装，更易用
const state = reactive({ count: 0 })
watchEffect(() => {
  console.log(`count is: ${state.count}`)
})

// 区别：
// 1. effect 是基础 API，watchEffect 是封装后的 API
// 2. watchEffect 会自动停止在组件卸载时，effect 需要手动停止
// 3. watchEffect 提供了更多配置选项
// 4. watchEffect 会在组件卸载时自动清理，effect 不会
```

---

## 对比总结

### ref vs reactive

| 特性 | ref | reactive |
|------|-----|----------|
| **适用类型** | 基本类型、对象 | 对象、数组 |
| **访问方式** | 需要 .value | 直接访问 |
| **模板使用** | 自动解包 | 直接使用 |
| **解构** | 丢失响应性 | 丢失响应性（需 toRefs） |
| **重新赋值** | 支持 | 不支持 |
| **响应式原理** | Proxy 包装对象 | Proxy 包装对象 |
| **性能** | 基本类型开销小 | 深层代理开销大 |

**选择建议：**
```javascript
// ✅ 使用 ref 的场景
const count = ref(0) // 基本类型
const message = ref('Hello') // 字符串
const isVisible = ref(true) // 布尔值
const inputRef = ref(null) // DOM 引用

// ✅ 使用 reactive 的场景
const state = reactive({ // 复杂对象
  count: 0,
  message: 'Hello',
  user: {
    name: 'John',
    age: 20
  }
})

const list = reactive([1, 2, 3]) // 数组

const formData = reactive({ // 表单数据
  username: '',
  password: '',
  email: ''
})
```

### watch vs watchEffect

| 特性 | watch | watchEffect |
|------|-------|-------------|
| **依赖收集** | 手动指定 | 自动收集 |
| **执行时机** | 默认不立即执行 | 立即执行 |
| **获取新旧值** | 支持 | 不支持 |
| **停止监听** | 返回停止函数 | 返回停止函数 |
| **清理副作用** | 支持（onCleanup） | 支持（onCleanup） |
| **适用场景** | 需要精确控制 | 自动追踪依赖 |

**选择建议：**
```javascript
// ✅ 使用 watch 的场景
const count = ref(0)
watch(count, (newVal, oldVal) => {
  console.log(`count changed: ${oldVal} -> ${newVal}`)
  // 需要获取新旧值
})

const state = reactive({ count: 0 })
watch(() => state.count, (newVal, oldVal) => {
  // 需要精确控制监听的属性
  console.log(`count changed: ${oldVal} -> ${newVal}`)
})

// ✅ 使用 watchEffect 的场景
const state = reactive({ count: 0, message: 'Hello' })
watchEffect(() => {
  // 自动追踪依赖，不需要手动指定
  console.log(`${state.message}: ${state.count}`)
})
```

### ref vs toRaw

| 特性 | ref | toRaw |
|------|-----|-------|
| **功能** | 创建响应式引用 | 获取原始对象 |
| **返回值** | RefImpl 对象 | 原始对象 |
| **响应式** | 保持响应式 | 失去响应式 |
| **使用场景** | 创建响应式数据 | 临时读取/批量操作 |
| **性能** | 有响应式开销 | 无响应式开销 |

**选择建议：**
```javascript
// ✅ 使用 ref 的场景
const count = ref(0) // 创建响应式数据
const user = ref({ name: 'John' }) // 包装对象

// ✅ 使用 toRaw 的场景
const state = reactive({ count: 0 })
const raw = toRaw(state) // 获取原始对象

// 临时读取，不建立依赖
function logState() {
  console.log(toRaw(state).count)
}

// 批量操作，避免多次触发更新
function addManyItems() {
  const raw = toRaw(state.list)
  for (let i = 0; i < 1000; i++) {
    raw.push(i)
  }
  state.list = [...raw] // 手动触发一次更新
}
```

### effect vs watch vs watchEffect

| 特性 | effect | watch | watchEffect |
|------|--------|-------|-------------|
| **API 层级** | 基础 API | 高级 API | 高级 API |
| **依赖收集** | 自动收集 | 手动指定 | 自动收集 |
| **执行时机** | 立即执行 | 可配置 | 立即执行 |
| **获取新旧值** | 不支持 | 支持 | 不支持 |
| **清理副作用** | 手动清理 | 自动清理 | 自动清理 |
| **停止监听** | 手动停止 | 返回停止函数 | 返回停止函数 |
| **使用场景** | 底层实现 | 精确控制 | 自动追踪 |

**选择建议：**
```javascript
// ✅ 使用 effect 的场景
// 开发自定义响应式功能
function useCustomReactive() {
  const state = reactive({ count: 0 })
  
  effect(() => {
    console.log(`count is: ${state.count}`)
  })
  
  return { state }
}

// ✅ 使用 watch 的场景
const count = ref(0)
watch(count, (newVal, oldVal) => {
  // 需要获取新旧值
  console.log(`count changed: ${oldVal} -> ${newVal}`)
})

// ✅ 使用 watchEffect 的场景
const state = reactive({ count: 0, message: 'Hello' })
watchEffect(() => {
  // 自动追踪依赖
  console.log(`${state.message}: ${state.count}`)
})
```

---

## 最佳实践

### 1. 响应式数据的选择

```javascript
// ✅ 推荐：基本类型使用 ref
const count = ref(0)
const message = ref('Hello')

// ✅ 推荐：复杂对象使用 reactive
const state = reactive({
  user: {
    name: 'John',
    age: 20
  },
  list: [1, 2, 3]
})

// ✅ 推荐：解构 reactive 使用 toRefs
const state = reactive({
  count: 0,
  message: 'Hello'
})
const { count, message } = toRefs(state)
```

### 2. 避免响应式丢失

```javascript
// ❌ 错误：解构会丢失响应性
const state = reactive({ count: 0 })
const { count } = state // count 不是响应式的

// ✅ 正确：使用 toRefs
const { count } = toRefs(state)

// ❌ 错误：直接赋值
const state = reactive({ count: 0 })
state = { count: 1 } // 不会触发更新

// ✅ 正确：修改属性
state.count = 1
```

### 3. 性能优化

```javascript
// ✅ 使用 toRaw 避免响应式开销
const state = reactive({ heavyData: {} })

function processData() {
  const raw = toRaw(state.heavyData)
  // 处理大量数据
}

// ✅ 使用 shallowRef/shallowReactive 减少深层代理
const state = shallowReactive({
  deep: {
    nested: {
      data: {}
    }
  }
})

// ✅ 使用 markRaw 标记不需要响应式的数据
const state = reactive({
  config: markRaw({
    // 不需要响应式的配置
  })
})
```

### 4. 副作用清理

```javascript
// ✅ 正确：清理副作用
const source = ref(0)
watch(source, async (newVal, oldVal, onCleanup) => {
  const controller = new AbortController()
  
  onCleanup(() => {
    controller.abort() // 取消请求
  })
  
  const data = await fetch(`/api/data?id=${newVal}`, {
    signal: controller.signal
  })
})
```

### 5. 组件中使用

```javascript
import { ref, reactive, watch, watchEffect, onUnmounted } from 'vue'

export default {
  setup() {
    // 使用 ref
    const count = ref(0)
    
    // 使用 reactive
    const state = reactive({
      message: 'Hello',
      user: {
        name: 'John'
      }
    })
    
    // 使用 watch
    watch(count, (newVal, oldVal) => {
      console.log(`count changed: ${oldVal} -> ${newVal}`)
    })
    
    // 使用 watchEffect
    watchEffect(() => {
      console.log(`${state.message}: ${count.value}`)
    })
    
    // 组件卸载时清理
    onUnmounted(() => {
      // 清理逻辑
    })
    
    return {
      count,
      state
    }
  }
}
```

---

## 总结

Vue3 的响应式 API 提供了灵活且强大的数据管理能力：

- **ref**: 适用于基本类型和需要重新赋值的场景
- **reactive**: 适用于复杂对象和数组
- **toRaw**: 用于获取原始对象，避免响应式开销
- **watch**: 用于精确控制监听的数据源
- **effect**: 响应式系统的基础，用于创建副作用

合理使用这些 API，可以构建出高效、可维护的 Vue3 应用。