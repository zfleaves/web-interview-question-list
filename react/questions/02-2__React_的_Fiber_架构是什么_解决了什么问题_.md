# 2. React 的 Fiber 架构是什么？解决了什么问题？

**答案：**

Fiber 是 React 16 引入的协调（Reconciliation）机制的重构，是 React 内部的调度算法。

**解决的问题：**

1. **同步阻塞问题**：旧版 React 使用递归进行 Diff，一旦开始就无法中断，大型应用会导致主线程阻塞
2. **优先级调度**：无法区分任务优先级，所有任务平等执行
3. **动画卡顿**：长任务占用主线程，导致动画掉帧

**Fiber 核心特性：**

1. **可中断的渲染**：
```javascript
// Fiber 将渲染工作分解为小单元
function workLoop() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}

// 可以在浏览器空闲时间执行
requestIdleCallback(workLoop);
```

2. **双缓存技术**：
- `current`：当前屏幕上显示的树
- `workInProgress`：正在构建的树
- 完成后交换指针，实现无闪烁切换

3. **优先级调度**：
```javascript
// 不同任务有不同优先级
const schedulerPriority = {
  ImmediatePriority: 1,      // 同步任务
  UserBlockingPriority: 2,   // 用户交互
  NormalPriority: 3,         // 正常更新
  LowPriority: 4,            // 低优先级
  IdlePriority: 5,           // 空闲时执行
};
```

4. **时间切片**：将长任务拆分成小块，每块执行时间控制在 5ms 左右
