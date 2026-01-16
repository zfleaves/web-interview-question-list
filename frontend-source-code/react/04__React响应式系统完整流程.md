# React 响应式系统完整流程

## 核心概念

React 的响应式系统通过状态管理和视图更新实现，从 setState 到 DOM 更新涉及多个核心模块的协同工作。

**完整流程：**
1. **状态更新**：调用 setState 或 dispatch 更新状态
2. **创建更新对象**：创建 Update 对象并加入更新队列
3. **调度更新**：通过 Scheduler 调度更新的执行时机
4. **开始渲染**：开始 workLoop，处理 Fiber 节点
5. **协调阶段**：对比新旧 Fiber，确定需要更新的部分
6. **提交阶段**：将变更应用到 DOM
7. **视图更新**：完成 DOM 更新，执行副作用

## 1. 状态更新阶段

### 1.1 setState 的实现

```javascript
// Component.prototype.setState
Component.prototype.setState = function(partialState, callback) {
  // 获取当前组件的 updater
  const updater = this.updater;
  
  if (typeof updater === 'function') {
    // 使用 updater.enqueueSetState
    updater.enqueueSetState(this, partialState, callback, 'setState');
  } else {
    // 兼容旧版本
    this.state = partialState;
  }
};

// classComponentUpdater
const classComponentUpdater = {
  // 加入状态更新队列
  enqueueSetState(inst, payload, callback) {
    // 获取 Fiber 实例
    const fiber = get(inst);
    
    // 计算更新优先级
    const lane = requestUpdateLane(fiber);
    
    // 创建更新对象
    const update = createUpdate(lane);
    update.payload = payload;
    
    // 如果有回调，添加到 update
    if (callback !== undefined && callback !== null) {
      update.callback = callback;
    }
    
    // 将 update 加入更新队列
    enqueueUpdate(fiber, update);
    
    // 调度更新
    scheduleUpdateOnFiber(fiber, lane);
  },
  
  // 加入替换状态队列
  enqueueReplaceState(inst, payload, callback) {
    const fiber = get(inst);
    const lane = requestUpdateLane(fiber);
    const update = createUpdate(lane);
    update.tag = ReplaceState;
    update.payload = payload;
    
    if (callback !== undefined && callback !== null) {
      update.callback = callback;
    }
    
    enqueueUpdate(fiber, update);
    scheduleUpdateOnFiber(fiber, lane);
  },
  
  // 加入 forceUpdate 队列
  enqueueForceUpdate(inst, callback) {
    const fiber = get(inst);
    const lane = requestUpdateLane(fiber);
    const update = createUpdate(lane);
    update.tag = ForceUpdate;
    
    if (callback !== undefined && callback !== null) {
      update.callback = callback;
    }
    
    enqueueUpdate(fiber, update);
    scheduleUpdateOnFiber(fiber, lane);
  }
};
```

### 1.2 创建 Update 对象

```javascript
// createUpdate - 创建更新对象
function createUpdate(lane) {
  const update = {
    lane: lane, // 优先级
    tag: 0, // 更新类型
    payload: null, // 更新内容
    callback: null, // 回调函数
    next: null, // 下一个 update
  };
  return update;
}

// enqueueUpdate - 将 update 加入队列
function enqueueUpdate(fiber, update) {
  const updateQueue = fiber.updateQueue;
  
  if (updateQueue === null) {
    // 如果没有更新队列，创建一个
    fiber.updateQueue = {
      baseState: null,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: {
        pending: null,
      },
      effects: null,
    };
  }
  
  const sharedQueue = updateQueue.shared;
  const pending = sharedQueue.pending;
  
  if (pending === null) {
    // 队列为空
    update.next = update;
  } else {
    // 队列不为空，加入队列尾部
    update.next = pending.next;
    pending.next = update;
  }
  
  sharedQueue.pending = update;
}
```

## 2. 调度更新阶段

### 2.1 scheduleUpdateOnFiber

