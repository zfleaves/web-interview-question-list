# Vue3 高频面试题补充

## 1. Vue3 的 Suspense 组件是什么？

**答案：**

### Suspense 简介

Suspense 是 Vue3 的一个内置组件，用于处理异步组件的加载状态，可以在异步组件加载完成前显示加载状态。

---

## 2. Vue3 的 Suspense 组件如何使用？

**答案：**

### 基本用法

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';

const AsyncComponent = defineAsyncComponent(() =>
  import('./AsyncComponent.vue')
);
</script>
```

---

## 3. Vue3 的 Suspense 组件如何进行高级配置？

**答案：**

```vue
<script setup>
import { defineAsyncComponent } from 'vue';

const AsyncComponent = defineAsyncComponent({
  loader: () => import('./AsyncComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorComponent,
  delay: 200,      // 延迟显示 loading
  timeout: 3000,   // 超时时间
  suspensible: true
});
</script>
```

---

## 4. Vue3 的 Suspense 组件如何嵌套？

**答案：**

```vue
<template>
  <Suspense>
    <template #default>
      <ParentComponent />
    </template>
    <template #fallback>
      <div>Loading parent...</div>
    </template>
  </Suspense>
</template>

<script setup>
import ParentComponent from './ParentComponent.vue';
</script>

<!-- ParentComponent.vue -->
<template>
  <div>
    <h2>Parent</h2>
    <Suspense>
      <template #default>
        <ChildComponent />
      </template>
      <template #fallback>
        <div>Loading child...</div>
      </template>
    </Suspense>
  </div>
</template>
```

---

## 5. Vue3 的 Suspense 组件如何处理错误？

**答案：**

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <Loading />
    </template>
  </Suspense>
</template>

<script setup>
import { onErrorCaptured } from 'vue';
import { ref } from 'vue';

const error = ref(null);

onErrorCaptured((err) => {
  error.value = err;
  // 返回 false 阻止错误向上传播
  return false;
});
</script>
```

---

## 6. Vue3 的 Suspense 组件有哪些注意事项？

**答案：**

1. **Suspense 只能在 setup 函数或 `<script setup>` 中使用**
2. **异步组件必须返回一个 Promise**
3. **Suspense 会等待所有异步依赖加载完成**

---

## 7. Vue3 的 Teleport 组件是什么？

**答案：**

### Teleport 简介

Teleport 是 Vue3 的一个内置组件，用于将组件渲染到 DOM 的其他位置。

---

## 8. Vue3 的 Teleport 组件如何使用？

**答案：**

### 基本用法

```vue
<template>
  <div>
    <h3>Inside Component</h3>
    <Teleport to="body">
      <div class="modal">Modal Content</div>
    </Teleport>
  </div>
</template>
```

---

## 9. Vue3 的 Teleport 组件如何传送到指定元素？

**答案：**

```vue
<template>
  <Teleport to="#modal-container">
    <div class="modal">Modal Content</div>
  </Teleport>
</template>
```

---

## 10. Vue3 的 Teleport 组件如何条件禁用？

**答案：**

```vue
<template>
  <Teleport to="body" :disabled="isInline">
    <div class="modal">Modal Content</div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';

const isInline = ref(false);
</script>
```

---

## 11. Vue3 的 Teleport 组件如何实现 Modal 弹窗？

**答案：**

```vue
<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <slot />
          <button @click="closeModal">Close</button>
        </div>
      </div>
    </Transition>
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

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
}
</style>
```

---

## 12. Vue3 的 Teleport 组件如何实现 Toast 提示？

**答案：**

```vue
<template>
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="toast-container">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', toast.type]"
      >
        {{ toast.message }}
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';

const toasts = ref([]);

const showToast = (message, type = 'info') => {
  const id = Date.now();
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 3000);
};
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}

.toast {
  padding: 10px 20px;
  margin-bottom: 10px;
  border-radius: 4px;
  color: white;
}
</style>
```

---

## 13. Vue3 的 Teleport 组件如何实现 Dropdown 下拉菜单？

**答案：**

```vue
<template>
  <div class="dropdown">
    <button @click="toggleDropdown">
      {{ selected }}
    </button>
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isOpen" class="dropdown-menu" :style="menuStyle">
          <div
            v-for="option in options"
            :key="option"
            @click="selectOption(option)"
          >
            {{ option }}
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const isOpen = ref(false);
const selected = ref('Select');
const options = ['Option 1', 'Option 2', 'Option 3'];

const menuStyle = computed(() => ({
  position: 'absolute',
  top: '100px',
  left: '100px'
}));

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (option) => {
  selected.value = option;
  isOpen.value = false;
};
</script>
```

---

## 14. Vue3 的 provide 和 inject 如何实现响应式？

**答案：**

### 基本用法

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
  }
};

