# 1. JavaScript 的数据类型有哪些？

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