# 1. Vue3 相比 Vue2 有哪些重大改进？

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
