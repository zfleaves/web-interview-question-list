# JavaScript 面试题集锦（截止 2025 年底）

## 目录
1. [JavaScript 基础](#javascript-基础)
2. [ES6+ 新特性](#es6-新特性)
3. [异步编程](#异步编程)
4. [原型与继承](#原型与继承)
5. [闭包与作用域](#闭包与作用域)
6. [this 指向](#this-指向)
7. [事件循环](#事件循环)
8. [函数与高阶函数](#函数与高阶函数)
9. [数组与对象](#数组与对象)
10. [性能优化](#性能优化)
11. [场景题](#场景题)

---

## JavaScript 基础

### 1. JavaScript 的数据类型有哪些？

**答案：**

**基本数据类型（7种）：**
- `undefined`：未定义
- `null`：空值
- `boolean`：布尔值
- `number`：数字
- `string`：字符串
- `symbol`：符号（ES6）
- `bigint`：大整数（ES2020）

**引用数据类型（1种）：**
- `object`：对象（包括 Array、Function、Date、RegExp 等）

**类型检测：**

```javascript
// 1. typeof
typeof undefined; // "undefined"
typeof null; // "object" (历史遗留问题)
typeof true; // "boolean"
typeof 42; // "number"
typeof "hello"; // "string"
typeof Symbol(); // "symbol"
typeof 123n; // "bigint"
typeof {}; // "object"
typeof []; // "object"
typeof function(){}; // "function"

// 2. instanceof
[] instanceof Array; // true
{} instanceof Object; // true

// 3. Object.prototype.toString.call（最准确）
Object.prototype.toString.call([]); // "[object Array]"
Object.prototype.toString.call({}); // "[object Object]"
Object.prototype.toString.call(null); // "[object Null]"
Object.prototype.toString.call(undefined); // "[object Undefined]"

// 4. Array.isArray
Array.isArray([]); // true
Array.isArray({}); // false
```

**场景题：**

```javascript
// 场景 1：判断一个值是否为对象
function isObject(value) {
  return value !== null && (typeof value === 'object' || typeof value === 'function');
}

isObject({}); // true
isObject([]); // true
isObject(null); // false
isObject(() => {}); // true

// 场景 2：深拷贝时判断类型
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  const result = Array.isArray(obj) ? [] : {};
  
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = deepClone(obj[key]);
    }
  }
  
  return result;
}

// 场景 3：类型安全的函数参数
function greet(name) {
  if (typeof name !== 'string') {
    throw new TypeError('name must be a string');
  }
  console.log(`Hello, ${name}!`);
}
```

---

### 2. null 和 undefined 的区别是什么？

**答案：**

**区别：**

```javascript
// 1. 含义不同
undefined: 变量声明但未赋值
null: 表示"空"或"无"的对象

// 2. 类型不同
typeof undefined; // "undefined"
typeof null; // "object"

// 3. 转换为数字
Number(undefined); // NaN
Number(null); // 0

// 4. 相等性比较
undefined == null; // true
undefined === null; // false
```

**最佳实践：**

```javascript
// 1. 判断变量是否为空
function isEmpty(value) {
  return value === null || value === undefined;
}

// 2. 可选链操作符
const user = {
  profile: {
    name: 'John'
  }
};

// ❌ 错误方式
const age = user.profile.age; // undefined，如果 profile 不存在会报错

// ✅ 正确方式
const age = user.profile?.age; // undefined

// 3. 空值合并运算符
const name = user.name ?? 'Guest'; // 如果 name 为 null 或 undefined，使用 'Guest'

// 4. 默认参数
function greet(name = 'Guest') {
  console.log(`Hello, ${name}!`);
}

greet(); // "Hello, Guest!"
greet(null); // "Hello, null!" (null 不是 undefined)
greet(undefined); // "Hello, Guest!"
```

**场景题：**

```javascript
// 场景 1：API 响应处理
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  const user = await response.json();
  
  // 如果用户不存在，返回 null
  return user || null;
}

// 使用
const user = await fetchUser(1);
if (user !== null) {
  console.log(user.name);
}

// 场景 2：配置对象
function createConfig(options = {}) {
  return {
    timeout: options.timeout ?? 5000,
    retries: options.retries ?? 3,
    // null 表示禁用该功能
    enableCache: options.enableCache ?? true
  };
}

createConfig({ enableCache: null }); // enableCache 为 null（禁用）
createConfig({}); // enableCache 为 true（默认）

// 场景 3：表单验证
function validateForm(data) {
  const errors = {};
  
  if (data.email === null || data.email === undefined) {
    errors.email = 'Email is required';
  }
  
  if (data.age === null || data.age === undefined) {
    errors.age = 'Age is required';
  }
  
  return Object.keys(errors).length === 0 ? null : errors;
}
```

---

### 3. == 和 === 的区别是什么？

**答案：**

**区别：**

```javascript
// ==：抽象相等（类型转换后比较）
// ===：严格相等（不转换类型，直接比较）

// 1. 类型不同时的比较
5 == '5'; // true (字符串转换为数字)
5 === '5'; // false

// 2. null 和 undefined
null == undefined; // true
null === undefined; // false

// 3. 布尔值
true == 1; // true
true === 1; // false
false == 0; // true
false === 0; // false

// 4. 对象
{} == {}; // false
{} === {}; // false
[] == []; // false
[] === []; // false

// 5. 特殊情况
0 == ''; // true (空字符串转换为 0)
0 == '0'; // true
0 == false; // true
1 == true; // true
```

**类型转换规则：**

```javascript
// 1. 字符串和数字比较
'5' == 5; // true (字符串转换为数字)

// 2. 布尔值和其他类型比较
true == 1; // true (布尔值转换为数字)
false == 0; // true
true == '1'; // true

// 3. null 和 undefined
null == undefined; // true
null == 0; // false
undefined == 0; // false

// 4. 对象和原始类型比较
[1] == 1; // true (数组转换为字符串 "1"，再转换为数字 1)
[1, 2] == '1,2'; // true
```

**场景题：**

```javascript
// 场景 1：条件判断
// ❌ 不推荐：使用 ==
if (value == 0) {
  // value 为 0、'0'、false、''、[] 时都会执行
}

// ✅ 推荐：使用 ===
if (value === 0) {
  // 只有 value 为 0 时才执行
}

// 场景 2：检查变量是否存在
// ❌ 不推荐
if (value == null) {
  // value 为 null 或 undefined 时执行
}

// ✅ 推荐
if (value === null || value === undefined) {
  // 更明确
}

// 场景 3：数组判断
// ❌ 错误
if (arr == []) {
  // 永远不会为 true
}

// ✅ 正确
if (arr.length === 0) {
  // 数组为空
}

// 场景 4：对象判断
// ❌ 错误
if (obj == {}) {
  // 永远不会为 true
}

// ✅ 正确
if (Object.keys(obj).length === 0) {
  // 对象为空
}

// 场景 5：类型安全的比较函数
function strictEqual(a, b) {
  return a === b;
}

function looseEqual(a, b) {
  return a == b;
}

// 使用场景
const userInput = '5';
if (strictEqual(userInput, 5)) {
  // 不会执行
}

if (looseEqual(userInput, 5)) {
  // 会执行（字符串 '5' 转换为数字 5）
}
```

---

### 4. 什么是闭包？闭包的使用场景有哪些？

**答案：**

**闭包定义：**

闭包是指函数能够访问其词法作用域外的变量，即使该函数在其词法作用域之外执行。

```javascript
// 基本示例
function outer() {
  const outerVar = 'I am from outer';
  
  function inner() {
    console.log(outerVar); // 访问外部变量
  }
  
  return inner;
}

const closure = outer();
closure(); // "I am from outer"
```

**闭包的特点：**

```javascript
// 1. 函数嵌套函数
function createCounter() {
  let count = 0;
  
  return {
    increment: function() {
      count++;
      console.log(count);
    },
    decrement: function() {
      count--;
      console.log(count);
    },
    getCount: function() {
      return count;
    }
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.decrement(); // 1
console.log(counter.getCount()); // 1

// 2. 外部函数返回内部函数
function createGreeter(greeting) {
  return function(name) {
    console.log(`${greeting}, ${name}!`);
  };
}

const greetHello = createGreeter('Hello');
const greetHi = createGreeter('Hi');

greetHello('Alice'); // "Hello, Alice!"
greetHi('Bob'); // "Hi, Bob!"

// 3. 内部函数引用外部函数的变量
function createMultiplier(factor) {
  return function(number) {
    return number * factor;
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15
```

**使用场景：**

```javascript
// 1. 数据私有化（模块模式）
const module = (function() {
  let privateVar = 0;
  
  return {
    getPrivateVar: function() {
      return privateVar;
    },
    setPrivateVar: function(value) {
      privateVar = value;
    },
    increment: function() {
      privateVar++;
    }
  };
})();

console.log(module.getPrivateVar()); // 0
module.setPrivateVar(10);
console.log(module.getPrivateVar()); // 10
module.increment();
console.log(module.getPrivateVar()); // 11

// 2. 函数柯里化
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...moreArgs) {
      return curried.apply(this, args.concat(moreArgs));
    };
  };
}

function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAdd(1, 2)(3)); // 6

// 3. 防抖和节流
function debounce(func, delay) {
  let timeoutId;
  
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function throttle(func, delay) {
  let lastCall = 0;
  
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      func.apply(this, args);
      lastCall = now;
    }
  };
}

// 使用
const debouncedSearch = debounce(function(query) {
  console.log('Searching for:', query);
}, 300);

const throttledScroll = throttle(function() {
  console.log('Scrolling...');
}, 100);

// 4. 单例模式
function createSingleton() {
  let instance;
  
  return {
    getInstance: function() {
      if (!instance) {
        instance = {
          data: 'Singleton data'
        };
      }
      return instance;
    }
  };
}

const singleton = createSingleton();
const instance1 = singleton.getInstance();
const instance2 = singleton.getInstance();

console.log(instance1 === instance2); // true

// 5. 事件处理器
function setupButton(buttonId) {
  const button = document.getElementById(buttonId);
  let clickCount = 0;
  
  button.addEventListener('click', function() {
    clickCount++;
    console.log(`Button clicked ${clickCount} times`);
  });
}

// 6. 异步操作
function fetchData(url) {
  let cache = null;
  
  return async function() {
    if (cache) {
      return cache;
    }
    
    const response = await fetch(url);
    cache = await response.json();
    return cache;
  };
}

const getUserData = fetchData('/api/user');
const data1 = await getUserData(); // 发起请求
const data2 = await getUserData(); // 使用缓存
```

**场景题：**

```javascript
// 场景 1：实现私有变量
function Person(name) {
  let _name = name; // 私有变量
  
  return {
    getName: function() {
      return _name;
    },
    setName: function(newName) {
      _name = newName;
    }
  };
}

const person = Person('Alice');
console.log(person.getName()); // "Alice"
person.setName('Bob');
console.log(person.getName()); // "Bob"
console.log(person._name); // undefined (无法直接访问)

// 场景 2：状态管理
function createStore(reducer, initialState) {
  let state = initialState;
  const listeners = [];
  
  return {
    getState: function() {
      return state;
    },
    dispatch: function(action) {
      state = reducer(state, action);
      listeners.forEach(listener => listener());
    },
    subscribe: function(listener) {
      listeners.push(listener);
      return function() {
        const index = listeners.indexOf(listener);
        listeners.splice(index, 1);
      };
    }
  };
}

// 使用
const store = createStore(function(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    default:
      return state;
  }
}, { count: 0 });

store.subscribe(function() {
  console.log('State changed:', store.getState());
});

store.dispatch({ type: 'INCREMENT' }); // State changed: { count: 1 }

// 场景 3：函数工厂
function createValidator(rules) {
  return function(value) {
    const errors = [];
    
    for (const rule of rules) {
      if (!rule.test(value)) {
        errors.push(rule.message);
      }
    }
    
    return errors.length === 0 ? null : errors;
  };
}

const emailValidator = createValidator([
  { test: v => v.includes('@'), message: 'Must contain @' },
  { test: v => v.includes('.'), message: 'Must contain .' }
]);

console.log(emailValidator('test@example.com')); // null
console.log(emailValidator('invalid')); // ['Must contain @', 'Must contain .']
```

---

### 5. 什么是原型链？如何理解原型继承？

**答案：**

**原型概念：**

每个 JavaScript 对象都有一个内部属性 `[[Prototype]]`（可以通过 `__proto__` 访问），指向它的原型对象。

```javascript
// 1. 原型链
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}`);
};

const person = new Person('Alice');

// 原型链
person.__proto__ === Person.prototype; // true
Person.prototype.__proto__ === Object.prototype; // true
Object.prototype.__proto__ === null; // true

// 2. 属性查找
person.sayHello(); // 在 Person.prototype 中找到
person.toString(); // 在 Object.prototype 中找到
person.nonExistentMethod(); // 沿着原型链找不到，报错
```

**原型继承：**

```javascript
// 1. 原型链继承
function Animal(name) {
  this.name = name;
}

Animal.prototype.eat = function() {
  console.log(`${this.name} is eating`);
};

function Dog(name, breed) {
  Animal.call(this, name); // 调用父类构造函数
  this.breed = breed;
}

// 设置原型链
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
  console.log(`${this.name} is barking`);
};

const dog = new Dog('Buddy', 'Golden Retriever');
dog.eat(); // "Buddy is eating"
dog.bark(); // "Buddy is barking"

// 2. ES6 类继承
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  eat() {
    console.log(`${this.name} is eating`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }
  
  bark() {
    console.log(`${this.name} is barking`);
  }
}

const dog = new Dog('Buddy', 'Golden Retriever');
dog.eat(); // "Buddy is eating"
dog.bark(); // "Buddy is barking"
```

**原型链图解：**

```
person
  └── __proto__ → Person.prototype
                    └── __proto__ → Object.prototype
                                      └── __proto__ → null
```

**场景题：**

```javascript
// 场景 1：实现继承
function Shape(color) {
  this.color = color;
}

Shape.prototype.getArea = function() {
  return 0;
};

function Rectangle(color, width, height) {
  Shape.call(this, color);
  this.width = width;
  this.height = height;
}

Rectangle.prototype = Object.create(Shape.prototype);
Rectangle.prototype.constructor = Rectangle;

Rectangle.prototype.getArea = function() {
  return this.width * this.height;
};

const rect = new Rectangle('red', 10, 5);
console.log(rect.getArea()); // 50
console.log(rect.color); // "red"

// 场景 2：方法扩展
Array.prototype.sum = function() {
  return this.reduce((sum, num) => sum + num, 0);
};

console.log([1, 2, 3, 4, 5].sum()); // 15

// 场景 3：检查原型链
function isPrototypeOf(obj, prototype) {
  let proto = Object.getPrototypeOf(obj);
  
  while (proto) {
    if (proto === prototype) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }
  
  return false;
}

console.log(isPrototypeOf([], Array.prototype)); // true
console.log(isPrototypeOf([], Object.prototype)); // true

// 场景 4：实现 instanceof
function myInstanceof(left, right) {
  let prototype = right.prototype;
  left = left.__proto__;
  
  while (true) {
    if (left === null || left === undefined) {
      return false;
    }
    if (left === prototype) {
      return true;
    }
    left = left.__proto__;
  }
}

console.log(myInstanceof([], Array)); // true
console.log(myInstanceof([], Object)); // true
```

---

## ES6+ 新特性

### 6. let、const 和 var 的区别是什么？

**答案：**

**区别对比：**

```javascript
// 1. 作用域
// var: 函数作用域
function testVar() {
  if (true) {
    var x = 10;
  }
  console.log(x); // 10
}

// let/const: 块级作用域
function testLet() {
  if (true) {
    let y = 10;
  }
  console.log(y); // ReferenceError
}

// 2. 变量提升
console.log(a); // undefined (var 声明提升)
var a = 10;

console.log(b); // ReferenceError (let 不提升)
let b = 20;

console.log(c); // ReferenceError (const 不提升)
const c = 30;

// 3. 重复声明
var d = 10;
var d = 20; // ✅ 允许

let e = 10;
let e = 20; // ❌ SyntaxError

const f = 10;
const f = 20; // ❌ SyntaxError

// 4. 重新赋值
let g = 10;
g = 20; // ✅ 允许

const h = 10;
h = 20; // ❌ TypeError

// 5. 暂时性死区（TDZ）
console.log(i); // ReferenceError
let i = 10;

// 6. 全局对象属性
var j = 10;
console.log(window.j); // 10

let k = 10;
console.log(window.k); // undefined
```

**最佳实践：**

```javascript
// 1. 优先使用 const
const PI = 3.14159;
const MAX_SIZE = 100;

// 2. 需要重新赋值时使用 let
let count = 0;
count++;

// 3. 避免使用 var
// ❌ 不推荐
for (var i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 100); // 5 5 5 5 5
}

// ✅ 推荐
for (let i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 100); // 0 1 2 3 4
}
```

**场景题：**

```javascript
// 场景 1：循环中的闭包
// ❌ 使用 var
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 3 3 3
}

// ✅ 使用 let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 0 1 2
}

// ✅ 使用 IIFE
for (var i = 0; i < 3; i++) {
  (function(i) {
    setTimeout(() => console.log(i), 100); // 0 1 2
  })(i);
}

// 场景 2：配置对象
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3
};

// config.apiUrl = 'https://new-api.example.com'; // ❌ 不应该修改

// 场景 3：状态管理
let state = {
  count: 0,
  items: []
};

function setState(newState) {
  state = { ...state, ...newState };
}

setState({ count: 1 });
console.log(state); // { count: 1, items: [] }
```

---

### 7. 箭头函数和普通函数的区别是什么？

**答案：**

**区别：**

```javascript
// 1. this 指向
const obj = {
  name: 'Alice',
  
  // 普通函数：this 指向调用者
  regular: function() {
    console.log(this.name);
  },
  
  // 箭头函数：this 继承外层作用域
  arrow: () => {
    console.log(this.name);
  }
};

obj.regular(); // "Alice"
obj.arrow(); // undefined (this 指向全局对象)

// 2. 不能作为构造函数
const Person = function(name) {
  this.name = name;
};

const person = new Person('Alice'); // ✅ 可以

const ArrowPerson = (name) => {
  this.name = name;
};

const arrowPerson = new ArrowPerson('Alice'); // ❌ TypeError

// 3. 没有 arguments 对象
function regular() {
  console.log(arguments);
}

regular(1, 2, 3); // [1, 2, 3]

const arrow = () => {
  console.log(arguments);
};

arrow(1, 2, 3); // ReferenceError

// 4. 没有 prototype 属性
function regular() {}
console.log(regular.prototype); // {}

const arrow = () => {};
console.log(arrow.prototype); // undefined

// 5. 不能使用 yield（不能作为生成器函数）
function* generator() {
  yield 1;
}

const* arrowGenerator = () => {
  yield 1; // ❌ SyntaxError
};
```

**使用场景：**

```javascript
// 1. 回调函数
// ❌ 普通函数需要 bind
const obj = {
  name: 'Alice',
  greet: function() {
    setTimeout(function() {
      console.log(`Hello, ${this.name}`); // undefined
    }, 100);
  }
};

// ✅ 使用箭头函数
const obj = {
  name: 'Alice',
  greet: function() {
    setTimeout(() => {
      console.log(`Hello, ${this.name}`); // "Alice"
    }, 100);
  }
};

// 2. 数组方法
const numbers = [1, 2, 3, 4, 5];

const doubled = numbers.map(num => num * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

const filtered = numbers.filter(num => num % 2 === 0);
console.log(filtered); // [2, 4]

const sum = numbers.reduce((acc, num) => acc + num, 0);
console.log(sum); // 15

// 3. 简化函数表达式
// ❌ 普通
const add = function(a, b) {
  return a + b;
};

// ✅ 箭头函数
const add = (a, b) => a + b;

// 4. 对象方法（谨慎使用）
const obj = {
  name: 'Alice',
  
  // ❌ 不推荐：this 指向全局
  greet: () => {
    console.log(`Hello, ${this.name}`);
  },
  
  // ✅ 推荐：使用方法简写
  greet() {
    console.log(`Hello, ${this.name}`);
  }
};
```

**场景题：**

```javascript
// 场景 1：事件处理器
class Button {
  constructor() {
    this.count = 0;
    this.button = document.createElement('button');
    this.button.textContent = 'Click me';
    
    // ❌ 普通函数需要 bind
    this.button.addEventListener('click', function() {
      this.count++; // this 指向 button 元素
      console.log(this.count);
    }.bind(this));
    
    // ✅ 使用箭头函数
    this.button.addEventListener('click', () => {
      this.count++; // this 指向 Button 实例
      console.log(this.count);
    });
  }
}

// 场景 2：Promise 链
fetch('/api/data')
  .then(response => response.json())
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error(error);
  });

// 场景 3：高阶函数
function createMultiplier(factor) {
  return num => num * factor;
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15
```

---

## 异步编程

### 8. Promise 是什么？如何使用？

**答案：**

**Promise 定义：**

Promise 是一个代表异步操作最终完成或失败的对象。

```javascript
// 1. 创建 Promise
const promise = new Promise((resolve, reject) => {
  // 异步操作
  setTimeout(() => {
    const success = true;
    
    if (success) {
      resolve('Operation succeeded');
    } else {
      reject(new Error('Operation failed'));
    }
  }, 1000);
});

// 2. 使用 Promise
promise
  .then(result => {
    console.log(result); // "Operation succeeded"
  })
  .catch(error => {
    console.error(error);
  })
  .finally(() => {
    console.log('Promise completed');
  });
```

**Promise 方法：**

```javascript
// 1. Promise.resolve()
Promise.resolve('Success')
  .then(value => console.log(value)); // "Success"

// 2. Promise.reject()
Promise.reject(new Error('Failed'))
  .catch(error => console.error(error)); // Error: Failed

// 3. Promise.all()
const promise1 = Promise.resolve(3);
const promise2 = 1337;
const promise3 = new Promise((resolve) => setTimeout(() => resolve('foo'), 1000));

Promise.all([promise1, promise2, promise3])
  .then(values => console.log(values)); // [3, 1337, "foo"]

// 4. Promise.allSettled()
const promises = [
  Promise.resolve(33),
  Promise.reject(new Error('an error')),
  Promise.resolve(66)
];

Promise.allSettled(promises)
  .then(results => console.log(results));
// [
//   { status: 'fulfilled', value: 33 },
//   { status: 'rejected', reason: Error: an error },
//   { status: 'fulfilled', value: 66 }
// ]

// 5. Promise.race()
const promise1 = new Promise(resolve => setTimeout(() => resolve('one'), 500));
const promise2 = new Promise(resolve => setTimeout(() => resolve('two'), 100));

Promise.race([promise1, promise2])
  .then(value => console.log(value)); // "two"

// 6. Promise.any()
const promises = [
  Promise.reject(new Error('failed 1')),
  Promise.reject(new Error('failed 2')),
  Promise.resolve('success')
];

Promise.any(promises)
  .then(value => console.log(value)); // "success"
```

**场景题：**

```javascript
// 场景 1：封装异步操作
function fetchUser(id) {
  return new Promise((resolve, reject) => {
    fetch(`/api/users/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('User not found');
        }
        return response.json();
      })
      .then(resolve)
      .catch(reject);
  });
}

// 使用
fetchUser(1)
  .then(user => console.log(user))
  .catch(error => console.error(error));

// 场景 2：顺序执行异步操作
async function fetchUsers() {
  const user1 = await fetchUser(1);
  const user2 = await fetchUser(2);
  const user3 = await fetchUser(3);
  
  return [user1, user2, user3];
}

// 场景 3：并行执行异步操作
async function fetchUsersParallel() {
  const [user1, user2, user3] = await Promise.all([
    fetchUser(1),
    fetchUser(2),
    fetchUser(3)
  ]);
  
  return [user1, user2, user3];
}

// 场景 4：超时处理
function fetchWithTimeout(url, timeout = 5000) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
}

// 使用
fetchWithTimeout('/api/data', 3000)
  .then(response => response.json())
  .catch(error => console.error(error));

// 场景 5：重试机制
async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      console.log(`Retry ${i + 1}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// 场景 6：缓存
const cache = new Map();

function fetchWithCache(url) {
  if (cache.has(url)) {
    return Promise.resolve(cache.get(url));
  }
  
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      cache.set(url, data);
      return data;
    });
}
```

---

### 9. async/await 是什么？如何使用？

**答案：**

**async/await 定义：**

async/await 是基于 Promise 的语法糖，让异步代码看起来像同步代码。

```javascript
// 1. 基本用法
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

// 2. async 函数返回 Promise
async function test() {
  return 'Hello';
}

console.log(test() instanceof Promise); // true

test().then(result => console.log(result)); // "Hello"
```

**与 Promise 对比：**

```javascript
// Promise 版本
function fetchUser() {
  return fetch('/api/user')
    .then(response => response.json())
    .then(user => {
      return fetch(`/api/posts/${user.id}`)
        .then(response => response.json())
        .then(posts => ({ user, posts }));
    });
}

// async/await 版本
async function fetchUser() {
  const user = await (await fetch('/api/user')).json();
  const posts = await (await fetch(`/api/posts/${user.id}`)).json();
  return { user, posts };
}
```

**错误处理：**

```javascript
// 1. try/catch
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch failed:', error);
    throw error;
  }
}

// 2. .catch()
fetchData()
  .then(data => console.log(data))
  .catch(error => console.error(error));

// 3. 多个错误处理
async function handleErrors() {
  try {
    const result1 = await operation1();
    const result2 = await operation2();
    return [result1, result2];
  } catch (error) {
    if (error instanceof NetworkError) {
      console.error('Network error:', error);
    } else if (error instanceof ValidationError) {
      console.error('Validation error:', error);
    } else {
      console.error('Unknown error:', error);
    }
    throw error;
  }
}
```

**场景题：**

```javascript
// 场景 1：并行执行
async function fetchMultiple() {
  const [users, posts, comments] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/comments').then(r => r.json())
  ]);
  
  return { users, posts, comments };
}

// 场景 2：顺序执行
async function processItems(items) {
  const results = [];
  
  for (const item of items) {
    const result = await processItem(item);
    results.push(result);
  }
  
  return results;
}

// 场景 3：带超时的异步操作
async function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

// 场景 4：限流
async function fetchWithRateLimit(urls, limit = 5) {
  const results = [];
  const executing = [];
  
  for (const url of urls) {
    const promise = fetch(url).then(r => r.json());
    
    results.push(promise);
    
    const executingPromise = promise.then(() => {
      executing.splice(executing.indexOf(executingPromise), 1);
    });
    
    executing.push(executingPromise);
    
    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }
  
  return Promise.all(results);
}

// 场景 5：重试
async function fetchWithRetry(url, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
}

// 场景 6：并发控制
class Semaphore {
  constructor(max) {
    this.max = max;
    this.current = 0;
    this.queue = [];
  }
  
  async acquire() {
    if (this.current < this.max) {
      this.current++;
      return;
    }
    
    return new Promise(resolve => {
      this.queue.push(resolve);
    });
  }
  
  release() {
    this.current--;
    if (this.queue.length > 0) {
      const resolve = this.queue.shift();
      resolve();
      this.current++;
    }
  }
}

async function withSemaphore(semaphore, fn) {
  await semaphore.acquire();
  try {
    return await fn();
  } finally {
    semaphore.release();
  }
}

// 使用
const semaphore = new Semaphore(3);
const urls = Array(10).fill('/api/data');

const results = await Promise.all(
  urls.map(url => 
    withSemaphore(semaphore, () => fetch(url).then(r => r.json()))
  )
);
```

---

### 10. 什么是事件循环（Event Loop）？

**答案：**

**事件循环定义：**

事件循环是 JavaScript 实现异步非阻塞 I/O 的机制。

```javascript
// 1. 宏任务和微任务
console.log('1');

setTimeout(() => console.log('2'), 0); // 宏任务

Promise.resolve().then(() => console.log('3')); // 微任务

console.log('4');

// 输出顺序：1 4 3 2
```

**执行顺序：**

```
1. 执行同步代码
2. 执行微任务队列
3. 执行宏任务队列
4. 重复 2-3
```

**示例：**

```javascript
console.log('Start');

setTimeout(() => console.log('Timeout 1'), 0);

Promise.resolve().then(() => {
  console.log('Promise 1');
  Promise.resolve().then(() => console.log('Promise 2'));
});

setTimeout(() => console.log('Timeout 2'), 0);

console.log('End');

// 输出：
// Start
// End
// Promise 1
// Promise 2
// Timeout 1
// Timeout 2
```

**场景题：**

```javascript
// 场景 1：理解执行顺序
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('4');

// 输出：1 4 3 2

// 场景 2：嵌套的微任务
Promise.resolve().then(() => {
  console.log('1');
  Promise.resolve().then(() => console.log('2'));
  console.log('3');
});

Promise.resolve().then(() => {
  console.log('4');
});

// 输出：1 3 2 4

// 场景 3：宏任务中的微任务
setTimeout(() => {
  console.log('1');
  Promise.resolve().then(() => console.log('2'));
}, 0);

setTimeout(() => {
  console.log('3');
  Promise.resolve().then(() => console.log('4'));
}, 0);

// 输出：1 2 3 4
```

---

## 场景题

### 11. 实现一个深拷贝函数

**答案：**

```javascript
function deepClone(obj, map = new WeakMap()) {
  // 处理基本类型和 null/undefined
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // 处理 Date
  if (obj instanceof Date) {
    return new Date(obj);
  }
  
  // 处理 RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }
  
  // 处理 Map
  if (obj instanceof Map) {
    const cloned = new Map();
    obj.forEach((value, key) => {
      cloned.set(deepClone(key, map), deepClone(value, map));
    });
    return cloned;
  }
  
  // 处理 Set
  if (obj instanceof Set) {
    const cloned = new Set();
    obj.forEach(value => {
      cloned.add(deepClone(value, map));
    });
    return cloned;
  }
  
  // 处理循环引用
  if (map.has(obj)) {
    return map.get(obj);
  }
  
  // 处理 Array 和 Object
  const cloned = Array.isArray(obj) ? [] : {};
  map.set(obj, cloned);
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key], map);
    }
  }
  
  return cloned;
}

