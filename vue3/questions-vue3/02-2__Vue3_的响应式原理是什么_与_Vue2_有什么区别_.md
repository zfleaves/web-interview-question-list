# 2. Vue3 的响应式原理是什么？与 Vue2 有什么区别？

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
