## 16. ES6 的 Reflect 是什么？

**答案：**

### Reflect 简介

Reflect 是一个内置的对象，它提供拦截 JavaScript 操作的方法。这些方法与 Proxy 的方法相同。

### Reflect 方法

```javascript
// 1. Reflect.get() - 获取对象属性
const obj = { name: 'test', age: 18 };
console.log(Reflect.get(obj, 'name')); // 'test'

// 2. Reflect.set() - 设置对象属性
Reflect.set(obj, 'age', 20);
console.log(obj.age); // 20

// 3. Reflect.has() - 检查对象属性
console.log(Reflect.has(obj, 'name')); // true

// 4. Reflect.deleteProperty() - 删除对象属性
Reflect.deleteProperty(obj, 'age');
console.log(obj.age); // undefined

// 5. Reflect.ownKeys() - 获取对象的所有键
console.log(Reflect.ownKeys(obj)); // ['name']

// 6. Reflect.apply() - 调用函数
function sum(a, b) {
  return a + b;
}
console.log(Reflect.apply(sum, null, [1, 2])); // 3

// 7. Reflect.construct() - 调用构造函数
function Person(name) {
  this.name = name;
}
const p = Reflect.construct(Person, ['test']);
console.log(p.name); // 'test'

// 8. Reflect.getPrototypeOf() - 获取原型
console.log(Reflect.getPrototypeOf(obj)); // {}

// 9. Reflect.setPrototypeOf() - 设置原型
Reflect.setPrototypeOf(obj, null);
console.log(Reflect.getPrototypeOf(obj)); // null
```

### Reflect vs Object

```javascript
// 1. 返回值不同
// Object.defineProperty 失败时抛出异常
try {
  Object.defineProperty({}, 'name', { value: 'test' });
} catch (error) {
  console.error(error);
}

// Reflect.defineProperty 失败时返回 false
const result = Reflect.defineProperty(Object.freeze({}), 'name', { value: 'test' });
console.log(result); // false

// 2. 命令式 vs 函数式
// Object 是命令式
const obj = {};
obj.name = 'test';

// Reflect 是函数式
Reflect.set(obj, 'name', 'test');

// 3. 与 Proxy 配合使用
const proxy = new Proxy({}, {
  get(target, property, receiver) {
    return Reflect.get(target, property, receiver);
  }
});
```

### 实际应用

```javascript
// 1. 安全的属性访问
function safeGet(obj, property) {
  try {
    return Reflect.get(obj, property);
  } catch (error) {
    return undefined;
  }
}

// 2. 安全的属性设置
function safeSet(obj, property, value) {
  try {
    return Reflect.set(obj, property, value);
  } catch (error) {
    return false;
  }
}

// 3. 与 Proxy 配合实现响应式
function reactive(obj) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      track(target, property);
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      const oldValue = target[property];
      const result = Reflect.set(target, property, value, receiver);
      if (result && oldValue !== value) {
        trigger(target, property);
      }
      return result;
    }
  });
}
```

---