// 测试
const obj = {
  a: 1,
  b: { c: 2 },
  d: [3, 4],
  e: new Date(),
  f: /test/g,
  g: new Map([['key', 'value']]),
  h: new Set([1, 2, 3])
};

obj.self = obj; // 循环引用

const cloned = deepClone(obj);
console.log(cloned);
console.log(cloned !== obj); // true
console.log(cloned.self === cloned); // true
```

---

### 12. 实现防抖和节流函数

**答案：**

```javascript
// 防抖
function debounce(func, delay) {
  let timeoutId;
  
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// 节流
function throttle(func, delay) {
  let lastCall = 0;
  
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      func.apply(this, args);
      lastCall = now;
    }
  };
}

// 使用
const debouncedSearch = debounce(function(query) {
  console.log('Searching:', query);
}, 300);

const throttledScroll = throttle(function() {
  console.log('Scrolling...');
}, 100);

// 测试
const input = document.createElement('input');
input.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});

window.addEventListener('scroll', throttledScroll);
```

---

### 13. 实现一个 EventEmitter

**答案：**

```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    return this;
  }
  
  off(event, callback) {
    if (!this.events[event]) {
      return this;
    }
    
    if (!callback) {
      delete this.events[event];
    } else {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
    
    return this;
  }
  
  emit(event, ...args) {
    if (!this.events[event]) {
      return this;
    }
    
    this.events[event].forEach(callback => {
      callback.apply(this, args);
    });
    
    return this;
  }
  
  once(event, callback) {
    const onceCallback = (...args) => {
      callback.apply(this, args);
      this.off(event, onceCallback);
    };
    
    this.on(event, onceCallback);
    return this;
  }
}

