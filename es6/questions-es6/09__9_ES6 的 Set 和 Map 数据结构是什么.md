## 9. ES6 的 Set 和 Map 数据结构是什么？

**答案：**

### Set

Set 是 ES6 新增的数据结构，类似于数组，但成员的值都是唯一的，没有重复的值。

```javascript
// 1. 创建 Set
const s = new Set();
s.add(1).add(2).add(2);
console.log(s); // Set { 1, 2 }

// 2. 从数组创建 Set
const arr = [1, 2, 2, 3, 3];
const s2 = new Set(arr);
console.log(s2); // Set { 1, 2, 3 }

// 3. Set 方法
console.log(s2.has(1)); // true
s2.delete(2);
console.log(s2); // Set { 1, 3 }
s2.clear();
console.log(s2); // Set {}

// 4. 遍历 Set
const s3 = new Set([1, 2, 3]);
for (let item of s3) {
  console.log(item); // 1 2 3
}

s3.forEach((value, key) => {
  console.log(value, key); // 1 1, 2 2, 3 3
});

// 5. Set 转 Array
const s4 = new Set([1, 2, 3]);
const arr2 = [...s4];
console.log(arr2); // [1, 2, 3]

// 6. 数组去重
const arr3 = [1, 2, 2, 3, 3];
const unique = [...new Set(arr3)];
console.log(unique); // [1, 2, 3]
```

### Map

Map 是 ES6 新增的数据结构，类似于对象，也是键值对的集合，但键的范围不限于字符串，各种类型的值（包括对象）都可以当作键。

```javascript
// 1. 创建 Map
const m = new Map();
m.set('name', 'test');
m.set('age', 18);
console.log(m); // Map { 'name' => 'test', 'age' => 18 }

// 2. 从数组创建 Map
const m2 = new Map([
  ['name', 'test'],
  ['age', 18]
]);
console.log(m2); // Map { 'name' => 'test', 'age' => 18 }

// 3. Map 方法
console.log(m2.get('name')); // 'test'
console.log(m2.has('age')); // true
m2.delete('age');
console.log(m2.has('age')); // false
m2.clear();
console.log(m2); // Map {}

// 4. 遍历 Map
const m3 = new Map([
  ['name', 'test'],
  ['age', 18]
]);

for (let key of m3.keys()) {
  console.log(key); // 'name' 'age'
}

for (let value of m3.values()) {
  console.log(value); // 'test' 18
}

for (let [key, value] of m3.entries()) {
  console.log(key, value); // 'name' 'test', 'age' 18
}

m3.forEach((value, key) => {
  console.log(key, value); // 'name' 'test', 'age' 18
});

// 5. 对象作为键
const obj = { name: 'test' };
const m4 = new Map();
m4.set(obj, 'value');
console.log(m4.get(obj)); // 'value'

// 6. Map 转 Object
const m5 = new Map([
  ['name', 'test'],
  ['age', 18]
]);
const obj2 = Object.fromEntries(m5);
console.log(obj2); // { name: 'test', age: 18 }
```

### WeakSet 和 WeakMap

WeakSet 和 WeakMap 与 Set 和 Map 类似，但有以下区别：

1. 只能存储对象类型的值
2. 对象是弱引用，垃圾回收机制会自动回收
3. 没有 size 属性
4. 不能遍历

```javascript
// WeakSet
const ws = new WeakSet();
const obj1 = { name: 'test' };
const obj2 = { name: 'test2' };

ws.add(obj1);
ws.add(obj2);
console.log(ws.has(obj1)); // true
ws.delete(obj1);
console.log(ws.has(obj1)); // false

// WeakMap
const wm = new WeakMap();
const key1 = { name: 'test' };
const key2 = { name: 'test2' };

wm.set(key1, 'value1');
wm.set(key2, 'value2');
console.log(wm.get(key1)); // 'value1'
wm.delete(key1);
console.log(wm.has(key1)); // false
```

---
