# React 面试题集锦（截止 2025 年底）

## 目录
1. [React 核心原理](#react-核心原理)
2. [Hooks 相关](#hooks-相关)
3. [React 新特性](#react-新特性)
4. [性能优化](#性能优化)
5. [状态管理与架构](#状态管理与架构)

---

## React 核心原理

### 1. React 的虚拟 DOM 是什么？它是如何提升性能的？

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

---

### 2. React 的 Fiber 架构是什么？解决了什么问题？

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

---

### 3. React 的调和（Reconciliation）过程是什么？

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

---

### 4. React 的事件系统有什么特点？什么是合成事件？

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

---

### 5. React 的生命周期方法有哪些？各个阶段的作用是什么？

**答案：**

**类组件生命周期（React 17 及之前）：**

```javascript
class MyComponent extends React.Component {
  // 1. 挂载阶段（Mounting）
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  static getDerivedStateFromProps(props, state) {
    // 从 props 派生 state
    return null;
  }

  componentDidMount() {
    // DOM 已挂载，适合发送请求、订阅事件
    console.log('组件已挂载');
  }

  // 2. 更新阶段（Updating）
  shouldComponentUpdate(nextProps, nextState) {
    // 决定是否重新渲染
    return true;
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    // 更新前获取 DOM 信息
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // DOM 已更新，适合发送请求
  }

  // 3. 卸载阶段（Unmounting）
  componentWillUnmount() {
    // 清理工作：取消订阅、清除定时器
  }

  // 4. 错误处理
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误
  }
}
```

**函数组件生命周期映射：**

```javascript
function MyComponent() {
  // componentDidMount + componentDidUpdate
  useEffect(() => {
    console.log('组件挂载或更新');
    return () => {
      console.log('组件卸载或依赖变化前清理');
    };
  }, [dependencies]);

  // componentDidMount
  useEffect(() => {
    console.log('仅挂载时执行');
  }, []);

  // componentWillUnmount
  useEffect(() => {
    return () => {
      console.log('组件卸载时清理');
    };
  }, []);

  // shouldComponentUpdate
  const MemoizedComponent = React.memo(Component);

  // getSnapshotBeforeUpdate + componentDidUpdate
  const prevRef = useRef();
  useEffect(() => {
    if (prevRef.current !== null) {
      console.log('更新了', prevRef.current);
    }
    prevRef.current = value;
  }, [value]);
}
```

---

### 6. React 的 key 属性有什么作用？

**答案：**

key 是 React 在渲染列表时用于识别元素的唯一标识。

**key 的作用：**

1. **Diff 算法优化**：帮助 React 识别哪些元素被添加、删除或移动
2. **组件状态保持**：key 不变时，组件状态会被保留
3. **避免不必要的重建**：减少组件卸载和重新挂载

**示例：**

```javascript
// ❌ 使用 index 作为 key
// 问题：列表插入/删除/排序时，key 会导致状态错乱
{items.map((item, index) => (
  <Item key={index} data={item} />
))}

// ✅ 使用唯一 ID
{items.map(item => (
  <Item key={item.id} data={item} />
))}

// ❌ 随机数作为 key
{items.map(item => (
  <Item key={Math.random()} data={item} />
))}

// ✅ 组合 key（当没有唯一 ID 时）
{items.map((item, index) => (
  <Item key={`${item.type}-${index}`} data={item} />
))}
```

**key 的错误使用场景：**

```javascript
// 场景 1：输入框内容错乱
function List() {
  const [items, setItems] = useState([1, 2, 3]);
  
  const prepend = () => {
    setItems([0, ...items]);
  };
  
  return (
    <>
      <button onClick={prepend}>在开头添加</button>
      {items.map((item, index) => (
        <div key={index}>
          <input defaultValue={item} />
        </div>
      ))}
    </>
  );
  // 使用 index 作为 key，添加元素后输入框内容会错乱
}
```

**为什么使用 index 作为 key 会导致输入框内容错乱？**

当使用 `index` 作为 key 时，React 的 Diff 算法会按照 key 的顺序来判断哪些元素是"同一个"元素。具体原因如下：

1. **初始状态**（items = [1, 2, 3]）：
   - key=0: input defaultValue=1
   - key=1: input defaultValue=2
   - key=2: input defaultValue=3

2. **添加元素后**（items = [0, 1, 2, 3]）：
   - key=0: input defaultValue=0（新增）
   - key=1: input defaultValue=1
   - key=2: input defaultValue=2
   - key=3: input defaultValue=3（新增）

3. **React 的 Diff 过程**：
   - React 发现 key=0 已经存在，会复用原来的 key=0 的 DOM 节点
   - 但是这个节点原本的 `defaultValue` 是 1，现在数据变成了 0
   - React 只会更新 `defaultValue` 属性，但如果用户已经在输入框中输入了内容（使用的是 `value` 而非受控组件），输入框的内部状态（用户输入的内容）会被保留
   - 结果：原来 key=0 的输入框（用户可能输入了"abc"）现在对应的是数据 0，但显示的仍然是"abc"
   - 同理，key=1 的输入框（用户可能输入了"def"）现在对应的是数据 1，但显示的仍然是"def"

4. **根本原因**：
   - React 基于 key 进行 DOM 复用，认为 key 相同的元素是同一个元素
   - 使用 index 作为 key 时，元素的 key 会随着列表变化而改变，导致元素被错误复用
   - 组件的状态（如输入框的用户输入）被保留到错误的位置

5. **正确的做法**：
   - 使用唯一且稳定的值作为 key（如 id、uuid）
   - 这样即使列表顺序改变，React 也能正确识别每个元素，保持状态正确

---

### 7. React 的 setState 是同步还是异步的？

**答案：**

setState 的执行时机取决于调用上下文：

**异步情况（批量更新）：**
```javascript
function Component() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  const handleClick = () => {
    // React 事件处理函数中：批量更新
    setCount(count + 1);  // 不会立即更新
    setName('new');       // 不会立即更新
    console.log(count);   // 仍然是 0
  };

  return <button onClick={handleClick}>点击</button>;
}
```

**同步情况（React 18 自动批处理）：**
```javascript
// React 18+：所有更新都会被批处理
function Component() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  const handleClick = () => {
    setTimeout(() => {
      // 异步回调中也会批处理（React 18+）
      setCount(count + 1);
      setName('new');
      console.log(count);  // 仍然是 0
    }, 0);

    fetch('/api').then(() => {
      // Promise 回调中也会批处理（React 18+）
      setCount(count + 1);
    });
  };

  return <button onClick={handleClick}>点击</button>;
}
```

**函数式更新（推荐）：**
```javascript
// ✅ 使用函数式更新，确保基于最新状态
const increment = () => {
  setCount(prev => prev + 1);  // prev 是最新值
  setCount(prev => prev + 1);  // 累加 2
};

// ❌ 直接使用值
const increment = () => {
  setCount(count + 1);  // 基于旧值
  setCount(count + 1);  // 只增加 1
};
```

**强制同步更新：**
```javascript
// React 18：使用 flushSync 强制同步更新
import { flushSync } from 'react-dom';

function Component() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    flushSync(() => {
      setCount(count + 1);  // 立即更新
    });
    console.log(count);  // 1
  };

  return <button onClick={handleClick}>点击</button>;
}
```

---

### 8. React 的 Context API 是如何工作的？有哪些使用场景？

**答案：**

Context 提供了一种在组件树中传递数据的方式，无需逐层传递 props。

**基本用法：**

```javascript
// 1. 创建 Context
const ThemeContext = createContext('light');

// 2. 提供者组件
function App() {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

// 3. 消费者组件
function Toolbar() {
  const { theme, setTheme } = useContext(ThemeContext);
  
  return (
    <div style={{ background: theme === 'dark' ? '#333' : '#fff' }}>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        切换主题
      </button>
    </div>
  );
}
```

**Context 的性能问题与优化：**

```javascript
// ❌ 问题：Provider value 变化导致所有消费者重新渲染
function App() {
  const [user, setUser] = useState({ name: 'John', age: 30 });
  
  return (
    <UserContext.Provider value={user}>
      <ChildComponents />
    </UserContext.Provider>
  );
}

// ✅ 优化 1：分离 Context
const UserNameContext = createContext();
const UserAgeContext = createContext();

function App() {
  const [name, setName] = useState('John');
  const [age, setAge] = useState(30);
  
  return (
    <UserNameContext.Provider value={name}>
      <UserAgeContext.Provider value={age}>
        <ChildComponents />
      </UserAgeContext.Provider>
    </UserNameContext.Provider>
  );
}

// ✅ 优化 2：使用 useMemo 稳定 value
function App() {
  const [user, setUser] = useState({ name: 'John', age: 30 });
  
  const value = useMemo(() => ({ user, setUser }), [user]);
  
  return (
    <UserContext.Provider value={value}>
      <ChildComponents />
    </UserContext.Provider>
  );
}

// ✅ 优化 3：选择性消费
function Child() {
  const user = useContext(UserContext);
  const { name } = user; // 只使用 name
  
  // 使用 useMemo 避免不必要的重渲染
  const displayName = useMemo(() => name, [name]);
  
  return <div>{displayName}</div>;
}
```

**使用场景：**

1. **主题切换**：暗色/亮色模式
2. **用户信息**：登录状态、用户数据
3. **国际化**：多语言切换
4. **路由信息**：当前路由、导航方法
5. **全局配置**：API 配置、环境变量

**避免过度使用 Context：**
```javascript
// ❌ 不推荐：用 Context 传递所有数据
const DataContext = createContext();

function App() {
  return (
    <DataContext.Provider value={{ ...allData }}>
      <DeeplyNestedComponent />
    </DataContext.Provider>
  );
}

// ✅ 推荐：按需拆分 Context
const ThemeContext = createContext();
const AuthContext = createContext();
const ConfigContext = createContext();
```

---

### 9. React.memo、useMemo 和 useCallback 的区别是什么？

**答案：**

三者都是性能优化工具，但使用场景不同。

**React.memo：**
```javascript
// 组件级别的 memo（浅比较 props）
const MyComponent = React.memo(function MyComponent({ name, age }) {
  console.log('组件重新渲染');
  return <div>{name} - {age}</div>;
});

// 自定义比较函数
const MyComponent = React.memo(
  function MyComponent({ user }) {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    // 返回 true 表示 props 相等，不需要重新渲染
    return prevProps.user.id === nextProps.user.id;
  }
);
```

**useMemo：**
```javascript
// 缓存计算结果
function Component({ items }) {
  // ❌ 每次渲染都重新计算
  const expensiveValue = items
    .filter(item => item.active)
    .map(item => item.value * 2)
    .reduce((sum, val) => sum + val, 0);

  // ✅ 只在 items 变化时重新计算
  const expensiveValue = useMemo(() => {
    return items
      .filter(item => item.active)
      .map(item => item.value * 2)
      .reduce((sum, val) => sum + val, 0);
  }, [items]);

  return <div>{expensiveValue}</div>;
}
```

**useCallback：**
```javascript
// 缓存函数引用
function Component({ onClick }) {
  // ❌ 每次渲染都创建新函数
  const handleClick = () => {
    console.log('clicked');
  };

  // ✅ 只在依赖变化时创建新函数
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return <button onClick={handleClick}>点击</button>;
}

// 实际应用场景
function Parent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  // ✅ 使用 useCallback 避免子组件不必要的重渲染
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return (
    <>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
      <Child onClick={handleClick} />
    </>
  );
}

const Child = React.memo(function Child({ onClick }) {
  console.log('Child 渲染');
  return <button onClick={onClick}>子组件</button>;
});
```

**三者对比：**

| 工具 | 作用级别 | 缓存内容 | 使用场景 |
|------|---------|---------|---------|
| React.memo | 组件 | 组件渲染结果 | props 不变时避免重渲染 |
| useMemo | 值 | 计算结果 | 避免昂贵计算 |
| useCallback | 函数 | 函数引用 | 传递给子组件的回调函数 |

**useCallback 的常见陷阱：闭包陷阱**

```javascript
// ❌ 错误示例：闭包陷阱，获取不到最新的 count 值
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log(count); // 永远打印 0，因为闭包捕获了初始值
    setCount(count + 1); // 永远设置为 1
  }, []); // 依赖数组为空，函数只创建一次

  return <button onClick={handleClick}>Count: {count}</button>;
}

// ✅ 正确做法 1：添加依赖项
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log(count); // 每次都能获取到最新的 count
    setCount(count + 1);
  }, [count]); // count 变化时重新创建函数

  return <button onClick={handleClick}>Count: {count}</button>;
}

// ✅ 正确做法 2：使用函数式更新
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    setCount(prev => prev + 1); // 使用函数式更新，无需依赖 count
  }, []);

  return <button onClick={handleClick}>Count: {count}</button>;
}
```

**useCallback 与 Zustand 的闭包陷阱**

```javascript
// ❌ 错误示例：获取不到最新的 zustand 状态
import useStore from './store';

function MyComponent() {
  const increment = useStore(state => state.increment);
  const count = useStore(state => state.count);

  const handleClick = useCallback(() => {
    console.log(count); // 闭包陷阱，可能获取不到最新的 count
    increment();
  }, [increment]); // 缺少 count 依赖

  return <button onClick={handleClick}>Count: {count}</button>;
}

// ✅ 正确做法 1：添加所有依赖
function MyComponent() {
  const increment = useStore(state => state.increment);
  const count = useStore(state => state.count);

  const handleClick = useCallback(() => {
    console.log(count); // 现在能获取到最新的 count
    increment();
  }, [increment, count]); // 添加 count 依赖

  return <button onClick={handleClick}>Count: {count}</button>;
}

// ✅ 正确做法 2：在回调中直接获取最新状态
function MyComponent() {
  const increment = useStore(state => state.increment);
  const getCount = useStore(state => state.count);

  const handleClick = useCallback(() => {
    const currentCount = useStore.getState().count; // 直接获取最新状态
    console.log(currentCount);
    increment();
  }, [increment]);

  return <button onClick={handleClick}>Count: {getCount}</button>;
}

// ✅ 正确做法 3：使用 zustand 的 selector 函数
function MyComponent() {
  const increment = useStore(state => state.increment);

  const handleClick = useCallback(() => {
    increment(); // 在 store 内部处理状态更新
    console.log(useStore.getState().count); // 获取最新状态
  }, [increment]);

  const count = useStore(state => state.count);

  return <button onClick={handleClick}>Count: {count}</button>;
}
```

**为什么会出现闭包陷阱？**

问题的本质是 **React 的渲染机制和闭包捕获**：

```javascript
function Component() {
  const { mqttConfig } = useMqttStore(state => state.mqttConfig);
  
  const handleMqttMessage = useCallback(
    (data) => {
      const { deviceMac } = mqttConfig || {}; // 闭包捕获 mqttConfig
    },
    [mqttConfig]
  );
  
  const handleClick = () => {
    console.log('1. 调用前 mqttConfig:', mqttConfig.deviceMac); // 'A'
    
    // 更新 store
    setMqttStore({ deviceMac: 'B' });
    
    console.log('2. 更新后立即读取组件内的 mqttConfig:', mqttConfig.deviceMac); // 还是 'A'！
    // 因为组件还没有重新渲染，mqttConfig 变量还是旧值
    
    console.log('3. 读取 store 最新值:', useMqttStore.getState().mqttConfig.deviceMac); // 'B'
    // store 已经更新了
    
    handleMqttMessage(); // ❌ 还是打印 'A'，因为调用的是旧函数
  };
  
  return <button onClick={handleClick}>点击</button>;
}
```

**执行时序：**

```
时刻 T1: handleClick 执行
  ├─ mqttConfig 变量 = { deviceMac: 'A' }
  ├─ handleMqttMessage = fn1（闭包捕获 { deviceMac: 'A' }）
  ├─ setMqttStore({ deviceMac: 'B' })
  │   └─ store 立即更新 ✓
  ├─ mqttConfig 变量还是 { deviceMac: 'A' }（组件未重新渲染）
  └─ handleMqttMessage() 调用 fn1 → 打印 'A' ❌

时刻 T2: React 调度重新渲染
  ├─ 组件重新渲染
  ├─ mqttConfig 变量 = { deviceMac: 'B' }
  ├─ 依赖变化，创建 fn2（闭包捕获 { deviceMac: 'B' }）
  └─ handleMqttMessage = fn2

时刻 T3: 再次调用 handleMqttMessage
  └─ 调用 fn2 → 打印 'B' ✓
```

**核心原因：**

1. **闭包捕获**：`useCallback` 创建的函数会捕获创建时的 `mqttConfig` 值
2. **渲染异步**：Zustand 状态更新是同步的，但 React 组件重新渲染是异步的
3. **时序问题**：在状态更新后、组件重新渲染前调用函数，获取到的是旧值

**为什么 `getState()` 可以解决？**

```javascript
const handleMqttMessage = useCallback(
  (data) => {
    // 每次调用时都从 store 获取最新值
    const mqttConfig = useMqttStore.getState().mqttConfig; 
    console.log(mqttConfig.deviceMac);
  },
  [] // 空依赖，函数引用不变
);
```

**原理：**

- 不依赖闭包，每次调用都动态从 store 获取最新值
- 函数引用稳定，不会因为依赖变化而重新创建
- 无论何时调用，都能获取到最新的状态

**核心原则：**

1. **依赖数组必须完整**：useCallback 函数内部使用的所有外部变量都必须添加到依赖数组中
2. **函数式更新优先**：对于状态更新，优先使用函数式更新（`setCount(prev => prev + 1)`），避免依赖项
3. **直接获取最新状态**：对于 zustand 等状态管理库，可以使用 `getState()` 方法直接获取最新状态
4. **避免过度优化**：如果依赖项变化频繁，useCallback 可能反而降低性能，此时直接定义函数可能更好

---

### 10. React 的错误边界（Error Boundary）是什么？

**答案：**

错误边界是一种 React 组件，可以捕获子组件树中任何位置的 JavaScript 错误。

**基本用法：**

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 可以将错误日志上报给服务器
    console.error('Error caught by boundary:', error, errorInfo);
    
    // 上报错误
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 自定义降级 UI
      return this.props.fallback || <h1>出错了</h1>;
    }

    return this.props.children;
  }
}

// 使用
function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

**错误边界的特点：**

1. **只能捕获类组件中的错误**：函数组件需要用类组件包裹
2. **不能捕获以下错误**：
   - 事件处理器中的错误
   - 异步代码（setTimeout、Promise）
   - 服务端渲染
   - 错误边界自身抛出的错误

**函数组件的错误处理（React 16+）：**

```javascript
// 使用 react-error-boundary 库
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>出错了：</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>重试</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // 重置应用状态
      }}
      onError={(error) => {
        // 记录错误
      }}
    >
      <MyComponent />
    </ErrorBoundary>
  );
}
```

**实际应用场景：**

```javascript
// 分层错误边界
function App() {
  return (
    <ErrorBoundary fallback={<GlobalError />}>
      <Header />
      <ErrorBoundary fallback={<MainError />}>
        <MainContent />
      </ErrorBoundary>
      <ErrorBoundary fallback={<SidebarError />}>
        <Sidebar />
      </ErrorBoundary>
      <Footer />
    </ErrorBoundary>
  );
}
```

---

## Hooks 相关

### 11. React Hooks 的规则是什么？为什么会有这些规则？

**答案：**

**Hooks 的两条黄金规则：**

1. **只在函数组件的顶层调用 Hooks**
2. **只在 React 函数中调用 Hooks**（函数组件、自定义 Hook）

**规则示例：**

```javascript
// ✅ 正确：在顶层调用
function Component() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  
  useEffect(() => {
    console.log('effect');
  }, []);
  
  return <div>{count}</div>;
}

// ❌ 错误：在条件语句中调用
function Component() {
  if (someCondition) {
    const [count, setCount] = useState(0); // 错误！
  }
  return <div></div>;
}

// ❌ 错误：在循环中调用
function Component({ items }) {
  items.forEach(item => {
    const [value, setValue] = useState(item); // 错误！
  });
  return <div></div>;
}

// ❌ 错误：在嵌套函数中调用
function Component() {
  const handleClick = () => {
    const [count, setCount] = useState(0); // 错误！
  };
  return <button onClick={handleClick}>点击</button>;
}

// ❌ 错误：在普通 JavaScript 函数中调用
function getData() {
  const [data, setData] = useState(null); // 错误！
}
```

**为什么需要这些规则？**

React Hooks 的实现依赖于调用顺序：

```javascript
// React 内部维护一个 hooks 数组
let hooks = [];
let hookIndex = 0;

function useState(initialState) {
  const index = hookIndex;
  hookIndex++;
  
  if (hooks[index] === undefined) {
    hooks[index] = initialState;
  }
  
  return [
    hooks[index],
    (newValue) => {
      hooks[index] = newValue;
      render(); // 触发重新渲染
    }
  ];
}

// 第一次渲染
function Component() {
  const [count, setCount] = useState(0); // hookIndex = 0
  const [name, setName] = useState('');  // hookIndex = 1
}

// hooks 数组: [0, '']

// 如果在条件语句中调用
function Component({ showCount }) {
  if (showCount) {
    const [count, setCount] = useState(0); // hookIndex = 0
  }
  // showCount = false 时，跳过第一个 hook
  const [name, setName] = useState('');   // hookIndex = 1
  // 但这应该对应第一个 hook，导致状态错乱
}
```

**ESLint 插件：**

```json
{
  "eslintConfig": {
    "plugins": ["react-hooks"],
    "rules": {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    }
  }
}
```

---

### 12. useEffect 和 useLayoutEffect 的区别是什么？

**答案：**

**useEffect：**
- 异步执行，不阻塞浏览器绘制
- 在 DOM 更新后、屏幕绘制后执行
- 适合副作用：数据获取、订阅、手动修改 DOM

**useLayoutEffect：**
- 同步执行，阻塞浏览器绘制
- 在 DOM 更新后、屏幕绘制前执行
- 适合需要读取 DOM 布局的操作

**执行时机对比：**

```javascript
function Component() {
  const [width, setWidth] = useState(0);
  const divRef = useRef(null);

  // useEffect：在绘制后执行
  useEffect(() => {
    console.log('useEffect - DOM 已绘制');
    // 用户会看到初始状态，然后看到更新
  });

  // useLayoutEffect：在绘制前执行
  useLayoutEffect(() => {
    console.log('useLayoutEffect - DOM 已更新，未绘制');
    // 用户不会看到中间状态
    if (divRef.current) {
      setWidth(divRef.current.offsetWidth);
    }
  });

  return <div ref={divRef}>内容</div>;
}
```

**执行顺序：**

```
1. render（计算虚拟 DOM）
2. commit（更新真实 DOM）
3. useLayoutEffect（同步执行）
4. 浏览器绘制
5. useEffect（异步执行）
```

**使用场景：**

```javascript
// ✅ useEffect 适合的场景
function Component() {
  useEffect(() => {
    // 数据获取
    fetchData().then(data => setData(data));
    
    // 订阅事件
    const subscription = subscribe();
    return () => subscription.unsubscribe();
    
    // 修改 DOM（不依赖布局）
    document.title = '新标题';
  }, []);
}

// ✅ useLayoutEffect 适合的场景
function Component() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef(null);

  useLayoutEffect(() => {
    // 读取布局信息
    const rect = elementRef.current.getBoundingClientRect();
    setPosition({ x: rect.left, y: rect.top });
    
    // 同步修改 DOM 避免闪烁
    elementRef.current.style.transform = 'translateX(100px)';
  }, []);

  return <div ref={elementRef}>元素</div>;
}
```

**性能考虑：**

```javascript
// ❌ 避免在 useLayoutEffect 中执行耗时操作
useLayoutEffect(() => {
  // 这会阻塞绘制，导致卡顿
  heavyComputation();
}, []);

// ✅ 使用 useEffect
useEffect(() => {
  // 不阻塞绘制
  heavyComputation();
}, []);
```

**服务端渲染注意事项：**

```javascript
// useLayoutEffect 在服务端渲染时会报警告
// 可以使用 useEffect 替代，或使用条件渲染
function Component() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // 或加载状态
  }

  // 现在可以安全使用 useLayoutEffect
  return <ChildComponent />;
}
```

---

### 13. 自定义 Hook 的最佳实践是什么？

**答案：**

自定义 Hook 是复用状态逻辑的函数，必须以 "use" 开头。

**基本示例：**

```javascript
// ✅ 自定义 Hook：复用窗口大小逻辑
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// 使用
function Component() {
  const { width, height } = useWindowSize();
  return <div>{width} x {height}</div>;
}
```

**最佳实践：**

1. **单一职责原则：**
```javascript
// ❌ 不好的做法：一个 Hook 做太多事情
function useUserAndPosts() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  // ... 混合了用户和帖子的逻辑
}

// ✅ 好的做法：拆分成多个 Hook
function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    fetchUser().then(setUser).finally(() => setLoading(false));
  }, []);
  
  return { user, loading };
}

function usePosts(userId) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (userId) {
      setLoading(true);
      fetchPosts(userId).then(setPosts).finally(() => setLoading(false));
    }
  }, [userId]);
  
  return { posts, loading };
}
```

2. **参数和返回值设计：**
```javascript
// ✅ 清晰的参数和返回值
function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(url, options)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url, JSON.stringify(options)]);

  return { data, error, loading };
}

// 使用
function Component() {
  const { data, loading, error } = useFetch('/api/users');
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误：{error.message}</div>;
  return <div>{JSON.stringify(data)}</div>;
}
```

3. **清理副作用：**
```javascript
// ✅ 正确清理副作用
function useWebSocket(url) {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onmessage = (event) => {
      setMessage(JSON.parse(event.data));
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [url]);

  return { socket, message };
}
```

4. **组合多个 Hook：**
```javascript
// ✅ 组合使用其他 Hook
function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  
  const login = useCallback(async (credentials) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return { user, token, login, logout };
}

function useAuthenticatedFetch() {
  const { token } = useAuth();

  return useCallback(async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  }, [token]);
}
```

5. **错误处理：**
```javascript
// ✅ 完善的错误处理
function useAsync(asyncFunction, immediate = true) {
  const [status, setStatus] = useState('idle');
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setStatus('pending');
    setValue(null);
    setError(null);

    try {
      const response = await asyncFunction(...args);
      setValue(response);
      setStatus('success');
    } catch (error) {
      setError(error);
      setStatus('error');
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, value, error };
}
```

---

### 14. useRef 的使用场景有哪些？

**答案：**

useRef 返回一个可变的 ref 对象，其 `.current` 属性被初始化为传入的参数。

**使用场景：**

1. **访问 DOM 元素：**
```javascript
function Component() {
  const inputRef = useRef(null);
  const divRef = useRef(null);

  const focusInput = () => {
    inputRef.current.focus();
  };

  useEffect(() => {
    console.log(divRef.current.offsetWidth);
  }, []);

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>聚焦输入框</button>
      <div ref={divRef}>内容</div>
    </div>
  );
}
```

2. **保存不需要触发重渲染的值：**
```javascript
function Component() {
  const [count, setCount] = useState(0);
  const renderCount = useRef(0);

  renderCount.current += 1; // 不会触发重渲染

  return (
    <div>
      <p>Count: {count}</p>
      <p>Render count: {renderCount.current}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}
```

3. **保存定时器 ID：**
```javascript
function Component() {
  const timerRef = useRef(null);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      console.log('定时器执行');
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
  };

  useEffect(() => {
    return () => {
      // 组件卸载时清理
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div>
      <button onClick={startTimer}>开始</button>
      <button onClick={stopTimer}>停止</button>
    </div>
  );
}
```

4. **保存上一次的值：**
```javascript
function Component() {
  const [count, setCount] = useState(0);
  const prevCountRef = useRef();

  useEffect(() => {
    prevCountRef.current = count;
  }, [count]);

  const prevCount = prevCountRef.current;

  return (
    <div>
      <p>当前值: {count}</p>
      <p>上一次值: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}
```

5. **可变容器（类似实例变量）：**
```javascript
function Component() {
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchData = async () => {
    const response = await fetch('/api/data');
    const data = await response.json();
    
    // 避免在已卸载的组件中更新状态
    if (isMountedRef.current) {
      setData(data);
    }
  };

  return <button onClick={fetchData}>获取数据</button>;
}
```

6. **useRef vs useState：**
```javascript
function Component() {
  // useState：更新会触发重渲染
  const [count, setCount] = useState(0);

  // useRef：更新不会触发重渲染
  const countRef = useRef(0);

  const incrementState = () => {
    setCount(count + 1); // 触发重渲染
  };

  const incrementRef = () => {
    countRef.current += 1; // 不触发重渲染
    console.log(countRef.current); // 需要手动读取
  };

  return (
    <div>
      <p>State: {count}</p>
      <p>Ref: {countRef.current}</p>
      <button onClick={incrementState}>增加 State</button>
      <button onClick={incrementRef}>增加 Ref</button>
    </div>
  );
}
```

**7. useRef 的深入原理：**

```javascript
// useRef 的简化实现
function useRef(initialValue) {
  // 创建一个 ref 对象
  const ref = { current: initialValue };
  
  // 返回这个对象
  return ref;
}

// React 内部实现（简化版）
// React 使用 ref 对象的引用不变性来识别
// 每次 render 时，ref 对象都是同一个引用
function useRefImpl(initialValue) {
  const ref = {
    current: initialValue,
    // 内部属性，用于 React 识别
    __reactInternalMemoizedValue: initialValue
  };
  
  return ref;
}

// React 在 Fiber 节点中存储 ref
// fiber.memoizedState = [hook1, hook2, refHook, ...]
// 每次 render 时，ref 对象都是同一个实例
```

**useRef 的工作机制：**

```javascript
// 第一次渲染
function Component() {
  const ref = useRef(0); // 创建 ref 对象 { current: 0 }
  console.log(ref); // { current: 0 }
  
  return <div>{ref.current}</div>;
}

// 第二次渲染（状态变化后）
function Component() {
  const ref = useRef(0); // 返回同一个 ref 对象
  console.log(ref); // { current: 0 } （同一个引用）
  
  return <div>{ref.current}</div>;
}

// 修改 ref.current
ref.current = 100; // 修改 current 属性
console.log(ref); // { current: 100 } （引用不变，值变了）
// 不会触发重渲染
```

**8. useRef 的更多应用场景：**

**场景 1：实现防抖和节流**
```javascript
function useDebounce(fn, delay) {
  const timeoutRef = useRef(null);

  return function debounced(...args) {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

function Component() {
  const [query, setQuery] = useState('');
  const debouncedSearch = useDebounce((value) => {
    console.log('搜索:', value);
  }, 500);

  return (
    <input
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);
        debouncedSearch(e.target.value);
      }}
    />
  );
}
```

**场景 2：实现节流**
```javascript
function useThrottle(fn, delay) {
  const lastCallRef = useRef(0);
  const timeoutRef = useRef(null);

  return function throttled(...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallRef.current;

    if (timeSinceLastCall >= delay) {
      fn.apply(this, args);
      lastCallRef.current = now;
    } else {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        fn.apply(this, args);
        lastCallRef.current = Date.now();
      }, delay - timeSinceLastCall);
    }
  };
}

function Component() {
  const [count, setCount] = useState(0);
  const throttledIncrement = useThrottle(() => {
    setCount(c => c + 1);
  }, 1000);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={throttledIncrement}>点击（1秒内只能点一次）</button>
    </div>
  );
}
```

**场景 3：保存滚动位置**
```javascript
function ScrollableList({ items }) {
  const listRef = useRef(null);
  const scrollPositionRef = useRef(0);

  const handleScroll = () => {
    scrollPositionRef.current = listRef.current.scrollTop;
  };

  const restoreScrollPosition = () => {
    listRef.current.scrollTop = scrollPositionRef.current;
  };

  useEffect(() => {
    const listEl = listRef.current;
    listEl.addEventListener('scroll', handleScroll);
    return () => listEl.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={listRef} style={{ height: 400, overflow: 'auto' }}>
      {items.map(item => (
        <div key={item.id} style={{ height: 100 }}>
          {item.name}
        </div>
      ))}
    </div>
  );
}
```

**场景 4：实现自定义 Hook 中的可变状态**
```javascript
function useCounter(initialValue = 0) {
  const countRef = useRef(initialValue);
  const [, forceUpdate] = useState({});

  const increment = () => {
    countRef.current += 1;
    forceUpdate({}); // 触发重渲染
  };

  const decrement = () => {
    countRef.current -= 1;
    forceUpdate({}); // 触发重渲染
  };

  const reset = () => {
    countRef.current = initialValue;
    forceUpdate({}); // 触发重渲染
  };

  return {
    get count() {
      return countRef.current;
    },
    increment,
    decrement,
    reset
  };
}

function Component() {
  const counter = useCounter(0);

  return (
    <div>
      <p>Count: {counter.count}</p>
      <button onClick={counter.increment}>增加</button>
      <button onClick={counter.decrement}>减少</button>
      <button onClick={counter.reset}>重置</button>
    </div>
  );
}
```

**场景 5：保存 WebSocket 连接**
```javascript
function useWebSocket(url) {
  const wsRef = useRef(null);
  const messageQueueRef = useRef([]);
  const [messages, setMessages] = useState([]);

  const connect = () => {
    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = () => {
      console.log('WebSocket 已连接');
      // 发送队列中的消息
      messageQueueRef.current.forEach(msg => {
        wsRef.current.send(msg);
      });
      messageQueueRef.current = [];
    };

    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket 已断开');
      wsRef.current = null;
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket 错误:', error);
    };
  };

  const send = (data) => {
    const message = JSON.stringify(data);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    } else {
      // 连接未建立，加入队列
      messageQueueRef.current.push(message);
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [url]);

  return { messages, send, disconnect };
}

function Component() {
  const { messages, send } = useWebSocket('ws://localhost:8080');

  return (
    <div>
      <button onClick={() => send({ type: 'ping' })}>
        发送消息
      </button>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{JSON.stringify(msg)}</li>
        ))}
      </ul>
    </div>
  );
}
```

**场景 6：实现动画帧控制**
```javascript
function useAnimationFrame(callback) {
  const requestRef = useRef();
  const previousTimeRef = useRef();

  const animate = (time) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [callback]);
}

function AnimatedComponent() {
  const [position, setPosition] = useState(0);

  useAnimationFrame((deltaTime) => {
    setPosition(prev => (prev + deltaTime * 0.1) % 500);
  });

  return (
    <div
      style={{
        width: 50,
        height: 50,
        backgroundColor: 'red',
        transform: `translateX(${position}px)`,
      }}
    />
  );
}
```

**场景 7：保存表单的初始值**
```javascript
function Form() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: ''
  });

  const initialDataRef = useRef(formData);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const resetForm = () => {
    setFormData(initialDataRef.current);
  };

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialDataRef.current);
  };

  return (
    <form>
      <input
        value={formData.name}
        onChange={handleChange('name')}
        placeholder="姓名"
      />
      <input
        value={formData.email}
        onChange={handleChange('email')}
        placeholder="邮箱"
      />
      <input
        value={formData.age}
        onChange={handleChange('age')}
        placeholder="年龄"
      />
      <button onClick={resetForm} disabled={!hasChanges()}>
        重置
      </button>
    </form>
  );
}
```

**场景 8：实现拖拽功能**
```javascript
function DraggableComponent() {
  const positionRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const elementRef = useRef(null);

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - positionRef.current.x,
      y: e.clientY - positionRef.current.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;

    positionRef.current = {
      x: e.clientX - dragOffsetRef.current.x,
      y: e.clientY - dragOffsetRef.current.y
    };

    if (elementRef.current) {
      elementRef.current.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`;
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={elementRef}
      onMouseDown={handleMouseDown}
      style={{
        width: 100,
        height: 100,
        backgroundColor: 'blue',
        position: 'absolute',
        cursor: 'move',
        transform: `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`
      }}
    />
  );
}
```

**场景 9：保存 IntersectionObserver**
```javascript
function useIntersectionObserver(ref, options = {}) {
  const observerRef = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    observerRef.current = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observerRef.current.observe(ref.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [ref, options]);

  return isIntersecting;
}