// 使用
const emitter = new EventEmitter();

emitter.on('data', (data) => {
  console.log('Received:', data);
});

emitter.emit('data', 'Hello'); // "Received: Hello"
emitter.off('data');
emitter.emit('data', 'World'); // 不会输出
```

---

### 14. 基本类型和引用类型的存储区别是什么？

**答案：**

**存储位置：**

```javascript
// 1. 基本类型存储在栈中
let a = 10;
let b = a;
b = 20;
console.log(a); // 10 (不受影响)

// 2. 引用类型存储在堆中，栈中存储引用地址
let obj1 = { name: 'Alice' };
let obj2 = obj1;
obj2.name = 'Bob';
console.log(obj1.name); // "Bob" (受影响)
```

**内存模型：**

```javascript
// 基本类型
// 栈内存
// a -> 10
// b -> 20

// 引用类型
// 栈内存          堆内存
// obj1 -> 0x001 -> { name: 'Bob' }
// obj2 -> 0x001 -> { name: 'Bob' }
```

**场景题：**

```javascript
// 场景 1：函数参数传递
function modifyPrimitive(num) {
  num = 100;
}

function modifyObject(obj) {
  obj.value = 100;
}

let num = 10;
let obj = { value: 10 };

modifyPrimitive(num);
console.log(num); // 10 (不变)

