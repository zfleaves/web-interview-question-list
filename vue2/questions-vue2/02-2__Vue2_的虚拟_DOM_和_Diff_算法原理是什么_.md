# 2. Vue2 的虚拟 DOM 和 Diff 算法原理是什么？

**答案：**

## 一、什么是 Real DOM 和 Virtual DOM？

**Real DOM（真实 DOM）：**

Real DOM，真实 DOM，意思为文档对象模型，是一个结构化文本的抽象，在页面渲染出的每一个结点都是一个真实 DOM 结构。

**Virtual DOM（虚拟 DOM）：**

Virtual DOM，本质上是以 JavaScript 对象形式存在的对 DOM 的描述。创建虚拟 DOM 目的就是为了更好将虚拟的节点渲染到页面视图中，虚拟 DOM 对象的节点与真实 DOM 的属性一一照应。

**虚拟 DOM 结构：**

```javascript
// 虚拟 DOM 结构
{
  tag: 'div',
  props: {
    id: 'app',
    class: 'container'
  },
  children: [
    {
      tag: 'p',
      props: {},
      children: ['Hello Vue']
    }
  ]
}
```

## 二、Real DOM 和 Virtual DOM 的区别

两者的区别如下：

- **虚拟 DOM 不会进行排版与重绘操作**，而真实 DOM 会频繁重排与重绘
- **虚拟 DOM 的总损耗**是"虚拟 DOM 增删改+真实 DOM 差异增删改+排版与重绘"，**真实 DOM 的总损耗**是"真实 DOM 完全增删改+排版与重绘"

**举例说明：**

传统的原生 api 或 jQuery 去操作 DOM 时，浏览器会从构建 DOM 树开始从头到尾执行一遍流程。

当你在一次操作时，需要更新 10 个 DOM 节点，浏览器没这么智能，收到第一个更新 DOM 请求后，并不知道后续还有 9 次更新操作，因此会马上执行流程，最终执行 10 次流程。

而通过 VNode，同样更新 10 个 DOM 节点，虚拟 DOM 不会立即操作 DOM，而是将这 10 次更新的 diff 内容保存到本地的一个 js 对象中，最终将这个 js 对象一次性 attach 到 DOM 树上，避免大量的无谓计算。

## 三、优缺点对比

**真实 DOM 的优势：**

- 易用

**真实 DOM 的缺点：**

- 效率低，解析速度慢，内存占用量过高
- 性能差：频繁操作真实 DOM，易于导致重绘与回流

**使用虚拟 DOM 的优势：**

- **简单方便**：如果使用手动操作真实 DOM 来完成页面，繁琐又容易出错，在大规模应用下维护起来也很困难
- **性能方面**：使用 Virtual DOM，能够有效避免真实 DOM 数频繁更新，减少多次引起重绘与回流，提高性能
- **跨平台**：React 借助虚拟 DOM，带来了跨平台的能力，一套代码多端运行

**虚拟 DOM 的缺点：**

- 在一些性能要求极高的应用中虚拟 DOM 无法进行针对性的极致优化
- 首次渲染大量 DOM 时，由于多了一层虚拟 DOM 的计算，速度比正常稍慢

## 四、Vue2 的虚拟 DOM 实现

**创建虚拟 DOM：**

```javascript
function h(tag, props, children) {
  return { tag, props, children };
}

// 使用
const vnode = h('div', { id: 'app' }, [
  h('p', {}, ['Hello'])
]);
```

**Diff 算法核心策略：**

```javascript
function patch(oldVnode, newVnode) {
  // 1. 同层比较
  if (!isSameNode(oldVnode, newVnode)) {
    // 节点类型不同，直接替换
    replaceNode(oldVnode, newVnode);
    return;
  }
  
  // 2. 更新属性
  updateProps(oldVnode, newVnode);
  
  // 3. 更新子节点
  updateChildren(oldVnode.children, newVnode.children);
}

function updateChildren(oldCh, newCh) {
  // 双端比较算法
  let oldStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let newStartIdx = 0;
  let newEndIdx = newCh.length - 1;
  
  let oldStartVnode = oldCh[oldStartIdx];
  let oldEndVnode = oldCh[oldEndIdx];
  let newStartVnode = newCh[newStartIdx];
  let newEndVnode = newCh[newEndIdx];
  
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    // 情况1：旧头 == 新头
    if (sameVnode(oldStartVnode, newStartVnode)) {
      patch(oldStartVnode, newStartVnode);
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    }
    // 情况2：旧尾 == 新尾
    else if (sameVnode(oldEndVnode, newEndVnode)) {
      patch(oldEndVnode, newEndVnode);
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    }
    // 情况3：旧头 == 新尾
    else if (sameVnode(oldStartVnode, newEndVnode)) {
      patch(oldStartVnode, newEndVnode);
      insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    }
    // 情况4：旧尾 == 新头
    else if (sameVnode(oldEndVnode, newStartVnode)) {
      patch(oldEndVnode, newStartVnode);
      insertBefore(oldEndVnode.el, oldStartVnode.el);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    }
    // 情况5：都不匹配，查找 key
    else {
      const keyMap = createKeyMap(oldCh, oldStartIdx, oldEndIdx);
      const idx = keyMap[newStartVnode.key];
      
      if (idx === undefined) {
        // 新节点，创建
        createEl(newStartVnode);
        insertBefore(newStartVnode.el, oldStartVnode.el);
      } else {
        const vnodeToMove = oldCh[idx];
        patch(vnodeToMove, newStartVnode);
        oldCh[idx] = undefined;
        insertBefore(vnodeToMove.el, oldStartVnode.el);
      }
      
      newStartVnode = newCh[++newStartIdx];
    }
  }
  
  // 处理剩余节点
  if (oldStartIdx > oldEndIdx) {
    // 添加新节点
    addVnodes(oldCh, newCh, newStartIdx, newEndIdx);
  } else if (newStartIdx > newEndIdx) {
    // 删除旧节点
    removeVnodes(oldCh, oldStartIdx, oldEndIdx);
  }
}
```

**key 的作用：**

```javascript
// ❌ 使用 index 作为 key
<li v-for="(item, index) in list" :key="index">
  {{ item.name }}
</li>
// 问题：列表插入、删除、排序时会导致状态错乱

// ✅ 使用唯一 ID
<li v-for="item in list" :key="item.id">
  {{ item.name }}
</li>
// 优势：通过 key 识别节点，提高 Diff 效率，保持组件状态
```
