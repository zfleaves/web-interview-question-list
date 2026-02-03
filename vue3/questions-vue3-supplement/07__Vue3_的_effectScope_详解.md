# Vue3 的 effectScope 详解

**答案：**

## 什么是 effectScope

effectScope 是 Vue3.2+ 新增的 API，用于创建一个作用域，可以统一管理该作用域内的所有响应式副作用。

## 基本使用

```javascript
import { effectScope } from 'vue';

const scope = effectScope();

scope.run(() => {
  const count = ref(0);
  const doubled = computed(() => count.value * 2);
  watch(count, () => console.log('count changed'));
});

// 停止所有副作用
scope.stop();
```

## 嵌套使用

```javascript
const parentScope = effectScope();

parentScope.run(() => {
  const count = ref(0);

  const childScope = effectScope();

  childScope.run(() => {
    const doubled = computed(() => count.value * 2);
  });

  // 停止子作用域
  childScope.stop();
});
```

## 在组件中使用

```javascript
import { getCurrentScope, onScopeDispose } from 'vue';

export default {
  setup() {
    const scope = getCurrentScope();

    scope.run(() => {
      const timer = setInterval(() => {
        console.log('tick');
      }, 1000);

      onScopeDispose(() => {
        clearInterval(timer);
      });
    });
  }
};
```

## 在插件开发中使用

```javascript
export default {
  install(app) {
    const scope = effectScope();

    app.provide('pluginScope', scope);

    scope.run(() => {
      // 插件的所有响应式副作用
      const state = reactive({ data: {} });
      app.provide('pluginState', state);
    });
  }
};

// 卸载插件
const scope = app.provide('pluginScope');
scope.stop();
```

---