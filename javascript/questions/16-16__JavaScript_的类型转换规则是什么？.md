# 16. JavaScript 的类型转换规则是什么？

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