```javascript
// scheduleUpdateOnFiber - 调度更新
function scheduleUpdateOnFiber(fiber, lane, eventTime) {
  // 检查是否在渲染中
  if (lane === SyncLane) {
    // 同步更新
    ensureRootIsScheduled(root, eventTime);
    
    // 如果在渲染中，需要中断
    if (executionContext === NoContext) {
      flushSyncCallbacks();
    }
  } else {
    // 异步更新
    ensureRootIsScheduled(root, eventTime);
    
    // 如果在渲染中，需要中断
    if (executionContext !== NoContext) {
      schedulePendingInteractions(root, lane);
    }
  }
}

// ensureRootIsScheduled - 确保 root 已调度
function ensureRootIsScheduled(root, currentTime) {
  const existingCallbackNode = root.callbackNode;
  
  // 获取下一个过期时间
  const nextLanes = getNextLanes(root, root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes);
  const newCallbackPriority = getHighestPriorityLane(nextLanes);
  
  // 如果没有需要处理的 lanes，取消调度
  if (newCallbackPriority === NoLane) {
    if (existingCallbackNode !== null) {
      cancelCallback(existingCallbackNode);
      root.callbackNode = null;
      root.callbackPriority = NoLane;
    }
    return;
  }
  
  // 检查是否需要新的调度
  if (existingCallbackNode !== null) {
    const existingCallbackPriority = root.callbackPriority;
    
    // 如果新的优先级更高，取消旧的调度
    if (existingCallbackPriority !== newCallbackPriority) {
      cancelCallback(existingCallbackNode);
    }
  }
  
  // 调度新的回调
  let newCallbackNode;
  
  if (newCallbackPriority === SyncLane) {
    // 同步更新
    newCallbackNode = scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
  } else if (newCallbackPriority === SyncBatchedLane) {
    // 批量同步更新
    newCallbackNode = scheduleCallback(ImmediatePriority, performSyncWorkOnRoot.bind(null, root));
  } else {
    // 异步更新
    const schedulerPriorityLevel = lanePriorityToSchedulerPriority(newCallbackPriority);
    newCallbackNode = scheduleCallback(schedulerPriorityLevel, performConcurrentWorkOnRoot.bind(null, root));
  }
  
  root.callbackNode = newCallbackNode;
  root.callbackPriority = newCallbackPriority;
}
```

### 2.2 Scheduler 调度器

```javascript
// scheduleCallback - 调度回调
function scheduleCallback(priorityLevel, callback) {
  const currentTime = getCurrentTime();
  
  // 计算开始时间
  const startTime = currentTime + timeoutForPriorityLevel(priorityLevel);
  
  // 创建任务
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
```

## 3. 开始渲染阶段

### 3.1 performSyncWorkOnRoot / performConcurrentWorkOnRoot

```javascript
// performSyncWorkOnRoot - 同步执行工作
function performSyncWorkOnRoot(root) {
  const lanes = getNextLanes(root, NoLanes);
  const exitStatus = renderRootSync(root, lanes);
  
  if (exitStatus !== RootIncomplete) {
    const finishedWork = root.current.alternate;
    root.finishedWork = finishedWork;
    root.finishedLanes = lanes;
    finishConcurrentRender(root);
  }
  
  return null;
}

// performConcurrentWorkOnRoot - 并发执行工作
function performConcurrentWorkOnRoot(root) {
  const lanes = getNextLanes(root, root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes);
  const exitStatus = renderRootConcurrent(root, lanes);
  
  if (exitStatus !== RootIncomplete) {
    const finishedWork = root.current.alternate;
    root.finishedWork = finishedWork;
    root.finishedLanes = lanes;
    finishConcurrentRender(root);
  }
  
  return null;
}

// renderRootSync - 同步渲染
function renderRootSync(root, lanes) {
  workInProgress = createWorkInProgress(root.current, null);
  workInProgressRoot = root;
  workInProgressRootRenderLanes = lanes;
  
  do {
    try {
      workLoopSync();
      break;
    } catch (thrownValue) {
      handleError(root, thrownValue);
      workInProgress = throwException(root, workInProgress, thrownValue);
      lanes = workInProgressRootRenderLanes;
    }
  } while (true);
  
  return workInProgressRootExitStatus;
}

// renderRootConcurrent - 并发渲染
function renderRootConcurrent(root, lanes) {
  workInProgress = createWorkInProgress(root.current, null);
  workInProgressRoot = root;
  workInProgressRootRenderLanes = lanes;
  
  do {
    try {
      workLoopConcurrent();
      break;
    } catch (thrownValue) {
      handleError(root, thrownValue);
      workInProgress = throwException(root, workInProgress, thrownValue);
      lanes = workInProgressRootRenderLanes;
    }
  } while (true);
  
  return workInProgressRootExitStatus;
}
```

