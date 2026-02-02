# 2. 如何实现一个前端状态管理库（类似 Vuex）？

**答案：**

```javascript
// 简化版 Vuex
class Store {
  constructor(options) {
    this.state = options.state || {};
    this.mutations = options.mutations || {};
    this.actions = options.actions || {};
    this.getters = options.getters || {};
    this._subscribers = [];
    
    // 响应式状态
    this._reactiveState = this._makeReactive(this.state);
    
    // 计算属性
    this._computedGetters = {};
    this._setupGetters();
  }
  
  // 创建响应式对象
  _makeReactive(obj) {
    const self = this;
    
    return new Proxy(obj, {
      get(target, key) {
        if (typeof target[key] === 'object' && target[key] !== null) {
          return self._makeReactive(target[key]);
        }
        return target[key];
      },
      set(target, key, value) {
        if (target[key] !== value) {
          target[key] = value;
          self._notify();
        }
        return true;
      }
    });
  }
  
  // 设置 getters
  _setupGetters() {
    for (const key in this.getters) {
      Object.defineProperty(this._computedGetters, key, {
        get: () => this.getters[key](this.state, this.getters)
      });
    }
  }
  
  // 获取 state
  get state() {
    return this._reactiveState;
  }
  
  // 获取 getters
  get getters() {
    return this._computedGetters;
  }
  
  // 提交 mutation
  commit(type, payload) {
    const mutation = this.mutations[type];
    if (mutation) {
      mutation(this.state, payload);
    } else {
      console.error(`Unknown mutation type: ${type}`);
    }
  }
  
  // 分发 action
  dispatch(type, payload) {
    const action = this.actions[type];
    if (action) {
      return action({ commit: this.commit.bind(this), state: this.state }, payload);
    } else {
      console.error(`Unknown action type: ${type}`);
    }
  }
  
  // 订阅状态变化
  subscribe(fn) {
    this._subscribers.push(fn);
    
    // 返回取消订阅函数
    return () => {
      const index = this._subscribers.indexOf(fn);
      if (index > -1) {
        this._subscribers.splice(index, 1);
      }
    };
  }
  
  // 通知订阅者
  _notify() {
    this._subscribers.forEach(fn => fn(this.state));
  }
  
  // 替换 state
  replaceState(newState) {
    this.state = this._makeReactive(newState);
    this._notify();
  }
}
```

---

## 算法题
