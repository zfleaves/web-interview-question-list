# 1. TypeScript 和 JavaScript 的区别是什么？

**答案：**

```typescript
// 1. 类型检查
// JavaScript
let name = 'Alice';
name = 42; // ✅ 可以

// TypeScript
let name: string = 'Alice';
name = 42; // ❌ 错误

// 2. 接口
// JavaScript
function greet(user) {
  console.log(`Hello, ${user.name}`);
}

// TypeScript
interface User {
  name: string;
  age?: number;
}

function greet(user: User) {
  console.log(`Hello, ${user.name}`);
}

// 3. 编译时错误
// TypeScript 在编译时捕获错误
let x: number = 10;
x = 'hello'; // ❌ 编译时错误

// JavaScript 在运行时才发现错误
let x = 10;
x = 'hello'; // ✅ 可以，但可能导致运行时错误
```