### 3.2 workLoop - 工作循环

```javascript
// workLoopSync - 同步工作循环
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

// workLoopConcurrent - 并发工作循环
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}

// shouldYield - 判断是否应该让出控制权
function shouldYield() {
  return getCurrentTime() >= deadline;
}
```

## 4. 协调阶段

### 4.1 performUnitOfWork

```javascript
// performUnitOfWork - 处理单个工作单元
function performUnitOfWork(unitOfWork) {
  const current = unitOfWork.alternate;
  
  // 开始阶段
  let next;
  if (current === null) {
    // 首次渲染
    next = beginWork(unitOfWork);
  } else {
    // 更新渲染
    next = beginWork(unitOfWork, current);
  }
  
  // 设置下一个工作单元
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  
  if (next === null) {
    // 没有子节点，完成当前节点
    completeUnitOfWork(unitOfWork);
  } else {
    // 有子节点，处理子节点
    workInProgress = next;
  }
}

// beginWork - 开始工作
function beginWork(current, workInProgress) {
  const updateQueue = workInProgress.updateQueue;
  
  // 根据 tag 类型处理不同的节点
  switch (workInProgress.tag) {
    case FunctionComponent: {
      return updateFunctionComponent(current, workInProgress, Component, resolvedProps, renderLanes);
    }
    case ClassComponent: {
      return updateClassComponent(current, workInProgress, Component, resolvedProps, renderLanes);
    }
    case HostRoot: {
      return updateHostRoot(current, workInProgress, renderLanes);
    }
    case HostComponent: {
      return updateHostComponent(current, workInProgress, renderLanes);
    }
    case HostText: {
      return updateHostText(current, workInProgress);
    }
    default: {
      throw new Error('Unknown unit of work tag');
    }
  }
}
```

### 4.2 updateClassComponent

```javascript
// updateClassComponent - 更新类组件
function updateClassComponent(current, workInProgress, Component, nextProps, renderLanes) {
  const context = readContext(workInProgress.context);
  
  // 处理组件实例
  let instance = workInProgress.stateNode;
  
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

// updateClassInstance - 更新类组件实例
function updateClassInstance(current, workInProgress, Component, nextProps, renderLanes) {
  const instance = workInProgress.stateNode;
  const oldProps = workInProgress.memoizedProps;
  const oldState = instance.state;
  
  // 处理更新队列
  processUpdateQueue(workInProgress, nextProps, instance, renderLanes);
  
  // 获取新的 state
  const newState = instance.state;
  
  // 检查是否需要更新
  const shouldUpdate = checkHasForceWorkAfterProcessing() || checkShouldComponentUpdate(workInProgress, Component, oldProps, nextProps, oldState, newState);
  
  return shouldUpdate;
}

// processUpdateQueue - 处理更新队列
function processUpdateQueue(workInProgress, props, instance, renderLanes) {
  const queue = workInProgress.updateQueue;
  
  // 合并更新
  let firstBaseUpdate = queue.firstBaseUpdate;
  let lastBaseUpdate = queue.lastBaseUpdate;
  const pendingQueue = queue.shared.pending;
  
  if (pendingQueue !== null) {
    queue.shared.pending = null;
    const lastPendingUpdate = pendingQueue;
    const firstPendingUpdate = lastPendingUpdate.next;
    
    if (lastBaseUpdate === null) {
      firstBaseUpdate = firstPendingUpdate;
    } else {
      lastBaseUpdate.next = firstPendingUpdate;
    }
    
    lastBaseUpdate = lastPendingUpdate;
  }
  
  // 处理更新
  let newState = instance.state;
  let update = firstBaseUpdate;
  
  while (update !== null) {
    const { payload, callback } = update;
    
    // 合并 state
    if (typeof payload === 'function') {
      const nextState = payload.call(instance, newState, nextProps);
      newState = nextState;
    } else {
      newState = { ...newState, ...payload };
    }
    
    // 执行回调
    if (callback !== null) {
      workInProgress.flags |= Callback;
      const effects = queue.effects;
      if (effects === null) {
        queue.effects = [callback];
      } else {
        effects.push(callback);
      }
    }
    
    update = update.next;
  }
  
  instance.state = newState;
}
```

