## 12. ES6 的 Class 是什么？

**答案：**

### Class 简介

ES6 的 Class 是语法糖，本质上是 ES5 构造函数的另一种写法。

### 基本用法

```javascript
// ES5
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.sayHello = function() {
  console.log(`Hello, ${this.name}`);
};

const p1 = new Person('test', 18);

// ES6
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  sayHello() {
    console.log(`Hello, ${this.name}`);
  }
}

const p2 = new Person('test', 18);
```

### 继承

```javascript
// ES5
function Animal(name) {
  this.name = name;
}

Animal.prototype.say = function() {
  console.log(`I am ${this.name}`);
};

function Dog(name, breed) {
  Animal.call(this, name);
  this.breed = breed;
}

Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
  console.log('Woof!');
};

// ES6
class Animal {
  constructor(name) {
    this.name = name;
  }

  say() {
    console.log(`I am ${this.name}`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }

  bark() {
    console.log('Woof!');
  }
}
```

### 静态方法

```javascript
class MathUtil {
  static add(a, b) {
    return a + b;
  }

  static multiply(a, b) {
    return a * b;
  }
}

console.log(MathUtil.add(1, 2)); // 3
console.log(MathUtil.multiply(3, 4)); // 12
```

### 私有属性（ES2022）

```javascript
class Person {
  #name;
  #age;

  constructor(name, age) {
    this.#name = name;
    this.#age = age;
  }

  getName() {
    return this.#name;
  }

  getAge() {
    return this.#age;
  }
}

const p = new Person('test', 18);
console.log(p.getName()); // 'test'
console.log(p.#name); // SyntaxError: Private field '#name' must be declared in an enclosing class
```

### Getter 和 Setter

```javascript
class Person {
  constructor(name) {
    this._name = name;
  }

  get name() {
    return this._name;
  }

  set name(value) {
    if (value.length < 3) {
      throw new Error('Name too short');
    }
    this._name = value;
  }
}

const p = new Person('test');
console.log(p.name); // 'test'
p.name = 'new name';
console.log(p.name); // 'new name'
```

---
