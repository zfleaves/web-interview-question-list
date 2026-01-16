# Vue2 Diff 算法原理

## 核心概念

Vue2 的 Diff 算法采用 **同层比较** 策略，只比较同一层级的节点，时间复杂度为 O(n)。

**核心思想：**
1. 同层比较：只比较同一层级的 VNode
2. 双端比较：从新旧节点的两端同时开始比较
3. key 优化：通过 key 判断节点是否可复用
4. 就地复用：尽可能复用已有 DOM 节点

## 源码核心实现

### 1. patch 函数 - 入口

```javascript
function patch(oldVnode, vnode) {
  // 如果是旧节点是真实 DOM，说明是首次渲染
  if (isRealElement(oldVnode)) {
    const isRealElement = isDef(oldVnode.nodeType);
    if (!isRealElement && sameVnode(oldVnode, vnode)) {
      // patch existing root node
      patchVnode(oldVnode, vnode);
    } else {
      // replacing existing element
      const oldElm = oldVnode.elm;
      const parentElm = nodeOps.parentNode(oldElm);
      
      // create new node
      createElm(vnode, parentElm, nodeOps.nextSibling(oldElm));
      
      // destroy old node
      if (isDef(parentElm)) {
        removeVnodes(parentElm, [oldVnode], 0, 0);
      }
    }
  } else {
    // 如果是更新
    if (sameVnode(oldVnode, vnode)) {
      patchVnode(oldVnode, vnode);
    } else {
      // key 不同，直接替换
      const oldElm = oldVnode.elm;
      const parentElm = nodeOps.parentNode(oldElm);
      
      createElm(vnode, parentElm, nodeOps.nextSibling(oldElm));
      
      if (isDef(parentElm)) {
        removeVnodes(parentElm, [oldVnode], 0, 0);
      }
    }
  }
  
  return vnode.elm;
}

// 判断是否是同一个节点
function sameVnode(a, b) {
  return (
    a.key === b.key &&
    a.tag === b.tag &&
    a.isComment === b.isComment &&
    isDef(a.data) === isDef(b.data) &&
    sameInputType(a, b)
  );
}
```

### 2. patchVnode - 节点更新

```javascript
function patchVnode(oldVnode, vnode) {
  const elm = vnode.elm = oldVnode.elm;
  const oldCh = oldVnode.children;
  const ch = vnode.children;
  
  // 如果新旧节点完全相同，直接返回
  if (oldVnode === vnode) return;
  
  // 执行 prepatch hook
  if (isDef(oldVnode.data) && isDef(i = oldVnode.data.hook) && isDef(i = i.prepatch)) {
    i(oldVnode, vnode);
  }
  
  // 如果是静态节点，直接复用
  if (isTrue(vnode.isStatic) &&
      isTrue(oldVnode.isStatic) &&
      vnode.key === oldVnode.key &&
      (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))) {
    vnode.componentInstance = oldVnode.componentInstance;
    return;
  }
  
  // 更新属性
  updateAttrs(oldVnode, vnode);
  updateClass(oldVnode, vnode);
  updateDOMListeners(oldVnode, vnode);
  updateDOMProps(oldVnode, vnode);
  
  // 更新子节点
  if (isUndef(vnode.text)) {
    if (isDef(oldCh) && isDef(ch)) {
      // 新旧都有子节点，diff 子节点
      if (oldCh !== ch) updateChildren(elm, oldCh, ch);
    } else if (isDef(ch)) {
      // 新节点有子节点，旧节点没有
      if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '');
      addVnodes(elm, null, ch, 0, ch.length - 1);
    } else if (isDef(oldCh)) {
      // 旧节点有子节点，新节点没有
      removeVnodes(elm, oldCh, 0, oldCh.length - 1);
    } else if (isDef(oldVnode.text)) {
      // 新旧都没有子节点，清空文本
      nodeOps.setTextContent(elm, '');
    }
  } else if (oldVnode.text !== vnode.text) {
    // 更新文本节点
    nodeOps.setTextContent(elm, vnode.text);
  }
}
```

### 3. updateChildren - 双端 Diff 核心算法

```javascript
function updateChildren(parentElm, oldCh, newCh) {
  let oldStartIdx = 0;
  let newStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let newEndIdx = newCh.length - 1;
  let oldStartVnode = oldCh[0];
  let newStartVnode = newCh[0];
  let oldEndVnode = oldCh[oldEndIdx];
  let newEndVnode = newCh[newEndIdx];
  let oldKeyToIdx, idxInOld, vnodeToMove, refElm;
  
  // 只要有一端没越界就继续
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    // 旧节点已经处理完
    if (isUndef(oldStartVnode)) {
      oldStartVnode = oldCh[++oldStartIdx];
    }
    // 旧节点已经处理完
    else if (isUndef(oldEndVnode)) {
      oldEndVnode = oldCh[--oldEndIdx];
    }
    // 1. 新旧开始节点相同
    else if (sameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(oldStartVnode, newStartVnode);
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    }
    // 2. 新旧结束节点相同
    else if (sameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(oldEndVnode, newEndVnode);
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    }
    // 3. 旧开始节点和新结束节点相同（需要移动）
    else if (sameVnode(oldStartVnode, newEndVnode)) {
      patchVnode(oldStartVnode, newEndVnode);
      nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    }
    // 4. 旧结束节点和新开始节点相同（需要移动）
    else if (sameVnode(oldEndVnode, newStartVnode)) {
      patchVnode(oldEndVnode, newStartVnode);
      nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    }
    // 5. 以上都不匹配，通过 key 查找
    else {
      if (isUndef(oldKeyToIdx)) {
        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
      }
      idxInOld = isDef(newStartVnode.key)
        ? oldKeyToIdx[newStartVnode.key]
        : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
      
      // 没找到，创建新节点
      if (isUndef(idxInOld)) {
        createElm(newStartVnode, parentElm, oldStartVnode.elm);
      } else {
        // 找到了，复用节点
        vnodeToMove = oldCh[idxInOld];
        if (sameVnode(vnodeToMove, newStartVnode)) {
          patchVnode(vnodeToMove, newStartVnode);
          oldCh[idxInOld] = undefined; // 标记为已处理
          nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
        } else {
          // key 相同但节点不同，创建新节点
          createElm(newStartVnode, parentElm, oldStartVnode.elm);
        }
      }
      newStartVnode = newCh[++newStartIdx];
    }
  }
  
  // 处理剩余节点
  if (oldStartIdx > oldEndIdx) {
    // 旧节点处理完，添加新节点
    refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
    addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx);
  } else if (newStartIdx > newEndIdx) {
    // 新节点处理完，删除旧节点
    removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
  }
}

// 创建 key 到 index 的映射
function createKeyToOldIdx(children, beginIdx, endIdx) {
  let i, key;
  const map = {};
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (isDef(key)) map[key] = i;
  }
  return map;
}
```

