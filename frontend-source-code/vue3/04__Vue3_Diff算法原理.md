# Vue3 Diff 算法原理

## 核心概念

Vue3 的 Diff 算法相比 Vue2 进行了重大优化，采用 **最长递增子序列（LIS）** 算法，最小化 DOM 移动操作。

**核心改进：**
1. 使用最长递增子序列算法
2. 只移动需要移动的节点
3. 更高效的节点复用
4. 更好的性能表现

## 源码核心实现

### 1. patch 函数 - 入口

```javascript
// patch 函数
function patch(n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, isSVG = false, slotScopeIds = null, optimized = isHmrUpdating) {
  // 如果新旧节点相同，直接返回
  if (n1 === n2) {
    return;
  }
  
  // 如果 n1 不存在，说明是挂载
  if (n1 == null) {
    mountElement(
      n2,
      container,
      anchor,
      parentComponent,
      parentSuspense,
      isSVG,
      slotScopeIds,
      optimized
    );
    return;
  }
  
  // 如果 n2 不存在，说明是卸载
  if (n2 == null) {
    unmount(n1, parentComponent, parentSuspense, true);
    return;
  }
  
  // 如果节点类型不同，直接替换
  if (n1.type !== n2.type) {
    anchor = getNextHostNode(n1);
    unmount(n1, parentComponent, parentSuspense, true);
    mountElement(
      n2,
      container,
      anchor,
      parentComponent,
      parentSuspense,
      isSVG,
      slotScopeIds,
      optimized
    );
    return;
  }
  
  // 如果是文本节点
  if (n2.type === Text) {
    if (n1.children !== n2.children) {
      hostSetElementText(container, n2.children);
    }
    return;
  }
  
  // 如果是注释节点
  if (n2.type === Comment) {
    return;
  }
  
  // 如果是静态节点，直接复用
  if (n1.isStatic && n2.isStatic) {
    return;
  }
  
  // 更新节点
  patchElement(n1, n2, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
}
```

### 2. patchElement - 元素更新

```javascript
// patchElement - 更新元素
function patchElement(n1, n2, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) {
  const el = (n2.el = n1.el);
  let { patchFlag, dynamicChildren, dirs } = n2;
  
  // 如果有 patchFlag，进行优化更新
  patchFlag |= n1.patchFlag & 16 /* PROPS */;
  
  // 如果有动态子节点，使用优化 diff
  if (patchFlag > 0) {
    if (patchFlag & 16 /* FULL_PROPS */) {
      patchProps(el, n2, oldProps, newProps, parentComponent);
    } else {
      // 优化更新
      if (patchFlag & 2 /* CLASS */) {
        if (oldProps.class !== newProps.class) {
          hostPatchProp(el, 'class', null, newProps.class, isSVG);
        }
      }
      if (patchFlag & 4 /* STYLE */) {
        hostPatchProp(el, 'style', oldProps.style, newProps.style, isSVG);
      }
      if (patchFlag & 8 /* PROPS */) {
        const propsToUpdate = n2.dynamicProps;
        for (let i = 0; i < propsToUpdate.length; i++) {
          const key = propsToUpdate[i];
          const prev = oldProps[key];
          const next = newProps[key];
          if (next !== prev) {
            hostPatchProp(el, key, prev, next, isSVG, n1.children);
          }
        }
      }
    }
    
    // 如果有文本
    if (patchFlag & 1 /* TEXT */) {
      if (n1.children !== n2.children) {
        hostSetElementText(el, n2.children);
      }
    }
  } else if (!optimized && dynamicChildren == null) {
    // 全量更新
    patchProps(el, n2, oldProps, newProps, parentComponent);
  }
  
  // 更新子节点
  if (patchFlag & 256 /* ARRAY_CHILDREN */) {
    patchChildren(
      n1,
      n2,
      el,
      null,
      parentComponent,
      parentSuspense,
      isSVG,
      slotScopeIds,
      optimized
    );
  } else if (dynamicChildren != null) {
    // 优化 diff：只更新动态子节点
    patchBlockChildren(n1.dynamicChildren, dynamicChildren, el, parentComponent, parentSuspense, isSVG, slotScopeIds);
  } else if (!optimized) {
    // 全量 diff
    patchChildren(
      n1,
      n2,
      el,
      null,
      parentComponent,
      parentSuspense,
      isSVG,
      slotScopeIds,
      optimized
    );
  }
}
```

