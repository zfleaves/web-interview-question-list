## 4. 箭头函数的 this 指向是什么？

**答案：**

### 箭头函数 this 的特点

箭头函数没有自己的 this，它继承定义时外层作用域的 this。

### 示例

```javascript
// 示例 1：全局作用域
var name = 'global';

const obj = {
  name: 'test',
  a: function() {
    console.log(this.name); // 'test'
  },
  b: () => {
    console.log(this.name); // 'global'
  }
};

obj.a(); // 'test'
obj.b(); // 'global'

// 示例 2：对象方法
const obj = {
  name: 'test',
  methods: {
    sayHello: function() {
      console.log(this.name); // 'test'
    },
    sayHello2: () => {
      console.log(this.name); // undefined
    }
  }
};

obj.methods.sayHello(); // 'test'
obj.methods.sayHello2(); // undefined

// 示例 3：定时器
function Person(name) {
  this.name = name;

  // 普通函数 - this 指向 window
  setTimeout(function() {
    console.log(this.name); // undefined
  }, 1000);

  // 箭头函数 - this 继承 Person
  setTimeout(() => {
    console.log(this.name); // 'test'
  }, 1000);
}

const p = new Person('test');

// 示例 4：事件处理
const button = document.querySelector('button');

// 普通函数 - this 指向 button
button.addEventListener('click', function() {
  console.log(this); // button 元素
});

// 箭头函数 - this 继承外层作用域
button.addEventListener('click', () => {
  console.log(this); // window
});

// 示例 5：数组方法
const obj = {
  name: 'test',
  items: [1, 2, 3],
  getDoubled: function() {
    return this.items.map(function(item) {
      return item * 2; // this 不是 obj
    });
  },
  getDoubled2: function() {
    return this.items.map(item => {
      return item * 2; // this 继承自 obj
    });
  }
};
```

### 箭头函数 this 的确定时机

箭头函数的 this 在**定义时**就已经确定，而不是在调用时确定。

```javascript
const obj = {
  name: 'test'
};

function fn() {
  return () => {
    console.log(this.name);
  };
}

const arrowFn = fn.call(obj);
arrowFn(); // 'test'（this 继承自 fn 调用时的 this）
```

### 常见陷阱

```javascript
// 陷阱 1：对象方法的箭头函数
const obj = {
  name: 'test',
  getName: () => {
    return this.name; // this 不是 obj
  }
};

console.log(obj.getName()); // undefined

// 正确做法
const obj = {
  name: 'test',
  getName() {
    return this.name; // this 是 obj
  }
};

// 陷阱 2：原型方法的箭头函数
function Person(name) {
  this.name = name;
}

Person.prototype.getName = () => {
  return this.name; // this 不是实例
};

const p = new Person('test');
console.log(p.getName()); // undefined

// 正确做法
Person.prototype.getName = function() {
  return this.name; // this 是实例
};

// 陷阱 3：事件处理
class Button {
  constructor() {
    this.count = 0;
    this.button = document.querySelector('button');
    this.button.addEventListener('click', () => {
      this.count++; // this 是 Button 实例
      console.log(this.count);
    });
  }
}

// 或者使用 bind
class Button {
  constructor() {
    this.count = 0;
    this.button = document.querySelector('button');
    this.button.addEventListener('click', this.handleClick.bind(this));
  }

  handleClick() {
    this.count++;
    console.log(this.count);
  }
}
```

---