function LazyImage({ src, alt }) {
  const imgRef = useRef(null);
  const isVisible = useIntersectionObserver(imgRef, {
    threshold: 0.1
  });

  return (
    <img
      ref={imgRef}
      src={isVisible ? src : ''}
      alt={alt}
      style={{ opacity: isVisible ? 1 : 0.3, transition: 'opacity 0.3s' }}
    />
  );
}
```

**场景 10：实现请求取消**
```javascript
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const fetch = async () => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    return () => {
      // 组件卸载时取消请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url]);

  return { data, loading, error, refetch: fetch };
}

function Component() {
  const { data, loading, error } = useFetch('/api/data');

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  return <div>{JSON.stringify(data)}</div>;
}
```

**9. useRef 与其他 Hook 的组合使用：**

**useRef + useEffect**
```javascript
function Component() {
  const countRef = useRef(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    // 每次渲染时更新 ref
    countRef.current = count;
    console.log('当前 count:', countRef.current);
  });

  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

**useRef + useCallback**
```javascript
function Component() {
  const dataRef = useRef({});

  const updateData = useCallback((key, value) => {
    dataRef.current[key] = value;
    console.log('更新后的数据:', dataRef.current);
  }, []);

  return <button onClick={() => updateData('name', 'John')}>更新数据</button>;
}
```

