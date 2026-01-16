# Vue2 Slot 原理

## 核心概念

Vue2 的 Slot 是组件内容分发机制，允许父组件向子组件传递模板内容。

**Slot 类型：**
- **默认 Slot**：单个匿名插槽
- **具名 Slot**：带有 name 属性的具名插槽
- **作用域 Slot**：可以访问子组件数据的插槽

## 1. 默认 Slot

### 1.1 使用示例

```html
<!-- 父组件 -->
<template>
  <child-component>
    <p>这是默认插槽的内容</p>
  </child-component>
</template>

<!-- 子组件 -->
<template>
  <div class="child">
    <slot></slot>
  </div>
</template>
```

### 1.2 源码实现

```javascript
// 编译后的父组件渲染函数
function render() {
  return _c('child-component', [
    _c('p', [_v('这是默认插槽的内容')])
  ])
}

// 编译后的子组件渲染函数
function render() {
  return _c('div', { staticClass: 'child' }, [
    _t('default') // _t 是 renderSlot 的缩写
  ])
}

// renderSlot - 渲染插槽
function renderSlot(name, fallback, props, bindObject) {
  const scopedSlotFn = this.$scopedSlots[name];
  let nodes;
  
  if (scopedSlotFn) {
    // 作用域插槽
    props = props || {};
    if (bindObject) {
      if (!isObject(bindObject)) {
        warn('slot v-bind without argument expects an Object', this);
      }
      props = extend(extend({}, bindObject), props);
    }
    nodes = scopedSlotFn(props) || fallback;
  } else {
    // 普通插槽
    nodes = this.$slots[name] || fallback;
  }
  
  const target = props && props.slot;
  if (target) {
    return this.$createElement('template', { slot: target }, nodes);
  } else {
    return nodes;
  }
}

// 编译器生成的 _t 函数
function _t(name, fallback, props, bindObject) {
  return renderSlot(name, fallback, props, bindObject);
}
```

### 1.3 初始化插槽

```javascript
// initRender - 初始化渲染
function initRender(vm) {
  vm._vnode = null;
  vm._staticTrees = null;
  const options = vm.$options;
  const parentVnode = vm.$vnode = options._parentVnode;
  
  // 初始化 $slots
  vm.$slots = resolveSlots(options._renderChildren, parentVnode);
  
  // 初始化 $scopedSlots
  vm.$scopedSlots = parentVnode
    ? normalizeScopedSlots(parentVnode.data.scopedSlots, vm.$slots)
    : emptyObject;
}

// resolveSlots - 解析插槽
function resolveSlots(children, context) {
  if (!children || !children.length) {
    return {};
  }
  
  const slots = {};
  
  for (let i = 0, l = children.length; i < l; i++) {
    const child = children[i];
    const data = child.data;
    
    // 移除插槽属性
    if (data && data.attrs && data.attrs.slot) {
      delete data.attrs.slot;
    }
    
    // 处理具名插槽
    if ((child.context === context || child.fnContext === context) &&
      data && data.slot != null) {
      const name = data.slot;
      const slot = (slots[name] || (slots[name] = []));
      
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children || []);
      } else {
        slot.push(child);
      }
    } else {
      // 默认插槽
      (slots.default || (slots.default = [])).push(child);
    }
  }
  
  // 忽略只有空白节点的插槽
  for (const name in slots) {
    if (slots[name].every(isWhitespace)) {
      delete slots[name];
    }
  }
  
  return slots;
}
```

## 2. 具名 Slot

### 2.1 使用示例

```html
<!-- 父组件 -->
<template>
  <child-component>
    <template v-slot:header>
      <h1>标题</h1>
    </template>
    
    <template v-slot:footer>
      <p>页脚</p>
    </template>
  </child-component>
</template>

<!-- 子组件 -->
<template>
  <div class="child">
    <slot name="header"></slot>
    <div class="content">内容</div>
    <slot name="footer"></slot>
  </div>
</template>
```

### 2.2 编译后的代码

