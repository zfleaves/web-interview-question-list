## 2. const 对象的属性可以修改吗？

**答案：**

### const 的本质

const 保证的并不是变量的值不能改动，而是变量指向的那个内存地址不能改动。

- **基本类型**（数值、字符串、布尔值）：值就保存在变量指向的那个内存地址，因此等同于常量
- **引用类型**（对象和数组）：变量指向数据的内存地址，保存的只是一个指针，const 只能保证这个指针是固定不变的

### 示例

```javascript
// 基本类型
const a = 10;
a = 20; // TypeError: Assignment to constant variable

// 引用类型 - 对象
const obj = { name: 'test' };
obj.name = 'new name'; // 可以修改
console.log(obj.name); // 'new name'

obj.age = 18; // 可以添加新属性
console.log(obj); // { name: 'new name', age: 18 }

delete obj.name; // 可以删除属性
console.log(obj); // { age: 18 }

obj = {}; // TypeError: Assignment to constant variable

// 引用类型 - 数组
const arr = [1, 2, 3];
arr.push(4); // 可以添加元素
console.log(arr); // [1, 2, 3, 4]

arr[0] = 10; // 可以修改元素
console.log(arr); // [10, 2, 3, 4]

arr.length = 0; // 可以修改长度
console.log(arr); // []

arr = []; // TypeError: Assignment to constant variable
```

### 如何真正冻结对象

如果希望对象完全不可修改，可以使用 `Object.freeze()`：

```javascript
const obj = Object.freeze({ name: 'test' });

obj.name = 'new name'; // 静默失败（严格模式下报错）
console.log(obj.name); // 'test'

obj.age = 18; // 静默失败
console.log(obj); // { name: 'test' }

delete obj.name; // 静默失败
console.log(obj); // { name: 'test' }
```

**注意：** `Object.freeze()` 只能冻结对象的第一层属性，嵌套对象仍然可以修改：

```javascript
const obj = Object.freeze({
  name: 'test',
  info: { age: 18 }
});

obj.info.age = 20; // 可以修改
console.log(obj.info.age); // 20
```

### 深度冻结对象

如果需要深度冻结对象，需要递归冻结：

```javascript
function deepFreeze(obj) {
  // 冻结自身
  Object.freeze(obj);

  // 遍历所有属性
  Object.getOwnPropertyNames(obj).forEach(name => {
    const value = obj[name];

    // 如果属性是对象，递归冻结
    if (value && typeof value === 'object') {
      deepFreeze(value);
    }
  });

  return obj;
}

const obj = deepFreeze({
  name: 'test',
  info: { age: 18 }
});

obj.info.age = 20; // 静默失败
console.log(obj.info.age); // 18
```

---