**useRef + useMemo**
```javascript
function Component({ items }) {
  const filteredItemsRef = useRef([]);

  const filteredItems = useMemo(() => {
    const result = items.filter(item => item.active);
    filteredItemsRef.current = result;
    return result;
  }, [items]);

  return <div>{filteredItems.length}</div>;
}
```

**10. useRef 的性能优化：**

```javascript
// ✅ 使用 useRef 避免不必要的重渲染
function ExpensiveComponent({ data }) {
  const processedDataRef = useRef(null);
  const lastDataRef = useRef(null);

  // 只在数据变化时重新处理
  if (lastDataRef.current !== data) {
    processedDataRef.current = heavyProcessing(data);
    lastDataRef.current = data;
  }

  return <div>{processedDataRef.current}</div>;
}

// ❌ 每次渲染都重新处理
function ExpensiveComponent({ data }) {
  const processedData = heavyProcessing(data); // 每次都执行

  return <div>{processedData}</div>;
}
```

**11. useRef 的常见陷阱和注意事项：**

**陷阱 1：在渲染期间修改 ref**
```javascript
// ❌ 不好的做法
function Component() {
  const countRef = useRef(0);
  
  countRef.current += 1; // 每次渲染都执行
  
  return <div>{countRef.current}</div>;
}

// ✅ 好的做法
function Component() {
  const countRef = useRef(0);
  const [trigger, setTrigger] = useState(0);
  
  useEffect(() => {
    countRef.current += 1; // 只在特定条件下执行
  }, [trigger]);
  
  return <div>{countRef.current}</div>;
}
```

