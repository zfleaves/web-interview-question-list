## 14. ES6 的 Symbol 是什么？

**答案：**

### Symbol 简介

Symbol 是 ES6 新增的一种原始数据类型，表示独一无二的值。

### 基本用法

```javascript
// 1. 创建 Symbol
const s1 = Symbol();
const s2 = Symbol();
console.log(s1 === s2); // false

// 2. 带描述的 Symbol
const s3 = Symbol('description');
console.log(s3.description); // 'description'

// 3. Symbol.for() - 全局 Symbol
const s4 = Symbol.for('foo');
const s5 = Symbol.for('foo');
console.log(s4 === s5); // true

// 4. Symbol.keyFor() - 获取全局 Symbol 的 key
const key = Symbol.keyFor(s4);
console.log(key); // 'foo'
```

### Symbol 用途

```javascript
// 1. 对象属性名
const name = Symbol('name');
const person = {
  [name]: 'test',
  age: 18
};

console.log(person[name]); // 'test'
console.log(person.name); // undefined

// 2. 消除魔术字符串
const SHAPE_TYPE = {
  RECTANGLE: Symbol('rectangle'),
  CIRCLE: Symbol('circle')
};

function getArea(shape, params) {
  switch (shape) {
    case SHAPE_TYPE.RECTANGLE:
      return params.width * params.height;
    case SHAPE_TYPE.CIRCLE:
      return Math.PI * params.radius * params.radius;
  }
}

// 3. 私有属性
const _private = Symbol('private');

class MyClass {
  constructor() {
    this[_private] = 'private data';
  }

  getPrivate() {
    return this[_private];
  }
}
```

### 内置 Symbol

```javascript
// 1. Symbol.iterator - 迭代器
const arr = [1, 2, 3];
const iterator = arr[Symbol.iterator]();
console.log(iterator.next()); // { value: 1, done: false }
console.log(iterator.next()); // { value: 2, done: false }
console.log(iterator.next()); // { value: 3, done: false }
console.log(iterator.next()); // { value: undefined, done: true }

// 2. Symbol.toStringTag - 自定义对象类型标签
class MyArray extends Array {
  static get [Symbol.toStringTag]() {
    return 'MyArray';
  }
}

const myArr = new MyArray();
console.log(Object.prototype.toString.call(myArr)); // '[object MyArray]'

// 3. Symbol.toPrimitive - 类型转换
const obj = {
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') {
      return 42;
    }
    if (hint === 'string') {
      return 'hello';
    }
    return true;
  }
};

console.log(+obj); // 42
console.log(`${obj}`); // 'hello'
console.log(obj + ''); // 'true'
```

---
