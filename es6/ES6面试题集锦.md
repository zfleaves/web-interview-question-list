# ES6 面试题集锦

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

## 3. 箭头函数与普通函数的区别是什么？

**答案：**

### 1. 语法更简洁

```javascript
// 普通函数
function add(a, b) {
  return a + b;
}

// 箭头函数
const add = (a, b) => a + b;

// 无参数
const fn1 = () => console.log('hello');

// 一个参数
const fn2 = x => x * 2;

// 多个参数
const fn3 = (x, y) => x + y;

// 函数体有多行
const fn4 = (x, y) => {
  const sum = x + y;
  return sum * 2;
};
```

### 2. 没有自己的 this

**普通函数：** this 的指向在运行时确定

```javascript
const obj = {
  name: 'test',
  a: function() {
    console.log(this.name); // 'test'
  },
  b: () => {
    console.log(this.name); // undefined（严格模式）或 window.name
  }
};

obj.a(); // 'test'
obj.b(); // undefined
```

**箭头函数：** 继承定义时外层作用域的 this

```javascript
function Person() {
  this.age = 0;

  // 普通函数
  setInterval(function() {
    this.age++; // this 指向 window
  }, 1000);

  // 箭头函数
  setInterval(() => {
    this.age++; // this 继承自 Person
  }, 1000);
}

const p = new Person();
```

### 3. 不能作为构造函数

```javascript
// 普通函数
function Person(name) {
  this.name = name;
}

const p1 = new Person('test'); // 可以

// 箭头函数
const Person2 = (name) => {
  this.name = name;
};

const p2 = new Person2('test'); // TypeError: Person2 is not a constructor
```

### 4. 没有 arguments 对象

```javascript
// 普通函数
function fn1() {
  console.log(arguments); // Arguments 对象
}

fn1(1, 2, 3);

// 箭头函数
const fn2 = () => {
  console.log(arguments); // ReferenceError: arguments is not defined
};

fn2(1, 2, 3);

// 箭头函数使用剩余参数
const fn3 = (...args) => {
  console.log(args); // [1, 2, 3]
};

fn3(1, 2, 3);
```

### 5. 没有 prototype

```javascript
// 普通函数
function fn1() {}
console.log(fn1.prototype); // {}

// 箭头函数
const fn2 = () => {};
console.log(fn2.prototype); // undefined
```

### 6. 不能使用 yield 关键字

```javascript
// 普通函数可以作为 Generator
function* gen1() {
  yield 1;
}

// 箭头函数不能作为 Generator
const gen2 = () => {
  yield 1; // SyntaxError: Unexpected token yield
};
```

### 7. call、apply、bind 无法改变 this

```javascript
const obj = { name: 'test' };

// 普通函数
function fn1() {
  console.log(this.name);
}

fn1.call(obj); // 'test'
fn1.apply(obj); // 'test'
const bound1 = fn1.bind(obj);
bound1(); // 'test'

// 箭头函数
const fn2 = () => {
  console.log(this.name);
};

fn2.call(obj); // undefined
fn2.apply(obj); // undefined
const bound2 = fn2.bind(obj);
bound2(); // undefined
```

### 使用场景

**适合使用箭头函数的场景：**

```javascript
// 1. 回调函数
array.map(item => item * 2);

// 2. 定时器
setTimeout(() => {
  console.log('hello');
}, 1000);

// 3. Promise
fetch(url).then(response => response.json());

// 4. 保持 this 指向
class Person {
  constructor(name) {
    this.name = name;
  }

  sayHello() {
    setTimeout(() => {
      console.log(`Hello, ${this.name}`);
    }, 1000);
  }
}
```

**不适合使用箭头函数的场景：**

```javascript
// 1. 对象方法
const obj = {
  name: 'test',
  sayHello: () => {
    console.log(`Hello, ${this.name}`); // this 不是 obj
  }
};

// 2. 原型方法
function Person() {}
Person.prototype.sayHello = () => {
  console.log('hello'); // this 不是实例
};

// 3. 构造函数
const Person = () => {};
new Person(); // 报错

// 4. 需要使用 arguments 的函数
const fn = () => {
  console.log(arguments); // 报错
};
```

---

## 4. 箭头函数的 this 指向是什么？

**答案：**

### 箭头函数 this 的特点

箭头函数没有自己的 this，它继承定义时外层作用域的 this。

### 示例

