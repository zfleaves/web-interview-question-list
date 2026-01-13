## 1. let、const、var 的区别是什么？

**答案：**

### 1. 变量提升

**var：** 存在变量提升，可以在声明之前调用，值为 `undefined`

```javascript
console.log(a); // undefined
var a = 10;
```

**let 和 const：** 不存在变量提升，必须在声明后使用，否则报错

```javascript
console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 10;

console.log(c); // ReferenceError: Cannot access 'c' before initialization
const c = 10;
```

### 2. 暂时性死区（TDZ）

**var：** 不存在暂时性死区

**let 和 const：** 存在暂时性死区，只有等到声明变量的那一行代码出现，才可以获取和使用该变量

```javascript
// let
{
  console.log(b); // ReferenceError: Cannot access 'b' before initialization
  let b = 10;
}

// const
{
  console.log(c); // ReferenceError: Cannot access 'c' before initialization
  const c = 10;
}
```

### 3. 块级作用域

**var：** 不存在块级作用域，只有函数作用域

```javascript
{
  var a = 20;
}
console.log(a); // 20
```

**let 和 const：** 存在块级作用域

```javascript
{
  let b = 20;
}
console.log(b); // ReferenceError: b is not defined

{
  const c = 20;
}
console.log(c); // ReferenceError: c is not defined
```

### 4. 重复声明

**var：** 允许重复声明变量

```javascript
var a = 10;
var a = 20;
console.log(a); // 20
```

**let 和 const：** 在同一作用域不允许重复声明变量

```javascript
let b = 10;
let b = 20; // SyntaxError: Identifier 'b' has already been declared

const c = 10;
const c = 20; // SyntaxError: Identifier 'c' has already been declared
```

### 5. 修改声明的变量

**var 和 let：** 可以修改

```javascript
var a = 10;
a = 20;
console.log(a); // 20

let b = 10;
b = 20;
console.log(b); // 20
```

**const：** 声明一个只读的常量，一旦声明，常量的值就不能改变

```javascript
const c = 10;
c = 20; // TypeError: Assignment to constant variable
```

**注意：** const 对象的属性可以修改

```javascript
const obj = { name: 'test' };
obj.name = 'new name'; // 可以修改
console.log(obj.name); // 'new name'

obj = {}; // TypeError: Assignment to constant variable
```

### 6. 使用建议

```javascript
// 能用 const 的情况尽量使用 const
const PI = 3.14159;
const API_URL = 'https://api.example.com';

// 其他情况下大多数使用 let
let count = 0;
let items = [];

// 避免使用 var
```

---