// 后代组件
import { inject } from 'vue';

export default {
  setup() {
    const theme = inject('theme');
    const updateTheme = inject('updateTheme');

    return { theme, updateTheme };
  }
};
```

---

## 15. Vue3 的 provide 和 inject 如何使用 readonly？

**答案：**

```javascript
import { provide, ref, readonly } from 'vue';

export default {
  setup() {
    const state = ref({
      count: 0,
      name: 'John'
    });

    // 提供只读数据
    provide('state', readonly(state));

    // 提供修改方法
    provide('setState', (newState) => {
      state.value = { ...state.value, ...newState };
    });
  }
};
```

---

## 16. Vue3 的 provide 和 inject 如何使用 Symbol？

**答案：**

```javascript
// keys.js
import { Symbol } from 'vue';

export const ThemeKey = Symbol('theme');
export const UpdateThemeKey = Symbol('updateTheme');

// 祖先组件
import { provide, ref } from 'vue';
import { ThemeKey, UpdateThemeKey } from './keys';

export default {
  setup() {
    const theme = ref('light');

    provide(ThemeKey, theme);
    provide(UpdateThemeKey, (newTheme) => {
      theme.value = newTheme;
    });
  }
};

// 后代组件
import { inject } from 'vue';
import { ThemeKey, UpdateThemeKey } from './keys';

export default {
  setup() {
    const theme = inject(ThemeKey);
    const updateTheme = inject(UpdateThemeKey);

    return { theme, updateTheme };
  }
};
```

---

## 17. Vue3 的 provide 和 inject 如何支持 TypeScript？

**答案：**

```typescript
// types.ts
interface ThemeContext {
  theme: Ref<string>;
  updateTheme: (theme: string) => void;
}

// 祖先组件
import { provide, ref, type InjectionKey } from 'vue';

const themeKey: InjectionKey<ThemeContext> = Symbol('theme');

export default {
  setup() {
    const theme = ref('light');

    const updateTheme = (newTheme: string) => {
      theme.value = newTheme;
    };

    provide(themeKey, {
      theme,
      updateTheme
    });
  }
};

// 后代组件
import { inject } from 'vue';
import { themeKey } from './types';

export default {
  setup() {
    const { theme, updateTheme } = inject(themeKey)!;

    return { theme, updateTheme };
  }
};
```

---

## 18. Vue3 的自定义指令如何定义？

**答案：**

### 基本用法

```javascript
// 全局指令
const app = createApp(App);

app.directive('focus', {
  mounted(el) {
    el.focus();
  }
});

// 局部指令
export default {
  directives: {
    focus: {
      mounted(el) {
        el.focus();
      }
    }
  }
};
```

---

## 19. Vue3 的自定义指令有哪些生命周期钩子？

**答案：**

```javascript
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
```

---

## 20. Vue3 的自定义指令如何简写？

**答案：**

```javascript
// 当只需要 mounted 和 updated 时
app.directive('color', (el, binding) => {
  el.style.color = binding.value;
});
```

---

## 21. Vue3 的自定义指令如何实现复制到剪贴板？

**答案：**

```javascript
app.directive('copy', {
  mounted(el, binding) {
    el.addEventListener('click', () => {
      navigator.clipboard.writeText(binding.value);
    });
  }
});

// 使用
<button v-copy="text">Copy</button>
```

---

## 22. Vue3 的自定义指令如何实现无限滚动？

**答案：**

```javascript
app.directive('infinite-scroll', {
  mounted(el, binding) {
    const callback = binding.value;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback();
        }
      });
    }, {
      rootMargin: '100px'
    });

    observer.observe(el);

    el._observer = observer;
  },
  unmounted(el) {
    if (el._observer) {
      el._observer.disconnect();
    }
  }
});

// 使用
<div v-infinite-scroll="loadMore">Content</div>
```

---

## 23. Vue3 的自定义指令如何实现权限控制？

**答案：**

```javascript
app.directive('permission', {
  mounted(el, binding) {
    const { value } = binding;
    const permissions = ['admin', 'editor'];

    if (!permissions.includes(value)) {
      el.parentNode?.removeChild(el);
    }
  }
});

