# 8. React 的 Context API 是如何工作的？有哪些使用场景？

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
