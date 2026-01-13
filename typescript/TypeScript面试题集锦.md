# TypeScript 面试题集锦（截止 2025 年底）

## 目录
1. [TypeScript 基础](#typescript-基础)
2. [类型系统](#类型系统)
3. [泛型](#泛型)
4. [高级类型](#高级类型)
5. [装饰器](#装饰器)
6. [场景题](#场景题)

---

## TypeScript 基础

### 1. TypeScript 和 JavaScript 的区别是什么？

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

---

### 2. TypeScript 的基本类型有哪些？

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

---

## 类型系统

### 3. TypeScript 的类型推断是什么？

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

---

## 泛型

### 4. 什么是泛型？如何使用？

**答案：**

```typescript
// 1. 泛型函数
function identity<T>(arg: T): T {
  return arg;
}

let result = identity<string>('hello');
let result2 = identity(42); // 类型推断

// 2. 泛型接口
interface Box<T> {
  value: T;
}

let box: Box<string> = { value: 'hello' };

// 3. 泛型类
class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
}

let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = function(x, y) {
  return x + y;
};

// 4. 泛型约束
interface Lengthwise {
  length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

loggingIdentity({ length: 10, value: 'hello' });
```

---

## 高级类型

### 5. TypeScript 的高级类型有哪些？

**答案：**

```typescript
// 1. 联合类型
type StringOrNumber = string | number;

let value: StringOrNumber = 'hello';
value = 42;

// 2. 交叉类型
interface Person {
  name: string;
}

interface Employee {
  id: number;
}

type PersonEmployee = Person & Employee;

let person: PersonEmployee = {
  name: 'Alice',
  id: 1
};

// 3. 类型别名
type ID = string | number;

let userId: ID = '123';
let userId2: ID = 456;

// 4. 条件类型
type NonNullable<T> = T extends null | undefined ? never : T;

type Result = NonNullable<string | null>; // string

// 5. 映射类型
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

interface User {
  name: string;
  age: number;
}

type ReadonlyUser = Readonly<User>;
type PartialUser = Partial<User>;

// 6. 索引类型
function pluck<T, K extends keyof T>(o: T, names: K[]): T[K][] {
  return names.map(n => o[n]);
}

interface User {
  name: string;
  age: number;
}

let user: User = { name: 'Alice', age: 25 };
let name = pluck(user, ['name']); // string[]
```

---

## 装饰器

### 6. 什么是装饰器？

**答案：**

```typescript
// 1. 类装饰器
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
}

// 2. 方法装饰器
function log(target: any, key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    console.log(`Calling ${key} with`, args);
    const result = originalMethod.apply(this, args);
    console.log(`${key} returned`, result);
    return result;
  };
}

class Calculator {
  @log
  add(a: number, b: number): number {
    return a + b;
  }
}

// 3. 属性装饰器
function format(target: any, key: string) {
  let value = target[key];
  
  const getter = () => value;
  const setter = (newVal: string) => {
    value = newVal.toUpperCase();
  };
  
  Object.defineProperty(target, key, {
    get: getter,
    set: setter,
    enumerable: true,
    configurable: true
  });
}

class Person {
  @format
  name: string;
}

// 4. 参数装饰器
function required(target: any, key: string, index: number) {
  console.log(`Parameter at index ${index} in ${key} is required`);
}

class User {
  greet(@required name: string) {
    console.log(`Hello, ${name}`);
  }
}
```

---

## 场景题

### 7. 实现一个类型安全的深拷贝函数

**答案：**

```typescript
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj) as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }
  
  if (obj instanceof Object) {
    const clonedObj = {} as T;
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    
    return clonedObj;
  }
  
  return obj;
}

// 使用
interface User {
  name: string;
  age: number;
  address: {
    city: string;
    country: string;
  };
}

const user: User = {
  name: 'Alice',
  age: 25,
  address: {
    city: 'New York',
    country: 'USA'
  }
};

const clonedUser = deepClone(user);
console.log(clonedUser);
```

---

## 总结

以上涵盖了 TypeScript 面试中最常问的问题，包括：

1. **TypeScript 基础**（与 JavaScript 的区别、基本类型）
2. **类型系统**（类型推断）
3. **泛型**（泛型函数、接口、类）
4. **高级类型**（联合类型、交叉类型、条件类型）
5. **装饰器**（类装饰器、方法装饰器、属性装饰器）
6. **场景题**（类型安全的深拷贝）

这些题目覆盖了 TypeScript 的核心概念和实际应用场景。