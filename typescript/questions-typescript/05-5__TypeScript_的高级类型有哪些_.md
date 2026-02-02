# 5. TypeScript 的高级类型有哪些？

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