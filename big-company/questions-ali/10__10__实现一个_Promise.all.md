# 10. 实现一个 Promise.all

**答案：**

```javascript
Promise.myAll = function(promises) {
  const results = [];
  let count = 0;
  
  return new Promise((resolve, reject) => {
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(res => {
          results[index] = res;
          count++;
          
          if (count === promises.length) {
            resolve(results);
          }
        })
        .catch(reject);
    });
  });
};

// 测试
Promise.myAll([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3)
]).then(results => {
  console.log(results); // [1, 2, 3]
});
```

**阿里特色考点：**
- 阿里高频考察 Promise 的实现原理
- 结合异步编程场景说明使用方法
- 考察对 Promise.allSettled、Promise.race 的理解

---

## 场景题