```javascript
// 编译后的父组件渲染函数
function render() {
  return _c('child-component', [
    _c('template', { slot: 'header' }, [
      _c('h1', [_v('标题')])
    ]),
    _c('template', { slot: 'footer' }, [
      _c('p', [_v('页脚')])
    ])
  ])
}

// 编译后的子组件渲染函数
function render() {
  return _c('div', { staticClass: 'child' }, [
    _t('header'),
    _c('div', { staticClass: 'content' }, [_v('内容')]),
    _t('footer')
  ])
}
```

### 2.3 具名插槽的解析

```javascript
// resolveSlots - 解析具名插槽
function resolveSlots(children, context) {
  if (!children || !children.length) {
    return {};
  }
  
  const slots = {};
  
  for (let i = 0, l = children.length; i < l; i++) {
    const child = children[i];
    const data = child.data;
    
    // 检查是否有 slot 属性
    if (data && data.slot != null) {
      const name = data.slot;
      const slot = (slots[name] || (slots[name] = []));
      
      // 如果是 template 标签，展开子节点
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children || []);
      } else {
        slot.push(child);
      }
    } else {
      // 默认插槽
      (slots.default || (slots.default = [])).push(child);
    }
  }
  
  return slots;
}
```

## 3. 作用域 Slot

### 3.1 使用示例

```html
<!-- 父组件 -->
<template>
  <child-component>
    <template v-slot:default="slotProps">
      <p>{{ slotProps.user.name }}</p>
      <p>{{ slotProps.user.age }}</p>
    </template>
  </child-component>
</template>

<!-- 子组件 -->
<template>
  <div class="child">
    <slot :user="userData"></slot>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userData: {
        name: '张三',
        age: 18
      }
    }
  }
}
</script>
```

### 3.2 编译后的代码

```javascript
// 编译后的父组件渲染函数
function render() {
  return _c('child-component', {
    scopedSlots: _u([
      {
        key: 'default',
        fn: function(slotProps) {
          return [
            _c('p', [_v(_s(slotProps.user.name))]),
            _c('p', [_v(_s(slotProps.user.age))])
          ]
        }
      }
    ])
  })
}

// 编译后的子组件渲染函数
function render() {
  return _c('div', { staticClass: 'child' }, [
    _t('default', null, { user: this.userData })
  ])
}
```

### 3.3 作用域插槽的核心实现

```javascript
// normalizeScopedSlots - 规范化作用域插槽
function normalizeScopedSlots(slots, normalSlots, prevSlots) {
  let res;
  const hasNormalSlots = Object.keys(normalSlots).length > 0;
  const isStable = slots ? !!slots.$stable : !hasNormalSlots;
  const key = slots && slots.$key;
  
  if (!slots) {
    res = {};
  } else if (slots._normalized) {
    return slots._normalized;
  } else if (
    isStable &&
    prevSlots &&
    prevSlots !== emptyObject &&
    key === prevSlots.$key &&
    !hasNormalSlots &&
    !prevSlots.$hasNormal
  ) {
    return prevSlots;
  } else {
    res = {};
    for (const key in slots) {
      if (slots[key] && key[0] !== '$') {
        res[key] = normalizeScopedSlot(normalSlots, key, slots[key]);
      }
    }
  }
  
  // 添加普通插槽
  for (const key in normalSlots) {
    if (!(key in res)) {
      res[key] = proxyNormalSlot(normalSlots, key);
    }
  }
  
  // 添加元数据
  res.$stable = isStable;
  res.$key = key;
  res.$hasNormal = hasNormalSlots;
  return res;
}

// normalizeScopedSlot - 规范化单个作用域插槽
function normalizeScopedSlot(normalSlots, key, fn) {
  const normalized = function() {
    let res = arguments.length ? fn.apply(null, arguments) : fn({});
    res = res && typeof res === 'object' && !Array.isArray(res)
      ? [res]
      : normalizeChildren(res);
    return res && (res.length === 0 || res.length === 1 && res[0].isComment)
      ? undefined
      : res;
  };
  
  // 添加元数据
  normalized.fn = fn;
  normalized.fnSource = fn;
  if (normalSlots) {
    normalized.isStatic = true;
    normalized.key = key;
    normalized.hasNormal = normalSlots[key] !== undefined;
  }
  return normalized;
}

// renderSlot - 渲染作用域插槽
function renderSlot(name, fallback, props, bindObject) {
  const scopedSlotFn = this.$scopedSlots[name];
  let nodes;
  
  if (scopedSlotFn) {
    // 作用域插槽
    props = props || {};
    if (bindObject) {
      if (!isObject(bindObject)) {
        warn('slot v-bind without argument expects an Object', this);
      }
      props = extend(extend({}, bindObject), props);
    }
    nodes = scopedSlotFn(props) || fallback;
  } else {
    // 普通插槽
    nodes = this.$slots[name] || fallback;
  }
  
  const target = props && props.slot;
  if (target) {
    return this.$createElement('template', { slot: target }, nodes);
  } else {
    return nodes;
  }
}
```

