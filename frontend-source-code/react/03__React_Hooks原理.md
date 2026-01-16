# React Hooks 原理

## 核心概念

Hooks 是 React 16.8 引入的新特性，允许在函数组件中使用状态和其他 React 特性。

**核心特性：**
- 状态复用：通过自定义 Hook 复用状态逻辑
- 副作用处理：useEffect 处理副作用
- 性能优化：useMemo、useCallback 优化性能
- 规则限制：只能在函数组件或自定义 Hook 中使用

## 源码核心实现

### 1. Hooks 数据结构

```javascript
// Hooks 数据结构
type Hook = {
  memoizedState: any, // 当前状态值
  baseState: any, // 基础状态值
  baseQueue: Update<any, any> | null, // 基础更新队列
  queue: UpdateQueue<any, any> | null, // 更新队列
  next: Hook | null, // 下一个 Hook
};

// 更新队列
type UpdateQueue<S, A> = {
  pending: Update<S, A> | null, // 待处理的更新
  lanes: Lanes, // 优先级
  dispatch: Dispatch<A>, // dispatch 函数
  lastRenderedReducer: reducer<S, A>, // 上次渲染使用的 reducer
  lastRenderedState: S, // 上次渲染使用的 state
};

// 更新对象
type Update<S, A> = {
  lane: Lane, // 优先级
  action: A, // action
  hasEagerState: boolean, // 是否有急切状态
  eagerState: S | null, // 急切状态
  next: Update<S, A> | null, // 下一个更新
};

// 全局变量
let currentlyRenderingFiber: Fiber | null = null; // 当前正在渲染的 Fiber
let workInProgressHook: Hook | null = null; // 当前正在工作的 Hook
let currentHook: Hook | null = null; // 当前 Hook
let didScheduleRenderPhaseUpdate: boolean = false; // 是否调度了渲染阶段更新
let renderPhaseUpdates: UpdateQueue<any, any>[] | null = null; // 渲染阶段更新队列
```

### 2. useState 实现

```javascript
// useState - 状态 Hook
function useState<S>(initialState: (() => S) | S): [S, Dispatch<BasicStateAction<S>>] {
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}

// resolveDispatcher - 获取 dispatcher
function resolveDispatcher() {
  const dispatcher = ReactCurrentDispatcher.current;
  return dispatcher;
}

// HooksDispatcherOnMount - 挂载时的 dispatcher
const HooksDispatcherOnMount: Dispatcher = {
  useState: mountState,
  useEffect: mountEffect,
  useLayoutEffect: mountLayoutEffect,
  useMemo: mountMemo,
  useCallback: mountCallback,
  useRef: mountRef,
  // ... 更多 Hooks
};

// HooksDispatcherOnUpdate - 更新时的 dispatcher
const HooksDispatcherOnUpdate: Dispatcher = {
  useState: updateState,
  useEffect: updateEffect,
  useLayoutEffect: updateLayoutEffect,
  useMemo: updateMemo,
  useCallback: updateCallback,
  useRef: updateRef,
  // ... 更多 Hooks
};

// mountState - 挂载状态
function mountState<S>(initialState: (() => S) | S): [S, Dispatch<BasicStateAction<S>>] {
  const hook = mountWorkInProgressHook();
  
  // 初始化状态
  if (typeof initialState === 'function') {
    initialState = initialState();
  }
  
  hook.memoizedState = hook.baseState = initialState;
  
  // 创建更新队列
  const queue: UpdateQueue<S, BasicStateAction<S>> = {
    pending: null,
    lanes: NoLanes,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: (initialState: any),
  };
  
  hook.queue = queue;
  
  // 创建 dispatch 函数
  const dispatch: Dispatch<BasicStateAction<S>> = (queue.dispatch = (dispatchSetState.bind(
    null,
    currentlyRenderingFiber,
    queue,
  ): any));
  
  return [hook.memoizedState, dispatch];
}

// updateState - 更新状态
function updateState<S>(initialState: (() => S) | S): [S, Dispatch<BasicStateAction<S>>] {
  return updateReducer(basicStateReducer, (initialState: any));
}

// updateReducer - 更新 reducer
function updateReducer<S, I, A>(
  reducer: (S, A) => S,
  initialArg: I,
  init?: (I) => S,
): [S, Dispatch<A>] {
  const hook = updateWorkInProgressHook();
  const queue = hook.queue;
  
  queue.lastRenderedReducer = reducer;
  
  const current: Hook = (currentHook: any);
  
  // 获取待处理的更新
  let pendingQueue = queue.pending;
  if (pendingQueue !== null) {
    // 合并更新
    const first = pendingQueue.next;
    let newState = current.baseState;
    
    let update = first;
    do {
      const action = update.action;
      newState = reducer(newState, action);
      update = update.next;
    } while (update !== null && update !== first);
    
    queue.pending = null;
    hook.memoizedState = hook.baseState = newState;
    queue.lastRenderedState = newState;
  }
  
  const dispatch: Dispatch<A> = (queue.dispatch: any);
  return [hook.memoizedState, dispatch];
}

// dispatchSetState - 设置状态
function dispatchSetState<S, A>(
  fiber: Fiber,
  queue: UpdateQueue<S, A>,
  action: A,
): void {
  const lane = requestUpdateLane(fiber);
  
  // 创建更新对象
  const update: Update<S, A> = {
    lane,
    action,
    hasEagerState: false,
    eagerState: null,
    next: (null: any),
  };
  
  // 加入更新队列
  const pending = queue.pending;
  if (pending === null) {
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  queue.pending = update;
  
  // 调度更新
  const root = scheduleUpdateOnFiber(fiber, lane);
  
  // 急切更新
  if (root === null) {
    if (reducer === basicStateReducer) {
      const currentState: S = (queue.lastRenderedState: any);
      const eagerState = basicStateReducer(currentState, action);
      
      update.hasEagerState = true;
      update.eagerState = eagerState;
      
      if (is(eagerState, currentState)) {
        return;
      }
    }
  }
}
```

