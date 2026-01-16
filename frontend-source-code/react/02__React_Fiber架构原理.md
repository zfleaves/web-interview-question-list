# React Fiber 架构原理

## 核心概念

Fiber 是 React 16 引入的新的协调算法，用于解决 React 15 中的性能问题，实现可中断的渲染。

**核心特性：**
- 可中断的渲染：将渲染任务拆分为小单元
- 优先级调度：根据任务优先级执行渲染
- 双缓冲技术：使用 current 和 workInProgress 两棵树
- 时间切片：利用 requestIdleCallback 分片执行

## 源码核心实现

### 1. Fiber 节点结构

```javascript
// Fiber 节点结构
function FiberNode(tag, pendingProps, key, mode) {
  // 实例类型
  this.tag = tag;
  
  // 唯一标识
  this.key = key;
  
  // 元素类型
  this.elementType = null;
  this.type = null;
  
  // 对应的真实 DOM 或组件实例
  this.stateNode = null;
  
  // Fiber 树结构
  this.return = null; // 父节点
  this.child = null; // 第一个子节点
  this.sibling = null; // 下一个兄弟节点
  this.index = 0; // 在兄弟节点中的索引
  
  // ref 引用
  this.ref = null;
  
  // 更新相关
  this.pendingProps = pendingProps; // 待处理的 props
  this.memoizedProps = null; // 上次渲染使用的 props
  this.updateQueue = null; // 更新队列
  this.memoizedState = null; // 上次渲染使用的 state
  this.dependencies = null; // 依赖（context 等）
  
  // 模式
  this.mode = mode;
  
  // 副作用标记
  this.flags = NoFlags;
  this.subtreeFlags = NoFlags;
  this.deletions = null;
  
  // 调度优先级
  this.lanes = NoLanes;
  this.childLanes = NoLanes;
  
  // 双缓冲：指向另一个 Fiber 节点
  this.alternate = null;
}

// Fiber 标签类型
const FunctionComponent = 0;
const ClassComponent = 1;
const IndeterminateComponent = 2;
const HostRoot = 3;
const HostPortal = 4;
const HostComponent = 5;
const HostText = 6;
const Fragment = 7;
const Mode = 8;
const ContextConsumer = 9;
const ContextProvider = 10;
const ForwardRef = 11;
const Profiler = 12;
const SuspenseComponent = 13;
const MemoComponent = 14;
const SimpleMemoComponent = 15;
const LazyComponent = 16;

// 副作用标志位
const NoFlags = 0b0000000000000000000000000000000;
const Placement = 0b0000000000000000000000000000010; // 插入
const Update = 0b0000000000000000000000000000100; // 更新
const Deletion = 0b0000000000000000000000000001000; // 删除
const ChildDeletion = 0b0000000000000000000000000010000; // 子节点删除
const Passive = 0b0000000000000000000000000100000; // useEffect
const Ref = 0b0000000000000000000000001000000; // ref
const Snapshot = 0b0000000000000000000000010000000; // getSnapshotBeforeUpdate
const Layout = 0b0000000000000000000000100000000; // useLayoutEffect
const MutationMask = 0b0000000000000000000000100110; // Mutation 阶段的副作用
const PassiveMask = 0b0000000000000000000000100000; // Passive 阶段的副作用
```

### 2. Fiber 树的遍历

```javascript
// workInProgress - 当前正在工作的 Fiber 节点
let workInProgress = null;

// performUnitOfWork - 处理单个 Fiber 节点
function performUnitOfWork(unitOfWork) {
  const current = unitOfWork.alternate;
  let next;
  
  // 开始阶段：创建子节点
  next = beginWork(current, unitOfWork, renderLanes);
  
  // 如果没有子节点，完成当前节点
  if (next === null) {
    next = completeUnitOfWork(unitOfWork);
  }
  
  return next;
}

// workLoop - 工作循环
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}

// shouldYield - 判断是否需要让出控制权
function shouldYield() {
  return getCurrentTime() >= deadline;
}
```

### 3. beginWork - 开始阶段

