# 22. React 状态管理方案有哪些？如何选择？

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