### 3. patchChildren - 子节点更新

```javascript
// patchChildren - 更新子节点
function patchChildren(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) {
  const c1 = n1 && n1.children;
  const prevShapeFlag = n1 ? n1.shapeFlag : 0;
  const c2 = n2.children;
  const { patchFlag, shapeFlag } = n2;
  
  // 如果 n2 有文本子节点
  if (patchFlag & 8 /* TEXT_CHILDREN */) {
    if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
      unmountChildren(c1, parentComponent, parentSuspense);
    }
    if (c2 !== c1) {
      hostSetElementText(container, c2);
    }
    return;
  }
  
  // 如果 n2 有数组子节点
  if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
    if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
      // 新旧都是数组，执行 diff
      patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    } else {
      // 旧的是数组，新的是空
      unmountChildren(c1, parentComponent, parentSuspense, true);
    }
  } else {
    // 旧的不是数组
    if (prevShapeFlag & 8 /* TEXT_CHILDREN */) {
      hostSetElementText(container, '');
    }
    if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
      // 挂载新节点
      mountChildren(c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    }
  }
}
```

### 4. patchKeyedChildren - 核心 Diff 算法

```javascript
// patchKeyedChildren - 核心 Diff 算法
function patchKeyedChildren(c1, c2, container, parentAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) {
  let i = 0;
  const l2 = c2.length;
  let e1 = c1.length - 1;
  let e2 = l2 - 1;
  
  // 1. 从前往后同步
  while (i <= e1 && i <= e2) {
    const n1 = c1[i];
    const n2 = c2[i];
    if (isSameVNodeType(n1, n2)) {
      patch(n1, n2, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    } else {
      break;
    }
    i++;
  }
  
  // 2. 从后往前同步
  while (i <= e1 && i <= e2) {
    const n1 = c1[e1];
    const n2 = c2[e2];
    if (isSameVNodeType(n1, n2)) {
      patch(n1, n2, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    } else {
      break;
    }
    e1--;
    e2--;
  }
  
  // 3. 如果旧节点已处理完，新节点有剩余
  if (i > e1) {
    if (i <= e2) {
      const nextPos = e2 + 1;
      const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
      while (i <= e2) {
        patch(null, c2[i], container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        i++;
      }
    }
  }
  // 4. 如果新节点已处理完，旧节点有剩余
  else if (i > e2) {
    while (i <= e1) {
      unmount(c1[i], parentComponent, parentSuspense, true);
      i++;
    }
  }
  // 5. 处理未知序列
  else {
    const s1 = i;
    const s2 = i;
    
    // 5.1 建立 key 到 index 的映射
    const keyToNewIndexMap = new Map();
    for (i = s2; i <= e2; i++) {
      const nextChild = c2[i];
      keyToNewIndexMap.set(nextChild.key, i);
    }
    
    // 5.2 遍历旧节点，找到可以复用的节点
    let j;
    let patched = 0;
    const toBePatched = e2 - s2 + 1;
    let moved = false;
    let maxNewIndexSoFar = 0;
    const newIndexToOldIndexMap = new Array(toBePatched);
    
    // 初始化为 0
    for (i = 0; i < toBePatched; i++) {
      newIndexToOldIndexMap[i] = 0;
    }
    
    // 遍历旧节点
    for (i = s1; i <= e1; i++) {
      const prevChild = c1[i];
      
      // 如果已经处理完，直接卸载
      if (patched >= toBePatched) {
        unmount(prevChild, parentComponent, parentSuspense, true);
        continue;
      }
      
      // 查找新节点中是否有对应的 key
      let newIndex;
      if (prevChild.key != null) {
        newIndex = keyToNewIndexMap.get(prevChild.key);
      } else {
        // 没有key，遍历查找
        for (j = s2; j <= e2; j++) {
          if (newIndexToOldIndexMap[j - s2] === 0 &&
              isSameVNodeType(prevChild, c2[j])) {
            newIndex = j;
            break;
          }
        }
      }
      
      // 如果没找到，卸载旧节点
      if (newIndex === undefined) {
        unmount(prevChild, parentComponent, parentSuspense, true);
      } else {
        // 找到了，记录映射
        newIndexToOldIndexMap[newIndex - s2] = i + 1;
        
        // 判断是否需要移动
        if (newIndex >= maxNewIndexSoFar) {
          maxNewIndexSoFar = newIndex;
        } else {
          moved = true;
        }
        
        // patch 节点
        patch(prevChild, c2[newIndex], container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        patched++;
      }
    }
    
    // 5.3 生成最长递增子序列
    const increasingNewIndexSequence = moved
      ? getSequence(newIndexToOldIndexMap)
      : EMPTY_ARR;
    
    // 5.4 移动和挂载节点
    j = increasingNewIndexSequence.length - 1;
    for (i = toBePatched - 1; i >= 0; i--) {
      const nextIndex = s2 + i;
      const nextChild = c2[nextIndex];
      const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor;
      
      // 如果是新增节点
      if (newIndexToOldIndexMap[i] === 0) {
        patch(null, nextChild, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
      } else if (moved) {
        // 如果需要移动
        if (j < 0 || i !== increasingNewIndexSequence[j]) {
          move(nextChild, container, anchor, 2 /* REORDER */);
        } else {
          j--;
        }
      }
    }
  }
}

// isSameVNodeType - 判断是否是相同类型的节点
function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
```

