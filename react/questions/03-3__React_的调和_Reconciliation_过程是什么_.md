# 3. React 的调和（Reconciliation）过程是什么？

**答案：**

调和是 React 更新 DOM 的算法过程，决定哪些组件需要更新。

**调和流程：**

1. **触发更新**：`setState` 或 `props` 变化
2. **调度更新**：根据优先级安排任务
3. **render 阶段**：
   - 创建/更新 Fiber 节点
   - 构建 workInProgress 树
   - 计算 Effect List（需要执行的副作用）
4. **commit 阶段**：
   - 执行 DOM 操作
   - 运行 useEffect/useLayoutEffect
   - 更新 ref

**render 阶段（可中断）：**
```javascript
function renderRoot(root) {
  do {
    try {
      workLoopSync(); // 或 workLoopConcurrent()
      break;
    } catch (thrownValue) {
      handleThrow(root, thrownValue);
    }
  } while (true);
}
```

**commit 阶段（不可中断）：**
```javascript
function commitRoot(root) {
  const finishedWork = root.finishedWork;
  
  // 1. Before Mutation
  commitBeforeMutationEffects(finishedWork);
  
  // 2. Mutation（DOM 更新）
  commitMutationEffects(root, finishedWork);
  
  // 3. Layout（useLayoutEffect）
  commitLayoutEffects(finishedWork);
  
  // 4. Passive（useEffect）
  schedulePassiveEffects(finishedWork);
}
```