**陷阱 2：ref.current 在闭包中的值**
```javascript
// ❌ 问题：闭包中的值可能过时
function Component() {
  const countRef = useRef(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      console.log(countRef.current); // 可能是旧值
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <button onClick={() => {
    countRef.current += 1;
    setCount(count + 1);
  }}>{count}</button>;
}

// ✅ 解决方案：使用函数式更新
function Component() {
  const countRef = useRef(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      console.log(countRef.current); // 总是最新的值
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <button onClick={() => {
    countRef.current += 1;
    setCount(c => c + 1);
  }}>{count}</button>;
}
```

**陷阱 3：ref 初始化时机**
```javascript
// ❌ 问题：ref 可能在元素渲染前使用
function Component() {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus(); // 可能为 null
  }, []);

  return <input ref={inputRef} />;
}

// ✅ 解决方案：检查 ref 是否存在
function Component() {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return <input ref={inputRef} />;
}
```

**陷阱 4：ref 的类型安全**
```javascript
// ✅ 使用 TypeScript 指定 ref 类型
import { useRef } from 'react';

function Component() {
  const inputRef = useRef<HTMLInputElement>(null);
  const divRef = useRef<HTMLDivElement>(null);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus(); // 类型安全
    }
  };

  return (
    <div ref={divRef}>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>聚焦</button>
    </div>
  );
}
```

**12. useRef 的最佳实践：**