### 5. getSequence - 最长递增子序列算法

```javascript
// getSequence - 最长递增子序列算法
function getSequence(arr) {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  
  return result;
}
```

## 简化版实现

```javascript
// 简化版 Diff 算法
function diff(oldChildren, newChildren) {
  const patches = [];
  let i = 0;
  let e1 = oldChildren.length - 1;
  let e2 = newChildren.length - 1;
  
  // 1. 从前往后同步
  while (i <= e1 && i <= e2) {
    if (sameNode(oldChildren[i], newChildren[i])) {
      patches.push({ type: 'PATCH', oldNode: oldChildren[i], newNode: newChildren[i] });
      i++;
    } else {
      break;
    }
  }
  
  // 2. 从后往前同步
  while (i <= e1 && i <= e2) {
    if (sameNode(oldChildren[e1], newChildren[e2])) {
      patches.push({ type: 'PATCH', oldNode: oldChildren[e1], newNode: newChildren[e2] });
      e1--;
      e2--;
    } else {
      break;
    }
  }
  
  // 3. 旧节点已处理完，新节点有剩余
  if (i > e1) {
    for (let j = i; j <= e2; j++) {
      patches.push({ type: 'ADD', node: newChildren[j], index: j });
    }
  }
  // 4. 新节点已处理完，旧节点有剩余
  else if (i > e2) {
    for (let j = i; j <= e1; j++) {
      patches.push({ type: 'REMOVE', node: oldChildren[j] });
    }
  }
  // 5. 处理未知序列
  else {
    const keyToNewIndexMap = new Map();
    for (let j = i; j <= e2; j++) {
      keyToNewIndexMap.set(newChildren[j].key, j);
    }
    
    const newIndexToOldIndexMap = new Array(e2 - i + 1).fill(0);
    let moved = false;
    let maxNewIndexSoFar = 0;
    
    for (let j = i; j <= e1; j++) {
      const oldNode = oldChildren[j];
      const newIndex = keyToNewIndexMap.get(oldNode.key);
      
      if (newIndex === undefined) {
        patches.push({ type: 'REMOVE', node: oldNode });
      } else {
        newIndexToOldIndexMap[newIndex - i] = j + 1;
        if (newIndex >= maxNewIndexSoFar) {
          maxNewIndexSoFar = newIndex;
        } else {
          moved = true;
        }
      }
    }
    
    // 生成最长递增子序列
    const increasingSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
    
    // 移动和挂载节点
    let k = increasingSequence.length - 1;
    for (let j = newIndexToOldIndexMap.length - 1; j >= 0; j--) {
      const newIndex = i + j;
      const newNode = newChildren[newIndex];
      
      if (newIndexToOldIndexMap[j] === 0) {
        patches.push({ type: 'ADD', node: newNode, index: newIndex });
      } else if (moved) {
        if (k < 0 || j !== increasingSequence[k]) {
          patches.push({ type: 'MOVE', node: newNode, index: newIndex });
        } else {
          k--;
        }
      }
    }
  }
  
  return patches;
}

function sameNode(a, b) {
  return a.key === b.key && a.type === b.type;
}

// 简化版最长递增子序列
function getSequence(arr) {
  const result = [0];
  const p = new Array(arr.length);
  
  for (let i = 1; i < arr.length; i++) {
    const val = arr[i];
    if (val === 0) continue;
    
    const last = arr[result[result.length - 1]];
    if (val > last) {
      p[i] = result[result.length - 1];
      result.push(i);
      continue;
    }
    
    let left = 0;
    let right = result.length - 1;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (arr[result[mid]] < val) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    
    if (val < arr[result[left]]) {
      if (left > 0) {
        p[i] = result[left - 1];
      }
      result[left] = i;
    }
  }
  
  const len = result.length;
  let last = result[len - 1];
  for (let i = len - 1; i >= 0; i--) {
    result[i] = last;
    last = p[last];
  }
  
  return result;
}

// 使用示例
const oldChildren = [
  { key: 'A', type: 'div' },
  { key: 'B', type: 'div' },
  { key: 'C', type: 'div' },
  { key: 'D', type: 'div' }
];

const newChildren = [
  { key: 'D', type: 'div' },
  { key: 'A', type: 'div' },
  { key: 'C', type: 'div' },
  { key: 'E', type: 'div' }
];

const patches = diff(oldChildren, newChildren);
console.log(patches);
```