```javascript
// 示例 1：全局作用域
var name = 'global';

const obj = {
  name: 'test',
  a: function() {
    console.log(this.name); // 'test'
  },
  b: () => {
    console.log(this.name); // 'global'
  }
};

obj.a(); // 'test'
obj.b(); // 'global'

// 示例 2：对象方法
const obj = {
  name: 'test',
  methods: {
    sayHello: function() {
      console.log(this.name); // 'test'
    },
    sayHello2: () => {
      console.log(this.name); // undefined
    }
  }
};

obj.methods.sayHello(); // 'test'
obj.methods.sayHello2(); // undefined

// 示例 3：定时器
function Person(name) {
  this.name = name;

  // 普通函数 - this 指向 window
  setTimeout(function() {
    console.log(this.name); // undefined
  }, 1000);

  // 箭头函数 - this 继承 Person
  setTimeout(() => {
    console.log(this.name); // 'test'
  }, 1000);
}

const p = new Person('test');

// 示例 4：事件处理
const button = document.querySelector('button');

// 普通函数 - this 指向 button
button.addEventListener('click', function() {
  console.log(this); // button 元素
});

// 箭头函数 - this 继承外层作用域
button.addEventListener('click', () => {
  console.log(this); // window
});

// 示例 5：数组方法
const obj = {
  name: 'test',
  items: [1, 2, 3],
  getDoubled: function() {
    return this.items.map(function(item) {
      return item * 2; // this 不是 obj
    });
  },
  getDoubled2: function() {
    return this.items.map(item => {
      return item * 2; // this 继承自 obj
    });
  }
};
```

### 箭头函数 this 的确定时机

箭头函数的 this 在**定义时**就已经确定，而不是在调用时确定。

```javascript
const obj = {
  name: 'test'
};

function fn() {
  return () => {
    console.log(this.name);
  };
}

const arrowFn = fn.call(obj);
arrowFn(); // 'test'（this 继承自 fn 调用时的 this）
```

### 常见陷阱

```javascript
// 陷阱 1：对象方法的箭头函数
const obj = {
  name: 'test',
  getName: () => {
    return this.name; // this 不是 obj
  }
};

console.log(obj.getName()); // undefined

// 正确做法
const obj = {
  name: 'test',
  getName() {
    return this.name; // this 是 obj
  }
};

// 陷阱 2：原型方法的箭头函数
function Person(name) {
  this.name = name;
}

Person.prototype.getName = () => {
  return this.name; // this 不是实例
};

const p = new Person('test');
console.log(p.getName()); // undefined

// 正确做法
Person.prototype.getName = function() {
  return this.name; // this 是实例
};

// 陷阱 3：事件处理
class Button {
  constructor() {
    this.count = 0;
    this.button = document.querySelector('button');
    this.button.addEventListener('click', () => {
      this.count++; // this 是 Button 实例
      console.log(this.count);
    });
  }
}

// 或者使用 bind
class Button {
  constructor() {
    this.count = 0;
    this.button = document.querySelector('button');
    this.button.addEventListener('click', this.handleClick.bind(this));
  }

  handleClick() {
    this.count++;
    console.log(this.count);
  }
}
```

---

## 5. ES6 的模板字符串有哪些特性？

**答案：**

### 1. 基本语法

使用反引号（`）包裹字符串，可以使用 `${}` 嵌入变量和表达式。

```javascript
const name = 'test';
const age = 18;

const message = `My name is ${name}, I'm ${age} years old.`;
console.log(message); // "My name is test, I'm 18 years old."
```

### 2. 多行字符串

```javascript
// ES5
const html = '<div>' +
  '<h1>Title</h1>' +
  '<p>Content</p>' +
'</div>';

// ES6
const html = `
  <div>
    <h1>Title</h1>
    <p>Content</p>
  </div>
`;
```

### 3. 嵌入表达式

```javascript
const a = 10;
const b = 20;

const result = `${a} + ${b} = ${a + b}`;
console.log(result); // "10 + 20 = 30"

// 复杂表达式
const price = 99.99;
const quantity = 2;
const total = `Total: $${(price * quantity).toFixed(2)}`;
console.log(total); // "Total: $199.98"

// 调用函数
const greeting = `Hello, ${name.toUpperCase()}!`;
console.log(greeting); // "Hello, TEST!"
```

### 4. 嵌套模板字符串

```javascript
const name = 'test';
const age = 18;

const message = `Hello, ${`My name is ${name}, I'm ${age} years old.`}`;
console.log(message); // "Hello, My name is test, I'm 18 years old."
```

### 5. 标签模板

```javascript
function tag(strings, ...values) {
  console.log(strings); // ['Hello ', ', I am ', ' years old']
  console.log(values); // ['test', 18]
}

