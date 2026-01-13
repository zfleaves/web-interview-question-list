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