```javascript
// beginWork - 开始处理节点
function beginWork(current, workInProgress, renderLanes) {
  const updateQueue = workInProgress.updateQueue;
  
  // 根据 tag 类型处理不同的节点
  switch (workInProgress.tag) {
    case FunctionComponent: {
      const Component = workInProgress.type;
      const resolvedProps = workInProgress.pendingProps;
      return updateFunctionComponent(current, workInProgress, Component, resolvedProps, renderLanes);
    }
    case ClassComponent: {
      const Component = workInProgress.type;
      const resolvedProps = workInProgress.pendingProps;
      return updateClassComponent(current, workInProgress, Component, resolvedProps, renderLanes);
    }
    case HostRoot: {
      return updateHostRoot(current, workInProgress, renderLanes);
    }
    case HostComponent: {
      const type = workInProgress.type;
      const resolvedProps = workInProgress.pendingProps;
      return updateHostComponent(current, workInProgress, type, resolvedProps, renderLanes);
    }
    case HostText: {
      return updateHostText(current, workInProgress);
    }
    case Fragment: {
      return updateFragment(current, workInProgress, renderLanes);
    }
    case ContextProvider: {
      return updateContextProvider(current, workInProgress, renderLanes);
    }
    case ContextConsumer: {
      return updateContextConsumer(current, workInProgress, renderLanes);
    }
    default: {
      throw new Error('Unknown unit of work tag');
    }
  }
}

// updateFunctionComponent - 更新函数组件
function updateFunctionComponent(current, workInProgress, Component, nextProps, renderLanes) {
  const context = readContext(workInProgress.context);
  let nextChildren;
  prepareToReadContext(workInProgress, renderLanes);
  
  // 执行函数组件
  nextChildren = renderWithHooks(current, workInProgress, Component, nextProps, context, renderLanes);
  
  // 协调子节点
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}

// updateClassComponent - 更新类组件
function updateClassComponent(current, workInProgress, Component, nextProps, renderLanes) {
  const context = readContext(workInProgress.context);
  
  // 处理组件实例
  let instance = workInProgress.stateNode;
  let shouldUpdate;
  
  if (instance === null) {
    // 首次挂载
    constructClassInstance(workInProgress, Component, nextProps);
    mountClassInstance(workInProgress, Component, nextProps, renderLanes);
    shouldUpdate = true;
  } else if (current === null) {
    // 组件卸载后重新挂载
    shouldUpdate = resumeMountClassInstance(workInProgress, Component, nextProps, renderLanes);
  } else {
    // 更新
    shouldUpdate = updateClassInstance(current, workInProgress, Component, nextProps, renderLanes);
  }
  
  // 获取子节点
  const nextChildren = instance.render();
  
  // 协调子节点
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}
```

### 4. completeUnitOfWork - 完成阶段

```javascript
// completeUnitOfWork - 完成节点处理
function completeUnitOfWork(unitOfWork) {
  let completedWork = unitOfWork;
  do {
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;
    
    // 完成阶段
    if ((completedWork.flags & Incomplete) === NoFlags) {
      setCurrentDebugFiberInDEV(completedWork);
      const next = completeWork(current, completedWork, subtreeRenderLanes);
      resetCurrentDebugFiberInDEV();
      
      if (next !== null) {
        return next;
      }
    } else {
      // 处理错误
      const next = unwindWork(completedWork, subtreeRenderLanes);
      resetCurrentDebugFiberInDEV();
      if (next !== null) {
        return next;
      }
    }
    
    // 查找兄弟节点
    const siblingFiber = completedWork.sibling;
    if (siblingFiber !== null) {
      workInProgress = siblingFiber;
      return siblingFiber;
    }
    
    // 没有兄弟节点，返回父节点
    completedWork = returnFiber;
    workInProgress = completedWork;
  } while (completedWork !== null);
  
  // 返回 null，表示完成
  return null;
}

// completeWork - 完成节点工作
function completeWork(current, workInProgress, renderLanes) {
  const newProps = workInProgress.pendingProps;
  
  switch (workInProgress.tag) {
    case FunctionComponent:
    case ClassComponent:
    case IndeterminateComponent:
    case Fragment: {
      return null;
    }
    case HostRoot: {
      updateHostContainer(workInProgress);
      return null;
    }
    case HostComponent: {
      // 创建或更新 DOM
      const type = workInProgress.type;
      if (current !== null && workInProgress.stateNode != null) {
        // 更新 DOM
        updateHostComponent(current, workInProgress, type, newProps);
      } else {
        // 创建 DOM
        const instance = createInstance(type, newProps, workInProgress);
        workInProgress.stateNode = instance;
        
        // 处理子节点
        appendAllChildren(instance, workInProgress);
        
        // 处理 ref
        if (workInProgress.ref !== null) {
          markRef(workInProgress);
        }
      }
      return null;
    }
    case HostText: {
      const newText = newProps;
      if (current !== null && workInProgress.stateNode != null) {
        // 更新文本
        const oldText = current.memoizedProps;
        updateHostText(current, workInProgress, oldText, newText);
      } else {
        // 创建文本节点
        workInProgress.stateNode = createTextInstance(newText);
      }
      return null;
    }
    // ... 更多节点类型
  }
}
```

### 5. 调度器