modifyObject(obj);
console.log(obj.value); // 100 (改变)

// 场景 2：数组操作
let arr1 = [1, 2, 3];
let arr2 = arr1;
arr2.push(4);
console.log(arr1); // [1, 2, 3, 4] (受影响)

// 场景 3：对象比较
let obj1 = { name: 'Alice' };
let obj2 = { name: 'Alice' };
let obj3 = obj1;

console.log(obj1 === obj2); // false (不同引用)
console.log(obj1 === obj3); // true (相同引用)
```

---

### 15. 什么是浅拷贝和深拷贝？如何实现？

**答案：**

**浅拷贝：**

```javascript
// 1. Object.assign()
const obj = { a: 1, b: { c: 2 } };
const shallow = Object.assign({}, obj);
shallow.b.c = 3;
console.log(obj.b.c); // 3 (受影响)

// 2. 展开运算符
const shallow2 = { ...obj };
shallow2.b.c = 4;
console.log(obj.b.c); // 4 (受影响)

// 3. Array.slice()
const arr = [{ a: 1 }, { b: 2 }];
const shallowArr = arr.slice();
shallowArr[0].a = 10;
console.log(arr[0].a); // 10 (受影响)
```

**深拷贝：**

```javascript
// 1. JSON.parse(JSON.stringify())
const obj = { a: 1, b: { c: 2 } };
const deep = JSON.parse(JSON.stringify(obj));
deep.b.c = 3;
console.log(obj.b.c); // 2 (不受影响)