### 4.3 reconcileChildren - 协调子节点

```javascript
// reconcileChildren - 协调子节点
function reconcileChildren(current, workInProgress, nextChildren, renderLanes) {
  if (current === null) {
    // 首次渲染
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren, renderLanes);
  } else {
    // 更新渲染
    workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren, renderLanes);
  }
}

// reconcileChildFibers - 协调子节点 Fiber
function reconcileChildFibers(returnFiber, currentFirstChild, newChild, lanes) {
  const isObject = typeof newChild === 'object' && newChild !== null;
  
  if (isObject) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE: {
        return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstChild, newChild, lanes));
      }
    }
  }
  
  if (isArray(newChild)) {
    return reconcileChildrenArray(returnFiber, currentFirstChild, newChild, lanes);
  }
  
  if (typeof newChild === 'string' || typeof newChild === 'number') {
    return placeSingleChild(reconcileSingleTextNode(returnFiber, currentFirstChild, '' + newChild, lanes));
  }
  
  return deleteRemainingChildren(returnFiber, currentFirstChild);
}

// reconcileChildrenArray - 协调数组子节点
function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, lanes) {
  let resultingFirstChild = null;
  let previousNewFiber = null;
  let oldFiber = currentFirstChild;
  let lastPlacedIndex = 0;
  let newIdx = 0;
  let nextOldFiber = null;
  
  // 第一轮：处理相同位置的节点
  for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
    if (oldFiber.index > newIdx) {
      nextOldFiber = oldFiber;
      oldFiber = null;
    } else {
      nextOldFiber = oldFiber.sibling;
    }
    
    const newFiber = reconcileSingleElement(returnFiber, oldFiber, newChildren[newIdx], lanes);
    
    if (newFiber === null) {
      oldFiber = nextOldFiber;
      break;
    }
    
    if (shouldTrackSideEffects) {
      if (oldFiber && newFiber.alternate === null) {
        deleteChild(returnFiber, oldFiber);
      }
    }
    
    if (previousNewFiber === null) {
      resultingFirstChild = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;
    oldFiber = nextOldFiber;
  }
  
  // 第二轮：处理乱序的节点
  if (oldFiber === null) {
    for (; newIdx < newChildren.length; newIdx++) {
      const newFiber = createFiberFromElement(newChildren[newIdx], returnFiber.mode, lanes);
      newFiber.return = returnFiber;
      
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }
    return resultingFirstChild;
  }
  
  const existingChildren = mapRemainingChildren(returnFiber, oldFiber);
  
  for (; newIdx < newChildren.length; newIdx++) {
    const newFiber = reconcileSingleElement(returnFiber, existingChildren.get(newChildren[newIdx].key) || null, newChildren[newIdx], lanes);
    
    if (newFiber !== null) {
      if (shouldTrackSideEffects) {
        if (newFiber.alternate !== null) {
          existingChildren.delete(newFiber.key === null ? newIdx : newFiber.key);
        }
      }
      
      const lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }
  }
  
  if (shouldTrackSideEffects) {
    existingChildren.forEach(child => deleteChild(returnFiber, child));
  }
  
  return resultingFirstChild;
}
```