```javascript
// 调度器相关
let callbackID = 0;
let isFlushing = false;
let isHostCallbackScheduled = false;

// scheduleCallback - 调度回调
function scheduleCallback(priorityLevel, callback, options) {
  const currentTime = getCurrentTime();
  
  const startTime = options !== null && options.timeout !== undefined
    ? currentTime + options.timeout
    : currentTime + timeoutForPriorityLevel(priorityLevel);
  
  const newTask = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime: startTime,
    sortIndex: -1,
  };
  
  if (startTime > currentTime) {
    // 延迟任务
    newTask.sortIndex = startTime;
    push(timerQueue, newTask);
    
    if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
      if (isHostTimeoutScheduled) {
        cancelHostTimeout();
      } else {
        isHostTimeoutScheduled = true;
      }
      requestHostTimeout(handleTimeout, startTime - currentTime);
    }
  } else {
    // 立即任务
    newTask.sortIndex = expirationTime;
    push(taskQueue, newTask);
    
    if (!isHostCallbackScheduled && !isPerformingWork) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    }
  }
  
  return newTask;
}

// flushWork - 刷新工作
function flushWork(hasTimeRemaining, initialTime) {
  isHostCallbackScheduled = false;
  isPerformingWork = true;
  
  try {
    return workLoop(hasTimeRemaining, initialTime);
  } finally {
    isPerformingWork = false;
  }
}

// workLoop - 工作循环
function workLoop(hasTimeRemaining, initialTime) {
  let currentTime = initialTime;
  advanceTimers(currentTime);
  
  currentTask = peek(taskQueue);
  
  while (currentTask !== null && !(enableSchedulerDebugging && isSchedulerPaused)) {
    if (currentTask.expirationTime > currentTime && (!hasTimeRemaining || shouldYieldToHost())) {
      break;
    }
    
    const callback = currentTask.callback;
    if (typeof callback === 'function') {
      currentTask.callback = null;
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
      
      const continuationCallback = callback(didUserCallbackTimeout);
      currentTime = getCurrentTime();
      
      if (typeof continuationCallback === 'function') {
        currentTask.callback = continuationCallback;
      } else {
        if (currentTask === peek(taskQueue)) {
          pop(taskQueue);
        }
      }
    } else {
      pop(taskQueue);
    }
    
    advanceTimers(currentTime);
    currentTask = peek(taskQueue);
  }
  
  if (currentTask !== null) {
    return true;
  } else {
    const firstTimer = peek(timerQueue);
    if (firstTimer !== null) {
      requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
    }
    return false;
  }
}

// requestHostCallback - 请求主机回调
function requestHostCallback(callback) {
  scheduledCallback = callback;
  scheduledHostCallback = true;
  
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    schedulePerformWorkUntilDeadline();
  }
}

// schedulePerformWorkUntilDeadline - 调度执行直到截止时间
function schedulePerformWorkUntilDeadline() {
  port.postMessage(null);
}

// 处理消息
channel.port1.onmessage = performWorkUntilDeadline;

function performWorkUntilDeadline() {
  if (isHostCallbackScheduled) {
    isHostCallbackScheduled = false;
    scheduledHostCallback = false;
    scheduledCallback(deadline);
  }
}
```

## 简化版实现

```javascript
// 简化版 Fiber
let wipRoot = null;
let nextUnitOfWork = null;
let currentRoot = null;
let deletions = null;

// 简化版 Fiber 节点
function createFiber(element, parent) {
  return {
    type: element.type,
    props: element.props,
    dom: null,
    parent: parent,
    child: null,
    sibling: null,
    alternate: null,
    effectTag: null
  };
}

// performUnitOfWork - 处理单个 Fiber 节点
function performUnitOfWork(fiber) {
  // 1. 创建 DOM
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  
  // 2. 创建子节点 Fiber
  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);
  
  // 3. 返回下一个工作单元
  if (fiber.child) {
    return fiber.child;
  }
  
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

// workLoop - 工作循环
function workLoop(deadline) {
  let shouldYield = false;
  
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
  
  requestIdleCallback(workLoop);
}

// commitRoot - 提交阶段
function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  
  const domParent = fiber.parent.dom;
  
  if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === 'DELETION') {
    domParent.removeChild(fiber.dom);
  }
  
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

// 使用示例
const element = h('div', { className: 'container' },
  h('h1', null, 'Hello Fiber'),
  h('p', null, 'This is Fiber architecture')
);

render(element, document.getElementById('root'));
```

## 使用场景

1. **大列表渲染**：利用时间切片避免卡顿
2. **动画优化**：优先级调度保证动画流畅
3. **复杂组件**：可中断渲染提高响应性
4. **Concurrent Mode**：实现并发渲染

## 面试要点

1. **Fiber 解决的问题**：
   - React 15 的递归渲染无法中断
   - 大组件渲染导致主线程阻塞
   - 优先级调度无法实现

2. **Fiber 的核心特性**：
   - 可中断的渲染
   - 优先级调度
   - 双缓冲技术
   - 时间切片

3. **Fiber 树的遍历**：
   - 深度优先遍历
   - beginWork 阶段创建子节点
   - completeUnitOfWork 阶段完成节点

4. **双缓冲技术**：
   - current 树：当前显示的树
   - workInProgress 树：正在构建的树
   - 交换两棵树实现更新

5. **时间切片**：
   - 使用 requestIdleCallback
   - 每帧执行一小部分工作
   - 保证主线程响应性

6. **优先级调度**：
   - 不同任务有不同优先级
   - 高优先级任务优先执行
   - 低优先级任务可能被中断

7. **React 18 的改进**：
   - Concurrent Mode
   - Automatic Batching
   - Transitions
   - Suspense 改进

5. **注意事项**：
   - 避免在 render 中执行副作用
   - 使用 useMemo 缓存计算结果
   - 使用 useCallback 缓存函数

9. **性能优化**：
   - 使用 React.memo 避免不必要的渲染
   - 使用 useTransition 标记低优先级更新
   - 使用 useDeferredValue 延迟更新
   - 使用 Suspense 处理异步组件