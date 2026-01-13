# 6. React 的 key 属性有什么作用？

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
