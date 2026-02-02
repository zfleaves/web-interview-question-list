# 3. TypeScript 的类型推断是什么？

**答案：**

```typescript
// 1. 基础类型推断
let name = 'Alice'; // 推断为 string
let age = 25; // 推断为 number

// 2. 最佳通用类型推断
let numbers = [0, 1, null]; // 推断为 (number | null)[]

// 3. 上下文类型推断
window.onmousedown = function(mouseEvent) {
  console.log(mouseEvent.button); // 推断为 MouseEvent
};

// 4. 类型断言
let value: any = 'hello';
let length: number = (value as string).length;
// 或
let length2: number = (<string>value).length;
```