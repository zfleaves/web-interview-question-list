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
