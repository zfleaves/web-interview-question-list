# 1. React 的虚拟 DOM 是什么？它是如何提升性能的？

**答案：**

虚拟 DOM（Virtual DOM）是 React 在内存中维护的一个轻量级 JavaScript 对象树，它是真实 DOM 的抽象表示。

**工作原理：**

1. **创建虚拟 DOM**：React 组件返回的 JSX 会被 Babel 编译成 `React.createElement()` 调用，创建虚拟 DOM 节点
2. **Diff 算法**：当状态或 props 改变时，React 创建新的虚拟 DOM 树，与旧树进行对比
3. **最小化更新**：通过 Diff 算法找出差异，只更新需要变化的部分到真实 DOM

**性能提升原因：**

- **批量更新**：React 会收集多个状态变更，一次性批量更新 DOM
- **减少 DOM 操作**：直接操作真实 DOM 开销大（重排、重绘），虚拟 DOM 在内存中操作更高效
- **跨浏览器兼容**：虚拟 DOM 屏蔽了浏览器差异

**Diff 算法核心策略：**

```javascript
// 1. 同层比较：只比较同一层级的节点
// 2. 类型不同：直接替换整个子树
// 3. key 的作用：通过 key 识别节点，提高 Diff 效率

// 示例：key 的重要性
// ❌ 不好的做法
{items.map((item, index) => <Item key={index} />)}

// ✅ 好的做法
{items.map(item => <Item key={item.id} />)}
```
