# Vue2 keep-alive 原理

## 核心概念

keep-alive 是 Vue 的内置组件，用于缓存不活动的组件实例，避免重复渲染，提高性能。

**核心特性：**
1. 缓存组件实例，避免重复创建和销毁
2. 提供 activated 和 deactivated 生命周期钩子
3. 支持 include、exclude、max 配置
4. 使用 LRU（最近最少使用）缓存策略

## 源码核心实现

### 1. keep-alive 组件定义

```javascript
export default {
  name: 'keep-alive',
  abstract: true, // 抽象组件，不渲染自身，只渲染子组件
  
  props: {
    include: patternTypes, // 匹配需要缓存的组件
    exclude: patternTypes, // 匹配不需要缓存的组件
    max: [String, Number]  // 最大缓存数量
  },
  
  created() {
    this.cache = Object.create(null); // 缓存对象
    this.keys = []; // 缓存 key 数组（用于 LRU）
  },
  
  destroyed() {
    // 组件销毁时清空缓存
    for (const key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys);
    }
  },
  
  render() {
    // 获取默认插槽的第一个子节点
    const slot = this.$slots.default;
    const vnode = getFirstComponentChild(slot);
    
    if (!vnode) return null;
    
    const componentOptions = vnode && vnode.componentOptions;
    if (componentOptions) {
      // 获取组件名称
      const name = getComponentName(componentOptions);
      const { include, exclude } = this;
      
      // 判断是否需要缓存
      if (
        (include && (!name || !matches(include, name))) ||
        (exclude && name && matches(exclude, name))
      ) {
        return vnode;
      }
      
      const { cache, keys } = this;
      const key = vnode.key == null
        ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
        : vnode.key;
      
      // 如果已缓存，直接使用缓存的实例
      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance;
        // 移动到末尾（LRU 策略）
        remove(keys, key);
        keys.push(key);
      } else {
        // 缓存新实例
        cache[key] = vnode;
        keys.push(key);
        // 超过 max 时，删除最早的缓存
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode);
        }
      }
      
      // 标记为 keep-alive 组件
      vnode.data.keepAlive = true;
    }
    
    return vnode;
  }
};

// 获取第一个组件子节点
function getFirstComponentChild(children) {
  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      const c = children[i];
      if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
        return c;
      }
    }
  }
}

// 获取组件名称
function getComponentName(opts) {
  return opts && (opts.Ctor.options.name || opts.tag);
}

// 模式匹配
function matches(pattern, name) {
  if (Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1;
  } else if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1;
  } else if (isRegExp(pattern)) {
    return pattern.test(name);
  }
  return false;
}

// 删除缓存条目
function pruneCacheEntry(cache, key, keys, current) {
  const cached = cache[key];
  if (cached && (!current || cached.tag !== current.tag)) {
    cached.componentInstance.$destroy();
  }
  cache[key] = null;
  remove(keys, key);
}

// 从数组中移除元素
function remove(arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1);
    }
  }
}
```

### 2. 生命周期钩子

```javascript
// 在组件实例化过程中处理 keep-alive
export function initLifecycle(vm) {
  const options = vm.$options;
  
  // 找到第一个非抽象的父组件
  let parent = options.parent;
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent;
    }
    parent.$children.push(vm);
  }
  
  vm.$parent = parent;
  vm.$root = parent ? parent.$root : vm;
  
  vm.$children = [];
  vm.$refs = {};
  
  vm._watcher = null;
  vm._inactive = null;
  vm._directInactive = false;
  vm._isMounted = false;
  vm._isDestroyed = false;
  vm._isBeingDestroyed = false;
}

// 激活组件
function activateChildComponent(vm, direct) {
  if (direct) {
    vm._directInactive = false;
    if (isInInactiveTree(vm)) {
      return;
    }
  } else if (vm._directInactive) {
    return;
  }
  
  if (vm._inactive || vm._inactive === null) {
    vm._inactive = false;
    for (let i = 0; i < vm.$children.length; i++) {
      activateChildComponent(vm.$children[i]);
    }
    callHook(vm, 'activated'); // 调用 activated 钩子
  }
}

// 停用组件
function deactivateChildComponent(vm, direct) {
  if (direct) {
    vm._directInactive = true;
    if (isInInactiveTree(vm)) {
      return;
    }
  }
  
  if (!vm._inactive) {
    vm._inactive = true;
    for (let i = 0; i < vm.$children.length; i++) {
      deactivateChildComponent(vm.$children[i]);
    }
    callHook(vm, 'deactivated'); // 调用 deactivated 钩子
  }
}

// 挂载时检查是否是 keep-alive 组件
const mountComponent = (vm, el, hydrating) => {
  vm.$el = el;
  
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode;
  }
  
  callHook(vm, 'beforeMount');
  
  let updateComponent;
  
  if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    updateComponent = () => {
      const name = vm._name;
      const id = vm._uid;
      const startTag = `vue-perf-start:${id}`;
      const endTag = `vue-perf-end:${id}`;
      
      mark(startTag);
      const vnode = vm._render();
      mark(endTag);
      measure(`vue ${name} render`, startTag, endTag);
      
      mark(startTag);
      vm._update(vnode, hydrating);
      mark(endTag);
      measure(`vue ${name} patch`, startTag, endTag);
    };
  } else {
    updateComponent = () => {
      vm._update(vm._render(), hydrating);
    };
  }
  
  new Watcher(vm, updateComponent, noop, null, true);
  
  // 判断是否是 keep-alive 组件
  if (vm.$vnode == null) {
    vm._isMounted = true;
    callHook(vm, 'mounted');
  }
  
  // 如果是 keep-alive 组件，调用 activated
  if (vm.$vnode && vm.$vnode.data.keepAlive) {
    if (vm._inactive) {
      vm._inactive = false;
      activateChildComponent(vm, true);
    }
  }
  
  return vm;
};
```

