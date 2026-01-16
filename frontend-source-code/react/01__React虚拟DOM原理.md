# React 虚拟 DOM 原理

## 核心概念

虚拟 DOM（Virtual DOM）是 React 的核心概念，它是真实 DOM 的 JavaScript 对象表示，用于提高渲染性能。

**核心特性：**
- 轻量级：JavaScript 对象，比真实 DOM 轻量
- 批量更新：合并多次更新，减少 DOM 操作
- Diff 算法：高效比较新旧虚拟 DOM，最小化 DOM 操作
- 跨平台：可以渲染到 DOM、Canvas、Native 等平台

## 源码核心实现

### 1. ReactElement - 虚拟 DOM 元素

```javascript
// ReactElement - 虚拟 DOM 元素
const ReactElement = function(type, key, ref, self, source, owner, props) {
  const element = {
    // 标记为 React Element
    $$typeof: REACT_ELEMENT_TYPE,
    
    // 元素类型
    type: type,
    
    // 唯一标识
    key: key,
    
    // ref 引用
    ref: ref,
    
    // props 属性
    props: props,
    
    // 记录创建者
    _owner: owner,
  };
  
  return element;
};

// createElement - 创建虚拟 DOM
function createElement(type, config, children) {
  let propName;
  const props = {};
  let key = null;
  let ref = null;
  let self = null;
  let source = null;
  
  // 处理 config
  if (config != null) {
    // 提取 ref
    if (hasValidRef(config)) {
      ref = config.ref;
    }
    
    // 提取 key
    if (hasValidKey(config)) {
      key = '' + config.key;
    }
    
    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;
    
    // 复制剩余的 props
    for (propName in config) {
      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
        props[propName] = config[propName];
      }
    }
  }
  
  // 处理 children
  const childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    const childArray = Array(childrenLength);
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }
  
  // 处理默认 props
  if (type && type.defaultProps) {
    const defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }
  
  return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
}

// 使用示例
const element = createElement('div', { className: 'container' }, 
  createElement('h1', null, 'Hello React'),
  createElement('p', null, 'This is virtual DOM')
);
```

### 2. Fiber - Fiber 节点

```javascript
// Fiber - Fiber 节点
function FiberNode(tag, pendingProps, key, mode) {
  // 节点类型
  this.tag = tag;
  
  // 唯一标识
  this.key = key;
  
  // 元素类型
  this.elementType = null;
  this.type = null;
  
  // 状态
  this.stateNode = null;
  
  // Fiber 树结构
  this.return = null; // 父节点
  this.child = null; // 第一个子节点
  this.sibling = null; // 下一个兄弟节点
  this.index = 0; // 在兄弟节点中的索引
  
  // ref 引用
  this.ref = null;
  
  // props
  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;
  this.dependencies = null;
  
  // 模式
  this.mode = mode;
  
  // 副作用
  this.flags = NoFlags;
  this.subtreeFlags = NoFlags;
  this.deletions = null;
  
  // 调度
  this.lanes = NoLanes;
  this.childLanes = NoLanes;
  
  // 双缓冲
  this.alternate = null; // 当前节点对应的另一个 Fiber 节点
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
// ... 更多标签类型

// Fiber 标志位
const NoFlags = 0b0000000000000000000000000000000;
const Placement = 0b0000000000000000000000000000010; // 插入
const Update = 0b0000000000000000000000000000100; // 更新
const Deletion = 0b0000000000000000000000000001000; // 删除
const ChildDeletion = 0b0000000000000000000000000010000; // 子节点删除
// ... 更多标志位
```

### 3. Fiber 树的构建