// 限制：
// - 无法拷贝函数
// - 无法拷贝 undefined
// - 无法拷贝 Symbol
// - 会丢失原型链

// 2. 手动实现（支持循环引用）
function deepClone(obj, map = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (map.has(obj)) {
    return map.get(obj);
  }
  
  const cloned = Array.isArray(obj) ? [] : {};
  map.set(obj, cloned);
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key], map);
    }
  }
  
  return cloned;
}

// 3. 使用 structuredClone (ES2022)
const obj = { a: 1, b: { c: 2 } };
const deep = structuredClone(obj);

// 4. 使用第三方库 (lodash)
const _ = require('lodash');
const deep = _.cloneDeep(obj);
```

**场景题：**

```javascript
// 场景 1：不可变状态管理
const state = {
  user: { name: 'Alice', age: 25 },
  posts: [{ title: 'Post 1' }]
};

// 浅拷贝（推荐用于更新嵌套对象）
const newState = {
  ...state,
  user: {
    ...state.user,
    age: 26
  }
};

// 场景 2：撤销/重做
const history = [];
let currentState = { count: 0 };

function saveState() {
  history.push(deepClone(currentState));
}

function undo() {
  currentState = history.pop();
}

// 场景 3：表单重置
const formData = {
  name: '',
  email: '',
  address: {
    city: '',
    country: ''
  }
};