```javascript
// 1. 明确 ref 的用途
function Component() {
  // ✅ 清晰的命名
  const timerRef = useRef(null);
  const isMountedRef = useRef(false);
  const scrollPositionRef = useRef(0);

  // ❌ 不清晰的命名
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
}

// 2. 及时清理 ref
function Component() {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      console.log('tick');
    }, 1000);

    return () => {
      // 清理定时器
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return <div>Component</div>;
}

// 3. 避免在 ref 中存储大量数据
function Component() {
  // ❌ 不好的做法：存储大量数据
  const largeDataRef = useRef(new Array(1000000).fill(0));

  // ✅ 好的做法：存储必要的引用
  const dataRef = useRef(null);
  
  useEffect(() => {
    dataRef.current = fetchData();
  }, []);

  return <div>Component</div>;
}

// 4. 使用 ref 避免不必要的重渲染
function Component({ items }) {
  const lastItemsRef = useRef([]);

  // 只在 items 变化时处理
  if (JSON.stringify(items) !== JSON.stringify(lastItemsRef.current)) {
    processItems(items);
    lastItemsRef.current = items;
  }

  return <div>Component</div>;
}
```

**13. useRef 的源码实现（React 18）：**

```javascript
// React 源码中的 useRef 实现（简化版）
function useRef(initialValue) {
  const currentDispatcher = ReactCurrentDispatcher.current;
  return currentDispatcher.useRef(initialValue);
}

// Dispatcher 中的实现
function useRefImpl(initialValue) {
  const hook = updateWorkInProgressHook();
  const ref = {
    current: initialValue
  };
  
  if (hook.memoizedState === null) {
    hook.memoizedState = ref;
  } else {
    hook.memoizedState = ref;
  }
  
  return ref;
}

// Fiber 节点中的 hooks 存储
// fiber.memoizedState = [useState hook, useEffect hook, useRef hook, ...]
// 每个 useRef hook 都有一个 ref 对象
// ref 对象在组件的整个生命周期中保持不变
```

**useRef 的核心特性总结：**

| 特性 | 说明 |
|------|------|
| 引用不变 | 每次 render 返回同一个 ref 对象 |
| 可变 | 可以修改 ref.current 的值 |
| 不触发重渲染 | 修改 ref.current 不会导致组件重新渲染 |
| 持久化 | 在组件整个生命周期中保持 |
| 类型安全 | 支持 TypeScript 类型推断 |

**何时使用 useRef：**

✅ **适合使用 useRef 的场景：**
- 访问 DOM 元素
- 保存定时器 ID、WebSocket 连接等需要清理的资源
- 保存不需要触发重渲染的值
- 实现防抖、节流等性能优化
- 保存上一次的值进行比较
- 实现自定义的可变状态

❌ **不适合使用 useRef 的场景：**
- 需要触发 UI 更新的状态（应该用 useState）
- 需要在多个组件间共享的状态（应该用 Context 或状态管理库）
- 需要派生状态（应该用 useMemo）
- 需要响应式更新的数据（应该用 useState）

---

### 15. useReducer 的使用场景是什么？与 useState 有什么区别？

**答案：**

useReducer 是 useState 的替代方案，适用于复杂的状态逻辑。

**基本用法：**

```javascript
// 定义 reducer
const reducer = (state, action) => {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'set':
      return { count: action.payload };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
};

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>
        增加
      </button>
      <button onClick={() => dispatch({ type: 'decrement' })}>
        减少
      </button>
      <button onClick={() => dispatch({ type: 'set', payload: 0 })}>
        重置
      </button>
    </div>
  );
}
```

**useState vs useReducer：**

```javascript
// useState：适合简单状态
function SimpleForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ name, email, age });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input value={age} onChange={(e) => setAge(e.target.value)} />
      <button type="submit">提交</button>
    </form>
  );
}

// useReducer：适合复杂状态逻辑
const initialState = {
  name: '',
  email: '',
  age: '',
  errors: {},
  isSubmitting: false,
};

function formReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
        errors: { ...state.errors, [action.field]: null },
      };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'SUBMIT_START':
      return { ...state, isSubmitting: true };
    case 'SUBMIT_SUCCESS':
      return initialState;
    case 'SUBMIT_ERROR':
      return { ...state, isSubmitting: false };
    default:
      return state;
  }
}

function ComplexForm() {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const handleChange = (field) => (e) => {
    dispatch({ type: 'SET_FIELD', field, value: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 验证
    const errors = validate(state);
    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_ERRORS', errors });
      return;
    }

    dispatch({ type: 'SUBMIT_START' });
    
    try {
      await submitForm(state);
      dispatch({ type: 'SUBMIT_SUCCESS' });
    } catch (error) {
      dispatch({ type: 'SUBMIT_ERROR' });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={state.name}
        onChange={handleChange('name')}
      />
      {state.errors.name && <span>{state.errors.name}</span>}
      {/* ... 其他字段 */}
      <button type="submit" disabled={state.isSubmitting}>
        {state.isSubmitting ? '提交中...' : '提交'}
      </button>
    </form>
  );
}
```

**useReducer 的优势：**

1. **逻辑集中管理：**
```javascript
// ✅ 所有状态逻辑在一个地方
const todoReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, { id: Date.now(), text: action.text, completed: false }];
    case 'TOGGLE_TODO':
      return state.map(todo =>
        todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
      );
    case 'DELETE_TODO':
      return state.filter(todo => todo.id !== action.id);
    case 'CLEAR_COMPLETED':
      return state.filter(todo => !todo.completed);
    default:
      return state;
  }
};

function TodoApp() {
  const [todos, dispatch] = useReducer(todoReducer, []);
  
  // 清晰的 action dispatch
  const addTodo = (text) => dispatch({ type: 'ADD_TODO', text });
  const toggleTodo = (id) => dispatch({ type: 'TOGGLE_TODO', id });
  const deleteTodo = (id) => dispatch({ type: 'DELETE_TODO', id });
  const clearCompleted = () => dispatch({ type: 'CLEAR_COMPLETED' });
  
  return <div>{/* ... */}</div>;
}
```

2. **易于测试：**
```javascript
// Reducer 是纯函数，易于测试
describe('todoReducer', () => {
  it('should add todo', () => {
    const state = [];
    const action = { type: 'ADD_TODO', text: '学习 React' };
    const newState = todoReducer(state, action);
    
    expect(newState).toHaveLength(1);
    expect(newState[0].text).toBe('学习 React');
  });
});
```

3. **惰性初始化：**
```javascript
// 复杂的初始状态计算
function init(initialCount) {
  return { count: initialCount, step: 1 };
}

function Counter({ initialCount }) {
  const [state, dispatch] = useReducer(reducer, initialCount, init);
  // init 只在初始渲染时调用一次
  return <div>{state.count}</div>;
}
```

**使用场景总结：**

| 场景 | 推荐使用 |
|------|---------|
| 简单状态（字符串、数字、布尔值） | useState |
| 多个独立的状态 | useState |
| 复杂的状态逻辑，多个子值 | useReducer |
| 下一个状态依赖前一个状态 | useState（函数式更新）或 useReducer |
| 需要测试状态逻辑 | useReducer |

---

## React 新特性

### 16. React 18 的新特性有哪些？

**答案：**

React 18 引入了并发渲染和多个新特性。

**1. 自动批处理（Automatic Batching）：**

```javascript
// React 17：只有在 React 事件中才批处理
function Component() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  // ✅ 批处理：只渲染一次
  const handleClick = () => {
    setCount(c => c + 1);
    setFlag(f => !f);
    // 只渲染一次
  };

  // ❌ 不批处理：渲染两次
  const fetchData = () => {
    fetch('/api').then(() => {
      setCount(c => c + 1);  // 渲染
      setFlag(f => !f);      // 渲染
    });
  };

  return <button onClick={handleClick}>点击</button>;
}

// React 18：所有更新都会被批处理
function Component() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  // ✅ 批处理：只渲染一次
  const fetchData = () => {
    fetch('/api').then(() => {
      setCount(c => c + 1);
      setFlag(f => !f);
      // 只渲染一次
    });
  };

  return <button onClick={handleClick}>点击</button>;
}
```

**2. 并发特性（Concurrent Features）：**

```javascript
// Suspense for Data Fetching
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <UserProfile />
    </Suspense>
  );
}

// useTransition：标记非紧急更新
function Component() {
  const [isPending, startTransition] = useTransition();
  const [input, setInput] = useState('');
  const [list, setList] = useState([]);

  const handleChange = (e) => {
    // 紧急更新：立即执行
    setInput(e.target.value);
    
    // 非紧急更新：可以中断
    startTransition(() => {
      setList(filterList(e.target.value));
    });
  };

  return (
    <div>
      <input value={input} onChange={handleChange} />
      {isPending && <div>加载中...</div>}
      <List items={list} />
    </div>
  );
}

// useDeferredValue：延迟更新值
function Component() {
  const [input, setInput] = useState('');
  const deferredInput = useDeferredValue(input);

  return (
    <div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <ExpensiveList query={deferredInput} />
    </div>
  );
}
```

**3. 新的 Root API：**

```javascript
// React 17
import { render } from 'react-dom';
render(<App />, document.getElementById('root'));

// React 18
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<App />);

// 卸载应用
root.unmount();
```

**4. Suspense 改进：**

```javascript
// 服务端渲染支持 Suspense
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<Skeleton />}>
      <Header />
      <Suspense fallback={<ContentSkeleton />}>
        <MainContent />
      </Suspense>
      <Footer />
    </Suspense>
  );
}
```

**5. 严格模式更新：**

```javascript
// React 18 严格模式：组件会挂载、卸载、再挂载
// 用于检测副作用清理逻辑
import { StrictMode } from 'react';

function App() {
  useEffect(() => {
    console.log('挂载');
    return () => {
      console.log('卸载');
    };
  }, []);

  return <div>App</div>;
}

// 开发环境下会看到两次"挂载"和"卸载"
```

**6. 新的 Hooks：**

```javascript
// useId：生成唯一 ID
function Component() {
  const id = useId();
  return (
    <div>
      <label htmlFor={`${id}-email`}>邮箱</label>
      <input id={`${id}-email`} type="email" />
    </div>
  );
}

// useSyncExternalStore：订阅外部数据源
import { useSyncExternalStore } from 'react';

function Component() {
  const width = useSyncExternalStore(
    (callback) => {
      window.addEventListener('resize', callback);
      return () => window.removeEventListener('resize', callback);
    },
    () => window.innerWidth
  );

  return <div>Width: {width}</div>;
}
```

---

### 17. React 19 的新特性有哪些？

**答案：**

React 19 引入了多个简化开发体验的新特性。

**1. 简化的表单处理：**