// 使用
<button v-permission="'admin'">Admin Only</button>
```

---

## 24. Vue3 的 Transition 如何实现基本动画？

**答案：**

```vue
<template>
  <Transition name="fade">
    <div v-if="show">Content</div>
  </Transition>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

---

## 25. Vue3 的 Transition 如何使用 JavaScript 钩子？

**答案：**

```vue
<template>
  <Transition
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="afterEnter"
    @before-leave="beforeLeave"
    @leave="leave"
    @after-leave="afterLeave"
  >
    <div v-if="show">Content</div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue';

const show = ref(true);

const beforeEnter = (el) => {
  el.style.opacity = 0;
};

const enter = (el, done) => {
  el.offsetHeight; // 触发重排
  el.style.transition = 'opacity 0.3s';
  el.style.opacity = 1;
  setTimeout(done, 300);
};

const afterEnter = (el) => {
  console.log('enter done');
};

const beforeLeave = (el) => {
  el.style.opacity = 1;
};

const leave = (el, done) => {
  el.style.transition = 'opacity 0.3s';
  el.style.opacity = 0;
  setTimeout(done, 300);
};

const afterLeave = (el) => {
  console.log('leave done');
};
</script>
```

---

## 26. Vue3 的 Transition 如何使用 GSAP？

**答案：**

```vue
<template>
  <Transition
    @enter="onEnter"
    @leave="onLeave"
  >
    <div v-if="show">Content</div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue';
import gsap from 'gsap';

const show = ref(true);

const onEnter = (el, done) => {
  gsap.fromTo(el, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, onComplete: done });
};

const onLeave = (el, done) => {
  gsap.to(el, { opacity: 0, y: -20, duration: 0.3, onComplete: done });
};
</script>
```

---

## 27. Vue3 的 TransitionGroup 如何使用？

**答案：**

```vue
<template>
  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items" :key="item.id">
      {{ item.text }}
    </li>
  </TransitionGroup>
</template>

<style>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-move {
  transition: transform 0.3s;
}
</style>
```

---

## 28. Vue3 的 shallowRef 如何使用？

**答案：**

```javascript
import { shallowRef, triggerRef } from 'vue';

const state = shallowRef({
  count: 0,
  nested: { value: 1 }
});

// ✅ 只有 .value 的赋值是响应式的
state.value = { count: 1, nested: { value: 2 } };

// ❌ 深层修改不是响应式的
state.value.count++;  // 不会触发更新
state.value.nested.value++;  // 不会触发更新

// ✅ 手动触发更新
triggerRef(state);
```

---

## 29. Vue3 的 shallowReactive 如何使用？

**答案：**

```javascript
import { shallowReactive, trigger } from 'vue';

const state = shallowReactive({
  count: 0,
  nested: { value: 1 }
});

// ✅ 只有顶层属性的赋值是响应式的
state.count++;  // 会触发更新
state.count = 1;  // 会触发更新

// ❌ 深层修改不是响应式的
state.nested.value++;  // 不会触发更新
```

---

## 30. Vue3 的 shallowRef 和 shallowReactive 有什么使用场景？

**答案：**

```javascript
// 1. 大型数据集
const largeData = shallowRef(largeDataSet);

// 2. 第三方库实例
const map = shallowRef(new Map());
// 修改 map 不会触发响应式更新
map.value.set('key', 'value');
triggerRef(map);  // 手动触发更新

// 3. 性能优化
const state = shallowReactive({
  // 只需要监听顶层属性
  config: { ... },
  data: { ... }
});
```

---

## 31. Vue3 的 effectScope 是什么？

**答案：**

### effectScope 简介

effectScope 是 Vue3.2+ 提供的一个 API，用于管理响应式副作用的作用域。

---

## 32. Vue3 的 effectScope 如何使用？

**答案：**

```javascript
import { effectScope, reactive, watchEffect } from 'vue';

const scope = effectScope();

scope.run(() => {
  const state = reactive({ count: 0 });

  watchEffect(() => {
    console.log(state.count);
  });
});

// 停止作用域内的所有 effect
scope.stop();
```

---

## 33. Vue3 的 effectScope 如何嵌套？

**答案：**

```javascript
const parentScope = effectScope();
const childScope = effectScope(true);  // detached

parentScope.run(() => {
  const state = reactive({ count: 0 });

  watchEffect(() => {
    console.log('parent:', state.count);
  });

  childScope.run(() => {
    watchEffect(() => {
      console.log('child:', state.count);
    });
  });
});

// 停止父作用域，子作用域也会停止
parentScope.stop();
```

