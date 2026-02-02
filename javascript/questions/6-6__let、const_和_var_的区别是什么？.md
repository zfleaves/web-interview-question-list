# 6. let、const 和 var 的区别是什么？

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