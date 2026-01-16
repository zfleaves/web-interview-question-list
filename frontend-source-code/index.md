# 前端框架源码理解

本目录包含 Vue2、Vue3 和 React 的高频底层源码面试题，每个题目都包含详细的源码解析、使用场景和简化版实现。

## 目录结构

```
frontend-source-code/
├── vue2/           # Vue2 源码面试题
├── vue3/           # Vue3 源码面试题
└── react/          # React 源码面试题
```

## Vue2 源码面试题

### 1. [Vue2 双向绑定原理](./vue2/01__Vue2双向绑定原理.md)
- **核心概念**：Object.defineProperty + 发布订阅模式
- **源码实现**：Observer、Dep、Watcher 的实现
- **使用场景**：表单双向绑定、计算属性、侦听器
- **简化版实现**：完整的响应式系统示例

### 2. [Vue2 Diff 算法原理](./vue2/02__Vue2_Diff算法原理.md)
- **核心概念**：同层比较、双端比较、key 优化
- **源码实现**：patch、patchVnode、updateChildren
- **使用场景**：列表渲染、动态组件、条件渲染
- **简化版实现**：双端 Diff 算法示例

### 3. [Vue2 nextTick 原理](./vue2/03__Vue2_nextTick原理.md)
- **核心概念**：异步更新 DOM、微任务优先
- **源码实现**：nextTick、Watcher 更新队列
- **使用场景**：DOM 更新后操作、获取更新后的 DOM
- **简化版实现**：Promise + 队列实现

### 4. [Vue2 keep-alive 原理](./vue2/04__Vue2_keep-alive原理.md)
- **核心概念**：缓存组件实例、LRU 缓存策略
- **源码实现**：keep-alive 组件、生命周期钩子
- **使用场景**：列表页面缓存、表单页面缓存
- **简化版实现**：LRU 缓存实现

### 5. [Vue2 computed 和 watch 原理](./vue2/05__Vue2_computed和watch原理.md)
- **核心概念**：计算属性缓存、侦听器监听
- **源码实现**：computed watcher、user watcher
- **使用场景**：派生数据、异步操作
- **简化版实现**：computed 和 watch 实现

### 6. [Vue2 自定义指令原理](./vue2/06__Vue2自定义指令原理.md)
- **核心概念**：指令钩子函数、生命周期
- **源码实现**：指令注册、解析、执行
- **使用场景**：自动聚焦、权限控制、懒加载
- **简化版实现**：指令系统实现

## Vue3 源码面试题

### 1. [Vue3 ref 和 reactive 原理](./vue3/01__Vue3_ref和reactive原理.md)
- **核心概念**：Proxy 响应式、ref 包装
- **源码实现**：RefImpl、reactive、依赖收集
- **使用场景**：基本类型响应式、对象响应式
- **简化版实现**：Proxy 响应式系统

### 2. [Vue3 computed 原理](./vue3/02__Vue3_computed原理.md)
- **核心概念**：懒计算、缓存、自动依赖收集
- **源码实现**：ComputedRefImpl、ReactiveEffect
- **使用场景**：派生数据、复杂计算
- **简化版实现**：computed 实现

### 3. [Vue3 watch 和 watchEffect 原理](./vue3/03__Vue3_watch和watchEffect原理.md)
- **核心概念**：显式监听、自动收集依赖
- **源码实现**：watch、watchEffect、调度器
- **使用场景**：监听数据变化、副作用处理
- **简化版实现**：watch 和 watchEffect 实现

### 4. [Vue3 Diff 算法原理](./vue3/04__Vue3_Diff算法原理.md)
- **核心概念**：最长递增子序列、最小化移动
- **源码实现**：patchKeyedChildren、getSequence
- **使用场景**：列表渲染优化、虚拟滚动
- **简化版实现**：LIS 算法示例

## React 源码面试题

### 1. [React 虚拟 DOM 原理](./react/01__React虚拟DOM原理.md)
- **核心概念**：轻量级 JavaScript 对象、批量更新
- **源码实现**：ReactElement、Fiber、Diff 算法
- **使用场景**：声明式渲染、组件化开发
- **简化版实现**：虚拟 DOM 实现

### 2. [React Fiber 架构原理](./react/02__React_Fiber架构原理.md)
- **核心概念**：可中断渲染、优先级调度、双缓冲
- **源码实现**：Fiber 节点、workLoop、调度器
- **使用场景**：大列表渲染、动画优化
- **简化版实现**：Fiber 架构实现

### 3. [React Hooks 原理](./react/03__React_Hooks原理.md)
- **核心概念**：状态复用、副作用处理、性能优化
- **源码实现**：useState、useEffect、useMemo、useCallback
- **使用场景**：组件状态管理、副作用处理
- **简化版实现**：Hooks 实现

## 学习建议

### 1. 学习顺序
1. 先学习 Vue2 的基础原理（双向绑定、Diff 算法）
2. 再学习 Vue3 的改进（Proxy、LIS 算法）
3. 最后学习 React 的架构（虚拟 DOM、Fiber、Hooks）

### 2. 学习方法
1. **理解核心概念**：先理解每个概念的作用和原理
2. **阅读源码实现**：理解源码的核心逻辑和数据结构
3. **研究简化版实现**：通过简化版加深理解
4. **实践使用场景**：在实际项目中应用所学知识

### 3. 面试准备
1. **掌握核心原理**：理解每个技术的核心原理
2. **对比不同方案**：了解不同方案的优缺点
3. **能够手写实现**：能够手写简化版实现
4. **结合实际场景**：能够结合实际场景说明使用方法

## 常见面试问题

### Vue 相关
1. Vue2 和 Vue3 的响应式原理有什么区别？
2. Vue2 和 Vue3 的 Diff 算法有什么区别？
3. computed 和 watch 的区别是什么？
4. nextTick 的作用是什么？如何实现？
5. keep-alive 的原理是什么？

### React 相关
1. 虚拟 DOM 的优势是什么？
2. Fiber 架构解决了什么问题？
3. Hooks 的实现原理是什么？
4. React 的 Diff 算法策略是什么？
5. useState 和 useEffect 的执行时机是什么？

## 参考资料

- [Vue2 源码](https://github.com/vuejs/vue/tree/2.6/src)
- [Vue3 源码](https://github.com/vuejs/core/tree/main/packages)
- [React 源码](https://github.com/facebook/react/tree/main/packages)

## 贡献

欢迎提交 PR 和 Issue，完善源码面试题的内容。

## 许可证

MIT License