## 4. 插槽的更新

### 4.1 插槽更新的触发

```javascript
// updateChildComponent - 更新子组件
function updateChildComponent(vm, propsData, listeners, parentVnode, renderChildren) {
  // 更新 props
  if (propsData && vm.$options.props) {
    toggleObserving(false);
    const props = vm._props;
    const propKeys = vm.$options.propKeys || [];
    
    for (let i = 0; i < propKeys.length; i++) {
      const key = propKeys[i];
      const value = validateProp(key, propsData, props, vm);
      if (value !== props[key]) {
        props[key] = value;
      }
    }
    
    toggleObserving(true);
    vm.$forceUpdate();
  }
  
  // 更新 listeners
  if (listeners) {
    const oldListeners = vm.$options._parentListeners;
    vm.$options._parentListeners = listeners;
    updateComponentListeners(vm, listeners, oldListeners);
  }
  
  // 更新 slots
  if (renderChildren) {
    vm.$slots = resolveSlots(renderChildren, parentVnode);
    vm.$forceUpdate();
  }
  
  // 解析 scopedSlots
  if (renderChildren && parentVnode.data.scopedSlots) {
    vm.$scopedSlots = normalizeScopedSlots(
      parentVnode.data.scopedSlots,
      vm.$slots,
      vm.$scopedSlots
    );
  }
}
```

### 4.2 插槽的 diff

```javascript
// patchVnode - 对比 vnode
function patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly) {
  // ... 其他代码
  
  // 更新子节点
  if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
    i(oldVnode, vnode);
  }
  
  const oldCh = oldVnode.children;
  const ch = vnode.children;
  
  if (isDef(data) && isPatchable(vnode)) {
    for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode);
    if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode);
  }
  
  if (isUndef(vnode.text)) {
    if (isDef(oldCh) && isDef(ch)) {
      if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly);
    } else if (isDef(ch)) {
      // 添加新子节点
      if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '');
      addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
    } else if (isDef(oldCh)) {
      // 移除旧子节点
      removeVnodes(elm, oldCh, 0, oldCh.length - 1);
    } else if (isDef(oldVnode.text)) {
      // 移除文本
      nodeOps.setTextContent(elm, '');
    }
  } else if (oldVnode.text !== vnode.text) {
    // 更新文本
    nodeOps.setTextContent(elm, vnode.text);
  }
}
```

## 5. 插槽的高级用法

### 5.1 动态插槽名

```html
<!-- 父组件 -->
<template>
  <child-component>
    <template v-slot:[dynamicSlotName]>
      动态插槽内容
    </template>
  </child-component>
</template>

<script>
export default {
  data() {
    return {
      dynamicSlotName: 'header'
    }
  }
}
</script>
```

### 5.2 作用域插槽的解构