const name = 'test';
const age = 18;

tag`Hello ${name}, I am ${age} years old`;

// 实际应用：转义 HTML
function safeHtml(strings, ...values) {
  return strings.reduce((result, string, i) => {
    const value = values[i] || '';
    return result + string + value.replace(/</g, '&lt;');
  }, '');
}

const userInput = '<script>alert("XSS")</script>';
const html = safeHtml`<div>${userInput}</div>`;
console.log(html); // "<div>&lt;script&gt;alert("XSS")&lt;/script&gt;</div>"
```

### 6. 常用标签模板

```javascript
// 1. 原始字符串
const raw = String.raw`Hello\nWorld`;
console.log(raw); // "Hello\nWorld"（不是换行）

// 2. 多语言支持
function i18n(strings, ...values) {
  return strings.reduce((result, string, i) => {
    const value = values[i] || '';
    return result + string + (value ? translations[value] : value);
  }, '');
}

const translations = {
  hello: '你好',
  world: '世界'
};

const message = i18n`${'hello'} ${'world'}`;
console.log(message); // "你好 世界"
```

### 7. 与字符串方法的结合

```javascript
const name = 'test';

// toUpperCase()
const message = `Hello, ${name.toUpperCase()}!`;

// includes()
const text = `Hello, ${name}`;
console.log(text.includes('test')); // true

// repeat()
const separator = '-'.repeat(10);
console.log(separator); // "----------"
```

---

## 6. ES6 新增的字符串方法有哪些？

**答案：**

### 1. includes() - 判断是否包含

```javascript
const str = 'Hello World';

console.log(str.includes('Hello')); // true
console.log(str.includes('hello')); // false（区分大小写）
console.log(str.includes('World', 6)); // true（从第 6 个字符开始）
console.log(str.includes('World', 7)); // false
```

### 2. startsWith() - 判断是否以某个字符串开头

```javascript
const str = 'Hello World';

console.log(str.startsWith('Hello')); // true
console.log(str.startsWith('World')); // false
console.log(str.startsWith('World', 6)); // true（从第 6 个字符开始）
```

### 3. endsWith() - 判断是否以某个字符串结尾

```javascript
const str = 'Hello World';

console.log(str.endsWith('World')); // true
console.log(str.endsWith('Hello')); // false
console.log(str.endsWith('World', 11)); // true（只考虑前 11 个字符）
```

### 4. repeat() - 重复字符串

```javascript
const str = 'abc';

console.log(str.repeat(3)); // "abcabcabc"
console.log(str.repeat(0)); // ""
console.log(str.repeat(2.5)); // "abcabc"（向下取整）
console.log(str.repeat(-1)); // RangeError
```

### 5. padStart() - 从头部补全字符串

```javascript
const str = 'abc';

console.log(str.padStart(5, 'x')); // "xxabc"
console.log(str.padStart(5)); // "  abc"（默认用空格）
console.log(str.padStart(2)); // "abc"（原字符串长度大于目标长度）
console.log('1'.padStart(2, '0')); // "01"（数字补零）
```

### 6. padEnd() - 从尾部补全字符串

```javascript
const str = 'abc';

console.log(str.padEnd(5, 'x')); // "abcxx"
console.log(str.padEnd(5)); // "abc  "（默认用空格）
console.log(str.padEnd(2)); // "abc"（原字符串长度大于目标长度）
```

### 7. trimStart() / trimLeft() - 删除头部空格

```javascript
const str = '  Hello World  ';

console.log(str.trimStart()); // "Hello World  "
console.log(str.trimLeft()); // "Hello World  "
```

### 8. trimEnd() / trimRight() - 删除尾部空格

```javascript
const str = '  Hello World  ';

console.log(str.trimEnd()); // "  Hello World"
console.log(str.trimRight()); // "  Hello World"
```

### 9. 实际应用

```javascript
// 1. 格式化数字
const num = '123456789';
const formatted = num.padStart(15, '0');
console.log(formatted); // "00000123456789"

// 2. 对齐文本
const name = 'Alice';
const age = '25';
console.log(name.padEnd(10, ' ') + age.padStart(3, '0'));
// "Alice     025"

// 3. 隐藏手机号
const phone = '13812345678';
const masked = phone.slice(0, 3) + phone.slice(3, 7).padStart(7, '*') + phone.slice(7);
console.log(masked); // "138****5678"

// 4. 生成缩进
const indent = '  '.repeat(2);
const code = `${indent}function hello() {\n${indent}  console.log('hello');\n${indent}}`;
console.log(code);
```

---

## 7. ES6 的解构赋值有哪些用法？

**答案：**

### 1. 数组解构

```javascript
// 基本用法
const [a, b, c] = [1, 2, 3];
console.log(a, b, c); // 1 2 3

