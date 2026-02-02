# 2. TypeScript 的基本类型有哪些？

**答案：**

```typescript
// 1. 原始类型
let name: string = 'Alice';
let age: number = 25;
let isStudent: boolean = true;
let nothing: null = null;
let notDefined: undefined = undefined;
let unique: symbol = Symbol('id');
let bigNumber: bigint = 100n;

// 2. 数组
let numbers: number[] = [1, 2, 3];
let strings: Array<string> = ['a', 'b', 'c'];

// 3. 元组
let tuple: [string, number] = ['Alice', 25];

// 4. 枚举
enum Color {
  Red,
  Green,
  Blue
}

let color: Color = Color.Red;

// 5. any 和 unknown
let anything: any = 'hello';
anything = 42; // ✅ 可以

let something: unknown = 'hello';
something = 42; // ✅ 可以
// something.toFixed(); // ❌ 错误

// 6. void 和 never
function log(message: string): void {
  console.log(message);
}

function error(message: string): never {
  throw new Error(message);
}

// 7. object
let obj: object = { name: 'Alice' };
let user: { name: string; age: number } = { name: 'Alice', age: 25 };
```