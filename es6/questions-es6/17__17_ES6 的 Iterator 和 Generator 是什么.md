## 17. ES6 的 Iterator 和 Generator 是什么？

**答案：**

### Iterator 简介

Iterator 是一种接口，为各种不同的数据结构提供统一的访问机制。

### 基本用法

```javascript
// 1. 创建 Iterator
function makeIterator(array) {
  let nextIndex = 0;
  return {
    next() {
      return nextIndex < array.length
        ? { value: array[nextIndex++], done: false }
        : { value: undefined, done: true };
    }
  };
}

const it = makeIterator(['a', 'b', 'c']);
console.log(it.next()); // { value: 'a', done: false }
console.log(it.next()); // { value: 'b', done: false }
console.log(it.next()); // { value: 'c', done: false }
console.log(it.next()); // { value: undefined, done: true }

// 2. 默认 Iterator 接口
const arr = ['a', 'b', 'c'];
const iterator = arr[Symbol.iterator]();
console.log(iterator.next()); // { value: 'a', done: false }

// 3. for...of 循环
const arr2 = ['a', 'b', 'c'];
for (let item of arr2) {
  console.log(item); // 'a' 'b' 'c'
}
```

### Generator 简介

Generator 是 ES6 提供的一种异步编程解决方案，语法行为与传统函数完全不同。

### 基本用法

```javascript
// 1. 定义 Generator
function* helloWorldGenerator() {
  yield 'hello';
  yield 'world';
  return 'ending';
}

const hw = helloWorldGenerator();
console.log(hw.next()); // { value: 'hello', done: false }
console.log(hw.next()); // { value: 'world', done: false }
console.log(hw.next()); // { value: 'ending', done: true }
console.log(hw.next()); // { value: undefined, done: true }

// 2. yield 表达式
function* foo(x) {
  const y = 2 * (yield (x + 1));
  const z = yield (y / 3);
  return (x + y + z);
}

const it = foo(5);
console.log(it.next()); // { value: 6, done: false }
console.log(it.next(12)); // { value: 8, done: false }
console.log(it.next(13)); // { value: 42, done: true }

// 3. for...of 遍历 Generator
function* numbers() {
  yield 1;
  yield 2;
  yield 3;
  return 4;
}

for (let n of numbers()) {
  console.log(n); // 1 2 3
}

// 4. Generator.prototype.return()
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

const g = gen();
console.log(g.next()); // { value: 1, done: false }
console.log(g.return('foo')); // { value: 'foo', done: true }
console.log(g.next()); // { value: undefined, done: true }

// 5. Generator.prototype.throw()
function* gen2() {
  try {
    yield 1;
    yield 2;
    yield 3;
  } catch (e) {
    console.log('内部捕获', e);
  }
}

const g2 = gen2();
g2.next(); // { value: 1, done: false }
g2.throw('a'); // 内部捕获 a
g2.next(); // { value: undefined, done: true }
```

### 实际应用

```javascript
// 1. 异步操作同步化表达
function* main() {
  try {
    const data = yield fetch('/api/data');
    const result = yield data.json();
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

function run(fn) {
  const gen = fn();

  function step(nextF) {
    let next;
    try {
      next = nextF();
    } catch (e) {
      return gen.throw(e);
    }

    if (next.done) {
      return next.value;
    }

    Promise.resolve(next.value).then(
      v => step(() => gen.next(v)),
      e => step(() => gen.throw(e))
    );
  }

  step(() => gen.next());
}

run(main);

// 2. 部署 Iterator 接口
function* objectEntries(obj) {
  const propKeys = Reflect.ownKeys(obj);

  for (const propKey of propKeys) {
    yield [propKey, obj[propKey]];
  }
}

const jane = { first: 'Jane', last: 'Doe' };
for (const [key, value] of objectEntries(jane)) {
  console.log(`${key}: ${value}`); // first: Jane, last: Doe
}

// 3. 状态机
function* clock() {
  while (true) {
    console.log('Tick!');
    yield;
    console.log('Tock!');
    yield;
  }
}

const c = clock();
c.next(); // Tick!
c.next(); // Tock!
c.next(); // Tick!
```

---