const initialData = deepClone(formData);

function resetForm() {
  Object.assign(formData, deepClone(initialData));
}
```

---

### 16. JavaScript 的类型转换规则是什么？

**答案：**

**转换为字符串：**

```javascript
// 1. String() 方法
String(123); // "123"
String(null); // "null"
String(undefined); // "undefined"
String(true); // "true"
String({}); // "[object Object]"

// 2. toString() 方法
(123).toString(); // "123"
(true).toString(); // "true"
// null.toString(); // TypeError
// undefined.toString(); // TypeError

// 3. 模板字符串
`123`; // "123"
`${true}`; // "true"
```

**转换为数字：**

```javascript
// 1. Number() 方法
Number('123'); // 123
Number('123abc'); // NaN
Number(''); // 0
Number(true); // 1
Number(false); // 0
Number(null); // 0
Number(undefined); // NaN

// 2. parseInt() 和 parseFloat()
parseInt('123abc'); // 123
parseFloat('123.45abc'); // 123.45
parseInt('0x10'); // 16 (十六进制)
parseInt('010', 8); // 8 (八进制)

// 3. 一元运算符
+'123'; // 123
+'abc'; // NaN
```

**转换为布尔值：**

```javascript
// 1. Boolean() 方法
Boolean(0); // false
Boolean(''); // false
Boolean(null); // false
Boolean(undefined); // false
Boolean(NaN); // false
Boolean(false); // false