## 简化版实现

```javascript
// 简化版 keep-alive
class KeepAlive {
  constructor(options = {}) {
    this.include = options.include || null;
    this.exclude = options.exclude || null;
    this.max = options.max || Infinity;
    
    this.cache = new Map(); // 使用 Map 存储缓存
    this.keys = []; // 存储缓存 key，用于 LRU
  }
  
  // 判断是否需要缓存
  shouldCache(name) {
    if (this.include && !this.matchPattern(this.include, name)) {
      return false;
    }
    if (this.exclude && this.matchPattern(this.exclude, name)) {
      return false;
    }
    return true;
  }
  
  // 模式匹配
  matchPattern(pattern, name) {
    if (Array.isArray(pattern)) {
      return pattern.includes(name);
    }
    if (typeof pattern === 'string') {
      return pattern.split(',').includes(name);
    }
    if (pattern instanceof RegExp) {
      return pattern.test(name);
    }
    return false;
  }
  
  // 获取缓存
  get(key) {
    const cached = this.cache.get(key);
    if (cached) {
      // LRU: 移动到末尾
      this.removeKey(key);
      this.keys.push(key);
      return cached;
    }
    return null;
  }
  
  // 设置缓存
  set(key, vnode) {
    // 超过 max 时，删除最早的缓存
    if (this.keys.length >= this.max) {
      const oldestKey = this.keys.shift();
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, vnode);
    this.keys.push(key);
  }
  
  // 删除缓存
  removeKey(key) {
    const index = this.keys.indexOf(key);
    if (index > -1) {
      this.keys.splice(index, 1);
    }
  }
  
  // 清空缓存
  clear() {
    this.cache.clear();
    this.keys = [];
  }
}

// 使用示例
const keepAlive = new KeepAlive({
  include: ['Home', 'About'],
  exclude: ['Login'],
  max: 10
});

// 模拟组件
const componentA = { name: 'Home', instance: {} };
const componentB = { name: 'About', instance: {} };

// 缓存组件
keepAlive.set('home', componentA);
keepAlive.set('about', componentB);

// 获取缓存
const cached = keepAlive.get('home');
console.log(cached); // 输出: { name: 'Home', instance: {} }

// LRU: 再次访问会移动到末尾
keepAlive.get('about');
console.log(keepAlive.keys); // 输出: ['home', 'about']
```

## 使用场景

1. **列表页面缓存**：从详情页返回列表页时保持滚动位置
2. **表单页面缓存**：避免用户输入丢失
3. **多标签页应用**：切换标签页时保持状态
4. **路由切换优化**：减少重复渲染

```javascript
// 场景1: 路由级别缓存
<keep-alive include="Home,About">
  <router-view></router-view>
</keep-alive>

// 场景2: 组件级别缓存
<keep-alive :max="10">
  <component :is="currentComponent"></component>
</keep-alive>

// 场景3: 使用生命周期钩子
export default {
  activated() {
    // 组件被激活时调用
    this.fetchData();
  },
  deactivated() {
    // 组件被停用时调用
    this.cleanup();
  }
}
```

## 面试要点

1. **keep-alive 的工作原理**：
   - 抽象组件，不渲染自身
   - 缓存组件实例，避免重复创建
   - 使用 LRU 策略管理缓存

2. **include 和 exclude 的作用**：
   - include：只缓存匹配的组件
   - exclude：不缓存匹配的组件
   - 支持字符串、数组、正则表达式

3. **max 参数的作用**：
   - 限制最大缓存数量
   - 超过限制时删除最早的缓存
   - 避免内存占用过大

4. **activated 和 deactivated 的调用时机**：
   - activated：组件被激活时（从缓存中恢复）
   - deactivated：组件被停用时（进入缓存）
   - 不同于 mounted 和 beforeDestroy

5. **LRU 缓存策略**：
   - 最近最少使用原则
   - 访问过的缓存移动到末尾
   - 删除最早的缓存

6. **Vue3 的改进**：
   - 使用 WeakMap 代替 Object
   - 更好的内存管理
   - 支持更多的配置选项

5. **注意事项**：
   - keep-alive 只能包含直接子组件
   - 包含的组件必须有唯一的 name
   - 缓存实例需要手动清理