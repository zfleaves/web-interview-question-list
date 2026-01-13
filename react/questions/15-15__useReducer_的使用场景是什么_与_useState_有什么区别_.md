# 15. useReducer 的使用场景是什么？与 useState 有什么区别？

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