---

## 34. Vue3 的 effectScope 如何在组件中使用？

**答案：**

```javascript
import { effectScope, onScopeDispose, ref, watchEffect } from 'vue';

export function useMouse() {
  const scope = effectScope();

  const x = ref(0);
  const y = ref(0);

  scope.run(() => {
    watchEffect(() => {
      console.log(`Mouse at ${x.value}, ${y.value}`);
    });
  });

  // 组件卸载时停止作用域
  onScopeDispose(() => {
    scope.stop();
  });

  return { x, y };
}
```

---

## 35. Vue3 的 effectScope 如何在插件开发中使用？

**答案：**

```javascript
import { effectScope, onScopeDispose } from 'vue';

export function createMyPlugin(app) {
  const scope = effectScope();

  app.provide('myPlugin', {
    state: scope.run(() => reactive({ ... })),
    stop: () => scope.stop()
  });

  app.mixin({
    beforeUnmount() {
      scope.stop();
    }
  });
}
```

---

## 36. Vue3 的 toRaw 如何使用？

**答案：**

```javascript
import { reactive, toRaw } from 'vue';

const original = { count: 0 };
const state = reactive(original);

// 获取原始对象
const raw = toRaw(state);

console.log(raw === original);  // true
console.log(raw === state);  // false
```

---

## 37. Vue3 的 markRaw 如何使用？

**答案：**

```javascript
import { reactive, markRaw } from 'vue';

const obj = markRaw({
  count: 0,
  nested: { value: 1 }
});

const state = reactive({
  obj
});

// ❌ obj 不会被代理
state.obj.count++;  // 不会触发更新
state.obj.nested.value++;  // 不会触发更新
```

---

## 38. Vue3 的 toRaw 和 markRaw 有什么使用场景？

**答案：**

```javascript
// 1. 不需要响应式的复杂对象
const config = markRaw({
  // 大型配置对象
});

// 2. 第三方库实例
const map = markRaw(new Map());
const state = reactive({
  map
});

// 3. 性能优化
const largeData = markRaw(largeDataSet);
const state = reactive({
  data: largeData  // 不会被代理
});

// 4. 只读数据
const constants = markRaw({
  API_URL: 'https://api.example.com',
  VERSION: '1.0.0'
});
```

---

## 39. Vue3 的自定义渲染器如何创建？

**答案：**

### 基本概念

Vue3 的自定义渲染器允许将 Vue 渲染到非 DOM 平台，如 Canvas、WebGL 等。

### 创建自定义渲染器

```javascript
import { createRenderer } from 'vue';

const renderer = createRenderer({
  createElement(tag) {
    return { tag, children: [] };
  },

  patchProp(el, key, prevValue, nextValue) {
    el[key] = nextValue;
  },

  insert(child, parent, anchor) {
    parent.children.push(child);
  },

  remove(child) {
    const index = parent.children.indexOf(child);
    if (index > -1) {
      parent.children.splice(index, 1);
    }
  },

  createText(text) {
    return { text };
  },

  setText(node, text) {
    node.text = text;
  },

  createComment(text) {
    return { comment: text };
  }
});

// 使用
const app = createApp({
  setup() {
    const count = ref(0);

    return { count };
  }
});

renderer.createApp(app).mount('#app');
```

---

## 40. Vue3 的自定义渲染器如何实现 Canvas 渲染？

**答案：**

```javascript
import { createRenderer } from 'vue';

const nodeOps = {
  createElement(tag) {
    return {
      tag,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      children: []
    };
  },

  patchProp(el, key, prevValue, nextValue) {
    el[key] = nextValue;
  },

  insert(child, parent, anchor) {
    parent.children.push(child);
  },

  remove(child) {
    const index = parent.children.indexOf(child);
    if (index > -1) {
      parent.children.splice(index, 1);
    }
  },

  parentNode(node) {
    return node.parent;
  },

  nextSibling(node) {
    const parent = node.parent;
    const index = parent.children.indexOf(node);
    return parent.children[index + 1];
  }
};

const renderer = createRenderer(nodeOps);

// 使用
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const app = createApp({
  setup() {
    const rects = ref([
      { x: 10, y: 10, width: 50, height: 50, color: 'red' },
      { x: 70, y: 10, width: 50, height: 50, color: 'blue' }
    ]);

    return { rects };
  }
});

renderer.createApp(app).mount(canvas);
```

