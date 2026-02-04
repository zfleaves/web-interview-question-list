# 8. class 关键字 super static 底层如何实现

**答案：**

**class 底层实现（ES5 模拟）：**

```javascript
// class 本质上是函数的语法糖
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  sayName() {
    console.log(this.name);
  }
}

// 等价于 ES5 写法：
function Animal(name) {
  this.name = name;
}

Animal.prototype.sayName = function() {
  console.log(this.name);
};

// 继承实现
class Dog extends Animal {
  constructor(name, breed) {
    // 必须先调用 super
    super(name);
    this.breed = breed;
  }
  
  sayName() {
    super.sayName();
    console.log(this.breed);
  }
}

// 等价于 ES5 写法：
function Dog(name, breed) {
  // 继承父类属性
  Animal.call(this, name);
  this.breed = breed;
}

// 继承父类原型
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

// 覆盖方法
Dog.prototype.sayName = function() {
  // 调用父类方法
  Animal.prototype.sayName.call(this);
  console.log(this.breed);
};

const dog = new Dog('旺财', '金毛');
dog.sayName(); // 旺财, 金毛
```

**super 底层实现原理：**

```javascript
// super 在构造函数中的实现
class Parent {
  constructor() {
    this.parentName = 'Parent';
  }
}

class Child extends Parent {
  constructor() {
    // super() 实际上是 Parent.prototype.constructor.call(this)
    // 但内部会做一些额外处理，比如绑定 this
    super(); 
    this.childName = 'Child';
  }
}

// super 在方法中的实现
class Parent {
  sayHello() {
    console.log('Hello from Parent');
  }
}

class Child extends Parent {
  sayHello() {
    // super.sayHello() 实际上是 Parent.prototype.sayHello.call(this)
    // 通过 [[HomeObject]] 内部属性找到父类原型
    super.sayHello();
    console.log('Hello from Child');
  }
}
```

**static 底层实现：**

```javascript
class Parent {
  static count = 0;
  
  static getCount() {
    return Parent.count;
  }
  
  static addCount() {
    Parent.count++;
  }
  
  instanceMethod() {
    console.log('This is instance method');
  }
}

// 等价于 ES5 写法：
function Parent() {}

// 静态属性和方法直接定义在构造函数上
Parent.count = 0;
Parent.getCount = function() {
  return Parent.count;
};
Parent.addCount = function() {
  Parent.count++;
};

// 实例方法定义在原型上
Parent.prototype.instanceMethod = function() {
  console.log('This is instance method');
};

// static 继承实现
class Child extends Parent {
  static childCount = 0;
  
  static getChildCount() {
    return Child.childCount;
  }
}

// 等价于 ES5 写法：
function Child() {}

// 继承静态方法
Object.setPrototypeOf(Child, Parent);

// 添加新的静态方法
Child.childCount = 0;
Child.getChildCount = function() {
  return Child.childCount;
};

// 继承实例方法
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;

// 测试
console.log(Parent.getCount()); // 0
Parent.addCount();
console.log(Parent.getCount()); // 1
console.log(Child.getCount()); // 1（继承自父类）
```

**完整的继承链：**

```javascript
class GrandParent {
  static staticGrandMethod() {
    console.log('GrandParent static method');
  }
  
  grandMethod() {
    console.log('GrandParent instance method');
  }
}

class Parent extends GrandParent {
  static staticMethod() {
    console.log('Parent static method');
    // super.staticGrandMethod(); // 调用父类静态方法
  }
  
  parentMethod() {
    console.log('Parent instance method');
    // super.grandMethod(); // 调用父类实例方法
  }
}

class Child extends Parent {
  constructor() {
    super();
  }
  
  childMethod() {
    this.parentMethod();
  }
}

// 原型链示意图：
// Child.__proto__ === Parent
// Child.prototype.__proto__ === Parent.prototype
// Parent.__proto__ === GrandParent
// Parent.prototype.__proto__ === GrandParent.prototype
```

**高途特色考点：**
- 高频考察 class 语法底层实现
- 考察 super 关键字的两种用法（构造函数和方法中）
- 考察 static 方法的继承机制
- 结合实际项目说明继承的应用场景
- 考察对原型链和面向对象编程的理解

---