// 其他都是 true
Boolean(1); // true
Boolean('0'); // true
Boolean([]); // true
Boolean({}); // true

// 2. !! 运算符
!!0; // false
!!1; // true
```

**隐式类型转换：**

```javascript
// 1. 字符串连接
'1' + 2; // "12"
1 + '2'; // "12"
1 + 2 + '3'; // "33"

// 2. 算术运算
'1' - 1; // 0
'1' * 2; // 2
'1' / 1; // 1
'1' % 2; // 1

// 3. 相等比较
1 == '1'; // true
null == undefined; // true
0 == false; // true
'' == false; // true
[] == false; // true

// 4. 逻辑运算
1 && 2; // 2
0 && 2; // 0
1 || 2; // 1
0 || 2; // 2
!1; // false
!0; // true
```

**场景题：**

```javascript
// 场景 1：类型安全的比较
function safeEqual(a, b) {
  if (typeof a !== typeof b) {
    return false;
  }
  return a === b;
}

safeEqual(1, '1'); // false
safeEqual(1, 1); // true

// 场景 2：输入验证
function toNumber(value) {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

toNumber('123'); // 123
toNumber('abc'); // 0
toNumber(null); // 0

// 场景 3：布尔转换
function toBoolean(value) {
  if (value === null || value === undefined || value === '' || value === 0) {
    return false;
  }
  return true;
}

toBoolean(0); // false
toBoolean('0'); // true (字符串 '0' 被视为 true)
```

---

### 17. 什么是作用域链？

**答案：**

**作用域链定义：**

作用域链是 JavaScript 中变量查找的机制，当代码访问一个变量时，会先在当前作用域查找，找不到就向上级作用域查找，直到全局作用域。

```javascript
// 作用域链示例
var globalVar = 'global';

function outer() {
  var outerVar = 'outer';
  
  function inner() {
    var innerVar = 'inner';
    
    console.log(innerVar); // 'inner' (当前作用域)
    console.log(outerVar); // 'outer' (outer 作用域)
    console.log(globalVar); // 'global' (全局作用域)
    console.log(nonExistent); // ReferenceError (找不到)
  }
  
  inner();
}

outer();
```

**作用域链查找过程：**

```
inner 函数作用域
  └── innerVar: 'inner'
  └── outer 函数作用域
      └── outerVar: 'outer'
      └── 全局作用域
          └── globalVar: 'global'
```

**块级作用域：**

```javascript
// ES6 之前：var 没有块级作用域
if (true) {
  var x = 10;
}
console.log(x); // 10 (可以访问)

// ES6：let 和 const 有块级作用域
if (true) {
  let y = 10;
}
console.log(y); // ReferenceError (无法访问)
```

**场景题：**

```javascript
// 场景 1：变量提升
console.log(a); // undefined (var 提升)
var a = 10;

console.log(b); // ReferenceError (let 不提升)
let b = 20;

// 场景 2：闭包与作用域
function createCounter() {
  let count = 0;
  
  return {
    increment: function() {
      count++;
      console.log(count);
    },
    getCount: function() {
      return count;
    }
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
console.log(counter.getCount()); // 2

// 场景 3：IIFE 避免污染全局作用域
(function() {
  var privateVar = 'private';
  console.log(privateVar);
})();

console.log(privateVar); // ReferenceError (无法访问)

// 场景 4：模块模式
const module = (function() {
  let privateVar = 0;
  
  return {
    getPrivateVar: function() {
      return privateVar;
    },
    setPrivateVar: function(value) {
      privateVar = value;
    }
  };
})();

console.log(module.getPrivateVar()); // 0
module.setPrivateVar(10);
console.log(module.getPrivateVar()); // 10
```

---

### 18. this 指向的规则是什么？

**答案：**

**this 指向规则：**

```javascript
// 1. 默认绑定（严格模式下为 undefined，非严格模式为 window）
function fn() {
  console.log(this);
}

fn(); // window (非严格模式) / undefined (严格模式)

// 2. 隐式绑定（谁调用就指向谁）
const obj = {
  name: 'Alice',
  sayName: function() {
    console.log(this.name);
  }
};

obj.sayName(); // "Alice" (this 指向 obj)

const fn = obj.sayName;
fn(); // undefined (this 指向 window)

// 3. 显式绑定（call、apply、bind）
function greet() {
  console.log(`Hello, ${this.name}`);
}

const person = { name: 'Alice' };

greet.call(person); // "Hello, Alice"
greet.apply(person); // "Hello, Alice"
const boundGreet = greet.bind(person);
boundGreet(); // "Hello, Alice"

// 4. new 绑定（指向新创建的对象）
function Person(name) {
  this.name = name;
}

const person = new Person('Alice');
console.log(person.name); // "Alice"

// 5. 箭头函数（继承外层作用域的 this）
const obj = {
  name: 'Alice',
  sayName: () => {
    console.log(this.name); // undefined (this 指向全局)
  },
  
  sayName2: function() {
    const arrow = () => {
      console.log(this.name); // "Alice" (继承外层 this)
    };
    arrow();
  }
};

obj.sayName();
obj.sayName2();
```

**场景题：**

```javascript
// 场景 1：事件处理器
const button = document.getElementById('button');

// ❌ 错误：this 指向 button 元素
button.addEventListener('click', function() {
  console.log(this); // button 元素
});

// ✅ 正确：使用箭头函数
const obj = {
  name: 'Alice',
  handleClick: function() {
    console.log(this.name); // "Alice"
  }
};

button.addEventListener('click', () => {
  obj.handleClick();
});

// 场景 2：回调函数
const obj = {
  name: 'Alice',
  greet: function() {
    setTimeout(function() {
      console.log(this.name); // undefined
    }, 100);
  },
  
  greet2: function() {
    setTimeout(() => {
      console.log(this.name); // "Alice"
    }, 100);
  }
};

// 场景 3：构造函数
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function() {
  console.log(`Hello, ${this.name}`);
};

const person = new Person('Alice');
person.greet(); // "Hello, Alice"

// 场景 4：call、apply、bind 的区别
function add(a, b) {
  return a + b;
}

console.log(add.call(null, 1, 2)); // 3
console.log(add.apply(null, [1, 2])); // 3
const add1 = add.bind(null, 1);
console.log(add1(2)); // 3
```

---

### 19. 什么是执行上下文和执行栈？

**答案：**

**执行上下文类型：**

```javascript
// 1. 全局执行上下文
var globalVar = 'global';

function fn() {
  console.log(globalVar);
}

fn(); // "global"

// 2. 函数执行上下文
function outer() {
  var outerVar = 'outer';
  
  function inner() {
    var innerVar = 'inner';
    console.log(outerVar, innerVar);
  }
  
  inner();
}

outer(); // "outer" "inner"

// 3. eval 执行上下文（不推荐）
eval('var x = 10;');
console.log(x); // 10
```

**执行上下文创建阶段：**

```javascript
// 创建阶段
function fn(a, b) {
  var c = 10;
}

// 等价于
function fn(a, b) {
  var c; // 变量声明提升
  var a; // 参数声明
  var b; // 参数声明
  
  a = arguments[0]; // 参数赋值
  b = arguments[1]; // 参数赋值
  
  // 函数声明提升
  // var c = 10; // 变量赋值不提升
}
```

**执行栈：**

```javascript
function first() {
  console.log('First start');
  second();
  console.log('First end');
}

function second() {
  console.log('Second start');
  third();
  console.log('Second end');
}

function third() {
  console.log('Third');
}

first();

// 执行栈变化：
// 1. 全局上下文入栈
// 2. first 入栈 -> "First start"
// 3. second 入栈 -> "Second start"
// 4. third 入栈 -> "Third"
// 5. third 出栈
// 6. -> "Second end"
// 7. second 出栈
// 8. -> "First end"
// 9. first 出栈
// 10. 全局上下文出栈
```

**场景题：**

```javascript
// 场景 1：变量提升
console.log(a); // undefined
var a = 10;

console.log(b); // ReferenceError
let b = 20;

// 场景 2：函数提升
console.log(fn1); // [Function: fn1]
console.log(fn2); // undefined

function fn1() {
  console.log('fn1');
}

var fn2 = function() {
  console.log('fn2');
};

// 场景 3：作用域链
var x = 'global';

function fn() {
  var x = 'local';
  
  function inner() {
    console.log(x); // "local"
  }
  
  inner();
}

fn();

// 场景 4：闭包与执行上下文
function createCounter() {
  let count = 0;
  
  return function() {
    count++;
    return count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
```

---

### 20. 什么是内存泄漏？常见的内存泄漏场景有哪些？

**答案：**

**内存泄漏定义：**

内存泄漏是指程序中已动态分配的堆内存由于某种原因程序未释放或无法释放，造成系统内存的浪费，导致程序运行速度减慢甚至系统崩溃等严重后果。

**常见内存泄漏场景：**

```javascript
// 1. 意外的全局变量
function fn() {
  globalVar = 'global'; // 意外创建全局变量
}

// 2. 未清理的定时器
function startTimer() {
  setInterval(() => {
    console.log('tick');
  }, 1000);
  // 没有清除定时器，导致内存泄漏
}

// ✅ 正确做法
function startTimer() {
  const timer = setInterval(() => {
    console.log('tick');
  }, 1000);
  
  return function cleanup() {
    clearInterval(timer);
  };
}

// 3. 闭包引用
function createClosure() {
  const largeData = new Array(1000000).fill('data');
  
  return function() {
    // 闭包引用了 largeData，导致无法释放
    console.log('closure');
  };
}

// ✅ 正确做法
function createClosure() {
  const largeData = new Array(1000000).fill('data');
  
  return function() {
    // 只使用需要的数据
    console.log('closure');
  };
  
  // largeData 在函数执行完后可以被回收
}

// 4. DOM 引用
const elements = [];

function addElement() {
  const div = document.createElement('div');
  elements.push(div); // 保存 DOM 引用
  document.body.appendChild(div);
}

// ✅ 正确做法
function addElement() {
  const div = document.createElement('div');
  document.body.appendChild(div);
  
  // 不保存引用，让垃圾回收器回收
}

// 5. 事件监听器未移除
function addListener() {
  const button = document.getElementById('button');
  button.addEventListener('click', function() {
    console.log('clicked');
  });
  // 没有移除监听器
}

// ✅ 正确做法
function addListener() {
  const button = document.getElementById('button');
  const handler = function() {
    console.log('clicked');
  };
  
  button.addEventListener('click', handler);
  
  return function cleanup() {
    button.removeEventListener('click', handler);
  };
}

// 6. Map 和 Set 的强引用
const map = new Map();
const element = document.getElementById('element');
map.set(element, 'data'); // 强引用

// ✅ 正确做法：使用 WeakMap
const weakMap = new WeakMap();
weakMap.set(element, 'data'); // 弱引用
```

**场景题：**

```javascript
// 场景 1：单例模式的内存泄漏
class Singleton {
  static instance = null;
  
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }
    
    this.data = new Array(1000000).fill('data');
    Singleton.instance = this;
  }
}

const instance1 = new Singleton();
const instance2 = new Singleton();
console.log(instance1 === instance2); // true

// 场景 2：事件委托避免内存泄漏
// ❌ 错误：为每个元素添加监听器
const items = document.querySelectorAll('.item');
items.forEach(item => {
  item.addEventListener('click', function() {
    console.log('clicked');
  });
});

// ✅ 正确：使用事件委托
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('item')) {
    console.log('clicked');
  }
});

// 场景 3：清理闭包
function createComponent() {
  const data = new Array(1000000).fill('data');
  let timer = null;
  
  function update() {
    console.log('update');
  }
  
  function mount() {
    timer = setInterval(update, 1000);
  }
  
  function unmount() {
    clearInterval(timer);
    // 清除引用
    data.length = 0;
  }
  
  return { mount, unmount };
}

const component = createComponent();
component.mount();
// 使用完成后
component.unmount();
```

---

## 总结

以上涵盖了 JavaScript 面试中最常问的问题，包括：

1. **JavaScript 基础**（数据类型、null/undefined、==/===、闭包、原型链）
2. **ES6+ 新特性**（let/const、箭头函数）
3. **异步编程**（Promise、async/await、事件循环）
4. **场景题**（深拷贝、防抖节流、EventEmitter）

这些题目覆盖了 JavaScript 的核心概念和实际应用场景，能够全面考察候选人的 JavaScript 知识深度和广度。