---

## 41. Vue3 的响应式系统如何处理数组？

**答案：**

### 数组响应式

```javascript
import { reactive } from 'vue';

const state = reactive({
  items: [1, 2, 3]
});

// ✅ 所有数组操作都是响应式的
state.items.push(4);  // 响应式
state.items.pop();   // 响应式
state.items.shift(); // 响应式
state.items.unshift(0);  // 响应式
state.items.splice(1, 1);  // 响应式
state.items.sort();  // 响应式
state.items.reverse();  // 响应式

// ✅ 索引赋值是响应式的
state.items[0] = 10;  // 响应式

// ✅ 长度赋值是响应式的
state.items.length = 5;  // 响应式
```

---

## 42. Vue3 的响应式系统如何拦截数组方法？

**答案：**

```javascript
// Vue3 使用 Proxy 拦截数组操作
const arrayMethods = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
];

const handler = {
  get(target, key, receiver) {
    if (arrayMethods.includes(key)) {
      // 拦截数组方法
      return function(...args) {
        const result = Array.prototype[key].apply(target, args);
        trigger(target, 'length');
        return result;
      };
    }
    return Reflect.get(target, key, receiver);
  }
};
```

---

## 43. Vue3 的响应式系统如何拦截数组索引？

**答案：**

```javascript
const handler = {
  get(target, key, receiver) {
    if (typeof key === 'string' && !isNaN(key)) {
      // 拦截数组索引
      track(target, key);
    }
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    const oldValue = target[key];
    const result = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      trigger(target, key);
      if (key === 'length') {
        trigger(target, 'length');
      }
    }
    return result;
  }
};
```

---

## 44. Vue3 的响应式系统处理数组有哪些注意事项？

**答案：**

```javascript
// ❌ 不要直接替换整个数组
state.items = [1, 2, 3];  // 会失去响应式

// ✅ 使用 push/splice 等方法
state.items.push(1, 2, 3);

// ✅ 或者重新赋值
state.items = reactive([1, 2, 3]);
```

---

## 总结

以上补充了 Vue3 的高频面试题，涵盖了：

1. **Suspense 简介** - 异步组件加载状态
2. **Suspense 基本用法** - 基本使用
3. **Suspense 高级配置** - 高级配置
4. **Suspense 嵌套** - 嵌套使用
5. **Suspense 错误处理** - 错误处理
6. **Suspense 注意事项** - 使用注意
7. **Teleport 简介** - 组件传送
8. **Teleport 基本用法** - 基本使用
9. **Teleport 指定元素** - 传送到指定位置
10. **Teleport 条件禁用** - 条件禁用
11. **Teleport Modal** - Modal 弹窗
12. **Teleport Toast** - Toast 提示
13. **Teleport Dropdown** - 下拉菜单
14. **provide/inject 响应式** - 基本用法
15. **provide/inject readonly** - 只读数据
16. **provide/inject Symbol** - Symbol 作为 key
17. **provide/inject TypeScript** - TypeScript 支持
18. **自定义指令定义** - 定义指令
19. **自定义指令生命周期** - 生命周期钩子
20. **自定义指令简写** - 简写形式
21. **自定义指令复制** - 复制到剪贴板
22. **自定义指令无限滚动** - 无限滚动
23. **自定义指令权限控制** - 权限控制
24. **Transition 基本动画** - 基本动画
25. **Transition JavaScript 钩子** - JS 钩子
26. **Transition GSAP** - 使用 GSAP
27. **TransitionGroup** - 列表动画
28. **shallowRef** - 浅层 ref
29. **shallowReactive** - 浅层 reactive
30. **shallowRef/shallowReactive 场景** - 使用场景
31. **effectScope 简介** - 作用域 API
32. **effectScope 基本用法** - 基本使用
33. **effectScope 嵌套** - 嵌套作用域
34. **effectScope 组件使用** - 组件中使用
35. **effectScope 插件开发** - 插件开发
36. **toRaw** - 获取原始对象
37. **markRaw** - 标记非响应式
38. **toRaw/markRaw 场景** - 使用场景
39. **自定义渲染器** - 创建渲染器
40. **Canvas 渲染器** - Canvas 渲染
41. **数组响应式** - 数组操作
42. **数组方法拦截** - 拦截数组方法
43. **数组索引拦截** - 拦截索引
44. **数组注意事项** - 使用注意

这些题目补充了 Vue3 的高级特性，能够更全面地考察候选人的 Vue3 能力。