# Vue2 面试题集锦（截止 2025 年底）

## 目录
1. [Vue2 核心原理](#vue2-核心原理)
2. [响应式原理](#响应式原理)
3. [组件通信](#组件通信)
4. [生命周期](#生命周期)
5. [指令与模板](#指令与模板)
6. [路由与状态管理](#路由与状态管理)
7. [性能优化](#性能优化)
8. [常见问题与最佳实践](#常见问题与最佳实践)

---

## Vue2 核心原理

### 1. Vue2 的双向绑定原理是什么？

**答案：**

Vue2 的双向绑定是通过 **数据劫持** 结合 **发布-订阅模式** 实现的。

**核心实现：**

```javascript
// 1. Object.defineProperty 数据劫持
function observe(obj) {
  if (typeof obj !== 'object' || obj === null) return;
  
  Object.keys(obj).forEach(key => {
    let value = obj[key];
    let dep = new Dep(); // 依赖收集器
    
    Object.defineProperty(obj, key, {
      get() {
        // 收集依赖
        if (Dep.target) {
          dep.addSub(Dep.target);
        }
        return value;
      },
      set(newValue) {
        if (newValue !== value) {
          value = newValue;
          // 通知更新
          dep.notify();
        }
      }
    });
    
    // 递归劫持嵌套对象
    if (typeof value === 'object') {
      observe(value);
    }
  });
}

// 2. 依赖收集器
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

// 3. Watcher 观察者
class Watcher {
  constructor(vm, key, callback) {
    this.vm = vm;
    this.key = key;
    this.callback = callback;
    this.value = this.get();
  }
  
  get() {
    Dep.target = this;
    const value = this.vm[this.key];
    Dep.target = null;
    return value;
  }
  
  update() {
    const newValue = this.vm[this.key];
    if (newValue !== this.value) {
      this.value = newValue;
      this.callback.call(this.vm, newValue);
    }
  }
}
```

**v-model 实现原理：**

```javascript
// v-model = v-bind:value + v-on:input
<input v-model="message" />

// 编译后
<input
  :value="message"
  @input="message = $event.target.value"
/>

// 自定义组件的 v-model
Vue.component('my-input', {
  props: ['value'],
  template: `
    <input
      :value="value"
      @input="$emit('input', $event.target.value)"
    />
  `
});
```

**双向绑定流程：**

```
1. 数据变化 -> setter -> notify() -> Watcher.update() -> 视图更新
2. 视图变化 -> input事件 -> 数据更新 -> setter -> notify() -> Watcher.update()
```

**Dep.target 的作用和底层逻辑：**

**Dep.target 是什么？**

Dep.target 是一个全局静态变量，用于在依赖收集过程中**标识当前正在执行的 Watcher**。它是 Vue2 响应式系统中连接数据属性和观察者（Watcher）的关键桥梁。

**为什么需要 Dep.target？**

在 Vue2 的响应式系统中，当访问一个响应式对象的属性时，需要知道**是谁在访问这个属性**（即哪个 Watcher），这样才能将这个 Watcher 添加到该属性的依赖列表中。Dep.target 就是为了解决"如何知道当前是哪个 Watcher 在访问数据"这个问题而设计的。

**底层逻辑详解：**

```javascript
// Dep 类 - 依赖收集器
class Dep {
  constructor() {
    this.subs = []; // 存储所有订阅者（Watcher）
  }
  
  addSub(sub) {
    this.subs.push(sub);
  }
  
  depend() {
    // 如果当前有正在执行的 Watcher（Dep.target 不为空）
    // 就说明这个 Watcher 依赖了当前属性
    // 将当前 Watcher 添加到依赖列表中
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }
  
  notify() {
    // 数据变化时，通知所有订阅者更新
    this.subs.forEach(sub => sub.update());
  }
}

// Dep.target 是一个全局静态变量
Dep.target = null;

// Watcher 类 - 观察者
class Watcher {
  constructor(vm, getter, callback) {
    this.vm = vm;
    this.getter = getter;
    this.callback = callback;
    this.deps = []; // 当前 Watcher 依赖了哪些 Dep
    this.value = this.get(); // 立即执行一次，收集依赖
  }
  
  get() {
    // 关键步骤 1: 将当前 Watcher 赋值给 Dep.target
    // 这样在后续访问数据属性时，getter 就能知道是谁在访问
    pushTarget(this); // Dep.target = this
    
    let value;
    try {
      // 关键步骤 2: 执行 getter 函数
      // 在这个过程中，会访问响应式对象的属性
      // 访问属性时会触发 getter，getter 中会检查 Dep.target
      value = this.getter.call(this.vm, this.vm);
    } finally {
      // 关键步骤 3: getter 执行完成后，清空 Dep.target
      // 避免影响其他 Watcher 的依赖收集
      popTarget(); // Dep.target = null
    }
    return value;
  }
  
  addDep(dep) {
    // 建立 Watcher 和 Dep 的双向关系
    // Watcher 记录自己依赖了哪些 Dep
    if (!this.deps.includes(dep)) {
      this.deps.push(dep);
      // Dep 记录自己有哪些 Watcher 订阅者
      dep.addSub(this);
    }
  }
  
  update() {
    // 数据变化时重新执行
    const newValue = this.get();
    if (newValue !== this.value) {
      const oldValue = this.value;
      this.value = newValue;
      this.callback.call(this.vm, newValue, oldValue);
    }
  }
}

// 目标栈管理 - 支持嵌套 Watcher
const targetStack = [];

function pushTarget(target) {
  targetStack.push(target);
  Dep.target = target;
}

function popTarget() {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1];
}
```

**依赖收集的完整流程：**

```
1. 创建 Watcher 实例
   ↓
2. Watcher.get() 被调用
   ↓
3. pushTarget(this) - 将当前 Watcher 设置为 Dep.target
   ↓
4. 执行 getter 函数（如渲染函数）
   ↓
5. getter 中访问响应式数据（如 vm.message）
   ↓
6. 触发 message 的 getter
   ↓
7. getter 中检查 Dep.target
   - 如果 Dep.target 存在，说明有 Watcher 正在访问
   - 调用 dep.depend() 或 dep.addSub(Dep.target)
   ↓
8. 将当前 Watcher 添加到 message 的依赖列表
   ↓
9. getter 执行完成
   ↓
10. popTarget() - 清空 Dep.target
```

**为什么要使用栈结构？**

```javascript
// 场景：嵌套的 Watcher
// 例如：computed 中访问另一个 computed
const vm = new Vue({
  data: {
    count: 0
  },
  computed: {
    doubleCount() {
      // 当前 Dep.target = Watcher(doubleCount)
      return this.count * 2;
    },
    quadrupleCount() {
      // 当前 Dep.target = Watcher(quadrupleCount)
      // 但在计算过程中访问了 doubleCount
      // doubleCount 的 Watcher 会被临时设置为 Dep.target
      return this.doubleCount * 2;
    }
  }
});

// 执行流程：
// 1. 渲染 Watcher 执行，Dep.target = 渲染 Watcher
// 2. 访问 quadrupleCount，Dep.target = Watcher(quadrupleCount)，栈 = [渲染 Watcher, Watcher(quadrupleCount)]
// 3. 访问 doubleCount，Dep.target = Watcher(doubleCount)，栈 = [渲染 Watcher, Watcher(quadrupleCount), Watcher(doubleCount)]
// 4. doubleCount 执行完成，popTarget，Dep.target = Watcher(quadrupleCount)
// 5. quadrupleCount 执行完成，popTarget，Dep.target = 渲染 Watcher
```

**实际应用示例：**

```javascript
// 组件渲染 Watcher
new Vue({
  el: '#app',
  data: {
    message: 'Hello',
    count: 0
  },
  computed: {
    reversedMessage() {
      // 当这个 computed 被访问时：
      // 1. Dep.target 设置为 Watcher(reversedMessage)
      // 2. 访问 this.message，触发 message 的 getter
      // 3. message 的 getter 发现 Dep.target 存在
      // 4. 将 Watcher(reversedMessage) 添加到 message 的依赖列表
      return this.message.split('').reverse().join('');
    }
  },
  template: `
    <div>
      <p>{{ message }}</p>  <!-- 渲染 Watcher 依赖 message -->
      <p>{{ reversedMessage }}</p>  <!-- 渲染 Watcher 依赖 reversedMessage -->
      <p>{{ count }}</p>  <!-- 渲染 Watcher 依赖 count -->
    </div>
  `
});

// 依赖关系图：
// message -> Dep.subs = [渲染 Watcher, Watcher(reversedMessage)]
// count -> Dep.subs = [渲染 Watcher]

// 当 message 变化时：
// 1. 触发 message 的 setter
// 2. dep.notify() 通知所有订阅者
// 3. 渲染 Watcher.update() - 重新渲染视图
// 4. Watcher(reversedMessage).update() - 重新计算 reversedMessage
```

**总结：**

Dep.target 的核心作用是：
1. **身份标识**：在依赖收集过程中标识当前正在执行的 Watcher
2. **桥梁作用**：连接数据属性的 getter 和 Watcher 的依赖收集
3. **生命周期管理**：通过 pushTarget/popTarget 管理 Watcher 的执行上下文
4. **支持嵌套**：使用栈结构支持嵌套的 Watcher 场景

没有 Dep.target，Vue2 就无法知道是哪个 Watcher 在访问数据，就无法建立数据与视图之间的依赖关系，响应式系统也就无法工作。

---

### 2. Vue2 的虚拟 DOM 和 Diff 算法原理是什么？

**答案：**

## 一、什么是 Real DOM 和 Virtual DOM？

**Real DOM（真实 DOM）：**

Real DOM，真实 DOM，意思为文档对象模型，是一个结构化文本的抽象，在页面渲染出的每一个结点都是一个真实 DOM 结构。

**Virtual DOM（虚拟 DOM）：**

Virtual DOM，本质上是以 JavaScript 对象形式存在的对 DOM 的描述。创建虚拟 DOM 目的就是为了更好将虚拟的节点渲染到页面视图中，虚拟 DOM 对象的节点与真实 DOM 的属性一一照应。

**虚拟 DOM（Virtual DOM）：**

```javascript
// 虚拟 DOM 结构
{
  tag: 'div',
  props: {
    id: 'app',
    class: 'container'
  },
  children: [
    {
      tag: 'p',
      props: {},
      children: ['Hello Vue']
    }
  ]
}
```

## 二、Real DOM 和 Virtual DOM 的区别

两者的区别如下：

- **虚拟 DOM 不会进行排版与重绘操作**，而真实 DOM 会频繁重排与重绘
- **虚拟 DOM 的总损耗**是"虚拟 DOM 增删改+真实 DOM 差异增删改+排版与重绘"，**真实 DOM 的总损耗**是"真实 DOM 完全增删改+排版与重绘"

**举例说明：**

传统的原生 api 或 jQuery 去操作 DOM 时，浏览器会从构建 DOM 树开始从头到尾执行一遍流程。

当你在一次操作时，需要更新 10 个 DOM 节点，浏览器没这么智能，收到第一个更新 DOM 请求后，并不知道后续还有 9 次更新操作，因此会马上执行流程，最终执行 10 次流程。

而通过 VNode，同样更新 10 个 DOM 节点，虚拟 DOM 不会立即操作 DOM，而是将这 10 次更新的 diff 内容保存到本地的一个 js 对象中，最终将这个 js 对象一次性 attach 到 DOM 树上，避免大量的无谓计算。

## 三、优缺点对比

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

## 四、Vue2 的虚拟 DOM 实现

**创建虚拟 DOM：**

```javascript
function h(tag, props, children) {
  return { tag, props, children };
}

// 使用
const vnode = h('div', { id: 'app' }, [
  h('p', {}, ['Hello'])
]);
```

**Diff 算法核心策略：**

```javascript
function patch(oldVnode, newVnode) {
  // 1. 同层比较
  if (!isSameNode(oldVnode, newVnode)) {
    // 节点类型不同，直接替换
    replaceNode(oldVnode, newVnode);
    return;
  }
  
  // 2. 更新属性
  updateProps(oldVnode, newVnode);
  
  // 3. 更新子节点
  updateChildren(oldVnode.children, newVnode.children);
}

function updateChildren(oldCh, newCh) {
  // 双端比较算法
  let oldStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let newStartIdx = 0;
  let newEndIdx = newCh.length - 1;
  
  let oldStartVnode = oldCh[oldStartIdx];
  let oldEndVnode = oldCh[oldEndIdx];
  let newStartVnode = newCh[newStartIdx];
  let newEndVnode = newCh[newEndIdx];
  
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    // 情况1：旧头 == 新头
    if (sameVnode(oldStartVnode, newStartVnode)) {
      patch(oldStartVnode, newStartVnode);
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    }
    // 情况2：旧尾 == 新尾
    else if (sameVnode(oldEndVnode, newEndVnode)) {
      patch(oldEndVnode, newEndVnode);
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    }
    // 情况3：旧头 == 新尾
    else if (sameVnode(oldStartVnode, newEndVnode)) {
      patch(oldStartVnode, newEndVnode);
      insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    }
    // 情况4：旧尾 == 新头
    else if (sameVnode(oldEndVnode, newStartVnode)) {
      patch(oldEndVnode, newStartVnode);
      insertBefore(oldEndVnode.el, oldStartVnode.el);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    }
    // 情况5：都不匹配，查找 key
    else {
      const keyMap = createKeyMap(oldCh, oldStartIdx, oldEndIdx);
      const idx = keyMap[newStartVnode.key];
      
      if (idx === undefined) {
        // 新节点，创建
        createEl(newStartVnode);
        insertBefore(newStartVnode.el, oldStartVnode.el);
      } else {
        const vnodeToMove = oldCh[idx];
        patch(vnodeToMove, newStartVnode);
        oldCh[idx] = undefined;
        insertBefore(vnodeToMove.el, oldStartVnode.el);
      }
      
      newStartVnode = newCh[++newStartIdx];
    }
  }
  
  // 处理剩余节点
  if (oldStartIdx > oldEndIdx) {
    // 添加新节点
    addVnodes(oldCh, newCh, newStartIdx, newEndIdx);
  } else if (newStartIdx > newEndIdx) {
    // 删除旧节点
    removeVnodes(oldCh, oldStartIdx, oldEndIdx);
  }
}
```

**key 的作用：**

```javascript
// ❌ 使用 index 作为 key
<li v-for="(item, index) in list" :key="index">
  {{ item.name }}
</li>
// 问题：列表插入、删除、排序时会导致状态错乱

// ✅ 使用唯一 ID
<li v-for="item in list" :key="item.id">
  {{ item.name }}
</li>
// 优势：通过 key 识别节点，提高 Diff 效率，保持组件状态
```

---

### 3. Vue2 的模板编译原理是什么？

**答案：**

模板编译过程：**模板 -> AST -> 渲染函数**

```javascript
// 1. 解析模板为 AST
const ast = parse(template);

// 2. 优化 AST（标记静态节点）
optimize(ast);

// 3. 生成渲染函数
const render = generate(ast);
```

**解析阶段（Parse）：**

```javascript
function parse(template) {
  const ast = {
    type: 1, // 元素节点
    tag: 'div',
    attrsList: [],
    children: []
  };
  
  // 使用正则表达式解析
  const tagReg = /^<([a-z][a-z0-9]*)/i;
  const attrReg = /\s+([a-z-]+)=(["'])(.*?)\2/i;
  
  // 解析标签
  let match = template.match(tagReg);
  if (match) {
    ast.tag = match[1];
  }
  
  // 解析属性
  while ((match = attrReg.exec(template)) !== null) {
    ast.attrsList.push({
      name: match[1],
      value: match[3]
    });
  }
  
  return ast;
}
```

**优化阶段（Optimize）：**

```javascript
function optimize(ast) {
  markStatic(ast);
}

function markStatic(node) {
  node.static = isStatic(node);
  
  if (node.children) {
    node.children.forEach(child => {
      markStatic(child);
      if (!child.static) {
        node.static = false;
      }
    });
  }
}

function isStatic(node) {
  // 静态节点：没有动态绑定、没有 v-if/v-for、没有 slot
  return !node.hasBindings && 
         !node.if && 
         !node.for && 
         !node.slotTarget;
}
```

**代码生成阶段（Generate）：**

```javascript
function generate(ast) {
  const code = ast.children.map(child => {
    if (child.type === 1) {
      return `_c('${child.tag}', ${genProps(child.attrs)}, ${genChildren(child)})`;
    } else if (child.type === 3) {
      return `_v(${JSON.stringify(child.text)})`;
    }
  }).join(',');
  
  return `with(this){return ${code}}`;
}

// 生成结果
// with(this){return _c('div',{attrs:{"id":"app"}},[_v("Hello")])}
```

**渲染函数执行：**

```javascript
// 解码后的渲染函数
function render() {
  with(this) {
    return _c('div', { attrs: { id: 'app' } }, [
      _v('Hello')
    ]);
  }
}

// _c = createElement
// _v = createTextVNode
```

---

### 4. Vue2 的依赖收集机制是什么？

**答案：**

依赖收集是 Vue2 响应式的核心，通过 **Dep** 和 **Watcher** 实现。

**依赖收集流程：**

```javascript
// 1. 初始化时，触发 getter
const vm = new Vue({
  data: {
    message: 'Hello'
  },
  template: '<div>{{ message }}</div>'
});

// 2. 渲染时，访问 message
// message 的 getter 被触发
// Dep.target 指向当前 Watcher
// 将 Watcher 添加到 message 的 dep.subs 中

// 3. 数据变化时
vm.message = 'World';
// message 的 setter 被触发
// 遍历 dep.subs，调用每个 Watcher 的 update 方法
// Watcher 重新执行渲染函数
```

**Dep 类：**

```javascript
class Dep {
  constructor() {
    this.id = uid++;
    this.subs = [];
  }
  
  addSub(sub) {
    this.subs.push(sub);
  }
  
  removeSub(sub) {
    const index = this.subs.indexOf(sub);
    if (index > -1) {
      this.subs.splice(index, 1);
    }
  }
  
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }
  
  notify() {
    const subs = this.subs.slice();
    subs.forEach(sub => sub.update());
  }
}

Dep.target = null;
```

**Watcher 类：**

```javascript
class Watcher {
  constructor(vm, expOrFn, cb, options) {
    this.vm = vm;
    this.cb = cb;
    this.deps = [];
    this.newDeps = [];
    this.depIds = new Set();
    this.newDepIds = new Set();
    
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else {
      this.getter = parsePath(expOrFn);
    }
    
    this.value = this.get();
  }
  
  get() {
    pushTarget(this);
    let value;
    try {
      value = this.getter.call(this.vm, this.vm);
    } catch (e) {
      if (this.user) {
        handleError(e, this.vm, `getter for watcher "${this.expression}"`);
      } else {
        throw e;
      }
    } finally {
      popTarget();
      this.cleanupDeps();
    }
    return value;
  }
  
  addDep(dep) {
    const id = dep.id;
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      if (!this.depIds.has(id)) {
        dep.addSub(this);
      }
    }
  }
  
  cleanupDeps() {
    let i = this.deps.length;
    while (i--) {
      const dep = this.deps[i];
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this);
      }
    }
    let tmp = this.depIds;
    this.depIds = this.newDepIds;
    this.newDepIds = tmp;
    this.newDepIds.clear();
    tmp = this.deps;
    this.deps = this.newDeps;
    this.newDeps = tmp;
    this.newDeps.length = 0;
  }
  
  update() {
    if (this.lazy) {
      this.dirty = true;
    } else if (this.sync) {
      this.run();
    } else {
      queueWatcher(this);
    }
  }
  
  run() {
    if (this.active) {
      const value = this.get();
      if (value !== this.value || isObject(value) || this.deep) {
        const oldValue = this.value;
        this.value = value;
        if (this.user) {
          try {
            this.cb.call(this.vm, value, oldValue);
          } catch (e) {
            handleError(e, this.vm, `callback for watcher "${this.expression}"`);
          }
        } else {
          this.cb.call(this.vm, value, oldValue);
        }
      }
    }
  }
}
```

**依赖收集图示：**

```
data: {
  message: 'Hello',
  count: 0
}

message -> Dep {
  subs: [Watcher(render), Watcher(computed)]
}

count -> Dep {
  subs: [Watcher(render)]
}
```

---

## 响应式原理

### 5. Vue2 的响应式系统有哪些限制？

**答案：**

**1. 无法检测对象属性的添加或删除：**

```javascript
const vm = new Vue({
  data: {
    user: {
      name: 'John'
    }
  }
});

// ❌ 无法检测
vm.user.age = 20; // 不是响应式的
delete vm.user.name; // 不是响应式的

// ✅ 解决方案
// Vue.set
Vue.set(vm.user, 'age', 20);

// this.$set
this.$set(this.user, 'age', 20);

// 重新赋值
vm.user = { ...vm.user, age: 20 };
```

**2. 无法检测数组索引和长度的变化：**

```javascript
const vm = new Vue({
  data: {
    items: [1, 2, 3]
  }
});

// ❌ 无法检测
vm.items[0] = 10; // 不是响应式的
vm.items.length = 0; // 不是响应式的

// ✅ 解决方案
// Vue.set
Vue.set(vm.items, 0, 10);

// this.$set
this.$set(this.items, 0, 10);

// 数组方法（Vue 重写了这些方法）
vm.items.push(4);
vm.items.pop();
vm.items.shift();
vm.items.unshift(0);
vm.items.splice(0, 1, 10);
vm.items.sort();
vm.items.reverse();
```

**3. 原因分析：**

```javascript
// Object.defineProperty 的限制
Object.defineProperty(obj, 'key', {
  get() {},
  set() {}
});

// 只能劫持已存在的属性
// 无法劫持数组索引
// 无法劫持对象属性的动态添加

// Vue2 的解决方案
// 1. 对象：递归劫持所有属性
// 2. 数组：重写数组方法
```

**数组方法重写：**

```javascript
const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
];

methodsToPatch.forEach(method => {
  const original = arrayProto[method];
  def(arrayMethods, method, function mutator(...args) {
    const result = original.apply(this, args);
    const ob = this.__ob__;
    let inserted;
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2);
        break;
    }
    if (inserted) ob.observeArray(inserted);
    ob.dep.notify();
    return result;
  });
});
```

---

### 6. Vue2 的 computed 和 watch 的区别是什么？

**答案：**

**computed（计算属性）：**

```javascript
new Vue({
  data: {
    firstName: 'John',
    lastName: 'Doe'
  },
  computed: {
    // 1. 默认只有 getter
    fullName() {
      return this.firstName + ' ' + this.lastName;
    },
    
    // 2. 可以设置 setter
    fullNameWithSetter: {
      get() {
        return this.firstName + ' ' + this.lastName;
      },
      set(newValue) {
        const names = newValue.split(' ');
        this.firstName = names[0];
        this.lastName = names[1];
      }
    }
  }
});
```

**watch（侦听器）：**

```javascript
new Vue({
  data: {
    question: '',
    answer: 'Questions usually contain a question mark.'
  },
  watch: {
    // 1. 简单侦听
    question(newVal, oldVal) {
      if (newVal.indexOf('?') > -1) {
        this.getAnswer();
      }
    },
    
    // 2. 深度侦听
    user: {
      handler(newVal, oldVal) {
        console.log('user changed');
      },
      deep: true, // 深度侦听对象内部变化
      immediate: true // 立即执行一次
    },
    
    // 3. 侦听对象属性
    'user.name': function(newVal, oldVal) {
      console.log('name changed');
    }
  },
  methods: {
    getAnswer() {
      // ...
    }
  }
});
```

**区别对比：**

| 特性 | computed | watch |
|------|----------|-------|
| 用途 | 计算衍生数据 | 执行异步或开销较大的操作 |
| 缓存 | 有缓存，依赖不变不重新计算 | 无缓存，每次都执行 |
| 返回值 | 必须返回值 | 不需要返回值 |
| 异步 | 不支持异步操作 | 支持异步操作 |
| setter | 可以设置 setter | 不能设置 setter |

**使用场景：**

```javascript
// ✅ computed 适合的场景
computed: {
  // 1. 计算衍生数据
  fullName() {
    return this.firstName + ' ' + this.lastName;
  },
  
  // 2. 过滤列表
  filteredList() {
    return this.list.filter(item => item.active);
  },
  
  // 3. 格式化数据
  formattedDate() {
    return new Date(this.date).toLocaleDateString();
  }
}

// ✅ watch 适合的场景
watch: {
  // 1. 执行异步操作
  keyword(newVal) {
    this.debouncedSearch(newVal);
  },
  
  // 2. 数据变化时执行复杂逻辑
  user: {
    handler(newVal) {
      this.saveUserToLocalStorage(newVal);
    },
    deep: true
  },
  
  // 3. 路由变化时重新加载数据
  '$route'(to, from) {
    this.loadData(to.params.id);
  }
}
```

**computed 实现原理：**

```javascript
class ComputedWatcher extends Watcher {
  constructor(vm, getter, options) {
    super(vm, getter, null, options);
    this.dirty = true; // 标记是否需要重新计算
  }
  
  get() {
    if (this.dirty) {
      this.value = super.get();
      this.dirty = false;
    }
    return this.value;
  }
  
  update() {
    this.dirty = true;
    // 不立即执行，等待被访问时才计算
  }
}
```

---

## 组件通信

### 7. Vue2 组件通信有哪些方式？

**答案：**

**1. Props / $emit（父子通信）：**

```javascript
// 父组件
<template>
  <child-component
    :message="parentMessage"
    @update="handleUpdate"
  />
</template>

<script>
export default {
  data() {
    return {
      parentMessage: 'Hello from parent'
    };
  },
  methods: {
    handleUpdate(newMessage) {
      this.parentMessage = newMessage;
    }
  }
};
</script>

// 子组件
<template>
  <div>
    <p>{{ message }}</p>
    <button @click="sendMessage">Send to Parent</button>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      required: true
    }
  },
  methods: {
    sendMessage() {
      this.$emit('update', 'Hello from child');
    }
  }
};
</script>
```

**2. $refs（父访问子）：**

```javascript
// 父组件
<template>
  <child-component ref="child" />
  <button @click="callChildMethod">Call Child Method</button>
</template>

<script>
export default {
  methods: {
    callChildMethod() {
      this.$refs.child.childMethod();
    }
  }
};
</script>

// 子组件
<script>
export default {
  methods: {
    childMethod() {
      console.log('Child method called');
    }
  }
};
</script>
```

**3. $parent / $children（子访问父）：**

```javascript
// 子组件访问父组件
this.$parent.parentMethod();

// 父组件访问所有子组件
this.$children.forEach(child => {
  child.childMethod();
});
```

**4. Provide / Inject（跨层级通信）：**

```javascript
// 祖先组件
export default {
  provide() {
    return {
      theme: this.theme,
      updateTheme: this.updateTheme
    };
  },
  data() {
    return {
      theme: 'light'
    };
  },
  methods: {
    updateTheme(newTheme) {
      this.theme = newTheme;
    }
  }
};

// 后代组件
export default {
  inject: ['theme', 'updateTheme'],
  methods: {
    changeTheme() {
      this.updateTheme('dark');
    }
  }
};
```

**5. Event Bus（兄弟组件通信）：**

```javascript
// event-bus.js
import Vue from 'vue';
export const EventBus = new Vue();

// 组件 A
import { EventBus } from './event-bus';

export default {
  methods: {
    sendMessage() {
      EventBus.$emit('message', 'Hello from A');
    }
  }
};

// 组件 B
import { EventBus } from './event-bus';

export default {
  created() {
    EventBus.$on('message', (message) => {
      console.log('Received:', message);
    });
  },
  beforeDestroy() {
    EventBus.$off('message');
  }
};
```

**6. Vuex（状态管理）：**

```javascript
// store.js
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment(state) {
      state.count++;
    }
  },
  actions: {
    asyncIncrement({ commit }) {
      setTimeout(() => {
        commit('increment');
      }, 1000);
    }
  },
  getters: {
    doubleCount: state => state.count * 2
  }
});

// 组件中使用
export default {
  computed: {
    count() {
      return this.$store.state.count;
    },
    doubleCount() {
      return this.$store.getters.doubleCount;
    }
  },
  methods: {
    increment() {
      this.$store.commit('increment');
    },
    asyncIncrement() {
      this.$store.dispatch('asyncIncrement');
    }
  }
};
```

**7. $attrs / $listeners（透传属性和事件）：**

```javascript
// 父组件
<base-input
  v-model="value"
  placeholder="Enter text"
  @focus="handleFocus"
/>

// BaseInput 组件
<template>
  <input
    v-bind="$attrs"
    v-on="$listeners"
    v-model="inputValue"
  />
</template>

<script>
export default {
  inheritAttrs: false, // 不继承 attributes 到根元素
  props: ['value'],
  computed: {
    inputValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      }
    }
  }
};
</script>
```

**8. Slot（插槽通信）：**

```javascript
// 父组件
<child-component>
  <template v-slot:header>
    <h1>Header Content</h1>
  </template>
  <template v-slot:default="{ user }">
    <p>{{ user.name }}</p>
  </template>
  <template #footer>
    <p>Footer Content</p>
  </template>
</child-component>

// 子组件
<template>
  <div>
    <slot name="header"></slot>
    <slot :user="currentUser"></slot>
    <slot name="footer"></slot>
  </div>
</template>
```

---

## 生命周期

### 8. Vue2 的生命周期有哪些？各个阶段的作用是什么？

**答案：**

**生命周期钩子：**

```javascript
export default {
  // 1. 创建阶段
  beforeCreate() {
    // 实例初始化之后，数据观测和事件配置之前
    // 此时无法访问 data、methods、computed
    console.log('beforeCreate');
  },
  
  created() {
    // 实例创建完成，数据观测、属性和方法运算已完成
    // 可以访问 data、methods、computed
    // DOM 还未挂载
    console.log('created');
    // 常用于：初始化数据、发起异步请求
  },
  
  // 2. 挂载阶段
  beforeMount() {
    // 挂载开始之前，render 函数首次被调用
    // 虚拟 DOM 已创建，但还未挂载到真实 DOM
    console.log('beforeMount');
  },
  
  mounted() {
    // 实例已挂载到 DOM
    // 可以访问 DOM 元素
    // 常用于：操作 DOM、使用第三方库
    console.log('mounted');
    this.$refs.myElement.focus();
  },
  
  // 3. 更新阶段
  beforeUpdate() {
    // 数据变化，DOM 更新之前
    // 可以在此访问更新前的 DOM
    console.log('beforeUpdate');
  },
  
  updated() {
    // DOM 已更新
    // 可以访问更新后的 DOM
    // 注意：避免在此修改状态，可能导致无限循环
    console.log('updated');
  },
  
  // 4. 销毁阶段
  beforeDestroy() {
    // 实例销毁之前
    // 实例仍然完全可用
    // 常用于：清理定时器、解绑事件、取消订阅
    console.log('beforeDestroy');
    clearInterval(this.timer);
  },
  
  destroyed() {
    // 实例已销毁
    // 所有指令解绑，所有事件监听器移除
    console.log('destroyed');
  },
  
  // 5. 错误捕获
  errorCaptured(err, vm, info) {
    // 捕获子孙组件的错误
    console.error('Error captured:', err);
    // 返回 false 可以阻止错误继续向上传播
    return false;
  }
};
```

**生命周期图示：**

```
beforeCreate
    ↓
created
    ↓
beforeMount
    ↓
mounted
    ↓
beforeUpdate ←→ updated
    ↓
beforeDestroy
    ↓
destroyed
```

**父子组件生命周期执行顺序：**

```javascript
// 加载过程
Parent beforeCreate
Parent created
Parent beforeMount
  Child beforeCreate
  Child created
  Child beforeMount
  Child mounted
Parent mounted

// 更新过程
Parent beforeUpdate
  Child beforeUpdate
  Child updated
Parent updated

// 销毁过程
Parent beforeDestroy
  Child beforeDestroy
  Child destroyed
Parent destroyed
```

**使用场景：**

```javascript
export default {
  created() {
    // ✅ 初始化数据
    this.initData();
    
    // ✅ 发起异步请求
    this.fetchData();
    
    // ✅ 订阅事件
    this.eventBus.$on('event', this.handleEvent);
  },
  
  mounted() {
    // ✅ 操作 DOM
    this.$refs.chart.initChart();
    
    // ✅ 使用第三方库
    this.$refs.editor = new Editor(this.$refs.editor);
  },
  
  beforeDestroy() {
    // ✅ 清理定时器
    clearInterval(this.timer);
    
    // ✅ 解绑事件
    this.eventBus.$off('event', this.handleEvent);
    
    // ✅ 取消订阅
    this.subscription.unsubscribe();
    
    // ✅ 销毁第三方实例
    this.$refs.chart.destroy();
  }
};
```

---

## 指令与模板

### 9. Vue2 的常用指令有哪些？

**答案：**

**1. v-bind（属性绑定）：**

```javascript
// 简写 :
<div v-bind:id="dynamicId"></div>
<div :id="dynamicId"></div>

// 对象语法
<div :class="{ active: isActive, disabled: isDisabled }"></div>
<div :style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>

// 数组语法
<div :class="[activeClass, errorClass]"></div>
<div :style="[styleObject1, styleObject2]"></div>

// 动态参数
<button :[key]="value">Button</button>
```

**2. v-on（事件监听）：**

```javascript
// 简写 @
<div v-on:click="doSomething"></div>
<div @click="doSomething"></div>

// 事件修饰符
<form @submit.prevent="onSubmit">prevent default</form>
<div @click.stop="doThis">stop propagation</div>
<div @click.once="doThis">trigger only once</div>
<input @keyup.enter="onEnter">enter key</input>

// 动态参数
<button @[event]="handler">Button</button>
```

**3. v-model（双向绑定）：**

```javascript
// 文本输入
<input v-model="message">

// 复选框
<input type="checkbox" v-model="checked">

// 多个复选框
<input type="checkbox" value="A" v-model="checkedNames">
<input type="checkbox" value="B" v-model="checkedNames">

// 单选按钮
<input type="radio" value="One" v-model="picked">

// 选择框
<select v-model="selected">
  <option disabled value="">Please select one</option>
  <option>A</option>
  <option>B</option>
</select>

// 修饰符
<input v-model.lazy="msg"> // 失焦时更新
<input v-model.number="age"> // 转换为数字
<input v-model.trim="msg"> // 去除首尾空格
```

**4. v-if / v-else-if / v-else（条件渲染）：**

```javascript
<div v-if="type === 'A'">A</div>
<div v-else-if="type === 'B'">B</div>
<div v-else-if="type === 'C'">C</div>
<div v-else>Not A/B/C</div>

// 使用 key 管理可复用元素
<transition>
  <button v-if="isEditing" key="save" @click="onSave">Save</button>
  <button v-else key="edit" @click="onEdit">Edit</button>
</transition>
```

**5. v-show（条件显示）：**

```javascript
<div v-show="isVisible">This is visible</div>

// v-if vs v-show
// v-if: 真正的条件渲染，惰性，切换开销大
// v-show: 简单的 CSS 切换，初始渲染开销大
```

**6. v-for（列表渲染）：**

```javascript
// 数组
<li v-for="item in items">{{ item.message }}</li>

// 带索引
<li v-for="(item, index) in items">{{ index }} - {{ item.message }}</li>

// 对象
<li v-for="value in object">{{ value }}</li>
<li v-for="(value, key) in object">{{ key }}: {{ value }}</li>
<li v-for="(value, key, index) in object">{{ index }}. {{ key }}: {{ value }}</li>

// 使用 key
<div v-for="item in items" :key="item.id">
  {{ item.text }}
</div>
```

**7. v-slot（插槽）：**

```javascript
// 默认插槽
<base-layout>
  <template v-slot:default>
    <p>A paragraph for the main content.</p>
  </template>
</base-layout>

// 具名插槽
<base-layout>
  <template v-slot:header>
    <h1>Here might be a page title</h1>
  </template>
  
  <template v-slot:default>
    <p>A paragraph for the main content.</p>
  </template>
  
  <template v-slot:footer>
    <p>Here's some contact info</p>
  </template>
</base-layout>

// 作用域插槽
<current-user>
  <template v-slot:default="slotProps">
    {{ slotProps.user.firstName }}
  </template>
</current-user>

// 简写
<current-user #default="slotProps">
  {{ slotProps.user.firstName }}
</current-user>
```

**8. v-text / v-html：**

```javascript
// v-text: 更新元素的 textContent
<span v-text="msg"></span>
<!-- 等同于 -->
<span>{{ msg }}</span>

// v-html: 更新元素的 innerHTML
<div v-html="rawHtml"></div>

// ⚠️ 注意：v-html 有 XSS 风险，只在可信内容上使用
```

**9. v-once（只渲染一次）：**

```javascript
<div v-once>{{ message }}</div>
<!-- 元素和子元素只渲染一次，不响应数据变化 -->
```

**10. v-pre（跳过编译）：**

```javascript
<div v-pre>{{ this will not be compiled }}</div>
<!-- 显示原始 Mustache 标签 -->
```

**11. v-cloak（保持在元素上直到关联实例结束编译）：**

```javascript
<div v-cloak>{{ message }}</div>

// CSS
[v-cloak] {
  display: none;
}
```

---

### 10. 自定义指令如何实现？

**答案：**

**注册自定义指令：**

```javascript
// 全局注册
Vue.directive('focus', {
  inserted: function (el) {
    el.focus();
  }
});

// 局部注册
export default {
  directives: {
    focus: {
      inserted: function (el) {
        el.focus();
      }
    }
  }
};
```

**指令钩子函数：**

```javascript
Vue.directive('my-directive', {
  bind: function (el, binding, vnode) {
    // 只调用一次，指令第一次绑定到元素时调用
    // 在这里可以进行一次性的初始化设置
  },
  
  inserted: function (el, binding, vnode) {
    // 被绑定元素插入父节点时调用
    // 可以访问父节点
  },
  
  update: function (el, binding, vnode, oldVnode) {
    // 所在组件的 VNode 更新时调用
    // 可能发生在其子 VNode 更新之前
  },
  
  componentUpdated: function (el, binding, vnode, oldVnode) {
    // 指令所在组件的 VNode 及其子 VNode 全部更新后调用
  },
  
  unbind: function (el, binding, vnode) {
    // 只调用一次，指令与元素解绑时调用
  }
});
```

**钩子函数参数：**

```javascript
Vue.directive('example', {
  bind(el, binding, vnode, oldVnode) {
    // el: 指令所绑定的元素
    // binding: 一个对象
    // vnode: Vue 编译生成的虚拟节点
    // oldVnode: 上一个虚拟节点（仅在 update 和 componentUpdated 钩子中可用）
    
    console.log(binding.name);      // 指令名
    console.log(binding.value);    // 指令的绑定值
    console.log(binding.expression); // 指令的表达式
    console.log(binding.arg);      // 指令的参数
    console.log(binding.modifiers); // 指令的修饰符
  }
});
```

**实战示例：**

```javascript
// 1. 自动聚焦指令
Vue.directive('focus', {
  inserted(el) {
    el.focus();
  }
});

// 使用
<input v-focus>

// 2. 防抖指令
Vue.directive('debounce', {
  inserted(el, binding) {
    let timer;
    el.addEventListener('click', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        binding.value();
      }, binding.arg || 300);
    });
  }
});

// 使用
<button v-debounce:500="handleClick">Click</button>

// 3. 节流指令
Vue.directive('throttle', {
  inserted(el, binding) {
    let throttled = false;
    el.addEventListener('click', () => {
      if (!throttled) {
        binding.value();
        throttled = true;
        setTimeout(() => {
          throttled = false;
        }, binding.arg || 300);
      }
    });
  }
});

// 使用
<button v-throttle:1000="handleClick">Click</button>

// 4. 无限滚动指令
Vue.directive('infinite-scroll', {
  inserted(el, binding) {
    const callback = binding.value;
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback();
        }
      });
    }, options);
    
    observer.observe(el);
    
    el._observer = observer;
  },
  
  unbind(el) {
    if (el._observer) {
      el._observer.disconnect();
    }
  }
});

// 使用
<div v-infinite-scroll="loadMore"></div>

// 5. 权限指令
Vue.directive('permission', {
  inserted(el, binding) {
    const { value } = binding;
    const permissions = store.getters.permissions;
    
    if (value && value instanceof Array && value.length > 0) {
      const hasPermission = value.some(permission => {
        return permissions.includes(permission);
      });
      
      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el);
      }
    } else {
      throw new Error('需要权限！');
    }
  }
});

// 使用
<button v-permission="['admin', 'editor']">Delete</button>

// 6. 复制到剪贴板指令
Vue.directive('copy', {
  bind(el, binding) {
    el.copyData = binding.value;
    el.addEventListener('click', handleClick);
  },
  
  update(el, binding) {
    el.copyData = binding.value;
  },
  
  unbind(el) {
    el.removeEventListener('click', handleClick);
  }
});

function handleClick() {
  const input = document.createElement('input');
  input.value = this.copyData;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
  this.$message.success('复制成功');
}

// 使用
<button v-copy="text">Copy</button>
```

---

## 路由与状态管理

### 11. Vue Router 的核心概念有哪些？

**答案：**

**1. 基础配置：**

```javascript
import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue') // 懒加载
  },
  {
    path: '/user/:id',
    name: 'User',
    component: User,
    props: true // 路由参数作为 props 传递
  }
];

const router = new VueRouter({
  mode: 'history', // hash 或 history
  base: process.env.BASE_URL,
  routes
});

export default router;
```

**2. 动态路由匹配：**

```javascript
// 路由配置
{
  path: '/user/:id',
  component: User
}

// 访问
this.$route.params.id

// 多个参数
{
  path: '/user/:id/post/:postId',
  component: UserPost
}

// 可选参数
{
  path: '/user/:id?',
  component: User
}
```

**3. 嵌套路由：**

```javascript
const routes = [
  {
    path: '/user/:id',
    component: User,
    children: [
      {
        path: '',
        component: UserHome
      },
      {
        path: 'profile',
        component: UserProfile
      },
      {
        path: 'posts',
        component: UserPosts
      }
    ]
  }
];

// User.vue
<template>
  <div>
    <router-view></router-view>
  </div>
</template>
```

**4. 编程式导航：**

```javascript
// 字符串
this.$router.push('/home');

// 对象
this.$router.push({ path: '/home' });

// 命名路由
this.$router.push({ name: 'user', params: { userId: 123 }});

// 带查询参数
this.$router.push({ path: '/user', query: { plan: 'private' }});

// 替换当前路由
this.$router.replace('/home');

// 前进/后退
this.$router.go(-1);
this.$router.back();
this.$router.forward();
```

**5. 命名视图：**

```javascript
const routes = [
  {
    path: '/',
    components: {
      default: Home,
      sidebar: Sidebar,
      header: Header
    }
  }
];

// App.vue
<template>
  <div>
    <router-view name="header"></router-view>
    <div class="container">
      <router-view name="sidebar"></router-view>
      <router-view></router-view>
    </div>
  </div>
</template>
```

**6. 路由守卫：**

```javascript
// 全局前置守卫
router.beforeEach((to, from, next) => {
  // to: 即将进入的目标路由
  // from: 当前导航正要离开的路由
  // next: 必须调用该方法来 resolve 这个钩子
  
  if (to.meta.requiresAuth) {
    if (isAuthenticated()) {
      next();
    } else {
      next('/login');
    }
  } else {
    next();
  }
});

// 全局解析守卫
router.beforeResolve((to, from, next) => {
  next();
});

// 全局后置钩子
router.afterEach((to, from) => {
  // 不接受 next 函数
  document.title = to.meta.title || 'Default Title';
});

// 路由独享守卫
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from, next) => {
      if (checkPermission()) {
        next();
      } else {
        next('/403');
      }
    }
  }
];

// 组件内守卫
export default {
  beforeRouteEnter(to, from, next) {
    // 在渲染该组件的对应路由被 confirm 前调用
    // 不能获取组件实例 `this`
    next(vm => {
      // 通过 `vm` 访问组件实例
    });
  },
  
  beforeRouteUpdate(to, from, next) {
    // 在当前路由改变，但是该组件被复用时调用
    // 可以访问组件实例 `this`
    this.name = to.params.name;
    next();
  },
  
  beforeRouteLeave(to, from, next) {
    // 导航离开该组件的对应路由时调用
    // 可以访问组件实例 `this`
    if (this.hasUnsavedChanges) {
      const answer = window.confirm('确定要离开吗？');
      if (answer) {
        next();
      } else {
        next(false);
      }
    } else {
      next();
    }
  }
};
```

**7. 路由元信息：**

```javascript
const routes = [
  {
    path: '/admin',
    component: Admin,
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      title: 'Admin Panel'
    }
  }
];

// 在导航守卫中使用
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    // ...
  }
  if (to.meta.roles && !hasRole(to.meta.roles)) {
    next('/403');
  }
});
```

**8. 滚动行为：**

```javascript
const router = new VueRouter({
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  }
});
```

---

### 12. Vuex 的核心概念有哪些？

**答案：**

**1. State（状态）：**

```javascript
const store = new Vuex.Store({
  state: {
    count: 0,
    user: null,
    todos: []
  }
});

// 组件中访问
this.$store.state.count;

// 使用 mapState
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['count', 'user']),
    ...mapState({
      myCount: state => state.count,
      userAge: state => state.user.age
    })
  }
};
```

**2. Getters（计算属性）：**

```javascript
const store = new Vuex.Store({
  state: {
    todos: [
      { id: 1, text: '...', done: true },
      { id: 2, text: '...', done: false }
    ]
  },
  getters: {
    doneTodos: state => {
      return state.todos.filter(todo => todo.done);
    },
    doneTodosCount: (state, getters) => {
      return getters.doneTodos.length;
    },
    getTodoById: (state) => (id) => {
      return state.todos.find(todo => todo.id === id);
    }
  }
});

// 组件中访问
this.$store.getters.doneTodos;

// 使用 mapGetters
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters(['doneTodos', 'doneTodosCount']),
    ...mapGetters({
      doneCount: 'doneTodosCount'
    })
  }
};
```

**3. Mutations（同步修改）：**

```javascript
const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment(state) {
      state.count++;
    },
    incrementBy(state, payload) {
      state.count += payload.amount;
    }
  }
});

// 组件中提交
this.$store.commit('increment');
this.$store.commit('incrementBy', { amount: 10 });

// 使用 mapMutations
import { mapMutations } from 'vuex';

export default {
  methods: {
    ...mapMutations(['increment', 'incrementBy']),
    ...mapMutations({
      add: 'increment'
    })
  }
};
```

**4. Actions（异步操作）：**

```javascript
const store = new Vuex.Store({
  state: {
    count: 0,
    user: null
  },
  mutations: {
    increment(state) {
      state.count++;
    },
    setUser(state, user) {
      state.user = user;
    }
  },
  actions: {
    incrementAsync({ commit }) {
      setTimeout(() => {
        commit('increment');
      }, 1000);
    },
    actionA({ commit, state }) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          commit('increment');
          resolve();
        }, 1000);
      });
    },
    async actionB({ dispatch, commit }) {
      await dispatch('actionA');
      commit('increment');
    },
    async fetchUser({ commit }, userId) {
      try {
        const response = await api.getUser(userId);
        commit('setUser', response.data);
      } catch (error) {
        console.error(error);
      }
    }
  }
});

// 组件中分发
this.$store.dispatch('incrementAsync');
this.$store.dispatch('fetchUser', 123);

// 使用 mapActions
import { mapActions } from 'vuex';

export default {
  methods: {
    ...mapActions(['incrementAsync', 'fetchUser']),
    ...mapActions({
      addAsync: 'incrementAsync'
    })
  }
};
```

**5. Modules（模块化）：**

```javascript
const moduleA = {
  namespaced: true,
  state: { count: 0 },
  mutations: { increment(state) { state.count++ } },
  actions: { incrementIfOddOnRootSum({ state, commit, rootState }) { } },
  getters: { doubleCount(state) { return state.count * 2 } }
};

const moduleB = {
  namespaced: true,
  state: { ... },
  mutations: { ... },
  actions: { ... }
};

const store = new Vuex.Store({
  modules: {
    a: moduleA,
    b: moduleB
  }
});

// 组件中访问
this.$store.state.a.count;
this.$store.getters['a/doubleCount'];
this.$store.commit('a/increment');
this.$store.dispatch('a/incrementIfOddOnRootSum');

// 使用 mapState、mapGetters 等辅助函数
import { mapState, mapGetters } from 'vuex';

export default {
  computed: {
    ...mapState('a', ['count']),
    ...mapGetters('a', ['doubleCount'])
  }
};
```

**6. 严格模式：**

```javascript
const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production'
});

// 严格模式下，state 修改只能在 mutation 中进行
// 否则会抛出错误
```

---

## 性能优化

### 13. Vue2 性能优化有哪些方法？

**答案：**

**1. v-if vs v-show：**

```javascript
// v-if: 适合条件很少改变的场景
<div v-if="showDetail">Detail</div>

// v-show: 适合频繁切换的场景
<div v-show="isVisible">Content</div>
```

**2. v-for 使用 key：**

```javascript
// ✅ 使用唯一 ID
<li v-for="item in items" :key="item.id">
  {{ item.name }}
</li>

// ❌ 避免使用 index
<li v-for="(item, index) in items" :key="index">
  {{ item.name }}
</li>
```

**3. 合理使用 computed：**

```javascript
// ✅ 使用 computed 缓存计算结果
computed: {
  filteredList() {
    return this.list.filter(item => item.active);
  }
}

// ❌ 避免在模板中使用复杂表达式
<div>{{ list.filter(item => item.active).map(item => item.name).join(', ') }}</div>
```

**4. 事件监听优化：**

```javascript
// ✅ 使用事件委托
<div @click="handleItemClick">
  <div v-for="item in items" :data-id="item.id">{{ item.name }}</div>
</div>

methods: {
  handleItemClick(e) {
    const id = e.target.dataset.id;
    // 处理点击
  }
}

// ✅ 使用防抖/节流
import { debounce } from 'lodash';

methods: {
  handleSearch: debounce(function(query) {
    this.search(query);
  }, 300)
}
```

**5. 组件懒加载：**

```javascript
// 路由懒加载
const routes = [
  {
    path: '/about',
    component: () => import('@/views/About.vue')
  }
];

// 组件懒加载
components: {
  HeavyComponent: () => import('@/components/HeavyComponent.vue')
}
```

**6. 长列表优化（虚拟滚动）：**

```javascript
// 使用 vue-virtual-scroll-list
import VirtualList from 'vue-virtual-scroll-list';

<VirtualList
  :size="50"
  :remain="8"
  :data="list"
>
  <item slot-scope="props" :item="props.item" />
</VirtualList>
```

**7. 图片懒加载：**

```javascript
// 使用 vue-lazyload
import VueLazyload from 'vue-lazyload';

Vue.use(VueLazyload, {
  preLoad: 1.3,
  error: 'error.png',
  loading: 'loading.png',
  attempt: 1
});

// 使用
<img v-lazy="imageSrc">
```

**8. keep-alive 缓存组件：**

```javascript
// 缓存组件状态
<keep-alive>
  <component :is="currentComponent"></component>
</keep-alive>

// 缓存指定组件
<keep-alive include="Home,About">
  <component :is="currentComponent"></component>
</keep-alive>

// 排除指定组件
<keep-alive exclude="Admin">
  <component :is="currentComponent"></component>
</keep-alive>

// 组件内使用
export default {
  activated() {
    // 组件被激活时调用
  },
  deactivated() {
    // 组件被停用时调用
  }
};
```

**9. 减少响应式数据：**

```javascript
// ✅ 使用 Object.freeze 冻结不需要响应式的数据
data() {
  return {
    staticList: Object.freeze(largeStaticList)
  };
}

// ✅ 使用非响应式属性
export default {
  created() {
    this.nonReactiveData = largeData;
  }
};
```

**10. 使用 v-once：**

```javascript
// 只渲染一次，不更新
<div v-once>{{ staticContent }}</div>
```

**11. 合理使用 Vuex：**

```javascript
// ✅ 模块化
const store = new Vuex.Store({
  modules: {
    user: userModule,
    product: productModule
  }
});

// ✅ 使用 local state
export default {
  data() {
    return {
      localState: '只在组件内使用'
    };
  }
};
```

**12. 优化渲染函数：**

```javascript
// 使用函数式组件
Vue.component('functional-component', {
  functional: true,
  render(h, context) {
    return h('div', context.props.message);
  }
});
```

---

## 常见问题与最佳实践

### 14. Vue2 常见面试题汇总

**答案：**

**1. Vue2 和 Vue3 的主要区别？**

- 响应式原理：Vue2 使用 Object.defineProperty，Vue3 使用 Proxy
- API 风格：Vue3 支持 Composition API
- 性能：Vue3 更快，体积更小
- TypeScript 支持：Vue3 更好的 TypeScript 支持
- Tree-shaking：Vue3 支持更好的 Tree-shaking

**2. Vue 的 data 为什么是一个函数？**

```javascript
// 防止组件复用时数据共享
export default {
  data() {
    return {
      count: 0
    };
  }
};

// 如果 data 是对象，所有组件实例会共享同一个对象
```

**3. Vue 的 nextTick 是什么？**

```javascript
// 在下次 DOM 更新循环结束之后执行延迟回调
this.message = 'new message';
this.$nextTick(() => {
  // DOM 已更新
});
```

**4. Vue 的过滤器是什么？**

```javascript
// 注册全局过滤器
Vue.filter('capitalize', function (value) {
  if (!value) return '';
  value = value.toString();
  return value.charAt(0).toUpperCase() + value.slice(1);
});

// 使用
{{ message | capitalize }}

// 注意：Vue3 已移除过滤器
```

**5. Vue 的 mixin 是什么？**

```javascript
// 定义 mixin
const myMixin = {
  data() {
    return {
      message: 'Hello from mixin'
    };
  },
  methods: {
    sayHello() {
      console.log(this.message);
    }
  }
};

// 使用 mixin
export default {
  mixins: [myMixin]
};

// ⚠️ 注意：mixin 可能导致命名冲突，谨慎使用
```

**6. Vue 的插槽是什么？**

```javascript
// 默认插槽
<slot></slot>

// 具名插槽
<slot name="header"></slot>

// 作用域插槽
<slot :user="user"></slot>
```

**7. Vue 的组件通信方式有哪些？**

- Props / $emit
- $refs
- $parent / $children
- Provide / Inject
- Event Bus
- Vuex
- $attrs / $listeners

**8. Vue 的路由模式有哪些？**

- hash 模式：URL 带 # 号
- history 模式：URL 不带 # 号，需要服务器配置

**9. Vue 的双向绑定原理是什么？**

- 数据劫持（Object.defineProperty）
- 发布-订阅模式
- v-model = v-bind + v-on

**10. Vue 的虚拟 DOM 是什么？**

- JavaScript 对象表示 DOM 结构
- Diff 算法比较差异
- 最小化 DOM 操作

---

## 总结

以上涵盖了 Vue2 面试中最常问的核心问题，包括：

1. **Vue2 核心原理**（双向绑定、虚拟 DOM、模板编译、依赖收集）
2. **响应式原理**（响应式限制、computed vs watch）
3. **组件通信**（多种通信方式）
4. **生命周期**（各个阶段的作用）
5. **指令与模板**（常用指令、自定义指令）
6. **路由与状态管理**（Vue Router、Vuex）
7. **性能优化**（多种优化方法）
8. **常见问题与最佳实践**（面试高频问题）

这些题目覆盖了 Vue2 的核心概念和实际应用，能够全面考察候选人的 Vue2 知识深度和广度。