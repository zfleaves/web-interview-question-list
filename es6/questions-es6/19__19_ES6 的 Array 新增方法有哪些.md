## 19. ES6 的 Array 新增方法有哪些？

**答案：**

### 1. Array.from()

将类数组对象或可迭代对象转换为数组：

```javascript
// 类数组对象
const arrayLike = { 0: 'a', 1: 'b', 2: 'c', length: 3 };
const arr = Array.from(arrayLike);
console.log(arr); // ['a', 'b', 'c']

// 字符串
const str = 'hello';
const arr2 = Array.from(str);
console.log(arr2); // ['h', 'e', 'l', 'l', 'o']

// Set
const set = new Set([1, 2, 3]);
const arr3 = Array.from(set);
console.log(arr3); // [1, 2, 3]

// Map
const map = new Map([['a', 1], ['b', 2]]);
const arr4 = Array.from(map);
console.log(arr4); // [['a', 1], ['b', 2]]

// 带映射函数
const arr5 = Array.from([1, 2, 3], x => x * 2);
console.log(arr5); // [2, 4, 6]
```

### 2. Array.of()

创建数组，解决 Array() 构造函数的怪异行为：

```javascript
console.log(Array.of(1, 2, 3)); // [1, 2, 3]
console.log(Array.of(3)); // [3]

console.log(Array(3)); // [empty × 3]
console.log(Array(1, 2, 3)); // [1, 2, 3]
```

### 3. copyWithin()

在数组内部复制元素：

```javascript
const arr = [1, 2, 3, 4, 5];
arr.copyWithin(0, 3); // 从位置 3 开始复制到位置 0
console.log(arr); // [4, 5, 3, 4, 5]

const arr2 = [1, 2, 3, 4, 5];
arr2.copyWithin(0, 3, 4); // 从位置 3 复制到位置 0，结束于位置 4
console.log(arr2); // [4, 2, 3, 4, 5]
```

### 4. find()

返回第一个满足条件的元素：

```javascript
const arr = [1, 2, 3, 4, 5];
const result = arr.find(item => item > 3);
console.log(result); // 4
```

### 5. findIndex()

返回第一个满足条件的元素的索引：

```javascript
const arr = [1, 2, 3, 4, 5];
const index = arr.findIndex(item => item > 3);
console.log(index); // 3
```

### 6. fill()

填充数组：

```javascript
const arr = new Array(3).fill(0);
console.log(arr); // [0, 0, 0]

const arr2 = [1, 2, 3];
arr2.fill(4);
console.log(arr2); // [4, 4, 4]

const arr3 = [1, 2, 3];
arr3.fill(4, 1, 2); // 从位置 1 填充到位置 2
console.log(arr3); // [1, 4, 3]
```

### 7. entries()

返回键值对迭代器：

```javascript
const arr = ['a', 'b', 'c'];
for (const [index, value] of arr.entries()) {
  console.log(index, value); // 0 'a', 1 'b', 2 'c'
}
```

### 8. keys()

返回键迭代器：

```javascript
const arr = ['a', 'b', 'c'];
for (const index of arr.keys()) {
  console.log(index); // 0 1 2
}
```

### 9. values()

返回值迭代器：

```javascript
const arr = ['a', 'b', 'c'];
for (const value of arr.values()) {
  console.log(value); // 'a' 'b' 'c'
}
```

### 10. includes()

判断数组是否包含某个元素：

```javascript
const arr = [1, 2, 3, NaN];
console.log(arr.includes(2)); // true
console.log(arr.includes(NaN)); // true（indexOf 返回 false）
console.log(arr.includes(4)); // false
```

### 11. flat()

将嵌套数组拉平：

```javascript
const arr = [1, [2, [3, [4]]]];
console.log(arr.flat()); // [1, 2, [3, [4]]]
console.log(arr.flat(2)); // [1, 2, 3, [4]]
console.log(arr.flat(Infinity)); // [1, 2, 3, 4]
```

### 12. flatMap()

先映射再拉平：

```javascript
const arr = [1, 2, 3];
const result = arr.flatMap(x => [x, x * 2]);
console.log(result); // [1, 2, 2, 4, 3, 6]

// 等价于
const result2 = arr.map(x => [x, x * 2]).flat();
console.log(result2); // [1, 2, 2, 4, 3, 6]
```

---