// 跳过某些值
const [first, , third] = [1, 2, 3];
console.log(first, third); // 1 3

// 剩余元素
const [head, ...tail] = [1, 2, 3, 4];
console.log(head); // 1
console.log(tail); // [2, 3, 4]

// 默认值
const [x = 1, y = 2] = [];
console.log(x, y); // 1 2

// 交换变量
let m = 1, n = 2;
[m, n] = [n, m];
console.log(m, n); // 2 1
```

### 2. 对象解构

```javascript
// 基本用法
const { name, age } = { name: 'test', age: 18 };
console.log(name, age); // 'test' 18

// 重命名
const { name: userName, age: userAge } = { name: 'test', age: 18 };
console.log(userName, userAge); // 'test' 18

// 默认值
const { x = 1, y = 2 } = {};
console.log(x, y); // 1 2

// 剩余属性
const { a, ...rest } = { a: 1, b: 2, c: 3 };
console.log(a); // 1
console.log(rest); // { b: 2, c: 3 }

// 嵌套解构
const user = {
  name: 'test',
  address: {
    city: 'Beijing',
    country: 'China'
  }
};
const { address: { city, country } } = user;
console.log(city, country); // 'Beijing' 'China'
```

### 3. 函数参数解构

```javascript
// 数组参数
function sum([a, b]) {
  return a + b;
}
console.log(sum([1, 2])); // 3

// 对象参数
function greet({ name, age }) {
  console.log(`Hello, ${name}. You are ${age} years old.`);
}
greet({ name: 'test', age: 18 });

// 默认值
function fn({ x = 1, y = 2 } = {}) {
  console.log(x, y);
}
fn(); // 1 2
fn({}); // 1 2
fn({ x: 10 }); // 10 2
```

### 4. 字符串解构

```javascript
const [a, b, c] = 'abc';
console.log(a, b, c); // 'a' 'b' 'c'
```

### 5. 数值和布尔值解构

```javascript
// 数值
const { toString: s } = 123;
console.log(s === Number.prototype.toString); // true

// 布尔值
const { valueOf: v } = true;
console.log(v === Boolean.prototype.valueOf); // true
```

### 6. 实际应用

```javascript
// 1. 交换变量
let a = 1, b = 2;
[a, b] = [b, a];

// 2. 从函数返回多个值
function getUser() {
  return ['test', 18, 'Beijing'];
}
const [name, age, city] = getUser();

// 3. 提取 JSON 数据
const response = {
  data: {
    user: {
      name: 'test',
      age: 18
    }
  }
};
const { data: { user } } = response;

// 4. 函数参数默认值
function createElement({ tag = 'div', content = '' } = {}) {
  const element = document.createElement(tag);
  element.textContent = content;
  return element;
}

// 5. 遍历 Map
const map = new Map([
  ['name', 'test'],
  ['age', 18]
]);
for (const [key, value] of map) {
  console.log(key, value);
}
```

---

## 8. ES6 的扩展运算符有哪些用法？

**答案：**

### 1. 数组扩展运算符

```javascript
// 1.1 复制数组
const arr1 = [1, 2, 3];
const arr2 = [...arr1];
console.log(arr2); // [1, 2, 3]

// 1.2 合并数组
const arr3 = [1, 2];
const arr4 = [3, 4];
const arr5 = [...arr3, ...arr4];
console.log(arr5); // [1, 2, 3, 4]

// 1.3 转换为参数序列
function add(a, b, c) {
  return a + b + c;
}
const nums = [1, 2, 3];
console.log(add(...nums)); // 6

// 1.4 字符串转数组
const str = 'hello';
const chars = [...str];
console.log(chars); // ['h', 'e', 'l', 'l', 'o']

// 1.5 类数组转数组
function fn() {
  const args = [...arguments];
  console.log(args);
}
fn(1, 2, 3); // [1, 2, 3]
```

### 2. 对象扩展运算符

```javascript
// 2.1 复制对象
const obj1 = { name: 'test', age: 18 };
const obj2 = { ...obj1 };
console.log(obj2); // { name: 'test', age: 18 }

// 2.2 合并对象
const obj3 = { name: 'test' };
const obj4 = { age: 18 };
const obj5 = { ...obj3, ...obj4 };
console.log(obj5); // { name: 'test', age: 18 }

