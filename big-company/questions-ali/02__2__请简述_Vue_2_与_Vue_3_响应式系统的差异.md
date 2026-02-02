# 2. 请简述 Vue 2 与 Vue 3 响应式系统的差异

**答案：**

**Vue 2：Object.defineProperty**

```javascript
// Vue 2 响应式原理
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
```

**Vue 3：Proxy**

```javascript
// Vue 3 响应式原理
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      track(target, key);
      return target[key];
    },
    set(target, key, value) {
      target[key] = value;
      trigger(target, key);
      return true;
    }
  });
}
```

**差异对比：**

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 实现方式 | Object.defineProperty | Proxy |
| 数组监听 | 需要特殊处理 | 原生支持 |
| 新增属性 | 无法监听 | 可以监听 |
| 删除属性 | 无法监听 | 可以监听 |
| 性能 | 较差 | 更好 |
| 兼容性 | IE9+ | IE11+ |

**阿里特色考点：**
- 阿里高频考察 Proxy 的使用场景和优势
- 结合实际项目说明响应式系统的性能优化
- 考察对 Vue 3 Composition API 的理解

---