## 使用场景

1. **列表渲染**：v-for 渲染列表时的更新优化
2. **动态组件**：组件切换时的复用
3. **虚拟滚动**：长列表的性能优化
4. **动画过渡**：配合 transition 使用

## 面试要点

1. **Vue3 Diff 算法的改进**：
   - 使用最长递增子序列算法
   - 只移动需要移动的节点
   - 更高效的节点复用
   - 更好的性能表现

2. **最长递增子序列的作用**：
   - 找出不需要移动的节点
   - 只移动不在序列中的节点
   - 最小化 DOM 操作

3. **Vue2 vs Vue3 Diff 算法**：
   - Vue2：双端比较
   - Vue3：最长递增子序列
   - Vue3 更高效，特别是长列表

4. **patchFlag 的作用**：
   - 标记节点变化类型
   - 优化更新策略
   - 避免全量更新

5. **动态子节点的优化**：
   - 只更新动态子节点
   - 静态节点直接复用
   - 提高更新性能

6. **key 的重要性**：
   - 唯一标识节点
   - 提高复用率
   - 必须唯一且稳定

7. **注意事项**：
   - 不要使用 index 作为 key
   - key 必须唯一且稳定
   - 避免在 v-for 中使用随机数

---

## 参考资料

- [Vue3 源码](https://github.com/vuejs/core/tree/main/packages)
- [本项目 GitHub 仓库](https://github.com/zfleaves/web-interview-question-list)
   - 合理使用 key
   - 避免不必要的节点移动
   - 使用虚拟滚动处理长列表
   - 静态节点使用 v-once