// 2.3 添加属性
const obj6 = { ...obj1, city: 'Beijing' };
console.log(obj6); // { name: 'test', age: 18, city: 'Beijing' }

// 2.4 覆盖属性
const obj7 = { ...obj1, age: 20 };
console.log(obj7); // { name: 'test', age: 20 }

// 2.5 浅拷贝
const original = { name: 'test', info: { age: 18 } };
const copy = { ...original };
copy.info.age = 20;
console.log(original.info.age); // 20（原对象也被修改）
```

### 3. 函数参数

```javascript
// 3.1 剩余参数
function sum(...args) {
  return args.reduce((acc, val) => acc + val, 0);
}
console.log(sum(1, 2, 3)); // 6

// 3.2 解构 + 剩余参数
function fn(first, ...rest) {
  console.log(first); // 1
  console.log(rest); // [2, 3, 4]
}
fn(1, 2, 3, 4);
```

### 4. 实际应用

```javascript
// 4.1 数组去重
const arr = [1, 2, 2, 3, 3, 4];
const unique = [...new Set(arr)];
console.log(unique); // [1, 2, 3, 4]

// 4.2 求数组最大值
const nums = [1, 5, 3, 8, 2];
const max = Math.max(...nums);
console.log(max); // 8

// 4.3 React 组件传递 props
function Button({ ...props }) {
  return <button {...props}>Click me</button>;
}

// 4.4 Redux combineReducers
const rootReducer = combineReducers({
  user: userReducer,
  posts: postsReducer,
  ...otherReducers
});

// 4.5 对象不可变更新
const state = {
  user: { name: 'test', age: 18 }
};
const newState = {
  ...state,
  user: {
    ...state.user,
    age: 20
  }
};
```

---

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

## 10. ES6 的 Promise 是什么？

**答案：**

### Promise 简介

Promise 是异步编程的一种解决方案，比传统的解决方案（回调函数和事件）更合理和更强大。

### 基本用法

```javascript
// 1. 创建 Promise
const promise = new Promise((resolve, reject) => {
  // 异步操作
  setTimeout(() => {
    const success = true;

    if (success) {
      resolve('操作成功');
    } else {
      reject('操作失败');
    }
  }, 1000);
});

// 2. 使用 Promise
promise
  .then(result => {
    console.log(result); // '操作成功'
  })
  .catch(error => {
    console.error(error); // '操作失败'
  })
  .finally(() => {
    console.log('无论成功或失败都会执行');
  });
```

### Promise 状态

Promise 有三种状态：

1. **pending**：进行中
2. **fulfilled**：已成功
3. **rejected**：已失败

状态只能从 pending 变为 fulfilled 或 rejected，一旦改变就不会再变。

### Promise 方法

```javascript
// 1. Promise.all - 所有 Promise 都成功才成功
const p1 = Promise.resolve(1);
const p2 = Promise.resolve(2);
const p3 = Promise.resolve(3);

Promise.all([p1, p2, p3]).then(values => {
  console.log(values); // [1, 2, 3]
});

// 2. Promise.race - 最先完成的 Promise 的结果
const p4 = new Promise(resolve => setTimeout(() => resolve(1), 100));
const p5 = new Promise(resolve => setTimeout(() => resolve(2), 200));

Promise.race([p4, p5]).then(value => {
  console.log(value); // 1
});

// 3. Promise.allSettled - 所有 Promise 都完成
const p6 = Promise.resolve(1);
const p7 = Promise.reject(2);

Promise.allSettled([p6, p7]).then(results => {
  console.log(results);
  // [
  //   { status: 'fulfilled', value: 1 },
  //   { status: 'rejected', reason: 2 }
  // ]
});

// 4. Promise.any - 任意一个 Promise 成功就成功
const p8 = Promise.reject(1);
const p9 = Promise.resolve(2);

Promise.any([p8, p9]).then(value => {
  console.log(value); // 2
});
```

### Promise 链式调用

```javascript
// 链式调用
fetch('/api/user')
  .then(response => response.json())
  .then(data => {
    console.log(data);
    return fetch(`/api/user/${data.id}`);
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error(error);
  });
```

### Promise 错误处理

```javascript
// 1. catch 捕获错误
Promise.resolve()
  .then(() => {
    throw new Error('出错了');
  })
  .catch(error => {
    console.error(error); // Error: 出错了
  });

// 2. then 第二个参数捕获错误
Promise.resolve()
  .then(
    () => {
      throw new Error('出错了');
    },
    error => {
      console.error(error); // Error: 出错了
    }
  );

