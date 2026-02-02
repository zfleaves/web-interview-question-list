# 8. Promise 是什么？如何使用？

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