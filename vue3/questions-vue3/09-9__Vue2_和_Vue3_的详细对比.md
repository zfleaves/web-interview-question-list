# 9. Vue2 和 Vue3 的详细对比

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
