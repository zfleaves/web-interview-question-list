## 15. ES6 的 Proxy 是什么？

**答案：**

### Proxy 简介

Proxy 用于修改某些操作的默认行为，等同于在语言层面做出修改，所以属于一种"元编程"（meta programming），即对编程语言进行编程。

### 基本用法

```javascript
// 1. 创建 Proxy
const target = {
  name: 'test',
  age: 18
};

const handler = {
  get(target, property) {
    console.log(`Getting ${property}`);
    return target[property];
  },
  set(target, property, value) {
    console.log(`Setting ${property} to ${value}`);
    target[property] = value;
    return true;
  }
};

const proxy = new Proxy(target, handler);

console.log(proxy.name); // Getting name, 'test'
proxy.age = 20; // Setting age to 20
console.log(proxy.age); // Getting age, 20
```

### Proxy 拦截操作

```javascript
const handler = {
  // 拦截对象属性的读取
  get(target, property, receiver) {
    console.log('get', property);
    return Reflect.get(target, property, receiver);
  },

  // 拦截对象属性的设置
  set(target, property, value, receiver) {
    console.log('set', property, value);
    return Reflect.set(target, property, value, receiver);
  },

  // 拦截 in 操作符
  has(target, property) {
    console.log('has', property);
    return property in target;
  },

  // 拦截 delete 操作
  deleteProperty(target, property) {
    console.log('delete', property);
    return delete target[property];
  },

  // 拦截 Object.keys()
  ownKeys(target) {
    console.log('ownKeys');
    return Reflect.ownKeys(target);
  },

  // 拦截函数调用
  apply(target, thisArg, argumentsList) {
    console.log('apply', argumentsList);
    return Reflect.apply(target, thisArg, argumentsList);
  },

  // 拦截 new 操作符
  construct(target, argumentsList, newTarget) {
    console.log('construct', argumentsList);
    return Reflect.construct(target, argumentsList, newTarget);
  }
};
```

### 实际应用

```javascript
// 1. 数据验证
const validator = {
  set(target, property, value) {
    if (property === 'age') {
      if (typeof value !== 'number' || value < 0) {
        throw new TypeError('Age must be a positive number');
      }
    }
    target[property] = value;
    return true;
  }
};

const person = new Proxy({}, validator);
person.age = 18; // OK
person.age = -1; // TypeError

// 2. 数据绑定（Vue 3 响应式原理）
function reactive(obj) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      const result = Reflect.get(target, property, receiver);
      track(target, property); // 依赖收集
      return result;
    },
    set(target, property, value, receiver) {
      const oldValue = target[property];
      const result = Reflect.set(target, property, value, receiver);
      if (result && oldValue !== value) {
        trigger(target, property); // 触发更新
      }
      return result;
    }
  });
}

// 3. 私有属性
const privateData = new WeakMap();

function createPrivateObject(obj) {
  return new Proxy(obj, {
    get(target, property) {
      if (property.startsWith('_')) {
        throw new Error('Access denied');
      }
      return target[property];
    }
  });
}

// 4. 缓存
const cache = new Map();

function memoize(fn) {
  return new Proxy(fn, {
    apply(target, thisArg, argumentsList) {
      const key = JSON.stringify(argumentsList);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = Reflect.apply(target, thisArg, argumentsList);
      cache.set(key, result);
      return result;
    }
  });
}

const slowFn = memoize((n) => {
  console.log('Computing...');
  return n * 2;
});

console.log(slowFn(5)); // Computing..., 10
console.log(slowFn(5)); // 10（从缓存获取）
```

---
