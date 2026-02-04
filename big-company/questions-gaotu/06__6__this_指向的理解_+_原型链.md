# 6. this 指向的理解 + 原型链

**答案：**

**this 指向：**

```javascript
const obj = {
  name: '张三',
  age: 18,
  sayName: function() {
    console.log(this.name);
  }
};

obj.sayName(); // this 指向 obj
```

**原型链：**

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.sayName = function() {
  console.log(this.name);
};

const person = new Person('李四');
person.sayName(); // this 指向 Person.prototype
```

**原型链查找：**

```javascript
person.sayName(); // 先在实例找，没有再去原型
person.hasOwnProperty('sayName'); // false

Person.prototype.hasOwnProperty('sayName'); // true
```

**原型链继承：**

```javascript
function Student(name) {
  Person.call(this, name);
}

Student.prototype = Object.create(Person.prototype);
Student.prototype.study = function() {
  console.log(this.name + '在学习');
};

const student = new Student('王五');
student.study(); // this 指向 Student.prototype
```

**高途特色考点：**
- 高频考察 this 指向和原型链的理解
- 结合实际项目说明继承的使用场景
- 考察对面向对象编程的理解

---
