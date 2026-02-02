# 7. 请简述 Vue 的响应式原理及数组方法 hack

**答案：**

**Vue 2 使用 Object.defineProperty 实现响应式。**

**响应式原理：**

```javascript
function defineReactive(obj, key, val) {
  const dep = new Dep();
  
  Object.defineProperty(obj, key, {
    get() {
      dep.depend();
      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        val = newVal;
        dep.notify();
      }
    }
  });
}

class Dep {
  constructor() {
    this.subs = [];
  }
  
  depend() {
    if (Dep.target) {
      this.subs.push(Dep.target);
    }
  }
  
  notify() {
    this.subs.forEach(sub => sub.update());
  }
}
```

**数组方法 hack：**

```javascript
// Vue 2 对数组方法进行 hack
const arrayMethods = Object.create(Array.prototype);
const methods = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
];

methods.forEach(method => {
  arrayMethods[method] = function(...args) {
    const result = Array.prototype[method].apply(this, args);
    
    // 触发响应式更新
    const ob = this.__ob__;
    let inserted;
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2);
        break;
    }
    if (inserted) {
      ob.observeArray(inserted);
    }
    ob.dep.notify();
    
    return result;
  };
});
```

**使用示例：**

```javascript
// Vue 2
const vm = new Vue({
  data: {
    items: [1, 2, 3]
  }
});

// 这些方法会触发响应式更新
vm.items.push(4);
vm.items.pop();
vm.items.splice(0, 1);
vm.items.sort((a, b) => a - b);

// 直接修改索引不会触发更新
vm.items[0] = 100; // 不会触发更新

// 使用 Vue.set 或 this.$set 触发更新
Vue.set(vm.items, 0, 100);
vm.$set(vm.items, 0, 100);
```

**富途特色考点：**
- 富途高频考察 Vue 响应式原理
- 结合实际项目说明数组 hack 的应用场景
- 考察对 Vue 2/3 响应式系统差异的理解

---