### 3. useEffect 实现

```javascript
// useEffect - 副作用 Hook
function useEffect(
  create: () => (() => void) | void,
  deps: Array<mixed> | void | null,
): void {
  const dispatcher = resolveDispatcher();
  return dispatcher.useEffect(create, deps);
}

// mountEffect - 挂载副作用
function mountEffect(create: () => (() => void) | void, deps: Array<mixed> | void | null): void {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  currentlyRenderingFiber.flags |= PassiveEffect;
  hook.memoizedState = pushEffect(Passive | HasEffect, create, undefined, nextDeps);
}

// updateEffect - 更新副作用
function updateEffect(create: () => (() => void) | void, deps: Array<mixed> | void | null): void {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  let destroy = undefined;
  
  if (currentHook !== null) {
    const prevEffect = currentHook.memoizedState;
    destroy = prevEffect.destroy;
    
    if (nextDeps !== null) {
      const prevDeps = prevEffect.deps;
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        // 依赖未变化，跳过
        hook.memoizedState = pushEffect(Passive, create, destroy, nextDeps);
        return;
      }
    }
  }
  
  // 依赖变化，标记需要更新
  currentlyRenderingFiber.flags |= PassiveEffect;
  hook.memoizedState = pushEffect(Passive | HasEffect, create, destroy, nextDeps);
}

// pushEffect - 推入副作用
function pushEffect(tag, create, destroy, deps) {
  const effect: Effect = {
    tag,
    create,
    destroy,
    deps,
    next: (null: any),
  };
  
  let componentUpdateQueue: null | FunctionComponentUpdateQueue = (currentlyRenderingFiber.updateQueue: any);
  
  if (componentUpdateQueue === null) {
    componentUpdateQueue = createFunctionComponentUpdateQueue();
    currentlyRenderingFiber.updateQueue = (componentUpdateQueue: any);
    componentUpdateQueue.lastEffect = effect.next = effect;
  } else {
    const lastEffect = componentUpdateQueue.lastEffect;
    if (lastEffect === null) {
      componentUpdateQueue.lastEffect = effect.next = effect;
    } else {
      const firstEffect = lastEffect.next;
      lastEffect.next = effect;
      effect.next = firstEffect;
      componentUpdateQueue.lastEffect = effect;
    }
  }
  
  return effect;
}

// commitPassiveEffects - 提交副作用
function commitPassiveEffects(root: FiberRoot, firstChild: Fiber) {
  commitPassiveUnmountEffects(firstChild);
  commitPassiveMountEffects(root, firstChild);
}

// commitPassiveMountEffects - 提交挂载副作用
function commitPassiveMountEffects(root: FiberRoot, firstChild: Fiber) {
  commitPassiveEffectOnFiber(root, firstChild);
}

// commitPassiveEffectOnFiber - 在 Fiber 上提交副作用
function commitPassiveEffectOnFiber(finishedWork: Fiber) {
  switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case SimpleMemoComponent: {
      commitHookEffectListMount(Passive | HasEffect, finishedWork);
      return;
    }
    case HostRoot: {
      {
        commitPassiveMountEffects(root, finishedWork.child);
      }
      return;
    }
  }
}

// commitHookEffectListMount - 提交 Hook 副作用列表挂载
function commitHookEffectListMount(tag: number, finishedWork: Fiber): void {
  const updateQueue: FunctionComponentUpdateQueue = (finishedWork.updateQueue: any);
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

### 4. useMemo 和 useCallback 实现

```javascript
// useMemo - 记忆化 Hook
function useMemo<T>(create: () => T, deps: Array<mixed> | void | null): T {
  const dispatcher = resolveDispatcher();
  return dispatcher.useMemo(create, deps);
}