```javascript
// workInProgress - 当前正在工作的 Fiber 节点
let workInProgress = null;

// performUnitOfWork - 处理单个 Fiber 节点
function performUnitOfWork(unitOfWork) {
  const current = unitOfWork.alternate;
  let next;
  
  // 开始阶段
  next = beginWork(current, unitOfWork, subtreeRenderLanes);
  
  // 如果没有子节点，完成当前节点
  if (next === null) {
    next = completeUnitOfWork(unitOfWork);
  }
  
  return next;
}

// beginWork - 开始处理节点
function beginWork(current, workInProgress, renderLanes) {
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
    // ... 更多节点类型
  }
}

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

### 4. Diff 算法

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
  // 处理不同类型的子节点
  const isObject = typeof newChild === 'object' && newChild !== null;
  
  if (isObject) {
    // 处理单个元素
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE: {
        return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstChild, newChild, lanes));
      }
    }
  }
  
  // 处理数组
  if (isArray(newChild)) {
    return reconcileChildrenArray(returnFiber, currentFirstChild, newChild, lanes);
  }
  
  // 处理文本
  if (typeof newChild === 'string' || typeof newChild === 'number') {
    return placeSingleChild(reconcileSingleTextNode(returnFiber, currentFirstChild, '' + newChild, lanes));
  }
  
  // 删除剩余的子节点
  return deleteRemainingChildren(returnFiber, currentFirstChild);
}

// reconcileSingleElement - 协调单个元素
function reconcileSingleElement(returnFiber, currentFirstChild, element, lanes) {
  const key = element.key;
  let child = currentFirstChild;
  
  // 查找可复用的节点
  while (child !== null) {
    if (child.key === key) {
      // key 相同，比较 type
      if (child.elementType === element.type) {
        // 可以复用
        deleteRemainingChildren(returnFiber, child.sibling);
        const existing = useFiber(child, element.props);
        existing.return = returnFiber;
        return existing;
      }
      // key 相同但 type 不同，删除所有子节点
      deleteRemainingChildren(returnFiber, child);
      break;
    } else {
      // key 不同，删除当前节点
      deleteChild(returnFiber, child);
    }
    child = child.sibling;
  }
  
  // 没有可复用的节点，创建新节点
  const created = createFiberFromElement(element, returnFiber.mode, lanes);
  created.return = returnFiber;
  return created;
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
      // 无法复用，跳出循环
      oldFiber = nextOldFiber;
      break;
    }
    
    if (shouldTrackSideEffects) {
      if (oldFiber && newFiber.alternate === null) {
        // 标记删除
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
  
  // 新节点已处理完，删除剩余的旧节点
  if (newIdx === newChildren.length) {
    deleteRemainingChildren(returnFiber, oldFiber);
    return resultingFirstChild;
  }
  
  // 旧节点已处理完，挂载剩余的新节点
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
  
  // 第二轮：处理乱序的节点
  const existingChildren = mapRemainingChildren(returnFiber, oldFiber);
  
  for (; newIdx < newChildren.length; newIdx++) {
    const newFiber = reconcileSingleElement(returnFiber, existingChildren.get(newChildren[newIdx].key) || null, newChildren[newIdx], lanes);
    
    if (newFiber !== null) {
      if (shouldTrackSideEffects) {
        if (newFiber.alternate !== null) {
          // 标记删除
          existingChildren.delete(newFiber.key === null ? newIdx : newFiber.key);
        }
      }
      
      // 判断是否需要移动
      const lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }
  }
  
  // 删除剩余的旧节点
  if (shouldTrackSideEffects) {
    existingChildren.forEach(child => deleteChild(returnFiber, child));
  }
  
  return resultingFirstChild;
}
```

## 简化版实现

```javascript
// 简化版虚拟 DOM
function h(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === 'object' ? child : createTextElement(child)
      )
    }
  };
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  };
}

// 简化版 DOM 创建
function createDom(fiber) {
  const dom = fiber.type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(fiber.type);
  
  const isProperty = key => key !== 'children';
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = fiber.props[name];
    });
  
  return dom;
}

// 简化版提交阶段
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
  domParent.appendChild(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

// 简化版 render
function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element]
    },
    alternate: currentRoot
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

// 使用示例
const element = h('div', { className: 'container' },
  h('h1', null, 'Hello React'),
  h('p', null, 'This is virtual DOM')
);

render(element, document.getElementById('root'));
```

## 使用场景

1. **声明式渲染**：使用 JSX 声明式地描述 UI
2. **组件化开发**：构建可复用的组件
3. **状态管理**：通过 props 和 state 管理状态
4. **跨平台渲染**：React Native、React Three Fiber 等

## 面试要点

1. **虚拟 DOM 的优势**：
   - 减少 DOM 操作次数
   - 批量更新，提高性能
   - 跨平台能力
   - 更好的开发体验

2. **虚拟 DOM 的局限性**：
   - 首次渲染较慢
   - 内存占用较大
   - 复杂场景下性能不如直接操作 DOM

3. **React Fiber 的改进**：
   - 可中断的渲染
   - 优先级调度
   - 更好的错误边界
   - 支持 Concurrent Mode

4. **Diff 算法的策略**：
   - 只比较同层节点
   - 通过 key 判断节点是否可复用
   - 使用双指针优化

5. **key 的作用**：
   - 唯一标识节点
   - 提高复用率
   - 避免不必要的销毁和创建

6. **React 18 的改进**：
   - Concurrent Mode
   - Automatic Batching
   - Transitions
   - Suspense 改进

5. **注意事项**：
   - key 必须唯一且稳定
   - 避免使用 index 作为 key
   - 不要在 render 中修改状态

8. **性能优化**：
   - 使用 React.memo 避免不必要的渲染
   - 使用 useMemo 缓存计算结果
   - 使用 useCallback 缓存函数
   - 使用 key 优化列表渲染