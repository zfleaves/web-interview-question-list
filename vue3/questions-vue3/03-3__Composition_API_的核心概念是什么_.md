# 3. Composition API 的核心概念是什么？

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