// mountMemo - 挂载记忆化
function mountMemo<T>(nextCreate: () => T, nextDeps: Array<mixed> | void | null): T {
  const hook = mountWorkInProgressHook();
  const nextDeps = nextDeps === undefined ? null : nextDeps;
  const nextValue = nextCreate();
  hook.memoizedState = [nextValue, nextDeps];
  return nextValue;
}

// updateMemo - 更新记忆化
function updateMemo<T>(nextCreate: () => T, nextDeps: Array<mixed> | void | null): T {
  const hook = updateWorkInProgressHook();
  const nextDeps = nextDeps === undefined ? null : nextDeps;
  const prevState = hook.memoizedState;
  
  if (prevState !== null) {
    const prevDeps = prevState[1];
    if (areHookInputsEqual(nextDeps, prevDeps)) {
      // 依赖未变化，返回旧值
      return prevState[0];
    }
  }
  
  // 依赖变化，重新计算
  const nextValue = nextCreate();
  hook.memoizedState = [nextValue, nextDeps];
  return nextValue;
}

// useCallback - 记忆化回调 Hook
function useCallback<T>(callback: T, deps: Array<mixed> | void | null): T {
  const dispatcher = resolveDispatcher();
  return dispatcher.useCallback(callback, deps);
}

// mountCallback - 挂载回调
function mountCallback<T>(callback: T, deps: Array<mixed> | void | null): T {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  hook.memoizedState = [callback, nextDeps];
  return callback;
}

// updateCallback - 更新回调
function updateCallback<T>(callback: T, deps: Array<mixed> | void | null): T {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  const prevState = hook.memoizedState;
  
  if (prevState !== null) {
    const prevDeps = prevState[1];
    if (areHookInputsEqual(nextDeps, prevDeps)) {
      // 依赖未变化，返回旧回调
      return prevState[0];
    }
  }
  
  // 依赖变化，返回新回调
  hook.memoizedState = [callback, nextDeps];
  return callback;
}

// areHookInputsEqual - 比较依赖
function areHookInputsEqual(nextDeps: Array<mixed>, prevDeps: Array<mixed> | null): boolean {
  if (prevDeps === null) {
    return false;
  }
  
  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (is(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false;
  }
  
  return true;
}
```

### 5. useRef 实现

```javascript
// useRef - 引用 Hook
function useRef<T>(initialValue: T): {current: T} {
  const dispatcher = resolveDispatcher();
  return dispatcher.useRef(initialValue);
}

// mountRef - 挂载引用
function mountRef<T>(initialValue: T): {current: T} {
  const hook = mountWorkInProgressHook();
  const ref = {current: initialValue};
  hook.memoizedState = ref;
  return ref;
}

// updateRef - 更新引用
function updateRef<T>(initialValue: T): {current: T} {
  const hook = updateWorkInProgressHook();
  return hook.memoizedState;
}
```

### 6. 自定义 Hook

```javascript
// 自定义 Hook 示例
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  
  return { count, increment, decrement, reset };
}