## 5. 提交阶段

### 5.1 commitRoot

```javascript
// commitRoot - 提交更新
function commitRoot(root, recoverableErrors, transitions) {
  const finishedWork = root.finishedWork;
  const lanes = root.finishedLanes;
  
  if (finishedWork === null) {
    return null;
  }
  
  root.finishedWork = null;
  root.finishedLanes = NoLanes;
  
  // 检查是否有并发渲染
  if (root === workInProgressRoot) {
    workInProgressRoot = null;
    workInProgress = null;
    workInProgressRootRenderLanes = NoLanes;
  }
  
  // 获取副作用
  let firstEffect;
  if (finishedWork.flags > PerformedWork) {
    if (finishedWork.lastEffect !== null) {
      finishedWork.lastEffect.next = finishedWork;
      firstEffect = finishedWork.firstEffect;
    } else {
      firstEffect = finishedWork;
    }
  } else {
    firstEffect = finishedWork.firstEffect;
  }
  
  // 执行副作用
  if (firstEffect !== null) {
    const prevExecutionContext = executionContext;
    executionContext |= CommitContext;
    
    // 阶段1：执行 DOM 操作前
    commitBeforeMutationEffects(root, firstEffect);
    
    // 阶段2：执行 DOM 操作
    commitMutationEffects(root, firstEffect);
    
    // 重置 workInProgress
    root.current = finishedWork;
    
    // 阶段3：执行 DOM 操作后
    commitLayoutEffects(root, firstEffect);
    
    executionContext = prevExecutionContext;
  } else {
    root.current = finishedWork;
  }
  
  // 重置调度
  const rootDidHavePassiveEffects = rootDoesHavePassiveEffects;
  if (rootDoesHavePassiveEffects) {
    rootDoesHavePassiveEffects = false;
    rootWithPendingPassiveEffects = root;
  }
  
  return null;
}
```

### 5.2 commitMutationEffects

```javascript
// commitMutationEffects - 执行 DOM 操作
function commitMutationEffects(root, firstEffect) {
  inProgressCommitMutationEffects = true;
  
  let effect = firstEffect;
  while (effect !== null) {
    const flags = effect.flags;
    
    // 重置 ref
    if (flags & Ref) {
      const current = effect.alternate;
      if (current !== null) {
        commitDetachRef(current);
      }
    }
    
    // 插入节点
    if (flags & Placement) {
      const nextEffect = effect.next;
      commitPlacement(effect);
      effect = nextEffect;
      continue;
    }
    
    // 删除节点
    if (flags & Deletion) {
      const nextEffect = effect.next;
      commitDeletion(root, effect);
      effect = nextEffect;
      continue;
    }
    
    // 更新节点
    if (flags & Update) {
      const nextEffect = effect.next;
      commitWork(effect);
      effect = nextEffect;
      continue;
    }
    
    effect = effect.next;
  }
  
  inProgressCommitMutationEffects = false;
}

// commitPlacement - 插入节点
function commitPlacement(finishedWork) {
  const parentFiber = getHostParentFiber(finishedWork);
  const parent = parentFiber.stateNode;
  
  if (parentFiber.tag === HostRoot) {
    // 根节点
    if (parentFiber.stateNode.containerInfo !== null) {
      appendChildToContainer(parentFiber.stateNode.containerInfo, finishedWork.stateNode);
    }
  } else {
    // 非根节点
    const before = getHostSibling(finishedWork);
    if (before !== null) {
      insertBefore(parent, finishedWork.stateNode, before);
    } else {
      appendChild(parent, finishedWork.stateNode);
    }
  }
}

// commitWork - 更新节点
function commitWork(current, finishedWork) {
  switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case MemoComponent:
    case SimpleMemoComponent: {
      commitHookEffectListUnmount(HookLayout | HookHasEffect, finishedWork);
      commitHookEffectListMount(HookLayout | HookHasEffect, finishedWork);
      return;
    }
    case ClassComponent: {
      return;
    }
    case HostComponent: {
      const instance = finishedWork.stateNode;
      if (instance !== null) {
        const newProps = finishedWork.memoizedProps;
        const oldProps = current !== null ? current.memoizedProps : newProps;
        const type = finishedWork.type;
        const updatePayload = finishedWork.updateQueue;
        finishedWork.updateQueue = null;
        
        if (updatePayload !== null) {
          commitUpdate(instance, updatePayload, type, oldProps, newProps);
        }
      }
      return;
    }
    case HostText: {
      const textInstance = finishedWork.stateNode;
      const newText = finishedWork.memoizedProps;
      const oldText = current !== null ? current.memoizedProps : newText;
      
      if (newText !== oldText) {
        commitTextUpdate(textInstance, newText);
      }
      return;
    }
  }
}
```

