# 4. React 的事件系统有什么特点？什么是合成事件？

**答案：**

React 使用合成事件（SyntheticEvent）系统，而不是直接使用浏览器原生事件。

**合成事件特点：**

1. **事件委托**：所有事件委托到 document（React 17 之前）或根容器（React 17+）
2. **跨浏览器兼容**：统一不同浏览器的事件行为
3. **性能优化**：减少事件监听器数量

**事件流程：**

```javascript
// 1. 捕获阶段（React 17+ 支持）
document.addEventListener('click', captureListener, true);

// 2. 冒泡阶段
document.addEventListener('click', bubbleListener, false);

// React 17 之前：所有事件绑定到 document
// React 17+：事件绑定到应用根容器
```

**合成事件对象：**
```javascript
function handleClick(e) {
  // 阻止默认行为
  e.preventDefault();
  
  // 阻止冒泡
  e.stopPropagation();
  
  // 原生事件
  e.nativeEvent;
  
  // 事件需要异步使用时
  e.persist(); // React 17 之前需要
}
```

**事件池（React 17 之前）：**
```javascript
// React 17 之前：事件对象会被复用
function handleClick(e) {
  // ❌ 错误：异步访问会失效
  setTimeout(() => console.log(e.target), 0);
  
  // ✅ 正确：持久化事件对象
  e.persist();
  setTimeout(() => console.log(e.target), 0);
}

// React 17+：不再使用事件池，可以安全异步访问
```