// 使用自定义 Hook
function Counter() {
  const { count, increment, decrement, reset } = useCounter(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

## 简化版实现

```javascript
// 简化版 Hooks
let hooks = [];
let hookIndex = 0;

// 简化版 useState
function useState(initialValue) {
  const currentIndex = hookIndex;
  
  if (hooks[currentIndex] === undefined) {
    hooks[currentIndex] = {
      value: typeof initialValue === 'function' ? initialValue() : initialValue
    };
  }
  
  const setState = (newValue) => {
    hooks[currentIndex].value = typeof newValue === 'function'
      ? newValue(hooks[currentIndex].value)
      : newValue;
    render();
  };
  
  hookIndex++;
  return [hooks[currentIndex].value, setState];
}

// 简化版 useEffect
function useEffect(callback, deps) {
  const currentIndex = hookIndex;
  
  if (hooks[currentIndex] === undefined) {
    hooks[currentIndex] = {
      deps: deps,
      cleanup: null
    };
  }
  
  const prevDeps = hooks[currentIndex].deps;
  const hasChanged = deps ? !deps.every((dep, i) => dep === prevDeps[i]) : true;
  
  if (hasChanged) {
    if (hooks[currentIndex].cleanup) {
      hooks[currentIndex].cleanup();
    }
    hooks[currentIndex].cleanup = callback();
    hooks[currentIndex].deps = deps;
  }
  
  hookIndex++;
}

// 简化版 useMemo
function useMemo(callback, deps) {
  const currentIndex = hookIndex;
  
  if (hooks[currentIndex] === undefined) {
    hooks[currentIndex] = {
      value: callback(),
      deps: deps
    };
  } else {
    const prevDeps = hooks[currentIndex].deps;
    const hasChanged = deps ? !deps.every((dep, i) => dep === prevDeps[i]) : true;
    
    if (hasChanged) {
      hooks[currentIndex].value = callback();
      hooks[currentIndex].deps = deps;
    }
  }
  
  hookIndex++;
  return hooks[currentIndex].value;
}

// 简化版 useCallback
function useCallback(callback, deps) {
  return useMemo(() => callback, deps);
}

// 简化版 useRef
function useRef(initialValue) {
  const currentIndex = hookIndex;
  
  if (hooks[currentIndex] === undefined) {
    hooks[currentIndex] = {
      current: initialValue
    };
  }
  
  hookIndex++;
  return hooks[currentIndex];
}

// 使用示例
function Counter() {
  hookIndex = 0;
  
  const [count, setCount] = useState(0);
  const doubled = useMemo(() => count * 2, [count]);
  const increment = useCallback(() => setCount(c => c + 1), []);
  
  useEffect(() => {
    console.log('Count changed:', count);
    return () => {
      console.log('Cleanup');
    };
  }, [count]);
  
  return `
    <div>
      <p>Count: ${count}</p>
      <p>Doubled: ${doubled}</p>
      <button onclick="increment()">Increment</button>
    </div>
  `;
}
```

## 使用场景

1. **useState**：组件状态管理
2. **useEffect**：副作用处理（数据获取、订阅、DOM 操作）
3. **useMemo**：缓存计算结果
4. **useCallback**：缓存函数引用
5. **useRef**：访问 DOM 或保存可变值
6. **自定义 Hook**：复用状态逻辑

## 面试要点

1. **Hooks 的规则**：
   - 只能在函数组件或自定义 Hook 中使用
   - 必须在顶层调用，不能在循环、条件或嵌套函数中调用
   - 依赖顺序必须保持一致

2. **Hooks 的实现原理**：
   - 使用链表存储 Hook
   - 通过 hookIndex 确保调用顺序
   - 使用 Fiber 节点存储 Hook 状态

3. **useEffect 的执行时机**：
   - 在提交阶段后执行
   - 在浏览器绘制后执行
   - 可以返回清理函数

4. **useMemo 和 useCallback 的区别**：
   - useMemo 缓存计算结果
   - useCallback 缓存函数引用
   - useCallback 是 useMemo 的特殊情况

5. **useRef 的特点**：
   - 返回可变的 ref 对象
   - 不会触发重新渲染
   - 可以访问 DOM 元素

6. **自定义 Hook 的优势**：
   - 复用状态逻辑
   - 组件逻辑解耦
   - 更好的代码组织

7. **React 18 的改进**：
   - useId - 生成唯一 ID
   - useTransition - 标记低优先级更新
   - useDeferredValue - 延迟更新
   - useSyncExternalStore - 订阅外部 store

8. **注意事项**：
   - 避免在 useEffect 中直接修改依赖项
   - 合理使用依赖数组
   - 避免在循环中创建 Hook
   - 及时清理副作用

---



9. **性能优化**：
   - 使用 useMemo 缓存计算结果
   - 使用 useCallback 缓存函数
   - 避免不必要的依赖
   - 合理使用 useRef 避免重新渲染