### 5.3 commitLayoutEffects

```javascript
// commitLayoutEffects - 执行 DOM 操作后的副作用
function commitLayoutEffects(root, firstEffect) {
  inProgressCommitLayoutEffects = true;
  
  let effect = firstEffect;
  while (effect !== null) {
    const flags = effect.flags;
    
    // 执行 ref
    if (flags & Ref) {
      commitAttachRef(effect);
    }
    
    // 执行 useLayoutEffect
    if (flags & Layout) {
      switch (effect.tag) {
        case FunctionComponent:
        case ForwardRef:
        case SimpleMemoComponent: {
          commitHookEffectListMount(HookLayout | HookHasEffect, effect);
          break;
        }
        case ClassComponent: {
          commitLifeCycles(root, effect);
          break;
        }
      }
    }
    
    effect = effect.next;
  }
  
  inProgressCommitLayoutEffects = false;
}

// commitHookEffectListMount - 执行 useLayoutEffect
function commitHookEffectListMount(tag, finishedWork) {
  const updateQueue = finishedWork.updateQueue;
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
  
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    
    do {
      if ((effect.tag & tag) === tag) {
        const create = effect.create;
        effect.destroy = create();
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}
```

## 6. 视图更新阶段

### 6.1 DOM 更新

```javascript
// commitUpdate - 更新 DOM 属性
function commitUpdate(domElement, updatePayload, type, oldProps, newProps) {
  // 更新 DOM 属性
  updateFiberProps(domElement, updatePayload);
}

// commitTextUpdate - 更新文本节点
function commitTextUpdate(textInstance, newText) {
  textInstance.nodeValue = newText;
}

// appendChild - 添加子节点
function appendChild(parentInstance, child) {
  parentInstance.appendChild(child);
}

// insertBefore - 插入节点
function insertBefore(parentInstance, child, beforeChild) {
  parentInstance.insertBefore(child, beforeChild);
}

// removeChild - 删除子节点
function removeChild(parentInstance, child) {
  parentInstance.removeChild(child);
}
```

### 6.2 useEffect 执行

