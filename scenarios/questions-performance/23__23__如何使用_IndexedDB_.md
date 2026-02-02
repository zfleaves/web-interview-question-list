# 23. 如何使用 IndexedDB？

**答案：**

IndexedDB 是浏览器提供的本地数据库，可以存储大量数据。

```javascript
// 打开数据库
const request = indexedDB.open('myDatabase', 1);

request.onupgradeneeded = (event) => {
  const db = event.target.result;
  const objectStore = db.createObjectStore('users', { keyPath: 'id' });
};

request.onsuccess = (event) => {
  const db = event.target.result;

  // 添加数据
  const transaction = db.transaction(['users'], 'readwrite');
  const objectStore = transaction.objectStore('users');
  objectStore.add({ id: 1, name: 'John' });
};
```

---