// 3. 错误会向后传递
Promise.resolve()
  .then(() => {
    throw new Error('错误1');
  })
  .then(() => {
    console.log('不会执行');
  })
  .catch(error => {
    console.error(error); // Error: 错误1
  });
```

---

## 11. async/await 是什么？

**答案：**

### async/await 简介

async/await 是 ES2017 引入的异步编程解决方案，它是 Promise 的语法糖，使异步代码看起来像同步代码。

### 基本用法

```javascript
// 1. async 函数
async function fn() {
  return 'hello';
}

fn().then(result => {
  console.log(result); // 'hello'
});

// 2. await 等待 Promise
function getData() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('data');
    }, 1000);
  });
}

async function main() {
  const result = await getData();
  console.log(result); // 'data'
}

main();

// 3. 错误处理
async function main2() {
  try {
    const result = await getData();
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}
```

### async/await vs Promise

```javascript
// Promise
function getUser() {
  return fetch('/api/user')
    .then(response => response.json())
    .then(data => {
      return fetch(`/api/user/${data.id}`);
    })
    .then(response => response.json())
    .catch(error => {
      console.error(error);
    });
}

// async/await
async function getUser() {
  try {
    const response = await fetch('/api/user');
    const user = await response.json();
    const response2 = await fetch(`/api/user/${user.id}`);
    const data = await response2.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}
```

### 并发请求

```javascript
// 1. 顺序执行
async function fetchAll() {
  const user = await fetch('/api/user').then(r => r.json());
  const posts = await fetch('/api/posts').then(r => r.json());
  const comments = await fetch('/api/comments').then(r => r.json());
  return { user, posts, comments };
}

// 2. 并发执行
async function fetchAll() {
  const [user, posts, comments] = await Promise.all([
    fetch('/api/user').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/comments').then(r => r.json())
  ]);
  return { user, posts, comments };
}
```

### 注意事项

```javascript
// 1. await 必须在 async 函数中使用
function fn() {
  const result = await Promise.resolve(1); // SyntaxError
}

// 2. 顶层 await（ES2022）
const result = await Promise.resolve(1); // 需要在模块中使用

// 3. 错误处理
async function fn() {
  const result = await Promise.reject('error'); // UnhandledPromiseRejectionWarning
}

// 正确做法
async function fn() {
  try {
    const result = await Promise.reject('error');
  } catch (error) {
    console.error(error);
  }
}
```

---

## 12. ES6 的 Class 是什么？

**答案：**

### Class 简介

ES6 的 Class 是语法糖，本质上是 ES5 构造函数的另一种写法。

### 基本用法

```javascript
// ES5
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.sayHello = function() {
  console.log(`Hello, ${this.name}`);
};

const p1 = new Person('test', 18);

// ES6
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  sayHello() {
    console.log(`Hello, ${this.name}`);
  }
}

const p2 = new Person('test', 18);
```

### 继承

```javascript
// ES5
function Animal(name) {
  this.name = name;
}

Animal.prototype.say = function() {
  console.log(`I am ${this.name}`);
};

function Dog(name, breed) {
  Animal.call(this, name);
  this.breed = breed;
}

Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
  console.log('Woof!');
};

// ES6
class Animal {
  constructor(name) {
    this.name = name;
  }

  say() {
    console.log(`I am ${this.name}`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }

  bark() {
    console.log('Woof!');
  }
}
```

### 静态方法

```javascript
class MathUtil {
  static add(a, b) {
    return a + b;
  }

  static multiply(a, b) {
    return a * b;
  }
}

console.log(MathUtil.add(1, 2)); // 3
console.log(MathUtil.multiply(3, 4)); // 12
```

### 私有属性（ES2022）

```javascript
class Person {
  #name;
  #age;

  constructor(name, age) {
    this.#name = name;
    this.#age = age;
  }

  getName() {
    return this.#name;
  }