```javascript
// React 18：需要手动处理表单提交
function Form() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await submitForm(formData);
      alert('提交成功');
    } catch (error) {
      setErrors(error.response.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      {errors.name && <span>{errors.name}</span>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '提交中...' : '提交'}
      </button>
    </form>
  );
}

// React 19：使用 actions
function Form() {
  const [errors, setErrors] = useState({});

  return (
    <form
      action={async (formData) => {
        try {
          await submitForm(formData);
          alert('提交成功');
        } catch (error) {
          setErrors(error.response.data);
        }
      }}
    >
      <input name="name" />
      {errors.name && <span>{errors.name}</span>}
      <button type="submit">提交</button>
    </form>
  );
}
```

**2. useActionState Hook：**

```javascript
import { useActionState } from 'react';

function Form() {
  const [state, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      const errors = await validate(formData);
      if (Object.keys(errors).length > 0) {
        return { errors };
      }
      await submitForm(formData);
      return { success: true };
    },
    { errors: {} }
  );

  return (
    <form action={formAction}>
      <input name="name" />
      {state.errors.name && <span>{state.errors.name}</span>}
      <button type="submit" disabled={isPending}>
        {isPending ? '提交中...' : '提交'}
      </button>
    </form>
  );
}
```

**3. useOptimistic Hook：**

```javascript
import { useOptimistic } from 'react';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo) => [...state, { ...newTodo, optimistic: true }]
  );

  const addTodo = async (text) => {
    addOptimisticTodo({ id: Date.now(), text, completed: false });
    const newTodo = await api.addTodo(text);
    setTodos([...todos, newTodo]);
  };

  return (
    <ul>
      {optimisticTodos.map(todo => (
        <li key={todo.id} className={todo.optimistic ? 'opacity-50' : ''}>
          {todo.text}
        </li>
      ))}
    </ul>
  );
}
```

**4. use Hook：**

```javascript
import { use } from 'react';

async function fetchData() {
  const res = await fetch('/api/data');
  return res.json();
}

function Component() {
  // 在组件中直接使用 Promise
  const data = use(fetchData());
  
  return <div>{data.name}</div>;
}

// 配合 Suspense
function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  );
}
```

**5. Server Components 改进：**

```javascript
// 服务器组件（默认）
async function UserProfile({ userId }) {
  const user = await db.user.findUnique({ where: { id: userId } });
  const posts = await db.post.findMany({ where: { userId } });

  return (
    <div>
      <h1>{user.name}</h1>
      <PostList posts={posts} />
    </div>
  );
}

// 客户端组件
'use client';

function PostList({ posts }) {
  const [filter, setFilter] = useState('');

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="搜索帖子"
      />
      {filteredPosts.map(post => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
```

**6. 改进的 ref 支持：**

```javascript
// 函数组件现在可以直接接收 ref
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}

// 使用
function App() {
  const inputRef = useRef(null);
  
  return <Input ref={inputRef} />;
}

// 或者使用 forwardRef（仍然支持）
const Input = forwardRef(function Input(props, ref) {
  return <input ref={ref} {...props} />;
});
```

---

### 18. React Server Components 是什么？有什么优势？

**答案：**

React Server Components (RSC) 是在服务器上渲染的组件，可以访问服务器资源。

**核心概念：**

```javascript
// 服务器组件（默认）
// 文件名：UserProfile.server.jsx
async function UserProfile({ userId }) {
  // 直接访问数据库
  const user = await db.user.findUnique({ where: { id: userId } });
  
  // 直接访问文件系统
  const avatar = await fs.readFile(`/avatars/${userId}.png`);
  
  // 直接调用 API（不需要 fetch）
  const posts = await getPosts(userId);

  return (
    <div>
      <img src={`data:image/png;base64,${avatar.toString('base64')}`} />
      <h1>{user.name}</h1>
      <PostList posts={posts} />
    </div>
  );
}

// 客户端组件
// 文件名：PostList.client.jsx
'use client';

import { useState } from 'react';

function PostList({ posts }) {
  const [filter, setFilter] = useState('');

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      {filteredPosts.map(post => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
```

**优势：**

1. **减少客户端包大小：**
```javascript
// 服务器组件：不会发送到客户端
async function ServerComponent() {
  // 使用重型库（如 date-fns、lodash）
  const date = format(new Date(), 'yyyy-MM-dd');
  const result = _.map(data, item => item.value);
  
  // 这些库不会打包到客户端
  return <div>{date}</div>;
}

// 客户端组件：需要发送到客户端
'use client';

function ClientComponent() {
  // 这些库会打包到客户端
  const date = format(new Date(), 'yyyy-MM-dd');
  const result = _.map(data, item => item.value);
  
  return <div>{date}</div>;
}
```

2. **直接访问服务器资源：**
```javascript
// 服务器组件
async function ProductPage({ productId }) {
  // 直接查询数据库
  const product = await db.product.findUnique({
    where: { id: productId },
    include: { reviews: true }
  });

  // 直接读取文件
  const images = await fs.readdir(`/products/${productId}/images`);

  // 直接调用内部 API
  const recommendations = await getRecommendations(productId);

  return (
    <div>
      <h1>{product.name}</h1>
      <Gallery images={images} />
      <Reviews reviews={product.reviews} />
      <Recommendations items={recommendations} />
    </div>
  );
}
```

3. **保持代码在服务器：**
```javascript
// 服务器组件：敏感逻辑不会暴露到客户端
async function AdminDashboard() {
  // 密钥和 API 配置只在服务器
  const apiKey = process.env.ADMIN_API_KEY;
  
  // 敏感业务逻辑
  const data = await fetchSensitiveData(apiKey);
  
  // 不会发送到客户端
  return <Dashboard data={data} />;
}
```

4. **流式渲染：**
```javascript
// 服务器组件支持流式渲染
async function Page() {
  return (
    <div>
      <Header />
      <Suspense fallback={<Skeleton />}>
        <MainContent />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <Sidebar />
      </Suspense>
      <Footer />
    </div>
  );
}

// MainContent 和 Sidebar 可以独立加载
```

**使用场景：**

```javascript
// ✅ 适合服务器组件
async function ProductList() {
  // 数据获取
  const products = await db.product.findMany();
  
  // 重型数据处理
  const processed = heavyProcessing(products);
  
  // 访问服务器资源
  const config = await getConfig();
  
  return <div>{/* ... */}</div>;
}

// ✅ 适合客户端组件
'use client';

function InteractiveComponent() {
  // 事件处理
  const [isOpen, setIsOpen] = useState(false);
  
  // 浏览器 API
  useEffect(() => {
    const handler = () => console.log('scroll');
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // 交互逻辑
  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return <button onClick={handleClick}>点击</button>;
}
```

**组合使用：**

```javascript
// 服务器组件
async function Page() {
  const user = await getCurrentUser();
  const posts = await getUserPosts(user.id);

  return (
    <div>
      <Header user={user} />
      <PostList posts={posts} />
      <InteractiveWidget />
    </div>
  );
}

// 客户端组件
'use client';

function InteractiveWidget() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      点击次数: {count}
    </button>
  );
}
```

---

### 19. React 的 Suspense 是如何工作的？

**答案：**

Suspense 让组件可以"等待"某些操作（如数据获取、代码分割）完成。

**基本用法：**

```javascript
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <UserProfile />
    </Suspense>
  );
}

function UserProfile() {
  // 使用 use 读取 Promise
  const user = use(fetchUser());
  
  return (
    <div>
      <h1>{user.name}</h1>
      <Suspense fallback={<PostsSkeleton />}>
        <UserPosts userId={user.id} />
      </Suspense>
    </div>
  );
}
```

**代码分割：**

```javascript
import { Suspense, lazy } from 'react';

// 懒加载组件
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <div>
      <Suspense fallback={<div>加载中...</div>}>
        <HeavyComponent />
      </Suspense>
    </div>
  );
}
```

**数据获取：**

```javascript
// 使用 React Query
import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';

function UserProfile() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    suspense: true, // 启用 Suspense
  });

  return <div>{user.name}</div>;
}

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <UserProfile />
    </Suspense>
  );
}
```

**嵌套 Suspense：**

```javascript
function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Header />
      <Suspense fallback={<ContentSkeleton />}>
        <MainContent />
      </Suspense>
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>
      <Footer />
    </Suspense>
  );
}
```

**错误边界：**

```javascript
import { Suspense } from 'react';

function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <Suspense fallback={<Loading />}>
        <UserProfile />
      </Suspense>
    </ErrorBoundary>
  );
}
```

**Suspense List（React 18）：**

```javascript
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Component1 />
      <Component2 />
      <Component3 />
    </Suspense>
  );
}

// 或使用 revealOrder
<Suspense fallback={<Loading />} revealOrder="forwards">
  <Component1 />
  <Component2 />
  <Component3 />
</Suspense>

// revealOrder 选项：
// - "forwards": 从前到后显示
// - "backwards": 从后到前显示
// - "together": 一起显示
```

---

### 20. React Compiler 是什么？有什么作用？

**答案：**

React Compiler 是一个自动优化 React 应用的编译器，可以自动添加 memoization。

**工作原理：**

```javascript
// 源代码
function Component({ items }) {
  const [filter, setFilter] = useState('');
  
  const filteredItems = items.filter(item =>
    item.name.includes(filter)
  );
  
  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      {filteredItems.map(item => (
        <Item key={item.id} item={item} />
      ))}
    </div>
  );
}

// React Compiler 自动优化为
function Component({ items }) {
  const [filter, setFilter] = useState('');
  
  const filteredItems = useMemo(() =>
    items.filter(item => item.name.includes(filter)),
    [items, filter]
  );
  
  const handleChange = useCallback((e) => {
    setFilter(e.target.value);
  }, []);
  
  return (
    <div>
      <input value={filter} onChange={handleChange} />
      {filteredItems.map(item => (
        <Item key={item.id} item={item} />
      ))}
    </div>
  );
}
```

**使用方法：**

```javascript
// 安装
npm install react-compiler-runtime

// 配置 Babel
{
  "plugins": [
    ["babel-plugin-react-compiler", {
      "runtimeModule": "react-compiler-runtime"
    }]
  ]
}

// 或在 Next.js 中使用
// next.config.js
module.exports = {
  experimental: {
    reactCompiler: true,
  },
};
```

**优化场景：**