```javascript
// commitPassiveEffectOnFiber - 执行 useEffect
function commitPassiveEffectOnFiber(finishedWork) {
  switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case SimpleMemoComponent: {
      commitHookEffectListUnmount(HookPassive | HookHasEffect, finishedWork);
      commitHookEffectListMount(HookPassive | HookHasEffect, finishedWork);
      break;
    }
  }
}

// commitHookEffectListMount - 执行 useEffect
function commitHookEffectListMount(tag, finishedWork) {
  const updateQueue = finishedWork.updateQueue;
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
  
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    
    do {
      if ((effect.tag & tag) === tag) {
        const create = effect.create;
        effect.destroy = create();
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}

// schedulePassiveEffects - 调度 useEffect
function schedulePassiveEffects(finishedWork) {
  const root = finishedWork.root;
  if (!root.pendingPassiveEffects) {
    root.pendingPassiveEffects = [];
  }
  root.pendingPassiveEffects.push(finishedWork);
  
  if (!rootDoesHavePassiveEffects) {
    rootDoesHavePassiveEffects = true;
    scheduleCallback(NormalPriority, () => {
      flushPassiveEffects();
    });
  }
}

// flushPassiveEffects - 刷新 useEffect
function flushPassiveEffects() {
  if (rootWithPendingPassiveEffects !== null) {
    const root = rootWithPendingPassiveEffects;
    const effects = root.pendingPassiveEffects;
    root.pendingPassiveEffects = null;
    
    effects.forEach(finishedWork => {
      commitPassiveEffectOnFiber(finishedWork);
    });
    
    rootWithPendingPassiveEffects = null;
    rootDoesHavePassiveEffects = false;
  }
}
```

## 完整流程示例

```javascript
// 1. 创建组件
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }
  
  increment() {
    this.setState({ count: this.state.count + 1 });
  }
  
  render() {
    return <div>Count: {this.state.count}</div>;
  }
}

// 2. 调用 setState
counter.increment();

// 执行流程：
// 1. setState({ count: 1 })
// 2. classComponentUpdater.enqueueSetState()
// 3. createUpdate(lane) - 创建更新对象
// 4. enqueueUpdate(fiber, update) - 加入更新队列
// 5. scheduleUpdateOnFiber(fiber, lane) - 调度更新
// 6. ensureRootIsScheduled(root) - 确保 root 已调度
// 7. scheduleCallback(priority, callback) - 调度回调
// 8. requestHostCallback(flushWork) - 请求主机回调
// 9. Scheduler 调度执行
// 10. performSyncWorkOnRoot(root) - 同步执行工作
// 11. renderRootSync(root, lanes) - 同步渲染
// 12. workLoopSync() - 工作循环
// 13. performUnitOfWork(workInProgress) - 处理工作单元
// 14. beginWork(workInProgress) - 开始工作
// 15. updateClassComponent() - 更新类组件
// 16. processUpdateQueue() - 处理更新队列
// 17. 合并 state: { count: 1 }
// 18. instance.render() - 重新渲染
// 19. reconcileChildren() - 协调子节点
// 20. commitRoot(root) - 提交更新
// 21. commitBeforeMutationEffects() - DOM 操作前
// 22. commitMutationEffects() - 执行 DOM 操作
// 23. commitLayoutEffects() - DOM 操作后
// 24. 更新 DOM: <div>Count: 1</div>
// 25. commitPassiveEffects() - 执行 useEffect
```

## 面试要点

1. **setState 的执行流程**：
   - 创建 Update 对象
   - 加入更新队列
   - 调度更新
   - 执行更新

2. **Scheduler 的作用**：
   - 优先级调度
   - 时间切片
   - 任务队列管理
   - 中断和恢复

3. **Fiber 的作用**：
   - 可中断的渲染
   - 优先级调度
   - 双缓冲技术
   - 副作用管理

4. **协调阶段的作用**：
   - 对比新旧 Fiber
   - 确定 Diff 结果
   - 标记副作用
   - 准备更新

5. **提交阶段的作用**：
   - 执行 DOM 操作
   - 执行 ref 回调
   - 执行 useLayoutEffect
   - 调度 useEffect

6. **React 18 的改进**：
   - Concurrent Mode
   - Automatic Batching
   - Transitions
   - Suspense 改进

7. **性能优化**：
   - 使用 useMemo 缓存计算结果
   - 使用 useCallback 缓存函数
   - 使用 React.memo 避免不必要的渲染
   - 使用 key 优化列表渲染

8. **注意事项**：
   - setState 是异步的
   - 多次 setState 会合并
   - 在回调中获取最新状态
   - 避免在 render 中修改状态