# 1. 手写一个 Promise.all

**答案：**

```javascript
// Promise.all 实现
Promise.myAll = function(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'));
    }
    
    const results = [];
    let completedCount = 0;
    const length = promises.length;
    
    if (length === 0) {
      return resolve(results);
    }
    
    promises.forEach((promise, index) => {
      // 处理非 Promise 值
      Promise.resolve(promise).then(
        value => {
          results[index] = value;
          completedCount++;
          
          if (completedCount === length) {
            resolve(results);
          }
        },
        reason => {
          reject(reason);
        }
      );
    });
  });
};

// Promise.allSettled 实现
Promise.myAllSettled = function(promises) {
  return new Promise((resolve) => {
    if (!Array.isArray(promises)) {
      return resolve([]);
    }
    
    const results = [];
    let completedCount = 0;
    const length = promises.length;
    
    if (length === 0) {
      return resolve(results);
    }
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise).then(
        value => {
          results[index] = { status: 'fulfilled', value };
          completedCount++;
          
          if (completedCount === length) {
            resolve(results);
          }
        },
        reason => {
          results[index] = { status: 'rejected', reason };
          completedCount++;
          
          if (completedCount === length) {
            resolve(results);
          }
        }
      );
    });
  });
};

// Promise.race 实现
Promise.myRace = function(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'));
    }
    
    promises.forEach(promise => {
      Promise.resolve(promise).then(resolve, reject);
    });
  });
};

// Promise.any 实现
Promise.myAny = function(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'));
    }
    
    const errors = [];
    let rejectedCount = 0;
    const length = promises.length;
    
    if (length === 0) {
      return reject(new AggregateError([], 'All promises were rejected'));
    }
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise).then(
        value => {
          resolve(value);
        },
        reason => {
          errors[index] = reason;
          rejectedCount++;
          
          if (rejectedCount === length) {
            reject(new AggregateError(errors, 'All promises were rejected'));
          }
        }
      );
    });
  });
};
```

---