```javascript
// 1. 自动 memoize 计算值
function Component({ data }) {
  // 自动添加 useMemo
  const processed = expensiveComputation(data);
  
  return <div>{processed}</div>;
}

// 2. 自动 memoize 函数
function Component({ onSave }) {
  // 自动添加 useCallback
  const handleClick = () => {
    onSave();
  };
  
  return <button onClick={handleClick}>保存</button>;
}

// 3. 自动 memoize 组件
const Item = function Item({ item }) {
  // 自动添加 React.memo
  return <div>{item.name}</div>;
};

function List({ items }) {
  return items.map(item => <Item key={item.id} item={item} />);
}
```

**限制：**

```javascript
// ❌ React Compiler 无法优化的情况

// 1. 使用了外部可变状态
let externalState = 0;
function Component() {
  const [count, setCount] = useState(0);
  
  // externalState 变化时，无法自动优化
  const value = externalState + count;
  
  return <div>{value}</div>;
}

// 2. 使用了 ref.current 作为依赖
function Component() {
  const ref = useRef(0);
  const [count, setCount] = useState(0);
  
  // ref.current 变化时，无法自动优化
  useEffect(() => {
    console.log(ref.current);
  }, [ref.current]);
  
  return <div>{count}</div>;
}

// 3. 手动添加了 memoization
function Component({ items }) {
  // 已经手动优化，Compiler 会跳过
  const filtered = useMemo(() => 
    items.filter(item => item.active),
    [items]
  );
  
  return <div>{filtered.length}</div>;
}
```

**最佳实践：**

```javascript
// ✅ 让 Compiler 自动优化
function Component({ items }) {
  const [filter, setFilter] = useState('');
  
  const filtered = items.filter(item => 
    item.name.includes(filter)
  );
  
  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      {filtered.map(item => (
        <Item key={item.id} item={item} />
      ))}
    </div>
  );
}

// ❌ 手动优化（Compiler 启用时不需要）
function Component({ items }) {
  const [filter, setFilter] = useState('');
  
  const filtered = useMemo(() =>
    items.filter(item => item.name.includes(filter)),
    [items, filter]
  );
  
  const handleChange = useCallback((e) => {
    setFilter(e.target.value);
  }, []);
  
  return (
    <div>
      <input value={filter} onChange={handleChange} />
      {filtered.map(item => (
        <Item key={item.id} item={item} />
      ))}
    </div>
  );
}
```

---

## 性能优化

### 21. 如何优化 React 应用的性能？

**答案：**

**1. 组件层面优化：**

```javascript
// 使用 React.memo 避免不必要的重渲染
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  return <div>{/* 复杂渲染逻辑 */}</div>;
});

// 自定义比较函数
const Component = React.memo(
  function Component({ user }) {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    return prevProps.user.id === nextProps.user.id;
  }
);
```

**2. 列表渲染优化：**

```javascript
// ✅ 使用稳定的 key
function List({ items }) {
  return (
    <ul>
      {items.map(item => (
        <Item key={item.id} item={item} />
      ))}
    </ul>
  );
}

// ❌ 避免使用 index 作为 key
function List({ items }) {
  return (
    <ul>
      {items.map((item, index) => (
        <Item key={index} item={item} />
      ))}
    </ul>
  );
}
```

**3. 状态优化：**

```javascript
// 拆分状态，避免不必要的重渲染
function Component() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('');

  // user 和 posts 变化时，filter 相关的 UI 也会重渲染
  // 解决方案：拆分成多个组件
}

// ✅ 拆分组件
function UserSection({ user }) {
  return <div>{user?.name}</div>;
}

function PostsSection({ posts, filter }) {
  const filteredPosts = posts.filter(post =>
    post.title.includes(filter)
  );
  
  return <div>{/* ... */}</div>;
}

function Component() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('');

  return (
    <div>
      <UserSection user={user} />
      <PostsSection posts={posts} filter={filter} />
    </div>
  );
}
```

**4. 使用虚拟列表：**

```javascript
import { FixedSizeList } from 'react-window';

function VirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={400}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

**5. 懒加载：**

```javascript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

**6. 防抖和节流：**

```javascript
import { useDebouncedCallback } from 'use-debounce';

function SearchInput() {
  const [query, setQuery] = useState('');
  
  const debouncedSearch = useDebouncedCallback(
    (value) => {
      search(value);
    },
    500
  );

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  return <input value={query} onChange={handleChange} />;
}
```

**7. 使用 React DevTools Profiler：**

```javascript
import { Profiler } from 'react';

function onRenderCallback(
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) {
  console.log(`${id} ${phase} took ${actualDuration}ms`);
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Component />
    </Profiler>
  );
}
```

**8. 优化 Context：**

```javascript
// 拆分 Context
const ThemeContext = createContext();
const AuthContext = createContext();

function App() {
  return (
    <ThemeContext.Provider value={theme}>
      <AuthContext.Provider value={auth}>
        <ChildComponents />
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}

// 选择性消费
function Child() {
  const theme = useContext(ThemeContext);
  return <div>{theme}</div>;
}
```

---

## 状态管理与架构

### 22. React 状态管理方案有哪些？如何选择？

**答案：**

**1. useState + Context：**
```javascript
// 适合小型应用
const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  return useContext(ThemeContext);
}
```

**2. Redux Toolkit：**
```javascript
// 适合大型应用，复杂状态逻辑
import { createSlice, configureStore } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
  },
});

const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
});

// 使用 React-Redux Hooks
import { useSelector, useDispatch } from 'react-redux';

function Counter() {
  const count = useSelector(state => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div>
      <span>{count}</span>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
    </div>
  );
}
```

**3. Zustand：**
```javascript
// 轻量级状态管理
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

function Counter() {
  const { count, increment, decrement } = useStore();
  
  return (
    <div>
      <span>{count}</span>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}
```

**4. Jotai：**
```javascript
// 原子化状态管理
import { atom, useAtom } from 'jotai';

const countAtom = atom(0);

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  
  return (
    <div>
      <span>{count}</span>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}-</button>
    </div>
  );
}
```

**5. Recoil：**
```javascript
// Facebook 开发的状态管理库
import { atom, useRecoilState } from 'recoil';

const countState = atom({
  key: 'countState',
  default: 0,
});

function Counter() {
  const [count, setCount] = useRecoilState(countState);
  
  return (
    <div>
      <span>{count}</span>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}-</button>
    </div>
  );
}
```

**选择指南：**

| 方案 | 适用场景 | 学习曲线 | 包大小 |
|------|---------|---------|--------|
| useState + Context | 小型应用，简单状态 | 低 | 小 |
| Redux Toolkit | 大型应用，复杂状态 | 中 | 中 |
| Zustand | 中小型应用，需要简单 API | 低 | 小 |
| Jotai | 需要细粒度状态控制 | 低 | 小 |
| Recoil | 需要派生状态和关系 | 中 | 中 |

**决策树：**

```
应用规模？
├─ 小型（< 10 个页面）
│  └─ useState + Context
├─ 中型（10-50 个页面）
│  ├─ 需要简单 API？
│  │  └─ Zustand
│  └─ 需要细粒度控制？
│     └─ Jotai
└─ 大型（> 50 个页面）
   └─ Redux Toolkit
```

---

### 23. React 组件设计模式有哪些？

**答案：**

**1. 容器组件与展示组件分离：**

```javascript
// 展示组件：只负责 UI 渲染
function UserList({ users, onUserClick }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id} onClick={() => onUserClick(user.id)}>
          {user.name}
        </li>
      ))}
    </ul>
  );
}

// 容器组件：负责数据获取和状态管理
function UserListContainer() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  const handleUserClick = (userId) => {
    navigate(`/users/${userId}`);
  };

  if (loading) return <Loading />;
  
  return <UserList users={users} onUserClick={handleUserClick} />;
}
```

**2. 高阶组件（HOC）：**

```javascript
// HOC：添加加载状态
function withLoading(WrappedComponent) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    return <WrappedComponent {...props} />;
  };
}

// 使用
const UserProfileWithLoading = withLoading(UserProfile);

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser().then(setUser).finally(() => setLoading(false));
  }, []);

  return (
    <UserProfileWithLoading 
      isLoading={loading} 
      user={user} 
    />
  );
}
```

**3. 渲染属性（Render Props）：**

```javascript
// 渲染属性组件
function Mouse({ children }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div onMouseMove={handleMouseMove}>
      {children(position)}
    </div>
  );
}

// 使用
function App() {
  return (
    <Mouse>
      {({ x, y }) => (
        <div>
          鼠标位置: {x}, {y}
        </div>
      )}
    </Mouse>
  );
}
```

**4. 自定义 Hook（推荐）：**

```javascript
// 自定义 Hook（替代 HOC 和 Render Props）
function useMouse() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return position;
}

// 使用
function App() {
  const { x, y } = useMouse();
  
  return (
    <div>
      鼠标位置: {x}, {y}
    </div>
  );
}
```

**5. 组合模式：**

```javascript
// 弹窗组件
function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

// 使用
function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>
        打开弹窗
      </button>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>标题</h2>
        <p>内容</p>
      </Modal>
    </div>
  );
}
```

**6. 受控组件与非受控组件：**

```javascript
// 受控组件
function ControlledInput() {
  const [value, setValue] = useState('');

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

// 非受控组件
function UncontrolledInput() {
  const inputRef = useRef(null);

  const handleSubmit = () => {
    console.log(inputRef.current.value);
  };

  return (
    <div>
      <input ref={inputRef} defaultValue="" />
      <button onClick={handleSubmit}>提交</button>
    </div>
  );
}
```

---

### 24. React Fiber 架构的深入原理是什么？

**答案：**

Fiber 是 React 16 引入的全新架构，用于解决同步渲染的性能问题。

**1. Fiber 的核心数据结构：**

