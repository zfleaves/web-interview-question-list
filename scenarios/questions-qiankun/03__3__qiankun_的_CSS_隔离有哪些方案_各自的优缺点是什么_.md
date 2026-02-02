# 3. qiankun 的 CSS 隔离有哪些方案？各自的优缺点是什么？

**答案：**

qiankun 提供了三种 CSS 隔离方案：

### 1. 动态样式隔离（默认）

**实现原理**：
- 子应用挂载时，动态添加子应用的样式标签
- 子应用卸载时，自动移除其样式
- 确保单实例场景子应用之间的样式隔离

```javascript
// 配置
start({
  sandbox: true  // 默认值
});
```

**优点**：
- 实现简单，无需修改子应用代码
- 性能开销小

**缺点**：
- 无法确保主应用跟子应用之间的样式隔离
- 无法确保多实例场景子应用样式隔离

### 2. Shadow DOM 隔离（严格隔离）

**实现原理**：
- 为每个微应用的容器包裹上一个 Shadow DOM 节点
- Shadow DOM 提供了封闭的 DOM 树，样式和脚本与主 DOM 树隔离

```javascript
// 配置
start({
  sandbox: {
    strictStyleIsolation: true
  }
});
```

**优点**：
- 完全隔离子应用样式，不影响全局
- 浏览器原生支持

**缺点**：
- 某些 UI 库（如弹窗组件）可能无法在 Shadow DOM 内正常运行
- 越界的 DOM 操作（如动态添加到 document.body）无法被隔离
- 需要对子应用做一些适配

### 3. Scoped CSS（作用域隔离）

**实现原理**：
- 为所有样式规则添加唯一前缀选择器 `div[data-qiankun="xxx"]`
- 限制样式仅作用于当前子应用容器
- 动态改写 style 和 link 标签中的 CSS 规则

```css
/* 原始样式 */
.button { color: red; }

/* 改写后 */
div[data-qiankun="app1"] .button { color: red; }
```

```javascript
// 配置
start({
  sandbox: {
    experimentalStyleIsolation: true
  }
});
```

**优点**：
- 兼容性好，不需要浏览器支持 Shadow DOM
- 可以隔离大部分样式冲突

**缺点**：
- 实验性功能，可能存在兼容性问题
- 无法隔离动态添加的样式
- 需要动态解析和改写 CSS，有一定性能开销

**选择建议**：
- 单实例场景：动态样式隔离 + 工程化手段（CSS Modules、BEM）
- 多实例场景：Scoped CSS 或 Shadow DOM
- 需要严格隔离：Shadow DOM（需做好适配）

---