## 18. ES6 的 Object 新增方法有哪些？

**答案：**

### 1. Object.is()

判断两个值是否相等，与 === 的区别：

```javascript
console.log(Object.is(NaN, NaN)); // true（=== 返回 false）
console.log(Object.is(+0, -0)); // false（=== 返回 true）
console.log(Object.is(1, 1)); // true
console.log(Object.is('foo', 'foo')); // true
console.log(Object.is(null, null)); // true
```

### 2. Object.assign()

合并对象，浅拷贝：

```javascript
const target = { a: 1 };
const source1 = { b: 2 };
const source2 = { c: 3 };

Object.assign(target, source1, source2);
console.log(target); // { a: 1, b: 2, c: 3 }

// 克隆对象
const clone = Object.assign({}, { a: 1 });
console.log(clone); // { a: 1 }

// 合并多个对象
const merged = Object.assign({}, { a: 1 }, { b: 2 }, { c: 3 });
console.log(merged); // { a: 1, b: 2, c: 3 }
```

### 3. Object.keys()

返回对象的所有可枚举属性的键名：

```javascript
const obj = { a: 1, b: 2, c: 3 };
console.log(Object.keys(obj)); // ['a', 'b', 'c']
```

### 4. Object.values()

返回对象的所有可枚举属性的值：

```javascript
const obj = { a: 1, b: 2, c: 3 };
console.log(Object.values(obj)); // [1, 2, 3]
```

### 5. Object.entries()

返回对象的所有可枚举属性的键值对数组：

```javascript
const obj = { a: 1, b: 2, c: 3 };
console.log(Object.entries(obj)); // [['a', 1], ['b', 2], ['c', 3]]

// 转换为 Map
const map = new Map(Object.entries(obj));
console.log(map); // Map { 'a' => 1, 'b' => 2, 'c' => 3 }
```

### 6. Object.fromEntries()

将键值对数组转换为对象：

```javascript
const entries = [['a', 1], ['b', 2], ['c', 3]];
const obj = Object.fromEntries(entries);
console.log(obj); // { a: 1, b: 2, c: 3 }

// Map 转 Object
const map = new Map([['a', 1], ['b', 2]]);
const obj2 = Object.fromEntries(map);
console.log(obj2); // { a: 1, b: 2 }
```

### 7. Object.getOwnPropertyDescriptors()

返回对象所有自身属性（非继承属性）的描述对象：

```javascript
const obj = {
  name: 'test',
  get age() {
    return 18;
  }
};

console.log(Object.getOwnPropertyDescriptors(obj));
```

### 8. Object.setPrototypeOf()

设置对象的原型：

```javascript
const proto = {
  hello() {
    console.log('hello');
  }
};

const obj = {};
Object.setPrototypeOf(obj, proto);
obj.hello(); // 'hello'
```

### 9. Object.getPrototypeOf()

获取对象的原型：

```javascript
const obj = {};
console.log(Object.getPrototypeOf(obj) === Object.prototype); // true
```

---
