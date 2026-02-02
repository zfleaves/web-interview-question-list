# 9. async/await 是什么？如何使用？

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