```html
<!-- 父组件 -->
<template>
  <child-component>
    <template v-slot:default="{ user }">
      <p>{{ user.name }}</p>
      <p>{{ user.age }}</p>
    </template>
  </child-component>
</template>
```

### 5.3 插槽的默认内容

```html
<!-- 子组件 -->
<template>
  <div class="child">
    <slot>
      <p>默认内容</p>
    </slot>
  </div>
</template>
```

## 完整流程示例

```javascript
// 1. 父组件编译
const parentTemplate = `
  <child-component>
    <template v-slot:header>
      <h1>标题</h1>
    </template>
    <p>默认内容</p>
    <template v-slot:footer="slotProps">
      <p>{{ slotProps.text }}</p>
    </template>
  </child-component>
`;

// 编译后的渲染函数
function parentRender() {
  return _c('child-component', [
    _c('template', { slot: 'header' }, [
      _c('h1', [_v('标题')])
    ]),
    _c('p', [_v('默认内容')]),
    _c('template', { slot: 'footer', scopedSlots: _u([
      {
        key: 'footer',
        fn: function(slotProps) {
          return [_c('p', [_v(_s(slotProps.text))])]
        }
      }
    ]) })
  ])
}

// 2. 子组件编译
const childTemplate = `
  <div class="child">
    <slot name="header"></slot>
    <div class="content">
      <slot></slot>
    </div>
    <slot name="footer" :text="footerText"></slot>
  </div>
`;

// 编译后的渲染函数
function childRender() {
  return _c('div', { staticClass: 'child' }, [
    _t('header'),
    _c('div', { staticClass: 'content' }, [
      _t('default')
    ]),
    _t('footer', null, { text: this.footerText })
  ])
}

// 3. 执行流程
// 1. 父组件渲染
// 2. 创建 child-component 的 vnode
// 3. 将插槽内容作为 children 传递
// 4. 子组件渲染
// 5. initRender(vm) - 初始化渲染
// 6. resolveSlots(children, parentVnode) - 解析插槽
//    - 解析具名插槽: header, footer
//    - 解析默认插槽: default
//    - 解析作用域插槽: footer 的 scopedSlots
// 7. vm.$slots = { header: [...], default: [...], footer: [...] }
// 8. vm.$scopedSlots = { footer: fn }
// 9. 执行 childRender()
// 10. _t('header') - 渲染 header 插槽
// 11. _t('default') - 渲染默认插槽
// 12. _t('footer', null, { text: this.footerText }) - 渲染 footer 作用域插槽
// 13. renderSlot('footer', null, { text: this.footerText })
// 14. scopedSlotFn({ text: this.footerText })
// 15. 执行父组件的作用域插槽函数
// 16. 返回 <p>footerText</p>
// 17. 插入到 DOM 中
```

## 面试要点

1. **Slot 的类型**：
   - 默认 Slot：匿名插槽
   - 具名 Slot：带有 name 属性
   - 作用域 Slot：可以访问子组件数据

2. **Slot 的实现原理**：
   - 父组件将插槽内容作为 children 传递
   - 子组件通过 $slots 和 $scopedSlots 访问
   - 通过 renderSlot 函数渲染插槽

3. **作用域 Slot 的实现**：
   - 父组件传递函数作为 scopedSlots
   - 子组件调用函数并传递数据
   - 父组件函数返回渲染结果

4. **Slot 的更新机制**：
   - 通过 updateChildComponent 更新
   - 重新解析 slots
   - 触发子组件重新渲染

5. **Slot 的性能优化**：
   - 静态插槽标记
   - 插槽缓存
   - 避免不必要的更新

6. **注意事项**：
   - 插槽内容在父组件中编译
   - 插槽作用域是父组件的作用域
   - 作用域插槽可以访问子组件数据
   - 插槽更新会触发子组件重新渲染

7. **Vue2 vs Vue3 的区别**：
   - Vue2 使用 $slots 和 $scopedSlots
   - Vue3 统一使用 $slots
   - Vue3 的编译产物更简洁
   - Vue3 的性能更好