  getAge() {
    return this.#age;
  }
}

const p = new Person('test', 18);
console.log(p.getName()); // 'test'
console.log(p.#name); // SyntaxError: Private field '#name' must be declared in an enclosing class
```

### Getter 和 Setter

```javascript
class Person {
  constructor(name) {
    this._name = name;
  }

  get name() {
    return this._name;
  }

  set name(value) {
    if (value.length < 3) {
      throw new Error('Name too short');
    }
    this._name = value;
  }
}

const p = new Person('test');
console.log(p.name); // 'test'
p.name = 'new name';
console.log(p.name); // 'new name'
```

---

## 13. ES6 的模块化是什么？

**答案：**

### 模块化简介

ES6 模块化是 JavaScript 官方的模块化方案，取代了 CommonJS 和 AMD。

### 导出（export）

```javascript
// 1. 命名导出
export const name = 'test';
export const age = 18;

export function add(a, b) {
  return a + b;
}

export class Person {
  constructor(name) {
    this.name = name;
  }
}

// 2. 默认导出
export default function() {
  console.log('hello');
}

// 3. 混合导出
export const PI = 3.14159;
export default class Calculator {
  add(a, b) {
    return a + b;
  }
}

// 4. 导出多个
const a = 1;
const b = 2;
export { a, b };

// 5. 重命名导出
export { a as x, b as y };
```

### 导入（import）

```javascript
// 1. 导入单个
import { name, age } from './module.js';

// 2. 导入多个
import { name, age, add } from './module.js';

// 3. 导入默认
import myFunction from './module.js';

// 4. 导入所有
import * as module from './module.js';

// 5. 重命名导入
import { name as userName } from './module.js';

// 6. 只导入
import './module.js';
```

### 动态导入

```javascript
// 动态导入返回 Promise
import('./module.js').then(module => {
  console.log(module);
});

// async/await
async function loadModule() {
  const module = await import('./module.js');
  console.log(module);
}
```

### ES6 模块 vs CommonJS

| 特性 | ES6 模块 | CommonJS |
|------|----------|----------|
| 导入 | import | require |
| 导出 | export | module.exports |
| 加载方式 | 编译时加载 | 运行时加载 |
| 顶层 this | undefined | global |
| 静态分析 | 支持 | 不支持 |
| 循环依赖 | 支持 | 支持 |
| 浏览器支持 | 需要编译 | 不支持 |

---

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

## 17. ES6 的 Iterator 和 Generator 是什么？

**答案：**

### Iterator 简介

Iterator 是一种接口，为各种不同的数据结构提供统一的访问机制。

### 基本用法

```javascript
// 1. 创建 Iterator
function makeIterator(array) {
  let nextIndex = 0;
  return {
    next() {
      return nextIndex < array.length
        ? { value: array[nextIndex++], done: false }
        : { value: undefined, done: true };
    }
  };
}

const it = makeIterator(['a', 'b', 'c']);
console.log(it.next()); // { value: 'a', done: false }
console.log(it.next()); // { value: 'b', done: false }
console.log(it.next()); // { value: 'c', done: false }
console.log(it.next()); // { value: undefined, done: true }

// 2. 默认 Iterator 接口
const arr = ['a', 'b', 'c'];
const iterator = arr[Symbol.iterator]();
console.log(iterator.next()); // { value: 'a', done: false }

// 3. for...of 循环
const arr2 = ['a', 'b', 'c'];
for (let item of arr2) {
  console.log(item); // 'a' 'b' 'c'
}
```

### Generator 简介

Generator 是 ES6 提供的一种异步编程解决方案，语法行为与传统函数完全不同。

### 基本用法

```javascript
// 1. 定义 Generator
function* helloWorldGenerator() {
  yield 'hello';
  yield 'world';
  return 'ending';
}

const hw = helloWorldGenerator();
console.log(hw.next()); // { value: 'hello', done: false }
console.log(hw.next()); // { value: 'world', done: false }
console.log(hw.next()); // { value: 'ending', done: true }
console.log(hw.next()); // { value: undefined, done: true }

// 2. yield 表达式
function* foo(x) {
  const y = 2 * (yield (x + 1));
  const z = yield (y / 3);
  return (x + y + z);
}

const it = foo(5);
console.log(it.next()); // { value: 6, done: false }
console.log(it.next(12)); // { value: 8, done: false }
console.log(it.next(13)); // { value: 42, done: true }

// 3. for...of 遍历 Generator
function* numbers() {
  yield 1;
  yield 2;
  yield 3;
  return 4;
}

for (let n of numbers()) {
  console.log(n); // 1 2 3
}

// 4. Generator.prototype.return()
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

const g = gen();
console.log(g.next()); // { value: 1, done: false }
console.log(g.return('foo')); // { value: 'foo', done: true }
console.log(g.next()); // { value: undefined, done: true }

// 5. Generator.prototype.throw()
function* gen2() {
  try {
    yield 1;
    yield 2;
    yield 3;
  } catch (e) {
    console.log('内部捕获', e);
  }
}

const g2 = gen2();
g2.next(); // { value: 1, done: false }
g2.throw('a'); // 内部捕获 a
g2.next(); // { value: undefined, done: true }
```

### 实际应用

```javascript
// 1. 异步操作同步化表达
function* main() {
  try {
    const data = yield fetch('/api/data');
    const result = yield data.json();
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

function run(fn) {
  const gen = fn();

  function step(nextF) {
    let next;
    try {
      next = nextF();
    } catch (e) {
      return gen.throw(e);
    }

    if (next.done) {
      return next.value;
    }

    Promise.resolve(next.value).then(
      v => step(() => gen.next(v)),
      e => step(() => gen.throw(e))
    );
  }

  step(() => gen.next());
}

run(main);

// 2. 部署 Iterator 接口
function* objectEntries(obj) {
  const propKeys = Reflect.ownKeys(obj);

  for (const propKey of propKeys) {
    yield [propKey, obj[propKey]];
  }
}

const jane = { first: 'Jane', last: 'Doe' };
for (const [key, value] of objectEntries(jane)) {
  console.log(`${key}: ${value}`); // first: Jane, last: Doe
}

// 3. 状态机
function* clock() {
  while (true) {
    console.log('Tick!');
    yield;
    console.log('Tock!');
    yield;
  }
}

const c = clock();
c.next(); // Tick!
c.next(); // Tock!
c.next(); // Tick!
```

---

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

## 20. ES6 的 Number 新增方法有哪些？

**答案：**

### 1. Number.isFinite()

判断是否为有限数值：

```javascript
console.log(Number.isFinite(15)); // true
console.log(Number.isFinite(0.8)); // true
console.log(Number.isFinite(NaN)); // false
console.log(Number.isFinite(Infinity)); // false
console.log(Number.isFinite(-Infinity)); // false
console.log(Number.isFinite('foo')); // false
console.log(Number.isFinite('15')); // false
console.log(Number.isFinite(true)); // false
```

### 2. Number.isNaN()

判断是否为 NaN：

```javascript
console.log(Number.isNaN(NaN)); // true
console.log(Number.isNaN(15)); // false
console.log(Number.isNaN('15')); // false
console.log(Number.isNaN(true)); // false
console.log(Number.isNaN(9 / NaN)); // true
console.log(Number.isNaN('true' / 0)); // true
console.log(Number.isNaN('true' / 'true')); // true
```

### 3. Number.parseInt()

解析字符串为整数：

```javascript
console.log(Number.parseInt('12.34')); // 12
console.log(Number.parseInt('012')); // 12
console.log(Number.parseInt('0o10')); // 0
console.log(Number.parseInt('0x10')); // 0
```

### 4. Number.parseFloat()

解析字符串为浮点数：

```javascript
console.log(Number.parseFloat('12.34')); // 12.34
console.log(Number.parseFloat('12.34abc')); // 12.34
```

### 5. Number.isInteger()

判断是否为整数：

```javascript
console.log(Number.isInteger(25)); // true
console.log(Number.isInteger(25.0)); // true
console.log(Number.isInteger(25.1)); // false
console.log(Number.isInteger('15')); // false
console.log(Number.isInteger(true)); // false
```

### 6. Number.EPSILON

表示 1 与大于 1 的最小浮点数之间的差：

```javascript
console.log(0.1 + 0.2 === 0.3); // false
console.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON); // true

function withinErrorMargin(left, right) {
  return Math.abs(left - right) < Number.EPSILON * Math.pow(2, 2);
}

console.log(withinErrorMargin(0.1 + 0.2, 0.3)); // true
```

### 7. Number.isSafeInteger()

判断是否为安全整数（-(2^53 - 1) 到 2^53 - 1）：

```javascript
console.log(Number.isSafeInteger(3)); // true
console.log(Number.isSafeInteger(9007199254740992)); // false
console.log(Number.isSafeInteger(9007199254740993)); // false
```

---

## 总结

ES6 是 JavaScript 的一次重大更新，引入了许多新特性和改进，包括：

1. **let 和 const**：块级作用域变量声明
2. **箭头函数**：更简洁的函数语法
3. **模板字符串**：更强大的字符串处理
4. **解构赋值**：从数组或对象中提取值
5. **扩展运算符**：展开数组和对象
6. **Set 和 Map**：新的数据结构
7. **Promise**：异步编程解决方案
8. **async/await**：Promise 的语法糖
9. **Class**：面向对象编程语法糖
10. **模块化**：官方模块化方案
11. **Symbol**：独一无二的值
12. **Proxy**：拦截和自定义操作
13. **Reflect**：与 Proxy 配合使用
14. **Iterator 和 Generator**：迭代器和生成器
15. **新增方法**：Object、Array、Number 等新增方法

掌握 ES6 特性对于现代 JavaScript 开发至关重要，能够提高代码质量和开发效率。