```javascript
// Fiber 节点的核心属性
interface Fiber {
  // 组件标识
  tag: WorkTag;           // 组件类型（函数组件、类组件、DOM节点等）
  key: null | string;     // 用于列表渲染的 key
  elementType: any;       // 组件的构造函数或字符串标签
  type: any;             // 实际的组件类型
  
  // 树形结构（链表形式）
  return: Fiber | null;  // 父节点
  child: Fiber | null;   // 第一个子节点
  sibling: Fiber | null; // 下一个兄弟节点
  index: number;         // 在父节点的子节点中的索引
  
  // 状态相关
  pendingProps: any;     // 新的 props
  memoizedProps: any;    // 旧的 props
  memoizedState: any;    // 旧的 state
  
  // 副作用
  flags: Flags;          // 标记需要执行的副作用
  subtreeFlags: Flags;   // 子树中的副作用标记
  deletions: Array<Fiber> | null; // 需要删除的节点
  
  // 调度相关
  lanes: Lanes;          // 本节点的更新车道
  childLanes: Lanes;     // 子节点的更新车道
  
  // 双缓冲机制
  alternate: Fiber | null; // 当前树和 workInProgress 树之间的连接
}
```

**2. 双缓冲树结构：**

```javascript
// Fiber 维护两棵树
// current tree: 当前屏幕上显示的树
// workInProgress tree: 正在构建的树

function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate;
  
  if (workInProgress === null) {
    // 第一次渲染，创建新的 Fiber 节点
    workInProgress = createFiber(current.tag, pendingProps, current.key, current.elementType);
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    // 复用已有的 Fiber 节点
    workInProgress.pendingProps = pendingProps;
    workInProgress.type = current.type;
    workInProgress.flags = NoFlags;
    workInProgress.subtreeFlags = NoFlags;
    workInProgress.deletions = null;
  }
  
  workInProgress.child = null;
  workInProgress.sibling = null;
  workInProgress.index = 0;
  
  return workInProgress;
}
```

**3. 工作循环（Work Loop）：**

```javascript
// Fiber 的核心工作循环
function workLoopConcurrent() {
  // 执行工作，直到需要让出控制权
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(unitOfWork) {
  const current = unitOfWork.alternate;
  
  // 开始工作
  let next = beginWork(current, unitOfWork);
  
  // 更新工作进度
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  
  if (next === null) {
    // 没有子节点，完成当前节点的工作
    completeUnitOfWork(unitOfWork);
  } else {
    // 还有子节点，继续处理
    workInProgress = next;
  }
}

function completeUnitOfWork(unitOfWork) {
  let completedWork = unitOfWork;
  
  do {
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;
    
    // 完成当前节点的工作
    completeWork(current, completedWork);
    
    // 检查兄弟节点
    const siblingFiber = completedWork.sibling;
    if (siblingFiber !== null) {
      // 有兄弟节点，处理兄弟节点
      workInProgress = siblingFiber;
      return;
    }
    
    // 没有兄弟节点，返回父节点
    completedWork = returnFiber;
    workInProgress = completedWork;
  } while (completedWork !== null);
  
  // 到达根节点，工作完成
  if (workInProgress.rootExitStatus === RootCompleted) {
    // 准备提交
    completeRoot(root);
  }
}
```

**4. 优先级调度（Lanes 模型）：**

```javascript
// React 使用 Lanes（车道）模型来管理任务优先级
const SyncLane = 0b0000000000000000000000000000001;    // 同步任务
const InputContinuousLane = 0b0000000000000000000000000000100; // 用户交互
const DefaultLane = 0b0000000000000000000000000010000;   // 正常更新
const TransitionLane = 0b0000000000000000000000001000000; // 过渡更新

// 获取最高优先级
function getHighestPriorityLane(lanes) {
  return lanes & -lanes;
}

// 获取下一批 lanes
function getNextLanes(root, wipLanes) {
  const pendingLanes = root.pendingLanes;
  
  // 1. 如果有同步任务，优先执行
  if (pendingLanes & SyncLane) {
    return SyncLane;
  }
  
  // 2. 否则执行最高优先级的任务
  const nextLane = getHighestPriorityLane(pendingLanes);
  return nextLane;
}
```

**5. 时间切片（Time Slicing）：**

```javascript
// 时间切片的核心实现
function shouldYield() {
  // 检查是否还有剩余时间
  return getCurrentTime() >= deadline;
}

function renderRootConcurrent(root, lanes) {
  const startTime = getCurrentTime();
  
  do {
    try {
      workLoopConcurrent();
      break;
    } catch (thrownValue) {
      handleThrow(root, thrownValue);
    }
  } while (true);
  
  // 检查是否完成所有工作
  if (workInProgress !== null) {
    // 还有工作未完成，安排继续执行
    return RootIncomplete;
  } else {
    // 工作完成，准备提交
    return RootCompleted;
  }
}

// 调度器
function scheduleCallback(priorityLevel, callback) {
  // 根据优先级安排任务
  const currentTime = getCurrentTime();
  const startTime = currentTime;
  
  const timeout = timeoutForPriorityLevel(priorityLevel);
  const expirationTime = startTime + timeout;
  
  const newTask = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    sortIndex: -1,
  };
  
  // 添加到任务队列
  push(taskQueue, newTask);
  
  // 请求调度
  requestHostCallback(flushWork);
}
```

**6. 副作用收集与执行：**

```javascript
// 副作用标记
const Placement = 0b0000000000000000000000000000010;   // 插入
const Update = 0b0000000000000000000000000000100;      // 更新
const Deletion = 0b0000000000000000000000000001000;   // 删除
const Passive = 0b0000000000000000000000010000000;    // useEffect

function commitRoot(root) {
  const finishedWork = root.finishedWork;
  
  // 1. Before Mutation 阶段
  commitBeforeMutationEffects(finishedWork);
  
  // 2. Mutation 阶段（DOM 更新）
  commitMutationEffects(root, finishedWork);
  
  // 3. Layout 阶段（useLayoutEffect）
  commitLayoutEffects(finishedWork);
  
  // 4. Passive 阶段（useEffect）
  schedulePassiveEffects(finishedWork);
  
  // 切换 current 树和 workInProgress 树
  root.current = finishedWork;
}

function commitMutationEffects(root, finishedWork) {
  // 遍历 effect list，执行 DOM 操作
  while (nextEffect !== null) {
    const effectTag = nextEffect.effectTag;
    
    // 插入节点
    if (effectTag & Placement) {
      commitPlacement(nextEffect);
    }
    
    // 更新节点
    if (effectTag & Update) {
      commitWork(nextEffect);
    }
    
    // 删除节点
    if (effectTag & Deletion) {
      commitDeletion(nextEffect);
    }
    
    nextEffect = nextEffect.nextEffect;
  }
}
```

**7. 并发特性（Concurrent Features）：**

```javascript
// useTransition：标记非紧急更新
function useTransition() {
  const [isPending, startTransition] = useState(false);
  
  const startTransitionCallback = (callback) => {
    startTransition(() => {
      setIsPending(true);
      try {
        callback();
      } finally {
        setIsPending(false);
      }
    });
  };
  
  return [isPending, startTransitionCallback];
}

// useDeferredValue：延迟更新值
function useDeferredValue(value) {
  const [deferredValue, setDeferredValue] = useState(value);
  
  useEffect(() => {
    // 使用 transition 延迟更新
    startTransition(() => {
      setDeferredValue(value);
    });
  }, [value]);
  
  return deferredValue;
}

// Suspense：数据获取
function Suspense({ fallback, children }) {
  // 捕获子组件中的 Promise
  try {
    return children;
  } catch (promise) {
    if (typeof promise.then === 'function') {
      // 是一个 Promise，显示 fallback
      promise.then(() => {
        // Promise 完成后，重新渲染
        forceUpdate();
      });
      return fallback;
    }
    throw promise;
  }
}
```

**8. Fiber 的工作流程：**

```
1. 调度阶段（Scheduler）
   - 根据优先级安排任务
   - 使用时间切片避免阻塞

2. render 阶段（可中断）
   - 创建/更新 Fiber 节点
   - 构建 workInProgress 树
   - 收集副作用（Effect List）

3. commit 阶段（不可中断）
   - Before Mutation：执行 getSnapshotBeforeUpdate
   - Mutation：执行 DOM 操作
   - Layout：执行 useLayoutEffect
   - Passive：调度 useEffect
```

**9. Fiber 的性能优化策略：**

```javascript
// 1. 静态优化：编译时优化
// React Compiler 可以自动分析组件，添加 memoization

// 2. 运行时优化：优先级调度
// 高优先级任务（用户交互）优先执行

// 3. 内存优化：Fiber 节点复用
// 使用对象池复用 Fiber 节点，减少 GC 压力

// 4. 批量更新：自动批处理
// React 18+ 所有更新都会被批处理

// 5. 懒加载：代码分割
// 使用 React.lazy 和 Suspense 懒加载组件
```

**10. Fiber 的调试与监控：**

```javascript
// 使用 React DevTools Profiler
import { Profiler } from 'react';

function onRenderCallback(
  id,              // 组件 ID
  phase,           // "mount" 或 "update"
  actualDuration,  // 本次渲染耗时
  baseDuration,    // 不使用 memoization 的预计耗时
  startTime,       // 开始时间
  commitTime,      // 提交时间
  interactions     // 交互集合
) {
  console.log(`${id} ${phase} took ${actualDuration}ms`);
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Component />
    </Profiler>
  );
}

// 使用 React DevTools 查看 Fiber 树
// 1. 安装 React DevTools
// 2. 打开 Components 面板
// 3. 选中组件，查看 Fiber 节点信息
// 4. 查看 props、state、context、hooks 等信息
```

**Fiber 架构的核心优势：**

1. **可中断渲染**：长任务可以被拆分成小单元，避免阻塞主线程
2. **优先级调度**：高优先级任务优先执行，提升用户体验
3. **并发特性**：支持 useTransition、useDeferredValue 等并发特性
4. **更好的错误边界**：可以捕获和处理渲染过程中的错误
5. **时间切片**：在浏览器空闲时执行任务，避免卡顿

---

## 总结

以上涵盖了 React 面试中最常问的 24+ 个问题，包括：

1. **React 核心原理**（虚拟 DOM、Fiber、调和、事件系统、生命周期等）
2. **Hooks 相关**（Hooks 规则、useEffect、useLayoutEffect、自定义 Hook、useRef、useReducer 等）
3. **React 新特性**（React 18、React 19、Server Components、Suspense、React Compiler 等）
4. **性能优化**（React.memo、useMemo、useCallback、虚拟列表、懒加载等）
5. **状态管理与架构**（状态管理方案选择、组件设计模式等）

这些题目覆盖了 React 的底层原理、常用功能和新特性，能够全面考察候选人的 React 知识深度和广度。