## 简化版实现

```javascript
// 简化版 Diff 算法
function diff(oldChildren, newChildren) {
  const patches = [];
  let oldStart = 0;
  let newStart = 0;
  let oldEnd = oldChildren.length - 1;
  let newEnd = newChildren.length - 1;
  
  while (oldStart <= oldEnd && newStart <= newEnd) {
    const oldStartNode = oldChildren[oldStart];
    const newStartNode = newChildren[newStart];
    const oldEndNode = oldChildren[oldEnd];
    const newEndNode = newChildren[newEnd];
    
    // 情况1: 头头相同
    if (sameNode(oldStartNode, newStartNode)) {
      oldStart++;
      newStart++;
    }
    // 情况2: 尾尾相同
    else if (sameNode(oldEndNode, newEndNode)) {
      oldEnd--;
      newEnd--;
    }
    // 情况3: 头尾相同（需要移动）
    else if (sameNode(oldStartNode, newEndNode)) {
      patches.push({ type: 'MOVE', node: oldStartNode, to: newEnd });
      oldStart++;
      newEnd--;
    }
    // 情况4: 尾头相同（需要移动）
    else if (sameNode(oldEndNode, newStartNode)) {
      patches.push({ type: 'MOVE', node: oldEndNode, to: newStart });
      oldEnd--;
      newStart++;
    }
    // 情况5: 通过 key 查找
    else {
      const oldIndex = findIndexByKey(oldChildren, newStartNode.key, oldStart, oldEnd);
      if (oldIndex > -1) {
        patches.push({ type: 'MOVE', node: oldChildren[oldIndex], to: newStart });
        oldChildren[oldIndex] = null; // 标记为已处理
      } else {
        patches.push({ type: 'ADD', node: newStartNode, to: newStart });
      }
      newStart++;
    }
  }
  
  // 处理剩余节点
  if (oldStart <= oldEnd) {
    for (let i = oldStart; i <= oldEnd; i++) {
      if (oldChildren[i]) {
        patches.push({ type: 'REMOVE', node: oldChildren[i] });
      }
    }
  }
  
  if (newStart <= newEnd) {
    for (let i = newStart; i <= newEnd; i++) {
      patches.push({ type: 'ADD', node: newChildren[i], to: newEnd });
    }
  }
  
  return patches;
}

function sameNode(a, b) {
  return a.key === b.key && a.tag === b.tag;
}

function findIndexByKey(children, key, start, end) {
  for (let i = start; i <= end; i++) {
    if (children[i] && children[i].key === key) {
      return i;
    }
  }
  return -1;
}

// 使用示例
const oldChildren = [
  { key: 'A', tag: 'div' },
  { key: 'B', tag: 'div' },
  { key: 'C', tag: 'div' }
];

const newChildren = [
  { key: 'C', tag: 'div' },
  { key: 'A', tag: 'div' },
  { key: 'D', tag: 'div' }
];

const patches = diff(oldChildren, newChildren);
console.log(patches);
// 输出: [
//   { type: 'MOVE', node: { key: 'C' }, to: 0 },
//   { type: 'ADD', node: { key: 'D' }, to: 2 },
//   { type: 'REMOVE', node: { key: 'B' } }
// ]
```

## 使用场景

1. **列表渲染**：v-for 渲染列表时，Diff 算法最小化 DOM 操作
2. **动态组件**：组件切换时的复用和更新
3. **条件渲染**：v-if/v-show 的切换优化
4. **key 的使用**：通过 key 优化列表更新性能

## 面试要点

1. **为什么是 O(n) 复杂度**：
   - 只比较同层节点，不跨层级
   - 双端比较最多遍历一次
   - 通过 key 快速定位可复用节点

2. **key 的作用**：
   - 唯一标识节点，提高复用率
   - 避免不必要的销毁和创建
   - 正确处理列表的增删改

3. **为什么不采用 React 的最长递增子序列算法**：
   - Vue2 的双端比较已经足够高效
   - Vue3 采用了更优化的算法（最长递增子序列）

4. **Vue3 的改进**：
   - 使用最长递增子序列算法
   - 只移动需要移动的节点
   - 性能更好，特别是长列表

5. **注意事项**：
   - 不要使用 index 作为 key（列表有增删时会导致问题）
   - key 必须唯一且稳定
   - 避免在 v-for 中使用随机数或时间戳作为 key