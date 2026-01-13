# 23. React 组件设计模式有哪些？

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
