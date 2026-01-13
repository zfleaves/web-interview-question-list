# Vue3 面试题集锦（截止 2025 年底）

## 目录
1. [Vue3 核心改进](#vue3-核心改进)
2. [Composition API](#composition-api)
3. [响应式系统](#响应式系统)
4. [虚拟 DOM 与 Diff 算法](#虚拟-dom-与-diff-算法)
5. [组件通信](#组件通信)
6. [生命周期](#生命周期)
7. [新特性与 API](#新特性与-api)
8. [Vue2 vs Vue3 对比](#vue2-vs-vue3-对比)
9. [性能优化](#性能优化)
10. [最佳实践](#最佳实践)

---

## Vue3 核心改进

### 1. Vue3 相比 Vue2 有哪些重大改进？

**答案：**

**1. 响应式系统重构：**

```javascript
// Vue2: Object.defineProperty
// ❌ 局限性：
// - 无法检测对象属性的添加/删除
// - 无法检测数组索引和长度的变化
// - 需要递归遍历所有属性，性能开销大

const vm = new Vue({
  data: {
    user: { name: 'John' }
  }
});

// Vue3: Proxy
// ✅ 优势：
// - 可以检测对象属性的添加/删除
// - 可以检测数组索引和长度的变化
// - 不需要递归，性能更好
// - 支持 Map、Set、WeakMap、WeakSet

const { reactive } = Vue;
const state = reactive({
  user: { name: 'John' }
});

// 动态添加属性
state.user.age = 20; // ✅ 响应式

// 数组操作
state.items[0] = 10; // ✅ 响应式
state.items.length = 0; // ✅ 响应式
```

**2. Composition API：**

```javascript
// Vue2: Options API
export default {
  data() {
    return {
      count: 0,
      name: 'John'
    };
  },
  computed: {
    doubleCount() {
      return this.count * 2;
    }
  },
  methods: {
    increment() {
      this.count++;
    }
  },
  mounted() {
    console.log('mounted');
  }
};

// Vue3: Composition API
import { ref, computed, onMounted } from 'vue';

export default {
  setup() {
    const count = ref(0);
    const name = ref('John');
    
    const doubleCount = computed(() => count.value * 2);
    
    const increment = () => {
      count.value++;
    };
    
    onMounted(() => {
      console.log('mounted');
    });
    
    return {
      count,
      name,
      doubleCount,
      increment
    };
  }
};

// ✅ 优势：
// - 更好的逻辑复用
// - 更好的 TypeScript 支持
// - 更灵活的代码组织
// - 更小的打包体积（按需引入）
```

**3. 性能优化：**

```javascript
// Vue2 vs Vue3 性能对比

// 1. 初始化渲染速度
// Vue3: 快 1.3~2 倍

// 2. 更新速度
// Vue3: 快 1.3~2 倍

// 3. 内存占用
// Vue3: 减少 41%

// 4. 包体积
// Vue3: 减少 41%（13KB → 10KB gzip）

// 5. Tree-shaking
// Vue3: 支持更好的 Tree-shaking
// 未使用的 API 不会被打包
```

**4. 新增特性：**

```javascript
// 1. Teleport（传送门）
<Teleport to="body">
  <div class="modal">Modal Content</div>
</Teleport>

// 2. Suspense（异步组件）
<Suspense>
  <template #default>
    <AsyncComponent />
  </template>
  <template #fallback>
    <Loading />
  </template>
</Suspense>

// 3. Fragment（多根节点）
<template>
  <header>Header</header>
  <main>Main</main>
  <footer>Footer</footer>
</template>

// 4. 自定义渲染器
// 可以渲染到 Canvas、WebGL 等平台
```

**5. TypeScript 支持：**

```javascript
// Vue2: TypeScript 支持较弱
// 需要装饰器，类型推断不完善

// Vue3: 原生 TypeScript 支持
import { ref, computed } from 'vue';

interface User {
  name: string;
  age: number;
}

export default {
  setup() {
    const user = ref<User>({ name: 'John', age: 20 });
    const doubleAge = computed(() => user.value.age * 2);
    
    return { user, doubleAge };
  }
};
```

---

### 2. Vue3 的响应式原理是什么？与 Vue2 有什么区别？

**答案：**

**Vue2 响应式原理：**

```javascript
// 使用 Object.defineProperty
function observe(obj) {
  if (typeof obj !== 'object' || obj === null) return;
  
  Object.keys(obj).forEach(key => {
    let value = obj[key];
    let dep = new Dep();
    
    Object.defineProperty(obj, key, {
      get() {
        if (Dep.target) {
          dep.addSub(Dep.target);
        }
        return value;
      },
      set(newValue) {
        if (newValue !== value) {
          value = newValue;
          dep.notify();
        }
      }
    });
    
    if (typeof value === 'object') {
      observe(value);
    }
  });
}

// ❌ 局限性：
// 1. 只能监听对象已有属性
// 2. 无法监听数组索引和长度变化
// 3. 需要递归遍历，初始化慢
// 4. 无法监听 Map、Set、WeakMap、WeakSet
```

**Vue3 响应式原理：**

```javascript
// 使用 Proxy
import { reactive, effect } from 'vue';

function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      track(target, key); // 依赖收集
      return isObject(result) ? reactive(result) : result;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        trigger(target, key); // 触发更新
      }
      return result;
    },
    deleteProperty(target, key) {
      const hadKey = hasOwn(target, key);
      const result = Reflect.deleteProperty(target, key);
      if (hadKey && result) {
        trigger(target, key);
      }
      return result;
    },
    has(target, key) {
      track(target, key);
      return Reflect.has(target, key);
    },
    ownKeys(target) {
      track(target, 'iterate');
      return Reflect.ownKeys(target);
    }
  });
}

// ✅ 优势：
// 1. 可以监听对象所有操作（添加、删除、修改）
// 2. 可以监听数组所有操作（索引、长度）
// 3. 不需要递归，惰性代理
// 4. 支持 Map、Set、WeakMap、WeakSet
// 5. 性能更好
```

**依赖收集机制对比：**

```javascript
// Vue2: 使用 Dep 和 Watcher
class Dep {
  constructor() {
    this.subs = [];
  }
  addSub(sub) {
    this.subs.push(sub);
  }
  notify() {
    this.subs.forEach(sub => sub.update());
  }
}

// Vue3: 使用 WeakMap 和 Set
const targetMap = new WeakMap();

function track(target, key) {
  if (!activeEffect) return;
  
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  
  dep.add(activeEffect);
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  
  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach(effect => effect());
  }
}

// ✅ 优势：
// 1. 使用 WeakMap，不会导致内存泄漏
// 2. 使用 Set，自动去重
// 3. 结构更清晰
```

**ref vs reactive：**

```javascript
import { ref, reactive } from 'vue';

// ref: 用于基本类型
const count = ref(0);
console.log(count.value); // 访问需要 .value
count.value = 1; // 修改需要 .value

// reactive: 用于对象类型
const state = reactive({
  count: 0,
  name: 'John'
});
console.log(state.count); // 直接访问
state.count = 1; // 直接修改

// ref 内部实现
function ref(value) {
  return {
    __v_isRef: true,
    get value() {
      track(this, 'value');
      return value;
    },
    set value(newValue) {
      if (newValue !== value) {
        value = newValue;
        trigger(this, 'value');
      }
    }
  };
}

// reactive 内部实现
function reactive(target) {
  return new Proxy(target, handler);
}
```

**toRef 和 toRefs：**

```javascript
import { reactive, toRef, toRefs } from 'vue';

const state = reactive({
  count: 0,
  name: 'John'
});

// toRef: 将 reactive 对象的属性转为 ref
const countRef = toRef(state, 'count');
console.log(countRef.value); // 0
countRef.value = 1; // state.count 也会变为 1

// toRefs: 将 reactive 对象的所有属性转为 ref
const { count, name } = toRefs(state);
console.log(count.value); // 0
count.value = 1; // state.count 也会变为 1

// 使用场景：解构 reactive 对象时保持响应式
export default {
  setup() {
    const state = reactive({
      count: 0,
      name: 'John'
    });
    
    // ❌ 错误：解构会丢失响应式
    const { count } = state;
    
    // ✅ 正确：使用 toRefs
    return {
      ...toRefs(state)
    };
  }
};
```

---

## Composition API

### 3. Composition API 的核心概念是什么？

**答案：**

**setup 函数：**

```javascript
import { ref, reactive, computed, onMounted } from 'vue';

export default {
  setup(props, context) {
    // props: 组件的 props
    // context: { attrs, slots, emit, expose }
    
    // 1. 定义响应式数据
    const count = ref(0);
    const user = reactive({
      name: 'John',
      age: 20
    });
    
    // 2. 定义计算属性
    const doubleCount = computed(() => count.value * 2);
    
    // 3. 定义方法
    const increment = () => {
      count.value++;
    };
    
    // 4. 生命周期钩子
    onMounted(() => {
      console.log('mounted');
    });
    
    // 5. 返回给模板使用
    return {
      count,
      user,
      doubleCount,
      increment
    };
  }
};

// <script setup> 语法糖
<script setup>
import { ref, computed, onMounted } from 'vue';

const count = ref(0);
const doubleCount = computed(() => count.value * 2);

const increment = () => {
  count.value++;
};

onMounted(() => {
  console.log('mounted');
});
</script>
```

**ref 和 reactive：**

```javascript
import { ref, reactive } from 'vue';

// ref: 适用于基本类型和对象
const count = ref(0);
const user = ref({ name: 'John' });

// reactive: 只适用于对象
const state = reactive({
  count: 0,
  user: { name: 'John' }
});

// 选择建议：
// 1. 基本类型使用 ref
// 2. 对象可以使用 reactive 或 ref
// 3. 需要整体替换对象时使用 ref
// 4. 需要保持对象引用时使用 reactive
```

**computed：**

```javascript
import { ref, computed } from 'vue';

const count = ref(0);

// 1. 只读计算属性
const doubleCount = computed(() => count.value * 2);

// 2. 可写计算属性
const fullName = computed({
  get() {
    return user.value.firstName + ' ' + user.value.lastName;
  },
  set(newValue) {
    const names = newValue.split(' ');
    user.value.firstName = names[0];
    user.value.lastName = names[names.length - 1];
  }
});

// 3. 计算属性缓存
// 计算属性会缓存结果，依赖不变不会重新计算
// methods 每次都会重新执行
```

**watch 和 watchEffect：**

```javascript
import { ref, watch, watchEffect } from 'vue';

const count = ref(0);
const user = reactive({ name: 'John', age: 20 });

// 1. watch: 监听单个或多个数据源
watch(count, (newValue, oldValue) => {
  console.log(`count changed from ${oldValue} to ${newValue}`);
});

// 监听多个数据源
watch([count, () => user.age], ([newCount, newAge], [oldCount, oldAge]) => {
  console.log('count or age changed');
});

// 监听 reactive 对象
watch(
  () => user.name,
  (newValue, oldValue) => {
    console.log(`name changed from ${oldValue} to ${newValue}`);
  }
);

// 深度监听
watch(
  user,
  (newValue, oldValue) => {
    console.log('user changed');
  },
  { deep: true }
);

// 立即执行
watch(
  count,
  (newValue) => {
    console.log(newValue);
  },
  { immediate: true }
);

// 2. watchEffect: 自动追踪依赖
watchEffect(() => {
  console.log(`count is ${count.value}, name is ${user.name}`);
});

// watchEffect vs watch:
// - watchEffect: 自动追踪依赖，不需要指定监听源
// - watch: 需要明确指定监听源，更精确
// - watchEffect: 立即执行一次
// - watch: 需要配置 immediate 才会立即执行

// watchEffect 依赖收集原理：
// 1. 在执行 effect 函数时，Vue 会创建一个 activeEffect
// 2. 当访问响应式数据时，会触发 getter
// 3. getter 中会检查是否有 activeEffect
// 4. 如果有，将 activeEffect 添加到该响应式数据的依赖集合中
// 5. 当响应式数据变化时，通知所有依赖的 effect 重新执行

// 示例：依赖收集过程
const count = ref(0);

let activeEffect = null;

function track(target, key) {
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
  }
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (depsMap) {
    const dep = depsMap.get(key);
    if (dep) {
      dep.forEach(effect => effect());
    }
  }
}

// ref 的实现（简化版）
function ref(value) {
  return {
    get value() {
      track(this, 'value');
      return value;
    },
    set value(newValue) {
      if (newValue !== value) {
        value = newValue;
        trigger(this, 'value');
      }
    }
  };
}

// watchEffect 的实现（简化版）
function watchEffect(effect) {
  activeEffect = effect;
  effect(); // 执行 effect，收集依赖
  activeEffect = null;
}

// 为什么异步依赖收集不了：
// 问题示例
const count = ref(0);

watchEffect(() => {
  setTimeout(() => {
    console.log(count.value); // ❌ 依赖收集不到
  }, 1000);
});

count.value++; // effect 不会重新执行

// 原因：
// 1. watchEffect 在执行时，会立即同步执行 effect 函数
// 2. 依赖收集只在同步执行时进行
// 3. setTimeout 中的代码是异步执行的，此时 activeEffect 已经被重置为 null
// 4. 当 count.value 在 setTimeout 中被访问时，activeEffect 已经不存在，无法收集依赖

// 解决方案 1：使用 watch 明确指定依赖
watch(
  () => count.value,
  (newValue) => {
    setTimeout(() => {
      console.log(newValue); // ✅ 可以正常工作
    }, 1000);
  }
);

// 解决方案 2：先同步访问，再异步使用
watchEffect(() => {
  const value = count.value; // ✅ 同步访问，可以收集依赖
  setTimeout(() => {
    console.log(value);
  }, 1000);
});

// 解决方案 3：使用 flush 选项
watchEffect(
  () => {
    const value = count.value;
    setTimeout(() => {
      console.log(value);
    }, 1000);
  },
  { flush: 'sync' } // 同步执行 effect
);

// 解决方案 4：使用 watchEffect + onCleanup
watchEffect((onCleanup) => {
  const timer = setTimeout(() => {
    console.log(count.value);
  }, 1000);
  
  onCleanup(() => {
    clearTimeout(timer);
  });
});

// 实际应用场景
// ❌ 错误：异步依赖收集不到
watchEffect(() => {
  fetchData().then(data => {
    console.log(data.value); // data.value 的依赖收集不到
  });
});

// ✅ 正确：使用 watch
watch(
  () => data.value,
  () => {
    fetchData();
  }
);

// ✅ 正确：先同步访问
watchEffect(() => {
  const value = data.value;
  fetchData().then(() => {
    console.log(value);
  });
});

// 3. watchPostEffect 和 watchSyncEffect
// watchPostEffect: 在 DOM 更新后执行
// watchSyncEffect: 同步执行
```

**生命周期钩子：**

```javascript
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onErrorCaptured,
  onActivated,
  onDeactivated
} from 'vue';

export default {
  setup() {
    onBeforeMount(() => {
      console.log('beforeMount');
    });
    
    onMounted(() => {
      console.log('mounted');
    });
    
    onBeforeUpdate(() => {
      console.log('beforeUpdate');
    });
    
    onUpdated(() => {
      console.log('updated');
    });
    
    onBeforeUnmount(() => {
      console.log('beforeUnmount');
    });
    
    onUnmounted(() => {
      console.log('unmounted');
    });
    
    onErrorCaptured((err) => {
      console.error('error:', err);
    });
    
    onActivated(() => {
      console.log('activated');
    });
    
    onDeactivated(() => {
      console.log('deactivated');
    });
  }
};

// Vue2 vs Vue3 生命周期对比
// Vue2                Vue3
// beforeCreate   ->   setup()
// created        ->   setup()
// beforeMount    ->   onBeforeMount
// mounted        ->   onMounted
// beforeUpdate   ->   onBeforeUpdate
// updated        ->   onUpdated
// beforeDestroy  ->   onBeforeUnmount
// destroyed      ->   onUnmounted
// errorCaptured  ->   onErrorCaptured
// activated      ->   onActivated
// deactivated    ->   onDeactivated
```

**provide 和 inject：**

```javascript
// 祖先组件
import { provide, ref } from 'vue';

export default {
  setup() {
    const theme = ref('light');
    
    // 提供响应式数据
    provide('theme', theme);
    
    // 提供方法
    provide('updateTheme', (newTheme) => {
      theme.value = newTheme;
    });
    
    // 提供只读数据
    provide('readonlyTheme', readonly(theme));
  }
};

// 后代组件
import { inject } from 'vue';

export default {
  setup() {
    // 注入数据
    const theme = inject('theme');
    
    // 注入方法
    const updateTheme = inject('updateTheme');
    
    // 提供默认值
    const user = inject('user', { name: 'Guest' });
    
    return { theme, updateTheme };
  }
};
```

**自定义 Hook：**

```javascript
// useMouse.js
import { ref, onMounted, onUnmounted } from 'vue';

export function useMouse() {
  const x = ref(0);
  const y = ref(0);
  
  const update = (e) => {
    x.value = e.clientX;
    y.value = e.clientY;
  };
  
  onMounted(() => {
    window.addEventListener('mousemove', update);
  });
  
  onUnmounted(() => {
    window.removeEventListener('mousemove', update);
  });
  
  return { x, y };
}

// 使用
import { useMouse } from './useMouse';

export default {
  setup() {
    const { x, y } = useMouse();
    
    return { x, y };
  }
};

// useFetch.js
import { ref, onMounted } from 'vue';

export function useFetch(url) {
  const data = ref(null);
  const error = ref(null);
  const loading = ref(false);
  
  const fetch = async () => {
    loading.value = true;
    try {
      const response = await fetch(url);
      data.value = await response.json();
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };
  
  onMounted(() => {
    fetch();
  });
  
  return { data, error, loading, fetch };
}

// 使用
import { useFetch } from './useFetch';

export default {
  setup() {
    const { data, error, loading } = useFetch('/api/users');
    
    return { data, error, loading };
  }
};
```

---

## 响应式系统

### 4. Vue3 的响应式系统有哪些新特性？

**答案：**

**1. Proxy 的优势：**

```javascript
import { reactive } from 'vue';

const state = reactive({
  user: { name: 'John' },
  items: [1, 2, 3]
});

// ✅ 可以检测对象属性的添加
state.user.age = 20; // 响应式

// ✅ 可以检测对象属性的删除
delete state.user.name; // 响应式

// ✅ 可以检测数组索引的变化
state.items[0] = 10; // 响应式

// ✅ 可以检测数组长度的变化
state.items.length = 0; // 响应式

// ✅ 可以检测 Map、Set
const map = reactive(new Map());
map.set('key', 'value'); // 响应式

const set = reactive(new Set());
set.add('value'); // 响应式
```

**2. 懒性代理：**

```javascript
// Vue2: 递归代理所有属性
const data = {
  user: {
    profile: {
      name: 'John'
    }
  }
};
// 即使不访问 user.profile，也会被代理

// Vue3: 懒性代理
const state = reactive({
  user: {
    profile: {
      name: 'John'
    }
  }
});
// 只有访问 state.user.profile 时，才会代理 profile
// 初始化速度更快
```

**3. 只读和浅层响应式：**

```javascript
import { reactive, readonly, shallowReactive, shallowReadonly } from 'vue';

// readonly: 创建只读代理
const original = reactive({ count: 0 });
const copy = readonly(original);

copy.count++; // ❌ 警告：不能修改只读代理

// shallowReactive: 浅层响应式
const state = shallowReactive({
  count: 0,
  nested: { value: 1 }
});

state.count++; // ✅ 响应式
state.nested.value++; // ❌ 非响应式

// shallowReadonly: 浅层只读
const state = shallowReadonly({
  count: 0,
  nested: { value: 1 }
});

state.count++; // ❌ 警告
state.nested.value++; // ✅ 可以修改（非响应式）
```

**4. toRaw 和 markRaw：**

```javascript
import { reactive, toRaw, markRaw } from 'vue';

// toRaw: 获取原始对象
const state = reactive({ count: 0 });
const original = toRaw(state);
console.log(original === state); // false
console.log(original === toRaw(state)); // true

// markRaw: 标记对象为非响应式
const foo = markRaw({
  nested: {}
});

const state = reactive({
  foo
});

state.foo.nested = 'bar'; // ❌ 非响应式

// 使用场景：
// 1. 不需要响应式的复杂对象
// 2. 第三方库实例（如浏览器 API）
// 3. 性能优化（避免不必要的代理）
```

**5. effectScope：**

```javascript
import { effectScope, reactive, watchEffect } from 'vue';

// 创建作用域
const scope = effectScope();

scope.run(() => {
  const state = reactive({ count: 0 });
  
  watchEffect(() => {
    console.log(state.count);
  });
});

// 停止作用域内的所有 effect
scope.stop();

// 使用场景：
// 1. 组件卸载时清理副作用
// 2. 测试时清理副作用
// 3. 插件开发时管理副作用
```

---

## 虚拟 DOM 与 Diff 算法

### 5. Vue3 的虚拟 DOM 和 Diff 算法有哪些改进？

**答案：**

## 一、Real DOM 和 Virtual DOM 基础

**Real DOM（真实 DOM）：**

Real DOM，真实 DOM，意思为文档对象模型，是一个结构化文本的抽象，在页面渲染出的每一个结点都是一个真实 DOM 结构。

**Virtual DOM（虚拟 DOM）：**

Virtual DOM，本质上是以 JavaScript 对象形式存在的对 DOM 的描述。创建虚拟 DOM 目的就是为了更好将虚拟的节点渲染到页面视图中，虚拟 DOM 对象的节点与真实 DOM 的属性一一照应。

**Real DOM 和 Virtual DOM 的区别：**

- **虚拟 DOM 不会进行排版与重绘操作**，而真实 DOM 会频繁重排与重绘
- **虚拟 DOM 的总损耗**是"虚拟 DOM 增删改+真实 DOM 差异增删改+排版与重绘"，**真实 DOM 的总损耗**是"真实 DOM 完全增删改+排版与重绘"

**举例说明：**

传统的原生 api 或 jQuery 去操作 DOM 时，浏览器会从构建 DOM 树开始从头到尾执行一遍流程。

当你在一次操作时，需要更新 10 个 DOM 节点，浏览器没这么智能，收到第一个更新 DOM 请求后，并不知道后续还有 9 次更新操作，因此会马上执行流程，最终执行 10 次流程。

而通过 VNode，同样更新 10 个 DOM 节点，虚拟 DOM 不会立即操作 DOM，而是将这 10 次更新的 diff 内容保存到本地的一个 js 对象中，最终将这个 js 对象一次性 attach 到 DOM 树上，避免大量的无谓计算。

**Real DOM 和 Virtual DOM 的优缺点：**

**真实 DOM 的优势：**
- 易用

**真实 DOM 的缺点：**
- 效率低，解析速度慢，内存占用量过高
- 性能差：频繁操作真实 DOM，易于导致重绘与回流

**使用虚拟 DOM 的优势：**
- **简单方便**：如果使用手动操作真实 DOM 来完成页面，繁琐又容易出错，在大规模应用下维护起来也很困难
- **性能方面**：使用 Virtual DOM，能够有效避免真实 DOM 数频繁更新，减少多次引起重绘与回流，提高性能
- **跨平台**：React 借助虚拟 DOM，带来了跨平台的能力，一套代码多端运行

**虚拟 DOM 的缺点：**
- 在一些性能要求极高的应用中虚拟 DOM 无法进行针对性的极致优化
- 首次渲染大量 DOM 时，由于多了一层虚拟 DOM 的计算，速度比正常稍慢

## 二、Vue3 的改进

**1. 静态提升：**

```javascript
// Vue2: 每次渲染都会重新创建静态节点
function render() {
  return h('div', [
    h('p', 'static text'), // 每次都创建
    h('p', this.message)
  ]);
}

// Vue3: 静态节点提升到渲染函数外部
const _hoisted_1 = h('p', 'static text'); // 只创建一次

function render() {
  return h('div', [
    _hoisted_1, // 复用
    h('p', this.message)
  ]);
}

// 性能提升：减少 VNode 创建和 diff
```

**2. 补丁标记：**

```javascript
// Vue2: 每次都需要完整 diff
// Vue3: 使用补丁标记，只 diff 有变化的部分

const PatchFlags = {
  TEXT: 1,           // 动态文本
  CLASS: 2,           // 动态 class
  STYLE: 4,           // 动态 style
  PROPS: 8,           // 动态属性
  FULL_PROPS: 16,     // 有动态 key 的属性
  EVENT: 32,          // 动态事件
  HYDRATE_EVENTS: 64, // SSR 相关
  STABLE_FRAGMENT: 128, // 稳定 fragment
  KEYED_FRAGMENT: 256,  // 有 key 的 fragment
  UNKEYED_FRAGMENT: 512, // 无 key 的 fragment
  NEED_PATCH: 1024,    // 需要完整 diff
  DYNAMIC_SLOTS: 2048,  // 动态插槽
  HOISTED: -1,         // 静态节点
  BAIL: -2             // diff 算法优化
};

// 示例
function render() {
  return h('div', {
    class: isActive ? 'active' : '', // PatchFlags.CLASS
    onClick: handleClick              // PatchFlags.EVENT
  }, [
    h('p', message)                   // PatchFlags.TEXT
  ]);
}
```

**3. 块树（Block Tree）：**

```javascript
// Vue2: 完整 diff
// Vue3: 使用块树，只 diff 动态节点

// 示例
<div>
  <p>static</p>
  <p>{{ message }}</p>
  <p>static</p>
  <p>{{ count }}</p>
</div>

// Vue2: diff 所有 4 个 p 标签
// Vue3: 只 diff 2 个动态节点（message 和 count）

// 编译后的块
const block = {
  tag: 'div',
  dynamicChildren: [
    { type: 'text', index: 1 },  // message
    { type: 'text', index: 3 }   // count
  ]
};

// 性能提升：大幅减少 diff 范围
```

**4. 长列表优化：**

```javascript
// Vue2: 双端比较算法
// Vue3: 使用最长递增子序列（LIS）算法

// 优势：
// 1. 移动节点更高效
// 2. 减少节点移动次数
// 3. 时间复杂度从 O(n^2) 降到 O(n log n)

// 示例
const oldList = [A, B, C, D, E];
const newList = [D, A, B, C, E];

// Vue2: 需要 4 次移动
// Vue3: 只需要 1 次移动（D）
```

**5. 事件监听器缓存：**

```javascript
// Vue2: 每次渲染都创建新的事件监听器
function render() {
  return h('button', {
    onClick: () => console.log('click') // 每次都创建新函数
  });
}

// Vue3: 缓存事件监听器
function render() {
  return h('button', {
    onClick: cachedHandler // 复用
  });
}

// 性能提升：减少函数创建和内存分配
```

---

## 组件通信

### 6. Vue3 组件通信有哪些新方式？

**答案：**

**1. defineProps 和 defineEmits：**

```javascript
// Vue2
export default {
  props: {
    message: String
  },
  emits: ['update'],
  methods: {
    handleClick() {
      this.$emit('update', 'new message');
    }
  }
};

// Vue3: <script setup>
<script setup>
const props = defineProps({
  message: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update']);

const handleClick = () => {
  emit('update', 'new message');
};
</script>

// TypeScript 支持
<script setup lang="ts">
interface Props {
  message: string;
  count?: number;
}

interface Emits {
  (e: 'update', value: string): void;
  (e: 'delete', id: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
</script>
```

**2. defineExpose：**

```javascript
// Vue2
export default {
  methods: {
    publicMethod() {
      console.log('public method');
    }
  }
};

// Vue3: <script setup>
<script setup>
const count = ref(0);

const publicMethod = () => {
  console.log('public method');
};

// 暴露给父组件
defineExpose({
  count,
  publicMethod
});
</script>

// 父组件使用
<template>
  <ChildComponent ref="child" />
</template>

<script setup>
import { ref, onMounted } from 'vue';

const child = ref(null);

onMounted(() => {
  console.log(child.value.count); // 0
  child.value.publicMethod(); // 调用子组件方法
});
</script>
```

**3. v-model 升级：**

```javascript
// Vue2: v-model 默认使用 value 和 input 事件
<ChildComponent v-model="message" />

// Vue3: 支持多个 v-model
<ChildComponent 
  v-model="message"
  v-model:title="title"
  v-model:content="content"
/>

// 自定义组件
<script setup>
const props = defineProps(['modelValue', 'title', 'content']);
const emit = defineEmits(['update:modelValue', 'update:title', 'update:content']);

const updateValue = (value) => {
  emit('update:modelValue', value);
};

const updateTitle = (value) => {
  emit('update:title', value);
};

const updateContent = (value) => {
  emit('update:content', value);
};
</script>

// 自定义 v-model 修饰符
<ChildComponent v-model.capitalize="message" />

<script setup>
const props = defineProps({
  modelValue: String,
  modelModifiers: { default: () => ({}) }
});

const emit = defineEmits(['update:modelValue']);

const emitValue = (e) => {
  let value = e.target.value;
  if (props.modelModifiers.capitalize) {
    value = value.charAt(0).toUpperCase() + value.slice(1);
  }
  emit('update:modelValue', value);
};
</script>
```

**4. provide 和 inject 改进：**

```javascript
// Vue2
export default {
  provide() {
    return {
      theme: this.theme
    };
  }
};

// Vue3: 支持响应式和只读
<script setup>
import { provide, reactive, readonly } from 'vue';

const theme = reactive({
  color: 'blue',
  size: 'medium'
});

// 提供响应式数据
provide('theme', theme);

// 提供只读数据
provide('readonlyTheme', readonly(theme));

// 提供方法
provide('updateTheme', (color) => {
  theme.color = color;
});
</script>

// 后代组件
<script setup>
import { inject } from 'vue';

// 注入响应式数据
const theme = inject('theme');

// 注入只读数据
const readonlyTheme = inject('readonlyTheme');

// 注入方法
const updateTheme = inject('updateTheme');

// 提供默认值
const user = inject('user', { name: 'Guest' });

// TypeScript 支持
interface Theme {
  color: string;
  size: string;
}

const theme = inject<Theme>('theme');
</script>
```

**5. Teleport（传送门）：**

```javascript
// 将组件渲染到 DOM 的其他位置
<Teleport to="body">
  <div class="modal">
    Modal Content
  </div>
</Teleport>

// 传送到指定元素
<Teleport to="#modal-container">
  <div class="modal">
    Modal Content
  </div>
</Teleport>

// 禁用 Teleport
<Teleport to="body" :disabled="isInline">
  <div class="modal">
    Modal Content
  </div>
</Teleport>

// 使用场景：
// 1. Modal 弹窗
// 2. Toast 提示
// 3. Dropdown 下拉菜单
// 4. Tooltip 提示
```

---

## 生命周期

### 7. Vue3 的生命周期有哪些变化？

**答案：**

**生命周期钩子对比：**

```javascript
// Vue2
export default {
  beforeCreate() {
    console.log('beforeCreate');
  },
  created() {
    console.log('created');
  },
  beforeMount() {
    console.log('beforeMount');
  },
  mounted() {
    console.log('mounted');
  },
  beforeUpdate() {
    console.log('beforeUpdate');
  },
  updated() {
    console.log('updated');
  },
  beforeDestroy() {
    console.log('beforeDestroy');
  },
  destroyed() {
    console.log('destroyed');
  }
};

// Vue3
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onErrorCaptured,
  onRenderTracked,
  onRenderTriggered
} from 'vue';

export default {
  setup() {
    // beforeCreate 和 created 被 setup() 替代
    onBeforeMount(() => {
      console.log('beforeMount');
    });
    
    onMounted(() => {
      console.log('mounted');
    });
    
    onBeforeUpdate(() => {
      console.log('beforeUpdate');
    });
    
    onUpdated(() => {
      console.log('updated');
    });
    
    onBeforeUnmount(() => {
      console.log('beforeUnmount');
    });
    
    onUnmounted(() => {
      console.log('unmounted');
    });
    
    onErrorCaptured((err, instance, info) => {
      console.error('error:', err);
    });
    
    onRenderTracked((e) => {
      console.log('render tracked:', e);
    });
    
    onRenderTriggered((e) => {
      console.log('render triggered:', e);
    });
  }
};

// 映射关系
// Vue2                Vue3
// beforeCreate   ->   setup()
// created        ->   setup()
// beforeMount    ->   onBeforeMount
// mounted        ->   onMounted
// beforeUpdate   ->   onBeforeUpdate
// updated        ->   onUpdated
// beforeDestroy  ->   onBeforeUnmount
// destroyed      ->   onUnmounted
// errorCaptured  ->   onErrorCaptured
// -              ->   onRenderTracked (dev only)
// -              ->   onRenderTriggered (dev only)
```

**新的调试钩子：**

```javascript
import { onRenderTracked, onRenderTriggered } from 'vue';

export default {
  setup() {
    // 追踪依赖
    onRenderTracked((e) => {
      console.log('tracked:', e.target, e.type, e.key);
    });
    
    // 追踪触发
    onRenderTriggered((e) => {
      console.log('triggered:', e.target, e.type, e.key, e.oldValue, e.newValue);
    });
  }
};

// 使用场景：
// 1. 调试性能问题
// 2. 分析依赖关系
// 3. 优化渲染性能
```

---

## 新特性与 API

### 8. Vue3 有哪些新特性？

**答案：**

**1. Teleport（传送门）：**

```javascript
// 基本用法
<Teleport to="body">
  <div class="modal">Modal</div>
</Teleport>

// 传送到指定选择器
<Teleport to="#modal-container">
  <div class="modal">Modal</div>
</Teleport>

// 条件禁用
<Teleport to="body" :disabled="isInline">
  <div class="modal">Modal</div>
</Teleport>

// 多个 Teleport
<Teleport to="body">
  <div class="toast">Toast 1</div>
</Teleport>
<Teleport to="body">
  <div class="toast">Toast 2</div>
</Teleport>
```

**2. Suspense（异步组件）：**

```javascript
// 基本用法
<Suspense>
  <template #default>
    <AsyncComponent />
  </template>
  <template #fallback>
    <Loading />
  </template>
</Suspense>

// 嵌套使用
<Suspense>
  <template #default>
    <AsyncParent>
      <Suspense>
        <template #default>
          <AsyncChild />
        </template>
        <template #fallback>
          <ChildLoading />
        </template>
      </Suspense>
    </AsyncParent>
  </template>
  <template #fallback>
    <ParentLoading />
  </template>
</Suspense>

// 异步组件定义
const AsyncComponent = defineAsyncComponent({
  loader: () => import('./AsyncComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
});
```

**3. Fragment（多根节点）：**

```javascript
// Vue2: 必须有唯一根节点
<template>
  <div>
    <header>Header</header>
    <main>Main</main>
    <footer>Footer</footer>
  </div>
</template>

// Vue3: 支持多个根节点
<template>
  <header>Header</header>
  <main>Main</main>
  <footer>Footer</footer>
</template>

// 带条件渲染
<template>
  <header>Header</header>
  <main v-if="showMain">Main</main>
  <footer>Footer</footer>
</template>
```

**4. 自定义指令改进：**

```javascript
// Vue2
Vue.directive('focus', {
  inserted(el) {
    el.focus();
  }
});

// Vue3
const app = createApp(App);

app.directive('focus', {
  mounted(el) {
    el.focus();
  }
});

// 生命周期钩子变化
// Vue2              Vue3
// bind         ->   beforeMount
// inserted     ->   mounted
// update       ->   beforeUpdate
// componentUpdated -> updated
// unbind       ->   unmounted

// 完整示例
app.directive('my-directive', {
  created(el, binding, vnode, prevVnode) {
    console.log('created');
  },
  beforeMount(el, binding, vnode, prevVnode) {
    console.log('beforeMount');
  },
  mounted(el, binding, vnode, prevVnode) {
    console.log('mounted');
  },
  beforeUpdate(el, binding, vnode, prevVnode) {
    console.log('beforeUpdate');
  },
  updated(el, binding, vnode, prevVnode) {
    console.log('updated');
  },
  beforeUnmount(el, binding, vnode, prevVnode) {
    console.log('beforeUnmount');
  },
  unmounted(el, binding, vnode, prevVnode) {
    console.log('unmounted');
  }
});

// 简写形式
app.directive('focus', (el, binding) => {
  el.focus();
});
```

**5. Transition 改进：**

```javascript
// Vue2
<transition name="fade">
  <div v-if="show">Content</div>
</transition>

// Vue3: 支持 v-if、v-show、v-for 的过渡
<Transition>
  <div v-if="show">Content</div>
</Transition>

<TransitionGroup>
  <div v-for="item in list" :key="item.id">{{ item.text }}</div>
</TransitionGroup>

// TypeScript 支持
import { Transition, TransitionGroup } from 'vue';

// 自定义过渡类名
<Transition
  enter-active-class="animate__animated animate__bounce"
  leave-active-class="animate__animated animate__bounceOutRight"
>
  <div v-if="show">Content</div>
</Transition>

// JavaScript 钩子
<Transition
  @before-enter="onBeforeEnter"
  @enter="onEnter"
  @after-enter="onAfterEnter"
  @before-leave="onBeforeLeave"
  @leave="onLeave"
  @after-leave="onAfterLeave"
>
  <div v-if="show">Content</div>
</Transition>
```

**6. 全局 API 改变：**

```javascript
// Vue2
import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex';

Vue.use(VueRouter);
Vue.use(Vuex);

Vue.prototype.$http = axios;
Vue.component('my-component', MyComponent);
Vue.directive('my-directive', myDirective);
Vue.mixin(myMixin);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');

// Vue3
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

const app = createApp(App);

app.use(router);
app.use(store);

app.config.globalProperties.$http = axios;
app.component('my-component', MyComponent);
app.directive('my-directive', myDirective);
app.mixin(myMixin);

app.mount('#app');

// 优势：
// 1. 避免全局污染
// 2. 支持多个 Vue 实例
// 3. 更好的 Tree-shaking
```

---

## Vue2 vs Vue3 对比

### 9. Vue2 和 Vue3 的详细对比

**答案：**

**1. 响应式系统对比：**

```javascript
// Vue2: Object.defineProperty
// ❌ 局限性：
// - 无法检测对象属性的添加/删除
// - 无法检测数组索引和长度的变化
// - 需要递归遍历，性能开销大
// - 不支持 Map、Set、WeakMap、WeakSet

const vm = new Vue({
  data: {
    user: { name: 'John' }
  }
});

// Vue3: Proxy
// ✅ 优势：
// - 可以检测对象属性的添加/删除
// - 可以检测数组索引和长度的变化
// - 不需要递归，性能更好
// - 支持 Map、Set、WeakMap、WeakSet

const state = reactive({
  user: { name: 'John' }
});

// 对比示例
// Vue2
vm.user.age = 20; // ❌ 非响应式
Vue.set(vm.user, 'age', 20); // ✅ 需要使用 Vue.set

// Vue3
state.user.age = 20; // ✅ 响应式
```

**2. API 风格对比：**

```javascript
// Vue2: Options API
export default {
  data() {
    return {
      count: 0,
      name: 'John'
    };
  },
  computed: {
    doubleCount() {
      return this.count * 2;
    }
  },
  methods: {
    increment() {
      this.count++;
    }
  },
  watch: {
    count(newVal, oldVal) {
      console.log(`count changed from ${oldVal} to ${newVal}`);
    }
  },
  mounted() {
    console.log('mounted');
  }
};

// Vue3: Composition API
import { ref, computed, watch, onMounted } from 'vue';

export default {
  setup() {
    const count = ref(0);
    const name = ref('John');
    
    const doubleCount = computed(() => count.value * 2);
    
    const increment = () => {
      count.value++;
    };
    
    watch(count, (newVal, oldVal) => {
      console.log(`count changed from ${oldVal} to ${newVal}`);
    });
    
    onMounted(() => {
      console.log('mounted');
    });
    
    return {
      count,
      name,
      doubleCount,
      increment
    };
  }
};

// 优势对比：
// Vue2 Options API:
// - 简单易懂，适合初学者
// - 代码组织清晰，按功能分类
// - this 指向明确

// Vue3 Composition API:
// - 更好的逻辑复用
// - 更好的 TypeScript 支持
// - 更灵活的代码组织
// - 更小的打包体积
```

**3. 性能对比：**

```javascript
// 性能提升数据（官方数据）

// 1. 初始化渲染速度
// Vue3 快 1.3~2 倍

// 2. 更新速度
// Vue3 快 1.3~2 倍

// 3. 内存占用
// Vue3 减少 41%

// 4. 包体积
// Vue3 减少 41%（13KB → 10KB gzip）

// 5. Tree-shaking
// Vue3 支持更好的 Tree-shaking
// 未使用的 API 不会被打包

// 示例：
// Vue2
import Vue from 'vue';
// 打包所有功能，即使只用了一部分

// Vue3
import { ref, computed } from 'vue';
// 只打包使用的功能
```

**4. TypeScript 支持对比：**

```javascript
// Vue2: TypeScript 支持较弱
// 需要装饰器，类型推断不完善

import { Component, Vue } from 'vue-property-decorator';

@Component
export default class MyComponent extends Vue {
  count: number = 0;
  
  get doubleCount(): number {
    return this.count * 2;
  }
  
  increment(): void {
    this.count++;
  }
}

// Vue3: 原生 TypeScript 支持
import { ref, computed } from 'vue';

interface User {
  name: string;
  age: number;
}

export default {
  setup() {
    const count = ref<number>(0);
    const user = ref<User>({ name: 'John', age: 20 });
    
    const doubleCount = computed<number>(() => count.value * 2);
    
    const increment = (): void => {
      count.value++;
    };
    
    return {
      count,
      user,
      doubleCount,
      increment
    };
  }
};
```

**5. 生命周期对比：**

```javascript
// Vue2
export default {
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  errorCaptured() {}
};

// Vue3
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onErrorCaptured
} from 'vue';

export default {
  setup() {
    // beforeCreate 和 created 被 setup() 替代
    onBeforeMount(() => {});
    onMounted(() => {});
    onBeforeUpdate(() => {});
    onUpdated(() => {});
    onBeforeUnmount(() => {});
    onUnmounted(() => {});
    onErrorCaptured(() => {});
  }
};

// 映射关系
// beforeCreate   -> setup()
// created        -> setup()
// beforeMount    -> onBeforeMount
// mounted        -> onMounted
// beforeUpdate   -> onBeforeUpdate
// updated        -> onUpdated
// beforeDestroy  -> onBeforeUnmount
// destroyed      -> onUnmounted
```

**6. 组件通信对比：**

```javascript
// Vue2
export default {
  props: {
    message: String
  },
  emits: ['update'],
  methods: {
    handleClick() {
      this.$emit('update', 'new message');
    }
  }
};

// Vue3
<script setup>
const props = defineProps({
  message: String
});

const emit = defineEmits(['update']);

const handleClick = () => {
  emit('update', 'new message');
};
</script>

// v-model 对比
// Vue2: 只支持一个 v-model
<ChildComponent v-model="message" />

// Vue3: 支持多个 v-model
<ChildComponent 
  v-model="message"
  v-model:title="title"
  v-model:content="content"
/>
```

**7. 路由和状态管理对比：**

```javascript
// Vue Router
// Vue2
import VueRouter from 'vue-router';
Vue.use(VueRouter);

// Vue3
import { createRouter, createWebHistory } from 'vue-router';
const router = createRouter({
  history: createWebHistory(),
  routes
});

// Vuex
// Vue2
import Vuex from 'vuex';
Vue.use(Vuex);

// Vue3
import { createStore } from 'vuex';
const store = createStore({
  state,
  mutations,
  actions,
  getters
});

// Pinia（Vue3 推荐）
import { createPinia } from 'pinia';
const pinia = createPinia();
```

---

## 性能优化

### 10. Vue3 性能优化有哪些新方法？

**答案：**

**1. 静态提升：**

```javascript
// Vue2: 静态节点每次都重新创建
function render() {
  return h('div', [
    h('p', 'static text'), // 每次都创建
    h('p', this.message)
  ]);
}

// Vue3: 静态节点提升到外部
const _hoisted_1 = h('p', 'static text'); // 只创建一次

function render() {
  return h('div', [
    _hoisted_1, // 复用
    h('p', this.message)
  ]);
}

// 性能提升：减少 VNode 创建
```

**2. 补丁标记：**

```javascript
// Vue3 使用补丁标记，只 diff 有变化的部分
const PatchFlags = {
  TEXT: 1,           // 动态文本
  CLASS: 2,           // 动态 class
  STYLE: 4,           // 动态 style
  PROPS: 8,           // 动态属性
  EVENT: 32,          // 动态事件
  // ...
};

// 示例
function render() {
  return h('div', {
    class: isActive ? 'active' : '', // PatchFlags.CLASS
    onClick: handleClick              // PatchFlags.EVENT
  }, [
    h('p', message)                   // PatchFlags.TEXT
  ]);
}

// 性能提升：减少 diff 范围
```

**3. 块树（Block Tree）：**

```javascript
// Vue3 使用块树，只 diff 动态节点
<div>
  <p>static</p>
  <p>{{ message }}</p>
  <p>static</p>
  <p>{{ count }}</p>
</div>

// Vue2: diff 所有 4 个 p 标签
// Vue3: 只 diff 2 个动态节点

// 性能提升：大幅减少 diff 范围
```

**4. Tree-shaking：**

```javascript
// Vue2
import Vue from 'vue';
// 打包所有功能

// Vue3
import { ref, computed } from 'vue';
// 只打包使用的功能

// 性能提升：减少包体积
```

**5. 懒加载和异步组件：**

```javascript
// 路由懒加载
const routes = [
  {
    path: '/about',
    component: () => import('@/views/About.vue')
  }
];

// 异步组件
const AsyncComponent = defineAsyncComponent({
  loader: () => import('./AsyncComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
});

// Suspense
<Suspense>
  <template #default>
    <AsyncComponent />
  </template>
  <template #fallback>
    <Loading />
  </template>
</Suspense>
```

**6. 虚拟滚动：**

```javascript
// 使用 vue-virtual-scroller
import { RecycleScroller } from 'vue-virtual-scroller';

<RecycleScroller
  :items="items"
  :item-size="50"
  key-field="id"
  v-slot="{ item }"
>
  <div>{{ item.name }}</div>
</RecycleScroller>

// 性能提升：只渲染可见区域的元素
```

**7. computed 缓存：**

```javascript
import { computed } from 'vue';

const expensiveValue = computed(() => {
  // 复杂计算
  return heavyComputation();
});

// 计算属性会缓存结果，依赖不变不会重新计算
```

**8. markRaw 和 shallowReactive：**

```javascript
import { markRaw, shallowReactive } from 'vue';

// markRaw: 标记对象为非响应式
const largeData = markRaw(largeDataSet);
// 避免不必要的代理

// shallowReactive: 浅层响应式
const state = shallowReactive({
  count: 0,
  nested: { value: 1 }
});
// 只代理顶层属性，提高性能
```

---

## 最佳实践

### 11. Vue3 最佳实践

**答案：**

**1. 使用 Composition API 组织代码：**

```javascript
// 按功能组织代码
<script setup>
import { ref, computed } from 'vue';

// 用户相关
const user = ref(null);
const userName = computed(() => user.value?.name);
const loadUser = async () => {
  user.value = await fetchUser();
};

// 搜索相关
const searchQuery = ref('');
const searchResults = ref([]);
const search = async () => {
  searchResults.value = await searchAPI(searchQuery.value);
};

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const totalPages = computed(() => Math.ceil(searchResults.value.length / pageSize.value));

// 初始化
onMounted(() => {
  loadUser();
});
</script>
```

**2. 使用自定义 Hook 复用逻辑：**

```javascript
// usePagination.js
import { ref, computed } from 'vue';

export function usePagination(items, pageSize = 10) {
  const currentPage = ref(1);
  const totalPages = computed(() => Math.ceil(items.value.length / pageSize));
  
  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    const end = start + pageSize;
    return items.value.slice(start, end);
  });
  
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  };
  
  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  };
  
  return {
    currentPage,
    totalPages,
    paginatedItems,
    nextPage,
    prevPage
  };
}

// 使用
<script setup>
import { usePagination } from './usePagination';

const items = ref([...]);
const { currentPage, paginatedItems, nextPage, prevPage } = usePagination(items);
</script>
```

**3. 使用 TypeScript：**

```javascript
<script setup lang="ts">
interface User {
  id: number;
  name: string;
  email: string;
}

interface Props {
  userId: number;
  showEmail?: boolean;
}

interface Emits {
  (e: 'update', user: User): void;
  (e: 'delete', id: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  showEmail: false
});

const emit = defineEmits<Emits>();

const user = ref<User | null>(null);

const loadUser = async (): Promise<void> => {
  user.value = await fetchUser(props.userId);
};

const handleUpdate = (): void => {
  if (user.value) {
    emit('update', user.value);
  }
};
</script>
```

**4. 使用 Pinia 替代 Vuex：**

```javascript
// store/user.ts
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
    token: ''
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    userName: (state) => state.user?.name || ''
  },
  
  actions: {
    async login(credentials: LoginCredentials) {
      const response = await api.login(credentials);
      this.user = response.user;
      this.token = response.token;
    },
    
    logout() {
      this.user = null;
      this.token = '';
    }
  }
});

// 使用
<script setup>
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

const handleLogin = async () => {
  await userStore.login({ username, password });
};
</script>
```

**5. 使用 Teleport 处理弹窗：**

```javascript
<template>
  <Teleport to="body">
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <slot />
        <button @click="closeModal">Close</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  showModal: Boolean
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};
</script>
```

---

## 响应式系统深入原理

### 12. 请深入讲解 Vue3 响应式系统的核心实现原理

**答案：**

**一、响应式系统的核心架构**

Vue3 响应式系统由以下几个核心模块组成：

```javascript
// 响应式系统架构
@vue/reactivity（核心包）
├── reactive()    - 对象响应式
├── ref()         - 基本类型响应式
├── computed()    - 计算属性
├── watch()       - 侦听器
└── effect()      - 副作用函数

依赖收集（Track）
└── 建立数据与 effect 的关联

派发更新（Trigger）
└── 数据变化时触发 effect 重新执行
```

**二、Proxy 代理机制详解**

```javascript
// 1. 基础 reactive 实现
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      // 依赖收集
      track(target, key);
      
      // 使用 Reflect 保证 this 指向正确
      const result = Reflect.get(target, key, receiver);
      
      // 深度响应式：嵌套对象延迟代理
      if (isObject(result)) {
        return reactive(result);
      }
      
      return result;
    },
    
    set(target, key, value, receiver) {
      const oldValue = target[key];
      
      // 使用 Reflect 执行原始操作
      const result = Reflect.set(target, key, value, receiver);
      
      // 值变化时派发更新
      if (oldValue !== value) {
        trigger(target, key);
      }
      
      return result;
    },
    
    deleteProperty(target, key) {
      const hadKey = Object.prototype.hasOwnProperty.call(target, key);
      const result = Reflect.deleteProperty(target, key);
      
      if (hadKey && result) {
        trigger(target, key);
      }
      
      return result;
    },
    
    has(target, key) {
      track(target, key);
      return Reflect.has(target, key);
    },
    
    ownKeys(target) {
      track(target, ITERATE_KEY);
      return Reflect.ownKeys(target);
    }
  });
}

// 2. Reflect 的关键作用
// - 保持默认对象操作行为
// - 解决 this 绑定问题
// - 统一操作接口
const proxy = reactive({ a: 1 });
proxy.a; // 正确
```

**三、依赖收集（Track）机制**

```javascript
// 1. 依赖存储结构：WeakMap + Map + Set
const targetMap = new WeakMap();
// targetMap: WeakMap<target, depsMap>
// depsMap: Map<key, dep>
// dep: Set<ReactiveEffect>

// 2. track 函数实现
function track(target, key) {
  if (!activeEffect) return;
  
  // 获取或创建 depsMap
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  
  // 获取或创建 dep
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  
  // 添加当前 effect
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}

// 3. 依赖收集流程
组件渲染/effect执行
    ↓
读取响应式数据
    ↓
触发 Proxy 的 get
    ↓
执行 track() 收集依赖
    ↓
targetMap → depsMap → dep(Set)
   ↓           ↓         ↓
 target       key      effects
```

**四、派发更新（Trigger）机制**

```javascript
// 1. trigger 函数实现
function trigger(target, key, type, newValue, oldValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  
  const effects = new Set();
  const computedRunners = new Set();
  
  // 收集需要执行的 effect
  const add = (effectsToAdd) => {
    if (effectsToAdd) {
      effectsToAdd.forEach(effect => {
        if (effect !== activeEffect) {
          if (effect.options.computed) {
            computedRunners.add(effect);
          } else {
            effects.add(effect);
          }
        }
      });
    }
  };
  
  // 处理不同类型的操作
  if (type === TriggerOpTypes.CLEAR) {
    // 清空操作，触发所有 effect
    depsMap.forEach(add);
  } else if (key !== void 0) {
    // 普通属性变化
    add(depsMap.get(key));
  }
  
  // 处理数组 length 变化
  if (type === TriggerOpTypes.ADD && Array.isArray(target)) {
    add(depsMap.get('length'));
  }
  
  // 处理迭代操作
  if (type === TriggerOpTypes.ADD || type === TriggerOpTypes.DELETE) {
    add(depsMap.get(ITERATE_KEY));
  }
  
  // 执行 effect，computed 优先
  const run = (effect) => {
    if (effect.options.scheduler) {
      effect.options.scheduler(effect);
    } else {
      effect();
    }
  };
  
  computedRunners.forEach(run);
  effects.forEach(run);
}

// 2. 精确触发示例
const state = reactive({
  user: { name: 'Vue', age: 3 },
  list: [1, 2, 3],
  count: 0
});

// 不同的 effect 监听不同的属性
effect(() => console.log('user name:', state.user.name)); // effect1
effect(() => console.log('list length:', state.list.length)); // effect2
effect(() => console.log('count:', state.count)); // effect3

// 精确触发
state.user.name = 'Vue3'; // 只触发 effect1
state.list.push(4); // 只触发 effect2
state.count++; // 只触发 effect3
```

**五、effect 副作用函数**

```javascript
// 1. effect 函数实现
function effect(fn, options = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);
  
  // 执行 effect，收集依赖
  _effect.run();
  
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

// 2. ReactiveEffect 类
class ReactiveEffect {
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.deps = []; // 记录依赖的 dep
    this.active = true;
    this.parent = undefined;
  }
  
  run() {
    if (!this.active) return this.fn();
    
    try {
      this.parent = activeEffect;
      activeEffect = this;
      
      // 清理旧的依赖
      cleanupEffect(this);
      
      // 执行函数，重新收集依赖
      return this.fn();
    } finally {
      activeEffect = this.parent;
      this.parent = undefined;
    }
  }
  
  stop() {
    if (this.active) {
      cleanupEffect(this);
      this.active = false;
    }
  }
}

// 3. 依赖清理
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

**六、ref 实现原理**

```javascript
// 1. ref 函数实现
function ref(value) {
  return createRef(value, false);
}

function shallowRef(value) {
  return createRef(value, true);
}

function createRef(rawValue, shallow) {
  if (isRef(rawValue)) {
    return rawValue;
  }
  
  return new RefImpl(rawValue, shallow);
}

// 2. RefImpl 类
class RefImpl {
  constructor(value, __v_isShallow) {
    this.__v_isShallow = __v_isShallow;
    this._rawValue = __v_isShallow ? value : toRaw(value);
    this._value = __v_isShallow ? value : convert(value);
    this.__v_isRef = true;
  }
  
  get value() {
    track(this, 'value');
    return this._value;
  }
  
  set value(newValue) {
    newValue = this.__v_isShallow ? newValue : toRaw(newValue);
    
    if (hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue;
      this._value = this.__v_isShallow ? newValue : convert(newValue);
      trigger(this, 'value');
    }
  }
}

// 3. 值转换函数
function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

// 4. ref vs reactive 对比
// ref:
//   - 用于基本类型和对象
//   - 通过 .value 访问
//   - 重新赋值保持响应式
//   - 解构丢失响应式

// reactive:
//   - 仅用于对象
//   - 直接访问
//   - 重新赋值丢失响应式
//   - 解构丢失响应式
```

**七、computed 实现原理**

```javascript
// 1. computed 函数实现
function computed(getterOrOptions) {
  let getter;
  let setter;
  
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
    setter = NOOP;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  
  const cRef = new ComputedRefImpl(getter, setter);
  return cRef;
}

// 2. ComputedRefImpl 类
class ComputedRefImpl {
  constructor(getter, setter) {
    this._setter = setter;
    this._value = undefined;
    this._dirty = true; // 脏标记
    this.dep = undefined;
    this.__v_isRef = true;
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
        trigger(this, 'value');
      }
    });
    this.effect.computed = this;
    this.effect.active = true;
  }
  
  get value() {
    const self = this;
    track(self, 'value');
    
    if (self._dirty) {
      self._dirty = false;
      self._value = self.effect.run();
    }
    
    return self._value;
  }
  
  set value(newValue) {
    this._setter(newValue);
  }
}

// 3. computed 的缓存机制
// - 只有依赖变化时才重新计算
// - 多次访问返回缓存值
// - 使用 _dirty 标记是否需要重新计算

const state = reactive({ count: 0 });
const doubleCount = computed(() => state.count * 2);

console.log(doubleCount.value); // 计算并缓存
console.log(doubleCount.value); // 返回缓存值
state.count++; // 标记为 dirty
console.log(doubleCount.value); // 重新计算
```

**八、watch 实现原理**

```javascript
// 1. watch 函数实现
function watch(source, cb, options = {}) {
  return doWatch(source, cb, options);
}

function doWatch(source, cb, { immediate, deep, flush } = {}) {
  let getter;
  
  if (isRef(source)) {
    getter = () => source.value;
  } else if (isReactive(source)) {
    getter = () => source;
    deep = true;
  } else if (isFunction(source)) {
    getter = source;
  }
  
  let oldValue;
  let cleanup;
  
  const onCleanup = (fn) => {
    cleanup = effect.onStop = () => {
      fn();
    };
  };
  
  const job = () => {
    if (cleanup) {
      cleanup();
    }
    
    const newValue = effect.run();
    
    if (deep || hasChanged(newValue, oldValue)) {
      cleanup = effect.onStop = undefined;
      cb(newValue, oldValue, onCleanup);
      oldValue = newValue;
    }
  };
  
  const effect = new ReactiveEffect(getter, job);
  
  if (cb) {
    if (immediate) {
      job();
    } else {
      oldValue = effect.run();
    }
  } else {
    effect.run();
  }
  
  const unwatch = () => {
    effect.stop();
  };
  
  return unwatch;
}

// 2. watch vs watchEffect
// watch:
//   - 需要明确指定监听源
//   - 可以访问新旧值
//   - 支持配置项（immediate、deep、flush）

// watchEffect:
//   - 自动追踪依赖
//   - 无法访问旧值
//   - 立即执行
```

**九、性能优化策略**

```javascript
// 1. 惰性代理
// 只有在访问嵌套对象时才进行响应式转换
function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver);
    
    if (isObject(res)) {
      // 惰性代理：访问时才转换
      return isReadonly ? readonly(res) : reactive(res);
    }
    
    return res;
  };
}

// 2. 批量更新
// 利用微任务队列合并更新
queueJob(() => {
  // 批量处理更新
});

// 3. 缓存机制
// 对已代理对象直接返回缓存
const reactiveMap = new WeakMap();

function reactive(target) {
  if (reactiveMap.has(target)) {
    return reactiveMap.get(target);
  }
  
  const proxy = new Proxy(target, handler);
  reactiveMap.set(target, proxy);
  return proxy;
}

// 4. 位掩码标记
// 使用二进制标记优化类型判断
const ReactiveFlags = {
  SKIP: 1,           // 跳过代理
  IS_REACTIVE: 2,    // 是 reactive
  IS_READONLY: 4,    // 是 readonly
  IS_SHALLOW: 8,     // 是浅层
  IS_REF: 16,        // 是 ref
  IS_COMPUTED: 32    // 是 computed
};
```

**十、总结**

Vue3 响应式系统的核心优势：

1. **Proxy 优于 defineProperty**：支持新增/删除属性、数组索引
2. **依赖收集机制**：track 收集、trigger 派发
3. **ref vs reactive**：基本类型用 ref，对象用 reactive
4. **性能优化**：惰性代理、批量更新、缓存机制
5. **精确触发**：只触发真正依赖变化属性的 effect
6. **类型安全**：完善的 TypeScript 支持

深入理解响应式原理，能帮助你写出更高效的 Vue 代码，避免常见的响应式陷阱。

---

### 13. Vue3 响应式 API（ref、reactive、toRaw、watch、effect）详解

**答案：**

#### 一、ref

**基本用法：**

ref 用于创建一个响应式的引用对象，常用于包装基本数据类型。

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

**原理实现：**

核心原理：使用 Proxy 包装对象，通过 .value 访问实际值。

```javascript
// 简化的 ref 实现
function ref(value) {
  return createRef(value, false)
}

function createRef(rawValue, shallow) {
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
    const useDirectValue = this.__v_isShallow || isShallow(newVal) || isReadonly(newVal)
    newVal = useDirectValue ? newVal : toRaw(newVal)
    
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal
      this._value = useDirectValue ? newVal : toReactive(newVal)
      // 触发更新
      triggerRefValue(this)
    }
  }
}
```

**使用场景：**

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
```

**注意事项：**

```javascript
// ❌ 错误：直接赋值 ref 对象
const count = ref(0)
const state = { count } // state.count 是 ref 对象，不是值

// ✅ 正确：在模板中自动解包
<template>
  <div>{{ count }}</div>
</template>

// ✅ 正确：在 JS 中使用 .value
console.log(count.value)
```

**为什么 ref 在模板中可以直接使用？**

在 Vue3 的模板编译过程中，编译器会自动识别 ref 对象并进行解包处理。

**原理实现：**

```javascript
// 1. 编译器在编译模板时会识别 ref
// 模板：{{ count }}
// 编译后：_toDisplayString(unref(count))

// 2. unref 函数的实现
function unref(ref) {
  return isRef(ref) ? ref.value : ref
}

// 3. 在渲染函数中自动解包
function render(_ctx, _cache) {
  return _toDisplayString(unref(_ctx.count))
}

// 4. 更详细的编译过程
// 模板：
// <div>{{ count }}</div>
// <button @click="count++">增加</button>

// 编译后的渲染函数（简化版）：
import { unref } from 'vue'

function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createElementBlock("div", null, [
    _createElementVNode("div", null, _toDisplayString(unref(_ctx.count)), 1 /* TEXT */),
    _createElementVNode("button", {
      onClick: ($event) => (_ctx.count.value++)
    }, "增加", 8 /* PROPS */, ["onClick"])
  ]))
}
```

**自动解包的规则：**

```javascript
// 1. 顶层属性自动解包
const count = ref(0)
<template>
  <div>{{ count }}</div>  <!-- 自动解包，等同于 count.value -->
</template>

// 2. 对象属性中的 ref 也会自动解包
const state = reactive({
  count: ref(0)
})
<template>
  <div>{{ state.count }}</div>  <!-- 自动解包 -->
</template>

// 3. 数组中的 ref 不会自动解包
const list = [ref(0), ref(1), ref(2)]
<template>
  <div>{{ list[0] }}</div>  <!-- ❌ 不会自动解包，需要 list[0].value -->
</template>

// 4. 解构后的 ref 不会自动解包
const state = reactive({
  count: ref(0)
})
const { count } = state
<template>
  <div>{{ count }}</div>  <!-- ❌ 不会自动解包，需要 count.value -->
</template>

// 5. 使用 toRefs 解构后可以自动解包
const state = reactive({
  count: ref(0)
})
const { count } = toRefs(state)
<template>
  <div>{{ count }}</div>  <!-- ✅ 可以自动解包 -->
</template>
```

**为什么数组中的 ref 不自动解包？**

```javascript
// Vue3 的设计决策：数组中的 ref 不自动解包
const list = [ref(0), ref(1), ref(2)]

// 原因：
// 1. 性能考虑：数组可能很大，自动解包会增加性能开销
// 2. 一致性：保持 JavaScript 的语义一致性
// 3. 明确性：让开发者明确知道这是一个 ref

// 解决方案：
// 1. 使用 .value
<template>
  <div>{{ list[0].value }}</div>
</template>

// 2. 使用 computed
const listValues = computed(() => list.map(item => item.value))
<template>
  <div>{{ listValues[0] }}</div>
</template>

// 3. 使用 reactive 包装
const state = reactive({
  list: [0, 1, 2]
})
<template>
  <div>{{ state.list[0] }}</div>
</template>
```

**事件处理中的 ref：**

```javascript
// 在事件处理中，ref 不会自动解包
const count = ref(0)

// ❌ 错误：count 不会自动解包
<template>
  <button @click="count++">增加</button>  <!-- 错误 -->
</template>

// ✅ 正确：使用 .value
<template>
  <button @click="count.value++">增加</button>
</template>

// ✅ 正确：使用方法
const increment = () => {
  count.value++
}
<template>
  <button @click="increment">增加</button>
</template>
```

**编译器的解包优化：**

```javascript
// Vue3 编译器会在编译时进行优化
// 1. 静态提升：静态内容会被提取，避免重复创建
// 2. 补丁标记：标记动态内容，只更新变化的部分
// 3. 块树：使用块树结构优化 Diff 算法

// 示例：
<template>
  <div>{{ count }}</div>
  <div>静态内容</div>
</template>

// 编译后的代码（简化）：
const _hoisted_1 = _createElementVNode("div", null, "静态内容", -1 /* HOISTED */)

function render(_ctx, _cache) {
  return (_openBlock(), _createElementBlock("div", null, [
    _createElementVNode("div", null, _toDisplayString(unref(_ctx.count)), 1 /* TEXT */),
    _hoisted_1
  ]))
}
```

**总结：**

ref 在模板中可以直接使用是因为：
1. **编译器自动解包**：编译器在编译模板时会识别 ref 并自动调用 `unref()` 函数
2. **顶层属性解包**：顶层的 ref 属性会自动解包
3. **对象属性解包**：reactive 对象中的 ref 属性也会自动解包
4. **数组不解包**：数组中的 ref 不会自动解包，需要使用 `.value`
5. **事件处理不解包**：在事件处理中 ref 不会自动解包，需要使用 `.value`

这种设计既保持了使用的便利性，又避免了不必要的性能开销。

---

#### 二、reactive

**基本用法：**

reactive 用于创建一个响应式的对象，常用于包装对象和数组。

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

**原理实现：**

核心原理：使用 Proxy 包装对象，拦截所有操作。

```javascript
// 简化的 reactive 实现
function reactive(target) {
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
  if (!isObject(target)) {
    return target
  }
  
  const proxy = new Proxy(
    target,
    isCollectionType(target) ? collectionHandlers : baseHandlers
  )
  
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
  }
}
```

**使用场景：**

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
```

**注意事项：**

```javascript
// ❌ 错误：解构会丢失响应性
const { count } = state // count 不是响应式的

// ✅ 正确：使用 toRefs
const { count, message } = toRefs(state)

// ❌ 错误：直接替换整个对象
state = { count: 1 } // 不会触发更新

// ✅ 正确：使用 Object.assign
Object.assign(state, { count: 1 })
```

---

#### 三、toRaw

**基本用法：**

toRaw 用于获取 reactive 或 ref 的原始对象，可以用于临时读取而不引起依赖跟踪，或写入而不触发更改。

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

**原理实现：**

核心原理：返回原始对象，绕过 Proxy 代理。

```javascript
// 简化的 toRaw 实现
function toRaw(observed) {
  const raw = observed && (observed)[ReactiveFlags.RAW]
  return raw ? toRaw(raw) : observed
}

// 在 createReactiveObject 中标记原始对象
function createReactiveObject(target, isReadonly, baseHandlers, collectionHandlers) {
  const proxy = new Proxy(
    target,
    isCollectionType(target) ? collectionHandlers : baseHandlers
  )
  
  proxy[ReactiveFlags.RAW] = target
  return proxy
}
```

**使用场景：**

```javascript
// 1. 临时读取而不引起依赖跟踪
const state = reactive({ count: 0 })

function logState() {
  const raw = toRaw(state)
  console.log(raw.count) // 不会建立依赖关系
}

// 2. 写入而不触发更改
const state = reactive({ list: [1, 2, 3] })

function addManyItems() {
  const raw = toRaw(state.list)
  // 批量添加，不会触发多次更新
  for (let i = 0; i < 1000; i++) {
    raw.push(i)
  }
  // 手动触发一次更新
  state.list = [...raw]
}

// 3. 性能优化：避免响应式开销
const state = reactive({ heavyData: {} })

function processData() {
  const raw = toRaw(state.heavyData)
  // 处理大量数据，避免响应式开销
  for (let key in raw) {
    // 复杂计算
  }
}
```

---

#### 四、watch

**基本用法：**

watch 用于侦听一个或多个响应式数据源，并在数据变化时执行回调。

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

**原理实现：**

核心原理：创建一个 Watcher 实例，在 getter 中收集依赖，数据变化时触发回调。

```javascript
// 简化的 watch 实现
function watch(source, cb, options = {}) {
  const { immediate, deep, flush = 'pre' } = options
  
  let getter
  if (isRef(source)) {
    getter = () => source.value
  } else if (isReactive(source)) {
    getter = () => source
    deep = true
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
  
  return () => effect.stop()
}
```

**使用场景：**

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

// 3. 清理副作用
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
```

**watch vs watchEffect：**

```javascript
// watchEffect：自动收集依赖，立即执行
const count = ref(0)
watchEffect(() => {
  console.log(`count is: ${count.value}`)
})

// watch：明确指定依赖，可以控制执行时机
const count = ref(0)
watch(count, (newVal, oldVal) => {
  console.log(`count changed: ${oldVal} -> ${newVal}`)
})

// 区别：
// 1. watchEffect 自动收集依赖，watch 需要明确指定
// 2. watchEffect 立即执行，watch 默认不立即执行
// 3. watch 可以获取新旧值，watchEffect 不行
```

---

#### 五、effect

**基本用法：**

effect 是 Vue3 响应式系统的核心，用于创建一个响应式副作用函数。

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
```

**原理实现：**

核心原理：在执行副作用函数时收集依赖，数据变化时重新执行。

```javascript
// 简化的 effect 实现
let activeEffect = null
const effectStack = []

class ReactiveEffect {
  constructor(fn, scheduler = null) {
    this.fn = fn
    this.scheduler = scheduler
    this.deps = []
    this.active = true
    this.parent = null
  }
  
  run() {
    if (!this.active) {
      return this.fn()
    }
    
    try {
      this.parent = activeEffect
      activeEffect = this
      effectStack.push(this)
      
      cleanupEffect(this)
      
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
  
  if (options) {
    extend(_effect, options)
  }
  
  _effect.run()
  
  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  
  return runner
}
```

**使用场景：**

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
    queueJob(() => {
      console.log(`count changed to: ${state.count}`)
    })
  }
})
```

---

#### 六、对比总结

**ref vs reactive：**

| 特性 | ref | reactive |
|------|-----|----------|
| 适用类型 | 基本类型、对象 | 对象、数组 |
| 访问方式 | 需要 .value | 直接访问 |
| 模板使用 | 自动解包 | 直接使用 |
| 解构 | 丢失响应性 | 丢失响应性（需 toRefs） |
| 重新赋值 | 支持 | 不支持 |

**watch vs watchEffect：**

| 特性 | watch | watchEffect |
|------|-------|-------------|
| 依赖收集 | 手动指定 | 自动收集 |
| 执行时机 | 默认不立即执行 | 立即执行 |
| 获取新旧值 | 支持 | 不支持 |

**effect vs watch vs watchEffect：**

| 特性 | effect | watch | watchEffect |
|------|--------|-------|-------------|
| API 层级 | 基础 API | 高级 API | 高级 API |
| 依赖收集 | 自动收集 | 手动指定 | 自动收集 |
| 执行时机 | 立即执行 | 可配置 | 立即执行 |
| 获取新旧值 | 不支持 | 支持 | 不支持 |

**最佳实践：**

```javascript
// ✅ 基本类型使用 ref
const count = ref(0)

// ✅ 复杂对象使用 reactive
const state = reactive({
  user: { name: 'John' }
})

// ✅ 解构 reactive 使用 toRefs
const { count, message } = toRefs(state)

// ✅ 需要获取新旧值使用 watch
watch(count, (newVal, oldVal) => {
  console.log(`count changed: ${oldVal} -> ${newVal}`)
})

// ✅ 自动追踪依赖使用 watchEffect
watchEffect(() => {
  console.log(`${state.message}: ${count.value}`)
})
```

---

## 总结

以上涵盖了 Vue3 面试中最常问的核心问题，包括：

1. **Vue3 核心改进**（响应式、Composition API、性能优化）
2. **Composition API**（setup、ref、reactive、computed、watch、生命周期）
3. **响应式系统**（Proxy、ref vs reactive、toRef、toRefs）
4. **虚拟 DOM 与 Diff 算法**（静态提升、补丁标记、块树）
5. **组件通信**（defineProps、defineEmits、v-model、Teleport）
6. **生命周期**（钩子变化、新的调试钩子）
7. **新特性与 API**（Teleport、Suspense、Fragment、自定义指令）
8. **Vue2 vs Vue3 对比**（响应式、API、性能、TypeScript）
9. **性能优化**（静态提升、补丁标记、Tree-shaking）
10. **最佳实践**（代码组织、自定义 Hook、TypeScript、Pinia）
11. **响应式系统深入原理**（Proxy 代理机制、依赖收集、派发更新、effect、ref、computed、watch）

这些题目覆盖了 Vue3 的核心概念和新特性，特别强调了与 Vue2 的对比，能够全面考察候选人的 Vue3 知识深度和广度。