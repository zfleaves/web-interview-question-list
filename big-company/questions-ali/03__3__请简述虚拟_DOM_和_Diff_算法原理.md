# 3. 请简述虚拟 DOM 和 Diff 算法原理

**答案：**

**虚拟 DOM 是 React/Vue 在内存中维护的轻量级 JavaScript 对象树。**

**Diff 算法核心策略：**

1. **同层比较**：只比较同一层级的节点
2. **类型不同**：直接替换整个子树
3. **key 的作用**：通过 key 识别节点，提高 Diff 效率

**简化版 Diff 算法：**

```javascript
function diff(oldNode, newNode) {
  // 1. 节点类型不同，直接替换
  if (oldNode.type !== newNode.type) {
    return newNode;
  }
  
  // 2. 属性比较
  const props = diffProps(oldNode.props, newNode.props);
  
  // 3. 子节点比较
  const children = diffChildren(oldNode.children, newNode.children);
  
  return { ...newNode, props, children };
}

function diffChildren(oldChildren, newChildren) {
  const patches = [];
  
  // 使用 key 进行节点匹配
  oldChildren.forEach((oldChild, i) => {
    const newChild = newChildren.find(
      child => child.key === oldChild.key
    );
    
    if (newChild) {
      const patch = diff(oldChild, newChild);
      patches.push(patch);
    } else {
      patches.push({ type: 'REMOVE' });
    }
  });
  
  // 添加新节点
  newChildren.forEach((newChild, i) => {
    if (!oldChildren.find(child => child.key === newChild.key)) {
      patches.push({ type: 'ADD', node: newChild });
    }
  });
  
  return patches;
}
```

**阿里特色考点：**
- 阿里高频考察 Diff 算法的时间复杂度优化
- 结合实际项目说明虚拟 DOM 的性能优势
- 考察对 React Fiber 调度机制的理解

---
