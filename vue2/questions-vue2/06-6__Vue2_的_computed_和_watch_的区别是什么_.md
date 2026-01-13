# 6. Vue2 的 computed 和 watch 的区别是什么？

**答案：**

**computed（计算属性）：**

```javascript
new Vue({
  data: {
    firstName: 'John',
    lastName: 'Doe'
  },
  computed: {
    // 1. 默认只有 getter
    fullName() {
      return this.firstName + ' ' + this.lastName;
    },
    
    // 2. 可以设置 setter
    fullNameWithSetter: {
      get() {
        return this.firstName + ' ' + this.lastName;
      },
      set(newValue) {
        const names = newValue.split(' ');
        this.firstName = names[0];
        this.lastName = names[1];
      }
    }
  }
});
```

**watch（侦听器）：**

```javascript
new Vue({
  data: {
    question: '',
    answer: 'Questions usually contain a question mark.'
  },
  watch: {
    // 1. 简单侦听
    question(newVal, oldVal) {
      if (newVal.indexOf('?') > -1) {
        this.getAnswer();
      }
    },
    
    // 2. 深度侦听
    user: {
      handler(newVal, oldVal) {
        console.log('user changed');
      },
      deep: true, // 深度侦听对象内部变化
      immediate: true // 立即执行一次
    },
    
    // 3. 侦听对象属性
    'user.name': function(newVal, oldVal) {
      console.log('name changed');
    }
  },
  methods: {
    getAnswer() {
      // ...
    }
  }
});
```

**区别对比：**

| 特性 | computed | watch |
|------|----------|-------|
| 用途 | 计算衍生数据 | 执行异步或开销较大的操作 |
| 缓存 | 有缓存，依赖不变不重新计算 | 无缓存，每次都执行 |
| 返回值 | 必须返回值 | 不需要返回值 |
| 异步 | 不支持异步操作 | 支持异步操作 |
| setter | 可以设置 setter | 不能设置 setter |

**使用场景：**

```javascript
// ✅ computed 适合的场景
computed: {
  // 1. 计算衍生数据
  fullName() {
    return this.firstName + ' ' + this.lastName;
  },
  
  // 2. 过滤列表
  filteredList() {
    return this.list.filter(item => item.active);
  },
  
  // 3. 格式化数据
  formattedDate() {
    return new Date(this.date).toLocaleDateString();
  }
}

// ✅ watch 适合的场景
watch: {
  // 1. 执行异步操作
  keyword(newVal) {
    this.debouncedSearch(newVal);
  },
  
  // 2. 数据变化时执行复杂逻辑
  user: {
    handler(newVal) {
      this.saveUserToLocalStorage(newVal);
    },
    deep: true
  },
  
  // 3. 路由变化时重新加载数据
  '$route'(to, from) {
    this.loadData(to.params.id);
  }
}
```

**computed 实现原理：**

```javascript
class ComputedWatcher extends Watcher {
  constructor(vm, getter, options) {
    super(vm, getter, null, options);
    this.dirty = true; // 标记是否需要重新计算
  }
  
  get() {
    if (this.dirty) {
      this.value = super.get();
      this.dirty = false;
    }
    return this.value;
  }
  
  update() {
    this.dirty = true;
    // 不立即执行，等待被访问时才计算
  }
}
```
