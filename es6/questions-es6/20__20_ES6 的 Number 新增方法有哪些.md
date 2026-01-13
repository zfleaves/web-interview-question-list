## 20. ES6 的 Number 新增方法有哪些？

**答案：**

### 1. Number.isFinite()

判断是否为有限数值：

```javascript
console.log(Number.isFinite(15)); // true
console.log(Number.isFinite(0.8)); // true
console.log(Number.isFinite(NaN)); // false
console.log(Number.isFinite(Infinity)); // false
console.log(Number.isFinite(-Infinity)); // false
console.log(Number.isFinite('foo')); // false
console.log(Number.isFinite('15')); // false
console.log(Number.isFinite(true)); // false
```

### 2. Number.isNaN()

判断是否为 NaN：

```javascript
console.log(Number.isNaN(NaN)); // true
console.log(Number.isNaN(15)); // false
console.log(Number.isNaN('15')); // false
console.log(Number.isNaN(true)); // false
console.log(Number.isNaN(9 / NaN)); // true
console.log(Number.isNaN('true' / 0)); // true
console.log(Number.isNaN('true' / 'true')); // true
```

### 3. Number.parseInt()

解析字符串为整数：

```javascript
console.log(Number.parseInt('12.34')); // 12
console.log(Number.parseInt('012')); // 12
console.log(Number.parseInt('0o10')); // 0
console.log(Number.parseInt('0x10')); // 0
```

### 4. Number.parseFloat()

解析字符串为浮点数：

```javascript
console.log(Number.parseFloat('12.34')); // 12.34
console.log(Number.parseFloat('12.34abc')); // 12.34
```

### 5. Number.isInteger()

判断是否为整数：

```javascript
console.log(Number.isInteger(25)); // true
console.log(Number.isInteger(25.0)); // true
console.log(Number.isInteger(25.1)); // false
console.log(Number.isInteger('15')); // false
console.log(Number.isInteger(true)); // false
```

### 6. Number.EPSILON

表示 1 与大于 1 的最小浮点数之间的差：

```javascript
console.log(0.1 + 0.2 === 0.3); // false
console.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON); // true

function withinErrorMargin(left, right) {
  return Math.abs(left - right) < Number.EPSILON * Math.pow(2, 2);
}

console.log(withinErrorMargin(0.1 + 0.2, 0.3)); // true
```

### 7. Number.isSafeInteger()

判断是否为安全整数（-(2^53 - 1) 到 2^53 - 1）：

```javascript
console.log(Number.isSafeInteger(3)); // true
console.log(Number.isSafeInteger(9007199254740992)); // false
console.log(Number.isSafeInteger(9007199254740993)); // false
```

---

## 总结

ES6 是 JavaScript 的一次重大更新，引入了许多新特性和改进，包括：

1. **let 和 const**：块级作用域变量声明
2. **箭头函数**：更简洁的函数语法
3. **模板字符串**：更强大的字符串处理
4. **解构赋值**：从数组或对象中提取值
5. **扩展运算符**：展开数组和对象
6. **Set 和 Map**：新的数据结构
7. **Promise**：异步编程解决方案
8. **async/await**：Promise 的语法糖
9. **Class**：面向对象编程语法糖
10. **模块化**：官方模块化方案
11. **Symbol**：独一无二的值
12. **Proxy**：拦截和自定义操作
13. **Reflect**：与 Proxy 配合使用
14. **Iterator 和 Generator**：迭代器和生成器
15. **新增方法**：Object、Array、Number 等新增方法

掌握 ES6 特性对于现代 JavaScript 开发至关重要，能够提高代码质量和开发效率。